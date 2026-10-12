import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listUsersForAdmin,
  updateUserRole,
} from "@/app/actions/user-management";
import type { UserRole } from "@/types/user";

type AdminUser = Awaited<
  ReturnType<typeof listUsersForAdmin>
>["users"][number] & { isAdmin: boolean };

async function readUsers(pageSize: number, cursor?: { id: string }) {
  const result = await listUsersForAdmin(cursor?.id, pageSize);
  if (!result.success)
    throw new Error(result.error || "Não foi possível carregar os usuários.");
  const users = result.users.map((user) => ({
    ...user,
    isAdmin: user.role === "admin",
  }));
  return {
    users,
    lastVisible: result.nextPageToken
      ? { id: result.nextPageToken }
      : undefined,
    hasMore: !!result.nextPageToken,
  };
}
export const useAllUsersPaginated = (pageSize = 20, cursor?: { id: string }) =>
  useQuery({
    queryKey: ["users_admin", pageSize, cursor?.id],
    queryFn: () => readUsers(pageSize, cursor),
  });
export const useAllUsers = (initialData?: AdminUser[]) =>
  useQuery({
    queryKey: ["users_admin_legacy"],
    queryFn: async () => (await readUsers(1000)).users,
    initialData,
  });
export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ uid, role }: { uid: string; role: UserRole }) => {
      const result = await updateUserRole(uid, role);
      if (!result.success)
        throw new Error(
          result.error || "Não foi possível atualizar a permissão.",
        );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["users_admin"] });
      void queryClient.invalidateQueries({ queryKey: ["users_admin_legacy"] });
    },
  });
};
