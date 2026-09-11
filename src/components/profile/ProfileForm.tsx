"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import {
  updateProfile as updateProfileAction,
  uploadAvatar,
} from "@/actions/profile";
import { Camera, Loader2, Save, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/infrastructure/supabase/client";
import { SafeImage } from "@/components/ui/SafeImage";

export function ProfileForm() {
  const { user, updateProfile } = useAuth(); // Get context updater
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Form State
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [profession, setProfession] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [instagram, setInstagram] = useState("");

  // Avatar State
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Fetch Extra Data (Bio)
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      setPreviewUrl(user.photoURL);

      // Supabase is the source of truth for the profile.
      void (async () => {
        const { data, error } = await supabase
          .from("profiles")
          .select(
            "bio,phone_number,profession,city,state,date_of_birth,instagram",
          )
          .eq("id", user.uid)
          .maybeSingle();
        if (error) throw error;
        setBio(data?.bio || "");
        setPhoneNumber(data?.phone_number || "");
        setProfession(data?.profession || "");
        setCity(data?.city || "");
        setState(data?.state || "");
        setDateOfBirth(data?.date_of_birth || "");
        setInstagram(data?.instagram || "");
      })().catch((err) => console.error("Erro ao carregar perfil:", err));
    }
  }, [user]);

  // Password State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setMessage({ type: "error", text: "Use uma imagem JPG, PNG ou WEBP." });
        e.target.value = "";
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setMessage({
          type: "error",
          text: "A imagem deve ter no máximo 5 MB.",
        });
        e.target.value = "";
        return;
      }
      setAvatarFile(file);
      setPreviewUrl((current) => {
        if (current?.startsWith("blob:")) URL.revokeObjectURL(current);
        return URL.createObjectURL(file);
      });
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // 1. Upload Avatar if changed
      let newPhotoURL = user?.photoURL;
      if (avatarFile) {
        const formData = new FormData();
        formData.append("file", avatarFile);

        const uploadRes = await uploadAvatar(formData);
        if (uploadRes.error) throw new Error(uploadRes.error);
        if (uploadRes.url) newPhotoURL = uploadRes.url;
      }

      // 2. Update Info
      const updateRes = await updateProfileAction({
        displayName,
        bio,
        phoneNumber,
        profession,
        city,
        state,
        dateOfBirth,
        instagram,
      });
      if (updateRes.error) throw new Error(updateRes.error);

      // 3. Update Client Context (Sync Sidebar)
      if (user) {
        try {
          // The server action is authoritative; this only refreshes local auth UI.
          await updateProfile({ displayName, photoURL: newPhotoURL });
        } catch (e) {
          console.error(
            "[DEBUG] Client-side profile refresh failed, but data was saved:",
            e,
          );
        }
      }

      setMessage({ type: "success", text: "Perfil atualizado com sucesso!" });
      router.refresh();
      // Force page reload as fallback or rely on context?
      // Ideally context. But let's look at imports.
      // Import alias needed.
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Erro ao salvar perfil.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Senhas não conferem." });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "Senha deve ter no mínimo 6 caracteres.",
      });
      return;
    }
    if (!user) return;

    setLoading(true);
    setMessage(null);

    try {
      await supabase.auth.updateUser({ password: newPassword });
      setMessage({ type: "success", text: "Senha alterada com sucesso!" });
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordSection(false);
    } catch (error: any) {
      console.error(error);
      setMessage({ type: "error", text: "Erro ao alterar senha." });
    } finally {
      setLoading(false);
    }
  };

  const essentialFields = [
    { label: "Nome completo", value: displayName?.trim() },
    { label: "Telefone/WhatsApp", value: phoneNumber?.trim() },
    { label: "Profissão", value: profession?.trim() },
    { label: "Cidade", value: city?.trim() },
    { label: "UF", value: state?.trim() },
    { label: "Data de nascimento", value: dateOfBirth?.trim() },
  ];
  const completedCount = essentialFields.filter((f) => !!f.value).length;
  const completionPercent = Math.round(
    (completedCount / essentialFields.length) * 100,
  );
  const missingLabels = essentialFields
    .filter((f) => !f.value)
    .map((f) => f.label)
    .slice(0, 3);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {message && (
        <div
          className={`p-4 rounded-lg text-sm ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
        >
          {message.text}
        </div>
      )}

      {/* Profile Info Form */}
      <form
        onSubmit={handleSaveProfile}
        className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-stone-100 space-y-6"
      >
        <h2 className="text-xl font-serif font-bold text-stone-800">
          Dados Pessoais
        </h2>

        <div className="rounded-xl border border-stone-100 bg-stone-50/60 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-stone-700">
              Cadastro completo
            </p>
            <span className="text-xs font-bold text-primary">
              {completionPercent}%
            </span>
          </div>
          <div className="h-2 w-full bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
          {completionPercent < 100 ? (
            <p className="text-xs text-stone-600">
              Falta preencher: {missingLabels.join(", ")}
              {completedCount + 3 < essentialFields.length ? "..." : ""}
            </p>
          ) : (
            <p className="text-xs text-green-700">
              Excelente! Seu cadastro está completo.
            </p>
          )}
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-stone-100 border border-stone-200">
              {previewUrl ? (
                <SafeImage
                  src={previewUrl}
                  alt="Avatar"
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-300 font-serif text-3xl">
                  {(displayName?.[0] || "U").toUpperCase()}
                </div>
              )}
            </div>
            <label
              htmlFor="avatar-upload"
              aria-label="Selecionar nova foto de perfil"
              className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/40 text-white opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100"
            >
              <Camera size={24} />
              <input
                id="avatar-upload"
                name="avatar"
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
              />
            </label>
          </div>
          <div>
            <p className="text-sm font-medium text-stone-700">Foto de Perfil</p>
            <p className="text-xs text-stone-400">JPG, PNG ou WEBP. Máx 5MB.</p>
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label
                htmlFor="displayName"
                className="block text-sm font-medium text-stone-700 mb-1"
              >
                Nome Completo
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                className="w-full p-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                aria-required="true"
              />
            </div>

            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-stone-700 mb-1"
              >
                Telefone / WhatsApp
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                className="w-full p-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div>
              <label
                htmlFor="profession"
                className="block text-sm font-medium text-stone-700 mb-1"
              >
                Profissão / Área de Atuação
              </label>
              <input
                id="profession"
                name="profession"
                type="text"
                className="w-full p-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                placeholder="Psicóloga, Estudante, etc."
              />
            </div>

            <div>
              <label
                htmlFor="city"
                className="block text-sm font-medium text-stone-700 mb-1"
              >
                Cidade
              </label>
              <input
                id="city"
                name="city"
                type="text"
                className="w-full p-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="state"
                className="block text-sm font-medium text-stone-700 mb-1"
              >
                UF
              </label>
              <input
                id="state"
                name="state"
                type="text"
                maxLength={2}
                className="w-full p-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all uppercase"
                value={state}
                onChange={(e) => setState(e.target.value.toUpperCase())}
                placeholder="SP"
              />
            </div>

            <div>
              <label
                htmlFor="dateOfBirth"
                className="block text-sm font-medium text-stone-700 mb-1"
              >
                Data de Nascimento
              </label>
              <input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                className="w-full p-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="instagram"
                className="block text-sm font-medium text-stone-700 mb-1"
              >
                Instagram (opcional)
              </label>
              <input
                id="instagram"
                name="instagram"
                type="text"
                className="w-full p-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="@seuusuario"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="bio"
              className="block text-sm font-medium text-stone-700 mb-1"
            >
              Bio / Sobre Você
            </label>
            <textarea
              id="bio"
              name="bio"
              className="w-full p-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all min-h-[100px]"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Conte um pouco sobre você..."
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
            leftIcon={<Save size={18} />}
          >
            Salvar Alterações
          </Button>
        </div>
      </form>

      {/* Security Section */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-stone-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-serif font-bold text-stone-800 flex items-center gap-2">
            <Lock size={20} className="text-stone-400" />
            Segurança
          </h2>
          {!showPasswordSection && (
            <button
              onClick={() => setShowPasswordSection(true)}
              className="text-sm text-primary hover:underline font-medium"
            >
              Alterar Senha
            </button>
          )}
        </div>

        {showPasswordSection && (
          <form
            onSubmit={handleChangePassword}
            className="space-y-4 animate-in fade-in slide-in-from-top-2"
          >
            <div className="p-4 bg-yellow-50 text-yellow-800 text-sm rounded-lg mb-4">
              Defina uma nova senha forte para sua conta.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-stone-700 mb-1"
                >
                  Nova Senha
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  className="w-full p-2 border border-stone-200 rounded-lg"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-stone-700 mb-1"
                >
                  Confirmar Nova Senha
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  className="w-full p-2 border border-stone-200 rounded-lg"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowPasswordSection(false);
                  setNewPassword("");
                  setConfirmPassword("");
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="outline"
                isLoading={loading}
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                Atualizar Senha
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
