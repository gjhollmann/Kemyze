import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

// KM-79: Quantity indicator for the Chemical Inventory screen.
// Draws a small flask whose liquid level and color show how much is left.

// Turns whatever is stored in the database ("low", "Medium", "HIGH", "GOOD"...)
// into the color and liquid level the flask should show.
// The quantity field is free text, so we ignore upper/lower case.
export function getQuantityStyle(quantity: string | null | undefined) {
  const value = (quantity || '').trim().toLowerCase();

  if (value === 'high' || value === 'good' || value === 'full') {
    return { color: '#4ade80', level: 20 }; // green, almost full
  }
  if (value === 'medium' || value === 'med' || value === 'half') {
    return { color: '#fbbf24', level: 31 }; // yellow, about half
  }
  if (value === 'low' || value === 'empty') {
    return { color: '#f87171', level: 39 }; // red, nearly empty
  }
  // Anything we don't recognize: grey, empty flask
  return { color: '#64748b', level: null };
}

interface QuantityFlaskProps {
  quantity: string | null | undefined;
}

export function QuantityFlask({ quantity }: QuantityFlaskProps) {
  const { color, level } = getQuantityStyle(quantity);

  // The flask's slanted sides go from the neck (y = 17) to the base (y = 41).
  // These two helpers find where the sides are at a given liquid height,
  // so the liquid's top edge lines up with the glass.
  const leftSide = (y: number) => 15 - ((y - 17) * 11) / 24;
  const rightSide = (y: number) => 25 + ((y - 17) * 11) / 24;

  return (
    <Svg width={40} height={48} viewBox="0 0 40 48">
      {/* The liquid (only drawn when we know the quantity) */}
      {level !== null && (
        <Path
          d={`M${leftSide(level)} ${level} L4 41 Q2 46 7 46 H33 Q38 46 36 41 L${rightSide(level)} ${level} Z`}
          fill={color}
        />
      )}

      {/* The glass outline of the flask */}
      <Path
        d="M15 4 V17 L4 41 Q2 46 7 46 H33 Q38 46 36 41 L25 17 V4"
        fill="rgba(255,255,255,0.08)"
        stroke="#cbd5e1"
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* The rim at the top of the neck */}
      <Rect x={12} y={2} width={16} height={3} rx={1.5} fill="#cbd5e1" />
    </Svg>
  );
}