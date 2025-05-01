'use client';

import React from 'react';

import { useState } from 'react';
import { addDays, format, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarEvent } from '../CalendarEvent/calendar-event';
import { useRouter } from 'next/navigation';

interface CalendarGridProps {
  currentDate: Date;
}

export function CalendarGrid({ currentDate }: CalendarGridProps) {
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const router = useRouter();

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  const timeSlots = Array.from({ length: 16 }).map((_, i) => {
    const hour = i + 7;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  const events = [
    {
      id: 1,
      title: 'Reunião',
      day: 1,
      startTime: '07:00',
      endTime: '08:00',
      color: 'bg-green-300',
    },
    {
      id: 2,
      title: 'Almoço de Trabalho',
      day: 1,
      startTime: '08:00',
      endTime: '09:00',
      color: 'bg-green-300',
    },
  ];

  const handleCellClick = () => {
    router.push('/request-reservation');
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_1fr_1fr] min-w-full gap-2">
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
            </div>
          </div>
        ))}

        {timeSlots.map((time) => (
          <React.Fragment key={time}>
            <div className="border-b border-r bg-[#D9D9D9] rounded">
              <div className="h-16 px-4 flex items-center justify-center text-sm">{time}</div>
            </div>

            {Array.from({ length: 7 }).map((_, dayIndex) => {
              const cellId = `${dayIndex}-${time}`;
              const isSelected = selectedCell === cellId;
              const cellEvents = events.filter(
                (event) => event.day === dayIndex && event.startTime === time
              );

              return (
                <div
                  key={`${dayIndex}-${time}`}
                  className={`cursor-pointer rounded border-b border-r relative ${
                    isSelected ? 'bg-blue-100' : 'bg-white'
                  }`}
                  onClick={() => handleCellClick()}>
                  <div className="h-16">
                    {cellEvents.map((event) => (
                      <CalendarEvent
                        key={event.id}
                        event={event}
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
