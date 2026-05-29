import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { safeError } from '@/lib/apiError';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const { reportId } = await params;

    // Fetch report from Firestore
    const reportDoc = await adminDb.collection('reports').doc(reportId).get();

    if (!reportDoc.exists) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    const reportData = reportDoc.data();

    // Record view event (fire-and-forget)
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'Unknown';

    // Don't await — fire and forget
    Promise.all([
      // Add view event to reportViews collection
      adminDb.collection('reportViews').add({
        reportId,
        viewedAt: new Date(),
        userAgent,
        ip: ip.substring(0, 45), // Truncate for privacy
        country: '', // Could be enriched with IP geolocation
      }),
      // Increment view count and update lastViewedAt
      adminDb.collection('reports').doc(reportId).update({
        viewCount: FieldValue.increment(1),
        lastViewedAt: new Date(),
      }),
    ]).catch((err) => {
      console.error('Failed to record view event:', err);
    });

    const response = NextResponse.json({
      id: reportId,
      ...reportData,
      // Convert Firestore Timestamps to ISO strings for JSON serialization
      createdAt: reportData?.createdAt?.toDate?.()?.toISOString() || null,
      lastViewedAt: reportData?.lastViewedAt?.toDate?.()?.toISOString() || null,
    });

    // Cache at CDN level — report data doesn't change frequently
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=60, stale-while-revalidate=300'
    );

    return response;
  } catch (error) {
    console.error('View recording error:', error);
    return NextResponse.json(
      { error: safeError(error) },
      { status: 500 }
    );
  }
}
