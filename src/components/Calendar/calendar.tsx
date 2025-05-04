'use client';

import { useEffect, useState } from 'react';
import { CalendarGrid } from '../CalendarGrid/calendar-grid';
import FilterWeekMonth from '../FilterWeekorMonth/week-month-filter';
import { MonthCalendarView } from '../MonthView/month-view';
import { getReservesAcepted } from './action';

export interface Reserves {
  id: string;
  type_Reserve: string;
  ocurrence: string;
  date_Start: string;
  date_End: string;
  hour_Start: string;
  hour_End: string;
  user: {
    name: string;
  };
  sport: {
    id: string;
    status: string;
    type_Practice: string;
    number_People: string;
    request_Equipment: string;
  } | null;
  classroom: {
    course: string;
    matter: string;
  } | null;
  event: {
    name: string;
    description: string;
    location: string;
  } | null;
}

export default function CalendarHome() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedView, setSelectedView] = useState<'week' | 'month'>('week');
  const [reserves, setReserves] = useState<Reserves[]>([]);

  const getAllReservesSport = async () => {
    const data = await getReservesAcepted();
    setReserves(data);
  };

  useEffect(() => {
    getAllReservesSport();
  }, []);
  return (
    <div className="flex flex-col flex-1 bg-[#ebe2e2] min-h-screen p-10 gap-5">
      <FilterWeekMonth
        filterValue={selectedView}
        onFilterChange={setSelectedView}
      />

      {selectedView === 'week' ? (
        <CalendarGrid
          onDateChange={(newDate) => setCurrentDate(newDate)}
          currentDate={currentDate}
          events={reserves}
        />
      ) : (
        <MonthCalendarView events={reserves} />
      )}
    </div>
  );
}
