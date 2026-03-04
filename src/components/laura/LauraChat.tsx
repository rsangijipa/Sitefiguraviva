"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import Image from "next/image";
import { chatWithLaura } from "@/app/actions/chat-laura";

interface Message {
  role: "user" | "laura";
  text: string;
}

export function LauraChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "laura",
      text: "Olá. Que bom que chegou até aqui. O que te traz curiosidade neste momento?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setIsLoading(true);

    try {
      const historyMsgFormat = messages.map((m) => ({
        role: m.role === "laura" ? "model" : "user",
        parts: [{ text: m.text }],
      }));

      const response = await chatWithLaura(userMessage, historyMsgFormat);
      setMessages((prev) => [
        ...prev,
        { role: "laura", text: response || "Silêncio..." },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "laura",
          text: "Parece que a poeira do tempo nos separou aqui... (Erro de conexão)",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: isOpen ? 0 : 1, scale: isOpen ? 0 : 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 p-4 bg-[#8a7a6a] text-white rounded-full shadow-lg border border-[#6a5a4a] flex items-center justify-center pointer-events-auto"
        style={{ pointerEvents: isOpen ? "none" : "auto" }}
      >
        <MessageCircle size={24} />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-6 right-6 md:bottom-10 md:right-10 w-[90vw] md:w-[400px] h-[550px] max-h-[80vh] bg-[#e8e4db] rounded-sm shadow-2xl border-2 border-[#b8ad96] flex flex-col z-[10000] overflow-hidden font-sans"
          >
            {/* Header */}
            <div className="bg-[#d9d4c9] p-4 flex items-center justify-between border-b border-[#b8ad96]">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#8a7a6a]">
                  <Image
                    src="/laura/laura.jpg"
                    alt="Laura Perls"
                    fill
                    className="object-cover sepia-[0.3]"
                  />
                </div>
                <div>
                  <h3 className="font-serif text-[#3a2f25] font-bold leading-tight">
                    Laura Perls
                  </h3>
                  <p className="text-xs text-[#6a5a4a] italic">
                    Arquivo Vivo (IA)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#6a5a4a] hover:text-[#3a2f25] transition-colors"
                aria-label="Verberg Chat"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div
              ref={scrollRef}
              className="flex-1 p-4 overflow-y-auto space-y-4 bg-opacity-50"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                backgroundBlendMode: "multiply",
              }}
            >
              <div className="text-center text-xs text-[#8a7a6a] uppercase tracking-widest mb-6">
                Hoje, Aqui e Agora
              </div>

              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-md shadow-sm border ${
                      msg.role === "user"
                        ? "bg-[#a88a4d] text-white border-[#8a7a6a] rounded-tr-none"
                        : "bg-white text-[#4a3a2a] border-[#b8ad96] rounded-tl-none font-serif"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] p-3 rounded-md shadow-sm bg-white text-[#4a3a2a] border border-[#b8ad96] rounded-tl-none flex items-center gap-2">
                    <Loader2
                      size={16}
                      className="animate-spin text-[#8a7a6a]"
                    />
                    <span className="text-sm italic text-[#8a7a6a]">
                      Refletindo...
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-3 bg-[#e8e4db] border-t border-[#b8ad96]">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSend();
                  }}
                  disabled={isLoading}
                  placeholder="Fale comigo..."
                  className="w-full bg-white border border-[#b8ad96] rounded-full pl-4 pr-12 py-2.5 text-sm text-[#3a2f25] focus:outline-none focus:ring-1 focus:ring-[#a88a4d] placeholder:text-[#a88a4d]/50"
                  autoComplete="off"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 p-1.5 text-[#8a7a6a] hover:text-[#a88a4d] disabled:opacity-50 transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
              <div className="text-center mt-2 text-[10px] text-[#8a7a6a] italic">
                Sinta o seu corpo enquanto digita.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
