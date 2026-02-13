const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL;
const WHATSAPP_API_KEY = process.env.WHATSAPP_API_KEY;

export const whatsappService = {
  /**
   * Helper to format phone number (remove non-digits)
   */
  formatPhone(phone: string): string {
    return phone.replace(/\D/g, "");
  },

  /**
   * Send a message via external API (Evolution API, Z-API, etc.)
   */
  async sendMessage(to: string, message: string) {
    const formattedTo = this.formatPhone(to);
    if (!formattedTo) return { success: false, error: "Invalid phone number" };

    console.log(
      `[WhatsApp API Placeholder] To: ${formattedTo}, Message: ${message}`,
    );

    // If API is configured, use it
    if (WHATSAPP_API_URL && WHATSAPP_API_KEY) {
      try {
        const response = await fetch(WHATSAPP_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${WHATSAPP_API_KEY}`,
          },
          body: JSON.stringify({
            number: formattedTo,
            message: message,
          }),
        });
        return { success: response.ok };
      } catch (error) {
        console.error("WhatsApp API Error:", error);
        return { success: false, error };
      }
    }

    return { success: true, simulated: true };
  },

  /**
   * Notify student about enrollment
   */
  async notifyEnrollment(
    phone: string,
    studentName: string,
    courseTitle: string,
  ) {
    const message = `Olá ${studentName}! Sua matrícula no curso *${courseTitle}* foi confirmada no Instituto Figura Viva. Seja bem-vindo(a)! 🎓 Verifique seu portal: https://figuraviva.com.br/portal`;
    return this.sendMessage(phone, message);
  },

  /**
   * Reminder for Live Session
   */
  async notifyLiveSession(
    phone: string,
    studentName: string,
    courseTitle: string,
    time: string,
    link: string,
  ) {
    const message = `Olá ${studentName}! Nossa aula ao vivo do curso *${courseTitle}* começa em breve (${time}). Não perca! 🎥 Link: ${link}`;
    return this.sendMessage(phone, message);
  },

  /**
   * Abandoned Cart Recovery
   */
  async notifyAbandonedCart(
    phone: string,
    studentName: string,
    courseTitle: string,
    checkoutUrl: string,
  ) {
    const message = `Oi ${studentName}, vimos que você quase garantiu sua vaga em *${courseTitle}*. Tem alguma dúvida? Clique aqui para finalizar sua inscrição: ${checkoutUrl} 💳`;
    return this.sendMessage(phone, message);
  },
};
