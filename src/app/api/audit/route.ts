import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { runAudit } from '@/lib/psi';
import { runCustomChecks, extractBusinessName } from '@/lib/scraper';
import { generateReportId } from '@/lib/reportUtils';
import { auditSchema, sanitizeZodError } from '@/lib/validation';
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
    // ── Auth ─────────────────────────────────────────────────
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch {
      return NextResponse.json(
        { error: 'Invalid or expired authentication token.' },
        { status: 401 }
      );
    }

    const userId = decodedToken.uid;

    // ── Rate Limit ──────────────────────────────────────────
    const rateLimit = checkRateLimit(
      `audit:${userId}`,
      10,                      // 10 audits
      60 * 60 * 1000           // per hour
    );

    if (!rateLimit.allowed) {
      const retryAfterSec = Math.ceil(rateLimit.retryAfterMs / 1000);
      return NextResponse.json(
        { error: 'Rate limit exceeded. Try again in 1 hour.' },
        {
          status: 429,
          headers: { 'Retry-After': String(retryAfterSec) },
        }
      );
    }

    // ── Input Validation ────────────────────────────────────
    const body = await request.json();
    const parsed = auditSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: sanitizeZodError(parsed.error) },
        { status: 400 }
      );
    }

    let { url } = parsed.data;
    const competitorUrls = parsed.data.competitors || [];
    const businessNameOverride = parsed.data.businessName;
    const city = parsed.data.city;

    // ── URL Normalization ───────────────────────────────────
    url = url.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    // Normalize competitor URLs
    const normalizedCompetitors: string[] = [];
    for (const cUrl of competitorUrls) {
      let normalized = cUrl.trim();
      if (!normalized) continue;
      if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
        normalized = 'https://' + normalized;
      }
      try {
        new URL(normalized);
        normalizedCompetitors.push(normalized);
      } catch {
        // Skip invalid competitor URLs silently
      }
    }

    // ── Run Audit ───────────────────────────────────────────
    const [auditResult, scraperResult, businessName] = await Promise.all([
      runAudit(url),
      runCustomChecks(url),
      extractBusinessName(url),
    ]);

    const screenshotUrl = generateScreenshotUrl(url);
    const reportId = generateReportId();

    // Use override name if provided, otherwise use auto-detected
    const finalBusinessName = businessNameOverride?.trim() || businessName;

    // ── Competitor Audits (parallel) ────────────────────────
    const competitors = await Promise.all(
      normalizedCompetitors.map(async (compUrl) => {
        try {
          const [compAudit, compScraper, compName] = await Promise.all([
            runAudit(compUrl),
            runCustomChecks(compUrl),
            extractBusinessName(compUrl),
          ]);
          return {
            url: compUrl,
            businessName: compName,
            mobileScore: compAudit.mobileScore,
            desktopScore: compAudit.desktopScore,
            checks: compScraper.checks,
            seoChecks: compScraper.seoChecks,
          };
        } catch (err) {
          console.error(`Competitor audit failed for ${compUrl}:`, err);
          return null;
        }
      })
    );

    const validCompetitors = competitors.filter(
      (c): c is NonNullable<typeof c> => c !== null
    );

    // ── Save to Firestore ───────────────────────────────────
    const reportData: Record<string, unknown> = {
      userId,
      businessUrl: url,
      businessName: finalBusinessName,
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

    if (validCompetitors.length > 0) {
      reportData.competitors = validCompetitors;
    }

    // Store city for GBP lookup context
    if (city) {
      reportData.city = city;
    }

    await adminDb.collection('reports').doc(reportId).set(reportData);

    // ── Initialize prospect private sub-collection ──────────
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

    return NextResponse.json({
      reportId,
      businessName: finalBusinessName,
      mobileScore: auditResult.mobileScore,
      desktopScore: auditResult.desktopScore,
    });
  } catch (error) {
    console.error('Audit error:', error);
    return NextResponse.json(
      { error: safeError(error) },
      { status: 500 }
    );
  }
}
