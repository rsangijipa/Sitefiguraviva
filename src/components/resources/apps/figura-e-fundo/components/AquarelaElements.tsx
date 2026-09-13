import React from "react";

// Specialized organic SVG paths crafted to evoke fluid watercolor stains and branching foliage
export const SVG_SHAPES = {
  // Amorphous fluid watercolor stain (mancha de aquarela 1)
  watercolorStain1:
    "M 120,45 C 190,20 280,35 320,95 C 360,155 350,230 300,280 C 250,330 160,350 95,305 C 30,260 25,185 55,115 C 75,70 85,55 120,45 Z",

  // Secondary soft oval stain (mancha suave 2)
  watercolorStain2:
    "M 90,30 C 145,15 210,35 240,80 C 270,125 260,185 225,225 C 190,265 120,275 70,245 C 20,215 15,150 35,95 C 50,55 60,35 90,30 Z",

  // Deep indigo/graphite puddle (mancha densa)
  watercolorDense:
    "M 80,40 C 130,25 180,50 205,95 C 230,140 215,190 180,225 C 145,260 90,265 50,230 C 10,195 5,140 25,90 C 40,55 55,45 80,40 Z",

  // Natural branching botanical stem (ramo principal)
  botanicalBranch:
    "M 40,320 C 65,270 95,225 130,175 C 160,135 195,95 235,50 M 130,175 C 120,150 105,130 80,120 M 130,175 C 145,150 170,135 190,130 M 180,115 C 165,85 145,70 120,65 M 195,95 C 215,75 240,70 260,75",

  // Delicate leaves on branch
  leaf1: "M 0,0 C 12,-15 30,-15 42,0 C 30,15 12,15 0,0 Z",
  leaf2: "M 0,0 C 15,-10 32,-8 40,5 C 25,12 10,10 0,0 Z",

  // Floating single botanical tendril (ramo delicado curvo)
  delicateTendril:
    "M 20,260 C 50,210 70,150 110,110 C 150,70 200,50 260,35 M 70,180 C 90,170 115,175 130,190 M 130,120 C 150,105 175,110 190,125 M 190,65 C 210,50 235,55 250,70",

  // Rhythmic ink wave line (linha contínua)
  contourLine:
    "M 20,180 C 80,120 140,240 220,160 C 300,80 360,200 440,140 C 500,95 540,130 580,110",

  // Secondary contour
  contourLineSubtle:
    "M 30,150 C 90,200 170,100 250,170 C 330,240 410,130 490,170",

  // Organic pebble / smooth rounded mass
  organicPebble:
    "M 70,25 C 120,15 165,40 180,85 C 195,130 175,175 135,195 C 95,215 45,195 25,155 C 5,115 20,35 70,25 Z",
};

// SVG Filters for paper grain and soft watercolor edge bleeding
export const WatercolorFilters: React.FC = () => {
  return (
    <defs>
      {/* Subtle organic edge displacement for watercolor bloom effect */}
      <filter id="aquarela-bleed" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.04"
          numOctaves="3"
          result="noise"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="noise"
          scale="4"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>

      {/* Gentle drop glow for focused figure */}
      <filter id="figure-glow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="6" result="blur" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0.1   0 0 0 0 0.1   0 0 0 0 0.1   0 0 0 0.15 0"
          result="shadow"
        />
        <feMerge>
          <feMergeNode in="shadow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* Soft grain filter */}
      <filter id="subtle-grain" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.65"
          numOctaves="3"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
        <feComponentTransfer>
          <feFuncA type="linear" slope="0.05" />
        </feComponentTransfer>
      </filter>

      {/* Radial soft watercolor gradient 1: Terracotta / Ochre */}
      <radialGradient id="grad-ochre" cx="40%" cy="40%" r="65%">
        <stop offset="0%" stopColor="#C97A4A" stopOpacity="0.85" />
        <stop offset="50%" stopColor="#D99B6A" stopOpacity="0.65" />
        <stop offset="85%" stopColor="#E2B895" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#E2B895" stopOpacity="0" />
      </radialGradient>

      {/* Radial soft watercolor gradient 2: Indigo / Mineral Slate */}
      <radialGradient id="grad-indigo" cx="35%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#2E3C48" stopOpacity="0.88" />
        <stop offset="45%" stopColor="#4A5D6E" stopOpacity="0.62" />
        <stop offset="85%" stopColor="#6C8296" stopOpacity="0.25" />
        <stop offset="100%" stopColor="#6C8296" stopOpacity="0" />
      </radialGradient>

      {/* Radial soft watercolor gradient 3: Olive / Sage */}
      <radialGradient id="grad-sage" cx="45%" cy="45%" r="65%">
        <stop offset="0%" stopColor="#556554" stopOpacity="0.85" />
        <stop offset="50%" stopColor="#7B8F7A" stopOpacity="0.55" />
        <stop offset="90%" stopColor="#A4B7A3" stopOpacity="0.2" />
        <stop offset="100%" stopColor="#A4B7A3" stopOpacity="0" />
      </radialGradient>

      {/* Radial soft watercolor gradient 4: Warm Sand / Linen */}
      <radialGradient id="grad-sand" cx="50%" cy="50%" r="60%">
        <stop offset="0%" stopColor="#B39E82" stopOpacity="0.75" />
        <stop offset="55%" stopColor="#C8B8A2" stopOpacity="0.45" />
        <stop offset="100%" stopColor="#D8CDBE" stopOpacity="0" />
      </radialGradient>

      {/* Deep Sepia Graphite Wash */}
      <radialGradient id="grad-graphite" cx="35%" cy="35%" r="70%">
        <stop offset="0%" stopColor="#1E1C1A" stopOpacity="0.9" />
        <stop offset="60%" stopColor="#3C3835" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#5A544F" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
};
