import React from 'react';

interface TrendChartProps {
  data: number[];
  color: string; // ex: "#6366f1" ou "rgb(99,102,241)"
}

export const TrendChart = ({ data, color }: TrendChartProps) => {
  if (!data || data.length < 2) {
    return (
      <div className="h-12 w-full flex items-center justify-center text-gray-400 text-xs">
        Pas de données
      </div>
    );
  }

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1; // éviter division par zéro

  // Générer le chemin SVG
  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${index === 0 ? 'M' : 'L'} ${x},${y}`;
    })
    .join(' ');

  // Générer le dégradé d'arrière-plan sous la courbe
  const areaPath = [
    `M 0,100`,
    ...data.map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `L ${x},${y}`;
    }),
    `L 100,100 Z`
  ].join(' ');

  return (
    <div className="h-12 w-full">
      <svg
        className="w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-label="Graphique de tendance"
      >
        <defs>
          <linearGradient id="trend-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Dégradé sous la courbe */}
        <path d={areaPath} fill="url(#trend-gradient)" />
        {/* Courbe */}
        <path
          d={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Ligne de base */}
        <line
          x1="0"
          y1="100"
          x2="100"
          y2="100"
          stroke="#e5e7eb"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}; 