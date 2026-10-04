import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  orderBy,
  query,
  limit,
  startAfter,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { UserData, UserRole } from "@/types/user";

export const useAllUsersPaginated = (pageSize = 20, lastDoc?: any) => {
  return useQuery({
    queryKey: ["users_admin", pageSize, lastDoc?.id],
    queryFn: async () => {
      let q = query(
        collection(db, "users"),
        orderBy("lastLogin", "desc"),
        limit(pageSize),
      );

      if (lastDoc) {
        // When using startAfter, we need to rebuild the query to ensure correct ordering/limits
        q = query(
          collection(db, "users"),
          orderBy("lastLogin", "desc"),
          startAfter(lastDoc),
          limit(pageSize),
        );
      }

      const snapshot = await getDocs(q);
      const users = snapshot.docs.map(
        (doc) => ({ uid: doc.id, ...doc.data() }) as UserData,
      );

      return {
        users,
        lastVisible: snapshot.docs[snapshot.docs.length - 1],
        hasMore: snapshot.docs.length === pageSize,
      };
    },
  });
};

export const useAllUsers = (initialData?: UserData[]) => {
  // Legacy hook wrapper for backward compatibility until refactor complete
  // Still fetches all but limited to 50 for safety in "Phase 5" context
  return useQuery({
    queryKey: ["users_admin_legacy"],
    queryFn: async () => {
      const q = query(
        collection(db, "users"),
        orderBy("lastLogin", "desc"),
        limit(50),
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(
        (doc) => ({ uid: doc.id, ...doc.data() }) as UserData,
      );
    },
    initialData,
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ uid, role }: { uid: string; role: UserRole }) => {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users_admin"] });
    },
  });
};
