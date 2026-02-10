"use client";

import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export const useAllCourses = () => {
  return useQuery({
    queryKey: ["all_courses_admin"],
    queryFn: async () => {
      const q = query(collection(db, "courses"), orderBy("title"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as any);
    },
  });
};
