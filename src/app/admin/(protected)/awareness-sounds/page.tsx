import { AdminPageShell } from "@/components/admin/AdminPageShell";
export default function AwarenessSoundsAdminPage() {
  return (
    <AdminPageShell
      title="Sons para Awareness"
      description="Catálogo editorial de cenas sonoras."
    >
      <section className="rounded-2xl border border-[#D8CFBE] bg-[#FDFAF4] p-6">
        <h2 className="font-serif text-2xl text-primary">
          Nenhuma cena publicada
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-[#262B22]">
          O upload não está disponível nesta fase. Uma cena só poderá ser
          publicada quando tiver arquivo reproduzível, MIME, duração, tamanho,
          licença, autoria, URL de origem, hash, versão e descrição textual
          validados.
        </p>
        <p className="mt-3 text-sm text-[#6B6B63]">
          Este catálogo não exibe observações ou registros privados de
          estudantes.
        </p>
      </section>
    </AdminPageShell>
  );
}
