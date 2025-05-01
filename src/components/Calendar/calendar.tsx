'use client';

import { useState } from 'react';
import { CalendarGrid } from '../CalendarGrid/calendar-grid';
import FilterWeekMonth from '../FilterWeekorMonth/week-month-filter';
import { Calendar } from '../ui/calendar';

export default function CalendarHome() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedView, setSelectedView] = useState<'week' | 'month'>('week');
  const [day, setDay] = useState<number>();

  console.log(day);

  return (
    <div className="flex">
      <div className="flex flex-col flex-1 bg-[#ebe2e2] min-h-screen  p-10 gap-5">
        <FilterWeekMonth
          filterValue={selectedView}
          onFilterChange={setSelectedView}
        />
        {selectedView === 'week' ? (
          <CalendarGrid currentDate={currentDate} />
        ) : (
          <Calendar
            className="flex p-12  justify-center"
            onDayClick={(e) => setDay(e.getDate())}
          />
        )}
      </div>
    </div>
  );
}
