/** Core metric values from a Lighthouse / PSI audit. */
export interface AuditMetrics {
  /** First Contentful Paint in seconds, e.g. "1.2 s" */
  fcp: string;
  /** Largest Contentful Paint in seconds */
  lcp: string;
  /** Total Blocking Time in milliseconds */
  tbt: string;
  /** Cumulative Layout Shift (unitless, e.g. "0.12") */
  cls: string;
}

/** A single audit issue / recommendation. */
export interface AuditIssue {
  icon: string;
  title: string;
  body: string;
  impact: 'High' | 'Medium' | 'Low';
}

/** Owner / freelancer profile attached to a report. */
export interface OwnerProfile {
  displayName: string;
  ctaUrl: string;
  ctaLabel: string;
}

/** Full report document stored in Firestore. */
export interface Report {
  id: string;
  uid: string;
  url: string;
  businessName: string;
  screenshotUrl?: string;
  mobileScore: number;
  desktopScore: number | null;
  metrics: AuditMetrics;
  issues: AuditIssue[];
  ownerProfile: OwnerProfile;
  views: number;
  lastViewedAt: string | null;
  createdAt: string;
}
