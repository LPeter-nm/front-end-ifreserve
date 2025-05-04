'use client';

import React from 'react';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { addDays, format, isSameDay, parseISO } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'; // Importe do seu UI framework
import { Reserves } from '../Calendar/calendar';

interface CalendarBaseProps {
  events?: Reserves[];
}

export function MonthCalendarView({ events = [] }: CalendarBaseProps) {
  const [currentDate] = useState<Date>(new Date());
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedDayEvents, setSelectedDayEvents] = useState<Reserves[]>([]);
  const [isEventsModalOpen, setIsEventsModalOpen] = useState(false);
  const router = useRouter();

  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const months = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];

  const generateCalendarDays = (): Date[] => {
    const firstDay = new Date(selectedYear, selectedMonth, 1);
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
    const startingDayOfWeek = firstDay.getDay();

    const calendarDays: Date[] = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      calendarDays.push(addDays(firstDay, -startingDayOfWeek + i));
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      calendarDays.push(new Date(selectedYear, selectedMonth, day));
    }

    const remainingDays = 42 - calendarDays.length;
    for (let i = 1; i <= remainingDays; i++) {
      calendarDays.push(new Date(selectedYear, selectedMonth + 1, i));
    }

    return calendarDays;
  };

  const days = generateCalendarDays();

  const getEventsForDay = (dayDate: Date): Reserves[] => {
    return events.filter((reserve) => {
      // Verifica se o evento tem a data definida
      if (!reserve?.date_Start) return false;

      // Cria a data do evento no mesmo timezone do dayDate
      const eventDate = new Date(reserve.date_Start);

      // Compara dia, mês e ano diretamente
      return (
        dayDate.getDate() === eventDate.getDate() + 1 &&
        dayDate.getMonth() === eventDate.getMonth() &&
        dayDate.getFullYear() === eventDate.getFullYear()
      );
    });
  };

  const handleDayClick = (dayDate: Date) => {
    const events = getEventsForDay(dayDate);

    if (events.length === 1) {
      router.push(`/request-reservation`);
    } else if (events.length > 1) {
      setSelectedDayEvents(events);
      setIsEventsModalOpen(true);
    } else {
      router.push(`/request-reservation`);
    }
  };

  const prevMonth = () => {
    setSelectedMonth((prev) => (prev === 0 ? 11 : prev - 1));
    if (selectedMonth === 0) setSelectedYear((prev) => prev - 1);
  };

  const nextMonth = () => {
    setSelectedMonth((prev) => (prev === 11 ? 0 : prev + 1));
    if (selectedMonth === 11) setSelectedYear((prev) => prev + 1);
  };

  const goToToday = () => {
    const today = new Date();
    setSelectedMonth(today.getMonth());
    setSelectedYear(today.getFullYear());
  };

  return (
    <div className="bg-[#ebe2e2] p-4 rounded-lg">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={prevMonth}
          className="p-2 rounded-full hover:bg-red-200">
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="text-center">
          <h2 className="text-xl font-bold">
            {months[selectedMonth]} {selectedYear}
          </h2>
          <button
            onClick={goToToday}
            className="text-sm text-gray-600 hover:text-gray-800">
            Hoje
          </button>
        </div>

        <button
          onClick={nextMonth}
          className="p-2 rounded-full hover:bg-red-200">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Grade do calendário */}
      <div className="grid grid-cols-7 gap-2">
        {weekdays.map((day) => (
          <div
            key={`header-${day}`}
            className="text-center text-sm font-medium">
            {day}
          </div>
        ))}

        {days.map((dayDate, index) => {
          const dayEvents = getEventsForDay(dayDate);
          const isCurrentMonth = dayDate.getMonth() === selectedMonth;
          const isToday = isSameDay(dayDate, new Date());

          return (
            <div
              key={`day-${index}`}
              onClick={() => handleDayClick(dayDate)}
              className={`cursor-pointer p-1 h-30 relative rounded-lg ${
                !isCurrentMonth ? 'bg-gray-100' : isToday ? 'bg-blue-100' : 'bg-white'
              }`}>
              <div
                className={`text-sm font-medium text-right p-1 ${
                  isToday
                    ? 'bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center ml-auto'
                    : ''
                }`}>
                {dayDate.getDate()}
              </div>

              {/* Mostra apenas 1 evento ou o indicador */}
              {dayEvents.length > 0 && (
                <div className="space-y-1 mt-1">
                  {/* Mostra sempre o primeiro evento */}
                  <div
                    key={dayEvents[0].id}
                    className="gap-1 flex flex-col justify-center items-center p-1 rounded-md text-xs bg-green-300">
                    <div className="font-semibold truncate">
                      {dayEvents[0].sport?.type_Practice}
                    </div>
                    <div className="font-semibold truncate">{dayEvents[0].type_Reserve}</div>
                    <div className="text-xs truncate">
                      {dayEvents[0].hour_Start}-{dayEvents[0].hour_End}
                    </div>
                  </div>

                  {/* Mostra o indicador se houver mais eventos */}
                  {dayEvents.length > 1 && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDayEvents(dayEvents);
                        setIsEventsModalOpen(true);
                      }}
                      className="text-xs text-center text-blue-600 hover:text-blue-800 cursor-pointer">
                      +{dayEvents.length - 1} mais
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal de eventos (estilo dropdown) */}
      <Dialog
        open={isEventsModalOpen}
        onOpenChange={setIsEventsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Eventos do dia</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            {selectedDayEvents.map((reserve) => (
              <div
                key={reserve.id}
                onClick={() => {
                  router.push(
                    `/request-reservation?date=${reserve.date_Start}&eventId=${reserve.id}`
                  );
                  setIsEventsModalOpen(false);
                }}
                className="p-3 rounded-lg cursor-pointer hover:bg-gray-100 bg-green-300">
                <div className="font-bold">{reserve.type_Reserve}</div>
                <div className="text-sm text-gray-600">{reserve.date_Start.slice(0, 10)}</div>
                <div className="text-sm text-gray-600">
                  {reserve.hour_Start} - {reserve.hour_End}
                </div>
                {reserve.sport?.type_Practice && (
                  <div className="text-sm mt-1">{reserve.sport?.type_Practice}</div>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
