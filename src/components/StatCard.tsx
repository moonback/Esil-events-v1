import { LucideIcon } from 'lucide-react';
import { TrendIndicator } from './TrendIndicator';
import { TrendChart } from './TrendChart';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
  trendValue?: number;
  trendData?: number[];
  trendColor?: string;
  isCurrency?: boolean;
  showProgressBar?: boolean;
  progressValue?: number;
  progressLabel?: string;
}

export const StatCard = ({
  title,
  value,
  icon: Icon,
  iconBgColor,
  iconColor,
  trendValue,
  trendData,
  trendColor,
  isCurrency = false,
  showProgressBar = false,
  progressValue,
  progressLabel
}: StatCardProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</div>
          <div className={`p-2 ${iconBgColor} rounded-lg`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {isCurrency 
                ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Number(value))
                : value}
            </div>
            {trendValue !== undefined && (
              <div className="flex items-center mt-2 text-sm">
                <TrendIndicator value={trendValue} />
                <span className="text-gray-500 dark:text-gray-400 ml-2">vs mois dernier</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="px-6 pb-4">
        {showProgressBar ? (
          <>
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-emerald-500 h-2 rounded-full" 
                style={{ width: `${progressValue}%` }}
              ></div>
            </div>
            {progressLabel && (
              <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                <div>{progressLabel}</div>
                <div className="font-medium">{progressValue}%</div>
              </div>
            )}
          </>
        ) : trendData && trendColor ? (
          <TrendChart data={trendData} color={trendColor} />
        ) : null}
      </div>
    </div>
  );
}; 