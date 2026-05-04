'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, MapPin, Calendar, Plane, Hotel, Utensils, Camera, Mountain, Waves } from 'lucide-react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import ContactForm from '@/app/components/ContactForm';

type BlogPost = {
  id: string;
  title: string;
  excerpt?: string;
  image?: string;
  category?: string;
  slug: string;
  createdAt: string;
};

const DEMO_DESTINATIONS = [
  {
    title: 'Khám Phá Hà Nội Trong 3 Ngày',
    description: 'Hướng dẫn chi tiết khám phá thủ đô Hà Nội trong 3 ngày 2 đêm',
    image: 'https://images.unsplash.com/photo-1529655683826-7429f5891c07?w=800&h=600&fit=crop',
    location: 'Hà Nội',
    duration: '3 ngày',
    level: 'Dễ',
    slug: 'kham-pha-ha-noi-trong-3-ngay',
  },
  {
    title: 'Đà Nẵng - Huế - Hội An',
    description: 'Hành trình khám phá 3 miền di sản miền Trung',
    image: 'https://images.unsplash.com/photo-1555400038-63f09ba573fb?w=800&h=600&fit=crop',
    location: 'Miền Trung',
    duration: '4 ngày',
    level: 'Trung bình',
    slug: 'da-nang-hue-hoi-an',
  },
  {
    title: 'Phú Quốc - Thiên Đường Biển Đảo',
    description: 'Trải nghiệm biển đảo tuyệt vời tại đảo ngọc Phú Quốc',
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&h=600&fit=crop',
    location: 'Phú Quốc',
    duration: '3 ngày',
    level: 'Dễ',
    slug: 'phu-quoc-thien-duong-bien-dao',
  },
];

export default function DuLich() {
  const [selectedRegion, setSelectedRegion] = useState('Miền Bắc');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [hotelPosts, setHotelPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const destinations = posts.length > 0
    ? posts.slice(0, 3).map(p => ({
        title: p.title,
        description: p.excerpt || '',
        image: p.image || 'https://images.unsplash.com/photo-1506929562872-bb03ffa7f88c?w=800&h=600&fit=crop',
        location: 'Việt Nam',
        duration: '3 ngày',
        level: 'Dễ',
        slug: p.slug,
      }))
    : DEMO_DESTINATIONS;

  const travelGuides = posts.length > 0
    ? posts.slice(3, 7).map(p => ({
        title: p.title,
        icon: 'map',
        description: p.excerpt || '',
        link: `/blog/${p.slug}`,
      }))
    : [
        { title: '48 Giờ Ở Hà Nội: Hướng Dẫn Địa Điểm', icon: 'map', description: 'Khám phá tất cả địa điểm quan trọng tại Hà Nội', link: '/blog/48-gio-o-ha-noi' },
        { title: 'Các Tuyến Đường Đẹp Để Khám Phá', icon: 'directions_walk', description: 'Những tuyến đường trekking nổi tiếng Việt Nam', link: '/blog/tuyen-duong-dep-kham-pha' },
        { title: 'Mùa Mưa Ở Việt Nam: Khi Nào Du Lịch Tốt Nhất?', icon: 'calendar', description: 'Lịch mùa du lịch các vùng miền', link: '/blog/mua-mua-o-viet-nam' },
        { title: 'Hướng Dẫn Di Chuyển Bằng Xe Buýt', icon: 'directions_bus', description: 'Di chuyển tiết kiệm trong thành phố', link: '/blog/huong-dan-xe-buyt' },
      ];

  useEffect(() => {
    async function fetchPosts() {
      try {
        const [travelRes, hotelRes] = await Promise.all([
          fetch('/api/blog?category=Du%20lịch%20%26%20Khám%20phá'),
          fetch('/api/blog'),
        ]);
        if (travelRes.ok) {
          const data = (await travelRes.json()) as BlogPost[];
          setPosts(data);
        }
        if (hotelRes.ok) {
          const data = (await hotelRes.json()) as BlogPost[];
          // Filter for hotel-related posts
          const hotelKeywords = ['khách sạn', 'hotel', 'resort', 'nghỉ dưỡng', 'homestay'];
          const filtered = data.filter(post => {
            const titleLower = post.title.toLowerCase();
            const categoryLower = (post.category || '').toLowerCase();
            return hotelKeywords.some(k => titleLower.includes(k) || categoryLower.includes(k));
          });
          setHotelPosts(filtered.length > 0 ? filtered : data.slice(0, 3));
        }
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    }
    void fetchPosts();
  }, []);

  const handleRegionClick = (regionName: string) => {
    setSelectedRegion(regionName);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/blog?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleProvinceFilter = (province: string) => {
    setSelectedProvince(province);
    window.location.href = `/blog?province=${encodeURIComponent(province)}`;
  };

  const hotels = [
    {
      name: 'InterContinental Hanoi Westlake',
      location: 'Hà Nội',
      rating: 4.8,
      price: '5.000.000 VNĐ/đêm',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945a?w=500&h=400&fit=crop',
    },
    {
      name: 'SIXSenses Ninh Van Bay',
      location: 'Nha Trang',
      rating: 4.9,
      price: '8.500.000 VNĐ/đêm',
      image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=500&h=400&fit=crop',
    },
    {
      name: 'Four Seasons Resort Danang',
      location: 'Đà Nẵng',
      rating: 4.7,
      price: '6.200.000 VNĐ/đêm',
      image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a9f4?w=500&h=400&fit=crop',
    },
  ];

  const tips = [
    { title: 'Mẹo tiết kiệm chi phí du lịch', icon: '💰' },
    { title: 'Chọn khách sạn tốt', icon: '🏨' },
    { title: 'Di chuyển nội thành', icon: '🚌' },
    { title: 'Đồ ăn đường phố', icon: '🍜' },
    { title: 'An toàn khi đi phượt', icon: '⛑️' },
    { title: 'Máy ảnh du lịch', icon: '📷' },
  ];

  const regions = [
    { name: 'Miền Bắc', count: 45, provinces: ['Hà Nội', 'Hải Phòng', 'Quảng Ninh', 'Ninh Bình', 'Sapa'] },
    { name: 'Miền Trung', count: 38, provinces: ['Đà Nẵng', 'Huế', 'Hội An', 'Nha Trang', 'Đà Lạt'] },
    { name: 'Miền Nam', count: 52, provinces: ['TP. Hồ Chí Minh', 'Cần Thơ', 'Vũng Tàu', 'Phú Quốc', 'Mekong'] },
    { name: 'Biển & Đảo', count: 28, provinces: ['Phú Quốc', 'Nha Trang', 'Hạ Long', 'Lý Sơn', 'Côn Đảo'] },
  ];

  return (
    <main className="min-h-screen bg-white">
      <Header showNewsTicker={true} activeLink="du-lich" />

      <div className="mx-auto max-w-screen-2xl overflow-x-clip px-4 pb-16 pt-28 sm:px-6 lg:px-8 lg:pt-32">
        <div className="grid grid-cols-12 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="col-span-12 min-w-0 space-y-12 lg:col-span-9">
            {/* Hero Section */}
            <section className="relative min-h-[32rem] overflow-hidden rounded-2xl sm:min-h-[30rem] lg:h-96 lg:min-h-0">
              <img alt="Du lịch" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1506929562872-bb03ffa7f88c?w=1200&h=600&fit=crop" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#00173a]/80 to-transparent"></div>
              <div className="absolute bottom-0 w-full p-6 sm:p-8 lg:p-12">
                <h1 className="text-5xl font-black text-white uppercase tracking-tighter mb-4">Du Lịch</h1>
                <p className="text-xl text-white/80 mb-6">Khám phá những địa điểm du lịch tuyệt vời tại Việt Nam</p>
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <select
                    value={selectedProvince}
                    onChange={(e) => setSelectedProvince(e.target.value)}
                    className="w-full cursor-pointer rounded-lg bg-white px-4 py-3 font-bold text-[#00173a] sm:w-auto"
                  >
                    <option value="">Tất cả tỉnh/thành</option>
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                    <option value="Hải Phòng">Hải Phòng</option>
                    <option value="Cần Thơ">Cần Thơ</option>
                    <option value="Huế">Huế</option>
                    <option value="Nha Trang">Nha Trang</option>
                    <option value="Đà Lạt">Đà Lạt</option>
                    <option value="Hội An">Hội An</option>
                    <option value="Sa Pa">Sa Pa</option>
                    <option value="Quảng Ninh">Quảng Ninh</option>
                    <option value="Phú Quốc">Phú Quốc</option>
                    <option value="Vũng Tàu">Vũng Tàu</option>
                  </select>
                  <input
                    className="min-w-0 flex-1 rounded-lg bg-white px-4 py-3 text-[#00173a]"
                    placeholder="Tìm kiếm địa điểm..."
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <button
                    onClick={handleSearch}
                    className="w-full rounded-lg bg-[#bb0012] px-6 py-3 font-bold uppercase text-white transition-all hover:opacity-90 active:scale-95 sm:w-auto"
                  >
                    Tìm
                  </button>
                </div>
              </div>
            </section>

            {/* Regions */}
            <section className="flex flex-wrap gap-3">
              {regions.map((region, idx) => (
                <button
                  key={idx}
                  onClick={() => handleRegionClick(region.name)}
                  className={`px-6 py-3 rounded-full text-sm font-bold uppercase tracking-widest transition-all duration-200 ${selectedRegion === region.name ? 'bg-[#00173a] text-white shadow-lg' : 'bg-slate-100 text-slate-700 hover:bg-[#bb0012] hover:text-white'}`}
                >
                  {region.name} ({region.count})
                </button>
              ))}
            </section>

            {/* Featured Destinations */}
            <section>
              <h2 className="text-2xl font-black text-[#00173a] uppercase tracking-tighter mb-8 border-l-4 border-[#bb0012] pl-4">
                {loading ? 'Đang tải...' : posts.length > 0 ? 'Bài Viết Nổi Bật' : 'Điểm Đến Nổi Bật'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {destinations.map((dest, idx) => (
                  <Link
                    key={idx}
                    href={`/blog/${dest.slug}`}
                    className="group rounded-lg overflow-hidden shadow-sm border border-slate-200 hover:shadow-lg transition-shadow"
                  >
                    <div className="relative overflow-hidden">
                      <img alt={dest.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" src={dest.image} />
                      <div className="absolute top-3 right-3 bg-white/90 px-2 py-1 rounded text-xs font-bold">
                        {dest.level}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                        <MapPin className="w-3 h-3" />
                        <span>{dest.location}</span>
                        <span>•</span>
                        <Calendar className="w-3 h-3" />
                        <span>{dest.duration}</span>
                      </div>
                      <h3 className="text-base font-bold text-[#00173a] mb-2 group-hover:text-[#bb0012] transition-colors">{dest.title}</h3>
                      <p className="text-sm text-slate-600">{dest.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* Travel Guides */}
            {travelGuides.length > 0 && (
              <section>
                <h2 className="text-2xl font-black text-[#00173a] uppercase tracking-tighter mb-8 border-l-4 border-[#bb0012] pl-4">Hướng Dẫn Du Lịch</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {travelGuides.map((guide, idx) => (
                    <Link
                      key={idx}
                      href={guide.link}
                      className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg hover:bg-[#bb0012] hover:text-white transition-all duration-200 group"
                    >
                      <div className="w-12 h-12 bg-[#00173a] text-white rounded-lg flex items-center justify-center text-xl font-bold group-hover:bg-white group-hover:text-[#bb0012] transition-colors">
                        📍
                      </div>
                      <div>
                        <h4 className="font-bold text-[#00173a] group-hover:text-white mb-1">{guide.title}</h4>
                        <p className="text-sm text-slate-600 group-hover:text-white/80">{guide.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Top Hotels */}
            <section>
              <h2 className="text-2xl font-black text-[#00173a] uppercase tracking-tighter mb-8 border-l-4 border-[#bb0012] pl-4">Khách Sạn Nổi Bật</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {hotelPosts.length > 0
                  ? hotelPosts.slice(0, 3).map((hotel, idx) => (
                      <Link
                        key={idx}
                        href={`/blog/${hotel.slug}`}
                        className="group rounded-lg overflow-hidden shadow-sm border border-slate-200 hover:shadow-lg transition-shadow"
                      >
                        <img alt={hotel.title} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500" src={hotel.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945a?w=500&h=400&fit=crop'} />
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-[#00173a] group-hover:text-[#bb0012]">{hotel.title}</h4>
                            <span className="text-xs font-bold text-[#bb0012]">★ Mới</span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>{hotel.excerpt?.slice(0, 30) || 'Khách sạn'}</span>
                          </div>
                        </div>
                      </Link>
                    ))
                  : hotels.map((hotel, idx) => (
                      <Link
                        key={idx}
                        href={`/blog?category=Khách%20sạn&province=${encodeURIComponent(hotel.location)}`}
                        className="group rounded-lg overflow-hidden shadow-sm border border-slate-200 hover:shadow-lg transition-shadow"
                      >
                        <img alt={hotel.name} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500" src={hotel.image} />
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-[#00173a] group-hover:text-[#bb0012]">{hotel.name}</h4>
                            <span className="text-xs font-bold text-[#bb0012]">★ {hotel.rating}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>{hotel.location}</span>
                            <span className="font-bold text-[#00173a]">{hotel.price}</span>
                          </div>
                        </div>
                      </Link>
                    ))
                }
              </div>
            </section>
          </div>

          {/* Right Sidebar */}
          <aside className="col-span-12 min-w-0 space-y-8 lg:col-span-3">
            {/* Search */}
            <section className="bg-slate-100 p-6 rounded-lg">
              <h2 className="text-sm font-black text-[#00173a] uppercase tracking-widest mb-4">Tìm Kiếm</h2>
              <div className="space-y-3">
                <select className="w-full bg-white border border-slate-300 rounded p-3 text-sm">
                  <option value="">Tất cả tỉnh/thành</option>
                  <option value="hanoi">Hà Nội</option>
                  <option value="hochiminh">TP. Hồ Chí Minh</option>
                  <option value="danang">Đà Nẵng</option>
                  <option value="haiphong">Hải Phòng</option>
                  <option value="cantho">Cần Thơ</option>
                  <option value="hue">Huế</option>
                  <option value="nhatrang">Nha Trang</option>
                  <option value="dalat">Đà Lạt</option>
                  <option value="hoian">Hội An</option>
                  <option value="sapa">Sa Pa</option>
                  <option value="quangninh">Quảng Ninh</option>
                  <option value="phuquoc">Phú Quốc</option>
                  <option value="vungtau">Vũng Tàu</option>
                  <option value="dongnai">Đồng Nai</option>
                  <option value="binhphuoc">Bình Phước</option>
                  <option value="tayninh">Tây Ninh</option>
                  <option value="longan">Long An</option>
                  <option value="tiengiang">Tiền Giang</option>
                  <option value="dongthap">Đồng Tháp</option>
                  <option value="vinhlong">Vĩnh Long</option>
                  <option value="bentret">Bến Tre</option>
                  <option value="travinh">Trà Vinh</option>
                  <option value="soctrang">Sóc Trăng</option>
                  <option value="baclieu">Bạc Liêu</option>
                  <option value="camau">Cà Mau</option>
                  <option value="kiengiang">Kiên Giang</option>
                  <option value="haugiang">Hậu Giang</option>
                  <option value="namdinh">Nam Định</option>
                  <option value="ninhbinh">Ninh Bình</option>
                  <option value="thanhhoa">Thanh Hóa</option>
                  <option value="nghean">Nghệ An</option>
                  <option value="hatinh">Hà Tĩnh</option>
                  <option value="quangbinh">Quảng Bình</option>
                  <option value="quangtri">Quảng Trị</option>
                  <option value="quangnam">Quảng Nam</option>
                  <option value="quangngai">Quảng Ngãi</option>
                  <option value="binhdinh">Bình Định</option>
                  <option value="phuyen">Phú Yên</option>
                  <option value="khanhhoa">Khánh Hòa</option>
                  <option value="ninhthuan">Ninh Thuận</option>
                  <option value="binhthuan">Bình Thuận</option>
                  <option value="lamdong">Lâm Đồng</option>
                  <option value="daklak">Đắk Lắk</option>
                  <option value="kontum">Kon Tum</option>
                  <option value="gialai">Gia Lai</option>
                  <option value="dienbien">Điện Biên</option>
                  <option value="laichau">Lai Châu</option>
                  <option value="sonla">Sơn La</option>
                  <option value="hoabinh">Hòa Bình</option>
                  <option value="yenbai">Yên Bái</option>
                  <option value="thainguyen">Thái Nguyên</option>
                  <option value="phutho">Phú Thọ</option>
                  <option value="bacninh">Bắc Ninh</option>
                  <option value="bacgiang">Bắc Giang</option>
                  <option value="caobang">Cao Bằng</option>
                  <option value="langson">Lạng Sơn</option>
                  <option value="backhan">Bắc Kạn</option>
                  <option value="tuyenchinh">Tuyên Quang</option>
                  <option value="hanam">Hà Nam</option>
                  <option value="thaibinh">Thái Bình</option>
                  <option value="hungyen">Hưng Yên</option>
                  <option value="haiduong">Hải Dương</option>
                  <option value="baria">Bà Rịa - Vũng Tàu</option>
                </select>
                <input className="w-full bg-white border border-slate-300 rounded p-3 text-sm" placeholder="Tìm kiếm..." type="text" />
                <button className="w-full bg-[#bb0012] text-white font-bold text-xs uppercase tracking-widest py-3 rounded hover:opacity-90">Tìm Kiếm</button>
              </div>
            </section>

            {/* Travel Tips */}
            <section>
              <h2 className="text-sm font-black text-[#00173a] uppercase tracking-widest mb-4">Mẹo Du Lịch</h2>
              <div className="flex flex-wrap gap-2">
                {tips.map((tip, idx) => (
                  <Link
                    key={idx}
                    href={`/blog?search=${encodeURIComponent(tip.title)}`}
                    className="px-3 py-2 bg-slate-100 rounded text-sm hover:bg-[#bb0012] hover:text-white transition-all duration-200"
                  >
                    {tip.icon} {tip.title}
                  </Link>
                ))}
              </div>
            </section>

            {/* Featured Places */}
            <section>
              <h2 className="text-sm font-black text-[#00173a] uppercase tracking-widest mb-4">Địa Điểm Nổi Bật</h2>
              <div className="space-y-3">
                {[
                  { name: 'Hà Nội', count: 45 },
                  { name: 'TP. Hồ Chí Minh', count: 52 },
                  { name: 'Đà Nẵng', count: 38 },
                  { name: 'Huế', count: 28 },
                  { name: 'Hội An', count: 22 },
                  { name: 'Nha Trang', count: 25 },
                  { name: 'Phú Quốc', count: 18 },
                  { name: 'Đà Lạt', count: 20 },
                ].map((place) => (
                  <button
                    key={place.name}
                    onClick={() => handleProvinceFilter(place.name)}
                    className="flex items-center justify-between w-full p-3 bg-slate-100 rounded hover:bg-[#bb0012] hover:text-white transition-all duration-200"
                  >
                    <span className="text-sm font-bold">{place.name}</span>
                    <span className="text-xs opacity-60">{place.count}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Newsletter */}
            <section className="bg-[#bb0012] text-white p-6 rounded-lg">
              <h2 className="text-lg font-black uppercase tracking-tighter mb-2">Du Lịch Giá Scooter</h2>
              <p className="text-xs text-white/80 mb-4">Nhận deals du lịch hot nhất</p>
              <ContactForm buttonText="Đăng Ký" />
            </section>
          </aside>
        </div>
      </div>

      <Footer />
    </main>
  );
}
