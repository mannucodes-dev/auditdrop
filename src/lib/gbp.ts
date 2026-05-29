/**
 * Google Business Profile (GBP) audit via Google Places API.
 *
 * Checks profile completeness, rating, review count, photos, hours, etc.
 * Gracefully degrades if GOOGLE_PLACES_API_KEY is not set.
 */

export interface GBPIssue {
  title: string;
  body: string;
  impact: 'High' | 'Medium' | 'Low';
}

export interface GBPAudit {
  found: boolean;
  rating: number | null;
  reviewCount: number | null;
  hasPhotos: boolean;
  photoCount: number;
  hasHours: boolean;
  hasPhone: boolean;
  hasWebsite: boolean;
  hasDescription: boolean;
  profileCompleteness: number; // 0-100
  reputationScore: number; // 0-100
  issues: GBPIssue[];
}

const TIMEOUT_MS = 8_000;

function emptyAudit(): GBPAudit {
  return {
    found: false,
    rating: null,
    reviewCount: null,
    hasPhotos: false,
    photoCount: 0,
    hasHours: false,
    hasPhone: false,
    hasWebsite: false,
    hasDescription: false,
    profileCompleteness: 0,
    reputationScore: 0,
    issues: [],
  };
}

/** Fetch with an 8-second AbortController timeout. */
async function fetchWithTimeout(
  url: string,
  signal?: AbortSignal
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  // Link external signal if provided
  if (signal?.aborted) {
    controller.abort();
  }

  try {
    const res = await fetch(url, { signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Run a GBP completeness audit for a business.
 *
 * @param businessName - The name of the business to search for
 * @param city - The city where the business is located
 * @returns GBPAudit result — never throws
 */
export async function runGBPAudit(
  businessName: string,
  city: string
): Promise<GBPAudit> {
  try {
    // ── Check API key ──────────────────────────────────────────
    const key = process.env.GOOGLE_PLACES_API_KEY;
    if (!key || key === 'REPLACE_ME') {
      console.log('[GBP] GOOGLE_PLACES_API_KEY not configured — skipping audit');
      return emptyAudit();
    }

    // ── Find Place ─────────────────────────────────────────────
    const searchInput = encodeURIComponent(`${businessName} ${city}`);
    const findUrl =
      `https://maps.googleapis.com/maps/api/place/findplacefromtext/json` +
      `?input=${searchInput}&inputtype=textquery&fields=place_id&key=${key}`;

    const findRes = await fetchWithTimeout(findUrl);
    if (!findRes.ok) {
      console.error(`[GBP] Find place HTTP ${findRes.status}`);
      return emptyAudit();
    }

    const findData = (await findRes.json()) as {
      candidates?: Array<{ place_id: string }>;
    };

    const placeId = findData.candidates?.[0]?.place_id;
    if (!placeId) {
      console.log('[GBP] No place found for:', businessName, city);
      return emptyAudit();
    }

    // ── Place Details ──────────────────────────────────────────
    const detailFields = [
      'name',
      'rating',
      'user_ratings_total',
      'photos',
      'opening_hours',
      'formatted_phone_number',
      'website',
      'editorial_summary',
    ].join(',');

    const detailsUrl =
      `https://maps.googleapis.com/maps/api/place/details/json` +
      `?place_id=${placeId}&fields=${detailFields}&key=${key}`;

    const detailsRes = await fetchWithTimeout(detailsUrl);
    if (!detailsRes.ok) {
      console.error(`[GBP] Place details HTTP ${detailsRes.status}`);
      return emptyAudit();
    }

    const detailsData = (await detailsRes.json()) as {
      result?: {
        name?: string;
        rating?: number;
        user_ratings_total?: number;
        photos?: Array<unknown>;
        opening_hours?: { open_now?: boolean };
        formatted_phone_number?: string;
        website?: string;
        editorial_summary?: { overview?: string };
      };
    };

    const place = detailsData.result;
    if (!place) {
      console.log('[GBP] No result in place details response');
      return emptyAudit();
    }

    // ── Parse fields ───────────────────────────────────────────
    const rating = place.rating ?? null;
    const reviewCount = place.user_ratings_total ?? null;
    const hasPhotos = Array.isArray(place.photos) && place.photos.length > 0;
    const photoCount = Array.isArray(place.photos) ? place.photos.length : 0;
    const hasHours = !!place.opening_hours;
    const hasPhone = !!place.formatted_phone_number;
    const hasWebsite = !!place.website;
    const hasDescription = !!place.editorial_summary?.overview;

    // ── Profile Completeness (0-100) ───────────────────────────
    const expectedFields = [
      rating !== null,
      reviewCount !== null && reviewCount > 0,
      hasPhotos,
      hasHours,
      hasPhone,
      hasWebsite,
      hasDescription,
    ];
    const presentCount = expectedFields.filter(Boolean).length;
    const profileCompleteness = Math.round(
      (presentCount / expectedFields.length) * 100
    );

    // ── Reputation Score (0-100) ───────────────────────────────
    // Rating weight: 60%, Review count weight: 40%
    const ratingScore =
      rating !== null ? Math.min((rating / 5) * 100, 100) : 0;
    // Scale review count: 0 reviews = 0, 50+ reviews = 100
    const reviewScore =
      reviewCount !== null
        ? Math.min((reviewCount / 50) * 100, 100)
        : 0;
    const reputationScore = Math.round(ratingScore * 0.6 + reviewScore * 0.4);

    // ── Generate Issues ────────────────────────────────────────
    const issues: GBPIssue[] = [];

    if (!hasHours) {
      issues.push({
        title: 'No business hours listed',
        body: 'Your Google profile doesn\'t show opening hours. Customers can\'t tell when you\'re open, so they may choose a competitor instead.',
        impact: 'High',
      });
    }

    if (rating !== null && rating < 4.0) {
      issues.push({
        title: 'Low rating (below 4.0)',
        body: `Your Google rating is ${rating}/5. Most customers skip businesses rated below 4 stars. Focus on improving customer experience and asking satisfied customers for reviews.`,
        impact: 'High',
      });
    }

    if (reviewCount !== null && reviewCount < 10) {
      issues.push({
        title: 'Less than 10 reviews',
        body: `You have only ${reviewCount} review${reviewCount === 1 ? '' : 's'}. Businesses with more reviews rank higher in local search and look more trustworthy.`,
        impact: 'Medium',
      });
    }

    if (!hasPhotos) {
      issues.push({
        title: 'No photos uploaded',
        body: 'Your Google profile has no photos. Listings with photos get 42% more direction requests and 35% more website clicks.',
        impact: 'Medium',
      });
    }

    if (!hasPhone) {
      issues.push({
        title: 'No phone number',
        body: 'No phone number is listed on your Google profile. Customers who want to call you have no way to reach you directly.',
        impact: 'High',
      });
    }

    if (!hasWebsite) {
      issues.push({
        title: 'No website linked',
        body: 'Your Google profile doesn\'t link to a website. You\'re missing out on visitors who want to learn more before visiting.',
        impact: 'Medium',
      });
    }

    if (!hasDescription) {
      issues.push({
        title: 'No business description',
        body: 'Your Google profile has no description. A clear description helps customers understand what you offer and improves search visibility.',
        impact: 'Low',
      });
    }

    return {
      found: true,
      rating,
      reviewCount,
      hasPhotos,
      photoCount,
      hasHours,
      hasPhone,
      hasWebsite,
      hasDescription,
      profileCompleteness,
      reputationScore,
      issues,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[GBP] Audit failed:', msg);
    return emptyAudit();
  }
}
