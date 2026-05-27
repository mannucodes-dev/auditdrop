import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { runAudit } from '@/lib/psi';
import { runCustomChecks } from '@/lib/scraper';
import { generateReportId } from '@/lib/reportUtils';

export const maxDuration = 45;

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

    if (titleMatch && titleMatch[1]) {
      let title = titleMatch[1].trim();
      // Clean common suffixes
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
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
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

    // Parse body
    const body = await request.json();
    let { url } = body;

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

    // Run audit, custom checks, and business name extraction in parallel
    const [auditResult, customChecks, businessName] = await Promise.all([
      runAudit(url),
      runCustomChecks(url),
      extractBusinessName(url),
    ]);

    // Generate screenshot URL
    const screenshotUrl = generateScreenshotUrl(url);

    // Generate report ID
    const reportId = generateReportId();

    // Save to Firestore
    const reportData = {
      userId,
      businessUrl: url,
      businessName,
      screenshotUrl,
      mobileScore: auditResult.mobileScore,
      desktopScore: auditResult.desktopScore,
      metrics: auditResult.metrics,
      checks: customChecks,
      viewCount: 0,
      lastViewedAt: null,
      createdAt: new Date(),
    };

    await adminDb.collection('reports').doc(reportId).set(reportData);

    return NextResponse.json({
      reportId,
      businessName,
      mobileScore: auditResult.mobileScore,
      desktopScore: auditResult.desktopScore,
    });
  } catch (error) {
    console.error('Audit error:', error);

    const message = error instanceof Error ? error.message : 'An unexpected error occurred';

    if (message.includes('timeout') || message.includes('abort')) {
      return NextResponse.json(
        { error: 'The audit timed out. The website may be too slow or unreachable.' },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: `Audit failed: ${message}` },
      { status: 500 }
    );
  }
}
