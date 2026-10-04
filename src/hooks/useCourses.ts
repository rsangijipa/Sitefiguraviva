"use client";

import { useQuery } from "@tanstack/react-query";

import { listContent } from "@/features/content/infrastructure/supabaseContentRepository";

export const useAllCourses = () => {
  return useQuery({
    queryKey: ["all_courses_admin"],
    queryFn: () => listContent("courses", { publishedOnly: false }),
  });
};
