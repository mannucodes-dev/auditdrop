import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { runAudit } from '@/lib/psi';
import { runCustomChecks, extractBusinessName } from '@/lib/scraper';
import { generateReportId } from '@/lib/reportUtils';
import { publicAuditSchema, sanitizeZodError } from '@/lib/validation';
import { safeError } from '@/lib/apiError';
import { checkRateLimit } from '@/lib/rateLimit';

export const maxDuration = 120;

function generateScreenshotUrl(url: string): string {
  const apiKey = process.env.SCREENSHOTONE_API_KEY;
  if (!apiKey || apiKey === 'REPLACE_ME') {
    return '';
  }

  return `https://api.screenshotone.com/take?access_key=${apiKey}&url=${encodeURIComponent(url)}&viewport_width=1280&viewport_height=800&format=webp&block_ads=true&cache=true&cache_ttl=86400`;
}

export async function POST(request: NextRequest) {
  try {
    // ── IP-based Rate Limit ────────────────────────────────────
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown';

    const rateLimit = checkRateLimit(
      `public:${ip}`,
      3,                    // 3 requests
      60 * 60 * 1000        // per hour
    );

    if (!rateLimit.allowed) {
      const retryAfterSec = Math.ceil(rateLimit.retryAfterMs / 1000);
      return NextResponse.json(
        { error: 'Rate limit exceeded. Try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(retryAfterSec) },
        }
      );
    }

    // ── Input Validation ───────────────────────────────────────
    const body = await request.json();
    const parsed = publicAuditSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: sanitizeZodError(parsed.error) },
        { status: 400 }
      );
    }

    let { url } = parsed.data;
    const { userId } = parsed.data;

    // ── Embed Owner Daily Quota ────────────────────────────────
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const quotaRef = adminDb
      .collection('publicAuditCounts')
      .doc(userId)
      .collection('daily')
      .doc(today);

    const quotaSnap = await quotaRef.get();
    const currentCount = (quotaSnap.data()?.count as number) ?? 0;

    if (currentCount >= 50) {
      return NextResponse.json(
        { error: 'Daily embed quota reached' },
        { status: 429 }
      );
    }

    // Increment counter (merge so the doc is created if it doesn't exist)
    await quotaRef.set(
      { count: FieldValue.increment(1) },
      { merge: true }
    );

    // ── URL Normalization ──────────────────────────────────────
    url = url.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    // ── Run Audit + Scraper in Parallel ────────────────────────
    const [auditResult, scraperResult, businessName] = await Promise.all([
      runAudit(url),
      runCustomChecks(url),
      extractBusinessName(url),
    ]);

    const screenshotUrl = generateScreenshotUrl(url);
    const reportId = generateReportId();

    // ── Save to Firestore ──────────────────────────────────────
    const reportData: Record<string, unknown> = {
      userId,
      source: 'embed',
      businessUrl: url,
      businessName,
      businessCategory: scraperResult.businessCategory || 'general',
      screenshotUrl,
      mobileScore: auditResult.mobileScore,
      desktopScore: auditResult.desktopScore,
      metrics: auditResult.metrics,
      checks: scraperResult.checks,
      seoChecks: scraperResult.seoChecks,
      viewCount: 0,
      lastViewedAt: null,
      createdAt: new Date(),
    };

    await adminDb.collection('reports').doc(reportId).set(reportData);

    // ── Initialize prospect private sub-collection ─────────────
    await adminDb
      .collection('reports')
      .doc(reportId)
      .collection('private')
      .doc('data')
      .set({
        prospectStatus: 'new',
        prospectNotes: '',
        prospectPhone: '',
        lastContactedAt: null,
      });

    return NextResponse.json({ reportId });
  } catch (error) {
    console.error('Public audit error:', error);
    return NextResponse.json(
      { error: safeError(error) },
      { status: 500 }
    );
  }
}
