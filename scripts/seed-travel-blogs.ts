import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, PostStatus } from '@prisma/client';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const blogPosts = [
  {
    title: 'Khám Phá Hà Nội Trong 3 Ngày',
    slug: 'kham-pha-ha-noi-trong-3-ngay',
    excerpt: 'Hướng dẫn chi tiết khám phá thủ đô Hà Nội trong 3 ngày 2 đêm - từ phố cổ đến những điểm check-in hot nhất.',
    content: `<!--province:Hà Nội-->
<h2>Ngày 1: Khám Phá Phố Cổ Và Hoàn Kiếm</h2>
<p>Bắt đầu hành trình tại Hồ Hoàn Kiếm, biểu tượng của thủ đô. Đi bộ quanh hồ vào buổi sáng sớm để cảm nhận không khí thanh bình. Đừng quên ghé thăm Đền Ngọc Sơn và cầu Thê Húc.</p>

<figure class="cms-figure">
  <img src="https://images.unsplash.com/photo-1529655683826-7429f5891c07?w=1200&h=800&fit=crop" alt="Hồ Hoàn Kiếm Hà Nội" class="cms-image" />
</figure>

<p>Chiều đến Phố Cổ - nơi lưu giữ nét văn hóa truyền thống. Thưởng thức phở, bún chả, cà phê trứng tại những quán xá cổ kính.</p>

<h2>Ngày 2: Lăng Bác Và Bảo Tàng</h2>
<p>Sáng sớm xếp hàng vào Lăng Chủ tịch Hồ Chí Minh. Sau đó thăm Nhà sàn, Ao cá và Chùa Một Cột.</p>

<figure class="cms-figure">
  <img src="https://images.unsplash.com/photo-1545282973-1424d6e3664c?w=1200&h=800&fit=crop" alt="Chùa Một Cột Hà Nội" class="cms-image" />
</figure>

<p>Chiều ghé Bảo tàng Dân tộc học hoặc Hoàng thành Thăng Long để hiểu thêm về lịch sử Việt Nam.</p>

<h2>Ngày 3: Café Và Mua Sắm</h2>
<p>Khám phá các quán cafe đẹp tại Hà Nội: The Note Coffee, Cafe Dinh, Cafe Phố Cổ. Tối mua sắm tại chợ Đồng Xuân.</p>`,
    image: 'https://images.unsplash.com/photo-1529655683826-7429f5891c07?w=800&h=600&fit=crop',
    category: 'Du Lịch',
    status: PostStatus.PUBLISHED,
    author: 'Địa Điểm Hot',
  },
  {
    title: 'Đà Nẵng - Huế - Hội An: Hành Trình Di Sản',
    slug: 'da-nang-hue-hoi-an',
    excerpt: '4 ngày khám phá 3 miền di sản miền Trung - từ biển Mỹ Khê đến Cố Đô Huế và phố Hội lung linh.',
    content: `<!--province:Đà Nẵng-->
<h2>Đà Nẵng: Thành Phố Đáng Sống</h2>
<p>Bắt đầu từ cầu Rồng phun lửa vào tối thứ 7. Tắm biển Mỹ Khê - một trong những bãi biển đẹp nhất hành tinh.</p>

<figure class="cms-figure">
  <img src="https://images.unsplash.com/photo-1555400038-63f09ba573fb?w=1200&h=800&fit=crop" alt="Cầu Rồng Đà Nẵng" class="cms-image" />
</figure>

<p>Lên Bà Nà Hills check-in Cầu Vàng - cây cầu đôi bàn tay độc đáo giữa không trung.</p>

<h2>Huế: Kinh Đô Cổ Kính</h2>
<p>Tham quan Đại Nội, lăng Minh Mạng, lăng Tự Đức. Thưởng thức ẩm thực cung đình: bánh bèo, bánh nậm, bánh lọc.</p>

<figure class="cms-figure">
  <img src="https://images.unsplash.com/photo-1528127269322-539801943592?w=1200&h=800&fit=crop" alt="Lăng Minh Mạng Huế" class="cms-image" />
</figure>

<h2>Hội An: Phố Cổ Lung Linh</h2>
<p>Đi thuyền sông Hoài, thả đèn hoa đăng. Check-in chùa Cầu Nhật Bản - biểu tượng của Hội An.</p>`,
    image: 'https://images.unsplash.com/photo-1555400038-63f09ba573fb?w=800&h=600&fit=crop',
    category: 'Du Lịch',
    status: PostStatus.PUBLISHED,
    author: 'Địa Điểm Hot',
  },
  {
    title: 'Phú Quốc - Thiên Đường Biển Đảo',
    slug: 'phu-quoc-thien-duong-bien-dao',
    excerpt: 'Trải nghiệm biển đảo tuyệt vời tại đảo ngọc Phú Quốc - từ bãi Sao đến chợ đêm và nhà thùng nước mắm.',
    content: `<!--province:Kiên Giang-->
<h2>Ngày 1: Bãi Sao Và Câu Cá</h2>
<p>Bãi Sao với cát trắng mịn như kem và nước biển xanh ngọc. Đây là bãi biển đẹp nhất Phú Quốc.</p>

<figure class="cms-figure">
  <img src="https://images.unsplash.com/photo-1528127269322-539801943592?w=1200&h=800&fit=crop" alt="Bãi Sao Phú Quốc" class="cms-image" />
</figure>

<p>Chiều đi câu cá và lặn ngắm san hô ở Hòn Móng Tay hoặc Hòn Gầm Ghì.</p>

<h2>Ngày 2: Nam Đảo Và Nhà Tù</h2>
<p>Tham quan nhà tù Phú Quốc - di tích lịch sử đặc biệt. Sau đó đến cách Mạch, bãi Khem.</p>

<figure class="cms-figure">
  <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=800&fit=crop" alt="Hoàng hôn Phú Quốc" class="cms-image" />
</figure>

<p>Hoàng hôn tại Sunset Sanato - nơi có những tác phẩm nghệ thuật độc đáo trên bãi biển.</p>

<h2>Ngày 3: Chợ Đêm Và Nước Mắm</h2>
<p>Tham quan nhà thùng nước mắm Phú Quốc nổi tiếng. Tối khám phá chợ đêm Dinh Cậu với hải sản tươi ngon.</p>`,
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&h=600&fit=crop',
    category: 'Du Lịch',
    status: PostStatus.PUBLISHED,
    author: 'Địa Điểm Hot',
  },
  {
    title: '48 Giờ Ở Hà Nội: Hướng Dẫn Chi Tiết',
    slug: '48-gio-o-ha-noi',
    excerpt: 'Lịch trình tối ưu cho 48 giờ tại thủ đô - từ món ăn đường phố đến những góc sống ảo cực chất.',
    content: `<!--province:Hà Nội-->
<h2>Ngày 1: Sáng</h2>
<p>6:00 - Phở Gia Truyền Bát Đàn: Bát phở gà truyền thống nóng hổi bắt đầu ngày mới.</p>
<p>8:00 - Hồ Hoàn Kiếm: Đi bộ quanh hồ, uống cà phê phố cổ.</p>

<figure class="cms-figure">
  <img src="https://images.unsplash.com/photo-1529655683826-7429f5891c07?w=1200&h=800&fit=crop" alt="Phố cổ Hà Nội" class="cms-image" />
</figure>

<h2>Ngày 1: Chiều Tối</h2>
<p>15:00 - Lăng Bác: Thăm viếng Chủ tịch Hồ Chí Minh.</p>
<p>18:00 - Bún Chả Hương Liên: Nơi Tổng thống Obama từng ghé ăn.</p>
<p>20:00 - Phố đi bộ: Khám phá đêm Hà Nội nhộn nhịp.</p>

<figure class="cms-figure">
  <img src="https://images.unsplash.com/photo-1533050487297-09b450131914?w=1200&h=800&fit=crop" alt="Bún chả Hà Nội" class="cms-image" />
</figure>

<h2>Ngày 2: Coffee Và Shopping</h2>
<p>Sáng: Cafe Nhà, Loading T, The Note Coffee - những quán cafe đẹp nhất Hà Nội.</p>
<p>Chiều: Nhà thờ Lớn, Nhà hát Lớn, phố Nhà Thờ.</p>`,
    image: 'https://images.unsplash.com/photo-1529655683826-7429f5891c07?w=800&h=600&fit=crop',
    category: 'Du Lịch',
    status: PostStatus.PUBLISHED,
    author: 'Địa Điểm Hot',
  },
  {
    title: 'InterContinental Hanoi Westlake - Review Chi Tiết',
    slug: 'intercontinental-hanoi-westlake-review',
    excerpt: 'Trải nghiệm 5 sao tại khách sạn sang trọng bên Hồ Tây - từ phòng nghỉ đến dịch vụ đẳng cấp.',
    content: `<!--province:Hà Nội-->
<h2>Vị Trí Và Không Gian</h2>
<p>InterContinental Hanoi Westlake nằm bên bờ Hồ Tây lãng mạn, cách Phố Cổ chỉ 15 phút lái xe. Khách sạn mang kiến trúc kết hợp hiện đại và truyền thống.</p>

<figure class="cms-figure">
  <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945a?w=1200&h=800&fit=crop" alt="InterContinental Hanoi Westlake" class="cms-image" />
</figure>

<h2>Phòng Nghỉ</h2>
<p>Phòng Deluxe Lake View rộng 42m² với ban công nhìn ra Hồ Tây. Nội thất gỗ ấm áp, giường King-size êm ái, phòng tắm marble sang trọng.</p>

<figure class="cms-figure">
  <img src="https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&h=800&fit=crop" alt="Phòng khách sạn view Hồ Tây" class="cms-image" />
</figure>

<h2>Ẩm Thực Và Dịch Vụ</h2>
<p>Nhà hàng Sunset Bar nổi tiếng với cocktail hoàng hôn. Bể bơi vô cực view hồ, spa cao cấp Milestone.</p>

<p><strong>Đánh giá:</strong> 4.8/5 - Đáng đồng tiền bát gạo cho kỳ nghỉ sang trọng tại Hà Nội.</p>`,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945a?w=800&h=600&fit=crop',
    category: 'Review',
    status: PostStatus.PUBLISHED,
    author: 'Địa Điểm Hot',
  },
  {
    title: 'Six Senses Ninh Van Bay - Khu Nghỉ Dưỡng Đẳng Cấp',
    slug: 'six-senses-ninh-van-bay-review',
    excerpt: 'Review chi tiết khu nghỉ dưỡng 5 sao tại Nha Trang - thiên đường nghỉ dưỡng biệt lập.',
    content: `<!--province:Khánh Hòa-->
<h2>Trải Nghiệm Độc Đáo</h2>
<p>Six Senses Ninh Van Bay nằm biệt lập trên vịnh Ninh Vân, chỉ có thể đến bằng thuyền. Khu nghỉ dưỡng giữ nguyên vẻ hoang sơ tuyệt đẹp.</p>

<figure class="cms-figure">
  <img src="https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&h=800&fit=crop" alt="Six Senses Ninh Van Bay" class="cms-image" />
</figure>

<h2>Villa Riêng Tư</h2>
<p>Rock Pool Villa nằm trên đồi đá với hồ bơi riêng view biển. Thiết kế mở hòa mình vào thiên nhiên.</p>

<figure class="cms-figure">
  <img src="https://images.unsplash.com/photo-1520250497591-112f2f40a9f4?w=1200&h=800&fit=crop" alt="Villa view biển" class="cms-image" />
</figure>

<h2>Dịch Vụ Xuất Sắc</h2>
<p>Butler phục vụ 24/7, nhà hàng Dining by the Bay với hải sản tươi ngon. Spa chuẩn Six Senses quốc tế.</p>

<p><strong>Giá:</strong> Từ 8.500.000 VNĐ/đêm
<br/><strong>Đánh giá:</strong> 4.9/5 - Trải nghiệm nghỉ dưỡng đỉnh cao tại Việt Nam.</p>`,
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&h=600&fit=crop',
    category: 'Review',
    status: PostStatus.PUBLISHED,
    author: 'Địa Điểm Hot',
  },
];

async function seedBlogPosts() {
  for (const post of blogPosts) {
    const existing = await prisma.blogPost.findUnique({
      where: { slug: post.slug },
    });
    
    if (!existing) {
      await prisma.blogPost.create({
        data: {
          ...post,
          publishedAt: new Date(),
        },
      });
      console.log(`Created: ${post.title}`);
    } else {
      console.log(`Already exists: ${post.title}`);
    }
  }
}

seedBlogPosts()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });