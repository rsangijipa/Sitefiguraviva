"use client";
import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Button, EmptyContent, TextArea } from "../ui";
import { useExperienceDraft, type ExperienceProps } from "../experience-types";
import { useResourceMotion } from "../ResourceShell";
import { WatercolorEmotions, type PickedEmotion } from "./WatercolorEmotions";
import { buildMandalaHtml, buildMandalaSvg, MANDALA_CSS, mandalaColor } from "./mandala";

export function EmotionExperience(props: ExperienceProps) {
  const reduced = useResourceMotion();
  const [picked, setPicked] = useState<PickedEmotion[]>([]);
  const [reflection, setReflection] = useState("");
  const [motion, setMotion] = useState(!reduced);
  const [done, setDone] = useState(false);
  const configured = props.version?.configuration.items;
  const items = useMemo(() => configured?.filter(item => item.kind === "emotion") ?? [], [configured]);
  const first = picked[0];
  const payload = { emotionId: first?.id ?? "", intensity: first?.intensity ?? 1, reflection, ...(picked.length ? { emotions: picked.map(entry => ({ emotionId: entry.id, intensity: entry.intensity })) } : {}) };
  useExperienceDraft(payload, props.onDraft);
  const mandalaEmotions = useMemo(() => picked.map(entry => ({ id: entry.id, title: items.find(item => item.id === entry.id)?.title ?? entry.id, intensity: entry.intensity })), [picked, items]);
  const svg = useMemo(() => buildMandalaSvg(mandalaEmotions), [mandalaEmotions]);
  if (!items.length) return <EmptyContent />;

  const download = () => {
    const blob = new Blob([buildMandalaHtml(mandalaEmotions)], { type: "text/html" });
    const url = URL.createObjectURL(blob); const link = document.createElement("a");
    link.href = url; link.download = "roda-das-emocoes-mandala.html"; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
  };

  if (done) return <section className="wc-mandala" aria-label="Sua mandala">
    <style>{MANDALA_CSS}</style>
    <div className="wc-mandala-art" dangerouslySetInnerHTML={{ __html: svg }} />
    <div className="wc-mandala-side">
      <span className="fv-label">Sua mandala</span>
      <h2>Formas nascidas do que você nomeou</h2>
      <p className="fv-support">Cada emoção virou uma camada; a intensidade define quantas pétalas e o tamanho delas. É um retrato do momento, não uma interpretação.</p>
      <ul className="wc-legend">{mandalaEmotions.map(emotion => <li key={emotion.id}><i style={{ background: mandalaColor(emotion) }} />{emotion.title} <span>{emotion.intensity}/5</span></li>)}</ul>
      <TextArea label="Uma percepção, se quiser" value={reflection} onChange={setReflection} />
      <div className="fv-actions"><Button onClick={download}><Download size={15} aria-hidden="true" />Baixar mandala (HTML)</Button><Button secondary onClick={() => setDone(false)}>Voltar à roda</Button><Button secondary onClick={() => props.onComplete(payload)}>Finalizar</Button></div>
    </div>
  </section>;

  return <div className="wc-app">
    <div className="wc-top">
      <div className="wc-title"><h2>Encontre uma palavra, se quiser</h2><p>Toque nas emoções; elas surgem sobre a aquarela. As cores não classificam nada.</p></div>
      <div className="wc-top-actions">
        <Button secondary aria-pressed={!motion} disabled={reduced} onClick={() => setMotion(value => !value)}>{motion ? "Parar movimento" : "Movimento parado"}</Button>
        <Button disabled={!picked.length} onClick={() => setDone(true)}>Concluir</Button>
        <Button secondary onClick={() => props.onComplete(null)}>Não sei · encerrar sem registrar</Button>
      </div>
    </div>
    <p className="fv-mode-status" role="status">{picked.length ? `${picked.length} ${picked.length === 1 ? "emoção escolhida" : "emoções escolhidas"}.` : "Nenhuma emoção escolhida. Você pode seguir sem escolher."}</p>
    <WatercolorEmotions items={items} picked={picked} onChange={setPicked} motion={motion} />
  </div>;
}
