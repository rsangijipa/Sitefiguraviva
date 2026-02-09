"use client";

import { useState, useEffect } from "react";
import {
  useFounderSettings,
  useInstituteSettings,
  useTeamSettings,
  useLegalSettings,
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
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { uploadFiles } from "@/services/uploadService";

export default function AdminContentPage() {
  const { data: founderData, refetch: refetchFounder } = useFounderSettings();
  const { data: instituteData, refetch: refetchInstitute } =
    useInstituteSettings();
  const { data: teamSettings, refetch: refetchTeam } = useTeamSettings();

  // Ensure teamMembers is always an array
  const teamMembers = teamSettings?.members || [];

  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<
    "founder" | "institute" | "team" | "legal"
  >("founder");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [founderForm, setFounderForm] = useState<any>({});
  const [instituteForm, setInstituteForm] = useState<any>({});
  const [legalForm, setLegalForm] = useState<any>({});
  const { data: legalData, refetch: refetchLegal } = useLegalSettings();

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
  }, [founderData, instituteData, legalData]);

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
          {["founder", "institute", "team", "legal"].map((tab) => (
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
                    : "Legal"}
            </button>
          ))}
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
                    </div>
                  ),
                )}
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
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
