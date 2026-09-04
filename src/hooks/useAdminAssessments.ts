"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getAdminAssessments,
  getAdminSubmissionMetrics,
  getAdminSubmissionsPage,
} from "@/actions/assessment";

export const useAdminAssessments = () => {
  return useQuery({
    queryKey: ["admin_assessments"],
    queryFn: getAdminAssessments,
  });
};

export const useSubmissionsMetrics = () => {
  return useQuery({
    queryKey: ["admin_submissions_metrics"],
    queryFn: getAdminSubmissionMetrics,
  });
};

export const useAdminSubmissionsPaginated = (
  status?: string,
  pageSize = 20,
  lastCursor?: string,
) => {
  return useQuery({
    queryKey: ["admin_submissions", status, pageSize, lastCursor],
    queryFn: () =>
      getAdminSubmissionsPage({ status, pageSize, cursorId: lastCursor }),
  });
};

export const useAdminSubmissions = (status?: string) => {
  return useQuery({
    queryKey: ["admin_submissions_legacy", status],
    queryFn: async () => {
      const result = await getAdminSubmissionsPage({ status, pageSize: 50 });
      return result.submissions;
    },
  });
};
