import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { Certificate } from "@/types/analytics";

// Register fonts (optional - use web fonts)
// Font.register({
//   family: 'Roboto',
//   src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf'
// });

interface CertificateDocumentProps {
  certificate: Certificate;
  qrCodeDataUrl: string;
}

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 40,
    fontFamily: "Helvetica",
  },
  border: {
    border: "8px solid #3B7F6D",
    borderRadius: 12,
    padding: 40,
    height: "100%",
    position: "relative",
  },
  innerBorder: {
    border: "2px solid #C8A870",
    borderRadius: 8,
    padding: 30,
    height: "100%",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  header: {
    textAlign: "center",
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 10,
    alignSelf: "center",
  },
  institutionName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3B7F6D",
    marginBottom: 5,
  },
  certificateTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#C8A870",
    textTransform: "uppercase",
    letterSpacing: 3,
    marginTop: 20,
  },
  body: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  certifyText: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 1.6,
  },
  studentName: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1F2937",
    marginVertical: 15,
    textTransform: "uppercase",
    borderBottom: "2px solid #C8A870",
    paddingBottom: 5,
  },
  courseInfo: {
    fontSize: 12,
    textAlign: "center",
    marginVertical: 15,
    lineHeight: 1.8,
  },
  courseName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3B7F6D",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 30,
    paddingTop: 20,
    borderTop: "1px solid #E5E7EB",
  },
  signatureBlock: {
    flexDirection: "column",
    alignItems: "center",
    flex: 1,
  },
  signatureLine: {
    width: 150,
    borderTop: "1px solid #000",
    marginBottom: 5,
  },
  signatureName: {
    fontSize: 10,
    fontWeight: "bold",
  },
  signatureTitle: {
    fontSize: 8,
    color: "#6B7280",
  },
  qrCodeBlock: {
    flexDirection: "column",
    alignItems: "center",
  },
  qrCode: {
    width: 80,
    height: 80,
    marginBottom: 5,
  },
  qrText: {
    fontSize: 7,
    color: "#6B7280",
  },
  certNumber: {
    fontSize: 8,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 10,
  },
  metadata: {
    position: "absolute",
    bottom: 10,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7,
    color: "#9CA3AF",
  },
});

export const CertificateDocument: React.FC<CertificateDocumentProps> = ({
  certificate,
  qrCodeDataUrl,
}) => {
  const formatDate = (timestamp: any) => {
    const date = timestamp?.toDate?.() || new Date(timestamp);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.border}>
          <View style={styles.innerBorder}>
            {/* Header */}
            <View style={styles.header}>
              {/* Logo placeholder - replace with actual logo */}
              <Text style={styles.institutionName}>INSTITUTO FIGURA VIVA</Text>
              <Text style={{ fontSize: 10, color: "#6B7280" }}>
                CNPJ: 00.000.000/0001-00
              </Text>
            </View>

            {/* Certificate Title */}
            <View>
              <Text style={styles.certificateTitle}>CERTIFICADO</Text>
            </View>

            {/* Body */}
            <View style={styles.body}>
              <Text style={styles.certifyText}>Certificamos que</Text>

              <Text style={styles.studentName}>{certificate.studentName}</Text>

              <Text style={styles.certifyText}>
                concluiu com êxito o curso de
              </Text>

              <Text style={styles.courseName}>{certificate.courseName}</Text>

              <Text style={styles.courseInfo}>
                com carga horária de{" "}
                <Text style={{ fontWeight: "bold" }}>
                  {certificate.courseWorkload} horas
                </Text>
                ,{"\n"}
                realizado no período de {formatDate(certificate.completedAt)}.
              </Text>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              {/* Signature */}
              <View style={styles.signatureBlock}>
                <View style={styles.signatureLine} />
                <Text style={styles.signatureName}>
                  {certificate.instructorName}
                </Text>
                <Text style={styles.signatureTitle}>
                  {certificate.instructorTitle}
                </Text>
              </View>

              {/* QR Code */}
              <View style={styles.qrCodeBlock}>
                <Image src={qrCodeDataUrl} style={styles.qrCode} />
                <Text style={styles.qrText}>Escaneie para validar</Text>
              </View>
            </View>

            {/* Certificate Number */}
            <Text style={styles.certNumber}>
              Certificado Nº {certificate.certificateNumber}
            </Text>

            {/* Metadata (hidden in print, visible for validation) */}
            <View style={styles.metadata}>
              <Text>Emitido em: {formatDate(certificate.issuedAt)}</Text>
              <Text>Documento válido | {certificate.validationUrl}</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};
