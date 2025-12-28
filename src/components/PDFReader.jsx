import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, ArrowRight, ExternalLink } from 'lucide-react';

const PDFReader = ({ isOpen, onClose, article }) => {
  if (!article) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-primary/40 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-8 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-gold">Biblioteca</span>
                <div className="h-4 w-[1px] bg-gray-200" />
                <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-primary/40">Artigo Técnico</span>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-paper flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all duration-300"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 md:p-16 custom-scrollbar">
              <div className="max-w-3xl mx-auto">
                <header className="text-center mb-16">
                  <h1 className="font-serif text-4xl md:text-6xl text-primary leading-tight mb-8">
                    {article.title}
                  </h1>
                  <div className="flex items-center justify-center gap-4 text-[10px] font-bold uppercase tracking-widest text-text/40">
                    <span>Publicado em Artigo Técnico</span>
                    <span className="w-1 h-1 rounded-full bg-gold" />
                    <span>Leitura de aprox. 10 min</span>
                  </div>
                  <div className="w-16 h-[1px] bg-gold/30 mx-auto mt-12" />
                </header>

                <div className="prose prose-stone max-w-none text-text/80 leading-relaxed font-light space-y-8">
                  <div className="relative">
                    <div className="absolute -left-8 top-0 bottom-0 w-[1px] bg-gold/20 hidden md:block" />
                    <p className="text-sm uppercase tracking-[0.2em] text-text/40 mb-12 transform -rotate-90 origin-left absolute -left-12 top-24 hidden md:block whitespace-nowrap">
                      Licenciado para Figura Viva — 2025
                    </p>

                    <div className="space-y-6">
                      <p className="font-serif text-xl italic text-primary/90 border-b border-gray-100 pb-8 mb-8">
                        {article.reference || "Referência técnica do artigo extraído do arquivo PDF."}
                      </p>

                      {article.pdfUrl ? (
                        <div className="w-full h-[600px] bg-gray-100 rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
                          {/* Native Browser PDF Viewer */}
                          <iframe
                            src={`${article.pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                            className="w-full h-full"
                            title={article.title}
                          />
                        </div>
                      ) : article.content ? (
                        <div dangerouslySetInnerHTML={{ __html: article.content }} />
                      ) : (
                        <>
                          <p>
                            A Gestalt-terapia, enquanto abordagem fenomenológico-existencial, propõe um olhar integrativo para o sofrimento humano.
                            Este artigo explora as nuances da fronteira de contato e a importância da awareness no processo de cura.
                          </p>
                          <p>
                            Através de uma análise qualitativa, observamos que o fenômeno da 'presença' atua como catalisador para a reorganização do campo.
                            Quando o terapeuta se disponibiliza para o encontro autêntico, as polaridades emergem e encontram seu espaço de integração.
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-paper border-t border-gray-100 flex items-center justify-center">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary hover:text-gold transition-colors"
              >
                <FileText size={14} /> Imprimir / Salvar PDF
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PDFReader;
