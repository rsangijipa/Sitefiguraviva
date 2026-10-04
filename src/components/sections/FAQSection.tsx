"use client";

import { DEFAULT_HOME, type HomeSettings } from "@/lib/site-content";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FAQSection({
  content = DEFAULT_HOME,
}: {
  content?: HomeSettings;
}) {
  const faqs = content.faqs;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="fv-section fv-section--cream fv-bg fv-bg-faq border-t border-border/60">
      <div className="fv-container max-w-4xl">
        <div className="text-center mb-16">
          <span className="fv-eyebrow mb-4">Dúvidas Comuns</span>
          <h2 className="heading-section">{content.faqTitle}</h2>
        </div>

        <div className="border-t border-border">
          {faqs.map((faq, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              viewport={{ once: true }}
              className="mb-3 overflow-hidden rounded-2xl border border-border bg-surface shadow-soft-sm"
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                aria-expanded={openIndex === idx}
                aria-controls={`faq-resposta-${idx}`}
                className="flex w-full items-center justify-between gap-6 px-5 py-5 text-left"
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
