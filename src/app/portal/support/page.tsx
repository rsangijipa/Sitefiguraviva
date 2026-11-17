import Link from "next/link";
import { BookOpen, Compass, Mail, GraduationCap, ArrowUpRight } from "lucide-react";
import { PUBLIC_CONTACT_EMAIL } from "@/features/public-site/content/contact";

const questions = [
  { title: "Como retomo meus estudos?", body: "Abra Meus Cursos, escolha sua formação e use Continuar. Dentro do curso, a aba Conteúdo lista os módulos e as aulas. No celular e no tablet, abra a lista pelo botão de aulas durante o estudo." },
  { title: "Por que uma aula aparece bloqueada?", body: "Algumas aulas dependem da conclusão de etapas anteriores ou de uma liberação da equipe. Leia o aviso junto à aula. Se sua matrícula estiver em análise, acompanhe a inscrição antes de iniciar o curso." },
  { title: "Onde encontro minhas notas e devolutivas?", body: "Abra o curso e escolha a aba Notas. Ela reúne a situação das avaliações, as notas disponíveis e as devolutivas publicadas pela equipe." },
  { title: "Como guardo uma experiência dos recursos?", body: "Quando o recurso permitir um registro, conclua a experiência e escolha guardá-lo. Digitar uma resposta não a salva automaticamente. Consulte o histórico em Meus registros, no menu lateral." },
  { title: "O vídeo ou o material não abriu. O que faço?", body: "Verifique sua conexão e tente recarregar a página. Materiais podem abrir em outra aba. Se o problema continuar, envie ao suporte o nome do curso, o título da aula e a mensagem apresentada. Nunca envie sua senha ou respostas pessoais de experiências." },
  { title: "Onde encontro meu certificado?", body: "Acesse Certificados pelo menu lateral. A emissão depende das condições de conclusão da formação, incluindo avaliações obrigatórias quando houver. O progresso e a aba Notas ajudam a conferir seu percurso." },
];

export default function SupportPage() {
  return <div className="space-y-8">
    <header className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 sm:p-8">
      <p className="text-sm font-semibold text-emerald-700">Conte com a gente</p>
      <h1 className="mt-2 font-serif text-3xl sm:text-4xl text-emerald-950">Ajuda para seguir aprendendo</h1>
      <p className="mt-3 max-w-2xl text-base text-emerald-900">Encontre seu próximo passo ou fale com a equipe Figura Viva.</p>
    </header>
    <section aria-label="Atalhos de ajuda" className="grid gap-4 sm:grid-cols-3">
      {[
        { href: "/portal/courses", title: "Continuar um curso", description: "Aulas, materiais e notas", icon: BookOpen },
        { href: "/portal/recursos", title: "Explorar os recursos", description: "Experiências da formação", icon: Compass },
        { href: "/portal/certificates", title: "Ver certificados", description: "Seu percurso concluído", icon: GraduationCap },
      ].map(({ href, title, description, icon: Icon }) => <Link key={href} href={href} className="rounded-2xl border border-stone-200 bg-white p-5 hover:border-emerald-400 transition-colors">
        <Icon size={24} className="text-primary" aria-hidden="true" /><h2 className="mt-4 text-base font-semibold text-stone-800">{title}</h2><p className="mt-1 text-sm text-stone-600">{description}</p>
      </Link>)}
    </section>
    <section aria-labelledby="student-help-title" className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-6">
      <h2 id="student-help-title" className="mb-4 font-serif text-2xl text-stone-800">Dúvidas do dia a dia</h2>
      <div className="divide-y divide-stone-100">{questions.map(question => <details key={question.title} className="py-2">
        <summary className="min-h-12 cursor-pointer py-3 pr-3 text-base font-semibold text-stone-800">{question.title}</summary>
        <p className="pb-4 max-w-3xl text-base leading-relaxed text-stone-600">{question.body}</p>
      </details>)}</div>
    </section>
    <aside className="rounded-2xl border border-blue-200 bg-blue-50 p-5 sm:p-6">
      <div className="flex gap-3"><Mail className="shrink-0 text-blue-800" aria-hidden="true" /><div><h2 className="text-lg font-semibold text-blue-950">Precisa falar com a equipe?</h2><p className="mt-2 text-sm text-blue-900">Inclua o curso, a aula e uma descrição do problema. Evite enviar dados sensíveis.</p></div></div>
      <a href={`mailto:${PUBLIC_CONTACT_EMAIL}`} className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-xl bg-blue-900 px-4 py-3 font-semibold text-white">Enviar e-mail ao suporte <ArrowUpRight size={18} aria-hidden="true" /></a>
    </aside>
  </div>;
}
