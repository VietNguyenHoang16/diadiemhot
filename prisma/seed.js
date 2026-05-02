require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ==================== INDUSTRIES DATA ====================
const industries = [
  { name: 'Nhà hàng & Ẩm thực', slug: 'nha-hang-am-thuc', icon: 'Utensils', order: 1 },
  { name: 'Spa & Làm đẹp', slug: 'spa-lam-dep', icon: 'Sparkles', order: 2 },
  { name: 'Khách sạn', slug: 'khach-san', icon: 'Hotel', order: 3 },
  { name: 'Cà phê', slug: 'ca-phe', icon: 'Coffee', order: 4 },
  { name: 'Mua sắm', slug: 'mua-sam', icon: 'ShoppingBag', order: 5 },
  { name: 'Du lịch', slug: 'du-lich', icon: 'Plane', order: 6 },
  { name: 'Y tế & Nha khoa', slug: 'y-te-nha-khoa', icon: 'Stethoscope', order: 7 },
  { name: 'Giáo dục', slug: 'giao-duc', icon: 'GraduationCap', order: 8 },
  { name: 'Sửa chữa', slug: 'sua-chua', icon: 'Wrench', order: 9 },
  { name: 'Bán lẻ', slug: 'ban-le', icon: 'Store', order: 10 },
];

// ==================== REGIONS DATA ====================
const regions = [
  { name: 'Miền Bắc', slug: 'mien-bac', order: 1 },
  { name: 'Miền Trung', slug: 'mien-trung', order: 2 },
  { name: 'Miền Nam', slug: 'mien-nam', order: 3 },
  { name: 'Biển & Đảo', slug: 'bien-dao', order: 4 },
];

// ==================== PROVINCES DATA (63 tỉnh) ====================
const provincesData = [
  // Miền Bắc
  { name: 'Hà Nội', code: 'HN', region: 'Miền Bắc' },
  { name: 'Hải Phòng', code: 'HP', region: 'Miền Bắc' },
  { name: 'Quảng Ninh', code: 'QN', region: 'Miền Bắc' },
  { name: 'Ninh Bình', code: 'NB', region: 'Miền Bắc' },
  { name: 'Lào Cai', code: 'LC', region: 'Miền Bắc' },
  { name: 'Sa Pa', code: 'SP', region: 'Miền Bắc' },
  { name: 'Hà Giang', code: 'HG', region: 'Miền Bắc' },
  { name: 'Cao Bằng', code: 'CB', region: 'Miền Bắc' },
  { name: 'Lạng Sơn', code: 'LS', region: 'Miền Bắc' },
  { name: 'Bắc Giang', code: 'BG', region: 'Miền Bắc' },
  { name: 'Bắc Kạn', code: 'BK', region: 'Miền Bắc' },
  { name: 'Thái Nguyên', code: 'TN', region: 'Miền Bắc' },
  { name: 'Phú Thọ', code: 'PT', region: 'Miền Bắc' },
  { name: 'Tuyên Quang', code: 'TQ', region: 'Miền Bắc' },
  { name: 'Yên Bái', code: 'YB', region: 'Miền Bắc' },
  { name: 'Sơn La', code: 'SL', region: 'Miền Bắc' },
  { name: 'Điện Biên', code: 'DB', region: 'Miền Bắc' },
  { name: 'Lai Châu', code: 'LCH', region: 'Miền Bắc' },
  { name: 'Hòa Bình', code: 'HB', region: 'Miền Bắc' },
  { name: 'Hà Nam', code: 'HNA', region: 'Miền Bắc' },
  { name: 'Hưng Yên', code: 'HY', region: 'Miền Bắc' },
  { name: 'Hải Dương', code: 'HD', region: 'Miền Bắc' },
  { name: 'Bắc Ninh', code: 'BN', region: 'Miền Bắc' },
  { name: 'Nam Định', code: 'ND', region: 'Miền Bắc' },
  { name: 'Thái Bình', code: 'TB', region: 'Miền Bắc' },

  // Miền Trung
  { name: 'Đà Nẵng', code: 'DN', region: 'Miền Trung' },
  { name: 'Thừa Thiên Huế', code: 'TTH', region: 'Miền Trung' },
  { name: 'Hội An', code: 'HA', region: 'Miền Trung' },
  { name: 'Nha Trang', code: 'NT', region: 'Miền Trung' },
  { name: 'Đà Lạt', code: 'DL', region: 'Miền Trung' },
  { name: 'Thanh Hóa', code: 'TH', region: 'Miền Trung' },
  { name: 'Nghệ An', code: 'NA', region: 'Miền Trung' },
  { name: 'Hà Tĩnh', code: 'HT', region: 'Miền Trung' },
  { name: 'Quảng Bình', code: 'QB', region: 'Miền Trung' },
  { name: 'Quảng Trị', code: 'QT', region: 'Miền Trung' },
  { name: 'Quảng Nam', code: 'QNM', region: 'Miền Trung' },
  { name: 'Quảng Ngãi', code: 'QNG', region: 'Miền Trung' },
  { name: 'Bình Định', code: 'BD', region: 'Miền Trung' },
  { name: 'Phú Yên', code: 'PY', region: 'Miền Trung' },
  { name: 'Khánh Hòa', code: 'KH', region: 'Miền Trung' },
  { name: 'Ninh Thuận', code: 'NTN', region: 'Miền Trung' },
  { name: 'Bình Thuận', code: 'BT', region: 'Miền Trung' },
  { name: 'Kon Tum', code: 'KT', region: 'Miền Trung' },
  { name: 'Gia Lai', code: 'GL', region: 'Miền Trung' },
  { name: 'Đắk Lắk', code: 'DLK', region: 'Miền Trung' },
  { name: 'Đắk Nông', code: 'DNO', region: 'Miền Trung' },
  { name: 'Lâm Đồng', code: 'LD', region: 'Miền Trung' },

  // Miền Nam
  { name: 'TP. Hồ Chí Minh', code: 'SG', region: 'Miền Nam' },
  { name: 'Cần Thơ', code: 'CT', region: 'Miền Nam' },
  { name: 'Vũng Tàu', code: 'VT', region: 'Miền Nam' },
  { name: 'Phú Quốc', code: 'PQ', region: 'Miền Nam' },
  { name: 'An Giang', code: 'AG', region: 'Miền Nam' },
  { name: 'Bạc Liêu', code: 'BL', region: 'Miền Nam' },
  { name: 'Bến Tre', code: 'BTR', region: 'Miền Nam' },
  { name: 'Bình Dương', code: 'BDU', region: 'Miền Nam' },
  { name: 'Bình Phước', code: 'BP', region: 'Miền Nam' },
  { name: 'Cà Mau', code: 'CM', region: 'Miền Nam' },
  { name: 'Đồng Nai', code: 'DNI', region: 'Miền Nam' },
  { name: 'Đồng Tháp', code: 'DTH', region: 'Miền Nam' },
  { name: 'Hậu Giang', code: 'HGI', region: 'Miền Nam' },
  { name: 'Kiên Giang', code: 'KG', region: 'Miền Nam' },
  { name: 'Long An', code: 'LA', region: 'Miền Nam' },
  { name: 'Sóc Trăng', code: 'ST', region: 'Miền Nam' },
  { name: 'Tây Ninh', code: 'TN', region: 'Miền Nam' },
  { name: 'Tiền Giang', code: 'TG', region: 'Miền Nam' },
  { name: 'Trà Vinh', code: 'TV', region: 'Miền Nam' },
  { name: 'Vĩnh Long', code: 'VL', region: 'Miền Nam' },
  { name: 'Bà Rịa - Vũng Tàu', code: 'BRVT', region: 'Miền Nam' },

  // Biển & Đảo
  { name: 'Hạ Long', code: 'HL', region: 'Biển & Đảo' },
  { name: 'Lý Sơn', code: 'LSO', region: 'Biển & Đảo' },
  { name: 'Côn Đảo', code: 'CD', region: 'Biển & Đảo' },
  { name: 'Phú Quốc', code: 'PQBD', region: 'Biển & Đảo' },
  { name: 'Nha Trang', code: 'NTBD', region: 'Biển & Đảo' },
];

// ==================== SAMPLE TAGS ====================
const sampleTags = [
  { name: 'Nổi Bật', slug: 'noi-bat' },
  { name: 'Mới Nhất', slug: 'moi-nhat' },
  { name: 'Hot Trend', slug: 'hot-trend' },
  { name: 'Review', slug: 'review' },
  { name: 'Khuyến Mãi', slug: 'khuyen-mai' },
  { name: 'Top Rated', slug: 'top-rated' },
  { name: 'Gần Đây', slug: 'gan-day' },
  { name: 'Được Yêu Thích', slug: 'duoc-yeu-thich' },
];

// ==================== SAMPLE CATEGORIES ====================
const sampleCategories = [
  { name: 'Nhà Hàng', slug: 'nha-hang', icon: 'Utensils', order: 1 },
  { name: 'Cà Phê', slug: 'ca-phe', icon: 'Coffee', order: 2 },
  { name: 'Khách Sạn', slug: 'khach-san', icon: 'Hotel', order: 3 },
  { name: 'Spa', slug: 'spa', icon: 'Sparkles', order: 4 },
  { name: 'Mua Sắm', slug: 'mua-sam', icon: 'ShoppingBag', order: 5 },
  { name: 'Du Lịch', slug: 'du-lich', icon: 'Plane', order: 6 },
];

async function main() {
  console.log('🌱 Bắt đầu seed data...\n');

  // 1. Seed Industries
  console.log('🏭 Seed Industries...');
  for (const industry of industries) {
    await prisma.industry.upsert({
      where: { slug: industry.slug },
      update: {},
      create: industry,
    });
  }
  console.log(`✅ Đã tạo ${industries.length} industries\n`);

  // 2. Seed Regions
  console.log('🗺️  Seed Regions...');
  for (const region of regions) {
    await prisma.region.upsert({
      where: { slug: region.slug },
      update: {},
      create: region,
    });
  }
  console.log(`✅ Đã tạo ${regions.length} regions\n`);

  // 3. Seed Provinces (cần regions đã tạo)
  console.log('📍 Seed Provinces (63 tỉnh)...');
  const regionMap = await prisma.region.findMany();
  const regionIdMap = new Map(regionMap.map(r => [r.name, r.id]));

  let provinceCount = 0;
  for (const prov of provincesData) {
    const regionId = regionIdMap.get(prov.region);
    if (regionId) {
      await prisma.province.upsert({
        where: { slug: prov.name.toLowerCase().replace(/\s+/g, '-') },
        update: {},
        create: {
          name: prov.name,
          slug: prov.name.toLowerCase().replace(/\s+/g, '-'),
          code: prov.code,
          regionId: regionId,
        },
      });
      provinceCount++;
    }
  }
  console.log(`✅ Đã tạo ${provinceCount} provinces\n`);

  // 4. Seed Categories
  console.log('📁 Seed Categories...');
  for (const category of sampleCategories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }
  console.log(`✅ Đã tạo ${sampleCategories.length} categories\n`);

  // 5. Seed Tags
  console.log('🏷️  Seed Tags...');
  for (const tag of sampleTags) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    });
  }
  console.log(`✅ Đã tạo ${sampleTags.length} tags\n`);

  console.log('🎉 Seed hoàn tất!');
}

main()
  .catch((e) => {
    console.error('❌ Seed thất bại:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
