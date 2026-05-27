'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  type Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Report {
  id: string;
  userId: string;
  businessUrl: string;
  businessName: string;
  screenshotUrl: string;
  mobileScore: number;
  desktopScore: number;
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
  viewCount: number;
  lastViewedAt: Timestamp | null;
  createdAt: Timestamp;
}

interface ReportsState {
  reports: Report[];
  loading: boolean;
}

export function useReports(userId: string): ReportsState {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // No userId → nothing to subscribe to; keep initial state (empty + loading=true)
    // The loading state will be corrected by the onSnapshot callback once a
    // valid userId is provided.
    if (!userId) return;

    const reportsRef = collection(db, 'reports');
    const reportsQuery = query(
      reportsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      reportsQuery,
      (snapshot) => {
        const reportsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Report[];
        setReports(reportsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching reports:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // When there's no userId, return empty state directly
  if (!userId) {
    return { reports: [], loading: false };
  }

  return { reports, loading };
}
