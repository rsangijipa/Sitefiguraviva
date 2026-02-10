"use client";

import { useQuery } from "@tanstack/react-query";
import {
  collection,
  getDocs,
  orderBy,
  query,
  limit,
  startAfter,
  getCountFromServer,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { AssessmentDoc, AssessmentSubmissionDoc } from "@/types/assessment";

export const useAdminAssessments = () => {
  return useQuery({
    queryKey: ["admin_assessments"],
    queryFn: async () => {
      const q = query(collection(db, "assessments"), orderBy("title"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as AssessmentDoc,
      );
    },
  });
};

export const useSubmissionsMetrics = () => {
  return useQuery({
    queryKey: ["admin_submissions_metrics"],
    queryFn: async () => {
      const coll = collection(db, "assessmentSubmissions");

      // Total
      const totalSnap = await getCountFromServer(coll);

      // Pending (submitted)
      const pendingQuery = query(coll, where("status", "==", "submitted"));
      const pendingSnap = await getCountFromServer(pendingQuery);

      return {
        total: totalSnap.data().count,
        pending: pendingSnap.data().count,
      };
    },
  });
};

export const useAdminSubmissionsPaginated = (
  status?: string,
  pageSize = 20,
  lastDoc?: any,
) => {
  return useQuery({
    queryKey: ["admin_submissions", status, pageSize, lastDoc?.id],
    queryFn: async () => {
      let q = query(
        collection(db, "assessmentSubmissions"),
        orderBy("submittedAt", "desc"),
        limit(pageSize),
      );

      if (status) {
        // If filtering by status, we need a composite index on status + submittedAt
        // Using client-side filter for now if status is provided to avoid complex indexing until needed
        // Or: q = query(collection(db, 'assessmentSubmissions'), where('status', '==', status), orderBy('submittedAt', 'desc'), limit(pageSize));
      }

      if (lastDoc) {
        q = query(
          collection(db, "assessmentSubmissions"),
          orderBy("submittedAt", "desc"),
          startAfter(lastDoc),
          limit(pageSize),
        );
      }

      const snapshot = await getDocs(q);
      let submissions = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as AssessmentSubmissionDoc,
      );

      // Client-side filtering fallback for status (WARN: Breaks pagination if many filtered out)
      if (status) {
        submissions = submissions.filter((s) => s.status === status);
      }

      return {
        submissions,
        lastVisible: snapshot.docs[snapshot.docs.length - 1],
        hasMore: snapshot.docs.length === pageSize,
      };
    },
  });
};

export const useAdminSubmissions = (status?: string) => {
  return useQuery({
    queryKey: ["admin_submissions_legacy", status],
    queryFn: async () => {
      const q = query(
        collection(db, "assessmentSubmissions"),
        orderBy("submittedAt", "desc"),
        limit(50),
      );
      const snapshot = await getDocs(q);
      const submissions = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as AssessmentSubmissionDoc,
      );

      if (status) {
        return submissions.filter((s) => s.status === status);
      }
      return submissions;
    },
  });
};
