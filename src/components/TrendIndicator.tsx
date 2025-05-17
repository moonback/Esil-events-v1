import { ArrowDown, ArrowUp } from 'lucide-react';

interface TrendIndicatorProps {
  value: number | null | undefined;
}

export const TrendIndicator = ({ value }: TrendIndicatorProps) => {
  if (value === null || value === undefined || isNaN(value)) {
    return <span className="text-gray-400">N/A</span>;
  }

  // Cas de tendance infinie (division par zéro)
  if (!isFinite(value)) {
    return (
      <span className="text-emerald-500 flex items-center">
        <ArrowUp className="w-4 h-4" />
        <span className="ml-1 font-medium">+∞%</span>
      </span>
    );
  }

  const isPositive = value >= 0;
  const color = isPositive ? 'text-emerald-500' : 'text-red-500';
  const Icon = isPositive ? ArrowUp : ArrowDown;

  return (
    <div className={`flex items-center ${color}`}>
      <Icon className="w-4 h-4" />
      <span className="ml-1 font-medium">
        {Math.abs(value).toFixed(1)}%
      </span>
    </div>
  );
}; 