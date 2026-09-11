import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/infrastructure/supabase/client";
import { UserData, UserRole } from "@/types/user";

export const useAllUsersPaginated = (pageSize = 20, lastDoc?: any) => {
  return useQuery({
    queryKey: ["users_admin", pageSize, lastDoc?.id],
    queryFn: async () => {
      const supabase = createSupabaseBrowserClient();
      let query = supabase
        .from("profiles")
        .select("*")
        .order("last_login_at", { ascending: false })
        .limit(pageSize);
      if (lastDoc?.last_login_at)
        query = query.lt("last_login_at", lastDoc.last_login_at);
      const { data, error } = await query;
      if (error) throw error;
      const users = (data || []).map(toUserData);

      return {
        users,
        lastVisible: users[users.length - 1],
        hasMore: users.length === pageSize,
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
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("last_login_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []).map(toUserData);
    },
    initialData,
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ uid, role }: { uid: string; role: UserRole }) => {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from("profiles")
        .update({ role })
        .eq("id", uid);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users_admin"] });
    },
  });
};

function toUserData(profile: any): UserData {
  return {
    uid: profile.id,
    email: profile.email,
    displayName: profile.display_name,
    photoURL: profile.photo_url,
    role: profile.role,
    status: profile.is_active ? "active" : "disabled",
    isAdmin: profile.role === "admin",
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
    lastLogin: profile.last_login_at,
    bio: profile.bio || undefined,
    phoneNumber: profile.phone_number || undefined,
    profession: profile.profession || undefined,
    city: profile.city || undefined,
    state: profile.state || undefined,
    dateOfBirth: profile.date_of_birth || undefined,
    instagram: profile.instagram || undefined,
    profileCompletion: profile.profile_completion,
    profileCompletedAt: profile.profile_completed_at,
  } as UserData;
}
