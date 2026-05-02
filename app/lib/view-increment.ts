import { prisma } from './db';

/**
 * Time-based view increment tiers
 * Increments decrease as post ages
 *
 * Days 1-2:   +10-15 views/hour (strong start)
 * Days 3-4:   +8-12 views/hour
 * Days 5-7:   +5-8 views/hour   (~1000 views by end of week)
 * Week 2:     +3-5 views/hour
 * Weeks 3-4:  +1-3 views/hour
 * Month 2+:   +0-2 views/hour   (slow, natural growth)
 */
interface ViewTier {
  days: number;      // Days since published
  minIncrement: number;
  maxIncrement: number;
  chance: number;    // Probability of increment (0-1)
}

const VIEW_TIERS: ViewTier[] = [
  { days: 0, minIncrement: 10, maxIncrement: 15, chance: 0.95 },   // Days 1-2
  { days: 2, minIncrement: 8, maxIncrement: 12, chance: 0.90 },    // Days 3-4
  { days: 4, minIncrement: 5, maxIncrement: 8, chance: 0.85 },    // Days 5-7
  { days: 7, minIncrement: 3, maxIncrement: 5, chance: 0.80 },     // Week 2
  { days: 14, minIncrement: 1, maxIncrement: 3, chance: 0.70 },   // Weeks 3-4
  { days: 30, minIncrement: 0, maxIncrement: 2, chance: 0.60 },    // Month 2+
];

/**
 * Calculate days since post was published
 */
function getDaysSincePublished(publishedAt: Date | null): number {
  if (!publishedAt) return 0;
  const now = new Date();
  const diffTime = now.getTime() - new Date(publishedAt).getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get appropriate tier based on days since published
 */
function getTier(days: number): ViewTier {
  // Find the highest tier that matches (descending order)
  for (let i = VIEW_TIERS.length - 1; i >= 0; i--) {
    if (days >= VIEW_TIERS[i].days) {
      return VIEW_TIERS[i];
    }
  }
  return VIEW_TIERS[0];
}

/**
 * Calculate view increment for a post
 */
export function calculateViewIncrement(publishedAt: Date | null): number {
  const days = getDaysSincePublished(publishedAt);
  const tier = getTier(days);

  // Random chance to skip increment
  if (Math.random() > tier.chance) {
    return 0;
  }

  // Random increment within tier range
  return Math.floor(Math.random() * (tier.maxIncrement - tier.minIncrement + 1)) + tier.minIncrement;
}

/**
 * Increment views for all published posts
 * Run this every hour via cron
 */
export async function incrementBlogViews(): Promise<{ updated: number; skipped: number }> {
  // Get all published posts
  const posts = await prisma.blogPost.findMany({
    where: {
      status: 'PUBLISHED',
      publishedAt: { not: null }
    },
    select: {
      id: true,
      publishedAt: true
    },
  });

  let updated = 0;
  let skipped = 0;

  // Update each post with calculated increment
  for (const post of posts) {
    const increment = calculateViewIncrement(post.publishedAt);

    if (increment > 0) {
      await prisma.blogPost.update({
        where: { id: post.id },
        data: { views: { increment } },
      });
      updated++;
    } else {
      skipped++;
    }
  }

  console.log(`[View Increment] Updated: ${updated}, Skipped: ${skipped}`);
  return { updated, skipped };
}

/**
 * Get expected views after X days (for estimation)
 */
export function estimateViewsAfterDays(days: number): number {
  let totalViews = 0;
  const hoursPerDay = 24;

  for (let day = 0; day < days; day++) {
    const tier = getTier(day);
    // Average increment per hour
    const avgIncrement = (tier.minIncrement + tier.maxIncrement) / 2;
    // Expected views for this day
    const dayViews = avgIncrement * hoursPerDay * tier.chance;
    totalViews += dayViews;
  }

  return Math.round(totalViews);
}

// Quick estimation
// Day 7: ~1000 views
// Day 14: ~1500 views
// Day 30: ~2200 views
// Day 60: ~2800 views
