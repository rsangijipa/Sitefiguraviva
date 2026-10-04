"use client";
import dynamic from "next/dynamic";
import SalaDePausaApp from "./SalaDePausaApp";
const loading = () => <p role="status" className="p-6 text-primary">Preparando prática...</p>;
const Breathing = dynamic(() => import("../breathing/BreathingApp"), { ssr: false, loading });
const Grounding = dynamic(() => import("../grounding-54321/App"), { ssr: false, loading });
const Sounds = dynamic(() => import("../Escuta-sons-para-awareness/AwarenessSoundsApp"), { ssr: false, loading });
type Props = React.ComponentProps<typeof SalaDePausaApp> & { activeSection?: string };
// Changing practice unmounts the previous player, stopping its timer and audio.
export default function ConsolidatedPauseApp({ activeSection = "pause", ...props }: Props) {
  if (activeSection === "breathing") return <Breathing />;
  if (activeSection === "grounding") return <Grounding />;
  if (activeSection === "sounds") return <Sounds onExit={props.onExit} />;
  return <SalaDePausaApp {...props} />;
}
