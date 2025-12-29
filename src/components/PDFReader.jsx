import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Download } from 'lucide-react';

const PDFReader = ({ isOpen, onClose, article }) => {
  if (!article) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col">

          {/* Top Bar */}
          <div className="flex items-center justify-between px-6 py-4 bg-primary text-white shadow-md z-10 shrink-0">
            <div className="flex flex-col">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gold mb-1">Biblioteca Figura Viva</h2>
              <p className="text-xs text-white/70 truncate max-w-[200px] md:max-w-md">{article.title}</p>
            </div>

            <button
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 w-full h-full bg-gray-100 relative overflow-hidden">

            {article.pdfUrl ? (
              // Full Screen PDF Iframe
              <iframe
                src={`${article.pdfUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                className="w-full h-full border-none block"
                title={article.title}
              />
            ) : (
              // Fallback for HTML Content (styled as a centered page)
              <div className="overflow-y-auto h-full p-8 md:p-16 custom-scrollbar">
                <div className="max-w-3xl mx-auto bg-white p-12 md:p-20 shadow-xl min-h-full">
                  <header className="text-center mb-16">
                    <h1 className="font-serif text-4xl md:text-5xl text-primary leading-tight mb-8">
                      {article.title}
                    </h1>
                    <div className="w-16 h-[1px] bg-gold/30 mx-auto" />
                  </header>
                  <div className="prose prose-stone max-w-none text-text/80 leading-relaxed font-light">
                    {article.content ? (
                      <div dangerouslySetInnerHTML={{ __html: article.content }} />
                    ) : (
                      <p className="text-center text-gray-400 italic">Conteúdo não disponível.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PDFReader;
