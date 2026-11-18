"use client";
import { BreathPractice } from "../pause/BreathPractice";
import { ObservePractice } from "../pause/ObservePractice";
import { SensesPractice } from "../pause/SensesPractice";
import { ListenPractice } from "../pause/ListenPractice";
import { MovePractice } from "../pause/MovePractice";
import { SlowPractice } from "../pause/SlowPractice";

/** Conteúdo de cada prática da Sala de Pausa; o cabeçalho e a barra de controles ficam no recurso. */
export function PausePractice({ practice, paused, motion }: { practice: string; title?: string; paused: boolean; motion: boolean }) {
  return <div className="pause-workspace" data-paused={paused} data-motion={motion}>
    {practice === "respirar" && <BreathPractice paused={paused} motion={motion} />}
    {practice === "observar" && <ObservePractice paused={paused} motion={motion} />}
    {practice === "pelos-sentidos" && <SensesPractice paused={paused} motion={motion} />}
    {practice === "ouvir" && <ListenPractice paused={paused} />}
    {practice === "movimentar" && <MovePractice paused={paused} motion={motion} />}
    {practice === "desacelerar" && <SlowPractice paused={paused} />}
  </div>;
}
