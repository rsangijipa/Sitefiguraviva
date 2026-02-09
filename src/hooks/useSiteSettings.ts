import { useQuery } from "@tanstack/react-query";
import {
  getSiteSettings,
  DEFAULT_FOUNDER,
  DEFAULT_INSTITUTE,
  DEFAULT_SEO,
  FounderSettings,
  InstituteSettings,
  SEOSettings,
} from "@/lib/siteSettings";

export const useFounderSettings = (initialData?: FounderSettings) => {
  return useQuery({
    queryKey: ["siteSettings", "founder"],
    queryFn: () => getSiteSettings<FounderSettings>("founder", DEFAULT_FOUNDER),
    initialData: initialData || DEFAULT_FOUNDER,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useInstituteSettings = (initialData?: InstituteSettings) => {
  return useQuery({
    queryKey: ["siteSettings", "institute"],
    queryFn: () =>
      getSiteSettings<InstituteSettings>("institute", DEFAULT_INSTITUTE),
    initialData: initialData || DEFAULT_INSTITUTE,
    staleTime: 1000 * 60 * 5,
  });
};

export const useSEOSettings = (initialData?: SEOSettings) => {
  return useQuery({
    queryKey: ["siteSettings", "seo"],
    queryFn: () => getSiteSettings<SEOSettings>("seo", DEFAULT_SEO),
    initialData: initialData || DEFAULT_SEO,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

import { DEFAULT_TEAM, TeamSettings } from "@/lib/siteSettings";

export const useTeamSettings = () => {
  return useQuery({
    queryKey: ["siteSettings", "team"],
    queryFn: () => getSiteSettings<TeamSettings>("team", DEFAULT_TEAM),
    initialData: DEFAULT_TEAM,
    staleTime: 1000 * 60 * 15,
  });
};
