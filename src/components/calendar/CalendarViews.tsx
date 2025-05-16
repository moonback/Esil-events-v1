import React from 'react';
import { Calendar, ChevronLeft, ChevronRight, Grid, List, MoreHorizontal, Maximize2, Minimize2, Truck, ArrowLeftRight } from 'lucide-react';
import { CalendarEvent, ViewMode } from '../../types/calendar';
import { formatDate, getDaysInMonth, getWeekDates, getDayHours } from '../../utils/dateUtils';
import { getEventStyle, getEventLabel, getStatusColor, getStatusLabel } from '../../utils/calendarUtils';

interface CalendarViewsProps {
  viewMode: ViewMode;
  currentMonth: Date;
  selectedDate: Date | null;
  isFullscreen: boolean;
  isCompact: boolean;
  showEventCount: boolean;
  getRequestsForDate: (date: Date) => CalendarEvent[];
  handleRequestClick: (request: CalendarEvent) => void;
  handleMonthChange: (direction: 'prev' | 'next') => void;
  handleWeekChange: (direction: 'prev' | 'next') => void;
  handleDateClick: (date: Date) => void;
  setIsCompact: (isCompact: boolean) => void;
  setShowEventCount: (show: boolean) => void;
  setIsFullscreen: (isFullscreen: boolean) => void;
}

const renderEventItem = (event: CalendarEvent, isCompact: boolean, handleRequestClick: (request: CalendarEvent) => void) => (
  <div
    key={`${event.id}-${event.type}`}
    onClick={(e) => {
      e.stopPropagation();
      handleRequestClick(event);
    }}
    className={`${getEventStyle(event.type, event.status)} ${isCompact ? 'py-1' : 'py-2'}`}
    title={`${getEventLabel(event.type)} - ${event.first_name} ${event.last_name} - ${getStatusLabel(event.status)}`}
  >
    <div className="flex items-center gap-2 min-w-0 flex-1">
      {event.type === 'delivery' && <Truck className="w-4 h-4 flex-shrink-0" />}
      {event.type === 'pickup' && <ArrowLeftRight className="w-4 h-4 flex-shrink-0" />}
      {event.type === 'event' && <Calendar className="w-4 h-4 flex-shrink-0" />}
      <div className="flex flex-col min-w-0">
        <span className="font-medium truncate">
          {event.first_name} {event.last_name}
        </span>
        {!isCompact && (
          <div className="flex items-center gap-1">
            <span className="text-xs opacity-75 truncate">
              {getEventLabel(event.type)}
            </span>
            <span className="text-xs opacity-75">•</span>
            <span className={`text-xs ${getStatusColor(event.status)}`}>
              {getStatusLabel(event.status)}
            </span>
          </div>
        )}
      </div>
    </div>
    <span className="text-xs font-medium bg-white/50 px-2 py-1 rounded">
      {event.displayTime}
    </span>
  </div>
);

export const MonthView: React.FC<CalendarViewsProps> = ({
  currentMonth,
  selectedDate,
  isFullscreen,
  isCompact,
  showEventCount,
  getRequestsForDate,
  handleRequestClick,
  handleMonthChange,
  handleDateClick,
  setIsCompact,
  setShowEventCount,
  setIsFullscreen
}) => {
  const { daysInMonth, firstDayOfMonth } = getDaysInMonth(currentMonth);
  const days = [];
  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className={`border border-gray-200 bg-gray-50 ${isFullscreen ? 'h-48' : 'h-40'}`}></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const eventsForDay = getRequestsForDate(date);
    const isToday = date.toDateString() === new Date().toDateString();
    const isSelected = selectedDate?.toDateString() === date.toDateString();

    days.push(
      <div
        key={day}
        onClick={() => handleDateClick(date)}
        className={`border border-gray-200 p-2 cursor-pointer transition-all duration-200 ${
          isSelected ? 'bg-indigo-50 border-indigo-500' : 'hover:bg-gray-50'
        } ${isFullscreen ? 'h-48' : 'h-40'}`}
      >
        <div className="flex justify-between items-center mb-2">
          <div className={`text-sm font-medium ${isToday ? 'text-indigo-600' : 'text-gray-900'}`}>
            {day}
          </div>
          <div className="flex items-center gap-2">
            {isToday && (
              <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
                Aujourd'hui
              </span>
            )}
            {showEventCount && eventsForDay.length > 0 && (
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                {eventsForDay.length} événement{eventsForDay.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        <div className={`space-y-1.5 overflow-y-auto ${isCompact ? 'max-h-[calc(100%-1.5rem)]' : 'max-h-[calc(100%-3rem)]'}`}>
          {eventsForDay.map(event => renderEventItem(event, isCompact, handleRequestClick))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <h2 className="text-xl font-semibold text-gray-900">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsCompact(!isCompact)}
            className="p-2 rounded-lg hover:bg-white transition-colors"
            title={isCompact ? "Vue normale" : "Vue compacte"}
          >
            {isCompact ? <Grid className="w-5 h-5 text-gray-600" /> : <List className="w-5 h-5 text-gray-600" />}
          </button>
          <button
            onClick={() => setShowEventCount(!showEventCount)}
            className="p-2 rounded-lg hover:bg-white transition-colors"
            title={showEventCount ? "Masquer le nombre d'événements" : "Afficher le nombre d'événements"}
          >
            <MoreHorizontal className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-lg hover:bg-white transition-colors"
            title={isFullscreen ? "Réduire" : "Plein écran"}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5 text-gray-600" /> : <Maximize2 className="w-5 h-5 text-gray-600" />}
          </button>
          <button
            onClick={() => handleMonthChange('prev')}
            className="p-2 rounded-lg hover:bg-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => handleMonthChange('next')}
            className="p-2 rounded-lg hover:bg-white transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
          <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-900">
            {day}
          </div>
        ))}
        {days}
      </div>
    </div>
  );
};

export const WeekView: React.FC<CalendarViewsProps> = ({
  currentMonth,
  selectedDate,
  isFullscreen,
  isCompact,
  showEventCount,
  getRequestsForDate,
  handleRequestClick,
  handleWeekChange,
  handleDateClick,
  setIsCompact,
  setShowEventCount,
  setIsFullscreen
}) => {
  const weekDates = getWeekDates(currentMonth);
  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <h2 className="text-xl font-semibold text-gray-900">
          Semaine du {formatDate(weekDates[0])} au {formatDate(weekDates[6])}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-lg hover:bg-white transition-colors"
            title={isFullscreen ? "Réduire" : "Plein écran"}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5 text-gray-600" /> : <Maximize2 className="w-5 h-5 text-gray-600" />}
          </button>
          <button
            onClick={() => handleWeekChange('prev')}
            className="p-2 rounded-lg hover:bg-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => handleWeekChange('next')}
            className="p-2 rounded-lg hover:bg-white transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {weekDates.map((date, index) => {
          const eventsForDay = getRequestsForDate(date);
          const isToday = date.toDateString() === new Date().toDateString();
          const isSelected = selectedDate?.toDateString() === date.toDateString();

          return (
            <div
              key={index}
              onClick={() => handleDateClick(date)}
              className={`border border-gray-200 p-2 cursor-pointer transition-all duration-200 ${
                isSelected ? 'bg-indigo-50 border-indigo-500' : 'hover:bg-gray-50'
              } ${isFullscreen ? 'min-h-[500px]' : 'min-h-[300px]'}`}
            >
              <div className="flex flex-col mb-2">
                <div className={`text-sm font-medium ${isToday ? 'text-indigo-600' : 'text-gray-900'}`}>
                  {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'][index]}
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    {date.getDate()} {monthNames[date.getMonth()]}
                  </div>
                  {isToday && (
                    <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
                      Aujourd'hui
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-1.5 overflow-y-auto max-h-[calc(100%-3rem)]">
                {eventsForDay.map(event => renderEventItem(event, isCompact, handleRequestClick))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const DayView: React.FC<CalendarViewsProps> = ({
  currentMonth,
  selectedDate,
  isFullscreen,
  isCompact,
  showEventCount,
  getRequestsForDate,
  handleRequestClick,
  handleDateClick,
  setIsCompact,
  setShowEventCount,
  setIsFullscreen
}) => {
  const hours = getDayHours();
  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  const currentHour = new Date().getHours();
  const currentMinute = new Date().getMinutes();

  const getEventsForHour = (date: Date, hour: string) => {
    const events = getRequestsForDate(date);
    return events.filter(event => {
      const eventHour = event.displayTime?.split(':')[0] || '00';
      return eventHour === hour.split(':')[0];
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {selectedDate?.getDate()} {monthNames[selectedDate?.getMonth() || 0]} {selectedDate?.getFullYear()}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const today = new Date();
                handleDateClick(today);
              }}
              className="px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              Aujourd'hui
            </button>
            <button
              onClick={() => {
                const newDate = new Date(selectedDate || new Date());
                newDate.setDate(newDate.getDate() - 1);
                handleDateClick(newDate);
              }}
              className="p-2 rounded-lg hover:bg-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => {
                const newDate = new Date(selectedDate || new Date());
                newDate.setDate(newDate.getDate() + 1);
                handleDateClick(newDate);
              }}
              className="p-2 rounded-lg hover:bg-white transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsCompact(!isCompact)}
            className="p-2 rounded-lg hover:bg-white transition-colors"
            title={isCompact ? "Vue normale" : "Vue compacte"}
          >
            {isCompact ? <Grid className="w-5 h-5 text-gray-600" /> : <List className="w-5 h-5 text-gray-600" />}
          </button>
          <button
            onClick={() => setShowEventCount(!showEventCount)}
            className="p-2 rounded-lg hover:bg-white transition-colors"
            title={showEventCount ? "Masquer le nombre d'événements" : "Afficher le nombre d'événements"}
          >
            <MoreHorizontal className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-lg hover:bg-white transition-colors"
            title={isFullscreen ? "Réduire" : "Plein écran"}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5 text-gray-600" /> : <Maximize2 className="w-5 h-5 text-gray-600" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[100px_1fr] divide-x divide-gray-200">
        <div className="bg-gray-50">
          <div className="h-12 border-b border-gray-200"></div>
          {hours.map(hour => {
            const hourNum = parseInt(hour.split(':')[0]);
            const isCurrentHour = hourNum === currentHour;
            return (
              <div 
                key={hour} 
                className={`h-24 border-b border-gray-200 p-2 text-sm ${
                  isCurrentHour ? 'text-indigo-600 font-medium' : 'text-gray-500'
                }`}
              >
                {hour}
              </div>
            );
          })}
        </div>

        <div className="relative">
          <div className="h-12 border-b border-gray-200"></div>
          {hours.map(hour => {
            const events = getEventsForHour(selectedDate || new Date(), hour);
            const hourNum = parseInt(hour.split(':')[0]);
            const isCurrentHour = hourNum === currentHour;
            const isPastHour = hourNum < currentHour;
            const isFutureHour = hourNum > currentHour;

            return (
              <div 
                key={hour} 
                className={`h-24 border-b border-gray-200 p-2 relative ${
                  isCurrentHour ? 'bg-indigo-50/50' :
                  isPastHour ? 'bg-gray-50/50' :
                  'bg-white'
                }`}
              >
                {isCurrentHour && (
                  <div 
                    className="absolute left-0 right-0 h-0.5 bg-indigo-500"
                    style={{
                      top: `${(currentMinute / 60) * 100}%`
                    }}
                  >
                    <div className="absolute -top-1 -left-1 w-3 h-3 bg-indigo-500 rounded-full"></div>
                  </div>
                )}
                {events.map(event => (
                  <div
                    key={`${event.id}-${event.type}`}
                    onClick={() => handleRequestClick(event)}
                    className={`absolute left-2 right-2 p-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                      getEventStyle(event.type, event.status)
                    }`}
                    style={{
                      top: `${(parseInt(event.displayTime.split(':')[1]) / 60) * 100}%`,
                      height: 'calc(100% - 8px)'
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {event.type === 'delivery' && <Truck className="w-4 h-4 flex-shrink-0" />}
                      {event.type === 'pickup' && <ArrowLeftRight className="w-4 h-4 flex-shrink-0" />}
                      {event.type === 'event' && <Calendar className="w-4 h-4 flex-shrink-0" />}
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium truncate">
                          {event.first_name} {event.last_name}
                        </span>
                        <span className="text-xs opacity-75 truncate">
                          {getEventLabel(event.type)}
                        </span>
                        <span className="text-xs font-medium mt-1">
                          {event.displayTime}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}; 