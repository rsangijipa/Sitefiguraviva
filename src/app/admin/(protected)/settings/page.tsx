"use client";

import { useState, useEffect } from "react";
import {
  useFounderSettings,
  useInstituteSettings,
  useTeamSettings,
  useLegalSettings,
  useSEOSettings,
  useConfigSettings,
} from "@/hooks/useSiteSettings";
import {
  updateSiteSettings,
  seedSiteSettingsAction,
} from "@/app/actions/siteSettings";
import { useToast } from "@/context/ToastContext";
import {
  Save,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Upload,
  Loader2,
  User,
  Database,
  FileText,
  Search,
  Globe,
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { uploadFiles } from "@/services/uploadService";
import { cn } from "@/lib/utils";

export default function AdminContentPage() {
  const { data: founderData, refetch: refetchFounder } = useFounderSettings();
  const { data: instituteData, refetch: refetchInstitute } =
    useInstituteSettings();
  const { data: teamSettings, refetch: refetchTeam } = useTeamSettings();

  // Ensure teamMembers is always an array
  const teamMembers = teamSettings?.members || [];

  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<
    "founder" | "institute" | "team" | "legal" | "seo" | "config"
  >("founder");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [founderForm, setFounderForm] = useState<any>({});
  const [instituteForm, setInstituteForm] = useState<any>({});
  const [legalForm, setLegalForm] = useState<any>({});
  const { data: legalData, refetch: refetchLegal } = useLegalSettings({
    aggressiveRefresh: true,
  });
  const { data: seoData, refetch: refetchSeo } = useSEOSettings();
  const [seoForm, setSeoForm] = useState<any>({});
  const { data: configData, refetch: refetchConfig } = useConfigSettings();
  const [configForm, setConfigForm] = useState<any>({});

  // Member form state
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [memberForm, setMemberForm] = useState({
    id: "",
    name: "",
    role: "",
    bio: "",
    image: "",
    order: 0,
  });
  const [isAddingMember, setIsAddingMember] = useState(false);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "founder" | "team",
  ) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    setUploading(true);
    try {
      const urls = await uploadFiles([file], "avatars");
      const url = urls[0];

      if (target === "founder") {
        setFounderForm((prev) => ({ ...prev, image: url }));
      } else if (target === "team") {
        setMemberForm((prev) => ({ ...prev, image: url }));
      }
      addToast("Imagem enviada com sucesso!", "success");
    } catch (error) {
      console.error("Upload error:", error);
      addToast("Erro ao enviar imagem.", "error");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (founderData) setFounderForm(founderData);
    if (instituteData) setInstituteForm(instituteData);
    if (legalData) setLegalForm(legalData);
    if (seoData) setSeoForm(seoData);
    if (configData) setConfigForm(configData);
  }, [founderData, instituteData, legalData, seoData, configData]);

  // --- Actions ---

  const handleSeed = async () => {
    if (
      !confirm(
        "Isso irá criar os documentos padrão no banco de dados se eles não existirem. Continuar?",
      )
    )
      return;
    setLoading(true);
    const res = await seedSiteSettingsAction();
    setLoading(false);
    if (res.success) {
      addToast("Conteúdo inicial criado (Seed).", "success");
      refetchFounder();
      refetchInstitute();
      refetchTeam();
      refetchLegal();
      refetchSeo();
      refetchConfig();
    } else {
      addToast("Erro no seed: " + res.error, "error");
    }
  };

  const handleLegalSave = async () => {
    setLoading(true);
    const res = await updateSiteSettings("legal", legalForm);
    setLoading(false);
    if (res.success) {
      addToast("Políticas legais atualizadas!", "success");
      refetchLegal();
    } else {
      addToast("Erro ao atualizar: " + res.error, "error");
    }
  };

  const handleSeoSave = async () => {
    setLoading(true);
    // Ensure keywords is an array if it's a string
    const finalSeo = { ...seoForm };
    if (typeof finalSeo.keywords === "string") {
      finalSeo.keywords = finalSeo.keywords
        .split(",")
        .map((k: string) => k.trim());
    }
    const res = await updateSiteSettings("seo", finalSeo);
    setLoading(false);
    if (res.success) {
      addToast("Configurações de SEO atualizadas!", "success");
      refetchSeo();
    } else {
      addToast("Erro ao atualizar: " + res.error, "error");
    }
  };

  const handleConfigSave = async () => {
    setLoading(true);
    const res = await updateSiteSettings("config", configForm);
    setLoading(false);
    if (res.success) {
      addToast("Configurações de sistema atualizadas!", "success");
      refetchConfig();
    } else {
      addToast("Erro ao atualizar: " + res.error, "error");
    }
  };

  const handleFounderSave = async () => {
    setLoading(true);
    const res = await updateSiteSettings("founder", founderForm);
    setLoading(false);
    if (res.success) {
      addToast("Dados da fundadora atualizados!", "success");
      refetchFounder();
    } else {
      addToast("Erro ao atualizar: " + res.error, "error");
    }
  };

  const handleInstituteSave = async () => {
    setLoading(true);
    const res = await updateSiteSettings("institute", instituteForm);
    setLoading(false);
    if (res.success) {
      addToast("Dados do instituto atualizados!", "success");
      refetchInstitute();
    } else {
      addToast("Erro ao atualizar: " + res.error, "error");
    }
  };

  const handleSaveMember = async () => {
    setLoading(true);

    let newMembers = [...teamMembers];

    if (editingMember) {
      // Update existing
      newMembers = newMembers.map((m) =>
        m.id === editingMember ? { ...memberForm, id: editingMember } : m,
      );
      setEditingMember(null);
    } else {
      // Add new
      const newId = crypto.randomUUID();
      newMembers.push({ ...memberForm, id: newId, order: newMembers.length });
      setIsAddingMember(false);
    }

    const res = await updateSiteSettings("team", { members: newMembers });

    setLoading(false);
    if (res.success) {
      addToast(
        `Membro ${editingMember ? "atualizado" : "adicionado"} com sucesso!`,
        "success",
      );
      setMemberForm({
        id: "",
        name: "",
        role: "",
        bio: "",
        image: "",
        order: 0,
      });
      refetchTeam();
    } else {
      addToast("Erro ao salvar equipe: " + res.error, "error");
    }
  };

  const startEditMember = (member: any) => {
    setMemberForm(member);
    setEditingMember(member.id);
    setIsAddingMember(true);
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este membro?")) return;

    setLoading(true);
    const newMembers = teamMembers.filter((m) => m.id !== id);
    const res = await updateSiteSettings("team", { members: newMembers });
    setLoading(false);

    if (res.success) {
      addToast("Membro removido com sucesso.", "success");
      refetchTeam();
    } else {
      addToast("Erro ao remover: " + res.error, "error");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center border-b border-stone-200 pb-1">
        <div className="flex gap-4 overflow-x-auto">
          {["founder", "institute", "team", "legal", "seo", "config"].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-3 font-bold uppercase tracking-widest text-xs transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? "text-primary border-b-2 border-gold"
                    : "text-stone-400 hover:text-primary"
                }`}
              >
                {tab === "founder"
                  ? "Fundadora"
                  : tab === "institute"
                    ? "Instituto"
                    : tab === "team"
                      ? "Equipe"
                      : tab === "seo"
                        ? "SEO & Busca"
                        : tab === "config"
                          ? "Visual & Leads"
                          : "Legal"}
              </button>
            ),
          )}
        </div>
        <button
          onClick={handleSeed}
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-primary px-4 py-2 bg-stone-50 rounded hover:bg-stone-100 transition-colors"
        >
          <Database size={14} /> Sincronizar/Seed
        </button>
      </div>

      {/* FOUNDER TAB */}
      {activeTab === "founder" && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 max-w-2xl animate-fade-in-up">
          <h3 className="font-serif text-2xl text-primary mb-6">
            Editar Fundadora
          </h3>
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">
                Nome
              </label>
              <input
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg"
                value={founderForm.name || ""}
                onChange={(e) =>
                  setFounderForm({ ...founderForm, name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">
                Papel/Cargo
              </label>
              <input
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg"
                value={founderForm.role || ""}
                onChange={(e) =>
                  setFounderForm({ ...founderForm, role: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">
                Bio
              </label>
              <textarea
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg h-32"
                value={founderForm.bio || ""}
                onChange={(e) =>
                  setFounderForm({ ...founderForm, bio: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">
                Link Lattes
              </label>
              <input
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg"
                value={founderForm.link || ""}
                onChange={(e) =>
                  setFounderForm({ ...founderForm, link: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">
                Foto da Fundadora
              </label>
              <div className="flex gap-6 items-start">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-stone-100 border relative group">
                  {founderForm.image ? (
                    <div className="w-full h-full relative">
                      <Image
                        src={founderForm.image}
                        alt="Founder"
                        fill
                        className="object-cover"
                      />
                      <button
                        onClick={() =>
                          setFounderForm({ ...founderForm, image: "" })
                        }
                        className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300">
                      <User size={32} />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => handleFileUpload(e, "founder")}
                    disabled={uploading}
                  />
                  {uploading && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <Loader2 className="animate-spin" size={20} />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-stone-500 mb-2">
                    Clique na imagem para alterar a foto (Upload).
                  </p>
                  <input
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                    value={founderForm.image || ""}
                    onChange={(e) =>
                      setFounderForm({ ...founderForm, image: e.target.value })
                    }
                    placeholder="Ou cole uma URL aqui..."
                  />
                </div>
              </div>
            </div>
            <button
              onClick={handleFounderSave}
              disabled={loading}
              className="bg-primary text-white px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-gold transition-colors"
            >
              <Save size={16} /> Salvar Alterações
            </button>
          </div>
        </div>
      )}

      {/* INSTITUTE TAB */}
      {activeTab === "institute" && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 max-w-4xl animate-fade-in-up">
          <h3 className="font-serif text-2xl text-primary mb-6">
            Editar Instituto
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">
                  Título Principal
                </label>
                <input
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg"
                  value={instituteForm.title || ""}
                  onChange={(e) =>
                    setInstituteForm({
                      ...instituteForm,
                      title: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">
                  Subtítulo
                </label>
                <textarea
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg h-24"
                  value={instituteForm.subtitle || ""}
                  onChange={(e) =>
                    setInstituteForm({
                      ...instituteForm,
                      subtitle: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">
                  Endereço
                </label>
                <input
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg"
                  value={instituteForm.address || ""}
                  onChange={(e) =>
                    setInstituteForm({
                      ...instituteForm,
                      address: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">
                  Telefone
                </label>
                <input
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg"
                  value={instituteForm.phone || ""}
                  onChange={(e) =>
                    setInstituteForm({
                      ...instituteForm,
                      phone: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">
                  Título do Manifesto
                </label>
                <input
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg"
                  value={instituteForm.manifesto_title || ""}
                  onChange={(e) =>
                    setInstituteForm({
                      ...instituteForm,
                      manifesto_title: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">
                  Texto do Manifesto
                </label>
                <textarea
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg h-40"
                  value={instituteForm.manifesto_text || ""}
                  onChange={(e) =>
                    setInstituteForm({
                      ...instituteForm,
                      manifesto_text: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">
                  Frase de Destaque (Quote)
                </label>
                <input
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg"
                  value={instituteForm.quote || ""}
                  onChange={(e) =>
                    setInstituteForm({
                      ...instituteForm,
                      quote: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-stone-100">
            <button
              onClick={handleInstituteSave}
              disabled={loading}
              className="bg-primary text-white px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-gold transition-colors"
            >
              <Save size={16} /> Salvar Instituto
            </button>
          </div>
        </div>
      )}

      {/* TEAM TAB */}
      {activeTab === "team" && (
        <div className="space-y-8 animate-fade-in-up">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-2xl text-primary">
              Membros da Equipe
            </h3>
            {!isAddingMember && (
              <button
                onClick={() => {
                  setIsAddingMember(true);
                  setEditingMember(null);
                  setMemberForm({
                    id: "",
                    name: "",
                    role: "",
                    bio: "",
                    image: "",
                    order: 0,
                  });
                }}
                className="bg-gold text-white px-4 py-2 rounded-lg font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-gold-dark transition-colors"
              >
                <Plus size={16} /> Novo Membro
              </button>
            )}
          </div>

          {isAddingMember && (
            <div className="bg-white p-6 rounded-xl border-l-4 border-gold shadow-md">
              <h4 className="font-bold text-primary mb-4">
                {editingMember ? "Editar Membro" : "Novo Membro"}
              </h4>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="flex gap-4 items-center">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-stone-100 border relative group">
                    {memberForm.image ? (
                      <div className="w-full h-full relative">
                        <Image
                          src={memberForm.image}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                        <button
                          onClick={() =>
                            setMemberForm({ ...memberForm, image: "" })
                          }
                          className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-300">
                        <Upload size={24} />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => handleFileUpload(e, "team")}
                      disabled={uploading}
                    />
                    {uploading && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                        <Loader2 className="animate-spin" size={16} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">
                      Foto do Membro
                    </p>
                    <input
                      placeholder="Nome"
                      className="w-full p-3 bg-stone-50 border rounded-lg mb-2"
                      value={memberForm.name}
                      onChange={(e) =>
                        setMemberForm({ ...memberForm, name: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <input
                    placeholder="Papel/Cargo"
                    className="p-3 bg-stone-50 border rounded-lg"
                    value={memberForm.role}
                    onChange={(e) =>
                      setMemberForm({ ...memberForm, role: e.target.value })
                    }
                  />
                  <input
                    placeholder="Bio curta"
                    className="p-3 bg-stone-50 border rounded-lg"
                    value={memberForm.bio}
                    onChange={(e) =>
                      setMemberForm({ ...memberForm, bio: e.target.value })
                    }
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveMember}
                    disabled={loading}
                    className="bg-primary text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2"
                  >
                    <Save size={14} /> Salvar
                  </button>
                  <button
                    onClick={() => setIsAddingMember(false)}
                    className="bg-stone-200 text-stone-600 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member: any) => (
              <div
                key={member.id}
                className="bg-white p-6 rounded-xl border border-stone-100 hover:shadow-lg transition-all group relative"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-stone-100 relative">
                    {member.image ? (
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-stone-300">
                        ?
                      </div>
                    )}
                  </div>
                  <div>
                    <h5 className="font-bold text-primary">{member.name}</h5>
                    <span className="text-[10px] uppercase font-bold text-stone-400">
                      {member.role}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-stone-500 line-clamp-2">
                  {member.bio}
                </p>

                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEditMember(member)}
                    className="p-2 bg-stone-100 text-primary rounded hover:bg-gold hover:text-white transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteMember(member.id)}
                    className="p-2 bg-stone-100 text-red-500 rounded hover:bg-red-500 hover:text-white transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LEGAL TAB */}
      {activeTab === "legal" && (
        <div className="space-y-8 animate-fade-in-up">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-2xl text-primary">
              Políticas Legais (SSoT)
            </h3>
            <button
              onClick={handleLegalSave}
              disabled={loading}
              className="bg-primary text-white px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-gold transition-colors"
            >
              <Save size={16} /> Salvar Tudo
            </button>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* PRIVACY */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 space-y-6">
              <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
                <div className="p-2 bg-stone-50 rounded-lg text-gold">
                  <Save size={20} />
                </div>
                <h4 className="font-serif text-xl text-primary">
                  Política de Privacidade
                </h4>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-primary/40 mb-2">
                  Título do Modal
                </label>
                <input
                  className="w-full p-3 bg-stone-50 border rounded-lg"
                  value={legalForm?.privacy?.title || ""}
                  onChange={(e) =>
                    setLegalForm({
                      ...legalForm,
                      privacy: { ...legalForm.privacy, title: e.target.value },
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-primary/40 mb-2">
                  Última Atualização
                </label>
                <input
                  className="w-full p-3 bg-stone-50 border rounded-lg"
                  value={legalForm?.privacy?.lastUpdated || ""}
                  onChange={(e) =>
                    setLegalForm({
                      ...legalForm,
                      privacy: {
                        ...legalForm.privacy,
                        lastUpdated: e.target.value,
                      },
                    })
                  }
                />
              </div>

              <div className="space-y-4">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-primary/40">
                  Seções do Conteúdo
                </label>
                {(legalForm?.privacy?.content || []).map(
                  (section: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 bg-stone-50 border rounded-xl space-y-2 relative group"
                    >
                      <input
                        className="w-full bg-white border-none text-sm font-bold text-primary focus:ring-0 rounded-md"
                        value={section.heading}
                        onChange={(e) => {
                          const newContent = [...legalForm.privacy.content];
                          newContent[idx].heading = e.target.value;
                          setLegalForm({
                            ...legalForm,
                            privacy: {
                              ...legalForm.privacy,
                              content: newContent,
                            },
                          });
                        }}
                        placeholder="Título da Seção"
                      />
                      <textarea
                        className="w-full bg-white border-none text-xs text-primary/60 focus:ring-0 rounded-md min-h-[60px]"
                        value={section.text}
                        onChange={(e) => {
                          const newContent = [...legalForm.privacy.content];
                          newContent[idx].text = e.target.value;
                          setLegalForm({
                            ...legalForm,
                            privacy: {
                              ...legalForm.privacy,
                              content: newContent,
                            },
                          });
                        }}
                        placeholder="Texto da Seção"
                      />
                      <button
                        onClick={() => {
                          const newContent = legalForm.privacy.content.filter(
                            (_: any, i: number) => i !== idx,
                          );
                          setLegalForm({
                            ...legalForm,
                            privacy: {
                              ...legalForm.privacy,
                              content: newContent,
                            },
                          });
                        }}
                        className="absolute -top-2 -right-2 p-1.5 bg-white border border-red-100 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm hover:bg-red-50"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ),
                )}
                <button
                  onClick={() => {
                    const newContent = [
                      ...(legalForm?.privacy?.content || []),
                      { heading: "Nova Seção", text: "" },
                    ];
                    setLegalForm({
                      ...legalForm,
                      privacy: { ...legalForm.privacy, content: newContent },
                    });
                  }}
                  className="w-full py-3 border-2 border-dashed border-stone-200 rounded-xl text-stone-400 text-xs font-bold uppercase tracking-widest hover:border-gold hover:text-gold transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={14} /> Adicionar Seção
                </button>
              </div>
            </div>

            {/* TERMS */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 space-y-6">
              <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
                <div className="p-2 bg-stone-50 rounded-lg text-gold">
                  <FileText size={20} />
                </div>
                <h4 className="font-serif text-xl text-primary">
                  Termos de Uso
                </h4>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-primary/40 mb-2">
                  Título do Modal
                </label>
                <input
                  className="w-full p-3 bg-stone-50 border rounded-lg"
                  value={legalForm?.terms?.title || ""}
                  onChange={(e) =>
                    setLegalForm({
                      ...legalForm,
                      terms: { ...legalForm.terms, title: e.target.value },
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-primary/40 mb-2">
                  Última Atualização
                </label>
                <input
                  className="w-full p-3 bg-stone-50 border rounded-lg"
                  value={legalForm?.terms?.lastUpdated || ""}
                  onChange={(e) =>
                    setLegalForm({
                      ...legalForm,
                      terms: {
                        ...legalForm.terms,
                        lastUpdated: e.target.value,
                      },
                    })
                  }
                />
              </div>

              <div className="space-y-4">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-primary/40">
                  Seções do Conteúdo
                </label>
                {(legalForm?.terms?.content || []).map(
                  (section: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 bg-stone-50 border rounded-xl space-y-2 relative group"
                    >
                      <input
                        className="w-full bg-white border-none text-sm font-bold text-primary focus:ring-0 rounded-md"
                        value={section.heading}
                        onChange={(e) => {
                          const newContent = [...legalForm.terms.content];
                          newContent[idx].heading = e.target.value;
                          setLegalForm({
                            ...legalForm,
                            terms: { ...legalForm.terms, content: newContent },
                          });
                        }}
                        placeholder="Título da Seção"
                      />
                      <textarea
                        className="w-full bg-white border-none text-xs text-primary/60 focus:ring-0 rounded-md min-h-[60px]"
                        value={section.text}
                        onChange={(e) => {
                          const newContent = [...legalForm.terms.content];
                          newContent[idx].text = e.target.value;
                          setLegalForm({
                            ...legalForm,
                            terms: { ...legalForm.terms, content: newContent },
                          });
                        }}
                        placeholder="Texto da Seção"
                      />
                      <button
                        onClick={() => {
                          const newContent = legalForm.terms.content.filter(
                            (_: any, i: number) => i !== idx,
                          );
                          setLegalForm({
                            ...legalForm,
                            terms: { ...legalForm.terms, content: newContent },
                          });
                        }}
                        className="absolute -top-2 -right-2 p-1.5 bg-white border border-red-100 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm hover:bg-red-50"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ),
                )}
                <button
                  onClick={() => {
                    const newContent = [
                      ...(legalForm?.terms?.content || []),
                      { heading: "Nova Seção", text: "" },
                    ];
                    setLegalForm({
                      ...legalForm,
                      terms: { ...legalForm.terms, content: newContent },
                    });
                  }}
                  className="w-full py-3 border-2 border-dashed border-stone-200 rounded-xl text-stone-400 text-xs font-bold uppercase tracking-widest hover:border-gold hover:text-gold transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={14} /> Adicionar Seção
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SEO TAB */}
      {activeTab === "seo" && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 max-w-4xl animate-fade-in-up space-y-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-stone-50 rounded-lg text-primary">
                <Globe size={20} />
              </div>
              <div>
                <h3 className="font-serif text-2xl text-primary">
                  SEO & Motores de Busca
                </h3>
                <p className="text-stone-400 text-xs uppercase tracking-widest font-bold">
                  Configurações globais de visibilidade
                </p>
              </div>
            </div>
            <button
              onClick={handleSeoSave}
              disabled={loading}
              className="bg-primary text-white px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-gold transition-colors shadow-lg shadow-primary/10"
            >
              <Save size={16} /> Salvar SEO
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 mb-2">
                  Título Padrão (Meta Title)
                </label>
                <input
                  className="w-full p-4 bg-stone-50 border border-stone-100 rounded-xl focus:bg-white focus:border-gold transition-all outline-none"
                  value={seoForm.defaultTitle || ""}
                  onChange={(e) =>
                    setSeoForm({ ...seoForm, defaultTitle: e.target.value })
                  }
                  placeholder="Ex: Instituto Figura Viva | Gestalt-Terapia"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 mb-2">
                  Descrição Padrão (Meta Description)
                </label>
                <textarea
                  className="w-full p-4 bg-stone-50 border border-stone-100 rounded-xl h-32 focus:bg-white focus:border-gold transition-all outline-none resize-none"
                  value={seoForm.defaultDescription || ""}
                  onChange={(e) =>
                    setSeoForm({
                      ...seoForm,
                      defaultDescription: e.target.value,
                    })
                  }
                  placeholder="Descreva o instituto em poucas palavras para o Google..."
                />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 mb-2">
                  Palavras-chave (Keywords)
                </label>
                <textarea
                  className="w-full p-4 bg-stone-50 border border-stone-100 rounded-xl h-24 focus:bg-white focus:border-gold transition-all outline-none resize-none text-sm"
                  value={
                    Array.isArray(seoForm.keywords)
                      ? seoForm.keywords.join(", ")
                      : seoForm.keywords || ""
                  }
                  onChange={(e) =>
                    setSeoForm({ ...seoForm, keywords: e.target.value })
                  }
                  placeholder="gestalt, psicologia, formação, rondônia..."
                />
                <p className="mt-2 text-[9px] text-stone-400 uppercase font-bold tracking-widest">
                  Separe por vírgulas
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 mb-2">
                  OG Image URL (Social Share)
                </label>
                <input
                  className="w-full p-4 bg-stone-50 border border-stone-100 rounded-xl focus:bg-white focus:border-gold transition-all outline-none text-xs"
                  value={seoForm.ogImage || ""}
                  onChange={(e) =>
                    setSeoForm({ ...seoForm, ogImage: e.target.value })
                  }
                  placeholder="https://..."
                />
                {seoForm.ogImage && (
                  <div className="mt-4 relative aspect-[1.91/1] w-full rounded-xl overflow-hidden border border-stone-200 shadow-sm">
                    <img
                      src={seoForm.ogImage}
                      alt="OG Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 mb-2">
                  Google Analytics ID (G-XXXXXXX)
                </label>
                <input
                  className="w-full p-4 bg-stone-50 border border-stone-100 rounded-xl focus:bg-white focus:border-gold transition-all outline-none text-xs"
                  value={seoForm.googleAnalyticsId || ""}
                  onChange={(e) =>
                    setSeoForm({
                      ...seoForm,
                      googleAnalyticsId: e.target.value,
                    })
                  }
                  placeholder="G-XXXXXXXXXX"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIG TAB */}
      {activeTab === "config" && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 max-w-4xl animate-fade-in-up space-y-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-stone-50 rounded-lg text-primary">
                <Plus size={20} />
              </div>
              <div>
                <h3 className="font-serif text-2xl text-primary">
                  Configurações de Visual & Leads
                </h3>
                <p className="text-stone-400 text-xs uppercase tracking-widest font-bold">
                  Personalize a experiência do usuário
                </p>
              </div>
            </div>
            <button
              onClick={handleConfigSave}
              disabled={loading}
              className="bg-primary text-white px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-gold transition-colors shadow-lg shadow-primary/10"
            >
              <Save size={16} /> Salvar Configurações
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Visual Column */}
            <div className="space-y-8">
              <h4 className="text-sm font-bold uppercase tracking-widest text-gold border-b border-stone-100 pb-2">
                Ambiente e Efeitos
              </h4>

              <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
                <div>
                  <p className="text-sm font-bold text-primary">
                    Partículas de Ouro
                  </p>
                  <p className="text-[10px] text-stone-400 uppercase tracking-tighter">
                    Efeito visual de poeira dourada no fundo
                  </p>
                </div>
                <button
                  onClick={() =>
                    setConfigForm({
                      ...configForm,
                      enableParticles: !configForm.enableParticles,
                    })
                  }
                  className={cn(
                    "w-12 h-6 rounded-full transition-colors relative",
                    configForm.enableParticles ? "bg-gold" : "bg-stone-200",
                  )}
                >
                  <div
                    className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                      configForm.enableParticles ? "left-7" : "left-1",
                    )}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
                <div>
                  <p className="text-sm font-bold text-primary">
                    Controle de Áudio
                  </p>
                  <p className="text-[10px] text-stone-400 uppercase tracking-tighter">
                    Exibir botão de música meditativa
                  </p>
                </div>
                <button
                  onClick={() =>
                    setConfigForm({
                      ...configForm,
                      showAudioControl: !configForm.showAudioControl,
                    })
                  }
                  className={cn(
                    "w-12 h-6 rounded-full transition-colors relative",
                    configForm.showAudioControl !== false
                      ? "bg-gold"
                      : "bg-stone-200",
                  )}
                >
                  <div
                    className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                      configForm.showAudioControl !== false
                        ? "left-7"
                        : "left-1",
                    )}
                  />
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-primary/40 mb-4">
                  Modo Visual
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {["modern", "classic"].map((mode) => (
                    <button
                      key={mode}
                      onClick={() =>
                        setConfigForm({ ...configForm, visualMode: mode })
                      }
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all text-center",
                        configForm.visualMode === mode
                          ? "border-gold bg-gold/5 text-gold"
                          : "border-stone-100 text-stone-400",
                      )}
                    >
                      <p className="text-xs font-bold uppercase tracking-widest">
                        {mode === "modern" ? "Moderno (Glass)" : "Clássico"}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Leads Column */}
            <div className="space-y-8">
              <h4 className="text-sm font-bold uppercase tracking-widest text-gold border-b border-stone-100 pb-2">
                Captação de Leads (WhatsApp)
              </h4>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 mb-2">
                  Número do WhatsApp
                </label>
                <input
                  className="w-full p-4 bg-stone-50 border border-stone-100 rounded-xl outline-none focus:bg-white focus:border-gold transition-all"
                  placeholder="Ex: 556992481585"
                  value={configForm.whatsappNumber || ""}
                  onChange={(e) =>
                    setConfigForm({
                      ...configForm,
                      whatsappNumber: e.target.value,
                    })
                  }
                />
                <p className="mt-2 text-[9px] text-stone-400 uppercase font-bold px-2 italic">
                  Apenas números (DDI + DDD + Telefone)
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 mb-2">
                  Mensagem Pré-definida
                </label>
                <textarea
                  className="w-full p-4 bg-stone-50 border border-stone-100 rounded-xl h-32 outline-none focus:bg-white focus:border-gold transition-all resize-none"
                  placeholder="Olá, gostaria de saber mais..."
                  value={configForm.whatsappMessage || ""}
                  onChange={(e) =>
                    setConfigForm({
                      ...configForm,
                      whatsappMessage: e.target.value,
                    })
                  }
                />
              </div>

              <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl italic text-xs text-primary/60">
                Ao clicar no botão de suporte, o usuário será direcionado para
                este número com a mensagem configurada acima.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
