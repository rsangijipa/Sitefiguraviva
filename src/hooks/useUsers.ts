import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, getDocs, doc, updateDoc, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { UserData, UserRole } from "@/types/user";

export const useAllUsers = (initialData?: UserData[]) => {
    return useQuery({
        queryKey: ['users_admin'],
        queryFn: async () => {
            // In a real large-scale app, this should be paginated or server-side filtered.
            // For now, fetching all is acceptable as per "Phase 5" start.
            const q = query(collection(db, 'users'), orderBy('lastLogin', 'desc'));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserData));
        },
        initialData
    });
};

export const useUpdateUserRole = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ uid, role }: { uid: string; role: UserRole }) => {
            const userRef = doc(db, 'users', uid);
            await updateDoc(userRef, { role });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users_admin'] });
        }
    });
};
