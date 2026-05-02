'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Building, Eye, Star, MessageSquare, Edit, BarChart3, Settings, LogOut, Bell, ExternalLink, Clock, MapPin, Phone, Mail, Globe, Zap, X, Save } from 'lucide-react';

interface BusinessData {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  facebook: string | null;
  zalo: string | null;
  openingHours: string | null;
  status: string;
  featured: boolean;
  views: number;
  rating: number;
  reviewCount: number;
  location: {
    name: string;
    fullAddress: string | null;
    province: string | null;
    district: string | null;
  } | null;
  reviews: {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
  }[];
}

export default function Dashboard() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    facebook: '',
    zalo: '',
    openingHours: '',
  });

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/dang-nhap');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    async function fetchBusiness() {
      if (user?.businessId) {
        try {
          const res = await fetch(`/api/dashboard?businessId=${user.businessId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.id) {
              setBusiness(data);
              setFormData({
                name: data.name || '',
                description: data.description || '',
                address: data.address || '',
                phone: data.phone || '',
                email: data.email || '',
                website: data.website || '',
                facebook: data.facebook || '',
                zalo: data.zalo || '',
                openingHours: data.openingHours || '',
              });
            }
          }
        } catch (e) {
          console.error(e);
        }
      }
      setLoading(false);
    }
    if (user?.businessId) {
      fetchBusiness();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleSave = async () => {
    console.log('handleSave called. User:', user);
    setSaving(true);
    try {
      const url = user?.businessId 
        ? `/api/dashboard?businessId=${user.businessId}`
        : '/api/dashboard';
        
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const updated = await res.json();
      console.log('Update result:', updated);
      
      if (updated.id) {
        setBusiness(updated);
        setEditing(false);
        alert('Cập nhật thành công!');
        
        // If it was a first-time creation, refresh to update session data
        if (!user?.businessId) {
          window.location.reload();
        }
      } else {
        alert('Cập nhật thất bại: ' + (updated.error || 'Unknown error'));
      }
    } catch (e) {
      console.error('Save error:', e);
      alert('Có lỗi xảy ra khi lưu thông tin.');
    }
    setSaving(false);
  };

  if (isLoading || loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-[#bb0012] rounded-full animate-spin"></div>
      </div>
    );
  }

  const stats = business ? [
    { label: 'Lượt xem', value: (business.views ?? 0).toLocaleString(), icon: Eye, change: '' },
    { label: 'Đánh giá', value: (business.reviewCount ?? 0).toString(), icon: Star, change: (business.rating ?? 0) > 0 ? `${(business.rating ?? 0).toFixed(1)} ★` : '' },
    { label: 'Bình luận', value: (business.reviews?.length ?? 0).toString(), icon: MessageSquare, change: '' },
  ] : [
    { label: 'Lượt xem', value: '0', icon: Eye, change: '' },
    { label: 'Đánh giá', value: '0', icon: Star, change: '' },
    { label: 'Bình luận', value: '0', icon: MessageSquare, change: '' },
  ];

  const reviews = business?.reviews?.map(r => ({
    user: 'Khách hàng',
    rating: r.rating,
    text: r.comment || '',
    date: new Date(r.createdAt).toLocaleDateString('vi-VN'),
  })) || [];

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-[#00173a] text-white">
        <div className="max-w-screen-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-xl font-black uppercase">Địa Điểm Hot</div>
            <span className="text-xs bg-[#bb0012] px-2 py-1 rounded">Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" className="text-sm hover:text-white/80">Xem trang web</a>
            <button onClick={() => logout()} className="flex items-center gap-2 text-sm hover:text-white/80">
              <LogOut className="w-4 h-4" /> Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-screen-2xl mx-auto px-4 py-8">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center text-2xl font-black text-[#00173a]">
                {business?.name?.[0] || user?.businessName?.[0] || 'B'}
              </div>
              <div>
                <h1 className="text-2xl font-black text-[#00173a]">{business?.name || user?.businessName || 'Doanh nghiệp của bạn'}</h1>
                <p className="text-slate-600">{user?.name}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-0.5 text-xs font-bold rounded ${business?.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : business?.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {business?.status === 'ACTIVE' ? 'Đã duyệt' : business?.status === 'REJECTED' ? 'Từ chối' : 'Chờ duyệt'}
                  </span>
                  <span className="text-xs text-slate-500">ID: {business?.id || user?.businessId}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setEditing(!editing)} 
              className="px-4 py-2 bg-[#bb0012] text-white rounded-lg font-medium flex items-center gap-2 hover:opacity-90"
            >
              <Edit className="w-4 h-4" /> {editing ? 'Hủy' : 'Cập nhật hồ sơ'}
            </button>
          </div>
          
          {editing ? (
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tên doanh nghiệp</label>
                  <input 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Số điện thoại</label>
                  <input 
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Địa chỉ</label>
                  <input 
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Giờ mở cửa</label>
                  <input 
                    value={formData.openingHours}
                    onChange={e => setFormData({...formData, openingHours: e.target.value})}
                    placeholder="6:00 - 22:00"
                    className="w-full px-3 py-2 border rounded-lg" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Website</label>
                  <input 
                    value={formData.website}
                    onChange={e => setFormData({...formData, website: e.target.value})}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 border rounded-lg" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Facebook</label>
                  <input 
                    value={formData.facebook}
                    onChange={e => setFormData({...formData, facebook: e.target.value})}
                    placeholder="facebook.com/yourpage"
                    className="w-full px-3 py-2 border rounded-lg" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Zalo</label>
                  <input 
                    value={formData.zalo}
                    onChange={e => setFormData({...formData, zalo: e.target.value})}
                    placeholder="zalo.me/yourpage"
                    className="w-full px-3 py-2 border rounded-lg" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mô tả</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg" 
                />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-green-700 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
                <button 
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-medium flex items-center gap-2 hover:bg-slate-300"
                >
                  <X className="w-4 h-4" /> Hủy
                </button>
              </div>
            </div>
          ) : (
            <>
              {business?.description && (
                <p className="mt-4 text-slate-600">{business.description}</p>
              )}
              {(business?.address || business?.location?.fullAddress) && (
                <div className="mt-2 flex items-center gap-2 text-slate-500 text-sm">
                  <MapPin className="w-4 h-4" />
                  {business.location?.fullAddress || business.address}
                </div>
              )}
              {business?.phone && (
                <div className="mt-1 flex items-center gap-2 text-slate-500 text-sm">
                  <Phone className="w-4 h-4" />
                  {business.phone}
                </div>
              )}
              {business?.email && (
                <div className="mt-1 flex items-center gap-2 text-slate-500 text-sm">
                  <Mail className="w-4 h-4" />
                  {business.email}
                </div>
              )}
              {business?.openingHours && (
                <div className="mt-1 flex items-center gap-2 text-slate-500 text-sm">
                  <Clock className="w-4 h-4" />
                  {business.openingHours}
                </div>
              )}
            </>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="w-5 h-5 text-slate-400" />
                <span className="text-xs text-green-600 font-medium">{stat.change}</span>
              </div>
              <div className="text-2xl font-black text-[#00173a]">{stat.value}</div>
              <div className="text-sm text-slate-600">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Review Section */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black text-[#00173a] uppercase">Đánh giá gần đây</h2>
                <a href="#" className="text-sm text-[#bb0012] font-medium">Xem tất cả</a>
              </div>
              <div className="space-y-4">
                {reviews.length > 0 ? reviews.map((review, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-[#00173a]">{review.user}</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{review.text}</p>
                    <span className="text-xs text-slate-400">{review.date}</span>
                  </div>
                )) : (
                  <p className="text-slate-500 text-center py-4">Chưa có đánh giá nào</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Featured Status */}
            <div className="bg-gradient-to-br from-[#bb0012] to-[#00173a] text-white rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-6 h-6" />
                <span className="font-bold">Featured</span>
              </div>
              {business?.featured ? (
                <p className="text-sm text-white/80 mb-4">Doanh nghiệp của bạn đang được hiển thị nổi bật!</p>
              ) : (
                <>
                  <p className="text-sm text-white/80 mb-4">Nâng cấp lên Featured để tiếp cận nhiều khách hàng hơn</p>
                  <button className="w-full py-2 bg-white text-[#bb0012] rounded-lg font-medium hover:bg-white/90">
                    Đăng ký Featured
                  </button>
                </>
              )}
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-black text-[#00173a] uppercase mb-4">Liên kết nhanh</h2>
              <div className="space-y-2">
                <a href="#" className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-[#bb0012] hover:text-white transition-colors">
                  <span className="font-medium">Xem trang đánh giá</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
                <a href="#" className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-[#bb0012] hover:text-white transition-colors">
                  <span className="font-medium">Cài đặt</span>
                  <Settings className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}