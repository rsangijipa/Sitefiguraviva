"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { webglSupported } from "./webgl-support";
import { MasterToggle, MinToggle } from "./SceneControls";
import "./legacy-scenes.css";

/**
 * Cenas portadas dos aplicativos 3D originais (riacho, santuário, lago). O motor de cada uma
 * foi preservado e é montado sobre esta interface, que usa os mesmos ids que o motor espera.
 * Os elementos controlados pelo motor ficam sem estado React para o React não sobrescrevê-los.
 */
type Mount = (root: HTMLElement) => () => void;

function LegacyScene({ scene, load, children }: { scene: string; load: () => Promise<{ mount: Mount }>; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "off">("loading");
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    if (!webglSupported()) { setStatus("off"); return; }
    let cancelled = false; let cleanup: (() => void) | null = null;
    load().then(({ mount }) => {
      if (cancelled) return;
      try { cleanup = mount(element); setStatus("ready"); } catch (error) { console.error(error); setStatus("off"); }
    }).catch(() => { if (!cancelled) setStatus("off"); });
    // O motor escuta o resize da janela; o painel pode mudar de tamanho sem a janela mudar.
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => window.dispatchEvent(new Event("resize"))) : null;
    observer?.observe(element);
    return () => { cancelled = true; observer?.disconnect(); cleanup?.(); };
  }, [load]);
  return <div ref={root} className="fv-lg" data-scene-root data-controls="shown" data-scene={scene} data-state={status}>
    <div id="canvas-container" className="fv-lg-canvas" role="img" aria-label="Cena 3D interativa. Arraste para girar; as ações ficam nos controles." />
    {status !== "ready" && <p className="fv-lg-fallback" role="status">{status === "loading" ? "Preparando o ambiente…" : "O 3D não está disponível neste dispositivo."}</p>}
    {children}
    {status === "ready" && <MasterToggle />}
  </div>;
}

const Chip = ({ id, children, pressed, className = "", ...rest }: { id?: string; children?: ReactNode; pressed?: boolean; className?: string; title?: string; "data-cam"?: string; "data-mode"?: string; "data-ambient"?: string }) =>
  <button type="button" id={id} className={`fv-chip ${className}`.trim()} aria-pressed={pressed} {...rest}>{children}</button>;

const loadRiacho = () => import("./legacy/riacho");
const loadSantuario = () => import("./legacy/santuario");
const loadLago = () => import("./legacy/lago");

export function RiachoScene() {
  return <LegacyScene scene="riacho" load={loadRiacho}>
    <div id="hud-layer" className="fv-lg-hud fv-overlay">
      <div className="fv-lg-tools" role="group" aria-label="Ações do riacho">
        <Chip id="btn-jump-fish">Saltar peixe</Chip>
        <Chip id="btn-reset-cam">Reenquadrar</Chip>
        <Chip id="btn-light-mode"><span id="light-icon" aria-hidden="true">☀️</span><span id="light-label">Sol da Manhã</span></Chip>
        <Chip id="btn-toggle-hud">Modo contemplação</Chip>
        <Chip id="btn-close-env">Pausar ambiente</Chip>
      </div>
      <section className="fv-lg-card fv-minimizable" aria-label="Controles de áudio da paisagem sonora">
        <div className="fv-lg-card-head fv-minhead"><span className="fv-label">Áudio</span><MinToggle label="painel de áudio" /></div>
        <p className="fv-lg-text">Água corrente com pássaros ao fundo. Trecho de <span id="timer-display">45 segundos</span>.</p>
        <div className="fv-lg-bar" title="Ciclo contínuo de 45 segundos"><div id="loop-progress" className="fv-lg-bar-fill" style={{ width: "0%" }} /></div>
        <div className="fv-lg-row">
          <button type="button" id="btn-toggle-sound" className="fv-button"><span id="sound-btn-label">Pausar som</span></button>
          <label className="fv-lg-slider" htmlFor="volume-slider">Volume<input id="volume-slider" type="range" min="0" max="100" defaultValue="42" aria-label="Volume do ambiente" /></label>
        </div>
        <button type="button" id="btn-credits-toggle" className="fv-lg-link" aria-expanded="false"><span id="credits-arrow" aria-hidden="true">▸</span> Créditos e licença</button>
        <div id="credits-panel" className="fv-lg-credits hidden">
          <p><strong>Paisagem sonora e visual 3D em tempo real.</strong> Cena em Three.js com shaders de água, rochas com musgo, peixes articulados e síntese acústica procedural (Web Audio API): riacho cristalino e canto de pássaros gerados no navegador, sem arquivos de áudio externos.</p>
        </div>
      </section>
    </div>
    <button type="button" id="btn-restore-hud" className="fv-chip fv-lg-restore hidden">Mostrar controles</button>
    <div id="ambient-modal" className="fv-lg-modal opacity-0 invisible" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="fv-lg-dialog">
        <h2 id="modal-title">Pausa na paisagem sonora</h2>
        <p>O som do riacho foi suavizado. Você pode retomar a imersão a qualquer instante ou reiniciar o ciclo de 45 segundos.</p>
        <div className="fv-lg-row"><button type="button" id="btn-resume-env" className="fv-button">Retomar ambiente</button><button type="button" id="btn-restart-cycle" className="fv-button fv-button--secondary">Reiniciar 45 s</button></div>
      </div>
    </div>
  </LegacyScene>;
}

export function SantuarioScene() {
  const sliders: [string, string][] = [["smoke", "Fumaça do incenso"], ["fire", "Chamas e velas"], ["sun", "Luz dourada do entardecer"], ["glow", "Luminária de sal e lótus"], ["breeze", "Brisa nas plantas"]];
  const range: Record<string, [number, number]> = { smoke: [0, 200], fire: [15, 180], sun: [10, 180], glow: [20, 180], breeze: [0, 200] };
  return <LegacyScene scene="santuario" load={loadSantuario}>
    <div className="fv-lg-tools fv-overlay" role="group" aria-label="Ações do santuário">
      <Chip id="btn-bowl-strike">Tocar tigela</Chip>
      <Chip id="btn-audio-toggle"><span id="audio-icon" aria-hidden="true">🔇</span><span id="audio-label">Ativar som relaxante</span></Chip>
      <Chip id="btn-ref-modal">Detalhes da cena</Chip>
      <Chip id="btn-toggle-ui">Controles</Chip>
    </div>
    <div id="interaction-toast" className="fv-lg-toast fv-overlay" role="status" style={{ opacity: 0 }}><span id="toast-text">Interaja com o ambiente</span></div>
    <nav className="fv-lg-dock fv-overlay fv-minimizable" aria-label="Câmeras do santuário">
      <span className="fv-minhead"><MinToggle label="câmeras" /></span>
      <Chip className="cam-btn active" data-cam="photo">Ângulo original</Chip>
      <Chip className="cam-btn" data-cam="incense">Incenso e lanterna</Chip>
      <Chip className="cam-btn" data-cam="altar">Altar do Buda</Chip>
      <Chip className="cam-btn" data-cam="window">Janela</Chip>
      <Chip className="cam-btn" data-cam="circle">Roda de almofadas</Chip>
      <Chip id="btn-orbit-auto">Giro suave: <span id="orbit-state">OFF</span></Chip>
    </nav>
    <aside id="control-drawer" className="fv-lg-card fv-lg-drawer fv-overlay fv-minimizable" aria-label="Atmosfera da cena">
      <div className="fv-lg-card-head fv-minhead"><h2>Atmosfera</h2><span id="fps-badge" className="fv-lg-count">60 FPS</span><MinToggle label="atmosfera" /></div>
      {sliders.map(([key, label]) => <div key={key} className="fv-lg-field">
        <div className="fv-lg-row-between"><label htmlFor={`slider-${key}`}>{label}</label><span id={`val-${key}`} className="fv-lg-count">100%</span></div>
        <input id={`slider-${key}`} type="range" min={range[key][0]} max={range[key][1]} defaultValue="100" />
      </div>)}
      <div className="fv-lg-row-between fv-lg-breath"><div><strong>Guia de respiração</strong><p id="breath-status" className="fv-lg-text">Inspire suave… (4-7-8)</p></div><button type="button" id="btn-breath-toggle" className="fv-chip">Ativo</button></div>
    </aside>
    <div id="modal-details" className="fv-lg-modal hidden" role="dialog" aria-modal="true" aria-label="Detalhes da cena">
      <div className="fv-lg-dialog fv-lg-dialog--wide">
        <div className="fv-lg-card-head"><h2>Elementos modelados em 3D</h2><button type="button" id="btn-close-modal" className="fv-chip">Fechar</button></div>
        <ul className="fv-lg-details">
          <li><strong>Parede central e altar.</strong> Tapeçaria com mandala, aparador rústico, Buda em meditação e flor de lótus luminosa.</li>
          <li><strong>Ametista, tigela e japamala.</strong> Drusa de ametista, tigela tibetana com chama e colar japamala.</li>
          <li><strong>Mesa e incenso.</strong> Bandeja circular, queimador com brasa, fumaça volumétrica e lanterna rendada.</li>
          <li><strong>Roda de meditação.</strong> Tapete de juta com mandala, pufes (zafus) e almofadas de linho.</li>
          <li><strong>Janela ao pôr do sol.</strong> Feixes de luz no piso, jiboias pendentes e filtro dos sonhos.</li>
          <li><strong>Lado direito.</strong> Lanterna marroquina, banner dos 7 chakras, planta tropical e luminária de sal.</li>
        </ul>
      </div>
    </div>
  </LegacyScene>;
}

export function LagoScene() {
  return <LegacyScene scene="lago" load={loadLago}>
    <div className="fv-lg-tools fv-overlay" role="group" aria-label="Ações do lago">
      <Chip id="btn-glow-status" title="Peixe brilhante (clique para chamar agora)"><span id="glow-dot" className="fv-lg-dot" aria-hidden="true" /><span id="glow-status-text">Peixe brilhante em 6s</span></Chip>
      <Chip id="btn-open-favorites" title="Afirmações guardadas">★ <span id="fav-count">0</span></Chip>
      <Chip id="btn-open-info" title="Sobre o lago">Sobre</Chip>
    </div>
    <p id="mode-hint-text" className="fv-lg-hint fv-overlay">Mova sobre a água para ondular · Arraste para girar a câmera</p>
    <nav className="fv-lg-dock fv-overlay fv-minimizable" aria-label="Controles do lago">
      <span className="fv-minhead"><MinToggle label="controles do lago" /></span>
      <div className="fv-lg-group" role="group" aria-label="Modo de interação">
        <Chip className="mode-btn" data-mode="ripple" pressed>Ondular</Chip><Chip className="mode-btn" data-mode="stone" pressed={false}>Pedra</Chip><Chip className="mode-btn" data-mode="feed" pressed={false}>Alimentar</Chip>
      </div>
      <div className="fv-lg-group" role="group" aria-label="Iluminação e céu">
        <Chip className="ambient-btn" data-ambient="day" pressed>Dia</Chip><Chip className="ambient-btn" data-ambient="sunset" pressed={false}>Entardecer</Chip><Chip className="ambient-btn" data-ambient="night" pressed={false}>Noite</Chip>
      </div>
      <div className="fv-lg-group">
        <Chip id="btn-rain" pressed={false}>Chuva: Off</Chip><Chip id="btn-sound" pressed={false}>Som: Off</Chip><Chip id="btn-reset-cam">Câmera</Chip>
      </div>
    </nav>
    <div id="affirmation-modal" className="fv-lg-modal hidden" role="dialog" aria-modal="true" aria-labelledby="aff-title">
      <div className="fv-lg-dialog fv-lg-dialog--wide">
        <div className="fv-lg-aff-image"><img id="aff-image" src="" alt="Ilustração contemplativa" /><span id="aff-category" className="fv-label">Autoestima</span><button type="button" id="btn-close-aff" className="fv-chip" aria-label="Fechar mensagem">Fechar</button></div>
        <h2 id="aff-title">Encontro com o peixe luminoso</h2>
        <blockquote className="fv-lg-quote"><p id="aff-quote" /><footer id="aff-author" /></blockquote>
        <div id="aff-secondary-box" className="fv-lg-note"><strong id="aff-extra-label">Afirmação complementar</strong><p id="aff-extra-quote" /><p id="aff-reflection" /></div>
        <div className="fv-lg-row"><button type="button" id="btn-save-fav" className="fv-button fv-button--secondary">★ Salvar afirmação</button><button type="button" id="btn-return-lake" className="fv-button">Retornar ao lago</button></div>
      </div>
    </div>
    <div id="favorites-modal" className="fv-lg-modal hidden" role="dialog" aria-modal="true" aria-labelledby="fav-modal-title">
      <div className="fv-lg-dialog">
        <div className="fv-lg-card-head"><h2 id="fav-modal-title">Afirmações guardadas</h2><button type="button" id="btn-close-fav" className="fv-chip">Fechar</button></div>
        <div id="favorites-list" className="fv-lg-favs"><p className="fv-lg-empty">Clique no peixe brilhante para descobrir e guardar afirmações.</p></div>
      </div>
    </div>
    <div id="info-modal" className="fv-lg-modal hidden" role="dialog" aria-modal="true" aria-labelledby="info-modal-title">
      <div className="fv-lg-dialog">
        <div className="fv-lg-card-head"><h2 id="info-modal-title">Sobre o lago 3D</h2><button type="button" id="btn-close-info" className="fv-chip">Fechar</button></div>
        <ul className="fv-lg-details">
          <li><strong>Fundo do lago.</strong> Pedras de rio, troncos submersos, seixos e plantas aquáticas.</li>
          <li><strong>Água e mouse.</strong> Mova ou clique na água para gerar ondas, atirar pedras ou alimentar os peixes.</li>
          <li><strong>Peixes.</strong> Carpas Kohaku e Yamabuki, acará-bandeira, tetras neon e peixe-véu turquesa.</li>
          <li><strong>Peixe brilhante.</strong> A cada 30 s um peixe luminoso atravessa o lago; clique nele para abrir uma imagem e afirmações. Guarde as que fizerem sentido.</li>
        </ul>
        <p className="fv-lg-text">Arraste para orbitar a câmera e use a roda do mouse para aproximar.</p>
      </div>
    </div>
  </LegacyScene>;
}
