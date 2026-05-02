// Types for AI Prompt System

export interface PromptModule {
  name: string;
  content: string;
  priority: number; // 1-10, higher = later in prompt (can override earlier)
}

export interface TemplateConfig {
  id: string;
  name: string;
  icon: string;
  description: string;
  requiredModules: string[];
  optionalModules: string[];
}

export interface ImageMarker {
  id: string;
  type: 'hero' | 'content' | 'gallery' | 'food' | 'space' | 'person' | 'product';
  description: string;
  placeholder?: string;
  uploadedUrl?: string;
}

export interface SeoScore {
  total: number;
  factors: {
    keywordInTitle: boolean;
    keywordInFirst100Words: boolean;
    internalLinks: number;
    imagesWithAlt: number;
    headingStructure: boolean;
    metaDescription: boolean;
    faqSchema: boolean;
    wordCount: number;
  };
  suggestions: string[];
}

export interface ValidationRule {
  name: string;
  test: (input: string) => boolean;
  error: string;
  severity: 'error' | 'warning';
}

export interface GenerateRequest {
  topic: string;
  templateType: string;
  province?: string;
  tone?: 'expert' | 'casual' | 'viral' | 'story';
  targetKeywords?: string[];
  notes?: string;
  includeFaq?: boolean;
  includeStructuredData?: boolean;
  modules?: string[];
  categories?: string[]; // List of available categories in system
  promotionMode?: 'dedicated' | 'top1-ranking'; // Quảng cáo/PR mode
  businessName?: string; // Tên đơn vị được quảng cáo
  businessInfo?: string; // Thông tin chi tiết về đơn vị
}

export interface GenerateResponse {
  title: string;
  excerpt: string;
  content: string;
  category?: string; // Automatically selected category
  tags: string[];
  seoScore?: SeoScore;
  imageMarkers?: ImageMarker[];
  structuredData?: Record<string, unknown>;
  faq?: Array<{ question: string; answer: string }>;
}
