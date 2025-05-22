'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { addDays, format, startOfWeek, isSameWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarEvent } from '../CalendarEventWeek/calendar-event-week';
import { useRouter } from 'next/navigation';
import { Reserves } from '../Calendar/calendar';
import { getReservesAcepted } from '../Calendar/action';
import toast from 'react-hot-toast';
import { SelectTypeReserve } from '../ModalSelectTypeReserve/select-type-reserve';
import { Role } from '../NavBarPrivate/navbar-private';

interface CalendarGridProps {
  Role: Role;
  currentDate: Date;
  events?: Reserves[];
  onDateChange: (newDate: Date) => void;
}

export function CalendarGrid({ Role, currentDate, events = [], onDateChange }: CalendarGridProps) {
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [reserves, setReserves] = useState<Reserves[]>(events);
  const router = useRouter();
  const [isReserveTypeModalOpen, setIsReserveTypeModalOpen] = useState(false);

  const fetchReserves = async () => {
    try {
      const data = await getReservesAcepted();
      setReserves(data);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchReserves();
  }, [currentDate]);

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
    if (cellEvents.length === 0 && Role === 'USER') {
      router.push('/request-reservation');
    } else if (cellEvents.length === 0 && (Role === 'PE_ADMIN' || Role === 'SISTEMA_ADMIN')) {
      setIsReserveTypeModalOpen(true);
    }
  };
  const getEventsForCell = (dayDate: Date, time: string) => {
    return reserves.filter((reserve) => {
      if (!reserve.dateTimeStart || !reserve.dateTimeEnd) return false;

      const eventDate = new Date(reserve.dateTimeStart);
      const eventEndDate = new Date(reserve.dateTimeEnd);

      const isWeekly = reserve.occurrence === 'SEMANALMENTE';

      const isSameWeekDay = eventDate.getDay() === dayDate.getDay();

      const isSameDay =
        eventDate.getDate() === dayDate.getDate() &&
        eventDate.getMonth() === dayDate.getMonth() &&
        eventDate.getFullYear() === dayDate.getFullYear();

      const [hour, minute] = time.split(':').map(Number);
      const cellStartTime = new Date(dayDate);
      cellStartTime.setHours(hour, minute, 0, 0);

      const cellEndTime = new Date(dayDate);
      cellEndTime.setHours(hour + 1, minute, 0, 0);

      const eventStartTime = new Date(eventDate);
      eventStartTime.setFullYear(2000, 0, 1);
      const eventEndTime = new Date(eventEndDate);
      eventEndTime.setFullYear(2000, 0, 1);
      const cellStartCompare = new Date(cellStartTime);
      cellStartCompare.setFullYear(2000, 0, 1);
      const cellEndCompare = new Date(cellEndTime);
      cellEndCompare.setFullYear(2000, 0, 1);

      const isInTimeRange =
        (eventStartTime >= cellStartCompare && eventStartTime < cellEndCompare) ||
        (eventEndTime > cellStartCompare && eventEndTime <= cellEndCompare) ||
        (eventStartTime <= cellStartCompare && eventEndTime >= cellEndCompare);

      if (isWeekly) {
        return isSameWeekDay && isInTimeRange;
      }

      return isSameDay && isInTimeRange;
    });
  };

  const isCurrentWeek = isSameWeek(new Date(), currentDate, { weekStartsOn: 1 });

  return (
    <div className="flex-1 overflow-auto">
      <div className="flex justify-between items-center mb-4 p-2 rounded">
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

      <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_1fr] min-w-full gap-2">
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
                        onUpdate={fetchReserves}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      <SelectTypeReserve
        open={isReserveTypeModalOpen}
        onOpenChange={setIsReserveTypeModalOpen}
        role={Role}
      />
    </div>
  );
}
