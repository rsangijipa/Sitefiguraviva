import { useQuery } from "@tanstack/react-query";

import {
  getPublicPageContent,
  listContent,
  listPublishedContent,
} from "@/features/content/infrastructure/supabaseContentRepository";

export interface Course {
  id: string;
  title: string;
  isPublished: boolean;
  [key: string]: unknown;
}

export interface Post {
  id: string;
  title: string;
  isPublished: boolean;
  [key: string]: unknown;
}

export const useCourses = (
  isAdmin = false,
  options?: { initialData?: any[] },
) => {
  return useQuery({
    queryKey: ["courses", isAdmin],
    queryFn: () =>
      isAdmin
        ? listContent("courses", { publishedOnly: false })
        : listPublishedContent("courses"),
    initialData: options?.initialData,
    staleTime: 1000 * 60 * 5,
  });
};

export const useBlogPosts = (
  isAdmin = false,
  options?: { initialData?: any[] },
) => {
  return useQuery({
    queryKey: ["posts", isAdmin],
    queryFn: () =>
      isAdmin
        ? listContent("posts", { publishedOnly: false })
        : listPublishedContent("posts"),
    initialData: options?.initialData,
    staleTime: 1000 * 60 * 5,
  });
};

export const useGallery = (options?: { initialData?: any[] }) => {
  return useQuery({
    queryKey: ["gallery"],
    queryFn: () => listContent("gallery", { publishedOnly: false }),
    initialData: options?.initialData,
    staleTime: 1000 * 60 * 5,
  });
};

export const usePublicGallery = (options?: { initialData?: any[] }) => {
  return useQuery({
    queryKey: ["publicGallery"],
    queryFn: () => listPublishedContent("publicGallery"),
    initialData: options?.initialData,
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

export const usePublicLibrary = (options?: { initialData?: any[] }) => {
  return useQuery({
    queryKey: ["publicLibrary"],
    queryFn: () => listPublishedContent("publicLibrary"),
    initialData: options?.initialData,
    staleTime: 1000 * 60 * 10,
  });
};

export const usePageContent = (key: string) => {
  return useQuery({
    queryKey: ["content", key],
    queryFn: () => getPublicPageContent(key),
  });
};

export const useTeamMembers = () => {
  return useQuery({
    queryKey: ["team"],
    queryFn: () => listPublishedContent("team_members"),
  });
};
