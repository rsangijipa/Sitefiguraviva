"use client";

import {
  CheckCircle2,
  XCircle,
  Award,
  Calendar,
  Clock,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface VerificationBadgeProps {
  status: "success" | "error" | "loading";
  data?: {
    studentName: string;
    courseTitle: string;
    code: string;
    issuedAt: string;
    hours?: number;
  };
  error?: string;
}

export function VerificationBadge({
  status,
  data,
  error,
}: VerificationBadgeProps) {
  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto bg-red-50 rounded-2xl border border-red-100 animate-in fade-in zoom-in-95 duration-300">
        <XCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-red-700 mb-2">
          Certificado Inválido
        </h2>
        <p className="text-red-600/80 text-sm">
          {error || "Não encontramos um certificado com este código."}
        </p>
        <Link
          href="/"
          className="mt-6 text-xs font-bold text-red-700 hover:underline uppercase tracking-wider"
        >
          Voltar ao Início
        </Link>
      </div>
    );
  }

  if (status === "success" && data) {
    return (
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-2xl mx-auto border border-stone-100 animate-in fade-in-up duration-500">
        {/* Header - Success Banner */}
        <div className="bg-green-600 text-white p-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 opacity-20 pattern-dots" />
          <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-white relative z-10" />
          <h1 className="text-2xl font-bold relative z-10">
            Certificado Verificado
          </h1>
          <p className="text-green-100 text-sm relative z-10">
            Este documento é autêntico e foi emitido pelo Instituto Figura Viva.
          </p>
        </div>

        {/* Certificate Details */}
        <div className="p-8 space-y-8 relative">
          {/* Watermark */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
            <Award className="w-64 h-64 text-stone-900" />
          </div>

          {/* Student Info */}
          <div className="text-center space-y-1 relative z-10">
            <p className="text-stone-400 text-xs font-bold uppercase tracking-widest">
              Certificado concedido a
            </p>
            <h2 className="text-3xl font-serif font-bold text-stone-800">
              {data.studentName}
            </h2>
          </div>

          {/* Divider */}
          <div className="w-16 h-1 bg-gold mx-auto rounded-full" />

          {/* Course Info */}
          <div className="text-center space-y-2 relative z-10">
            <p className="text-stone-500 text-sm">Pela conclusão do curso</p>
            <h3 className="text-xl font-bold text-primary">
              {data.courseTitle}
            </h3>

            <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-sm text-stone-600">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-stone-50 rounded-full border border-stone-100">
                <Calendar className="w-4 h-4 text-stone-400" />
                <span>
                  {new Date(data.issuedAt).toLocaleDateString("pt-BR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>

              {data.hours ? (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-stone-50 rounded-full border border-stone-100">
                  <Clock className="w-4 h-4 text-stone-400" />
                  <span>{data.hours} horas</span>
                </div>
              ) : null}
            </div>
          </div>

          {/* Meta Info */}
          <div className="bg-stone-50 rounded-xl p-4 text-center border border-stone-100">
            <p className="text-xs text-stone-400 font-mono mb-1">
              Código de Validação
            </p>
            <p className="text-sm font-mono font-bold text-stone-600 select-all">
              {data.code}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-50 p-4 text-center border-t border-stone-100">
          <Link
            href="/"
            className="text-xs font-bold text-stone-500 hover:text-primary transition-colors flex items-center justify-center gap-2"
          >
            <Image
              src="/icon-192x192.png"
              alt="Logo"
              width={20}
              height={20}
              className="opacity-50 grayscale hover:grayscale-0 transition-all rounded-full"
            />
            Instituto Figura Viva
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-12">
      <div className="animate-pulse space-y-4 text-center">
        <div className="w-12 h-12 bg-stone-200 rounded-full mx-auto" />
        <div className="h-4 w-32 bg-stone-200 rounded mx-auto" />
      </div>
    </div>
  );
}
