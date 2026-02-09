
import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import {
    DEFAULT_FOUNDER,
    DEFAULT_INSTITUTE,
    DEFAULT_TEAM,
    FounderSettings,
    InstituteSettings,
    TeamSettings
} from '@/lib/siteSettings';

async function fetchSettings<T>(key: string, fallback: T): Promise<T> {
    try {
        const snap = await getDoc(doc(db, 'siteSettings', key));
        if (snap.exists()) {
            return { ...fallback, ...snap.data() } as T;
        }
        return fallback;
    } catch (error) {
        console.error(`Error fetching siteSettings/${key}:`, error);
        return fallback;
    }
}

export const useFounderSettings = () => {
    return useQuery({
        queryKey: ['siteSettings', 'founder'],
        queryFn: () => fetchSettings<FounderSettings>('founder', DEFAULT_FOUNDER),
        initialData: DEFAULT_FOUNDER,
        staleTime: 1000 * 60 * 5 // 5 minutes
    });
};

export const useInstituteSettings = () => {
    return useQuery({
        queryKey: ['siteSettings', 'institute'],
        queryFn: () => fetchSettings<InstituteSettings>('institute', DEFAULT_INSTITUTE),
        initialData: DEFAULT_INSTITUTE,
        staleTime: 1000 * 60 * 5
    });
};

export const useTeamSettings = () => {
    return useQuery({
        queryKey: ['siteSettings', 'team'],
        queryFn: () => fetchSettings<TeamSettings>('team', DEFAULT_TEAM),
        initialData: DEFAULT_TEAM,
        staleTime: 1000 * 60 * 5
    });
};
