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
import { Database } from "lucide-react";
import { uploadFiles } from "@/services/uploadService";
import FounderSettings from "./components/FounderSettings";
import InstituteSettings from "./components/InstituteSettings";
import TeamSettings from "./components/TeamSettings";
import LegalSettings from "./components/LegalSettings";
import SeoSettings from "./components/SeoSettings";
import ConfigSettings from "./components/ConfigSettings";

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

      {activeTab === "founder" && (
        <FounderSettings
          founderForm={founderForm}
          setFounderForm={setFounderForm}
          handleFounderSave={handleFounderSave}
          handleFileUpload={handleFileUpload}
          uploading={uploading}
          loading={loading}
        />
      )}

      {activeTab === "institute" && (
        <InstituteSettings
          instituteForm={instituteForm}
          setInstituteForm={setInstituteForm}
          handleInstituteSave={handleInstituteSave}
          loading={loading}
        />
      )}

      {activeTab === "team" && (
        <TeamSettings
          teamMembers={teamMembers}
          memberForm={memberForm}
          setMemberForm={setMemberForm}
          editingMember={editingMember}
          setEditingMember={setEditingMember}
          isAddingMember={isAddingMember}
          setIsAddingMember={setIsAddingMember}
          handleSaveMember={handleSaveMember}
          startEditMember={startEditMember}
          handleDeleteMember={handleDeleteMember}
          handleFileUpload={handleFileUpload}
          uploading={uploading}
          loading={loading}
        />
      )}

      {activeTab === "legal" && (
        <LegalSettings
          legalForm={legalForm}
          setLegalForm={setLegalForm}
          handleLegalSave={handleLegalSave}
          loading={loading}
        />
      )}

      {activeTab === "seo" && (
        <SeoSettings
          seoForm={seoForm}
          setSeoForm={setSeoForm}
          handleSeoSave={handleSeoSave}
          loading={loading}
        />
      )}

      {activeTab === "config" && (
        <ConfigSettings
          configForm={configForm}
          setConfigForm={setConfigForm}
          handleConfigSave={handleConfigSave}
          loading={loading}
        />
      )}
    </div>
  );
}
