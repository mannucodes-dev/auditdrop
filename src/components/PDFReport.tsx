import jsPDF from 'jspdf';
import { Report } from '@/hooks/useReports';
import { generateIssues, getScoreLabel, getScoreColor } from '@/lib/reportUtils';

interface OwnerProfile {
  displayName: string;
  ctaUrl: string;
  ctaLabel: string;
}

export async function generatePDF(
  report: Report,
  ownerProfile: OwnerProfile | null
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Colors
  const violet = [139, 92, 246];
  const darkBg = [15, 23, 42];
  const textWhite = [255, 255, 255];
  const textGray = [148, 163, 184];
  const textDarkGray = [100, 116, 139];

  // Background
  doc.setFillColor(darkBg[0], darkBg[1], darkBg[2]);
  doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F');

  // Header accent bar
  doc.setFillColor(violet[0], violet[1], violet[2]);
  doc.rect(0, 0, pageWidth, 3, 'F');
  y += 5;

  // Title
  doc.setTextColor(violet[0], violet[1], violet[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('WEBSITE AUDIT REPORT', margin, y);
  y += 8;

  // Business Name
  doc.setTextColor(textWhite[0], textWhite[1], textWhite[2]);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  const businessName = report.businessName || 'Untitled';
  doc.text(businessName, margin, y);
  y += 7;

  // URL
  doc.setTextColor(textGray[0], textGray[1], textGray[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(report.businessUrl, margin, y);
  y += 12;

  // Divider
  doc.setDrawColor(50, 60, 80);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // Scores Section
  doc.setTextColor(textWhite[0], textWhite[1], textWhite[2]);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Performance Scores', margin, y);
  y += 10;

  // Mobile Score
  const mobileColor = getScoreColor(report.mobileScore);
  const mobileRgb = mobileColor === 'red' ? [239, 68, 68] : mobileColor === 'amber' ? [245, 158, 11] : [16, 185, 129];
  doc.setFillColor(mobileRgb[0], mobileRgb[1], mobileRgb[2]);
  doc.roundedRect(margin, y, contentWidth / 2 - 5, 22, 3, 3, 'F');
  doc.setTextColor(textWhite[0], textWhite[1], textWhite[2]);
  doc.setFontSize(10);
  doc.text('Mobile', margin + 5, y + 7);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(`${report.mobileScore}/100`, margin + 5, y + 17);

  // Desktop Score
  const desktopScoreValue = report.desktopScore ?? 0;
  const desktopColor = getScoreColor(desktopScoreValue);
  const desktopRgb = desktopColor === 'red' ? [239, 68, 68] : desktopColor === 'amber' ? [245, 158, 11] : [16, 185, 129];
  const desktopX = margin + contentWidth / 2 + 5;
  doc.setFillColor(desktopRgb[0], desktopRgb[1], desktopRgb[2]);
  doc.roundedRect(desktopX, y, contentWidth / 2 - 5, 22, 3, 3, 'F');
  doc.setTextColor(textWhite[0], textWhite[1], textWhite[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Desktop', desktopX + 5, y + 7);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(`${report.desktopScore !== null && report.desktopScore !== undefined ? report.desktopScore : 'N/A'}/100`, desktopX + 5, y + 17);

  y += 30;

  // Score Summary
  doc.setTextColor(textGray[0], textGray[1], textGray[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Mobile performance is rated "${getScoreLabel(report.mobileScore)}". Desktop performance is rated "${report.desktopScore !== null && report.desktopScore !== undefined ? getScoreLabel(report.desktopScore) : 'N/A'}".`,
    margin,
    y
  );
  y += 12;

  // Key Metrics
  doc.setTextColor(textWhite[0], textWhite[1], textWhite[2]);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Key Metrics', margin, y);
  y += 8;

  const metricsData = [
    { label: 'First Contentful Paint', value: report.metrics.fcp },
    { label: 'Largest Contentful Paint', value: report.metrics.lcp },
    { label: 'Total Blocking Time', value: report.metrics.tbt },
    { label: 'Cumulative Layout Shift', value: report.metrics.cls },
  ];

  metricsData.forEach((metric) => {
    doc.setFillColor(30, 41, 59);
    doc.roundedRect(margin, y, contentWidth, 12, 2, 2, 'F');
    doc.setTextColor(textGray[0], textGray[1], textGray[2]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(metric.label, margin + 5, y + 7.5);
    doc.setTextColor(textWhite[0], textWhite[1], textWhite[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(String(metric.value || 'N/A'), pageWidth - margin - 5, y + 7.5, { align: 'right' });
    y += 15;
  });

  y += 5;

  // Issues Section
  const issues = generateIssues(report.checks, report.metrics, report.mobileScore);

  if (issues.length > 0) {
    // Check if we need a new page
    if (y > 220) {
      doc.addPage();
      doc.setFillColor(darkBg[0], darkBg[1], darkBg[2]);
      doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F');
      y = margin;
    }

    doc.setTextColor(textWhite[0], textWhite[1], textWhite[2]);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Issues Found (${issues.length})`, margin, y);
    y += 8;

    issues.forEach((issue) => {
      // Check for page overflow
      if (y > 260) {
        doc.addPage();
        doc.setFillColor(darkBg[0], darkBg[1], darkBg[2]);
        doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F');
        y = margin;
      }

      const impactColor = issue.impact === 'High' ? [239, 68, 68] : issue.impact === 'Medium' ? [245, 158, 11] : [59, 130, 246];

      doc.setFillColor(30, 41, 59);
      doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'F');

      // Impact indicator bar
      doc.setFillColor(impactColor[0], impactColor[1], impactColor[2]);
      doc.rect(margin, y, 2, 22, 'F');

      // Issue title
      doc.setTextColor(textWhite[0], textWhite[1], textWhite[2]);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`${issue.icon} ${issue.title}`, margin + 6, y + 7);

      // Impact badge
      doc.setTextColor(impactColor[0], impactColor[1], impactColor[2]);
      doc.setFontSize(7);
      doc.text(issue.impact, pageWidth - margin - 5, y + 7, { align: 'right' });

      // Issue body (truncated)
      doc.setTextColor(textDarkGray[0], textDarkGray[1], textDarkGray[2]);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      const bodyLines = doc.splitTextToSize(issue.body, contentWidth - 12);
      doc.text(bodyLines.slice(0, 2), margin + 6, y + 14);

      y += 26;
    });
  }

  y += 10;

  // CTA Section
  if (ownerProfile && ownerProfile.ctaUrl) {
    if (y > 240) {
      doc.addPage();
      doc.setFillColor(darkBg[0], darkBg[1], darkBg[2]);
      doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F');
      y = margin;
    }

    doc.setFillColor(violet[0], violet[1], violet[2]);
    doc.roundedRect(margin, y, contentWidth, 30, 3, 3, 'F');
    doc.setTextColor(textWhite[0], textWhite[1], textWhite[2]);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('These issues are fixable.', margin + 10, y + 12);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const ctaText = ownerProfile.displayName
      ? `Contact ${ownerProfile.displayName}: ${ownerProfile.ctaUrl}`
      : ownerProfile.ctaUrl;
    doc.text(ctaText, margin + 10, y + 20);
    y += 35;
  }

  // Footer
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setTextColor(textDarkGray[0], textDarkGray[1], textDarkGray[2]);
  doc.setFontSize(7);
  doc.text('Generated by AuditDrop', pageWidth / 2, pageHeight - 10, { align: 'center' });

  // Save
  const safeName = (report.businessName || 'report')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 30);
  const date = new Date().toISOString().split('T')[0];
  doc.save(`auditdrop-${safeName}-${date}.pdf`);
}
