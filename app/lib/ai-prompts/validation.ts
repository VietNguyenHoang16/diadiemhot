import { ValidationRule } from './types';

export const validationRules: ValidationRule[] = [
  {
    name: 'topic-length',
    test: (s) => s.length >= 5 && s.length <= 200,
    error: 'Chủ đề phải từ 5-200 ký tự',
    severity: 'error'
  },
  {
    name: 'no-script-tags',
    test: (s) => !/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(s),
    error: 'Phát hiện thẻ script trong input',
    severity: 'error'
  },
  {
    name: 'no-javascript-protocol',
    test: (s) => !/javascript:/i.test(s),
    error: 'Phát hiện JavaScript protocol',
    severity: 'error'
  },
  {
    name: 'no-event-handlers',
    test: (s) => !/\son\w+\s*=/i.test(s),
    error: 'Phát hiện event handler trong input',
    severity: 'error'
  },
  {
    name: 'no-prompt-injection',
    test: (s) => {
      const lower = s.toLowerCase();
      const injectionPatterns = [
        'system prompt',
        'ignore previous',
        'ignore all',
        'forget instructions',
        'disregard',
        'you are now',
        'new instructions',
        'override',
        'bypass',
        'hack',
        'exploit',
        'payload'
      ];
      return !injectionPatterns.some(p => lower.includes(p));
    },
    error: 'Phát hiện prompt injection attempt',
    severity: 'error'
  },
  {
    name: 'no-harmful-content',
    test: (s) => {
      const harmfulPatterns = [
        /\b(kill|murder|attack|bomb|terrorist)\b/i,
        /\b(exploit|hack|breach|steal)\b/i,
        /\b(illegal|fraud|scam)\b/i
      ];
      return !harmfulPatterns.some(p => p.test(s));
    },
    error: 'Nội dung có từ ngữ không phù hợp',
    severity: 'error'
  },
  {
    name: 'no-excessive-capitals',
    test: (s) => {
      const capsRatio = (s.match(/[A-Z]/g) || []).length / s.length;
      return capsRatio < 0.5 || s.length < 20;
    },
    error: 'Không viết hoa quá nhiều',
    severity: 'warning'
  },
  {
    name: 'no-repeated-chars',
    test: (s) => !/(.)(\1{4,})/.test(s),
    error: 'Phát hiện ký tự lặp lại bất thường',
    severity: 'warning'
  },
  {
    name: 'no-url-spam',
    test: (s) => {
      const urlCount = (s.match(/https?:\/\//gi) || []).length;
      return urlCount <= 3;
    },
    error: 'Quá nhiều URL trong input',
    severity: 'warning'
  },
  {
    name: 'no-spam-words',
    test: (s) => {
      const spamPatterns = [
        /\b(buy now|click here|limited time|act now)\b/gi,
        /\b(viagra|casino|lottery)\b/gi,
        /\$\d+\s*(million|billion)/gi
      ];
      return !spamPatterns.some(p => p.test(s));
    },
    error: 'Phát hiện nội dung spam/quảng cáo',
    severity: 'warning'
  }
];

// Rate limiting configuration
export const rateLimitConfig = {
  requestsPerMinute: 5,
  requestsPerHour: 20,
  windowMs: 60 * 1000, // 1 minute
  maxWindowMs: 60 * 60 * 1000 // 1 hour
};

// In-memory rate limiting store (should be Redis in production)
const rateLimitStore = new Map<string, { timestamps: number[] }>();

export function checkRateLimit(identifier: string): { allowed: boolean; remaining: number; resetTime?: number } {
  const now = Date.now();
  const userData = rateLimitStore.get(identifier) || { timestamps: [] };

  // Clean old timestamps
  userData.timestamps = userData.timestamps.filter(
    ts => now - ts < rateLimitConfig.maxWindowMs
  );

  // Check minute limit
  const recentRequests = userData.timestamps.filter(
    ts => now - ts < rateLimitConfig.windowMs
  );

  if (recentRequests.length >= rateLimitConfig.requestsPerMinute) {
    const oldestRecent = recentRequests[0];
    return {
      allowed: false,
      remaining: 0,
      resetTime: oldestRecent + rateLimitConfig.windowMs
    };
  }

  // Check hour limit
  if (userData.timestamps.length >= rateLimitConfig.requestsPerHour) {
    const oldestInHour = userData.timestamps[0];
    return {
      allowed: false,
      remaining: 0,
      resetTime: oldestInHour + rateLimitConfig.maxWindowMs
    };
  }

  // Add current request
  userData.timestamps.push(now);
  rateLimitStore.set(identifier, userData);

  return {
    allowed: true,
    remaining: rateLimitConfig.requestsPerMinute - recentRequests.length - 1
  };
}

// Sanitize user input
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/["']/g, '"') // Normalize quotes
    .replace(/[\n\r]+/g, ' ') // Normalize whitespace
    .trim();
}

// Validate all inputs
export function validateInputs(data: {
  topic?: string;
  notes?: string;
  templateType?: string;
}): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate topic
  if (!data.topic?.trim()) {
    errors.push('Chủ đề bài viết là bắt buộc');
  } else {
    const topicSanitized = sanitizeInput(data.topic);
    // Length check
    if (topicSanitized.length < 5) {
      errors.push('Chủ đề quá ngắn (tối thiểu 5 ký tự)');
    } else if (topicSanitized.length > 200) {
      errors.push('Chủ đề quá dài (tối đa 200 ký tự)');
    }
  }

  // Skip notes validation - user notes are always valid input

  // Validate template type
  const allowedTemplates = ['review', 'ranking', 'travel-guide', 'culture-story', 'check-in', 'promotion'];
  if (data.templateType && !allowedTemplates.includes(data.templateType)) {
    errors.push(`Loại bài viết không hợp lệ. Chỉ cho phép: ${allowedTemplates.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}
