"use server";
import { requireAdmin } from "@/lib/auth/server";
import {
  createSupabaseServiceClient,
  createSupabaseAuthServerClient,
} from "@/infrastructure/supabase/server";
import { getAuthEmailRedirect } from "@/lib/auth/email-flow";
import { rateLimit, RateLimitPresets } from "@/lib/rateLimit";
import type { UserRole, UserStatus } from "@/types/user";
import { revalidatePath } from "next/cache";

async function readProfile(targetUid: string) {
  const { data, error } = await createSupabaseServiceClient()
    .from("profiles")
    .select("id,email,is_active")
    .eq("id", targetUid)
    .maybeSingle();
  if (error || !data) throw new Error("Conta não encontrada ou indisponível.");
  return data;
}
async function govern(
  actor: string,
  target: string,
  role: string | null,
  active: boolean | null,
) {
  const { data, error } = await createSupabaseServiceClient().rpc(
    "set_admin_profile_governance",
    { p_actor: actor, p_target: target, p_role: role, p_active: active },
  );
  if (error || !data)
    throw new Error(
      "Alteração bloqueada. Verifique a conta e preserve o último administrador ativo.",
    );
  revalidatePath("/admin/users");
}
function failure(error: unknown) {
  return {
    success: false as const,
    error:
      error instanceof Error
        ? error.message
        : "Não foi possível concluir a operação.",
  };
}
export async function updateUserRole(targetUid: string, newRole: UserRole) {
  try {
    const actor = await requireAdmin();
    if (!["admin", "tutor", "student"].includes(newRole))
      throw new Error("Cargo inválido.");
    await govern(actor.uid, targetUid, newRole, null);
    return { success: true as const, error: undefined };
  } catch (error) {
    return failure(error);
  }
}
export async function toggleUserStatus(
  targetUid: string,
  newStatus: UserStatus,
  _reason?: string,
) {
  try {
    const actor = await requireAdmin();
    if (targetUid === actor.uid)
      throw new Error("Você não pode alterar o próprio acesso.");
    if (!["active", "disabled"].includes(newStatus))
      throw new Error("Situação inválida.");
    await readProfile(targetUid);
    const db = createSupabaseServiceClient();
    if (newStatus === "disabled") {
      await govern(actor.uid, targetUid, null, false);
      const { error } = await db.auth.admin.updateUserById(targetUid, {
        ban_duration: "876000h",
      });
      if (error)
        throw new Error(
          "Perfil desativado, mas o bloqueio no serviço de autenticação falhou. Confira a conta antes de repetir.",
        );
    } else {
      const { error } = await db.auth.admin.updateUserById(targetUid, {
        ban_duration: "none",
      });
      if (error)
        throw new Error(
          "A autenticação não pôde ser liberada; o perfil continua desativado.",
        );
      await govern(actor.uid, targetUid, null, true);
    }
    return { success: true as const, error: undefined };
  } catch (error) {
    return failure(error);
  }
}
export async function deleteUser(targetUid: string) {
  try {
    const actor = await requireAdmin();
    if (targetUid === actor.uid)
      throw new Error("Você não pode excluir a própria conta.");
    await readProfile(targetUid);
    const db = createSupabaseServiceClient();
    const { data: linked, error: checkError } = await db.rpc(
      "profile_has_dependencies",
      { p_target: targetUid },
    );
    if (checkError)
      throw new Error("Não foi possível verificar os vínculos da conta.");
    if (linked !== false)
      throw new Error(
        "Esta conta tem inscrições ou histórico. Desative o acesso para preservar os registros.",
      );
    await govern(actor.uid, targetUid, null, false);
    const { error } = await db.auth.admin.deleteUser(targetUid);
    if (error)
      throw new Error(
        "Conta desativada, mas a exclusão na autenticação falhou. Os registros foram preservados.",
      );
    const { data: remaining, error: readError } = await db
      .from("profiles")
      .select("id")
      .eq("id", targetUid)
      .maybeSingle();
    if (readError || remaining)
      throw new Error(
        "Exclusão solicitada, mas o resultado precisa ser conferido. O perfil não foi removido separadamente.",
      );
    revalidatePath("/admin/users");
    return { success: true as const, error: undefined };
  } catch (error) {
    return failure(error);
  }
}
export async function sendUserAccessEmail(targetUid: string) {
  try {
    const actor = await requireAdmin();
    const profile = await readProfile(targetUid);
    if (!profile.is_active || !profile.email)
      throw new Error("Uma conta ativa com e-mail é necessária.");
    const db = createSupabaseServiceClient();
    const { data, error } = await db.auth.admin.getUserById(targetUid);
    if (
      error ||
      !data?.user?.email ||
      data.user.email.toLowerCase() !== profile.email.toLowerCase()
    )
      throw new Error(
        "Confira o e-mail da conta na autenticação antes de enviar o acesso.",
      );
    const actorLimit = await rateLimit(actor.uid, "ADMIN_ACCESS_EMAIL", {
      maxRequests: 10,
      windowMs: 600000,
    });
    const targetLimit = await rateLimit(
      targetUid,
      "ACCOUNT_ACCESS_EMAIL",
      RateLimitPresets.PASSWORD_RESET,
    );
    if (!actorLimit.allowed || !targetLimit.allowed)
      throw new Error("Aguarde antes de solicitar outro e-mail de acesso.");
    const { error: sendError } =
      await createSupabaseAuthServerClient().auth.signInWithOtp({
        email: data.user.email,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: getAuthEmailRedirect("recovery"),
        },
      });
    if (sendError)
      throw new Error(
        "Não foi possível solicitar o e-mail. Confira o serviço de envio e tente novamente.",
      );
    return { success: true as const, error: undefined };
  } catch (error) {
    return failure(error);
  }
}
export async function listUsersForAdmin(pageToken?: string, pageSize = 100) {
  try {
    await requireAdmin();
    const parsed = Number(pageToken ?? 1);
    const page = Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 1;
    const perPage = Number.isFinite(pageSize)
      ? Math.max(1, Math.min(1000, Math.floor(pageSize)))
      : 100;
    const { data: profiles, error } = await createSupabaseServiceClient()
      .from("profiles")
      .select(
        "id,email,display_name,photo_url,role,is_active,created_at,last_login_at,phone_number,profile_completion",
      )
      .order("created_at", { ascending: false })
      .range((page - 1) * perPage, page * perPage - 1);
    if (error) throw new Error("Não foi possível listar as contas.");
    const users = (profiles || []).map((p) => ({
      id: p.id,
      uid: p.id,
      email: p.email,
      displayName: p.display_name,
      photoURL: p.photo_url,
      role: p.role as UserRole,
      isActive: p.is_active === true,
      status: p.is_active === true ? "active" : "disabled",
      profileCompletion: p.profile_completion ?? 0,
      phoneNumber: p.phone_number,
      createdAt: p.created_at,
      lastLogin: p.last_login_at,
    }));
    return {
      success: true as const,
      error: undefined,
      users,
      nextPageToken: users.length === perPage ? String(page + 1) : null,
    };
  } catch (error) {
    return { ...failure(error), users: [], nextPageToken: null };
  }
}
