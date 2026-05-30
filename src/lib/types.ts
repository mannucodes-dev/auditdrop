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

/** Revenue impact estimate (Feature 1). */
export interface RevenueImpact {
  hasIssues: boolean;
  monthlyVisitorsEstimate: number;
  conversionBaseline: number;
  lostConversions: number;
  lostRevenueMin: number;
  lostRevenueMax: number;
  currency: string;
  severity: 'critical' | 'poor' | 'fair' | 'good';
  headline: string;
  subtext: string;
  disclaimer: string;
  contributingFactors: Array<{ factor: string; loss: number }>;
}

/** Google Business Profile audit result (Feature 2). */
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
  profileCompleteness: number;
  reputationScore: number;
  issues: GBPIssue[];
}

export interface GBPIssue {
  title: string;
  body: string;
  impact: 'High' | 'Medium' | 'Low';
}

/** Business categories for revenue impact estimation. */
export type BusinessCategory =
  | 'dental'
  | 'medical'
  | 'restaurant'
  | 'interior_design'
  | 'photography'
  | 'coaching'
  | 'salon'
  | 'retail'
  | 'real_estate'
  | 'general';

/** Prospect pipeline status (Feature 3). */
export type ProspectStatus = 'new' | 'contacted' | 'interested' | 'won' | 'lost';

/** Private prospect data — stored in reports/{id}/private/data. */
export interface ProspectData {
  prospectStatus: ProspectStatus;
  prospectNotes: string;
  prospectPhone: string;
  lastContactedAt: string | null;
}

/** Full report document stored in Firestore. */
export interface Report {
  id: string;
  uid: string;
  url: string;
  businessName: string;
  screenshotUrl?: string;
  mobileScore: number | null;
  desktopScore: number | null;
  metrics: AuditMetrics;
  issues: AuditIssue[];
  ownerProfile: OwnerProfile;
  views: number;
  lastViewedAt: string | null;
  createdAt: string;
  businessCategory?: BusinessCategory;
  gbpAudit?: GBPAudit;
}
