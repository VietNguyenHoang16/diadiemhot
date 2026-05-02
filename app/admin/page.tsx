'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart3, Bell, Building, Check, FileText, ImagePlus, LogOut, Mail, MapPin, Plus, Search, Settings, Shield, Star, Trash2, Upload, UserRound, Users, X, Tag, Briefcase, Globe, MessageSquare, ChevronRight, ChevronLeft, Filter, Sparkles, Wand2, Eye, Zap, Target, Edit, Save, RotateCcw, Wand2 as MagicWand } from 'lucide-react';
import RichTextEditor from './components/RichTextEditor';
import { articleTemplates } from '@/app/lib/article-templates';
import ImageManager from './components/ImageManager';
import SeoOptimizer from './components/SeoOptimizer';
import { SeoScore } from '@/app/lib/ai-prompts';
import { RANKING_CATEGORY } from '@/app/lib/ranking-posts';

// ==================== TYPES ====================
type Stats = { businesses: number; reviews: number; posts: number; leads: number; users: number; newsletters: number; categories: number; locations: number };
type Lead = { id: string; businessName: string; email: string; phone: string; package: string; status: string; description?: string; createdAt: string };
type Business = { id: string; name: string; industry?: string; industryId?: string; address?: string; logo?: string; views?: number; rating?: number; status: string; featured: boolean; user?: { email?: string; name?: string } };
type Post = { id: string; title: string; excerpt?: string; content?: string; image?: string; category?: string; province?: string; status: 'DRAFT' | 'PUBLISHED'; slug: string; createdAt: string; tags: string[] };
type AppUser = { id: string; name: string; email: string; role: string; createdAt: string; business?: { name: string; status: string } | null };
type Subscriber = { id: string; email: string; status: boolean; createdAt: string };
type BlogForm = { id?: string; title: string; slug?: string; excerpt: string; content: string; image: string; category: string; province: string; status: 'DRAFT' | 'PUBLISHED'; tags: string[] };

// Taxonomy types
type Category = { id: string; name: string; slug: string; icon?: string; description?: string; order: number; _count?: { businesses: number } };
type Tag = { id: string; name: string; slug: string; _count?: { posts: number } };
type Industry = { id: string; name: string; slug: string; icon: string; description?: string; order: number; _count?: { businesses: number; posts: number } };
type Region = { id: string; name: string; slug: string; order: number; provinces: Province[] };
type Province = { id: string; name: string; slug: string; code?: string; order: number; region?: { id: string; name: string }; _count?: { locations: number; posts: number } };
type Review = { id: string; rating: number; comment?: string; status: 'PENDING' | 'PUBLISHED' | 'REJECTED'; createdAt: string; business?: { id: string; name: string; logo?: string } };

const emptyStats: Stats = { businesses: 0, reviews: 0, posts: 0, leads: 0, users: 0, newsletters: 0, categories: 0, locations: 0 };
const emptyBlogForm: BlogForm = { title: '', slug: '', excerpt: '', content: '', image: '', category: 'Du lich', province: '', status: 'DRAFT', tags: [] };

export default function AdminPanel() {
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const inlineInputRef = useRef<HTMLInputElement | null>(null);
  const contentRef = useRef<HTMLTextAreaElement | null>(null);
  const [adminUser, setAdminUser] = useState<{ name: string; role: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [showBlogForm, setShowBlogForm] = useState(false);

  // Read initial tab from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab) setActiveTab(tab);
  }, []);

  const router = useRouter();

  const switchTab = (tab: string) => {
    setActiveTab(tab);
    const params = new URLSearchParams(window.location.search);
    params.set('tab', tab);
    window.history.replaceState(null, '', `?${params.toString()}`);
  };

  const [blogForm, setBlogForm] = useState<BlogForm>(emptyBlogForm);
  const [provinces, setProvinces] = useState<string[]>([]);
  const [coverUploading, setCoverUploading] = useState(false);
  const [data, setData] = useState<{ stats: Stats; leads: Lead[]; businesses: Business[]; posts: Post[]; users: AppUser[]; subscribers: Subscriber[] }>({ stats: emptyStats, leads: [], businesses: [], posts: [], users: [], subscribers: [] });

  // Taxonomy states
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [provinceList, setProvinceList] = useState<Province[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewPagination, setReviewPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [reviewFilter, setReviewFilter] = useState({ status: '', rating: '' });

  // Loading states for each tab
  const [taxonomyLoading, setTaxonomyLoading] = useState(false);

  // Blog Filters state
  const [blogSearchTerm, setBlogSearchTerm] = useState('');
  const [blogStatusFilter, setBlogStatusFilter] = useState('ALL');
  const [blogCategoryFilter, setBlogCategoryFilter] = useState('ALL');

  // AI Writer state
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [apiUrl, setApiUrl] = useState('https://api.x.ai/v1/chat/completions');
  const [apiModel, setApiModel] = useState('grok-3-mini-fast');
  const [apiKey, setApiKey] = useState('');
  const [aiSeoScore, setAiSeoScore] = useState<SeoScore | null>(null);
  const [showImageManager, setShowImageManager] = useState(false);
  const [needsMigration, setNeedsMigration] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isEditingAiSettings, setIsEditingAiSettings] = useState(false);
  const [lastSavedSettings, setLastSavedSettings] = useState({ url: '', model: '', key: '' });
  const [aiPrompts, setAiPrompts] = useState<{ id: string; name: string; content: string }[]>([]);
  const [aiPlans, setAiPlans] = useState<{ id: string; title: string; status: string; postId?: string }[]>([]);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState<string | null>(null);
  const [promotionMode, setPromotionMode] = useState<'dedicated' | 'top1-ranking'>('dedicated');
  const [businessName, setBusinessName] = useState('');
  const [businessInfo, setBusinessInfo] = useState('');

  useEffect(() => {
    fetchDbSettings();
    void fetchAiPlans();
    void fetchCategories();
  }, []);

  const fetchAiPlans = async () => {
    try {
      const res = await fetch('/api/admin/ai-post-plan');
      if (res.ok) {
        const data = await res.json();
        setAiPlans(data);
      }
    } catch (e) {
      console.error('Error fetching AI plans:', e);
    }
  };

  const handleGeneratePlan = async (planId: string) => {
    if (isGeneratingPlan) return;
    setIsGeneratingPlan(planId);
    try {
      const res = await fetch('/api/admin/ai-post-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId })
      });
      if (res.ok) {
        await fetchAiPlans();
        await fetchData();
        alert('Đã viết bài thành công!');
      } else {
        const data = await res.json();
        alert('Lỗi: ' + (data.error || 'Unknown error'));
        await fetchAiPlans();
      }
    } catch (e) {
      alert('Lỗi kết nối');
    } finally {
      setIsGeneratingPlan(null);
    }
  };

  const handleRewritePlan = async (planId: string) => {
    if (!confirm('Bài viết cũ sẽ bị xóa và viết lại từ đầu. Tiếp tục?')) return;
    if (isGeneratingPlan) return;
    setIsGeneratingPlan(planId);
    try {
      const res = await fetch('/api/admin/ai-post-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, rewrite: true })
      });
      if (res.ok) {
        await fetchAiPlans();
        await fetchData();
        alert('Đã viết lại bài thành công!');
      } else {
        const data = await res.json();
        alert('Lỗi: ' + (data.error || 'Unknown error'));
        await fetchAiPlans();
      }
    } catch (e) {
      alert('Lỗi kết nối');
    } finally {
      setIsGeneratingPlan(null);
    }
  };

  const fetchDbSettings = async () => {
    try {
      // 1. Fetch System Settings
      const settingsRes = await fetch('/api/admin/settings');
      if (settingsRes.ok) {
        const settings = await settingsRes.json();
        if (settings.ai_url) setApiUrl(settings.ai_url);
        if (settings.ai_model) setApiModel(settings.ai_model);
        if (settings.ai_key) setApiKey(settings.ai_key);

        setLastSavedSettings({
          url: settings.ai_url || '',
          model: settings.ai_model || '',
          key: settings.ai_key || ''
        });

        // If DB is empty but localStorage has data, trigger migration
        if (!settings.ai_url && localStorage.getItem('ai_url')) {
          setNeedsMigration(true);
        }
      }

      // 2. Fetch Prompts
      const promptsRes = await fetch('/api/admin/ai-prompts');
      const defaults = [
        {
          id: 'p1',
          name: '⭐ Chuyên gia',
          content: `PHONG CÁCH ⭐ CHUYÊN GIA (Extreme Detail & High EEAT):
Bạn là một Hội đồng Chuyên gia đa ngành (Ẩm thực, Kiến trúc, Dịch vụ khách hàng) với 20+ năm kinh nghiệm.
MỤC TIÊU: Tạo ra một bài "Audit" (kiểm toán) địa điểm đẳng cấp nhất.
YÊU CẦU CHI TIẾT:
1. PHÂN TÍCH KỸ THUẬT: Đánh giá kiến trúc, vật liệu sử dụng, sơ đồ bố trí (layout), ánh sáng (lux), âm học (acoustic).
2. KIỂM ĐỊNH DỊCH VỤ: Quy trình check-in/check-out, thái độ nhân viên theo tiêu chuẩn 5 sao, tốc độ xử lý yêu cầu.
3. PHÂN TÍCH EEAT: Trích dẫn các thông số cụ thể, so sánh với các đối thủ cùng phân khúc. Đảm bảo tính minh bạch và khách quan tuyệt đối.
4. "THE SOUL": Tìm ra triết lý kinh doanh và linh hồn của địa điểm mà khách thường không nhận ra.
5. CẤU TRÚC: Phải có bảng thông số kỹ thuật, đánh giá ưu/nhược điểm theo thang điểm 10 chi tiết từng hạng mục.
TRÁNH: Các tính từ sáo rỗng như "rất đẹp", "rất ngon". Hãy dùng "bố cục cân đối", "hương vị có hậu vị sâu", "kết cấu vật liệu bền vững".`
        },
        {
          id: 'p2',
          name: '🚀 Viral Top',
          content: `PHONG CÁCH 🚀 VIRAL TOP (Maximum Impact & Psychology):
Bạn là một "Content Architect" chuyên trị các nền tảng mạng xã hội triệu view (TikTok, Facebook, Instagram).
MỤC TIÊU: Bài viết phải đạt tỷ lệ Share và Save cực cao.
YÊU CẦU CHI TIẾT:
1. THE HOOK: Mở đầu bằng một "Pattern Interrupt" (ngắt quãng tư duy) gây sốc, phá bỏ định kiến cũ về địa điểm.
2. FOMO FACTOR: Nhấn mạnh sự giới hạn (thời gian, số lượng, trải nghiệm hiếm có) để kích thích lòng thèm muốn.
3. STRUCTURE: Sử dụng các Bullet point ngắn, sắc bén, dễ quét (scannable). Mỗi mục phải có một "Wow factor".
4. SURVIVAL TIPS: Những mẹo "xương máu" để hưởng lợi tối đa mà không bị mất tiền oan.
5. CHALLENGE: Đưa ra một thử thách cho người đọc (Ví dụ: "Nếu chưa thử món X ở đây thì coi như chưa đến...").
6. TONE: Năng lượng cực cao, sử dụng ngôn ngữ trendy nhưng vẫn giữ được đẳng cấp của "diadiemhot".`
        },
        {
          id: 'p3',
          name: '📖 Kể chuyện',
          content: `PHONG CÁCH 📖 STORYTELLING SIÊU CẤP (National Geographic Masterclass):
Bạn là một phóng viên kỳ cựu của National Geographic, người tin rằng mỗi hạt bụi đều có một câu chuyện.
MỤC TIÊU: Chạm đến cảm xúc sâu nhất và khiến người đọc muốn "xách ba lô lên và đi" ngay lập tức.
CẤU TRÚC TỰA TIỂU THUYẾT:
1. DẪN NHẬP (The Call): Khởi đầu bằng một cảm giác, một mùi hương hoặc một âm thanh đặc trưng của nơi đó.
2. DIỄN BIẾN (The Journey): Khám phá từng lớp lịch sử, văn hóa và những con người lặng lẽ đứng sau sự thành công của địa điểm.
3. CAO TRÀO (The Soul): Khoảnh khắc "Eureka" của tác giả khi nhận ra giá trị thực sự của chuyến đi.
4. KẾT THÚC (The Return): Bài học hoặc cảm xúc đọng lại sau cùng.
YÊU CẦU 5 GIÁC QUAN:
- Thính giác: Tiếng gió lùa, tiếng xèo xèo của chảo nóng, tiếng cười giòn tan.
- Khứu giác: Mùi gỗ mục, mùi cà phê rang xay, mùi mưa trên cỏ khô.
- Xúc giác: Sự thô ráp của bức tường đá cổ, cái lạnh của sương sớm.
- Thị giác: Sự chuyển màu của ánh hoàng hôn trên mái ngói.
- Vị giác: Sự bùng nổ của các tầng hương vị trong miệng.`
        },
        {
          id: 'p4',
          name: '✈️ Cẩm nang',
          content: `PHONG CÁCH ✈️ SIÊU CẨM NANG (Ultimate Authority & Local Insider):
Bạn đóng vai "Key Member" của một hội thám hiểm bí mật, người sở hữu những bản đồ và thông tin "không bao giờ có trên Google".
MỤC TIÊU: Một hướng dẫn "Full-Stack" không kẽ hở cho mọi loại đối tượng.
YÊU CẦU CHI TIẾT:
1. LOGISTICS BIBLE: Chi tiết đến từng phút di chuyển, loại xe, giá vé chính xác nhất.
2. BẢNG CHI PHÍ 3 TẦNG: Dự toán cho Backpacking (Cực rẻ), Mid-range (Hợp lý), và Luxury (Đẳng cấp).
3. ITINERARY CHUẨN CHỈNH: Lịch trình mẫu từ sáng sớm đến tận đêm khuya phù hợp cho cả cặp đôi và gia đình.
4. BÍ MẬT THỔ ĐỊA: Những quán ăn chỉ người dân bản địa mới biết, những lối đi tắt bí mật.
5. SINH TỒN & VĂN HÓA: Những điều CẤM KỴ tuyệt đối, quy tắc ứng xử địa phương để tránh rắc rối.
6. CHECKLIST: Danh sách vật dụng cần mang theo (Packing list) riêng biệt cho địa danh này.`
        },
        {
          id: 'p5',
          name: '📸 Check-in',
          content: `PHONG CÁCH 📸 CHECK-IN MASTERCLASS (Social Media Master):
Bạn là một Lifestyle Photographer chuyên nghiệp và là một Influencer hàng đầu.
MỤC TIÊU: Biến người đọc thành ngôi sao trên mạng xã hội thông qua các bức ảnh đẳng cấp.
YÊU CẦU CHI TIẾT:
1. MAP TO VIEW: Chỉ đích danh vị trí đứng, tọa độ, hướng ống kính để có góc chụp triệu view.
2. LIGHTING MASTER: Thời điểm vàng (Golden Hour), giờ xanh (Blue Hour) và cách tận dụng ánh sáng nhân tạo.
3. GEAR & SETTING: Gợi ý máy ảnh, điện thoại, tiêu cực (Wide, Portrait, Tele) và thông số ISO/Khẩu độ.
4. OUTFIT CURATION: Gợi ý màu sắc trang phục phù hợp với tông màu (background) của địa điểm.
5. POSING GUIDE: Các tư thế tạo dáng tự nhiên, không "diễn" mà vẫn cực sang chảnh.
6. EDITING RECIPES: Công thức chỉnh màu (Presets trên Lightroom/VSCO/CapCut) phù hợp nhất.
7. CAPTION BANK: Danh sách 10 câu Caption (Sâu sắc, Thả thính, Trendy, Hài hước) sẵn sàng để copy.`
        }
      ];

      if (promptsRes.ok) {
        const dbPrompts = await promptsRes.json();
        if (dbPrompts.length > 0) {
          setAiPrompts(dbPrompts);
        } else {
          // Check for localStorage migration
          const savedLocal = localStorage.getItem('diadiemhot_ai_prompts');
          if (savedLocal) {
            setNeedsMigration(true);
            setAiPrompts(JSON.parse(savedLocal));
          } else {
            setAiPrompts(defaults);
          }
        }
      }
    } catch (e) {
      console.error('Error loading settings:', e);
    }
  };

  const handleMigration = async () => {
    try {
      setLoading(true);
      // Migrate settings
      await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            ai_url: localStorage.getItem('ai_url'),
            ai_model: localStorage.getItem('ai_model'),
            ai_key: localStorage.getItem('ai_key'),
          }
        })
      });

      // Migrate prompts
      const localPrompts = JSON.parse(localStorage.getItem('diadiemhot_ai_prompts') || '[]');
      if (localPrompts.length > 0) {
        await fetch('/api/admin/ai-prompts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompts: localPrompts })
        });
      }

      setNeedsMigration(false);
      alert('Đã di chuyển dữ liệu quan trọng lên Database thành công!');
      fetchDbSettings();
    } catch (e) {
      alert('Di chuyển thất bại: ' + String(e));
    } finally {
      setLoading(false);
    }
  };


  const updatePrompt = async () => {
    // Deprecated - AI now auto-selects style based on topic
  };

  const saveAiSettings = async () => {
    try {
      setIsSavingSettings(true);
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            ai_url: apiUrl,
            ai_model: apiModel,
            ai_key: apiKey
          }
        })
      });

      if (res.ok) {
        setLastSavedSettings({ url: apiUrl, model: apiModel, key: apiKey });
        setIsEditingAiSettings(false);
        alert('Đã lưu cấu hình AI lên Database thành công!');
      } else {
        throw new Error('Save failed');
      }
    } catch (e) {
      alert('Lỗi khi lưu cấu hình');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleCancelAiSettings = () => {
    setApiUrl(lastSavedSettings.url);
    setApiModel(lastSavedSettings.model);
    setApiKey(lastSavedSettings.key);
    setIsEditingAiSettings(false);
  };

  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showTagForm, setShowTagForm] = useState(false);
  const [showIndustryForm, setShowIndustryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [editingIndustry, setEditingIndustry] = useState<Industry | null>(null);

  useEffect(() => { void checkAuth(); }, []);
  useEffect(() => { void fetchProvinces(); }, []);

  useEffect(() => {
    // Fetch taxonomy data when tab changes
    if (activeTab === 'categories') void fetchCategories();
    if (activeTab === 'tags') void fetchTags();
    if (activeTab === 'industries') void fetchIndustries();
    if (activeTab === 'locations') void fetchLocations();
    if (activeTab === 'reviews') void fetchReviews();
  }, [activeTab]);

  async function checkAuth() {
    try {
      const res = await fetch('/api/admin/auth/login');
      if (!res.ok) return void router.push('/admin/login');
      setAdminUser({ name: 'Admin', role: 'admin' });
      await fetchData();
    } catch {
      router.push('/admin/login');
    } finally {
      setAuthLoading(false);
    }
  }

  async function fetchData() {
    setLoading(true);
    try {
      const [statsRes, leadsRes, businessesRes, postsRes, usersRes, newsletterRes] = await Promise.all([
        fetch('/api/admin/stats', { cache: 'no-store' }),
        fetch('/api/admin/leads', { cache: 'no-store' }),
        fetch('/api/admin/businesses', { cache: 'no-store' }),
        fetch('/api/admin/blog', { cache: 'no-store' }),
        fetch('/api/admin/users', { cache: 'no-store' }),
        fetch('/api/admin/newsletter', { cache: 'no-store' }),
      ]);
      const [stats, leads, businesses, posts, users, subscribers] = await Promise.all([statsRes.json(), leadsRes.json(), businessesRes.json(), postsRes.json(), usersRes.json(), newsletterRes.json()]);
      setData({ stats: stats.error ? emptyStats : stats, leads: Array.isArray(leads) ? leads : [], businesses: Array.isArray(businesses) ? businesses : [], posts: Array.isArray(posts) ? posts : [], users: Array.isArray(users) ? users : [], subscribers: Array.isArray(subscribers) ? subscribers : [] });
    } catch {
      setData({ stats: emptyStats, leads: [], businesses: [], posts: [], users: [], subscribers: [] });
    } finally {
      setLoading(false);
    }
  }

  async function fetchProvinces() {
    try {
      const res = await fetch('/api/locations');
      if (!res.ok) return;
      const data = await res.json();
      setProvinces(Array.isArray(data) ? data : []);
    } catch {
      setProvinces([]);
    }
  }

  // Taxonomy fetch functions
  async function fetchCategories() {
    setTaxonomyLoading(true);
    try {
      const res = await fetch('/api/admin/categories');
      if (!res.ok) {
        console.error('Categories API error:', res.status);
        return;
      }
      const data = await res.json();
      console.log('Categories loaded:', data.length);
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch categories error:', err);
      setCategories([]);
    } finally {
      setTaxonomyLoading(false);
    }
  }

  async function fetchTags() {
    setTaxonomyLoading(true);
    try {
      const res = await fetch('/api/admin/tags');
      if (!res.ok) {
        console.error('Tags API error:', res.status);
        return;
      }
      const data = await res.json();
      console.log('Tags loaded:', data.length);
      setTags(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch tags error:', err);
      setTags([]);
    } finally {
      setTaxonomyLoading(false);
    }
  }

  async function fetchIndustries() {
    setTaxonomyLoading(true);
    try {
      const res = await fetch('/api/admin/industries');
      if (!res.ok) {
        console.error('Industries API error:', res.status);
        return;
      }
      const data = await res.json();
      console.log('Industries loaded:', data.length);
      setIndustries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch industries error:', err);
      setIndustries([]);
    } finally {
      setTaxonomyLoading(false);
    }
  }

  async function fetchLocations() {
    setTaxonomyLoading(true);
    try {
      const [regionsRes, provincesRes] = await Promise.all([
        fetch('/api/admin/regions'),
        fetch('/api/admin/provinces'),
      ]);
      const [regionsData, provincesData] = await Promise.all([
        regionsRes.json(),
        provincesRes.json(),
      ]);
      console.log('Regions loaded:', regionsData.length, 'Provinces loaded:', provincesData.length);
      setRegions(Array.isArray(regionsData) ? regionsData : []);
      setProvinceList(Array.isArray(provincesData) ? provincesData : []);
    } catch (err) {
      console.error('Fetch locations error:', err);
      setRegions([]);
      setProvinceList([]);
    } finally {
      setTaxonomyLoading(false);
    }
  }

  async function fetchReviews() {
    setTaxonomyLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', reviewPagination.page.toString());
      params.set('limit', reviewPagination.limit.toString());
      if (reviewFilter.status) params.set('status', reviewFilter.status);
      if (reviewFilter.rating) params.set('rating', reviewFilter.rating);

      const res = await fetch(`/api/admin/reviews?${params}`);
      if (!res.ok) {
        console.error('Reviews API error:', res.status);
        return;
      }
      const data = await res.json();
      console.log('Reviews loaded:', data.reviews?.length || 0);
      setReviews(data.reviews || []);
      setReviewPagination(data.pagination || reviewPagination);
    } catch (err) {
      console.error('Fetch reviews error:', err);
      setReviews([]);
    } finally {
      setTaxonomyLoading(false);
    }
  }

  async function handleLogout() { await fetch('/api/admin/auth/logout', { method: 'POST' }); router.push('/admin/login'); }
  async function patchJson(url: string, body: Record<string, unknown>) { const res = await fetch(url, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); if (!res.ok) throw new Error('Patch failed'); }
  async function handleLead(id: string, status: string) { try { await patchJson('/api/admin/leads', { id, status }); await fetchData(); } catch { alert('Cap nhat lead that bai'); } }
  async function handleBusiness(id: string, payload: { status?: string; featured?: boolean }) { try { await patchJson('/api/admin/businesses', { id, ...payload }); await fetchData(); } catch { alert('Cap nhat doanh nghiep that bai'); } }
  function openCreatePost() { setBlogForm(emptyBlogForm); setShowBlogForm(true); }
  function openEditPost(post: Post) { setBlogForm({ id: post.id, title: post.title, slug: post.slug, excerpt: post.excerpt || '', content: post.content || '', image: post.image || '', category: post.category || 'Du lich', province: post.province || '', status: post.status, tags: post.tags || [] }); setShowAiPanel(false); setShowBlogForm(true); }

  async function handleAiGenerate() {
    if (!aiTopic.trim()) { setAiError('Vui lòng nhập tiêu đề bài viết'); return; }
    setAiLoading(true); setAiError('');
    setAiSeoScore(null);
    try {
      localStorage.setItem('ai_url', apiUrl);
      localStorage.setItem('ai_model', apiModel);
      localStorage.setItem('ai_key', apiKey);

      const res = await fetch('/api/admin/ai-writer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiTopic,
          apiUrl,
          apiModel,
          apiKey,
          includeFaq: true,
          includeStructuredData: true,
          ...(businessName.trim() ? {
            templateType: 'promotion',
            promotionMode,
            businessName: businessName.trim(),
            businessInfo: businessInfo.trim()
          } : {})
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const errMsg = (data.code === 'PARSE_ERROR' || data.code === 'INCOMPLETE_ARTICLE') && data.rawPreview
          ? `AI response không đúng format. Preview: ${data.rawPreview.slice(0, 200)}...`
          : data.details?.join(', ') || data.error || 'AI Writer lỗi';
        throw new Error(errMsg);
      }

      if (!data.title?.trim() || !data.content?.trim()) {
        throw new Error('AI tráº£ vá» bÃ i viáº¿t chÆ°a hoÃ n chá»‰nh. Vui lÃ²ng thá»­ láº¡i.');
      }

      // Store SEO score
      if (data.seoScore) {
        setAiSeoScore(data.seoScore);
      }

      // Auto-save as DRAFT to DB
      const saveRes = await fetch('/api/admin/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          excerpt: data.excerpt,
          content: data.content,
          category: data.category || 'Du lich',
          province: '',
          status: 'DRAFT',
          tags: data.tags || [],
          image: '',
          metaTitle: data.metaTitle || data.title,
          metaDescription: data.metaDescription || data.excerpt,
          targetKeywords: data.targetKeywords || []
        }),
      });

      if (!saveRes.ok) {
        const errData = await saveRes.json();
        throw new Error(`Lưu nháp thất bại: ${errData.error || errData.details || 'Unknown error'}`);
      }

      await fetchData(); // Refresh list
      setAiTopic('');
      setBusinessName('');
      setBusinessInfo('');
      alert(`Đã tạo bài viết AI thành công! SEO Score: ${data.seoScore?.total || 'N/A'}`);
    } catch (err: any) { setAiError(err.message || 'Lỗi khi tạo bài viết AI'); }
    finally { setAiLoading(false); }
  }

  async function getUploadSignature(folder: string) {
    const res = await fetch('/api/admin/uploads/sign', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ folder }) });
    if (!res.ok) throw new Error('Sign failed');
    return res.json() as Promise<{ cloudName: string; apiKey: string; timestamp: number; folder: string; signature: string }>;
  }

  async function uploadToCloudinary(file: File, folder: string) {
    const sign = await getUploadSignature(folder);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', sign.apiKey);
    formData.append('timestamp', String(sign.timestamp));
    formData.append('folder', sign.folder);
    formData.append('signature', sign.signature);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`, { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return data.secure_url as string;
  }

  function insertAtCursor(text: string) {
    const textarea = contentRef.current;
    if (!textarea) return setBlogForm((current) => ({ ...current, content: `${current.content}\n${text}`.trim() }));
    const start = textarea.selectionStart ?? blogForm.content.length;
    const end = textarea.selectionEnd ?? blogForm.content.length;
    const next = `${blogForm.content.slice(0, start)}${text}${blogForm.content.slice(end)}`;
    setBlogForm((current) => ({ ...current, content: next }));
    requestAnimationFrame(() => { textarea.focus(); const cursor = start + text.length; textarea.setSelectionRange(cursor, cursor); });
  }

  async function handleCoverUpload(file: File) {
    setCoverUploading(true);
    try { const url = await uploadToCloudinary(file, 'diadiemhot/blog/cover'); setBlogForm((current) => ({ ...current, image: url })); }
    catch { alert('Upload anh cover that bai'); }
    finally { setCoverUploading(false); if (coverInputRef.current) coverInputRef.current.value = ''; }
  }

  const handleInlineUploadCallback = async (file: File) => {
    return uploadToCloudinary(file, 'diadiemhot/blog/content');
  };

  async function handleDeleteImage(publicId: string) {
    const res = await fetch('/api/admin/uploads/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicId })
    });
    if (!res.ok) throw new Error('Delete failed');
  }

  async function handlePostSubmit(event: React.FormEvent) {
    event.preventDefault();
    try {
      const method = blogForm.id ? 'PATCH' : 'POST';
      const res = await fetch('/api/admin/blog', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(blogForm) });
      if (!res.ok) throw new Error('Save failed');
      setBlogForm(emptyBlogForm); setShowBlogForm(false); await fetchData();
    } catch { alert('Luu bai viet that bai'); }
  }

  async function handleDeletePost(id: string) {
    if (!confirm('Xác nhận xóa bài viết?')) return;
    try {
      const res = await fetch(`/api/admin/blog?id=${id}`, {
        method: 'DELETE',
        cache: 'no-store'
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.details || 'Delete failed');
      }
      await fetchData();
    }
    catch (err: any) {
      alert(`Xóa bài viết thất bại: ${err.message}`);
    }
  }

  // Taxonomy CRUD functions
  async function handleCategorySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingCategory) return;

    try {
      const url = editingCategory.id ? '/api/admin/categories' : '/api/admin/categories';
      const method = editingCategory.id ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCategory)
      });
      if (!res.ok) throw new Error('Failed');
      setShowCategoryForm(false);
      setEditingCategory(null);
      await fetchCategories();
    } catch {
      alert('Lưu danh mục thất bại');
    }
  }

  async function handleTagSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingTag) return;

    try {
      const url = editingTag.id ? '/api/admin/tags' : '/api/admin/tags';
      const method = editingTag.id ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTag)
      });
      if (!res.ok) throw new Error('Failed');
      setShowTagForm(false);
      setEditingTag(null);
      await fetchTags();
    } catch {
      alert('Lưu tag thất bại');
    }
  }

  async function handleIndustrySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingIndustry) return;

    try {
      const url = editingIndustry.id ? '/api/admin/industries' : '/api/admin/industries';
      const method = editingIndustry.id ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingIndustry)
      });
      if (!res.ok) throw new Error('Failed');
      setShowIndustryForm(false);
      setEditingIndustry(null);
      await fetchIndustries();
    } catch {
      alert('Lưu ngành nghề thất bại');
    }
  }

  async function handleDeleteCategory(id: string) {
    if (!confirm('Xác nhận xóa danh mục?')) return;
    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      await fetchCategories();
    } catch {
      alert('Xóa danh mục thất bại');
    }
  }

  async function handleDeleteTag(id: string) {
    if (!confirm('Xác nhận xóa tag?')) return;
    try {
      const res = await fetch(`/api/admin/tags?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      await fetchTags();
    } catch {
      alert('Xóa tag thất bại');
    }
  }

  async function handleDeleteIndustry(id: string) {
    if (!confirm('Xác nhận xóa ngành nghề?')) return;
    try {
      const res = await fetch(`/api/admin/industries?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      await fetchIndustries();
    } catch {
      alert('Xóa ngành nghề thất bại');
    }
  }

  async function handleReviewStatus(id: string, status: 'PENDING' | 'PUBLISHED' | 'REJECTED') {
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (!res.ok) throw new Error('Failed');
      await fetchReviews();
    } catch {
      alert('Cập nhật trạng thái thất bại');
    }
  }

  async function handleDeleteReview(id: string) {
    if (!confirm('Xác nhận xóa đánh giá?')) return;
    try {
      const res = await fetch(`/api/admin/reviews?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      await fetchReviews();
    } catch {
      alert('Xóa đánh giá thất bại');
    }
  }

  // Sidebar tabs
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'ai-writer', label: 'AI Writer', icon: Sparkles },
    { id: 'places', label: 'Địa điểm', icon: Building },
    { id: 'leads', label: 'Lead / Đăng ký', icon: Mail },
    { id: 'blog', label: 'Bài viết', icon: FileText },
    { id: 'templates', label: 'Công thức viết', icon: FileText },
    { id: 'categories', label: 'Danh mục', icon: Globe },
    { id: 'tags', label: 'Tags', icon: Tag },
    { id: 'industries', label: 'Ngành nghề', icon: Briefcase },
    { id: 'locations', label: 'Tỉnh/Thành', icon: MapPin },
    { id: 'reviews', label: 'Đánh giá', icon: MessageSquare },
    { id: 'users', label: 'Người dùng', icon: Users },
    { id: 'settings', label: 'Cài đặt', icon: Settings },
  ];

  const q = searchQuery.trim().toLowerCase();
  const leads = data.leads.filter((item) => [item.businessName, item.email, item.phone, item.package].some((value) => String(value ?? '').toLowerCase().includes(q)));
  const businesses = data.businesses.filter((item) => [item.name, item.industry, item.address, item.user?.email].some((value) => String(value ?? '').toLowerCase().includes(q)));
  const posts = data.posts.filter((item) => [item.title, item.category, item.province, item.slug].some((value) => String(value ?? '').toLowerCase().includes(q)));
  const users = data.users.filter((item) => [item.name, item.email, item.role, item.business?.name].some((value) => String(value ?? '').toLowerCase().includes(q)));
  const subscribers = data.subscribers.filter((item) => item.email.toLowerCase().includes(q));

  if (authLoading || !adminUser) return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#bb0012]" /></div>;

  return (
    <main className="flex min-h-screen bg-slate-100">
      <aside className="fixed h-full w-64 bg-[#00173a] text-white shadow-2xl">
        <div className="border-b border-white/10 p-6"><div className="text-2xl font-black uppercase tracking-tighter">Admin Panel</div><div className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#bb0012]">Địa Điểm Hot</div></div>
        <nav className="mt-4 space-y-1 p-4 overflow-y-auto h-[calc(100%-180px)]">{tabs.map((tab) => <button key={tab.id} onClick={() => switchTab(tab.id)} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-[#bb0012] text-white shadow-lg' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}><tab.icon className="h-5 w-5" />{tab.label}</button>)}</nav>
        <div className="absolute bottom-0 w-64 border-t border-white/5 bg-[#00122e] p-6"><button onClick={handleLogout} className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/5 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all hover:bg-[#bb0012] hover:text-white"><LogOut className="h-4 w-4" />Đăng xuất</button></div>
      </aside>

      <div className="ml-64 flex-1 p-10">
        <div className="mb-10 flex items-center justify-between gap-8"><div><h1 className="text-4xl font-black uppercase tracking-tighter text-[#00173a]">{tabs.find((tab) => tab.id === activeTab)?.label}</h1><p className="mt-2 text-sm font-bold uppercase tracking-widest text-slate-500">Database + CMS Control Center</p></div><div className="relative"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" /><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Tìm kiếm..." className="w-80 rounded-2xl border-2 border-slate-100 bg-white py-3.5 pl-12 pr-6 text-sm font-bold shadow-sm outline-none placeholder:text-slate-300" /></div></div>

        {/* Migration Alert */}
        {needsMigration && (
          <div className="mb-8 flex items-center justify-between rounded-[2.5rem] border-2 border-amber-100 bg-gradient-to-r from-amber-50/50 to-orange-50/50 p-8 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm text-orange-500">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-tighter text-orange-900">Phát hiện dữ liệu cục bộ</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-orange-400 mt-1">Cấu hình AI và các mẫu bài viết đang được lưu ở máy này. Hãy đồng bộ lên Database để sử dụng trên mọi thiết bị.</p>
              </div>
            </div>
            <button
              onClick={handleMigration}
              disabled={loading}
              className="rounded-2xl bg-orange-500 px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-orange-600 transition-all shadow-lg shadow-orange-100 disabled:opacity-50"
            >
              {loading ? 'Đang đồng bộ...' : 'Đồng bộ lên Database ngay'}
            </button>
          </div>
        )}

        {(loading && ['dashboard', 'leads', 'places', 'blog', 'users', 'settings'].includes(activeTab)) ? (
          <div className="flex h-[60vh] items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#bb0012]" />
          </div>
        ) : (
          <div className="space-y-8">
            {activeTab === 'dashboard' && <><div className="grid grid-cols-4 gap-8">{[{ label: 'Doanh nghiệp', value: data.stats.businesses, icon: Building, color: 'bg-blue-500' }, { label: 'Đánh giá', value: data.stats.reviews, icon: Star, color: 'bg-amber-500' }, { label: 'Bài viết', value: data.stats.posts, icon: FileText, color: 'bg-violet-500' }, { label: 'Lead mới', value: data.stats.leads, icon: Bell, color: 'bg-[#bb0012]' }].map((item) => <div key={item.label} className="rounded-[2rem] border-2 border-slate-50 bg-white p-8 shadow-sm"><div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${item.color} text-white`}><item.icon className="h-6 w-6" /></div><div className="mt-6 text-5xl font-black tracking-tighter text-[#00173a]">{item.value.toLocaleString()}</div><div className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{item.label}</div></div>)}</div><div className="grid grid-cols-2 gap-8"><div className="rounded-[2rem] border-2 border-slate-50 bg-white p-8 shadow-sm"><h2 className="text-xl font-black uppercase tracking-tighter text-[#00173a]">Leads chờ xử lý</h2><div className="mt-6 space-y-3">{data.leads.slice(0, 5).map((lead) => <div key={lead.id} className="rounded-2xl bg-slate-50 p-4"><p className="font-black text-[#00173a]">{lead.businessName}</p><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{lead.package} • {lead.status}</p></div>)}</div></div><div className="rounded-[2rem] border-2 border-slate-50 bg-white p-8 shadow-sm"><h2 className="text-xl font-black uppercase tracking-tighter text-[#00173a]">CMS snapshot</h2><div className="mt-6 space-y-3">{['Blog posts lưu trong PostgreSQL', 'Ảnh cover và inline image upload Cloudinary', 'Users và newsletter đọc trực tiếp từ DB'].map((item) => <div key={item} className="rounded-2xl bg-[#fff8f5] p-4 text-sm font-bold text-[#00173a]">{item}</div>)}</div></div></div></>}

            {activeTab === 'ai-writer' && (
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-8">
                  <div className="rounded-[2.5rem] bg-white border-2 border-slate-50 p-10 shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="h-14 w-14 rounded-2xl bg-violet-600 flex items-center justify-center text-white shadow-lg shadow-violet-200">
                        <Sparkles className="h-7 w-7" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-[#00173a] uppercase tracking-tighter">AI Writer Pro</h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Viết bài chuẩn SEO Địa Điểm Hot với Đa Nền Tảng</p>
                      </div>
                    </div>

                    <div className="space-y-6">

                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#bb0012] mb-3 block">Chủ đề bài viết</label>
                        <input
                          value={aiTopic}
                          onChange={e => setAiTopic(e.target.value)}
                          placeholder="VD: Top 5 quán cà phê cổ tại Hà Nội, Review nhà hàng ngon nhất Quận 1..."
                          className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-6 py-5 text-lg font-black outline-none focus:border-violet-400 focus:bg-white transition-all placeholder:text-slate-300"
                          maxLength={200}
                        />
                      </div>

                      <div className="bg-gradient-to-r from-violet-50 to-indigo-50 rounded-2xl p-6 border border-violet-100 flex items-center gap-4 mb-6">
                        <div className="p-3 rounded-xl bg-white text-violet-600 shadow-sm">
                          <Sparkles className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-violet-900 uppercase tracking-tighter">AI tự động chọn phong cách viết</p>
                          <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Dựa trên tiêu đề, hệ thống sẽ chọn Review, Top List, Cẩm Nang hoặc Kể Chuyện phù hợp nhất</p>
                        </div>
                      </div>

                      {/* Promotion / PR Mode */}
                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-amber-500 text-white shadow-sm">
                            <Target className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-amber-900 uppercase tracking-tighter">Quảng Cáo / PR (Tùy chọn)</p>
                            <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Kích hoạt để viết bài quảng bá 1 đơn vị cụ thể</p>
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-amber-700 mb-2 block">Tên đơn vị cần PR / Quảng cáo</label>
                          <input
                            value={businessName}
                            onChange={e => setBusinessName(e.target.value)}
                            placeholder="VD: Nhà hàng Hải Sản Biển Xanh, Spa Hương Sen..."
                            className="w-full rounded-xl border-2 border-amber-100 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-amber-400 transition-all placeholder:text-slate-300"
                            maxLength={150}
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-amber-700 mb-2 block">Thông tin về đơn vị (điểm mạnh, USP, lịch sử...)</label>
                          <textarea
                            value={businessInfo}
                            onChange={e => setBusinessInfo(e.target.value)}
                            placeholder="VD: Thành lập 2015, nổi tiếng với lẩu hải sản tự chọn, không gian view biển 500 chỗ, giá 200-500k/người..."
                            className="w-full rounded-xl border-2 border-amber-100 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-amber-400 transition-all placeholder:text-slate-300 resize-none"
                            rows={3}
                            maxLength={500}
                          />
                        </div>

                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => setPromotionMode('dedicated')}
                            disabled={!businessName.trim()}
                            className={`flex-1 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest transition-all ${
                              promotionMode === 'dedicated'
                                ? 'bg-amber-500 text-white shadow-lg shadow-amber-200'
                                : 'bg-white text-amber-600 border-2 border-amber-200 hover:border-amber-400'
                            } disabled:opacity-40 disabled:cursor-not-allowed`}
                          >
                            📝 Bài Viết Riêng
                          </button>
                          <button
                            type="button"
                            onClick={() => setPromotionMode('top1-ranking')}
                            disabled={!businessName.trim()}
                            className={`flex-1 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest transition-all ${
                              promotionMode === 'top1-ranking'
                                ? 'bg-amber-500 text-white shadow-lg shadow-amber-200'
                                : 'bg-white text-amber-600 border-2 border-amber-200 hover:border-amber-400'
                            } disabled:opacity-40 disabled:cursor-not-allowed`}
                          >
                            🚀 Top 1 Xếp Hạng
                          </button>
                        </div>

                        {businessName.trim() && (
                          <p className="text-[10px] font-bold text-amber-600">
                            {promotionMode === 'dedicated'
                              ? 'AI sẽ viết bài 100% về đơn vị này, mô tả chi tiết và thuyết phục.'
                              : 'AI sẽ xếp đơn vị này số 1, điểm cao hơn hẳn các vị trí dưới (chênh ít nhất 1-2 điểm).'}
                          </p>
                        )}
                      </div>

                      {aiError && (
                        <div className="rounded-2xl bg-red-50 border border-red-100 p-6 flex flex-col gap-2">
                          <p className="text-sm font-black text-red-600 uppercase tracking-tighter">⚠️ Lỗi hệ thống</p>
                          <p className="text-xs text-red-500 font-bold leading-relaxed">{aiError}</p>
                        </div>
                      )}

                      <button
                        onClick={handleAiGenerate}
                        disabled={aiLoading || !aiTopic.trim() || !apiKey.trim()}
                        className="w-full rounded-[2rem] bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-6 text-sm font-black uppercase tracking-[0.2em] text-white hover:shadow-2xl hover:shadow-violet-200 transition-all disabled:opacity-50 flex items-center justify-center gap-4 group"
                      >
                        {aiLoading ? (
                          <><div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> ĐANG VIẾT... (CÓ THỂ MẤT 60S)</>
                        ) : (
                          <><MagicWand className="h-5 w-5" /> BẮT ĐẦU VIẾT BÀI NGAY <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" /></>
                        )}
                      </button>

                      {aiSeoScore && (
                        <SeoOptimizer
                          title={aiTopic}
                          excerpt={''}
                          content={''}
                          targetKeywords={[]}
                          initialScore={aiSeoScore}
                        />
                      )}
                    </div>
                  </div>

                  <div className="rounded-[2.5rem] bg-white border-2 border-slate-50 p-10 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-[#00173a] flex items-center justify-center text-white shadow-lg">
                          <Target className="h-6 w-6" />
                        </div>
                        <div>
                          <h2 className="text-xl font-black text-[#00173a] uppercase tracking-tighter">AI Content Plan (50 Titles)</h2>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Quản lý nội dung AI - Tránh trùng lặp</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                      {aiPlans.map((plan, idx) => (
                        <div key={plan.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${plan.status === 'COMPLETED' ? 'bg-green-50 border-green-100' : 'bg-white border-slate-100 hover:border-[#00173a]/20'}`}>
                          <div className="flex items-center gap-4 min-w-0">
                            <span className="text-xs font-black text-slate-300">{(idx + 1).toString().padStart(2, '0')}</span>
                            <p className={`font-bold text-sm truncate ${plan.status === 'COMPLETED' ? 'text-green-700 line-through opacity-60' : 'text-[#00173a]'}`}>{plan.title}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            {plan.status === 'COMPLETED' ? (
                              <div className="flex items-center gap-2 text-green-600">
                                <span className="text-[10px] font-black uppercase tracking-widest">Hoàn thành</span>
                                <div className="h-8 w-8 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg shadow-green-100">
                                  <Check className="h-4 w-4" />
                                </div>
                                {plan.postId && (
                                  <>
                                    <button onClick={() => router.push(`/admin/post/${plan.postId}/edit`)} className="p-2 rounded-lg bg-white border border-green-200 text-green-600 hover:bg-green-600 hover:text-white transition-all">
                                      <Edit className="h-3 w-3" />
                                    </button>
                                    <button
                                      onClick={() => handleRewritePlan(plan.id)}
                                      disabled={isGeneratingPlan !== null}
                                      className={`h-8 rounded-lg border transition-all flex items-center justify-center ${
                                        isGeneratingPlan === plan.id
                                          ? 'px-3 gap-2 bg-amber-600 border-amber-600 text-white'
                                          : 'w-8 bg-white border-amber-200 text-amber-600 hover:bg-amber-600 hover:text-white'
                                      }`}
                                      title="Viết lại bài"
                                    >
                                      {isGeneratingPlan === plan.id ? (
                                        <>
                                          <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                          <span className="text-[10px] font-black uppercase tracking-widest">Dang viet lai</span>
                                        </>
                                      ) : (
                                        <RotateCcw className="h-3 w-3" />
                                      )}
                                    </button>
                                  </>
                                )}
                              </div>
                            ) : (
                              <button
                                onClick={() => handleGeneratePlan(plan.id)}
                                disabled={isGeneratingPlan !== null}
                                className={`h-10 px-4 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${isGeneratingPlan === plan.id ? 'bg-[#00173a] text-white' : 'bg-slate-50 text-slate-400 hover:bg-[#bb0012] hover:text-white shadow-sm'}`}
                              >
                                {isGeneratingPlan === plan.id ? (
                                  <><div className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Đang viết...</>
                                ) : (
                                  <><MagicWand className="h-3 w-3" /> Viết bài</>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      {aiPlans.length === 0 && (
                        <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-[2rem]">
                          <p className="text-sm font-bold text-slate-300 uppercase tracking-widest">Đang tải kế hoạch bài viết...</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-[2.5rem] bg-white border-2 border-slate-50 p-10 shadow-sm">
                    <h3 className="text-lg font-black text-[#00173a] uppercase tracking-tighter mb-6 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-[#bb0012]" /> Bài viết AI vừa tạo
                    </h3>
                    <div className="space-y-4">
                      {data.posts.filter(p => p.status === 'DRAFT' && p.content?.includes('class="text-xl')).slice(0, 5).map(post => (
                        <div key={post.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-violet-200 transition-all group">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-12 rounded-xl bg-slate-50 overflow-hidden">
                              {post.image ? <img src={post.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Sparkles className="h-4 w-4 text-violet-200" /></div>}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-[#00173a] truncate max-w-md group-hover:text-violet-600 transition-colors">{post.title}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{post.category} • {new Date(post.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <button onClick={() => router.push(`/admin/post/${post.id}/edit`)} className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-violet-600 hover:text-white transition-all">
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      {data.posts.filter(p => p.status === 'DRAFT' && p.content?.includes('class="text-xl')).length === 0 && (
                        <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-[2rem]">
                          <p className="text-sm font-bold text-slate-300 uppercase tracking-widest">Chưa có bài viết AI nào được tạo</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="rounded-[2.5rem] bg-[#00173a] p-10 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10"><Sparkles className="h-32 w-32" /></div>
                    <h3 className="text-xl font-black uppercase tracking-tighter mb-4">Cẩm nang AI</h3>
                    <p className="text-sm text-slate-400 leading-relaxed mb-6 font-medium">Để có bài viết tốt nhất, hãy nhập chủ đề thật chi tiết. AI sẽ tự động định dạng HTML với các CSS chuẩn của Địa Điểm Hot.</p>
                    <ul className="space-y-4">
                      {['Tự động chọn từ khóa SEO', 'Tự động định dạng Tailwind', 'Tối ưu hình ảnh (Alt/SEO)', 'Bài viết chuyên sâu 1800-3000 từ'].map(item => (
                        <li key={item} className="flex items-center gap-3 text-xs font-black uppercase tracking-widest">
                          <div className="h-1.5 w-1.5 rounded-full bg-[#bb0012]" /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-[2.5rem] border-2 border-slate-50 bg-white p-8 shadow-sm">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-[#bb0012] mb-4">Lưu ý</h3>
                    <div className="bg-slate-50 rounded-2xl p-5 text-xs text-slate-500 font-medium leading-loose">
                      Sau khi tạo, bài viết sẽ nằm ở trạng thái <strong className="text-[#00173a]">BẢN NHÁP</strong>. Bạn hãy vào tab Bài viết để kiểm tra nội dung và <strong className="text-[#bb0012]">XUẤT BẢN</strong>.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'leads' && <div className="space-y-4 rounded-[2rem] border-2 border-slate-50 bg-white p-6 shadow-sm">{leads.map((lead) => <div key={lead.id} className="flex items-center justify-between rounded-2xl border border-slate-100 p-5"><div><p className="font-black text-[#00173a]">{lead.businessName}</p><p className="text-sm text-slate-400">{lead.email} • {lead.phone}</p></div><div className="flex items-center gap-3"><span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase">{lead.status}</span><button onClick={() => handleLead(lead.id, 'CONVERTED')} className="rounded-xl bg-green-50 p-3 text-green-600"><Check className="h-5 w-5" /></button><button onClick={() => handleLead(lead.id, 'REJECTED')} className="rounded-xl bg-red-50 p-3 text-red-600"><X className="h-5 w-5" /></button></div></div>)}</div>}

            {activeTab === 'places' && <div className="space-y-4 rounded-[2rem] border-2 border-slate-50 bg-white p-6 shadow-sm">{businesses.map((place) => <div key={place.id} className="flex items-center justify-between rounded-2xl border border-slate-100 p-5"><div className="flex items-center gap-4"><div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-slate-50">{place.logo ? <img src={place.logo} alt={place.name} className="h-full w-full object-cover" /> : <Building className="h-6 w-6 text-slate-300" />}</div><div><p className="font-black text-[#00173a]">{place.name}</p><p className="text-sm text-slate-400">{place.industry || 'Chưa phân loại'} • {(place.views ?? 0).toLocaleString()} views</p></div></div><div className="flex items-center gap-3"><span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase">{place.status}</span><button onClick={() => handleBusiness(place.id, { status: 'ACTIVE' })} className="rounded-xl bg-[#00173a] px-4 py-2 text-[10px] font-black uppercase text-white">Approve</button><button onClick={() => handleBusiness(place.id, { featured: !place.featured })} className="rounded-xl border border-slate-200 px-4 py-2 text-[10px] font-black uppercase text-slate-500">{place.featured ? 'Unfeature' : 'Feature'}</button></div></div>)}</div>}

            {activeTab === 'blog' && (() => {
              const posts = data.posts || [];
              const publishedCount = posts.filter(p => p.status === 'PUBLISHED').length;
              const draftCount = posts.filter(p => p.status === 'DRAFT').length;
              const blogCategoryMap = posts.reduce((acc, p) => { const c = p.category || 'Chưa phân loại'; acc[c] = (acc[c] || 0) + 1; return acc; }, {} as Record<string, number>);
              const uniqueBlogCategories = Object.keys(blogCategoryMap);
              const filteredPosts = posts.filter(p => {
                const matchesSearch = p.title.toLowerCase().includes(blogSearchTerm.toLowerCase()) || p.slug.toLowerCase().includes(blogSearchTerm.toLowerCase());
                const matchesStatus = blogStatusFilter === 'ALL' || p.status === blogStatusFilter;
                const matchesCategory = blogCategoryFilter === 'ALL' || p.category === blogCategoryFilter;
                return matchesSearch && matchesStatus && matchesCategory;
              });

              return <>
                <div className="grid grid-cols-4 gap-4 mb-8">
                  <div className="rounded-[2rem] bg-white border-2 border-slate-50 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-xl bg-slate-50"><FileText className="h-4 w-4 text-slate-400" /></div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tổng bài viết</p>
                    </div>
                    <p className="text-3xl font-black text-[#00173a]">{posts.length}</p>
                  </div>
                  <div className="rounded-[2rem] bg-white border-2 border-slate-50 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-xl bg-green-50"><Check className="h-4 w-4 text-green-500" /></div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-green-500">Đã xuất bản</p>
                    </div>
                    <p className="text-3xl font-black text-green-600">{publishedCount}</p>
                  </div>
                  <div className="rounded-[2rem] bg-white border-2 border-slate-50 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-xl bg-amber-50"><FileText className="h-4 w-4 text-amber-500" /></div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">Bản nháp</p>
                    </div>
                    <p className="text-3xl font-black text-amber-600">{draftCount}</p>
                  </div>
                  <div className="rounded-[2rem] bg-white border-2 border-slate-50 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-xl bg-[#fff8f5]"><Tag className="h-4 w-4 text-[#bb0012]" /></div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#bb0012]">Danh mục</p>
                    </div>
                    <p className="text-3xl font-black text-[#bb0012]">{uniqueBlogCategories.length}</p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
                  <div className="flex-1 relative w-full">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                    <input
                      type="text"
                      placeholder="Tìm theo tiêu đề hoặc slug..."
                      className="w-full rounded-2xl border-2 border-slate-100 bg-white pl-14 pr-6 py-4 text-sm font-bold outline-none focus:border-[#bb0012]/30 transition-all"
                      value={blogSearchTerm}
                      onChange={(e) => setBlogSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <select
                      className="flex-1 md:w-44 rounded-2xl border-2 border-slate-100 bg-white px-5 py-4 text-sm font-bold outline-none cursor-pointer"
                      value={blogStatusFilter}
                      onChange={(e) => setBlogStatusFilter(e.target.value)}
                    >
                      <option value="ALL">Mọi trạng thái</option>
                      <option value="PUBLISHED">Đã xuất bản</option>
                      <option value="DRAFT">Bản nháp</option>
                    </select>
                    <select
                      className="flex-1 md:w-44 rounded-2xl border-2 border-slate-100 bg-white px-5 py-4 text-sm font-bold outline-none cursor-pointer"
                      value={blogCategoryFilter}
                      onChange={(e) => setBlogCategoryFilter(e.target.value)}
                    >
                      <option value="ALL">Mọi danh mục</option>
                      {uniqueBlogCategories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <button onClick={openCreatePost} className="flex items-center justify-center gap-3 rounded-2xl bg-[#bb0012] px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white hover:shadow-lg hover:shadow-[#bb0012]/20 transition-all shrink-0">
                      <Plus className="h-5 w-5" /> Viết bài mới
                    </button>
                  </div>
                </div>

                {showBlogForm && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#00122e]/90 p-8"><form onSubmit={handlePostSubmit} className="custom-scrollbar max-h-[90vh] w-full max-w-5xl space-y-6 overflow-y-auto rounded-[2.5rem] bg-white p-10 shadow-2xl relative"><div className="flex items-center justify-between sticky top-0 bg-white z-10 pb-4 border-b border-slate-50"><h2 className="text-3xl font-black uppercase tracking-tighter text-[#00173a]">{blogForm.id ? 'Cập nhật bài viết' : 'Tạo bài viết'}</h2><div className="flex items-center gap-3">{!blogForm.id && <button type="button" onClick={() => setShowAiPanel(!showAiPanel)} className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${showAiPanel ? 'bg-violet-600 text-white shadow-lg shadow-violet-200' : 'bg-gradient-to-r from-violet-50 to-purple-50 text-violet-600 border-2 border-violet-100 hover:border-violet-300'}`}>✨ {showAiPanel ? 'Đóng AI' : 'Viết bằng AI'}</button>}<button type="button" onClick={() => setShowBlogForm(false)} className="rounded-2xl bg-slate-50 p-4 text-slate-400 hover:bg-slate-100 transition-colors"><X className="h-6 w-6" /></button></div></div>

                  {showAiPanel && <div className="rounded-[2rem] border-2 border-violet-100 bg-gradient-to-br from-violet-50/80 via-purple-50/50 to-fuchsia-50/30 p-8 space-y-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-xl bg-violet-100">
                        <span className="text-xl">✨</span>
                      </div>
                      <div>
                        <p className="text-lg font-black text-violet-900 uppercase tracking-tighter">AI Writer — Tự động chọn phong cách</p>
                        <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Nhập tiêu đề → AI viết toàn bộ bài → Bạn review trước khi lưu</p>
                      </div>
                    </div>
                    <div className="bg-white/80 rounded-2xl p-6 border border-violet-100">
                      <input value={aiTopic} onChange={e => setAiTopic(e.target.value)} placeholder="Nhập tiêu đề bài viết... VD: Top 10 quán cà phê cổ Hà Nội" className="w-full rounded-2xl border-2 border-violet-200 bg-white px-6 py-4 text-sm font-bold outline-none focus:border-violet-400 transition-all placeholder:text-violet-300" maxLength={200} />
                    </div>
                    {aiError && <div className="rounded-xl bg-red-50 border border-red-200 px-5 py-3 text-sm font-bold text-red-600">{aiError}</div>}
                    <button type="button" onClick={handleAiGenerate} disabled={aiLoading || !aiTopic.trim()} className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-8 py-5 text-xs font-black uppercase tracking-[0.2em] text-white hover:shadow-xl hover:shadow-violet-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3">
                      {aiLoading ? <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Đang viết bài... (15-30 giây)</> : <>✨ Tạo bài viết bằng AI</>}
                    </button>
                  </div>}

                  <input required value={blogForm.title} onChange={(event) => setBlogForm({ ...blogForm, title: event.target.value })} placeholder="Tiêu đề bài viết" className="w-full border-b-4 border-slate-50 py-4 text-3xl font-black outline-none focus:border-[#bb0012]/30 transition-all" />
                  <div className="grid grid-cols-[1.1fr_0.9fr] gap-8"><div className="space-y-4"><label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#bb0012]">Hình ảnh đại diện bài viết</label><div onPaste={(event) => { const file = Array.from(event.clipboardData.items).find((item) => item.type.startsWith('image/'))?.getAsFile(); if (file) { event.preventDefault(); void handleCoverUpload(file); } }} className="rounded-[2.5rem] border-2 border-dashed border-slate-200 bg-slate-50 p-6 transition-colors hover:border-[#bb0012]/30">{blogForm.image ? <div className="space-y-4"><img src={blogForm.image} alt="Cover preview" className="aspect-[16/9] w-full rounded-2xl object-cover shadow-md" /><div className="flex gap-2"><input value={blogForm.image} onChange={(event) => setBlogForm({ ...blogForm, image: event.target.value })} placeholder="Dán link ảnh tại đây..." className="flex-1 rounded-xl bg-white px-4 py-3 text-sm font-bold outline-none border border-slate-100" /><button type="button" onClick={() => setBlogForm({ ...blogForm, image: '' })} className="bg-white p-3 rounded-xl border border-slate-100 text-red-500"><Trash2 className="h-4 w-4" /></button></div></div> : <div className="flex min-h-48 flex-col items-center justify-center gap-4 text-center group cursor-pointer" onClick={() => coverInputRef.current?.click()}><div className="p-5 rounded-full bg-white shadow-sm transition-transform group-hover:scale-110"><ImagePlus className="h-8 w-8 text-[#bb0012]" /></div><div><p className="font-black text-[#00173a] uppercase text-xs tracking-widest">{coverUploading ? 'ĐANG TẢI LÊN...' : 'Click hoặc Paste ảnh'}</p><p className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Định dạng khuyên dùng: 1200x630px <br />JPG, PNG, WebP</p></div><input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleCoverUpload(e.target.files[0])} /></div>}</div><div className="space-y-2 mt-4"><label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#bb0012]">URL BÀI VIẾT (SLUG)</label><div className="flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-3 border-2 border-slate-100 focus-within:border-[#bb0012]/30 transition-all"><Globe className="h-4 w-4 text-slate-400 shrink-0" /><span className="text-sm font-bold text-slate-400 select-none pl-1">/blog/</span><input value={blogForm.slug || ''} onChange={(event) => setBlogForm({ ...blogForm, slug: event.target.value })} placeholder="duong-dan-bai-viet (để trống tự tạo)" className="flex-1 bg-transparent w-full text-sm font-bold outline-none placeholder:text-slate-300 text-[#00173a]" /></div></div></div><div className="space-y-6"><div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#bb0012]">Thông tin cơ bản</label><select value={blogForm.category} onChange={(event) => setBlogForm({ ...blogForm, category: event.target.value })} className="w-full rounded-2xl border-2 border-slate-100 bg-white px-5 py-4 font-bold outline-none focus:border-[#bb0012]/30">
                    {!categories.some(c => c.name === blogForm.category) && blogForm.category && (
                      <option value={blogForm.category}>{blogForm.category}</option>
                    )}
                    {categories.length > 0 ? (
                      categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)
                    ) : (
                      <>
                        <option value="Du lich">Du lịch</option>
                        <option value="Review">Review</option>
                        <option value="Dia diem">Địa điểm</option>
                        <option value={RANKING_CATEGORY}>{RANKING_CATEGORY}</option>
                        <option value="Phong cach">Phong cách</option>
                      </>
                    )}
                  </select><select value={blogForm.province} onChange={(event) => setBlogForm({ ...blogForm, province: event.target.value })} className="w-full rounded-2xl border-2 border-slate-100 bg-white px-5 py-4 font-bold outline-none focus:border-[#bb0012]/30"><option value="">Mọi tỉnh/thành</option>{provinces.map((p) => <option key={p} value={p}>{p}</option>)}</select><select value={blogForm.status} onChange={(event) => setBlogForm({ ...blogForm, status: event.target.value as 'DRAFT' | 'PUBLISHED' })} className="w-full rounded-2xl border-2 border-slate-100 bg-white px-5 py-4 font-bold outline-none focus:border-[#bb0012]/30"><option value="DRAFT">BẢN NHÁP (DRAFT)</option><option value="PUBLISHED">XUẤT BẢN (PUBLISHED)</option></select></div><div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#bb0012]">Tags bài viết</label> <div className="p-5 rounded-2xl border-2 border-slate-100 bg-white"><div className="flex flex-wrap gap-2 mb-3">{(blogForm.tags || []).map(tag => <span key={tag} className="inline-flex items-center gap-1 bg-[#fff8f5] border border-[#bb0012]/10 px-3 py-1.5 rounded-xl text-xs font-black text-[#bb0012] uppercase tracking-widest">{tag}<X className="h-3 w-3 cursor-pointer" onClick={() => setBlogForm({ ...blogForm, tags: blogForm.tags.filter(t => t !== tag) })} /></span>)}</div><input placeholder="Nhập tag và nhấn Enter..." className="w-full outline-none text-sm font-bold" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); const val = e.currentTarget.value.trim(); if (val && !blogForm.tags.includes(val)) { setBlogForm({ ...blogForm, tags: [...blogForm.tags, val] }); e.currentTarget.value = ''; } } }} /></div></div></div></div><div className="space-y-4"><label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#bb0012]">Tóm tắt bài viết (Meta Description)</label><textarea required value={blogForm.excerpt} onChange={(event) => setBlogForm({ ...blogForm, excerpt: event.target.value })} placeholder="Viết mô tả ngắn gọn hút người đọc (150-160 ký tự)..." rows={4} className="w-full rounded-[2rem] border-2 border-slate-100 bg-white p-6 font-bold outline-none focus:border-[#bb0012]/30 leading-relaxed" /></div><div className="space-y-4"><div className="flex items-center justify-between"><label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#bb0012]">Nội dung bài viết</label><div className="flex gap-2"><span className="text-[9px] font-black text-slate-300 uppercase underline cursor-pointer hover:text-[#bb0012]">Hướng dẫn chèn ảnh</span></div></div><div className="relative rounded-[2.5rem] border-2 border-slate-100 p-2 focus-within:border-[#bb0012]/30 transition-all">
                    <RichTextEditor content={blogForm.content} onChange={(html) => setBlogForm({ ...blogForm, content: html })} uploadImage={handleInlineUploadCallback} deleteImage={handleDeleteImage} />
                  </div></div>

                  {blogForm.content && (blogForm.content.includes('￼[IMAGE:') || blogForm.content.includes('data-marker-id')) && (
                    <div className="mt-6">
                      <ImageManager
                        content={blogForm.content}
                        articleTitle={blogForm.title}
                        onContentChange={(newContent) => setBlogForm({ ...blogForm, content: newContent })}
                        onUploadImage={handleInlineUploadCallback}
                        onDeleteImage={handleDeleteImage}
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-5 pt-8 border-t border-slate-50">{blogForm.id && <a href={`/blog/${blogForm.slug || ''}`} target="_blank" rel="noreferrer" className="mr-auto rounded-2xl bg-blue-50 px-8 py-5 text-xs font-black uppercase tracking-widest text-blue-600 hover:bg-blue-100 transition-all flex items-center gap-2 pr-6"><Eye className="h-4 w-4" /> Xem trước bài viết</a>}<button type="button" onClick={() => setShowBlogForm(false)} className="rounded-2xl bg-slate-50 px-10 py-5 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-all">Hủy bỏ</button><button type="submit" className="rounded-2xl bg-[#bb0012] px-10 py-5 text-xs font-black uppercase tracking-widest text-white hover:shadow-xl hover:shadow-[#bb0012]/20 transition-all">Lưu & cập nhật bài viết</button></div></form></div>}

                <div className="rounded-[2.5rem] border-2 border-slate-50 bg-white shadow-sm overflow-hidden min-h-[500px]">
                  {filteredPosts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32">
                      <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6"><FileText className="h-10 w-10 text-slate-200" /></div>
                      <p className="text-xl font-black text-[#00173a] uppercase tracking-tighter">Không tìm thấy bài viết nào</p>
                      <p className="text-sm font-bold text-slate-400 mt-2">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                      <button onClick={() => { setBlogSearchTerm(''); setBlogStatusFilter('ALL'); setBlogCategoryFilter('ALL'); }} className="mt-8 text-xs font-black text-[#bb0012] uppercase tracking-widest underline underline-offset-8">Xóa bộ lọc</button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto custom-scrollbar">
                      <table className="w-full border-collapse table-fixed">
                        <thead>
                          <tr className="bg-slate-50/50 text-left border-b-2 border-slate-100">
                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 w-12">#</th>
                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Bài viết</th>
                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 w-36">Danh mục</th>
                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 w-28">Trạng thái</th>
                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 w-20 text-right">Hành động</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {filteredPosts.map((post, idx) => (
                            <tr key={post.id} className="group hover:bg-slate-50/30 transition-colors">
                              <td className="px-4 py-4">
                                <span className="text-xs font-black text-slate-200">{(idx + 1).toString().padStart(2, '0')}</span>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-16 h-12 rounded-xl bg-slate-100 shrink-0 overflow-hidden relative shadow-sm">
                                    {post.image ? <img src={post.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center"><FileText className="w-5 h-5 text-slate-300" /></div>}
                                    <div className="absolute top-0.5 right-0.5 px-1 py-0.5 rounded bg-black/60 backdrop-blur-md text-[7px] font-black text-white uppercase tracking-widest">
                                      {post.province ? post.province.slice(0, 6) : 'Toàn quốc'}
                                    </div>
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-black text-[#00173a] text-sm leading-tight truncate group-hover:text-[#bb0012] transition-colors">{post.title}</p>
                                    <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase truncate">/{post.slug}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <span className="inline-block px-2 py-1 rounded-lg bg-slate-100 text-[9px] font-black text-[#00173a] uppercase tracking-widest">{post.category || 'Chưa phân loại'}</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {(post.tags || []).slice(0, 2).map(tag => (
                                    <span key={tag} className="text-[8px] font-black text-[#bb0012] uppercase px-1 py-0.5 border border-[#bb0012]/10 rounded">#{tag}</span>
                                  ))}
                                  {(post.tags || []).length > 2 && <span className="text-[8px] font-bold text-slate-400">+{post.tags.length - 2}</span>}
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <div className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[9px] font-black uppercase ${post.status === 'PUBLISHED' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                                  <div className={`w-1.5 h-1.5 rounded-full ${post.status === 'PUBLISHED' ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
                                  {post.status === 'PUBLISHED' ? 'Công khai' : 'Nháp'}
                                </div>
                                <p className="text-[8px] text-slate-400 font-bold mt-1">{new Date(post.createdAt).toLocaleDateString('vi-VN')}</p>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button onClick={() => router.push(`/admin/post/${post.id}/edit`)} className="p-2 rounded-xl bg-white border border-slate-100 text-slate-400 hover:bg-[#00173a] hover:text-white hover:border-[#00173a] transition-all shadow-sm" title="Sửa">
                                    <FileText className="h-3.5 w-3.5" />
                                  </button>
                                  <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm" title="Xem">
                                    <Eye className="h-3.5 w-3.5" />
                                  </a>
                                  <button onClick={() => handleDeletePost(post.id)} className="p-2 rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-sm" title="Xóa">
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>;
            })()}

            {activeTab === 'templates' && <>
              <div className="mb-6"><p className="text-sm font-bold text-slate-500">Chọn công thức bài viết phù hợp. Mỗi công thức có cấu trúc riêng tối ưu cho mục đích cụ thể.</p></div>
              <div className="grid grid-cols-2 gap-8">
                {articleTemplates.map((tpl) => (
                  <div key={tpl.id} className="rounded-[2rem] border-2 border-slate-50 bg-white shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="p-8">
                      <div className="flex items-center gap-4 mb-4">
                        <span className="text-4xl">{tpl.icon}</span>
                        <div>
                          <h3 className="text-xl font-black text-[#00173a] uppercase tracking-tighter">{tpl.name}</h3>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{tpl.sections.length} sections</p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed mb-6">{tpl.description}</p>

                      <div className="mb-6">
                        <p className="text-[10px] font-black text-[#bb0012] uppercase tracking-widest mb-3">Cấu trúc bài viết</p>
                        <div className="space-y-1.5 max-h-64 overflow-y-auto custom-scrollbar">
                          {tpl.sections.map((section, idx) => (
                            <div key={section.id} className="flex items-center gap-2 text-xs">
                              <span className="text-slate-300 font-bold w-5 text-right">{(idx + 1).toString().padStart(2, '0')}</span>
                              <div className={`flex-1 rounded-lg px-3 py-2 font-bold ${section.required ? 'bg-[#fff8f5] text-[#bb0012] border border-[#bb0012]/10' : section.type === 'native-ad' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-slate-50 text-slate-600'}`}>
                                {section.label}
                                {section.required && <span className="ml-1 text-[10px]">*</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mb-6">
                        <p className="text-[10px] font-black text-[#00173a] uppercase tracking-widest mb-3">Mẹo SEO</p>
                        <div className="space-y-2">
                          {tpl.seoTips.slice(0, 3).map((tip, idx) => (
                            <div key={idx} className="flex gap-2 text-xs text-slate-500">
                              <span className="text-green-500 shrink-0">✓</span>
                              <span>{tip}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button onClick={() => { openCreatePost(); }} className="w-full rounded-2xl bg-[#bb0012] px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white hover:opacity-90 transition-opacity">Viết bài</button>
                    </div>
                  </div>
                ))}
              </div>
            </>}

            {activeTab === 'categories' && (
              taxonomyLoading ? (
                <div className="flex h-[60vh] items-center justify-center">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#bb0012]" />
                </div>
              ) : categories.length === 0 ? (
                <div className="flex h-[60vh] flex-col items-center justify-center">
                  <p className="text-xl font-black text-slate-400">Chưa có danh mục nào</p>
                  <button onClick={() => { setEditingCategory({ id: '', name: '', slug: '', icon: '', description: '', order: 0 }); setShowCategoryForm(true); }} className="mt-4 flex items-center gap-3 rounded-2xl bg-[#bb0012] px-6 py-4 text-[11px] font-black uppercase text-white"><Plus className="h-5 w-5" />Thêm danh mục đầu tiên</button>
                </div>
              ) : (
                <><div className="flex justify-end"><button onClick={() => { setEditingCategory({ id: '', name: '', slug: '', icon: '', description: '', order: 0 }); setShowCategoryForm(true); }} className="flex items-center gap-3 rounded-2xl bg-[#bb0012] px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white"><Plus className="h-5 w-5" />Thêm danh mục</button></div><div className="grid grid-cols-4 gap-6">{categories.map((cat) => <div key={cat.id} className="rounded-2xl border-2 border-slate-50 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#00173a] text-white"><Globe className="h-6 w-6" /></div><div className="flex gap-2"><button onClick={() => { setEditingCategory(cat); setShowCategoryForm(true); }} className="rounded-lg bg-slate-50 p-2 text-slate-600"><Settings className="h-4 w-4" /></button><button onClick={() => handleDeleteCategory(cat.id)} className="rounded-lg bg-red-50 p-2 text-red-600"><Trash2 className="h-4 w-4" /></button></div></div><h3 className="mt-4 text-lg font-black text-[#00173a]">{cat.name}</h3><p className="text-sm text-slate-400">{cat._count?.businesses || 0} địa điểm</p></div>)}</div></>
              )
            )}

            {activeTab === 'tags' && (
              taxonomyLoading ? (
                <div className="flex h-[60vh] items-center justify-center">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#bb0012]" />
                </div>
              ) : tags.length === 0 ? (
                <div className="flex h-[60vh] flex-col items-center justify-center">
                  <p className="text-xl font-black text-slate-400">Chưa có tag nào</p>
                  <button onClick={() => { setEditingTag({ id: '', name: '', slug: '' }); setShowTagForm(true); }} className="mt-4 flex items-center gap-3 rounded-2xl bg-[#bb0012] px-6 py-4 text-[11px] font-black uppercase text-white"><Plus className="h-5 w-5" />Thêm tag đầu tiên</button>
                </div>
              ) : (
                <><div className="flex justify-end"><button onClick={() => { setEditingTag({ id: '', name: '', slug: '' }); setShowTagForm(true); }} className="flex items-center gap-3 rounded-2xl bg-[#bb0012] px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white"><Plus className="h-5 w-5" />Thêm tag</button></div><div className="flex flex-wrap gap-3">{tags.map((tag) => <div key={tag.id} className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm"><span className="font-bold text-[#00173a]">{tag.name}</span><span className="text-sm text-slate-400">({tag._count?.posts || 0})</span><button onClick={() => { setEditingTag(tag); setShowTagForm(true); }} className="ml-2 text-slate-400 hover:text-[#bb0012]"><Settings className="h-4 w-4" /></button><button onClick={() => handleDeleteTag(tag.id)} className="text-slate-400 hover:text-red-600"><X className="h-4 w-4" /></button></div>)}</div></>
              )
            )}

            {activeTab === 'industries' && (
              taxonomyLoading ? (
                <div className="flex h-[60vh] items-center justify-center">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#bb0012]" />
                </div>
              ) : industries.length === 0 ? (
                <div className="flex h-[60vh] flex-col items-center justify-center">
                  <p className="text-xl font-black text-slate-400">Chưa có ngành nghề nào</p>
                  <button onClick={() => { setEditingIndustry({ id: '', name: '', slug: '', icon: 'Building', description: '', order: 0 }); setShowIndustryForm(true); }} className="mt-4 flex items-center gap-3 rounded-2xl bg-[#bb0012] px-6 py-4 text-[11px] font-black uppercase text-white"><Plus className="h-5 w-5" />Thêm ngành nghề đầu tiên</button>
                </div>
              ) : (
                <><div className="flex justify-end"><button onClick={() => { setEditingIndustry({ id: '', name: '', slug: '', icon: 'Building', description: '', order: 0 }); setShowIndustryForm(true); }} className="flex items-center gap-3 rounded-2xl bg-[#bb0012] px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white"><Plus className="h-5 w-5" />Thêm ngành nghề</button></div><div className="space-y-3">{industries.map((ind, idx) => <div key={ind.id} className="flex items-center justify-between rounded-2xl border-2 border-slate-50 bg-white p-5 shadow-sm"><div className="flex items-center gap-4"><span className="text-2xl font-black text-slate-200">{(idx + 1).toString().padStart(2, '0')}</span><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#bb0012] text-white"><Briefcase className="h-6 w-6" /></div><div><h3 className="font-black text-[#00173a]">{ind.name}</h3><p className="text-sm text-slate-400">{(ind._count?.businesses || 0) + (ind._count?.posts || 0)} items</p></div></div><div className="flex gap-2"><button onClick={() => { setEditingIndustry(ind); setShowIndustryForm(true); }} className="rounded-lg bg-slate-50 p-2 text-slate-600"><Settings className="h-4 w-4" /></button><button onClick={() => handleDeleteIndustry(ind.id)} className="rounded-lg bg-red-50 p-2 text-red-600"><Trash2 className="h-4 w-4" /></button></div></div>)}</div></>
              )
            )}

            {activeTab === 'locations' && (
              taxonomyLoading ? (
                <div className="flex h-[60vh] items-center justify-center">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#bb0012]" />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-8">
                  <div className="rounded-[2rem] border-2 border-slate-50 bg-white p-8 shadow-sm">
                    <h2 className="text-xl font-black uppercase tracking-tighter text-[#00173a]">Vùng miền</h2>
                    <div className="mt-6 space-y-4">
                      {regions.map((region) => (
                        <div key={region.id} className="rounded-2xl bg-[#fff8f5] p-5">
                          <div className="flex items-center justify-between">
                            <h3 className="font-black text-[#00173a]">{region.name}</h3>
                            <span className="text-sm text-slate-400">{region.provinces?.length || 0} tỉnh</span>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {region.provinces?.slice(0, 8).map((p) => (
                              <span key={p.id} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600">{p.name}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-[2rem] border-2 border-slate-50 bg-white p-8 shadow-sm">
                    <h2 className="text-xl font-black uppercase tracking-tighter text-[#00173a]">Danh sách tỉnh</h2>
                    <div className="mt-6 max-h-[500px] overflow-y-auto space-y-2">
                      {provinceList.map((prov) => (
                        <div key={prov.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
                          <span className="font-bold text-[#00173a]">{prov.name}</span>
                          <span className="text-xs text-slate-400">{prov.region?.name || 'Chưa phân vùng'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            )}

            {activeTab === 'reviews' && <><div className="mb-6 flex items-center gap-4"><select value={reviewFilter.status} onChange={(e) => setReviewFilter({ ...reviewFilter, status: e.target.value })} className="rounded-2xl border-2 border-slate-100 bg-white px-5 py-3 font-bold"><option value="">Tất cả trạng thái</option><option value="PENDING">Chờ duyệt</option><option value="PUBLISHED">Đã duyệt</option><option value="REJECTED">Từ chối</option></select><select value={reviewFilter.rating} onChange={(e) => setReviewFilter({ ...reviewFilter, rating: e.target.value })} className="rounded-2xl border-2 border-slate-100 bg-white px-5 py-3 font-bold"><option value="">Tất cả đánh giá</option><option value="5">5 sao</option><option value="4">4 sao</option><option value="3">3 sao</option><option value="2">2 sao</option><option value="1">1 sao</option></select><button onClick={() => fetchReviews()} className="rounded-2xl bg-[#00173a] px-6 py-3 text-sm font-black text-white">Lọc</button></div><div className="space-y-4 rounded-[2rem] border-2 border-slate-50 bg-white p-6 shadow-sm">{reviews.map((review) => <div key={review.id} className="flex items-start justify-between rounded-2xl border border-slate-100 p-5"><div className="flex gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100"><Building className="h-5 w-5 text-slate-400" /></div><div><div className="flex items-center gap-2"><span className="font-black text-[#00173a]">{review.business?.name}</span><div className="flex">{[...Array(review.rating)].map((_, i) => <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}</div></div><p className="mt-1 text-sm text-slate-600">{review.comment}</p><p className="mt-2 text-xs text-slate-400">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</p></div></div><div className="flex items-center gap-3"><span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${review.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : review.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{review.status}</span><button onClick={() => handleReviewStatus(review.id, 'PUBLISHED')} className="rounded-lg bg-green-50 p-2 text-green-600"><Check className="h-4 w-4" /></button><button onClick={() => handleReviewStatus(review.id, 'REJECTED')} className="rounded-lg bg-red-50 p-2 text-red-600"><X className="h-4 w-4" /></button><button onClick={() => handleDeleteReview(review.id)} className="rounded-lg bg-slate-50 p-2 text-slate-400"><Trash2 className="h-4 w-4" /></button></div></div>)}</div><div className="mt-6 flex items-center justify-between"><button onClick={() => setReviewPagination({ ...reviewPagination, page: Math.max(1, reviewPagination.page - 1) })} disabled={reviewPagination.page <= 1} className="flex items-center gap-2 rounded-2xl border-2 border-slate-100 bg-white px-6 py-3 font-bold disabled:opacity-50"><ChevronLeft className="h-4 w-4" />Trước</button><span className="text-sm font-bold text-slate-500">Trang {reviewPagination.page} / {reviewPagination.totalPages}</span><button onClick={() => setReviewPagination({ ...reviewPagination, page: Math.min(reviewPagination.totalPages, reviewPagination.page + 1) })} disabled={reviewPagination.page >= reviewPagination.totalPages} className="flex items-center gap-2 rounded-2xl border-2 border-slate-100 bg-white px-6 py-3 font-bold disabled:opacity-50">Sau<ChevronRight className="h-4 w-4" /></button></div></>}

            {activeTab === 'users' && <div className="space-y-4 rounded-[2rem] border-2 border-slate-50 bg-white p-6 shadow-sm">{users.map((user) => <div key={user.id} className="flex items-center justify-between rounded-2xl border border-slate-100 p-5"><div className="flex items-center gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff8f5] text-[#bb0012]"><UserRound className="h-5 w-5" /></div><div><p className="font-black text-[#00173a]">{user.name}</p><p className="text-sm text-slate-400">{user.email}</p></div></div><div className="text-right"><p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{user.role}</p><p className="text-sm font-bold text-slate-400">{user.business?.name || 'Chưa gán doanh nghiệp'}</p></div></div>)}</div>}

            {activeTab === 'settings' && (
              <div className="grid grid-cols-[1fr_0.9fr] gap-8">
                <div className="space-y-8">
                  {/* AI Configuration Section */}
                  <div className="rounded-[2rem] border-2 border-violet-100 bg-white p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-100">
                          <Zap className="h-5 w-5" />
                        </div>
                        <div>
                          <h2 className="text-xl font-black uppercase tracking-tighter text-[#00173a]">Cấu hình API Nguồn</h2>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Quản lý API Key, URL và Model của hệ thống</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!isEditingAiSettings ? (
                          <button
                            onClick={() => setIsEditingAiSettings(true)}
                            className="rounded-xl bg-slate-50 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-[#00173a] border border-slate-100 hover:bg-slate-100 transition-all flex items-center gap-2"
                          >
                            <Edit className="h-3 w-3" /> Đổi cấu hình
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={handleCancelAiSettings}
                              className="rounded-xl bg-white px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-100 hover:bg-slate-50 transition-all"
                            >
                              Hủy
                            </button>
                            <button
                              onClick={saveAiSettings}
                              disabled={isSavingSettings}
                              className="rounded-xl bg-violet-600 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-violet-100 hover:bg-violet-700 transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                              {isSavingSettings ? 'Đang lưu...' : <><Save className="h-3 w-3" /> Lưu</>}
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">API URL (OpenAI / Grok / Gemini compatible)</label>
                        <input
                          type="text"
                          value={apiUrl}
                          readOnly={!isEditingAiSettings}
                          onChange={(e) => setApiUrl(e.target.value)}
                          className={`w-full rounded-2xl border-2 px-6 py-4 text-sm font-bold outline-none transition-all ${!isEditingAiSettings
                            ? 'border-slate-50 bg-slate-50/50 text-slate-400 cursor-not-allowed opacity-70'
                            : 'border-slate-100 bg-white focus:border-violet-200 text-[#00173a]'
                            }`}
                          placeholder="https://api.x.ai/v1/chat/completions"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">AI Model</label>
                          <input
                            type="text"
                            value={apiModel}
                            readOnly={!isEditingAiSettings}
                            onChange={(e) => setApiModel(e.target.value)}
                            className={`w-full rounded-2xl border-2 px-6 py-4 text-sm font-bold outline-none transition-all ${!isEditingAiSettings
                              ? 'border-slate-50 bg-slate-50/50 text-slate-400 cursor-not-allowed opacity-70'
                              : 'border-slate-100 bg-white focus:border-violet-200 text-[#00173a]'
                              }`}
                            placeholder="grok-3-mini-fast"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">API Key</label>
                          <div className="relative">
                            <input
                              type="password"
                              value={apiKey}
                              readOnly={!isEditingAiSettings}
                              onChange={(e) => setApiKey(e.target.value)}
                              className={`w-full rounded-2xl border-2 px-6 py-4 text-sm font-bold outline-none transition-all pr-12 ${!isEditingAiSettings
                                ? 'border-slate-50 bg-slate-50/50 text-slate-400 cursor-not-allowed opacity-70'
                                : 'border-slate-100 bg-white focus:border-violet-200 text-[#00173a]'
                                }`}
                              placeholder="sk-..."
                            />
                            <Shield className={`absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${!isEditingAiSettings ? 'text-slate-300' : 'text-violet-400'}`} />
                          </div>
                        </div>
                      </div>
                      <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
                        <p className="text-[10px] font-bold text-amber-600 leading-relaxed uppercase tracking-tighter">
                          *Lưu ý: Hệ thống ưu tiên biến môi trường (.env) trước. Nếu không tìm thấy, hệ thống sẽ sử dụng các giá trị lưu trong Database này.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    {[{ label: 'Newsletter', value: data.stats.newsletters, icon: Mail }, { label: 'Danh mục', value: data.stats.categories, icon: FileText }, { label: 'Địa điểm map', value: data.stats.locations, icon: MapPin }, { label: 'Người dùng', value: data.stats.users, icon: Shield }].map((item) => (
                      <div key={item.label} className="rounded-[2rem] border-2 border-slate-50 bg-white p-8 shadow-sm">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00173a] text-white">
                          <item.icon className="h-6 w-6" />
                        </div>
                        <p className="mt-6 text-4xl font-black tracking-tighter text-[#00173a]">{item.value}</p>
                        <p className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-[2rem] border-2 border-slate-50 bg-white p-8 shadow-sm">
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-[#00173a]">Taxonomy System</h2>
                    <div className="mt-6 space-y-3">
                      {['Categories: Quản lý danh mục địa điểm', 'Tags: Phân loại bài viết', 'Industries: Ngành nghề chuẩn hóa', 'Locations: 63 tỉnh thành + 4 vùng miền', 'Reviews: Duyệt đánh giá người dùng'].map((item) => (
                        <div key={item} className="rounded-2xl bg-[#fff8f5] p-4 text-sm font-bold text-[#00173a]">
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-[2rem] border-2 border-slate-50 bg-white p-8 shadow-sm">
                  <h2 className="text-2xl font-black uppercase tracking-tighter text-[#00173a]">Newsletter subscribers</h2>
                  <div className="mt-6 space-y-3">
                    {subscribers.slice(0, 12).map((item) => (
                      <div key={item.id} className="flex items-center justify-between rounded-2xl border border-slate-100 p-4">
                        <div>
                          <p className="font-black text-[#00173a]">{item.email}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{new Date(item.createdAt).toLocaleDateString('vi-VN')}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${item.status ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                          {item.status ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {showCategoryForm && editingCategory && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#00122e]/90 p-8"><form onSubmit={handleCategorySubmit} className="w-full max-w-lg rounded-[2rem] bg-white p-8 shadow-2xl"><h2 className="text-2xl font-black uppercase tracking-tighter text-[#00173a]">{editingCategory.id ? 'Sửa danh mục' : 'Thêm danh mục'}</h2><div className="mt-6 space-y-4"><input required value={editingCategory.name} onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })} placeholder="Tên danh mục" className="w-full rounded-2xl border-2 border-slate-100 px-5 py-4 font-bold outline-none" /><input value={editingCategory.icon || ''} onChange={(e) => setEditingCategory({ ...editingCategory, icon: e.target.value })} placeholder="Icon (Lucide name)" className="w-full rounded-2xl border-2 border-slate-100 px-5 py-4 font-bold outline-none" /><textarea value={editingCategory.description || ''} onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })} placeholder="Mô tả" rows={3} className="w-full rounded-2xl border-2 border-slate-100 px-5 py-4 font-bold outline-none" /></div><div className="mt-8 flex justify-end gap-4"><button type="button" onClick={() => setShowCategoryForm(false)} className="rounded-2xl bg-slate-50 px-6 py-3 font-bold text-slate-600">Hủy</button><button type="submit" className="rounded-2xl bg-[#bb0012] px-6 py-3 font-black text-white">Lưu</button></div></form></div>}

        {showTagForm && editingTag && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#00122e]/90 p-8"><form onSubmit={handleTagSubmit} className="w-full max-w-lg rounded-[2rem] bg-white p-8 shadow-2xl"><h2 className="text-2xl font-black uppercase tracking-tighter text-[#00173a]">{editingTag.id ? 'Sửa tag' : 'Thêm tag'}</h2><div className="mt-6 space-y-4"><input required value={editingTag.name} onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })} placeholder="Tên tag" className="w-full rounded-2xl border-2 border-slate-100 px-5 py-4 font-bold outline-none" /></div><div className="mt-8 flex justify-end gap-4"><button type="button" onClick={() => setShowTagForm(false)} className="rounded-2xl bg-slate-50 px-6 py-3 font-bold text-slate-600">Hủy</button><button type="submit" className="rounded-2xl bg-[#bb0012] px-6 py-3 font-black text-white">Lưu</button></div></form></div>}

        {showIndustryForm && editingIndustry && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#00122e]/90 p-8"><form onSubmit={handleIndustrySubmit} className="w-full max-w-lg rounded-[2rem] bg-white p-8 shadow-2xl"><h2 className="text-2xl font-black uppercase tracking-tighter text-[#00173a]">{editingIndustry.id ? 'Sửa ngành nghề' : 'Thêm ngành nghề'}</h2><div className="mt-6 space-y-4"><input required value={editingIndustry.name} onChange={(e) => setEditingIndustry({ ...editingIndustry, name: e.target.value })} placeholder="Tên ngành nghề" className="w-full rounded-2xl border-2 border-slate-100 px-5 py-4 font-bold outline-none" /><input required value={editingIndustry.icon} onChange={(e) => setEditingIndustry({ ...editingIndustry, icon: e.target.value })} placeholder="Icon (Lucide name)" className="w-full rounded-2xl border-2 border-slate-100 px-5 py-4 font-bold outline-none" /><textarea value={editingIndustry.description || ''} onChange={(e) => setEditingIndustry({ ...editingIndustry, description: e.target.value })} placeholder="Mô tả" rows={3} className="w-full rounded-2xl border-2 border-slate-100 px-5 py-4 font-bold outline-none" /></div><div className="mt-8 flex justify-end gap-4"><button type="button" onClick={() => setShowIndustryForm(false)} className="rounded-2xl bg-slate-50 px-6 py-3 font-bold text-slate-600">Hủy</button><button type="submit" className="rounded-2xl bg-[#bb0012] px-6 py-3 font-black text-white">Lưu</button></div></form></div>}

        <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }
      `}</style>
      </div>
    </main>
  );
}
