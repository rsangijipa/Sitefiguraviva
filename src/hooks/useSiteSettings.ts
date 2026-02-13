import { useQuery } from "@tanstack/react-query";
import {
  getSiteSettings,
  DEFAULT_FOUNDER,
  DEFAULT_INSTITUTE,
  DEFAULT_SEO,
  FounderSettings,
  InstituteSettings,
  SEOSettings,
  ConfigSettings,
  DEFAULT_CONFIG,
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

export const useConfigSettings = (initialData?: ConfigSettings) => {
  return useQuery({
    queryKey: ["siteSettings", "config"],
    queryFn: () => getSiteSettings<ConfigSettings>("config", DEFAULT_CONFIG),
    initialData: initialData || DEFAULT_CONFIG,
    staleTime: 1000 * 60 * 5,
  });
};

import {
  DEFAULT_TEAM,
  TeamSettings,
  DEFAULT_LEGAL,
  LegalSettings,
} from "@/lib/siteSettings";

export const useTeamSettings = () => {
  return useQuery({
    queryKey: ["siteSettings", "team"],
    queryFn: () => getSiteSettings<TeamSettings>("team", DEFAULT_TEAM),
    initialData: DEFAULT_TEAM,
    staleTime: 1000 * 60 * 15,
  });
};

export const useLegalSettings = (options?: {
  initialData?: LegalSettings;
  aggressiveRefresh?: boolean;
}) => {
  return useQuery({
    queryKey: ["siteSettings", "legal"],
    queryFn: () => getSiteSettings<LegalSettings>("legal", DEFAULT_LEGAL),
    initialData: options?.initialData || DEFAULT_LEGAL,
    staleTime: options?.aggressiveRefresh ? 0 : 1000 * 60,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
};
