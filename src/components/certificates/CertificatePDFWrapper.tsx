"use client";

import React from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { CertificateDocument } from "./CertificateTemplate";
import type { Certificate } from "@/types/certificate";
import Button from "@/components/ui/Button";
import { Download, Loader2 } from "@/components/icons";

interface CertificatePDFWrapperProps {
  certificate: Certificate;
  qrCodeDataUrl: string;
}

export default function CertificatePDFWrapper({
  certificate,
  qrCodeDataUrl,
}: CertificatePDFWrapperProps) {
  return (
    <PDFDownloadLink
      document={
        <CertificateDocument
          certificate={certificate}
          qrCodeDataUrl={qrCodeDataUrl}
        />
      }
      fileName={`certificado-${certificate.certificateNumber}.pdf`}
    >
      {({ loading: pdfLoading }) => (
        <Button disabled={pdfLoading} className="gap-2">
          {pdfLoading ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              Gerando PDF...
            </>
          ) : (
            <>
              <Download size={16} />
              Baixar Certificado PDF
            </>
          )}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
