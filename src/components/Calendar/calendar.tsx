'use client';

import { useEffect, useState } from 'react';
import { CalendarGrid } from '../CalendarGrid/calendar-grid';
import FilterWeekMonth from '../FilterWeekorMonth/week-month-filter';
import { MonthCalendarView } from '../MonthView/month-view';
import { getReservesAcepted } from './action';

export interface Reserve {
  id: string;
  type_Practice: string;
  reserve: {
    user: {
      name: string;
    };
    type_Reserve: string;
    date_Start: string;
    date_End: string;
    hour_Start: string;
    hour_End: string;
    ocurrence: string;
  };
  number_People: string;
  participants: string;
  request_Equipment: string;
}

export default function CalendarHome() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedView, setSelectedView] = useState<'week' | 'month'>('week');
  const [reserves, setReserves] = useState<Reserve[]>([]);

  const getAllReservesSport = async () => {
    const data = await getReservesAcepted();
    console.log('Dados da API:', data); // Adicione isso para ver a estrutura real
    setReserves(data);
  };

  useEffect(() => {
    console.log(reserves);
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
          events={reserves.map((res) => ({
            event: {
              id: res.id,
              type_Practice: res.type_Practice,
              reserve: {
                user: {
                  name: res.reserve.user.name || 'Nome não disponível',
                },
                type_Reserve: res.reserve.type_Reserve,
                date_Start: res.reserve.date_Start,
                date_End: res.reserve.date_End,
                hour_Start: res.reserve.hour_Start,
                hour_End: res.reserve.hour_End,
                ocurrence: res.reserve.ocurrence,
              },
              number_People: res.number_People,
              request_Equipment: res.request_Equipment,
              participants: res.participants,
              color: 'bg-green-300',
            },
          }))}
        />
      ) : (
        <MonthCalendarView
          events={reserves.map((res) => ({
            event: {
              id: res.id,
              type_Practice: res.type_Practice,
              reserve: {
                user: {
                  name: res.reserve?.user?.name || 'Nome não disponível',
                },
                type_Reserve: res.reserve.type_Reserve,
                date_Start: res.reserve?.date_Start,
                date_End: res.reserve.date_End,
                hour_Start: res.reserve.hour_Start,
                hour_End: res.reserve.hour_End,
                ocurrence: res.reserve.ocurrence,
              },
              number_People: res.number_People,
              request_Equipment: res.request_Equipment,
              participants: res.participants,
              color: 'bg-green-300',
            },
          }))}
        />
      )}
    </div>
  );
}
