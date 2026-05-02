require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const slug = 'top-5-dia-diem-ngam-tuyet-roi-o-mien-bac-viet-nam-dep-nhat';

  const post = await prisma.blogPost.findUnique({
    where: { slug },
    select: { id: true, title: true, slug: true, image: true, status: true, publishedAt: true }
  });

  if (!post) {
    console.log('❌ Post NOT found in DB');
    const allPosts = await prisma.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, title: true, image: true },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    console.log('\n📋 All PUBLISHED posts (last 20):');
    allPosts.forEach(p => console.log(`  - ${p.slug}\n    image: ${p.image || 'NULL'}`));
  } else {
    console.log('✅ Post found:');
    console.log(`  id: ${post.id}`);
    console.log(`  title: ${post.title}`);
    console.log(`  slug: ${post.slug}`);
    console.log(`  image: ${post.image || 'NULL ❌'}`);
    console.log(`  status: ${post.status}`);
    console.log(`  publishedAt: ${post.publishedAt}`);
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });