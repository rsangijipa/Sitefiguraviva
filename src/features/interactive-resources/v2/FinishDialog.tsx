"use client";
import { Download, FolderPlus } from "lucide-react";
import { Button, Dialog } from "./ui";

/** Nome seguro de arquivo: o próprio nome do recurso, para identificar cada registro na pasta. */
export function recordFileName(slug: string) { return `${slug.replace(/[^a-z0-9-]/gi, "-").toLowerCase()}.json`; }

export function buildRecordFile({ slug, title, mode, draft, contentVersion }: { slug: string; title: string; mode: string; draft: unknown; contentVersion: string | null }) {
  return JSON.stringify({ recurso: slug, titulo: title, modo: mode, salvoEm: new Date().toISOString(), versaoDoConteudo: contentVersion, registro: draft ?? null }, null, 2);
}

/** Mini janela de encerramento: explica que nada fica salvo e oferece guardar em arquivo JSON. */
export function FinishDialog({ open, slug, title, mode, draft, contentVersion, canSaveHistory, onClose, onSaveHistory, onLeave }: {
  open: boolean; slug: string; title: string; mode: string; draft: unknown; contentVersion: string | null; canSaveHistory: boolean;
  onClose: () => void; onSaveHistory: () => void; onLeave: () => void;
}) {
  const download = () => {
    const blob = new Blob([buildRecordFile({ slug, title, mode, draft, contentVersion })], { type: "application/json" });
    const url = URL.createObjectURL(blob); const link = document.createElement("a");
    link.href = url; link.download = recordFileName(slug); document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
  };
  return <Dialog title="O que fica desta experiência?" open={open} onClose={onClose}>
    <div className="fv-finish">
      <p>Nada fica salvo automaticamente. Se você sair agora, o que fez nesta tela será descartado. Para continuar navegando pelos recursos sem perder nada, salve antes.</p>
      <div className="fv-finish-box">
        <strong><Download size={16} aria-hidden="true" /> Salvar em um arquivo JSON</strong>
        <p>O arquivo é baixado com o nome do recurso (<code>{recordFileName(slug)}</code>) e fica só no seu computador.</p>
        <p className="fv-finish-tip"><FolderPlus size={15} aria-hidden="true" /> Dica: crie uma pasta, como “Registros Figura Viva”, e guarde nela os arquivos de todos os recursos.</p>
        <div className="fv-actions"><Button onClick={download}>Baixar {recordFileName(slug)}</Button>{canSaveHistory && <Button secondary onClick={onSaveHistory}>Guardar no meu histórico</Button>}</div>
      </div>
      <div className="fv-actions"><Button secondary onClick={onLeave}>Encerrar sem salvar</Button></div>
    </div>
  </Dialog>;
}
