import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { runAudit } from '@/lib/psi';
import { runCustomChecks } from '@/lib/scraper';
import { generateReportId } from '@/lib/reportUtils';

export const maxDuration = 120;

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)));
}

async function extractBusinessName(url: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AuditDropBot/1.0)',
      },
    });
    clearTimeout(timeout);

    const html = await response.text();
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);

    if (titleMatch?.[1]) {
      let title = decodeHtmlEntities(titleMatch[1].trim());
      title = title.replace(/\s*[-|–—]\s*(Home|Homepage|Welcome).*$/i, '');
      title = title.replace(/\s*[-|–—]\s*$/, '');
      return title.substring(0, 100) || new URL(url).hostname;
    }

    return new URL(url).hostname;
  } catch {
    try {
      return new URL(url).hostname;
    } catch {
      return 'Unknown';
    }
  }
}

function generateScreenshotUrl(url: string): string {
  const apiKey = process.env.SCREENSHOTONE_API_KEY;
  if (!apiKey || apiKey === 'REPLACE_ME') {
    return '';
  }

  return `https://api.screenshotone.com/take?access_key=${apiKey}&url=${encodeURIComponent(url)}&viewport_width=1280&viewport_height=800&format=webp&block_ads=true&cache=true&cache_ttl=86400`;
}

export async function POST(request: NextRequest) {
  try {
    // Verify auth
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
    } catch (err) {
      console.error('Token verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid or expired authentication token.' },
        { status: 401 }
      );
    }

    const userId = decodedToken.uid;

    // Parse body
    const body = await request.json();
    let { url } = body;
    const competitorUrls: string[] = Array.isArray(body.competitors)
      ? body.competitors.filter((c: unknown) => typeof c === 'string' && c.trim()).slice(0, 2)
      : [];

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Please provide a valid URL.' },
        { status: 400 }
      );
    }

    // Normalize URL
    url = url.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format. Please check and try again.' },
        { status: 400 }
      );
    }

    // Normalize competitor URLs
    const normalizedCompetitors: string[] = [];
    for (const cUrl of competitorUrls) {
      let normalized = cUrl.trim();
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

    // Run all tasks in parallel
    const [auditResult, scraperResult, businessName] = await Promise.all([
      runAudit(url),
      runCustomChecks(url),
      extractBusinessName(url),
    ]);

    const screenshotUrl = generateScreenshotUrl(url);
    const reportId = generateReportId();

    // Run competitor audits in parallel (if any)
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

    // Filter out failed competitor audits
    const validCompetitors = competitors.filter(
      (c): c is NonNullable<typeof c> => c !== null
    );

    // Save to Firestore
    const reportData: Record<string, unknown> = {
      userId,
      businessUrl: url,
      businessName,
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

    await adminDb.collection('reports').doc(reportId).set(reportData);

    return NextResponse.json({
      reportId,
      businessName,
      mobileScore: auditResult.mobileScore,
      desktopScore: auditResult.desktopScore,
    });
  } catch (error) {
    console.error('Audit error:', error);
    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred';

    return NextResponse.json(
      { error: `Audit failed: ${message}` },
      { status: 500 }
    );
  }
}
