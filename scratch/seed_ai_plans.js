const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const titles = [
  "Top 10 quán cà phê ngắm hoàng hôn đẹp nhất Hà Nội",
  "Review 5 nhà hàng chay thanh tịnh tại TP.HCM",
  "Cẩm nang du lịch Sa Pa mùa lúa chín 2026",
  "Khám phá vẻ đẹp hoang sơ của đảo Phú Quý",
  "Top 7 địa điểm check-in cực hot tại Đà Lạt 2026",
  "Kinh nghiệm đi tour du thuyền Hạ Long từ A-Z",
  "Những quán ăn sáng ngon nức tiếng ở phố cổ Hội An",
  "Review khu nghỉ dưỡng cao cấp tại Mũi Né cho gia đình",
  "Top 5 bãi biển đẹp nhất Việt Nam bạn nên đến một lần",
  "Khám phá ẩm thực đường phố độc đáo tại Cần Thơ",
  "Top 10 địa điểm du lịch tâm linh nổi tiếng miền Bắc",
  "Review homestay giá rẻ mà chất lượng tại Ninh Bình",
  "Cẩm nang trekking Fansipan cho người mới bắt đầu",
  "Top 5 quán bar rooftop có view đẹp nhất Sài Gòn",
  "Khám phá chợ nổi Cái Răng - Nét văn hóa sông nước miền Tây",
  "Review nhà hàng hải sản tươi ngon giá rẻ tại Đà Nẵng",
  "Top 7 điểm đến lý tưởng cho kỳ nghỉ trăng mật tại Việt Nam",
  "Kinh nghiệm săn mây tại Tà Xùa mùa đông 2026",
  "Những địa điểm vui chơi giải trí cực đỉnh tại Phú Quốc",
  "Review quán cà phê phong cách vintage độc đáo ở Hà Nội",
  "Top 10 đặc sản Việt Nam làm quà biếu ý nghĩa",
  "Khám phá vẻ đẹp kiến trúc của cố đô Huế",
  "Review tour tham quan hang Sơn Đoòng - Trải nghiệm để đời",
  "Top 5 địa điểm camping tuyệt đẹp gần Sài Gòn",
  "Cẩm nang du lịch Hà Giang mùa hoa tam giác mạch",
  "Top 7 quán bún chả ngon đúng điệu tại Hà Nội",
  "Review khu du lịch Tràng An - Di sản văn hóa và thiên nhiên",
  "Khám phá vẻ đẹp kỳ ảo của động Thiên Đường - Quảng Bình",
  "Top 10 quán ốc ngon khó cưỡng tại TP.HCM",
  "Kinh nghiệm đi chợ đêm Đà Lạt không lo bị 'chặt chém'",
  "Review sân golf đẳng cấp quốc tế tại Việt Nam",
  "Top 5 bảo tàng nổi tiếng bạn nên ghé thăm ở Hà Nội",
  "Khám phá làng gốm Bát Tràng - Tinh hoa gốm sứ Việt",
  "Review các quán ăn vặt ngon rẻ ở khu vực Quận 1",
  "Top 7 địa điểm ngắm hoa anh đào đẹp nhất Việt Nam",
  "Kinh nghiệm du lịch tự túc đảo Lý Sơn 3 ngày 2 đêm",
  "Review rạp chiếu phim có trải nghiệm tốt nhất hiện nay",
  "Top 10 công viên xanh mát giữa lòng thủ đô",
  "Khám phá vẻ đẹp huyền bí của thánh địa Mỹ Sơn",
  "Review quán phở gia truyền nổi tiếng nhất Hà Nội",
  "Top 5 địa điểm tổ chức team building gần Hà Nội",
  "Kinh nghiệm đi du lịch Đà Nẵng mùa lễ hội pháo hoa",
  "Review spa làm đẹp chuyên nghiệp tại Đồng Xoài",
  "Top 7 cung đường phượt đẹp nhất Việt Nam cho biker",
  "Khám phá nét độc đáo trong ẩm thực người Thái ở Tây Bắc",
  "Review khách sạn 5 sao có dịch vụ tốt nhất tại Nha Trang",
  "Top 10 địa điểm chụp ảnh cưới đẹp như mơ tại Việt Nam",
  "Kinh nghiệm đi thác Bản Giốc mùa nước đổ",
  "Review quán bánh mì ngon nhất thế giới tại Hội An",
  "Top 5 địa điểm ngắm tuyết rơi ở miền Bắc Việt Nam"
];

async function main() {
  const count = await prisma.aiPostPlan.count();
  if (count > 0) {
    console.log(`Database already has ${count} plans. Skipping seed.`);
    return;
  }

  console.log('Seeding 50 AI post titles...');
  for (const title of titles) {
    await prisma.aiPostPlan.create({
      data: { title, status: 'PENDING' }
    });
  }
  console.log('Done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
