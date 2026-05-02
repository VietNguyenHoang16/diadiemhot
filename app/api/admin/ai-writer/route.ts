import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { cookies } from 'next/headers';
import {
  buildPrompt,
  parseAIResponse,
  sanitizeHtml,
  validateInputs,
  checkRateLimit,
  sanitizeInput,
  extractImageMarkers,
  calculateSeoScore,
  replaceAllImageMarkers
} from '@/app/lib/ai-prompts';
import { normalizeLegacyFigurePlaceholders } from '@/app/lib/image-placeholders';
import { RANKING_CATEGORY } from '@/app/lib/ranking-posts';

// ============================================================
// AI WRITER API - MODULAR PROMPT SYSTEM
// ============================================================
// Features:
// - Modular prompt builder (base + templates + SEO + images)
// - Input validation (XSS, prompt injection protection)
// - Rate limiting (5 req/min, 20 req/hour)
// - Image marker system for easy image management
// - SEO scoring and structured data generation
// ============================================================

// AI settings now come from DB (systemSetting) or request body only

// Rate limiting store (use Redis in production)
const rateLimitStore = new Map<string, number[]>();

// ============================================================
// AUTH & RATE LIMITING
// ============================================================

async function checkAuth() {
  const session = (await cookies()).get('admin_session');
  return session?.value === 'authenticated';
}

function checkRateLimitInternal(identifier: string): { allowed: boolean; remaining: number; resetTime?: number } {
  const now = Date.now();
  const timestamps = rateLimitStore.get(identifier) || [];

  // Clean old timestamps (older than 1 hour)
  const validTimestamps = timestamps.filter(ts => now - ts < 60 * 60 * 1000);

  // Check per-minute limit
  const recentTimestamps = validTimestamps.filter(ts => now - ts < 60 * 1000);
  if (recentTimestamps.length >= 5) {
    const oldestRecent = recentTimestamps[0];
    return {
      allowed: false,
      remaining: 0,
      resetTime: oldestRecent + 60 * 1000
    };
  }

  // Check per-hour limit
  if (validTimestamps.length >= 20) {
    const oldestInHour = validTimestamps[0];
    return {
      allowed: false,
      remaining: 0,
      resetTime: oldestInHour + 60 * 60 * 1000
    };
  }

  // Record this request
  validTimestamps.push(now);
  rateLimitStore.set(identifier, validTimestamps);

  return {
    allowed: true,
    remaining: 5 - recentTimestamps.length - 1
  };
}

// Auto-detect template and tone from topic
function detectTemplateAndTone(
  topic: string,
  providedTemplate?: string,
  providedTone?: string
): { templateType: string; tone: 'expert' | 'casual' | 'viral' | 'story' } {
  const lowerTopic = topic.toLowerCase();

  // Default values
  let templateType = providedTemplate || 'review';
  let tone: 'expert' | 'casual' | 'viral' | 'story' = (providedTone as any) || 'expert';

  // Only auto-detect if not explicitly provided
  if (!providedTemplate) {
    // Detect quảng cáo / PR keywords first
    if (/\b(quảng\s*cáo|pr\b|đối\s*tác|nổi\s*bật|đề\s*xuất|giới\s*thiệu|quảng\s*bá|advertise|sponsor|tài\s*trợ)\b/i.test(lowerTopic)) {
      templateType = 'promotion';
    } else if (/\b(top\s*\d+|danh\s*sách|xếp\s*hạng|ranking|hay\s*nhất|tốt\s*nhất|đứng\s*đầu)\b/i.test(lowerTopic)) {
      templateType = 'ranking';
    } else if (/\b(hướng\s*dẫn|cẩm\s*nang|đi\s*đâu|lịch\s*trình|du\s*lịch|khám\s*phá|review\s*\d+\s*ngày)\b/i.test(lowerTopic)) {
      templateType = 'travel-guide';
    } else if (/\b(chuyện|kể\s*chuyện|câu\s*chuyện|story|lịch\s*sử|nghề\s*truyền|bí\s*mật\s*của)\b/i.test(lowerTopic)) {
      templateType = 'culture-story';
    } else if (/\b(check\s*in|chụp\s*ảnh|góc\s*chụp|sống\s*ảo|tính\s*năng|trending|hot)\b/i.test(lowerTopic)) {
      templateType = 'check-in';
    } else {
      templateType = 'review';
    }
  }

  if (!providedTone) {
    // Detect tone from topic
    if (/\b(top\s*\d+|danh\s*sách|xếp\s*hạng|bí\s*mật|thật\s*về|đừng\s*(đến|ước|sai|làm)|cảnh\s*báo)\b/i.test(lowerTopic)) {
      tone = 'viral';
    } else if (/\b(chuyện|kể\s*chuyện|câu\s*chuyện|story|cảm\s*nhận|feeling)\b/i.test(lowerTopic)) {
      tone = 'story';
    } else if (/\b(ngon|đáng\s*thử|nên\s*đi|trải\s*nghiệm|đánh\s*giá)\b/i.test(lowerTopic)) {
      tone = 'expert';
    } else {
      tone = 'casual';
    }
  }

  return { templateType, tone };
}

// ============================================================
// POST /api/admin/ai-writer
// ============================================================

export async function POST(request: Request) {
  try {
    // 1. AUTH CHECK
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'AUTH_FAILED' },
        { status: 401 }
      );
    }

    // 2. RATE LIMITING
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimit = checkRateLimitInternal(clientIp);

    if (!rateLimit.allowed) {
      const resetIn = Math.ceil((rateLimit.resetTime! - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: `Rate limit exceeded. Thử lại sau ${resetIn} giây.`,
          code: 'RATE_LIMITED',
          resetIn
        },
        { status: 429 }
      );
    }

    // 3. PARSE REQUEST
    const body = await request.json();
    const {
      topic,
      templateType: providedTemplate,
      province = '',
      tone: providedTone,
      targetKeywords = [],
      notes = '',
      includeFaq = true,
      includeStructuredData = true,
      apiUrl,
      apiModel,
      apiKey,
      promotionMode,
      businessName = '',
      businessInfo = ''
    } = body;

    // Auto-detect templateType and tone from topic
    const { templateType, tone } = detectTemplateAndTone(topic, providedTemplate, providedTone);

    // 4. INPUT VALIDATION
    const validation = validateInputs({
      topic,
      notes,
      templateType
    });

    if (!validation.valid) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: validation.errors
        },
        { status: 400 }
      );
    }

    if (validation.warnings.length > 0) {
      console.warn('AI Writer warnings:', validation.warnings);
    }

    // 5. SANITIZE INPUTS
    const sanitizedTopic = sanitizeInput(topic);
    const sanitizedNotes = sanitizeInput(notes);
    const sanitizedKeywords = targetKeywords
      .filter((k: string) => typeof k === 'string' && k.length <= 50)
      .slice(0, 10)
      .map((k: string) => sanitizeInput(k));
    const sanitizedBusinessName = businessName ? sanitizeInput(businessName) : '';
    const sanitizedBusinessInfo = businessInfo ? sanitizeInput(businessInfo) : '';

    // 6. FETCH CATEGORIES FROM DB
    const allCategories = await prisma.category.findMany({
      select: { name: true },
      orderBy: { order: 'asc' }
    });
    const categoryNames = allCategories.map(c => c.name);

    // 7. BUILD MODULAR PROMPT
    const promptConfig = {
      topic: sanitizedTopic,
      templateType,
      province: sanitizeInput(province),
      tone,
      targetKeywords: sanitizedKeywords,
      notes: sanitizedNotes,
      includeFaq,
      includeStructuredData,
      categories: categoryNames,
      promotionMode: promotionMode as 'dedicated' | 'top1-ranking' | undefined,
      businessName: sanitizedBusinessName,
      businessInfo: sanitizedBusinessInfo
    };

    const systemPrompt = buildPrompt(promptConfig);

    console.log('[AI Writer] Prompt built, length:', systemPrompt.length);

    // 8. CALL AI API - PRIORITY: Body (from frontend) -> Env -> Database -> Defaults
    // Fetch DB settings first
    const dbSettings = await prisma.systemSetting.findMany();
    const settingsMap = dbSettings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    const finalUrl = apiUrl || settingsMap.ai_url;
    const finalModel = apiModel || settingsMap.ai_model;
    const finalKey = apiKey || settingsMap.ai_key;

    if (!finalKey) {
      return NextResponse.json(
        { error: 'API Key not configured', code: 'NO_API_KEY' },
        { status: 400 }
      );
    }

    const isGemini = finalUrl.includes('generativelanguage.googleapis.com');
    let aiResponse;

    try {
      const fetchOptions: RequestInit = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      };

      if (isGemini) {
        // Gemini API format
        (fetchOptions.headers as Record<string, string>)['X-goog-api-key'] = finalKey;

        // Improve Gemini with system instructions and JSON mode
        const geminiBody: any = {
          contents: [{ role: 'user', parts: [{ text: `Chủ đề: ${sanitizedTopic}. Hãy viết bài dựa trên các yêu cầu đã cung cấp.` }] }],
          system_instruction: { parts: [{ text: systemPrompt }] },
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
            responseMimeType: "application/json"
          },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
          ]
        };

        fetchOptions.body = JSON.stringify(geminiBody);
      } else {
        // OpenAI/Grok compatible format
        (fetchOptions.headers as Record<string, string>)['Authorization'] = `Bearer ${finalKey}`;
        fetchOptions.body = JSON.stringify({
          model: finalModel,
          messages: [{ role: 'user', content: systemPrompt }],
          temperature: 0.7,
          max_tokens: 16000
        });
      }

      const aiRes = await fetch(finalUrl, fetchOptions);

      if (!aiRes.ok) {
        const errorText = await aiRes.text();
        console.error('[AI Writer] API Error:', aiRes.status, errorText);
        return NextResponse.json(
          {
            error: `AI API error (${aiRes.status})`,
            code: 'AI_API_ERROR',
            details: errorText.slice(0, 200)
          },
          { status: 502 }
        );
      }

      const data = await aiRes.json();

      if (isGemini) {
        aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      } else {
        aiResponse = data.choices?.[0]?.message?.content || '';
      }

    } catch (error) {
      console.error('[AI Writer] API Call failed:', error);
      return NextResponse.json(
        { error: 'Failed to call AI API', code: 'AI_CALL_FAILED' },
        { status: 502 }
      );
    }

    // 9. PARSE AI RESPONSE
    if (!aiResponse) {
      return NextResponse.json(
        { error: 'Empty AI response', code: 'EMPTY_RESPONSE' },
        { status: 502 }
      );
    }

    const parsed = parseAIResponse(aiResponse);

    if (!parsed) {
      console.error('[AI Writer] Parse failed. Raw response:', aiResponse);
      return NextResponse.json(
        {
          error: 'Failed to parse AI response - Response was not in expected JSON format',
          code: 'PARSE_ERROR',
          rawPreview: aiResponse.slice(0, 1000) // First 1000 chars for debugging
        },
        { status: 422 }
      );
    }

    // 10. SANITIZE CONTENT
    const sanitizedContent = sanitizeHtml(parsed.content);

    // 11. REPLACE IMAGE MARKERS WITH ACTUAL IMAGES
    const contentWithImages = normalizeLegacyFigurePlaceholders(replaceAllImageMarkers(sanitizedContent));
    const plainTextContent = contentWithImages
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!parsed.title?.trim() || !plainTextContent) {
      console.error('[AI Writer] Parsed response missing required fields:', {
        hasTitle: Boolean(parsed.title?.trim()),
        contentLength: plainTextContent.length
      });
      return NextResponse.json(
        {
          error: 'AI response thiếu tiêu đề hoặc nội dung bài viết hoàn chỉnh',
          code: 'INCOMPLETE_ARTICLE',
          details: ['AI trả về dữ liệu chưa hoàn chỉnh. Vui lòng thử lại hoặc rút gọn chủ đề.'],
          rawPreview: aiResponse.slice(0, 1000)
        },
        { status: 422 }
      );
    }

    // 12. EXTRACT IMAGE MARKERS (for reference)
    const imageMarkers = extractImageMarkers(sanitizedContent);

    // 13. CALCULATE SEO SCORE
    const seoScore = calculateSeoScore({
      title: parsed.title,
      excerpt: parsed.excerpt,
      content: contentWithImages,
      targetKeywords: parsed.targetKeywords
    });

    // 14. RETURN RESPONSE
    const category = templateType === 'ranking' ? RANKING_CATEGORY : parsed.category;

    const response = {
      title: parsed.title,
      excerpt: parsed.excerpt,
      content: contentWithImages,
      category,
      tags: parsed.tags,
      targetKeywords: parsed.targetKeywords,
      metaTitle: parsed.metaTitle || parsed.title,
      metaDescription: parsed.metaDescription || parsed.excerpt,
      imageMarkers: imageMarkers.length > 0 ? imageMarkers : undefined,
      seoScore,
      rateLimit: {
        remaining: rateLimit.remaining,
        resetIn: 60 // seconds
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('[AI Writer] Unhandled error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}

// 15. GET /api/admin/ai-writer (for templates info)

export async function GET() {
  try {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return available templates and configuration
    const { templateConfigs } = await import('@/app/lib/ai-prompts');

    return NextResponse.json({
      templates: Object.values(templateConfigs),
      tones: [
        { id: 'expert', name: 'Chuyên Gia', description: 'Phân tích chuyên sâu, EEAT cao' },
        { id: 'casual', name: 'Thân Mật', description: 'Gần gũi như kể chuyện với bạn' },
        { id: 'viral', name: 'Viral', description: 'Hút click, giật gân' },
        { id: 'story', name: 'Kể Chuyện', description: 'Storytelling sâu sắc' }
      ],
      features: {
        imageMarkers: true,
        seoScoring: true,
        rateLimiting: true
      }
    });

  } catch (error) {
    console.error('[AI Writer] GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
