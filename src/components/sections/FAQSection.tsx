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
    <section className="section-padding bg-paper border-t border-primary/5">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-gold mb-4 block">
            Dúvidas Comuns
          </span>
          <h2 className="heading-section">Perguntas Frequentes</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              viewport={{ once: true }}
              className={cn(
                "bg-white rounded-2xl border transition-all duration-300 overflow-hidden",
                openIndex === idx
                  ? "border-gold/30 shadow-soft-md"
                  : "border-transparent shadow-none hover:border-gold/10",
              )}
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span
                  className={cn(
                    "font-serif text-lg font-bold transition-colors",
                    openIndex === idx ? "text-primary" : "text-primary/70",
                  )}
                >
                  {faq.question}
                </span>
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                    openIndex === idx
                      ? "bg-gold text-white rotate-180"
                      : "bg-paper text-primary/50",
                  )}
                >
                  {openIndex === idx ? <Minus size={16} /> : <Plus size={16} />}
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
                    <div className="px-6 pb-6 pt-0 text-primary/70 leading-relaxed font-light">
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
