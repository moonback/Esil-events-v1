export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

export const formatTime = (time: string): string => {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  return `${hours}h${minutes !== '00' ? minutes : ''}`;
};

export const getDaysInMonth = (date: Date): { daysInMonth: number; firstDayOfMonth: number } => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  return { daysInMonth, firstDayOfMonth };
};

export const getWeekDates = (date: Date): Date[] => {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const current = new Date(start);
    current.setDate(start.getDate() + i);
    dates.push(current);
  }
  return dates;
};

export const getDayHours = (): string[] => {
  const hours = [];
  for (let i = 5; i <= 23; i++) {
    hours.push(i.toString().padStart(2, '0') + ':00');
  }
  return hours;
}; 