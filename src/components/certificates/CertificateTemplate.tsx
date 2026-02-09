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

// Register fonts (optional - use standard fonts or load custom if needed)
// For now, we stick to standard Helvetica/Times which are built-in for PDF
// To match specific Python fonts, we'd need to register .ttf files

interface CertificateDocumentProps {
  certificate: Certificate;
  qrCodeDataUrl: string;
}

const COLORS = {
  GREEN: "#0E6330",
  GOLD: "#B08D55",
  INK: "#102018",
  MUTED: "#6B6A63",
  SEPERATOR: "#D8D2C5",
};

const styles = StyleSheet.create({
  page: {
    padding: 0,
    position: "relative",
  },
  background: {
    position: "absolute",
    minWidth: "100%",
    minHeight: "100%",
    display: "flex", // Changed from 'block' to 'flex'
    height: "100%",
    width: "100%",
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    padding: 40, // 14mm approx
  },
  outerBorder: {
    border: `3px solid ${COLORS.GREEN}`,
    flex: 1,
    padding: 14, // 5mm approx inside outer to inner
  },
  innerBorder: {
    border: `1.4px solid ${COLORS.GOLD}`,
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    paddingTop: 20, // Adjust for logo spacing
  },
  // Typography
  institutionName: {
    fontSize: 20,
    fontFamily: "Times-Bold", // SerifBold equivalent
    color: COLORS.INK,
    marginTop: 15,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  subtitle: {
    fontSize: 12,
    fontFamily: "Helvetica", // Lato equivalent
    color: COLORS.MUTED,
    marginBottom: 5,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  certifyText: {
    fontSize: 12,
    fontFamily: "Helvetica",
    color: COLORS.MUTED,
    marginTop: 25,
    marginBottom: 15,
  },
  studentName: {
    fontSize: 30,
    fontFamily: "Times-Bold",
    color: COLORS.GREEN,
    textTransform: "uppercase",
    marginBottom: 5,
    textAlign: "center",
  },
  underline: {
    width: "70%",
    height: 1,
    backgroundColor: COLORS.GOLD,
    marginBottom: 20,
  },
  bodyTextContainer: {
    width: "80%",
    marginTop: 20,
  },
  bodyText: {
    fontSize: 12.5,
    fontFamily: "Helvetica",
    color: COLORS.INK,
    textAlign: "center",
    lineHeight: 1.5,
  },
  logo: {
    width: 140, // 52mm approx
    height: 140,
    marginBottom: 10,
    objectFit: "contain",
  },

  // Footer area
  footer: {
    position: "absolute",
    bottom: 50,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingTop: 20,
  },
  footerSeparator: {
    position: "absolute",
    bottom: 120, // 55mm approx from margin bottom?
    left: 60,
    right: 60,
    height: 1,
    backgroundColor: COLORS.SEPERATOR,
  },

  // Footer Columns
  dateColumn: {
    flex: 1,
    alignItems: "flex-start",
    paddingLeft: 20,
  },
  signatureColumn: {
    flex: 2,
    alignItems: "center",
  },
  qrColumn: {
    flex: 1,
    alignItems: "flex-end",
    paddingRight: 20,
  },

  // Labels
  label: {
    fontSize: 10,
    fontFamily: "Helvetica",
    color: COLORS.MUTED,
    marginBottom: 4,
  },
  value: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: COLORS.INK,
  },

  // Signature
  signatureLine: {
    width: 200,
    height: 1,
    backgroundColor: COLORS.MUTED,
    marginBottom: 8,
  },
  signatureName: {
    fontSize: 12,
    fontFamily: "Times-Bold",
    color: COLORS.INK,
  },
  signatureTitle: {
    fontSize: 10,
    fontFamily: "Helvetica",
    color: COLORS.MUTED,
    marginTop: 2,
  },

  // QR
  qrImage: {
    width: 80,
    height: 80,
    marginBottom: 5,
  },
  certNumber: {
    position: "absolute",
    bottom: 20,
    left: 60,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: COLORS.MUTED,
  },
  validationUrl: {
    position: "absolute",
    bottom: 20,
    right: 60,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: COLORS.MUTED,
    textAlign: "right",
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

  const formattedCompletedAt = formatDate(certificate.completedAt);
  const formattedIssuedAt = formatDate(certificate.issuedAt);

  // Using absolute path for background image if in public folder
  // Note: react-pdf in browser might need full URL or relative to public
  // We'll use absolute URL if environment variable is set, otherwise relative
  const bgUrl = "/assets/_bg_aquarela.png";

  // Logo: Try to match what's available
  const logoUrl = "/assets/logo-figura-viva.jpg";

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Background Layer */}
        <View style={styles.background}>
          {/* Using a fixed image for watercolor background */}
          <Image src={bgUrl} style={styles.backgroundImage} />
        </View>

        {/* Content Container with Double Border */}
        <View style={styles.container}>
          <View style={styles.outerBorder}>
            <View style={styles.innerBorder}>
              {/* Header Logo */}
              <Image src={logoUrl} style={styles.logo} />

              {/* Institution Name */}
              <Text style={styles.institutionName}>INSTITUTO FIGURA VIVA</Text>

              {/* Subtitle */}
              <Text style={styles.subtitle}>CERTIFICADO DE CONCLUSÃO</Text>

              {/* Certify Text */}
              <Text style={styles.certifyText}>Certificamos que</Text>

              {/* Student Name */}
              <Text style={styles.studentName}>{certificate.studentName}</Text>
              <View style={styles.underline} />

              {/* Body Text */}
              <View style={styles.bodyTextContainer}>
                <Text style={styles.bodyText}>
                  concluiu com êxito o curso {certificate.courseName}, com carga
                  horária de {certificate.courseWorkload} horas, realizado no
                  período de {formattedCompletedAt}.
                </Text>
              </View>

              {/* Footer Separator Line */}
              <View style={styles.footerSeparator} />

              {/* Footer Area */}
              <View style={styles.footer}>
                {/* Issued At (Left) */}
                <View style={styles.dateColumn}>
                  <Text style={styles.label}>DATA DE EMISSÃO</Text>
                  <Text style={styles.value}>{formattedIssuedAt}</Text>
                </View>

                {/* Signature (Center) */}
                <View style={styles.signatureColumn}>
                  <Text style={styles.label}>ASSINATURA DA CURADORA</Text>
                  <View style={styles.signatureLine} />
                  {/* Ideally use an image of signature here */}
                  <Text style={styles.signatureName}>
                    {certificate.instructorName}
                  </Text>
                  <Text style={styles.signatureTitle}>
                    {certificate.instructorTitle}
                  </Text>
                </View>

                {/* QR Code (Right) */}
                <View style={styles.qrColumn}>
                  <Image src={qrCodeDataUrl} style={styles.qrImage} />
                  <Text style={{ ...styles.label, textAlign: "right" }}>
                    Escaneie para validar
                  </Text>
                </View>
              </View>

              {/* Bottom Metadata */}
              <Text style={styles.certNumber}>
                Certificado Nº {certificate.certificateNumber} | Documento
                válido
              </Text>
              <Text style={styles.validationUrl}>
                {certificate.validationUrl.replace(/^https?:\/\//, "")}
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};
