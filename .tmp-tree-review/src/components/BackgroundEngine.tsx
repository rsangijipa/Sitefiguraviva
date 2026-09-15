import React from "react";
import { TimeOfDay } from "../types";

interface BackgroundEngineProps {
  timeOfDay: TimeOfDay;
}

export default function BackgroundEngine({ timeOfDay }: BackgroundEngineProps) {
  // Theme-specific lighting colors
  const timeStyles = {
    tarde: {
      bg: "from-[#fcfaf7] via-[#f7f3eb] to-[#efe9dd]",
      aurora1: "bg-[#e2a854]/12",
      aurora2: "bg-[#fe538b]/8",
      sunbeam: "rgba(254, 215, 1, 0.12)",
      paperTint: "bg-[#fffdfa]/40",
    },
    crepusculo: {
      bg: "from-[#1d182b] via-[#281b35] to-[#13111c]",
      aurora1: "bg-[#c084fc]/18",
      aurora2: "bg-[#06b6d4]/14",
      sunbeam: "rgba(192, 132, 252, 0.08)",
      paperTint: "bg-[#13111c]/20",
    },
    alvorada: {
      bg: "from-[#f3f8f6] via-[#e8f3ee] to-[#d8e8e1]",
      aurora1: "bg-[#04db9f]/14",
      aurora2: "bg-[#ff8bc7]/10",
      sunbeam: "rgba(255, 230, 180, 0.16)",
      paperTint: "bg-[#f8fcf9]/40",
    },
  }[timeOfDay];

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none transition-colors duration-1000">
      {/* Dynamic atmospheric gradient base */}
      <div
        className={`absolute inset-0 bg-gradient-to-b ${timeStyles.bg} transition-all duration-1000`}
      />

      {/* Atmospheric Soft Aurora Orbs */}
      <div
        className={`absolute top-[-15%] left-[-10%] w-[65%] h-[65%] ${timeStyles.aurora1} blur-[130px] rounded-full transition-all duration-1000 animate-pulse`}
        style={{ animationDuration: "14s" }}
      />
      <div
        className={`absolute bottom-[-15%] right-[-10%] w-[60%] h-[60%] ${timeStyles.aurora2} blur-[140px] rounded-full transition-all duration-1000 animate-pulse`}
        style={{ animationDuration: "18s" }}
      />

      {/* Subtle Dappled Sunbeams filtering from above */}
      <div
        className="absolute -top-20 left-1/4 w-96 h-[800px] pointer-events-none opacity-40 mix-blend-screen transform -rotate-12 blur-3xl transition-opacity duration-1000"
        style={{
          background: `radial-gradient(ellipse at top, ${timeStyles.sunbeam} 0%, transparent 70%)`,
        }}
      />

      {/* Organic Watercolor Texture */}
      <div
        className="absolute inset-0 opacity-[0.28] mix-blend-multiply pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#c6b69b 0.75px, transparent 0.75px), radial-gradient(#d4c4a8 0.75px, #fbf9f5 0.75px)`,
          backgroundSize: "30px 30px",
          backgroundPosition: "0 0, 15px 15px",
        }}
      />

      {/* Fine Artisanal Grain */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none bg-repeat"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Ground Horizon Mist */}
      <div
        className={`absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t ${timeStyles.paperTint} to-transparent pointer-events-none`}
      />
    </div>
  );
}
