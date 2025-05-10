'use client';

import { useEffect, useState } from 'react';
import { CalendarGrid } from '../CalendarGrid/calendar-grid';
import FilterWeekMonth from '../FilterWeekorMonth/week-month-filter';
import { MonthCalendarView } from '../MonthView/month-view';
import { getReservesAcepted } from './action';
import { Role } from '../NavBarPrivate/navbar-private';

export interface Reserves {
  id: string;
  typeReserve: string;
  occurrence: string;
  dateTimeStart: Date;
  dateTimeEnd: Date;
  status: string;
  comments?: string;
  user: {
    name: string;
    role: string;
    typeUser: string;
  };
  sport: {
    id: string;
    typePractice: string;
    numberParticipants: string;
    requestEquipment: string;
  } | null;
  classroom: {
    id: string;
    course: string;
    matter: string;
  } | null;
  event: {
    id: string;
    name: string;
    description: string;
    location: string;
  } | null;
}

export default function CalendarHome({ Role }: { Role: Role }) {
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
          Role={Role}
          onDateChange={(newDate) => setCurrentDate(newDate)}
          currentDate={currentDate}
          events={reserves}
        />
      ) : (
        <MonthCalendarView
          Role={Role}
          initialReserves={reserves}
        />
      )}
    </div>
  );
}
