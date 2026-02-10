"use client";

import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export const useAllGamificationProfiles = () => {
  return useQuery({
    queryKey: ["admin_gamification_profiles"],
    queryFn: async () => {
      const q = query(
        collection(db, "gamification_profiles"),
        orderBy("totalXp", "desc"),
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));
    },
  });
};
