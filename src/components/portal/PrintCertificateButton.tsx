"use client";

import { Printer } from "lucide-react";

export function PrintCertificateButton() {
    return (
        <button
            onClick={() => window.print()}
            className="bg-primary text-white px-6 py-4 rounded-full shadow-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
            title="Imprimir (Ctrl+P)"
        >
            <Printer size={20} />
            <span className="font-bold">IMPRIMIR / PDF</span>
        </button>
    );
}
