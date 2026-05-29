'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ProspectStatus } from '@/lib/types';

export interface Report {
  id: string;
  userId: string;
  businessUrl: string;
  businessName: string;
  businessCategory?: string;
  screenshotUrl: string;
  mobileScore: number | null;
  desktopScore: number | null;
  metrics: {
    fcp: string;
    lcp: string;
    tbt: string;
    cls: string;
  };
  checks: {
    hasPhone: boolean | null;
    hasClickToCall: boolean | null;
    hasHttps: boolean | null;
    hasAnalytics: boolean | null;
    hasViewport: boolean | null;
    hasContactForm: boolean | null;
  };
  seoChecks?: {
    hasMetaTitle: boolean;
    hasMetaDescription: boolean;
    hasH1: boolean;
    hasCanonical: boolean;
    hasStructuredData: boolean;
    hasOpenGraph: boolean;
    titleLength: number;
    titleTooLong: boolean;
    titleTooShort: boolean;
  };
  competitors?: Array<{
    url: string;
    businessName: string;
    mobileScore: number | null;
    desktopScore: number | null;
    checks: {
      hasPhone: boolean | null;
      hasClickToCall: boolean | null;
      hasHttps: boolean | null;
      hasAnalytics: boolean | null;
      hasViewport: boolean | null;
      hasContactForm: boolean | null;
    };
    seoChecks?: {
      hasMetaTitle: boolean;
      hasMetaDescription: boolean;
      hasH1: boolean;
      hasCanonical: boolean;
      hasStructuredData: boolean;
      hasOpenGraph: boolean;
      titleLength: number;
      titleTooLong: boolean;
      titleTooShort: boolean;
    };
  }>;
  viewCount: number;
  lastViewedAt: Timestamp | null;
  createdAt: Timestamp;
  // Prospect data from private sub-collection (loaded separately)
  prospectStatus?: ProspectStatus;
  prospectNotes?: string;
  prospectPhone?: string;
  lastContactedAt?: Timestamp | null;
  source?: 'embed' | undefined;
  gbpAudit?: Record<string, unknown>;
}

interface ReportsState {
  reports: Report[];
  loading: boolean;
  updateProspectStatus: (reportId: string, status: ProspectStatus) => Promise<void>;
  updateProspectNotes: (reportId: string, notes: string) => Promise<void>;
  updateProspectPhone: (reportId: string, phone: string) => Promise<void>;
}

/**
 * Hook to subscribe to user's reports with real-time updates.
 *
 * Also fetches private sub-collection data for each report (prospect status,
 * notes, phone). Private data is merged into the report object for convenience,
 * but is stored separately in Firestore for security.
 */
export function useReports(userId: string): ReportsState {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const reportsRef = collection(db, 'reports');
    const reportsQuery = query(
      reportsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      reportsQuery,
      async (snapshot) => {
        const baseReports = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Report[];

        // Fetch private sub-collection for each report
        const enriched = await Promise.all(
          baseReports.map(async (report) => {
            try {
              const privateDoc = await getDoc(
                doc(db, 'reports', report.id, 'private', 'data')
              );
              if (privateDoc.exists()) {
                const privateData = privateDoc.data();
                return {
                  ...report,
                  prospectStatus: (privateData.prospectStatus as ProspectStatus) || 'new',
                  prospectNotes: (privateData.prospectNotes as string) || '',
                  prospectPhone: (privateData.prospectPhone as string) || '',
                  lastContactedAt: privateData.lastContactedAt || null,
                };
              }
            } catch (err) {
              // Private doc may not exist for older reports
              console.warn(`Private data not found for report ${report.id}:`, err);
            }
            return {
              ...report,
              prospectStatus: 'new' as ProspectStatus,
              prospectNotes: '',
              prospectPhone: '',
              lastContactedAt: null,
            };
          })
        );

        setReports(enriched);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching reports:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  /**
   * Update prospect status in the private sub-collection.
   */
  const updateProspectStatus = useCallback(
    async (reportId: string, status: ProspectStatus) => {
      try {
        const ref = doc(db, 'reports', reportId, 'private', 'data');
        await updateDoc(ref, {
          prospectStatus: status,
          ...(status === 'contacted' ? { lastContactedAt: serverTimestamp() } : {}),
        });

        // Optimistic update
        setReports((prev) =>
          prev.map((r) =>
            r.id === reportId ? { ...r, prospectStatus: status } : r
          )
        );
      } catch (err) {
        console.error('Failed to update prospect status:', err);
        throw err;
      }
    },
    []
  );

  /**
   * Update prospect notes in the private sub-collection.
   */
  const updateProspectNotes = useCallback(
    async (reportId: string, notes: string) => {
      try {
        const ref = doc(db, 'reports', reportId, 'private', 'data');
        await updateDoc(ref, { prospectNotes: notes });

        setReports((prev) =>
          prev.map((r) =>
            r.id === reportId ? { ...r, prospectNotes: notes } : r
          )
        );
      } catch (err) {
        console.error('Failed to update prospect notes:', err);
        throw err;
      }
    },
    []
  );

  /**
   * Update prospect phone in the private sub-collection.
   */
  const updateProspectPhone = useCallback(
    async (reportId: string, phone: string) => {
      try {
        const ref = doc(db, 'reports', reportId, 'private', 'data');
        await updateDoc(ref, { prospectPhone: phone });

        setReports((prev) =>
          prev.map((r) =>
            r.id === reportId ? { ...r, prospectPhone: phone } : r
          )
        );
      } catch (err) {
        console.error('Failed to update prospect phone:', err);
        throw err;
      }
    },
    []
  );

  // No userId → return empty immediately
  if (!userId) {
    return {
      reports: [],
      loading: false,
      updateProspectStatus: async () => {},
      updateProspectNotes: async () => {},
      updateProspectPhone: async () => {},
    };
  }

  return { reports, loading, updateProspectStatus, updateProspectNotes, updateProspectPhone };
}
