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
import type { Certificate } from "@/types/certificate";

// --- FONTS REGISTRATION ---
// Since we cannot load custom fonts dynamically in this environment easily without file paths
// or base64, we will use standard PDF fonts but style them to look premium.
// Times-Roman / Times-Bold = Serif (Classic, Solemn)
// Helvetica / Helvetica-Bold = Sans-Serif (Clean, Modern)

// --- COLORS ---
const COLORS = {
  GREEN_DEEP: "#0E6330", // Verde profundo (Brand)
  GOLD: "#C5A065", // Dourado (Details)
  CREAM: "#F9F7F2", // Off-white/Cream (Background)
  TEXT_MAIN: "#1A1A1A", // Almost Black
  TEXT_MUTED: "#666666", // Grey
};

// --- STYLES ---
const styles = StyleSheet.create({
  page: {
    backgroundColor: COLORS.CREAM,
    padding: 0, // We control margins via container
  },
  // Background Pattern / Watercolor Effect
  backgroundLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
    opacity: 0.4, // Subtle watercolor
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  // Main Border Container (18mm safety margin approx = 50pt)
  container: {
    margin: 50,
    flex: 1,
    border: `5px solid ${COLORS.GREEN_DEEP}`, // Outer thick border
    padding: 4, // Space between borders
  },
  innerBorder: {
    flex: 1,
    border: `2px solid ${COLORS.GOLD}`, // Inner thin gold border
    padding: 30, // Internal padding
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between", // Distribute vertical space
  },
  // Header Section
  header: {
    alignItems: "center",
    width: "100%",
    marginTop: 10,
  },
  logo: {
    width: 100,
    height: 100,
    objectFit: "contain",
    marginBottom: 20,
  },
  institutionName: {
    fontFamily: "Times-Bold",
    fontSize: 24,
    color: COLORS.GREEN_DEEP, // Brand color for institution
    textTransform: "uppercase",
    marginBottom: 8,
    textAlign: "center",
  },
  certificateTitle: {
    fontFamily: "Helvetica",
    fontSize: 14,
    color: COLORS.GOLD,
    textTransform: "uppercase",
    letterSpacing: 4, // Wide tracking
    textAlign: "center",
  },

  // Body Section
  body: {
    alignItems: "center",
    width: "100%",
    marginTop: 20,
    marginBottom: 20,
  },
  certifyLabel: {
    fontFamily: "Times-Italic", // Elegant lead-in
    fontSize: 16,
    color: COLORS.TEXT_MUTED,
    marginBottom: 20,
  },
  studentName: {
    fontFamily: "Times-Bold",
    fontSize: 32,
    color: COLORS.GREEN_DEEP,
    textTransform: "uppercase",
    textAlign: "center",
    marginBottom: 25,
    paddingHorizontal: 20,
    // Logic for resizing if too long is handled by react-pdf typically wrapping or we'd need text rendering logic.
    // We will assume wrapping is acceptable or standard size.
  },
  bodyText: {
    fontFamily: "Times-Roman",
    fontSize: 14,
    color: COLORS.TEXT_MAIN,
    textAlign: "center",
    lineHeight: 1.6,
    width: "85%", // Constrain width for readability
  },
  boldText: {
    fontFamily: "Times-Bold",
  },

  // Footer Section
  footer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 30,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0", // Subtle separator
    borderTopStyle: "dashed",
  },

  // Footer Columns
  footerLeft: {
    flex: 1,
    alignItems: "flex-start",
  },
  footerCenter: {
    flex: 2,
    alignItems: "center",
    justifyContent: "flex-end", // Align signature to bottom
  },
  footerRight: {
    flex: 1,
    alignItems: "flex-end",
  },

  // Signature Block
  signatureArea: {
    alignItems: "center",
    marginBottom: 10,
  },
  signatureLine: {
    width: 220,
    height: 1,
    backgroundColor: COLORS.TEXT_MUTED,
    marginBottom: 8,
  },
  curatorName: {
    fontFamily: "Times-Bold",
    fontSize: 12,
    color: COLORS.TEXT_MAIN,
    textTransform: "uppercase",
  },
  curatorTitle: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: COLORS.GOLD,
    textTransform: "uppercase",
    marginTop: 4,
  },
  signatureLabel: {
    fontFamily: "Helvetica-Oblique",
    fontSize: 8,
    color: COLORS.TEXT_MUTED,
    marginTop: 4,
  },

  // Metadata labels
  metaLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    color: COLORS.TEXT_MUTED,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  metaValue: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: COLORS.TEXT_MAIN,
    marginBottom: 10,
  },

  // QR Code
  qrImage: {
    width: 60,
    height: 60,
    marginBottom: 5,
  },
  qrLabel: {
    fontFamily: "Helvetica",
    fontSize: 7,
    color: COLORS.TEXT_MUTED,
    textAlign: "right",
  },

  // Bottom Center URL
  bottomDomain: {
    position: "absolute",
    bottom: -25, // Outside inner border
    left: 0,
    right: 0,
    textAlign: "center",
    fontFamily: "Helvetica",
    fontSize: 8,
    color: COLORS.GREEN_DEEP,
    opacity: 0.7,
  },
});

interface CertificateDocumentProps {
  certificate: Certificate;
  qrCodeDataUrl: string;
}

export const CertificateDocument: React.FC<CertificateDocumentProps> = ({
  certificate,
  qrCodeDataUrl,
}) => {
  // --- UTILS ---
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Data N/A";
    const date = timestamp?.toDate?.() || new Date(timestamp); // Handle Firestore or ISO string
    // Check if valid date
    if (isNaN(date.getTime())) return timestamp || "Data Desconhecida";

    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formattedCompletedAt = formatDate(certificate.completedAt);
  const formattedIssuedAt = formatDate(certificate.issuedAt);

  // Use enrolledAt for start date. If missing, fallback to "Início do curso" logic or just omit.
  // Ideally, use a rough estimation if missing (enrollment date usually exists).
  const formattedStartedAt = certificate.enrolledAt
    ? formatDate(certificate.enrolledAt)
    : "Início";

  // --- ASSETS ---
  // Using absolute path for public folder assets if needed, or relative
  // Assuming logo is at public/assets/logo-figura-viva.jpg or .png
  const logoUrl = "/assets/logo-figura-viva.png"; // Fallback to png usually better for transparency
  // Optional watercolor background
  const bgUrl = "/assets/_bg_aquarela.png";

  // --- CONTENT ---
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Watercolor Background (Optional) */}
        <View style={styles.backgroundLayer}>
          {/* If image exists, it will render. If not, low impact. */}
          <Image src={bgUrl} style={styles.backgroundImage} />
        </View>

        {/* Main Frame */}
        <View style={styles.container}>
          <View style={styles.innerBorder}>
            {/* Header */}
            <View style={styles.header}>
              {/* Logo */}
              {/* We use a conditional check or try/catch effectively by just rendering. 
                   If src fails, PDF renderer usually warns but doesn't crash completely. */}
              <Image src={logoUrl} style={styles.logo} />

              <Text style={styles.institutionName}>INSTITUTO FIGURA VIVA</Text>
              <Text style={styles.certificateTitle}>
                CERTIFICADO DE CONCLUSÃO
              </Text>
            </View>

            {/* Body */}
            <View style={styles.body}>
              <Text style={styles.certifyLabel}>Certificamos que</Text>

              <Text style={styles.studentName}>{certificate.studentName}</Text>

              <Text style={styles.bodyText}>
                concluiu com êxito o curso{" "}
                <Text style={styles.boldText}>{certificate.courseName}</Text>,
                {"\n"}
                com carga horária de{" "}
                <Text style={styles.boldText}>
                  {certificate.courseWorkload} horas
                </Text>
                ,{"\n"}
                realizado no período de {formattedStartedAt} a{" "}
                {formattedCompletedAt}.
              </Text>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              {/* Left: Emission Data */}
              <View style={styles.footerLeft}>
                <Text style={styles.metaLabel}>DATA DE EMISSÃO</Text>
                <Text style={styles.metaValue}>{formattedIssuedAt}</Text>

                <Text style={styles.metaLabel}>REGISTRO</Text>
                <Text style={styles.metaValue}>
                  {certificate.certificateNumber}
                </Text>
              </View>

              {/* Center: Signature */}
              <View style={styles.footerCenter}>
                <View style={styles.signatureArea}>
                  {/* Signature Line is visual for now. 
                       If we had a signature image: <Image src={sigUrl} style={{width: 120, height: 60}} /> */}
                  <View style={styles.signatureLine} />
                  <Text style={styles.curatorName}>
                    {certificate.instructorName}
                  </Text>
                  <Text style={styles.curatorTitle}>
                    {certificate.instructorTitle}
                  </Text>
                  <Text style={styles.signatureLabel}>
                    Assinatura da Curadora
                  </Text>
                </View>
              </View>

              {/* Right: QR Code */}
              <View style={styles.footerRight}>
                <Image src={qrCodeDataUrl} style={styles.qrImage} />
                <Text style={styles.qrLabel}>Escaneie para validar</Text>
              </View>
            </View>

            {/* Bottom Domain (Outside footer flex) */}
            <Text style={styles.bottomDomain}>figuraviva.com</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};
