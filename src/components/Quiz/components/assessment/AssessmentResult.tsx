import { motion } from "framer-motion";
import { Phone, AlertTriangle } from "lucide-react";
import { AssessmentResult, ValidatedInstrument } from "../../types";
import "./AssessmentResult.css";

/* ─────────────────────────────────────────────
   Mapeamento de safety flags → mensagens visíveis
   Qualquer novo flag deve ser adicionado aqui.
───────────────────────────────────────────── */
interface SafetyResource {
  label: string;
  url: string;
}

interface SafetyMessageDef {
  title: string;
  body: string;
  resources: SafetyResource[];
}

const SAFETY_MESSAGES: Record<string, SafetyMessageDef> = {
  self_harm_item_positive: {
    title: "Atenção: você indicou pensamentos sobre se machucar",
    body: "Uma de suas respostas sinalizou pensamentos relacionados a morte ou autoferia. Se estiver passando por um momento difícil, você não precisa enfrentar isso sozinho. Os recursos abaixo oferecem apoio imediato e confidencial.",
    resources: [
      { label: "CVV — 188 (24 h, gratuito)", url: "tel:188" },
      { label: "SAMU — 192", url: "tel:192" },
      { label: "Polícia / Emergência — 190", url: "tel:190" },
    ],
  },
};

interface AssessmentResultProps {
  instrument: ValidatedInstrument;
  result: AssessmentResult;
  onRefresh: () => void;
  onHome: () => void;
}

export function AssessmentResultComponent({
  instrument,
  result,
  onRefresh,
  onHome,
}: AssessmentResultProps) {
  const getResultColor = (status: string) => {
    switch (status) {
      case "negative":
        return "success";
      case "borderline":
        return "warning";
      case "positive":
        return "alert";
      default:
        return "neutral";
    }
  };

  return (
    <motion.div
      className="assessment-result"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.section
        className="assessment-result__header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="assessment-result__title">Seu resultado</h1>
        <p className="assessment-result__subtitle">{instrument.publicTitle}</p>
      </motion.section>

      {/* Main Result Card */}
      <motion.section
        className={`assessment-result__main assessment-result__main--${getResultColor(result.screenStatus)}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="assessment-result__classification">
          <span className="assessment-result__classification-label">
            Classificação
          </span>
          <h2 className="assessment-result__classification-text">
            {result.classification}
          </h2>
        </div>

        {result.rawScore !== undefined && (
          <div className="assessment-result__score">
            <span className="assessment-result__score-label">Pontuação</span>
            <p className="assessment-result__score-value">
              {result.rawScore}
              {result.maxScore && <span> / {result.maxScore}</span>}
            </p>
          </div>
        )}
      </motion.section>

      {/* ── Safety Flag Alert ──────────────────────────────────────── */}
      {result.safetyFlags && result.safetyFlags.length > 0 && (
        <motion.div
          className="assessment-result__safety-alerts"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          {result.safetyFlags.map((flag) => {
            const msg = SAFETY_MESSAGES[flag];

            /* Flag não mapeado: exibe aviso genérico */
            if (!msg) {
              return (
                <div
                  key={flag}
                  className="safety-card safety-card--generic"
                  role="alert"
                  aria-live="assertive"
                >
                  <AlertTriangle
                    size={20}
                    aria-hidden="true"
                    className="safety-card__icon"
                  />
                  <p className="safety-card__body">
                    Uma resposta requer atenção. Considere conversar com um
                    profissional de saúde mental.
                  </p>
                </div>
              );
            }

            return (
              <div
                key={flag}
                className="safety-card safety-card--critical"
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
              >
                <div className="safety-card__header">
                  <AlertTriangle
                    size={22}
                    aria-hidden="true"
                    className="safety-card__icon"
                  />
                  <h3 className="safety-card__title">{msg.title}</h3>
                </div>

                <p className="safety-card__body">{msg.body}</p>

                <div className="safety-card__resources">
                  {msg.resources.map((r) => (
                    <a
                      key={r.label}
                      href={r.url}
                      className="safety-card__resource-btn"
                      /* rel não necessário para tel:, mantido para future-proofing */
                      rel="noopener noreferrer"
                    >
                      <Phone size={16} aria-hidden="true" />
                      {r.label}
                    </a>
                  ))}
                </div>

                <p className="safety-card__footer">
                  Se estiver em perigo imediato, ligue{" "}
                  <strong>192 (SAMU)</strong> ou vá ao pronto-socorro mais
                  próximo.
                </p>
              </div>
            );
          })}
        </motion.div>
      )}

      {/* Domains */}
      {result.domains && result.domains.length > 0 && (
        <motion.section
          className="assessment-result__domains"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="assessment-result__domains-title">Análise por área</h3>
          <div className="assessment-result__domains-grid">
            {result.domains.map((domain, idx) => (
              <motion.div
                key={domain.id}
                className="assessment-result__domain-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
              >
                <div className="assessment-result__domain-header">
                  <h4 className="assessment-result__domain-label">
                    {domain.label}
                  </h4>
                </div>

                {/* Domain Bar */}
                <div className="assessment-result__domain-bar">
                  <div
                    className="assessment-result__domain-bar-fill"
                    style={{
                      width: `${(domain.normalized || domain.score) * 100}%`,
                    }}
                  ></div>
                </div>

                <p className="assessment-result__domain-score">
                  {domain.score}
                  {domain.max && <span> / {domain.max}</span>}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Interpretation */}
      <motion.section
        className="assessment-result__interpretation"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <h3 className="assessment-result__interpretation-title">
          O que significa seu resultado
        </h3>
        <p className="assessment-result__interpretation-text">
          {result.interpretation}
        </p>
      </motion.section>

      {/* Evidence */}
      {instrument.evidence && (
        <motion.section
          className="assessment-result__evidence"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <h4 className="assessment-result__evidence-title">
            Sobre este instrumento
          </h4>
          <div className="assessment-result__evidence-content">
            {instrument.evidence.authors && (
              <p className="assessment-result__evidence-item">
                <strong>Autores:</strong> {instrument.evidence.authors}
                {instrument.evidence.year && ` (${instrument.evidence.year})`}
              </p>
            )}
            {instrument.evidence.reference && (
              <p className="assessment-result__evidence-item">
                <strong>Referência:</strong> {instrument.evidence.reference}
              </p>
            )}
            {instrument.evidence.licensingNote && (
              <p className="assessment-result__evidence-item">
                <strong>Licença:</strong> {instrument.evidence.licensingNote}
              </p>
            )}
          </div>
        </motion.section>
      )}

      {/* Disclaimer */}
      <motion.section
        className="assessment-result__disclaimer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <p className="assessment-result__disclaimer-text">
          ℹ️ <strong>Importante:</strong> {result.disclaimer}
        </p>
      </motion.section>

      {/* Actions */}
      <motion.section
        className="assessment-result__actions"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        <button
          className="assessment-result__button assessment-result__button--primary"
          onClick={onRefresh}
        >
          Refazer avaliação
        </button>
        <button
          className="assessment-result__button assessment-result__button--secondary"
          onClick={onHome}
        >
          Explorar outros instrumentos
        </button>
      </motion.section>
    </motion.div>
  );
}
