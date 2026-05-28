import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { generateIssues } from '@/lib/reportUtils';
import ReportPage from '@/components/ReportPage';

interface PageProps {
  params: Promise<{ reportId: string }>;
}

async function getReportData(reportId: string) {
  const reportDoc = await adminDb.collection('reports').doc(reportId).get();
  if (!reportDoc.exists) return null;

  const data = reportDoc.data();
  return {
    id: reportId,
    businessName: data?.businessName || 'Unknown',
    businessUrl: data?.businessUrl || '',
    screenshotUrl: data?.screenshotUrl || '',
    mobileScore: data?.mobileScore || 0,
    desktopScore: data?.desktopScore ?? null,
    metrics: data?.metrics || { fcp: 'N/A', lcp: 'N/A', tbt: 'N/A', cls: 'N/A' },
    checks: data?.checks || {},
    seoChecks: data?.seoChecks || undefined,
    competitors: data?.competitors || undefined,
    viewCount: data?.viewCount || 0,
    userId: data?.userId || '',
  };
}

async function getOwnerProfile(userId: string) {
  if (!userId) return null;
  const userDoc = await adminDb.collection('users').doc(userId).get();
  if (!userDoc.exists) return null;

  const data = userDoc.data();
  return {
    displayName: data?.displayName || '',
    ctaUrl: data?.ctaUrl || '',
    ctaLabel: data?.ctaLabel || 'Book a Free Call',
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { reportId } = await params;
  const report = await getReportData(reportId);

  if (!report) {
    return {
      title: 'Report Not Found - AuditDrop',
    };
  }

  const issues = generateIssues(report.checks, report.metrics, report.mobileScore);

  return {
    title: `${report.businessName} - Website Audit Report`,
    description: `Mobile score: ${report.mobileScore}/100. ${issues.length} issues found. See the full audit report.`,
    openGraph: {
      title: `${report.businessName} - Website Audit Report`,
      description: `Mobile performance score: ${report.mobileScore}/100. Desktop: ${report.desktopScore}/100. ${issues.length} issues found.`,
      type: 'website',
      siteName: 'AuditDrop',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${report.businessName} - Website Audit Report`,
      description: `Mobile score: ${report.mobileScore}/100. ${issues.length} issues found.`,
    },
  };
}

export default async function PublicReportPage({ params }: PageProps) {
  const { reportId } = await params;
  const report = await getReportData(reportId);

  if (!report) {
    notFound();
  }

  // Record view event (fire-and-forget)
  try {
    await Promise.all([
      adminDb.collection('reportViews').add({
        reportId,
        viewedAt: new Date(),
        userAgent: 'server-render',
        country: '',
      }),
      adminDb.collection('reports').doc(reportId).update({
        viewCount: FieldValue.increment(1),
        lastViewedAt: new Date(),
      }),
    ]);
  } catch (err) {
    console.error('Failed to record view:', err);
  }

  // Get owner profile for CTA
  const ownerProfile = await getOwnerProfile(report.userId);

  return (
    <ReportPage
      report={report}
      ownerProfile={ownerProfile}
    />
  );
}
