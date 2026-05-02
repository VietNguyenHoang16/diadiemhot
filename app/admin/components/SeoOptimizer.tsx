'use client';

import { useState, useEffect } from 'react';
import { Check, AlertTriangle, X, Sparkles, TrendingUp, FileText, Image, Heading, Hash, HelpCircle } from 'lucide-react';
import { SeoScore } from '@/app/lib/ai-prompts';

interface SeoOptimizerProps {
  title: string;
  excerpt: string;
  content: string;
  targetKeywords?: string[];
  initialScore?: SeoScore;
}

interface SeoFactor {
  key: keyof SeoScore['factors'];
  label: string;
  icon: React.ReactNode;
  description: string;
}

const seoFactors: SeoFactor[] = [
  {
    key: 'keywordInTitle',
    label: 'Từ khóa trong Title',
    icon: <FileText className="h-4 w-4" />,
    description: 'Từ khóa chính xuất hiện trong tiêu đề'
  },
  {
    key: 'keywordInFirst100Words',
    label: 'Từ khóa đầu bài',
    icon: <Hash className="h-4 w-4" />,
    description: 'Từ khóa trong 100 từ đầu tiên'
  },
  {
    key: 'headingStructure',
    label: 'Cấu trúc Heading',
    icon: <Heading className="h-4 w-4" />,
    description: 'Có đủ H2, H3 phân cấp hợp lý'
  },
  {
    key: 'imagesWithAlt',
    label: 'Alt Text Ảnh',
    icon: <Image className="h-4 w-4" />,
    description: 'Tất cả ảnh đều có alt text'
  },
  {
    key: 'metaDescription',
    label: 'Meta Description',
    icon: <FileText className="h-4 w-4" />,
    description: 'Độ dài 150-160 ký tự'
  },
  {
    key: 'faqSchema',
    label: 'FAQ Section',
    icon: <HelpCircle className="h-4 w-4" />,
    description: 'Có section câu hỏi thường gặp'
  }
];

export default function SeoOptimizer({
  title,
  excerpt,
  content,
  targetKeywords = [],
  initialScore
}: SeoOptimizerProps) {
  const [score, setScore] = useState<SeoScore | null>(initialScore || null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  // Calculate SEO score locally
  useEffect(() => {
    if (!content) return;

    const calculateScore = () => {
      const factors = {
        keywordInTitle: false,
        keywordInFirst100Words: false,
        internalLinks: 0,
        imagesWithAlt: 0,
        headingStructure: false,
        metaDescription: false,
        faqSchema: false,
        wordCount: 0
      };
      const suggestions: string[] = [];

      // Word count
      const textContent = content.replace(/<[^\u003e]*\u003e/g, '');
      factors.wordCount = textContent.split(/\s+/).filter(w => w.length > 0).length;

      // Title check
      if (targetKeywords.length > 0) {
        const mainKeyword = targetKeywords[0].toLowerCase();
        factors.keywordInTitle = title.toLowerCase().includes(mainKeyword);

        // First 100 words
        const first100Words = textContent.split(/\s+/).slice(0, 100).join(' ').toLowerCase();
        factors.keywordInFirst100Words = first100Words.includes(mainKeyword);
      }

      // Meta description
      factors.metaDescription = excerpt.length >= 150 && excerpt.length <= 160;

      // Heading structure
      const h2Count = (content.match(/<h2/gi) || []).length;
      factors.headingStructure = h2Count >= 5;

      // Images with alt
      const imgTags = content.match(/<img[^\u003e]*\u003e/gi) || [];
      factors.imagesWithAlt = imgTags.filter(img => img.includes('alt=')).length;

      // FAQ detection
      factors.faqSchema = content.toLowerCase().includes('câu hỏi thường gặp') ||
                         content.toLowerCase().includes('faq') ||
                         content.includes('❓');

      // Generate suggestions
      if (factors.wordCount < 1500) {
        suggestions.push(`Thêm ${1500 - factors.wordCount} từ nữa để đạt chuẩn SEO`);
      }
      if (title.length < 50 || title.length > 60) {
        suggestions.push(`Title hiện tại ${title.length} ký tự. Nên để 50-60 ký tự.`);
      }
      if (h2Count < 5) {
        suggestions.push(`Thêm ${5 - h2Count} H2 nữa để cấu trúc rõ ràng hơn.`);
      }
      if (!factors.faqSchema) {
        suggestions.push('Thêm FAQ section để tăng cơ hội Featured Snippet.');
      }
      if (imgTags.length > factors.imagesWithAlt) {
        suggestions.push(`${imgTags.length - factors.imagesWithAlt} ảnh chưa có alt text.`);
      }

      // Calculate total score
      const scoreWeights = {
        keywordInTitle: 15,
        keywordInFirst100Words: 10,
        internalLinks: 5,
        imagesWithAlt: 10,
        headingStructure: 15,
        metaDescription: 10,
        faqSchema: 10,
        wordCount: Math.min(25, Math.floor(factors.wordCount / 60))
      };

      const total = Object.entries(factors).reduce((sum, [key, value]) => {
        if (key === 'wordCount') return sum + (value as number);
        if (key === 'internalLinks') return sum + ((value as number) >= 2 ? scoreWeights[key] : 0);
        if (key === 'imagesWithAlt') return sum + ((value as number) > 0 ? scoreWeights[key] : 0);
        return sum + (value ? scoreWeights[key as keyof typeof scoreWeights] : 0);
      }, 0);

      return { total, factors, suggestions };
    };

    const newScore = calculateScore();
    setScore(newScore);
  }, [title, excerpt, content, targetKeywords]);

  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-green-600';
    if (s >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBg = (s: number) => {
    if (s >= 80) return 'bg-green-500';
    if (s >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getScoreRing = (s: number) => {
    if (s >= 80) return 'ring-green-200';
    if (s >= 60) return 'ring-amber-200';
    return 'ring-red-200';
  };

  if (!score) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 bg-slate-50 border-b border-slate-200 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-12 h-12 rounded-full ${getScoreBg(score.total)} ring-4 ${getScoreRing(score.total)} flex items-center justify-center text-white font-black text-lg`}>
              {score.total}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
              <Sparkles className={`h-3 w-3 ${getScoreColor(score.total)}`} />
            </div>
          </div>

          <div>
            <p className="font-bold text-sm text-[#00173a]">SEO Score</p>
            <p className={`text-xs font-medium ${getScoreColor(score.total)}`}>
              {score.total >= 80 ? 'Xuất sắc!' : score.total >= 60 ? 'Khá tốt' : 'Cần cải thiện'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">
            {score.total >= 80 ? '🟢' : score.total >= 60 ? '🟡' : '🔴'}
          </span>
          <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
            <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Factors Grid */}
          <div className="grid grid-cols-2 gap-2">
            {seoFactors.map((factor) => {
              const isChecked = score.factors[factor.key];
              return (
                <div
                  key={factor.key}
                  className={`flex items-center gap-2 p-2 rounded-lg text-xs ${
                    isChecked ? 'bg-green-50' : 'bg-slate-50'
                  }`}
                  title={factor.description}
                >
                  <div className={`p-1 rounded ${isChecked ? 'bg-green-500' : 'bg-slate-300'}`}>
                    {isChecked ? (
                      <Check className="h-3 w-3 text-white" />
                    ) : (
                      <X className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <span className={isChecked ? 'text-green-700 font-medium' : 'text-slate-500'}>
                    {factor.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100">
            <div className="text-center p-2 bg-slate-50 rounded-lg">
              <p className="text-2xl font-black text-[#00173a]">{score.factors.wordCount.toLocaleString()}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Từ</p>
            </div>
            <div className="text-center p-2 bg-slate-50 rounded-lg">
              <p className="text-2xl font-black text-[#00173a]">{(content.match(/<h2/gi) || []).length}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">H2</p>
            </div>
            <div className="text-center p-2 bg-slate-50 rounded-lg">
              <p className="text-2xl font-black text-[#00173a]">{(content.match(/<img/gi) || []).length}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Ảnh</p>
            </div>
          </div>

          {/* Suggestions */}
          {score.suggestions.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-[#00173a] uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="h-3 w-3" />
                Gợi ý cải thiện
              </p>
              <div className="space-y-1">
                {score.suggestions.slice(0, 3).map((suggestion, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 p-2 bg-amber-50 rounded-lg text-xs"
                  >
                    <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
                    <span className="text-amber-700">{suggestion}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Keywords */}
          {targetKeywords.length > 0 && (
            <div className="pt-3 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Từ khóa mục tiêu
              </p>
              <div className="flex flex-wrap gap-1">
                {targetKeywords.map((keyword) => {
                  const inTitle = title.toLowerCase().includes(keyword.toLowerCase());
                  return (
                    <span
                      key={keyword}
                      className={`text-[10px] px-2 py-1 rounded-full font-medium ${
                        inTitle
                          ? 'bg-green-100 text-green-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {keyword} {inTitle && '✓'}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
