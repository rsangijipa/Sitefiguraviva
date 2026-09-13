"use client";
import { useState } from "react";
import { getIntensityLabel } from "../utils/particle-colors";

interface IntensitySliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function IntensitySlider({ value, onChange }: IntensitySliderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const label = getIntensityLabel(value);
  const percent = value * 10;

  return (
    <div className="w-full space-y-3">
      <label
        htmlFor="intensidade-slider"
        className="flex items-center justify-between text-sm font-bold text-primary"
      >
        <span>Intensidade percebida</span>
        <strong className="font-serif text-3xl text-text">{value}</strong>
      </label>

      {/* Slider track wrapper */}
      <div className="relative h-8 py-2">
        {/* Gradient background track */}
        <div className="pointer-events-none absolute inset-y-[10px] left-2 right-2 rounded-full bg-gradient-to-r from-muted/40 via-primary/40 to-terra">
          {/* Fill progress */}
          <div
            className="absolute top-0 bottom-0 left-2 rounded-full bg-gradient-to-r from-muted to-primary transition-[width] duration-150"
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* Native input — visually hidden but accessible/focusable */}
        <input
          id="intensidade-slider"
          type="range"
          min="0"
          max="10"
          step="1"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          onMouseDown={() => setIsDragging(true)}
          onTouchStart={() => setIsDragging(true)}
          onBlur={() => setIsDragging(false)}
          onTouchEnd={() => setIsDragging(false)}
          className="peer relative z-10 m-0 h-8 w-full cursor-pointer appearance-none bg-transparent p-0 outline-none accent-transparent"
          style={{ WebkitAppearance: "none", MozAppearance: "none" }}
        />

        {/* Custom thumb */}
        <div
          className="pointer-events-none absolute top-1/2 z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white shadow-lg transition-[left,border-color,box-shadow] duration-150"
          style={{
            left: `calc(${percent}% + var(--thumb-offset, -12px))`,
            transform: "translateY(-50%)",
            borderColor:
              value <= 4 ? "#6B6B63" : value <= 7 ? "#005A1F" : "#96551F",
            boxShadow:
              value >= 6
                ? `0 0 ${Math.round((value - 5) * 3)}px rgba(0,90,31,${(value / 30).toFixed(2)})`
                : "none",
          }}
          aria-hidden="true"
        />
      </div>

      {/* Dynamic label during interaction */}
      <div
        className={`text-center text-xs font-medium text-text/80 transition-opacity duration-200 ${isDragging ? "opacity-100" : "opacity-0"}`}
      >
        {label}
      </div>

      {/* Scale endpoints */}
      <div className="flex justify-between text-xs text-text/50">
        <span>0 · quase não noto</span>
        <span>10 · muito presente</span>
      </div>
    </div>
  );
}
