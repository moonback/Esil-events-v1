import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  bgColor: string;
  trend?: string;
  trendUp?: boolean;
  description?: string;
  colorScheme?: 'blue' | 'green' | 'purple' | 'amber' | 'red';
}

const getColorScheme = (scheme: StatCardProps['colorScheme'] = 'blue') => {
  switch (scheme) {
    case 'green':
      return {
        gradient: 'from-green-500 to-emerald-400',
        iconBg: 'bg-green-50 dark:bg-green-900/20',
        iconColor: 'text-green-600 dark:text-green-400',
        trendUpColor: 'text-green-600 dark:text-green-400',
        trendDownColor: 'text-red-600 dark:text-red-400',
        borderAccent: 'border-green-200 dark:border-green-800/30',
        hoverBorder: 'hover:border-green-300 dark:hover:border-green-700'
      };
    case 'purple':
      return {
        gradient: 'from-violet-500 to-purple-400',
        iconBg: 'bg-violet-50 dark:bg-violet-900/20',
        iconColor: 'text-violet-600 dark:text-violet-400',
        trendUpColor: 'text-green-600 dark:text-green-400',
        trendDownColor: 'text-red-600 dark:text-red-400',
        borderAccent: 'border-violet-200 dark:border-violet-800/30',
        hoverBorder: 'hover:border-violet-300 dark:hover:border-violet-700'
      };
    case 'amber':
      return {
        gradient: 'from-amber-500 to-yellow-400',
        iconBg: 'bg-amber-50 dark:bg-amber-900/20',
        iconColor: 'text-amber-600 dark:text-amber-400',
        trendUpColor: 'text-green-600 dark:text-green-400',
        trendDownColor: 'text-red-600 dark:text-red-400',
        borderAccent: 'border-amber-200 dark:border-amber-800/30',
        hoverBorder: 'hover:border-amber-300 dark:hover:border-amber-700'
      };
    case 'red':
      return {
        gradient: 'from-red-500 to-rose-400',
        iconBg: 'bg-red-50 dark:bg-red-900/20',
        iconColor: 'text-red-600 dark:text-red-400',
        trendUpColor: 'text-green-600 dark:text-green-400',
        trendDownColor: 'text-red-600 dark:text-red-400',
        borderAccent: 'border-red-200 dark:border-red-800/30',
        hoverBorder: 'hover:border-red-300 dark:hover:border-red-700'
      };
    default:
      return {
        gradient: 'from-blue-500 to-indigo-400',
        iconBg: 'bg-blue-50 dark:bg-blue-900/20',
        iconColor: 'text-blue-600 dark:text-blue-400',
        trendUpColor: 'text-green-600 dark:text-green-400',
        trendDownColor: 'text-red-600 dark:text-red-400',
        borderAccent: 'border-blue-200 dark:border-blue-800/30',
        hoverBorder: 'hover:border-blue-300 dark:hover:border-blue-700'
      };
  }
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  bgColor,
  trend,
  trendUp,
  description,
  colorScheme = 'blue'
}) => {
  const colors = getColorScheme(colorScheme);

  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border ${colors.borderAccent} ${colors.hoverBorder} hover:shadow-md transition-all duration-300 overflow-hidden group`}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`${colors.iconBg} p-3 rounded-xl transition-all duration-300 group-hover:scale-110`}>
            <div className={colors.iconColor}>{icon}</div>
          </div>
          {trendUp !== undefined && (
            <div className={`flex items-center text-xs font-medium ${trendUp ? colors.trendUpColor : colors.trendDownColor}`}>
              {trendUp ? (
                <ArrowUp className="w-3 h-3 mr-1" />
              ) : (
                <ArrowDown className="w-3 h-3 mr-1" />
              )}
              <span>{trend || '0%'}</span>
            </div>
          )}
        </div>
        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
          {value}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">{title}</p>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">{description}</p>
        )}
      </div>
      <div className="h-1 w-full bg-gradient-to-r transition-all duration-300 group-hover:h-1.5 group-hover:opacity-90 opacity-80 ${colors.gradient}"></div>
    </div>
  );
};

export default StatCard;