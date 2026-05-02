/**
 * Auto-calculated views based on time since publication
 * NO database updates needed - calculated real-time on each page load
 *
 * Tiers (views per day):
 * Days 1-2:   300-360 views/day (10-15 views/hour)
 * Days 3-4:   240-288 views/day (8-12 views/hour)
 * Days 5-7:   150-192 views/day (5-8 views/hour)
 * Week 2:     90-120 views/day (3-5 views/hour)
 * Weeks 3-4:  30-72 views/day (1-3 views/hour)
 * Month 2+:   0-48 views/day (0-2 views/hour)
 */

interface ViewTier {
  days: number;        // Days since published
  viewsPerDay: number; // Average views per day
}

const VIEW_TIERS: ViewTier[] = [
  { days: 0, viewsPerDay: 330 },   // Days 1-2: avg 330/day
  { days: 2, viewsPerDay: 264 },   // Days 3-4: avg 264/day
  { days: 4, viewsPerDay: 171 },   // Days 5-7: avg 171/day
  { days: 7, viewsPerDay: 105 },   // Week 2: avg 105/day
  { days: 14, viewsPerDay: 51 },   // Weeks 3-4: avg 51/day
  { days: 30, viewsPerDay: 24 },  // Month 2+: avg 24/day
];

/**
 * Get appropriate tier for given day
 */
function getTier(day: number): ViewTier {
  for (let i = VIEW_TIERS.length - 1; i >= 0; i--) {
    if (day >= VIEW_TIERS[i].days) {
      return VIEW_TIERS[i];
    }
  }
  return VIEW_TIERS[0];
}

/**
 * Calculate total expected views since published
 */
export function calculateExpectedViews(publishedAt: Date | null | undefined): number {
  if (!publishedAt) return 0;

  const now = new Date();
  const published = new Date(publishedAt);
  const diffTime = now.getTime() - published.getTime();
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (totalDays <= 0) return 0;

  let totalViews = 0;

  // Calculate views for each day
  for (let day = 0; day < totalDays; day++) {
    const tier = getTier(day);
    // Add randomness: +/- 20% variation
    const variation = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
    totalViews += Math.round(tier.viewsPerDay * variation);
  }

  return totalViews;
}

/**
 * Get seed views for a newly published post
 * Based on time of day (to look natural)
 */
export function getSeedViews(): number {
  const hour = new Date().getHours();

  // If published in morning: 50-150 views
  // If published in afternoon: 100-300 views
  // If published at night: 20-80 views
  if (hour >= 6 && hour < 12) {
    return Math.floor(Math.random() * 100) + 50; // 50-150
  } else if (hour >= 12 && hour < 18) {
    return Math.floor(Math.random() * 200) + 100; // 100-300
  } else {
    return Math.floor(Math.random() * 60) + 20; // 20-80
  }
}

/**
 * Estimate views at a specific day milestone
 * For display/verification purposes
 */
export function estimateViewsAtDay(day: number): number {
  let totalViews = 0;

  for (let d = 0; d < day; d++) {
    const tier = getTier(d);
    totalViews += tier.viewsPerDay;
  }

  return totalViews;
}

// Estimates:
// Day 7: ~1,500 views
// Day 14: ~2,200 views
// Day 30: ~3,000 views
// Day 60: ~3,700 views
// Day 90: ~4,400 views
