'use client';

import React from 'react';
import { useState } from 'react';
import { addDays, format, startOfWeek, isSameWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarEvent } from '../CalendarEvent/calendar-event';
import { useRouter } from 'next/navigation';
import { Reserves } from '../Calendar/calendar';

interface CalendarGridProps {
  currentDate: Date;
  events?: Reserves[];
  onDateChange: (newDate: Date) => void;
}

export function CalendarGrid({ currentDate, events = [], onDateChange }: CalendarGridProps) {
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const router = useRouter();

  // Funções de navegação
  const goToPreviousWeek = () => {
    const newDate = addDays(currentDate, -7);
    onDateChange(newDate);
  };

  const goToNextWeek = () => {
    const newDate = addDays(currentDate, 7);
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 6 }).map((_, i) => addDays(weekStart, i));

  const timeSlots = Array.from({ length: 16 }).map((_, i) => {
    const hour = i + 7;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  const handleCellClick = (cellEvents: Reserves[]) => {
    if (cellEvents.length === 0) router.push('/request-reservation');
  };

  const getEventsForCell = (dayDate: Date, time: string) => {
    return events.filter((reserve) => {
      // 1. Converter a data do evento (YYYY-MM-DD) para objeto Date
      const [eventYear, eventMonth, eventDay] = reserve.date_Start
        .slice(0, 10)
        .split('-')
        .map(Number);
      const eventDate = new Date(eventYear, eventMonth - 1, eventDay);

      // 2. Verificar se é o mesmo dia
      const isSameDay =
        dayDate.getDate() === eventDate.getDate() &&
        dayDate.getMonth() === eventDate.getMonth() &&
        dayDate.getFullYear() === eventDate.getFullYear();

      if (!isSameDay) return false;

      // 3. Verificar o horário
      const [cellHour] = time.split(':').map(Number);
      const [startHour] = reserve.hour_Start.split(':').map(Number);
      const [endHour] = reserve.hour_End.split(':').map(Number);

      console.log('Todos os eventos:', events);
      console.log('Dia sendo renderizado:', dayDate);
      console.log('Horário sendo renderizado:', time);

      // Mostrar eventos que estão em andamento neste horário
      return isSameDay && cellHour >= startHour && cellHour < endHour;
    });
  };

  const isCurrentWeek = isSameWeek(new Date(), currentDate, { weekStartsOn: 1 });

  return (
    <div className="flex-1 overflow-auto">
      {/* Controles de navegação */}
      <div className="flex justify-between items-center mb-4 p-2  rounded">
        <div>
          <span className="text-lg font-semibold bg-gray-300 rounded p-2">
            {format(weekStart, 'MMMM yyyy', { locale: ptBR })}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={goToPreviousWeek}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition">
            &lt; Semana anterior
          </button>

          <button
            onClick={goToToday}
            className={`px-3 py-1 rounded transition ${
              isCurrentWeek ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-200 hover:bg-blue-300'
            }`}
            disabled={isCurrentWeek}>
            Hoje
          </button>

          <button
            onClick={goToNextWeek}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition">
            Próxima semana &gt;
          </button>
        </div>
      </div>

      {/* Grade do calendário */}
      <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_1fr] min-w-full gap-2">
        {/* Header row with day names */}
        <div className="sticky top-0 z-10 bg-[#ebe2e2]">
          <div className="h-12 border-b border-r flex items-center justify-center font-medium"></div>
        </div>
        {weekDays.map((day, index) => (
          <div
            key={index}
            className="sticky top-0 z-10 bg-[#D9D9D9] rounded">
            <div className="h-12 border-b border-r flex items-center justify-center font-medium">
              {format(day, 'EEEE', { locale: ptBR })}
              <div className="text-sm ml-2">{format(day, 'dd/MM')}</div>
            </div>
          </div>
        ))}

        {timeSlots.map((time) => (
          <React.Fragment key={time}>
            <div className="border-b border-r bg-[#D9D9D9] rounded">
              <div className="h-16 px-4 flex items-center justify-center text-sm">{time}</div>
            </div>

            {weekDays.map((dayDate, dayIndex) => {
              const cellId = `${dayIndex}-${time}`;
              const isSelected = selectedCell === cellId;
              const cellEvents = getEventsForCell(dayDate, time);

              return (
                <div
                  key={`${dayIndex}-${time}`}
                  className={`cursor-pointer rounded border-b border-r relative ${
                    isSelected ? 'bg-blue-100' : 'bg-white'
                  }`}
                  onClick={() => handleCellClick(cellEvents)}>
                  <div className="h-16">
                    {cellEvents.map((reserve) => (
                      <CalendarEvent
                        key={reserve.id}
                        reserve={reserve}
                        color="bg-green-300"
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
