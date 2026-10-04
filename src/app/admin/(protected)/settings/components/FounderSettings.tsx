"use client";
import { Save, User, X, Loader2 } from "lucide-react";
interface FounderSettingsProps {
  founderForm: any;
  setFounderForm: (value: any) => void;
  handleFounderSave: () => Promise<void>;
  handleFileUpload: (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "founder" | "team",
  ) => Promise<void>;
  uploading: boolean;
  loading: boolean;
}

export default function FounderSettings({
  founderForm,
  setFounderForm,
  handleFounderSave,
  handleFileUpload,
  uploading,
  loading,
}: FounderSettingsProps) {
  return (
    <div className="max-w-4xl space-y-6 rounded-2xl border border-stone-200 bg-white p-5 sm:p-8">
      <h2 className="font-serif text-2xl text-primary">Fundadora</h2>
      {[
        { key: "name", label: "Nome" },
        { key: "role", label: "Título profissional" },
        { key: "bio", label: "Biografia e trajetória" },
        { key: "link", label: "Link do currículo Lattes" },
      ].map((field) => (
        <div key={field.key}>
          <label
            htmlFor={field.key}
            className="mb-2 block text-sm font-semibold text-primary"
          >
            {field.label}
          </label>
          {field.key === "bio" ? (
            <textarea
              id={field.key}
              rows={8}
              value={founderForm[field.key] || ""}
              onChange={(e) =>
                setFounderForm({ ...founderForm, [field.key]: e.target.value })
              }
              className="w-full rounded-lg border border-stone-200 p-3 leading-relaxed"
            />
          ) : (
            <input
              id={field.key}
              value={founderForm[field.key] || ""}
              onChange={(e) =>
                setFounderForm({ ...founderForm, [field.key]: e.target.value })
              }
              className="w-full rounded-lg border border-stone-200 p-3"
            />
          )}
        </div>
      ))}
      <div className="flex flex-col gap-5 sm:flex-row">
        <div className="h-36 w-36 shrink-0 overflow-hidden rounded-full border border-primary/20 bg-stone-100">
          {founderForm.image ? (
            <img
              src={founderForm.image}
              alt="Retrato da fundadora"
              className="h-full w-full object-cover object-top"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-primary/40">
              <User size={40} />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <label
            htmlFor="founder-photo"
            className="block text-sm font-semibold text-primary"
          >
            Alterar foto da fundadora
          </label>
          <input
            id="founder-photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => handleFileUpload(e, "founder")}
            disabled={uploading || loading}
            className="block w-full text-sm text-primary"
          />
          <p className="text-sm text-stone-500">
            JPG, PNG ou WEBP até 5 MB. Salve para publicar a nova foto.
          </p>
          {uploading && (
            <p
              role="status"
              className="flex items-center gap-2 text-sm text-primary"
            >
              <Loader2 size={18} className="animate-spin" /> Enviando foto…
            </p>
          )}
          <label
            htmlFor="founder-image-url"
            className="block text-sm font-medium text-primary"
          >
            Ou informe a URL da foto
          </label>
          <input
            id="founder-image-url"
            value={founderForm.image || ""}
            onChange={(e) =>
              setFounderForm({ ...founderForm, image: e.target.value })
            }
            className="w-full rounded-lg border border-stone-200 p-3 text-sm"
          />
          {founderForm.image && (
            <button
              type="button"
              onClick={() => setFounderForm({ ...founderForm, image: "" })}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-primary/20 px-3 text-sm text-primary"
            >
              <X size={16} /> Remover foto
            </button>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={handleFounderSave}
        disabled={loading || uploading}
        className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-white hover:bg-gold"
      >
        <Save size={18} />
        {loading ? "Salvando…" : "Salvar e publicar"}
      </button>
    </div>
  );
}
