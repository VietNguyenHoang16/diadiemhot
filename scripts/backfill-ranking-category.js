/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();

const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const RANKING_CATEGORY = 'Xếp Hạng';
const RANKING_SLUG = 'xep-hang';
const TITLE_KEYWORDS = ['top', 'xếp hạng', 'tốt nhất', 'hay nhất', 'đáng đi nhất', 'đứng đầu'];

function normalizeVietnameseText(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function isCanonicalRankingCategory(category) {
  return normalizeVietnameseText(category) === normalizeVietnameseText(RANKING_CATEGORY);
}

function matchReasons(post) {
  const reasons = [];
  const normalizedTitle = normalizeVietnameseText(post.title);
  const hasTitleKeyword = TITLE_KEYWORDS.some((keyword) =>
    normalizedTitle.includes(normalizeVietnameseText(keyword))
  );

  if (hasTitleKeyword) reasons.push('title-keyword');
  if (isCanonicalRankingCategory(post.category) && post.category !== RANKING_CATEGORY) reasons.push('legacy-category');

  return reasons;
}

async function ensureRankingCategory(prisma, apply) {
  const existing = await prisma.category.findFirst({
    where: {
      OR: [{ name: RANKING_CATEGORY }, { slug: RANKING_SLUG }],
    },
    orderBy: { createdAt: 'asc' },
  });

  if (!existing) {
    if (!apply) {
      return { action: 'would-create', record: { name: RANKING_CATEGORY, slug: RANKING_SLUG } };
    }

    const created = await prisma.category.create({
      data: {
        name: RANKING_CATEGORY,
        slug: RANKING_SLUG,
        description: 'Danh mục dành riêng cho các bài viết dạng top, danh sách và xếp hạng.',
        order: 999,
      },
    });

    return { action: 'created', record: created };
  }

  if (existing.name !== RANKING_CATEGORY || existing.slug !== RANKING_SLUG) {
    if (!apply) {
      return {
        action: 'would-normalize',
        record: { id: existing.id, fromName: existing.name, fromSlug: existing.slug, toName: RANKING_CATEGORY, toSlug: RANKING_SLUG },
      };
    }

    const updated = await prisma.category.update({
      where: { id: existing.id },
      data: { name: RANKING_CATEGORY, slug: RANKING_SLUG },
    });

    return { action: 'normalized', record: updated };
  }

  return { action: 'unchanged', record: existing };
}

async function main() {
  const apply = process.argv.includes('--apply');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
    console.log(apply ? 'Running ranking category backfill in APPLY mode...' : 'Running ranking category backfill in DRY-RUN mode...');

    const categoryResult = await ensureRankingCategory(prisma, apply);
    console.log('Category action:', JSON.stringify(categoryResult, null, 2));

    const posts = await prisma.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        slug: true,
        title: true,
        category: true,
      },
    });

    const matches = posts
      .map((post) => {
        const reasons = matchReasons(post);
        const alreadyCanonical = post.category === RANKING_CATEGORY;

        if (reasons.length === 0 || alreadyCanonical) {
          return null;
        }

        return { ...post, reasons };
      })
      .filter(Boolean);

    if (matches.length === 0) {
      console.log('No published posts need to be moved to the ranking category.');
      return;
    }

    console.log(`Matched ${matches.length} published post(s):`);
    for (const post of matches) {
      console.log(`- [${post.category || 'NO_CATEGORY'}] ${post.slug} :: ${post.title} (${post.reasons.join(', ')})`);
    }

    if (!apply) {
      console.log('Dry-run only. Re-run with --apply to update these posts.');
      return;
    }

    for (const post of matches) {
      await prisma.blogPost.update({
        where: { id: post.id },
        data: { category: RANKING_CATEGORY },
      });
    }

    console.log(`Updated ${matches.length} published post(s) to category "${RANKING_CATEGORY}".`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error('Backfill failed:', error);
  process.exit(1);
});
