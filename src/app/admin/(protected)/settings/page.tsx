"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Save, ExternalLink } from "lucide-react";
import {
  DEFAULT_FOUNDER,
  DEFAULT_INSTITUTE,
  DEFAULT_HOME,
  DEFAULT_CONFIG,
  DEFAULT_LEGAL,
  DEFAULT_SEO,
  getSiteSettings,
} from "@/lib/siteSettings";
import { updateSiteSettings } from "@/app/actions/siteSettings";
import { useToast } from "@/context/ToastContext";
import { uploadFiles } from "@/services/uploadService";
import FounderSettings from "./components/FounderSettings";
import LegalSettings from "./components/LegalSettings";
import SeoSettings from "./components/SeoSettings";
import ContentSettingsEditor, {
  type ContentField,
} from "./components/ContentSettingsEditor";

const sections = {
  home: {
    label: "Homepage",
    defaults: DEFAULT_HOME,
    path: "/",
    description:
      "Textos de abertura, formações, blog, biblioteca e perguntas frequentes da página inicial.",
  },
  founder: {
    label: "Fundadora",
    defaults: DEFAULT_FOUNDER,
    path: "/instituto/fundadora",
    description:
      "Nome, título profissional, biografia e retrato da fundadora. A foto também aparece na página do Instituto.",
  },
  institute: {
    label: "Instituto e manifesto",
    defaults: DEFAULT_INSTITUTE,
    path: "/instituto",
    description:
      "Apresentação do Instituto, resumo institucional e página do manifesto. O endereço aparece no rodapé; o WhatsApp é editado na aba Contato e som.",
  },
  config: {
    label: "Contato e som",
    defaults: DEFAULT_CONFIG,
    path: "/",
    description:
      "WhatsApp dos botões de contato e visibilidade do controle de som ambiente.",
  },
  seo: {
    label: "SEO e busca",
    defaults: DEFAULT_SEO,
    path: "/",
    description: "Título, descrição e imagem de compartilhamento da homepage.",
  },
  legal: {
    label: "Privacidade e termos",
    defaults: DEFAULT_LEGAL,
    path: "/privacidade",
    description:
      "Documentos publicados nas páginas de privacidade e termos de uso.",
  },
};
type Section = keyof typeof sections;
const homeFields: ContentField[] = [
  { key: "heroTitle", label: "Título de abertura" },
  { key: "heroAccent", label: "Nome em destaque" },
  { key: "heroDescription", label: "Texto de abertura", multiline: true },
  { key: "coursesTitle", label: "Título da seção de formações" },
  {
    key: "coursesDescription",
    label: "Apresentação das formações",
    multiline: true,
  },
  { key: "blogTitle", label: "Título do blog" },
  { key: "libraryTitle", label: "Título da biblioteca" },
  {
    key: "blogDescription",
    label: "Apresentação do blog e da biblioteca",
    multiline: true,
  },
  { key: "faqTitle", label: "Título das perguntas frequentes" },
];
const instituteFields: ContentField[] = [
  { key: "title", label: "Título da página do Instituto" },
  { key: "subtitle", label: "Apresentação do Instituto", multiline: true },
  { key: "manifesto_title", label: "Título do manifesto" },
  {
    key: "manifesto_text",
    label: "Resumo do manifesto na página do Instituto",
    multiline: true,
  },
  {
    key: "manifesto_description",
    label: "Apresentação da página do manifesto",
    multiline: true,
  },
  {
    key: "manifesto_body",
    label: "Texto completo do manifesto",
    multiline: true,
    hint: "Separe os parágrafos com uma linha em branco.",
  },
  { key: "quote", label: "Frase em destaque no manifesto" },
  { key: "address", label: "Endereço no rodapé" },
];
const configFields: ContentField[] = [
  {
    key: "whatsappNumber",
    label: "WhatsApp",
    hint: "DDI + DDD + telefone, apenas números. Ex.: 5569992481585.",
  },
  {
    key: "whatsappMessage",
    label: "Mensagem inicial do WhatsApp",
    multiline: true,
  },
];

export default function AdminContentPage() {
  const [active, setActive] = useState<Section>("home");
  const [drafts, setDrafts] = useState<
    Partial<Record<Section, Record<string, any>>>
  >({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { addToast } = useToast();
  const client = useQueryClient();
  const section = sections[active];
  const query = useQuery({
    queryKey: ["siteSettings", active],
    queryFn: () => getSiteSettings(active, section.defaults, true),
    staleTime: 0,
  });
  useEffect(() => {
    if (query.data && !query.isFetching && !query.isError)
      setDrafts((prev) =>
        prev[active] ? prev : { ...prev, [active]: query.data },
      );
  }, [active, query.data, query.isFetching, query.isError]);
  const form = drafts[active] || query.data || {};
  const setForm = (value: Record<string, any>) =>
    setDrafts((prev) => ({ ...prev, [active]: value }));
  const save = async () => {
    setLoading(true);
    try {
      const payload: Record<string, any> = { ...form };
      if (active === "seo" && typeof payload.keywords === "string")
        payload.keywords = payload.keywords
          .split(",")
          .map((item: string) => item.trim())
          .filter(Boolean);
      const result = await updateSiteSettings(active, payload);
      if (!result.success) throw new Error(result.error);
      await client.invalidateQueries({ queryKey: ["siteSettings", active] });
      addToast("Alterações publicadas com sucesso.", "success");
    } catch (error) {
      addToast(
        error instanceof Error
          ? error.message
          : "Erro ao salvar as configurações.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };
  const upload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const [image] = await uploadFiles([file], "founder");
      setDrafts((prev) => ({
        ...prev,
        founder: { ...(prev.founder || form), image },
      }));
      addToast("Foto enviada. Salve as alterações para publicá-la.", "success");
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : "Erro ao enviar a foto.",
        "error",
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };
  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="font-serif text-3xl text-primary">Conteúdo do site</h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-600">
          Edite os conteúdos das páginas atuais. Os cursos e seus perfis de
          mediadoras são gerenciados em Cursos; artigos, documentos e fotos têm
          suas próprias páginas de cadastro.
        </p>
      </div>
      <nav
        aria-label="Seções das configurações"
        className="flex max-w-full gap-2 overflow-x-auto border-b border-stone-200 pb-2"
      >
        {(Object.keys(sections) as Section[]).map((key) => (
          <button
            key={key}
            type="button"
            disabled={loading || uploading}
            aria-current={active === key ? "page" : undefined}
            onClick={() => setActive(key)}
            className={
              "min-h-11 whitespace-nowrap rounded-lg px-4 text-sm font-semibold " +
              (active === key
                ? "bg-primary text-white"
                : "text-primary hover:bg-stone-100")
            }
          >
            {sections[key].label}
          </button>
        ))}
      </nav>
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-primary/15 bg-primary/5 p-5">
        <p className="max-w-2xl text-sm leading-relaxed text-primary/80">
          {section.description}
        </p>
        <a
          href={section.path}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary underline underline-offset-4"
        >
          Ver página <ExternalLink size={16} />
        </a>
      </div>
      {query.isLoading || (query.isFetching && !drafts[active]) ? (
        <p role="status">Carregando conteúdo salvo…</p>
      ) : query.isError ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 p-5 text-red-700"
        >
          Não foi possível carregar as configurações.
          <button onClick={() => query.refetch()} className="ml-3 underline">
            Tentar novamente
          </button>
        </div>
      ) : (
        <fieldset disabled={loading || uploading} className="min-w-0">
          {active === "founder" ? (
            <FounderSettings
              founderForm={form}
              setFounderForm={setForm}
              handleFounderSave={save}
              handleFileUpload={upload}
              uploading={uploading}
              loading={loading || uploading}
            />
          ) : active === "legal" ? (
            <LegalSettings
              legalForm={form}
              setLegalForm={setForm}
              handleLegalSave={save}
              loading={loading}
            />
          ) : active === "seo" ? (
            <SeoSettings
              seoForm={form}
              setSeoForm={setForm}
              handleSeoSave={save}
              loading={loading}
            />
          ) : (
            <div className="max-w-4xl space-y-8 rounded-2xl border border-stone-200 bg-white p-5 sm:p-8">
              <ContentSettingsEditor
                fields={
                  active === "home"
                    ? homeFields
                    : active === "institute"
                      ? instituteFields
                      : configFields
                }
                value={form}
                onChange={setForm}
              />
              <button
                type="button"
                onClick={save}
                disabled={loading || uploading}
                className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-white hover:bg-gold"
              >
                <Save size={18} />
                {loading ? "Salvando…" : "Salvar e publicar"}
              </button>
            </div>
          )}
        </fieldset>
      )}
    </div>
  );
}
