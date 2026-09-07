"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "Os cursos possuem certificado?",
    answer:
      "Sim. Todos os nossos cursos e vivências emitem certificado digital de participação e conclusão, válidos como horas complementares e atualização profissional.",
  },
  {
    question: "As aulas são ao vivo ou gravadas?",
    answer:
      "Oferecemos um modelo híbrido. A base teórica está disponível em aulas gravadas de alta qualidade para você assistir quando quiser, complementada por encontros ao vivo para dúvidas e práticas.",
  },
  {
    question: "Preciso ser psicólogo para participar?",
    answer:
      "Nossos cursos de Introdução são abertos a todos interessados no desenvolvimento humano. Já as Formações Clínicas são exclusivas para psicólogos e estudantes de psicologia a partir do 7º período.",
  },
  {
    question: "Como funciona o acesso à plataforma?",
    answer:
      "O acesso é imediato após a confirmação da matrícula. Você terá um login exclusivo em nossa Área do Aluno, onde encontrará todo o material, comunidade e suporte.",
  },
  {
    question: "E se eu não me adaptar à metodologia?",
    answer:
      "Prezamos pela sua satisfação. Oferecemos uma garantia incondicional de 7 dias. Se sentir que não é o momento, devolvemos seu investimento integralmente.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="fv-section fv-section--cream fv-bg fv-bg-faq border-t border-border/60">
      <div className="fv-container max-w-4xl">
        <div className="text-center mb-16">
          <span className="fv-eyebrow mb-4">Dúvidas Comuns</span>
          <h2 className="heading-section">Perguntas Frequentes</h2>
        </div>

        <div className="border-t border-border">
          {faqs.map((faq, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              viewport={{ once: true }}
              className="overflow-hidden border-b border-border"
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                aria-expanded={openIndex === idx}
                aria-controls={`faq-resposta-${idx}`}
                className="flex w-full items-center justify-between gap-6 py-6 text-left"
              >
                <span
                  className={cn(
                    "font-serif text-lg font-semibold transition-colors",
                    openIndex === idx ? "text-primary" : "text-text/80",
                  )}
                >
                  {faq.question}
                </span>
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border transition-colors duration-300",
                    openIndex === idx
                      ? "border-igarape text-igarape"
                      : "border-border text-muted",
                  )}
                >
                  {openIndex === idx ? (
                    <Minus size={16} aria-hidden />
                  ) : (
                    <Plus size={16} aria-hidden />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {openIndex === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div
                      id={`faq-resposta-${idx}`}
                      className="max-w-[62ch] pb-8 pr-14 leading-relaxed text-text/75"
                    >
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
