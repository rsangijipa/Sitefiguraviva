/**
 * WhatsApp Service
 * Handles redirection and formatting for WhatsApp communication.
 */

const WHATSAPP_NUMBER = "556992481585"; // Central support number

export const whatsappService = {
  /**
   * Get a direct link to WhatsApp with an optional message
   */
  getWhatsAppLink(message?: string): string {
    const baseUrl = `https://wa.me/${WHATSAPP_NUMBER}`;
    if (!message) return baseUrl;

    const encodedMessage = encodeURIComponent(message);
    return `${baseUrl}?text=${encodedMessage}`;
  },

  /**
   * Open WhatsApp in a new tab
   */
  openSupport(customMessage?: string) {
    const message = customMessage || "Olá! Gostaria de suporte com o curso.";
    window.open(this.getWhatsAppLink(message), "_blank");
  },

  /**
   * Notify student about enrollment (Simulated for now)
   * In production, this would call a Cloud Function that hits a WhatsApp API
   */
  async notifyEnrollment(studentName: string, courseTitle: string) {
    const message = `Olá ${studentName}! Sua matrícula no curso *${courseTitle}* foi confirmada no Instituto Figura Viva. Seja bem-vindo(a)! 🎓`;
    console.log(
      `[WhatsApp Notification sent to ${WHATSAPP_NUMBER}]: ${message}`,
    );

    // This is a placeholder for a real API call like:
    // await fetch('/api/whatsapp/send', { method: 'POST', body: JSON.stringify({ to: studentPhone, message }) });
    return true;
  },

  /**
   * Notify about new content
   */
  async notifyNewContent(courseTitle: string, lessonTitle: string) {
    const message = `Novidade no curso *${courseTitle}*! A aula *${lessonTitle}* já está disponível. Bons estudos! 🚀`;
    console.log(`[WhatsApp Notification]: ${message}`);
    return true;
  },
};
