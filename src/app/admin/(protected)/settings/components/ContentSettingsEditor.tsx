"use client";
import { Plus, Trash2 } from "lucide-react";

export type ContentField = {
  key: string;
  label: string;
  multiline?: boolean;
  hint?: string;
};
export default function ContentSettingsEditor({
  fields,
  value,
  onChange,
}: {
  fields: ContentField[];
  value: Record<string, any>;
  onChange: (value: Record<string, any>) => void;
}) {
  return (
    <div className="space-y-6">
      {fields.map((field) => (
        <div key={field.key}>
          <label
            htmlFor={field.key}
            className="mb-2 block text-sm font-semibold text-primary"
          >
            {field.label}
          </label>
          {field.multiline ? (
            <textarea
              id={field.key}
              rows={field.key === "manifesto_body" ? 12 : 4}
              value={value[field.key] || ""}
              onChange={(e) =>
                onChange({ ...value, [field.key]: e.target.value })
              }
              className="w-full rounded-lg border border-stone-200 bg-white p-3 leading-relaxed"
            />
          ) : (
            <input
              id={field.key}
              value={value[field.key] || ""}
              onChange={(e) =>
                onChange({ ...value, [field.key]: e.target.value })
              }
              className="w-full rounded-lg border border-stone-200 bg-white p-3"
            />
          )}
          {field.hint && (
            <p className="mt-2 text-sm text-stone-500">{field.hint}</p>
          )}
        </div>
      ))}
      {Array.isArray(value.faqs) && (
        <fieldset className="space-y-4">
          <legend className="mb-3 font-serif text-xl text-primary">
            Perguntas e respostas da homepage
          </legend>
          {value.faqs.map(
            (faq: { question: string; answer: string }, index: number) => (
              <div
                key={index}
                className="space-y-3 rounded-xl border border-stone-200 bg-stone-50 p-4"
              >
                <label className="block text-sm font-medium text-primary">
                  Pergunta {index + 1}
                  <input
                    value={faq.question}
                    onChange={(e) =>
                      onChange({
                        ...value,
                        faqs: value.faqs.map((item: unknown, i: number) =>
                          i === index
                            ? { ...faq, question: e.target.value }
                            : item,
                        ),
                      })
                    }
                    className="mt-2 w-full rounded-lg border border-stone-200 bg-white p-3"
                  />
                </label>
                <label className="block text-sm font-medium text-primary">
                  Resposta
                  <textarea
                    rows={4}
                    value={faq.answer}
                    onChange={(e) =>
                      onChange({
                        ...value,
                        faqs: value.faqs.map((item: unknown, i: number) =>
                          i === index
                            ? { ...faq, answer: e.target.value }
                            : item,
                        ),
                      })
                    }
                    className="mt-2 w-full rounded-lg border border-stone-200 bg-white p-3"
                  />
                </label>
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ...value,
                      faqs: value.faqs.filter(
                        (_: unknown, i: number) => i !== index,
                      ),
                    })
                  }
                  className="flex min-h-11 items-center gap-2 rounded-lg border border-red-200 px-3 text-sm text-red-700"
                >
                  <Trash2 size={16} /> Remover pergunta {index + 1}
                </button>
              </div>
            ),
          )}
          <button
            type="button"
            onClick={() =>
              onChange({
                ...value,
                faqs: [...value.faqs, { question: "", answer: "" }],
              })
            }
            className="flex min-h-11 items-center gap-2 rounded-lg border border-primary/25 px-4 text-sm font-semibold text-primary"
          >
            <Plus size={16} /> Adicionar pergunta
          </button>
        </fieldset>
      )}
      {typeof value.showAudioControl === "boolean" && (
        <label className="flex min-h-11 items-center gap-3 text-sm font-medium text-primary">
          <input
            type="checkbox"
            checked={value.showAudioControl}
            onChange={(e) =>
              onChange({ ...value, showAudioControl: e.target.checked })
            }
          />{" "}
          Mostrar controle de som ambiente
        </label>
      )}
    </div>
  );
}
