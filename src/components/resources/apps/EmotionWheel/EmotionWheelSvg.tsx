import React, { useMemo } from 'react';
import { EMOTION_FAMILIES } from '../../../data/emotionsData';
import { audioService } from '../../../services/audioService';

interface EmotionWheelSvgProps {
  selectedFamilyId?: string;
  selectedSecondaryId?: string;
  selectedNuanceId?: string;
  onSelectFamily: (familyId: string) => void;
  onSelectSecondary: (secondaryId: string, familyId: string) => void;
  onSelectNuance: (nuanceId: string, secondaryId: string, familyId: string) => void;
  onReset: () => void;
  isReducedMotion?: boolean;
}

// Helper para calcular coordenadas polares para cartesianas
function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

// Helper para gerar o caminho SVG de um setor em anel (annular wedge)
function describeArc(
  x: number,
  y: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number
) {
  // Pequeno offset para evitar sobreposição total se for 360
  const adjustedEndAngle = endAngle - 0.35;
  const adjustedStartAngle = startAngle + 0.35;

  const startOuter = polarToCartesian(x, y, outerRadius, adjustedStartAngle);
  const endOuter = polarToCartesian(x, y, outerRadius, adjustedEndAngle);
  const startInner = polarToCartesian(x, y, innerRadius, adjustedStartAngle);
  const endInner = polarToCartesian(x, y, innerRadius, adjustedEndAngle);

  const arcSweep = adjustedEndAngle - adjustedStartAngle <= 180 ? '0' : '1';

  return [
    'M',
    startInner.x,
    startInner.y,
    'L',
    startOuter.x,
    startOuter.y,
    'A',
    outerRadius,
    outerRadius,
    0,
    arcSweep,
    1,
    endOuter.x,
    endOuter.y,
    'L',
    endInner.x,
    endInner.y,
    'A',
    innerRadius,
    innerRadius,
    0,
    arcSweep,
    0,
    startInner.x,
    startInner.y,
    'Z',
  ].join(' ');
}

export const EmotionWheelSvg: React.FC<EmotionWheelSvgProps> = ({
  selectedFamilyId,
  selectedSecondaryId,
  selectedNuanceId,
  onSelectFamily,
  onSelectSecondary,
  onSelectNuance,
  onReset,
  isReducedMotion = false,
}) => {
  const cx = 300;
  const cy = 300;

  // Raios concêntricos
  const rHub = 46;
  const r1In = 52;
  const r1Out = 126;
  const r2In = 132;
  const r2Out = 208;
  const r3In = 214;
  const r3Out = 286;

  // 6 famílias (60 graus cada)
  const familyCount = EMOTION_FAMILIES.length;
  const degPerFamily = 360 / familyCount;

  // Estrutura plana calculada para renderização
  const segments = useMemo(() => {
    return EMOTION_FAMILIES.map((family, fIdx) => {
      const startAngle = fIdx * degPerFamily;
      const endAngle = startAngle + degPerFamily;
      const midAngle = startAngle + degPerFamily / 2;

      // 3 secundárias por família
      const degPerSecondary = degPerFamily / family.secondaries.length;
      const secondaries = family.secondaries.map((sec, sIdx) => {
        const sStart = startAngle + sIdx * degPerSecondary;
        const sEnd = sStart + degPerSecondary;
        const sMid = sStart + degPerSecondary / 2;

        // 3 nuances por secundária
        const degPerNuance = degPerSecondary / sec.nuances.length;
        const nuances = sec.nuances.map((nuance, nIdx) => {
          const nStart = sStart + nIdx * degPerNuance;
          const nEnd = nStart + degPerNuance;
          const nMid = nStart + degPerNuance / 2;

          return {
            ...nuance,
            startAngle: nStart,
            endAngle: nEnd,
            midAngle: nMid,
          };
        });

        return {
          ...sec,
          startAngle: sStart,
          endAngle: sEnd,
          midAngle: sMid,
          nuances,
        };
      });

      return {
        ...family,
        startAngle,
        endAngle,
        midAngle,
        secondaries,
      };
    });
  }, [familyCount, degPerFamily]);

  const activeFamily = useMemo(
    () => EMOTION_FAMILIES.find((f) => f.id === selectedFamilyId),
    [selectedFamilyId]
  );

  return (
    <div className="relative w-full max-w-[560px] mx-auto aspect-square flex items-center justify-center p-2 select-none">
      <svg
        viewBox="0 0 600 600"
        className="w-full h-full drop-shadow-none"
        role="region"
        aria-label="Roda interativa das emoções em três camadas"
      >
        <defs>
          {/* Marcador de forma para acessibilidade / alto contraste */}
          <pattern id="selectedHatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#005A1F" strokeWidth="1.5" strokeOpacity="0.25" />
          </pattern>
        </defs>

        {/* Fundo do círculo */}
        <circle cx={cx} cy={cy} r={r3Out + 4} fill="#FDFAF4" stroke="#F1E9DB" strokeWidth="2" />

        {/* CAMADA 3: NUANCES (Anel Externo) */}
        <g id="layer-nuances" aria-label="Camada de Nuances Afetivas">
          {segments.map((family) => {
            const isFamilySelected = selectedFamilyId === family.id;
            return family.secondaries.map((secondary) => {
              const isSecondarySelected = selectedSecondaryId === secondary.id;

              return secondary.nuances.map((nuance) => {
                const isSelected = selectedNuanceId === nuance.id;
                const path = describeArc(
                  cx,
                  cy,
                  r3In,
                  r3Out,
                  nuance.startAngle,
                  nuance.endAngle
                );

                const centerPos = polarToCartesian(cx, cy, (r3In + r3Out) / 2, nuance.midAngle);

                // Estilos por tokens Confluência
                let fill = '#FAF6EE';
                let stroke = '#D8CFBE';
                let strokeWidth = 1.5;

                if (isSelected) {
                  fill = '#E7DEC8';
                  stroke = '#005A1F';
                  strokeWidth = 3.5;
                } else if (isSecondarySelected) {
                  fill = '#F4EDE0';
                  stroke = '#96551F';
                  strokeWidth = 2;
                } else if (isFamilySelected) {
                  fill = '#F7F2E8';
                  stroke = '#C2B8A3';
                  strokeWidth = 1.5;
                }

                // Ângulo para legibilidade do texto radial
                const rotation = nuance.midAngle > 180 ? nuance.midAngle - 90 + 180 : nuance.midAngle - 90;

                return (
                  <g key={nuance.id}>
                    <path
                      id={`nuance-${nuance.id}`}
                      d={path}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={strokeWidth}
                      tabIndex={0}
                      role="button"
                      aria-label={`Nuance: ${nuance.name}. ${nuance.phenomenologicalDescription}`}
                      aria-pressed={isSelected}
                      className={`cursor-pointer transition-all ${
                        isReducedMotion ? '' : 'hover:brightness-95 focus:brightness-90'
                      }`}
                      onClick={() => {
                        audioService.playSelectTone(3);
                        onSelectNuance(nuance.id, secondary.id, family.id);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          audioService.playSelectTone(3);
                          onSelectNuance(nuance.id, secondary.id, family.id);
                        }
                      }}
                    />
                    {/* Indicador de forma para selecionado (nunca apenas cor) */}
                    {isSelected && (
                      <circle
                        cx={centerPos.x}
                        cy={centerPos.y}
                        r="3"
                        fill="#005A1F"
                        className="pointer-events-none"
                      />
                    )}
                    {/* Texto legível do anel exterior (apenas se a família estiver em foco para clareza visual) */}
                    {(isFamilySelected || isSecondarySelected) && (
                      <text
                        x={centerPos.x}
                        y={centerPos.y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        transform={`rotate(${rotation}, ${centerPos.x}, ${centerPos.y})`}
                        className={`text-[9.5px] font-medium pointer-events-none ${
                          isSelected ? 'font-bold fill-[#005A1F]' : 'fill-[#4B4B49]'
                        }`}
                      >
                        {nuance.name}
                      </text>
                    )}
                  </g>
                );
              });
            });
          })}
        </g>

        {/* CAMADA 2: EMOÇÕES RELACIONADAS (Anel Intermediário) */}
        <g id="layer-secondaries" aria-label="Camada de Emoções Relacionadas">
          {segments.map((family) => {
            const isFamilySelected = selectedFamilyId === family.id;

            return family.secondaries.map((secondary) => {
              const isSelected = selectedSecondaryId === secondary.id;
              const path = describeArc(
                cx,
                cy,
                r2In,
                r2Out,
                secondary.startAngle,
                secondary.endAngle
              );

              const centerPos = polarToCartesian(cx, cy, (r2In + r2Out) / 2, secondary.midAngle);

              let fill = '#F3ECE0';
              let stroke = '#D8CFBE';
              let strokeWidth = 2;

              if (isSelected) {
                fill = '#E5D8BE';
                stroke = '#005A1F';
                strokeWidth = 3.5;
              } else if (isFamilySelected) {
                fill = '#EFE6D5';
                stroke = '#6B6B63';
                strokeWidth = 2;
              }

              const rotation = secondary.midAngle > 180 ? secondary.midAngle - 90 + 180 : secondary.midAngle - 90;

              return (
                <g key={secondary.id}>
                  <path
                    id={`secondary-${secondary.id}`}
                    d={path}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    tabIndex={0}
                    role="button"
                    aria-label={`Emoção relacionada: ${secondary.name} da família ${family.name}`}
                    aria-pressed={isSelected}
                    className={`cursor-pointer transition-all ${
                      isReducedMotion ? '' : 'hover:brightness-95 focus:brightness-90'
                    }`}
                    onClick={() => {
                      audioService.playSelectTone(2);
                      onSelectSecondary(secondary.id, family.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        audioService.playSelectTone(2);
                        onSelectSecondary(secondary.id, family.id);
                      }
                    }}
                  />
                  {/* Indicador de forma: anel sutil para item ativo */}
                  {isSelected && (
                    <circle
                      cx={centerPos.x}
                      cy={centerPos.y - 12}
                      r="2.5"
                      fill="#005A1F"
                      className="pointer-events-none"
                    />
                  )}
                  <text
                    x={centerPos.x}
                    y={centerPos.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    transform={`rotate(${rotation}, ${centerPos.x}, ${centerPos.y})`}
                    className={`text-[11px] pointer-events-none ${
                      isSelected
                        ? 'font-bold fill-[#005A1F]'
                        : isFamilySelected
                        ? 'font-semibold fill-[#262B22]'
                        : 'font-normal fill-[#6B6B63]'
                    }`}
                  >
                    {secondary.name}
                  </text>
                </g>
              );
            });
          })}
        </g>

        {/* CAMADA 1: FAMÍLIAS EMOCIONAIS (Anel Interno) */}
        <g id="layer-families" aria-label="Camada Central: Famílias Emocionais">
          {segments.map((family) => {
            const isSelected = selectedFamilyId === family.id;
            const path = describeArc(cx, cy, r1In, r1Out, family.startAngle, family.endAngle);
            const centerPos = polarToCartesian(cx, cy, (r1In + r1Out) / 2, family.midAngle);

            let fill = '#EBE2D0';
            let stroke = '#D8CFBE';
            let strokeWidth = 2;

            if (isSelected) {
              fill = '#DECEB2';
              stroke = '#005A1F';
              strokeWidth = 4;
            }

            const rotation = family.midAngle > 180 ? family.midAngle - 90 + 180 : family.midAngle - 90;

            // Formatação do nome da família em duas linhas curtas
            const parts = family.name.split(' & ');

            return (
              <g key={family.id}>
                <path
                  id={`family-${family.id}`}
                  d={path}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  tabIndex={0}
                  role="button"
                  aria-label={`Família emocional: ${family.name}. ${family.description}`}
                  aria-pressed={isSelected}
                  className={`cursor-pointer transition-all ${
                    isReducedMotion ? '' : 'hover:brightness-95 focus:brightness-90'
                  }`}
                  onClick={() => {
                    audioService.playSelectTone(1);
                    onSelectFamily(family.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      audioService.playSelectTone(1);
                      onSelectFamily(family.id);
                    }
                  }}
                />

                {/* Marcador de forma para selecionado: linha sólida na base */}
                {isSelected && (
                  <circle
                    cx={centerPos.x}
                    cy={centerPos.y - 18}
                    r="3.5"
                    fill="#005A1F"
                    className="pointer-events-none"
                  />
                )}

                <text
                  x={centerPos.x}
                  y={parts.length > 1 ? centerPos.y - 6 : centerPos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  transform={`rotate(${rotation}, ${centerPos.x}, ${centerPos.y})`}
                  className={`text-[12px] font-fraunces pointer-events-none ${
                    isSelected ? 'font-bold fill-[#005A1F]' : 'font-semibold fill-[#262B22]'
                  }`}
                >
                  {parts[0]}
                </text>
                {parts[1] && (
                  <text
                    x={centerPos.x}
                    y={centerPos.y + 7}
                    textAnchor="middle"
                    dominantBaseline="central"
                    transform={`rotate(${rotation}, ${centerPos.x}, ${centerPos.y})`}
                    className={`text-[9.5px] pointer-events-none ${
                      isSelected ? 'font-bold fill-[#005A1F]' : 'fill-[#4B4B49]'
                    }`}
                  >
                    & {parts[1]}
                  </text>
                )}
              </g>
            );
          })}
        </g>

        {/* NÚCLEO CENTRAL (Hub / Reset / Ponto de ancoragem) */}
        <g id="wheel-center-hub">
          <circle
            cx={cx}
            cy={cy}
            r={rHub}
            fill="#FDFAF4"
            stroke={activeFamily ? '#005A1F' : '#D8CFBE'}
            strokeWidth={activeFamily ? '2.5' : '2'}
            className="cursor-pointer hover:bg-[#F1E9DB] transition-colors"
            onClick={onReset}
            tabIndex={0}
            role="button"
            aria-label="Centro da roda: clique para reiniciar visualização central"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onReset();
              }
            }}
          />

          {/* Símbolo de centro límpido (círculo e ponto contemplativo) */}
          <circle cx={cx} cy={cy} r="18" fill="none" stroke="#D8CFBE" strokeWidth="1.5" className="pointer-events-none" />
          <circle cx={cx} cy={cy} r="4" fill={activeFamily ? '#005A1F' : '#6B6B63'} className="pointer-events-none" />

          <text
            x={cx}
            y={cy + 28}
            textAnchor="middle"
            className="text-[9px] font-medium fill-[#6B6B63] pointer-events-none uppercase tracking-wider"
          >
            {activeFamily ? 'Reiniciar' : 'Centro'}
          </text>
        </g>
      </svg>
    </div>
  );
};
