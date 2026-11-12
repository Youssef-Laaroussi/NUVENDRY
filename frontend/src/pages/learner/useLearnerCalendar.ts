import { useState } from 'react';

export function useLearnerCalendar() {
  const [month, setMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number | null>(() => new Date().getDate());
  const year = month.getFullYear();
  const index = month.getMonth();
  const offset = (month.getDay() + 6) % 7;
  const lastDay = new Date(year, index + 1, 0).getDate();
  const calendarDays = Array.from({ length: Math.ceil((offset + lastDay) / 7) * 7 }, (_, cell) => {
    const date = new Date(year, index, cell - offset + 1);
    return { date, day: date.getDate(), isCurrentMonth: date.getMonth() === index };
  });

  function changeMonth(delta: number) {
    setMonth(current => new Date(current.getFullYear(), current.getMonth() + delta, 1));
    setSelectedCalendarDay(null);
  }

  return { calendarMonth: month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    calendarDays, selectedCalendarDay, setSelectedCalendarDay, changeMonth };
}
