import { ReflectionSession } from "../types";

const STORAGE_KEY = "duas_cadeiras_sessions_v1";

export function getSavedSessions(): ReflectionSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (error) {
    console.error("Falha ao ler sessões locais:", error);
    return [];
  }
}

export function saveSessionToStorage(session: ReflectionSession): boolean {
  try {
    const list = getSavedSessions();
    const index = list.findIndex((s) => s.id === session.id);
    if (index >= 0) {
      list[index] = { ...session, updatedAt: Date.now() };
    } else {
      list.unshift({ ...session, updatedAt: Date.now() });
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return true;
  } catch (error) {
    console.error("Falha ao salvar sessão:", error);
    return false;
  }
}

export function deleteSessionFromStorage(sessionId: string): void {
  try {
    const list = getSavedSessions().filter((s) => s.id !== sessionId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (error) {
    console.error("Falha ao remover sessão:", error);
  }
}

export function exportSessionToMarkdown(session: ReflectionSession): string {
  const dateStr = new Date(session.createdAt).toLocaleDateString("pt-BR", {
    dateStyle: "full",
  });
  const timeStr = new Date(session.createdAt).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  let md = `# ${session.title || "Experimento Dialógico: Duas Cadeiras"}\n`;
  md += `*Data: ${dateStr} às ${timeStr}*\n\n`;
  md += `> **Aviso ético:** Este é um recurso de reflexão e não substitui acompanhamento terapêutico profissional.\n\n`;
  md += `### Perspectivas em diálogo:\n`;
  md += `- **Cadeira A:** ${session.chairA.name} ${session.chairA.sublabel ? `(${session.chairA.sublabel})` : ""}\n`;
  md += `- **Cadeira B:** ${session.chairB.name} ${session.chairB.sublabel ? `(${session.chairB.sublabel})` : ""}\n\n`;
  md += `---\n\n`;
  md += `### Diálogo\n\n`;

  if (session.turns.length === 0) {
    md += `*(Nenhuma fala registrada)*\n\n`;
  } else {
    session.turns.forEach((turn, idx) => {
      const turnTime = new Date(turn.timestamp).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      md += `**[${turn.speakerName}]** *(${turnTime})*\n\n`;
      md += `${turn.text}\n\n`;
      if (idx < session.turns.length - 1) {
        md += `* * *\n\n`;
      }
    });
  }

  if (session.closingReflection) {
    md += `---\n\n`;
    md += `### Reflexão e Síntese de Encerramento\n\n`;
    md += `${session.closingReflection}\n\n`;
  }

  md += `---\n*Documento gerado localmente. Seus dados nunca foram enviados a servidores ou inteligências artificiais.*`;
  return md;
}
