import React from 'react';
import { BodyPartId, BodyData, SensationType } from '../types';

interface BodyMapProps {
  data: BodyData;
  selectedPart: BodyPartId | null;
  onSelectPart: (part: BodyPartId) => void;
  readOnly?: boolean;
}

const getFillColor = (sensation?: SensationType, intensity: number = 0, isSelected: boolean = false): string => {
  if (isSelected) return '#ffffff'; // Selected highlight
  
  if (!sensation) return 'rgba(231, 229, 228, 0.4)'; // Default stone-200ish

  // Opacity based on intensity (1-5)
  const opacity = 0.5 + (intensity / 10); 

  switch (sensation) {
    case 'tension': return `rgba(192, 130, 103, ${opacity})`; // Clay
    case 'heat': return `rgba(212, 163, 115, ${opacity})`; // Ochre
    case 'weight': return `rgba(100, 116, 139, ${opacity})`; // Ocean
    case 'tingling': return `rgba(217, 185, 155, ${opacity})`; // Sand
    case 'numbness': return `rgba(168, 162, 158, ${opacity})`; // Stone
    case 'neutral': return `rgba(141, 163, 153, ${opacity})`; // Sage
    default: return 'rgba(231, 229, 228, 0.4)';
  }
};

const BodyMap: React.FC<BodyMapProps> = ({ data, selectedPart, onSelectPart, readOnly = false }) => {
  
  const handleInteract = (part: BodyPartId) => {
    if (!readOnly) {
      onSelectPart(part);
    }
  };

  const getStyle = (part: BodyPartId) => ({
    fill: getFillColor(data[part]?.sensation, data[part]?.intensity, selectedPart === part),
    transition: 'fill 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: readOnly ? 'default' : 'pointer',
    stroke: selectedPart === part ? '#57534e' : 'transparent', // Stone-600
    strokeWidth: 1.5,
  });

  // Base silhouette color for the background layer
  const baseClass = "fill-[#e7e5e4] opacity-50"; 

  // Path Definitions for a Realistic Silhouette
  // Coordinate space: 0 0 300 700
  const paths = {
    head: "M150,35 C132,35 118,52 118,82 C118,115 132,125 150,125 C168,125 182,115 182,82 C182,52 168,35 150,35 Z",
    neck: "M136,118 Q150,125 164,118 L168,142 Q150,148 132,142 Z",
    chest: "M132,142 Q150,148 168,142 L205,152 Q212,170 202,215 L195,245 L105,245 L98,215 Q88,170 95,152 Z",
    stomach: "M105,245 L195,245 L198,285 Q205,315 150,325 Q95,315 102,285 L105,245 Z",
    leftArm: "M95,152 Q80,165 72,210 L65,280 L55,340 L75,350 L85,340 L95,280 Q102,215 98,215 L105,245 L98,215 Z", // Simplified contour
    // Refined separate Left Arm
    leftArmReal: "M92,155 Q80,158 70,200 Q65,240 60,280 L52,330 L65,345 L78,330 L85,280 Q92,230 102,220 Z",
    rightArmReal: "M208,155 Q220,158 230,200 Q235,240 240,280 L248,330 L235,345 L222,330 L215,280 Q208,230 198,220 Z",
    
    leftLeg: "M102,285 Q90,305 92,380 Q94,450 95,580 L135,580 Q140,450 142,380 Q145,325 150,325 Z",
    rightLeg: "M198,285 Q210,305 208,380 Q206,450 205,580 L165,580 Q160,450 158,380 Q155,325 150,325 Z",
    
    // Feet
    feetLeft: "M98,580 L132,580 L135,600 Q140,635 115,635 Q90,635 95,600 Z",
    feetRight: "M168,580 L202,580 L205,600 Q210,635 185,635 Q160,635 165,600 Z"
  };

  const renderPath = (id: string, d: string, interactId: BodyPartId) => (
    <path
      id={id}
      d={d}
      style={getStyle(interactId)}
      onClick={(e) => {
        e.stopPropagation();
        handleInteract(interactId);
      }}
    />
  );

  const renderBackPath = (d: string) => (
    <path d={d} className={baseClass} />
  );

  return (
    <svg viewBox="0 0 300 700" preserveAspectRatio="xMidYMid meet" className="h-full w-auto max-h-[70vh] mx-auto filter drop-shadow-lg">
      <defs>
        <filter id="organic-blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
        </filter>
      </defs>

      {/* Background Silhouette (Non-interactive visual anchor) */}
      <g filter="url(#organic-blur)">
        {renderBackPath(paths.head)}
        {renderBackPath(paths.neck)}
        {renderBackPath(paths.chest)}
        {renderBackPath(paths.stomach)}
        {renderBackPath(paths.leftArmReal)}
        {renderBackPath(paths.rightArmReal)}
        {renderBackPath(paths.leftLeg)}
        {renderBackPath(paths.rightLeg)}
        {renderBackPath(paths.feetLeft)}
        {renderBackPath(paths.feetRight)}
      </g>

      {/* Interactive Layer */}
      <g className="hover:opacity-95">
        {renderPath('head', paths.head, 'head')}
        {renderPath('neck', paths.neck, 'neck')}
        {renderPath('chest', paths.chest, 'chest')}
        {renderPath('stomach', paths.stomach, 'stomach')}
        
        {renderPath('leftArm', paths.leftArmReal, 'leftArm')}
        {renderPath('rightArm', paths.rightArmReal, 'rightArm')}
        
        {renderPath('leftLeg', paths.leftLeg, 'leftLeg')}
        {renderPath('rightLeg', paths.rightLeg, 'rightLeg')}
        
        {/* Feet Group */}
        <g onClick={(e) => { e.stopPropagation(); handleInteract('feet'); }} style={{ cursor: readOnly ? 'default' : 'pointer' }}>
            <path d={paths.feetLeft} style={getStyle('feet')} />
            <path d={paths.feetRight} style={getStyle('feet')} />
        </g>
      </g>
    </svg>
  );
};

export default BodyMap;
