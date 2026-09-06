/**
 * Legal copy (privacy policy / terms of use).
 *
 * Kept in a dependency-free module so it can be imported from Server
 * Components without dragging in the client Firebase SDK that
 * `src/lib/siteSettings.ts` needs. The live copy is edited in
 * Admin → Settings and stored in `siteSettings/legal`; these values are the
 * fallback used before an admin has saved anything.
 */

export interface LegalSection {
  heading: string;
  text: string;
}

export interface LegalDocumentContent {
  title: string;
  lastUpdated: string;
  content: LegalSection[];
}

export interface LegalSettings {
  privacy: LegalDocumentContent;
  terms: LegalDocumentContent;
}

export type LegalDocumentType = keyof LegalSettings;

export const LEGAL_ROUTES: Record<LegalDocumentType, string> = {
  privacy: "/privacidade",
  terms: "/termos",
};

export const DEFAULT_LEGAL: LegalSettings = {
  privacy: {
    title: "Política de Privacidade",
    lastUpdated: "Janeiro de 2026",
    content: [
      {
        heading: "1. Introdução",
        text: "O Instituto Figura Viva respeita a sua privacidade e compromete-se a proteger os dados pessoais que você compartilha conosco. Esta política explica como coletamos, usamos e protegemos suas informações.",
      },
      {
        heading: "2. Coleta de Dados",
        text: "Coletamos informações essenciais para a prestação de nossos serviços educacionais e terapêuticos, incluindo: nome completo, e-mail, telefone e, quando necessário para matrícula, dados de pagamento e endereço. O uso de cookies no site limita-se a garantir a funcionalidade técnica e melhorar sua experiência de navegação.",
      },
      {
        heading: "3. Uso das Informações",
        text: "Seus dados são utilizados exclusivamente para: processar inscrições em cursos e grupos de estudos; enviar comunicações institucionais relevantes; emitir certificados; e cumprir obrigações legais.",
      },
      {
        heading: "4. Compartilhamento de Dados",
        text: "Não vendemos nem comercializamos seus dados. O compartilhamento ocorre apenas com parceiros estritamente necessários para a operação (ex: processadores de pagamento) ou por obrigação legal.",
      },
      {
        heading: "5. Cookies e Medição de Audiência",
        text: "Utilizamos cookies estritamente necessários para o funcionamento do site, que não dependem de consentimento. Cookies de medição de audiência (Google Analytics) só são ativados após o seu consentimento explícito no aviso exibido em sua primeira visita, e você pode revogar essa escolha a qualquer momento pelo rodapé do site.",
      },
      {
        heading: "6. Seus Direitos (LGPD)",
        text: "Conforme a Lei Geral de Proteção de Dados, você tem direito a solicitar o acesso, correção, anonimização ou exclusão de seus dados pessoais a qualquer momento, entrando em contato através de nossos canais oficiais.",
      },
    ],
  },
  terms: {
    title: "Termos de Uso",
    lastUpdated: "Janeiro de 2026",
    content: [
      {
        heading: "1. Aceite dos Termos",
        text: "Ao acessar o site e utilizar os serviços do Instituto Figura Viva, você concorda com estes termos. Se não concordar, pedimos que não utilize nossos serviços.",
      },
      {
        heading: "2. Uso do Conteúdo",
        text: "Todo o conteúdo disponibilizado neste site (textos, imagens, vídeos, materiais didáticos) é de propriedade intelectual do Instituto Figura Viva ou de seus parceiros. É proibida a reprodução, distribuição ou uso comercial sem autorização prévia por escrito.",
      },
      {
        heading: "3. Inscrições e Cancelamentos",
        text: "As inscrições para cursos e grupos estão sujeitas à disponibilidade de vagas. Políticas de cancelamento e reembolso são especificadas no ato da contratação de cada serviço.",
      },
      {
        heading: "4. Conduta do Usuário",
        text: "Espera-se que os usuários mantenham uma conduta respeitosa e ética nos espaços digitais do Instituto, incluindo áreas de comentários e aulas ao vivo.",
      },
      {
        heading: "5. Alterações",
        text: "O Instituto Figura Viva reserva-se o direito de alterar estes termos a qualquer momento. Recomendamos a consulta periódica desta página.",
      },
    ],
  },
};
