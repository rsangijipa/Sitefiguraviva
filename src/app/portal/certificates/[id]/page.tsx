"use client";

// Client component because we might want to print/download nicely
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function CertificateViewer() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100">
      <div className="text-center p-10 bg-white rounded shadow">
        <h1 className="text-2xl font-serif mb-4">
          Visualizador de Certificado
        </h1>
        <p className="text-stone-500 mb-6">
          Esta funcionalidade está em construção (V1.2).
        </p>
        <p className="text-sm text-stone-400">
          O certificado foi gerado e é válido. <br />
          Você pode validá-lo usando o código público.
        </p>
      </div>
    </div>
  );
}
