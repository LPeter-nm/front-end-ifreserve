'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { addDays, format, isSameDay, parseISO } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Reserves } from '../Calendar/calendar';
import { CalendarEventDetails } from '../CalendarEventDetails/calendar-event-details';
import { updateReserve } from '../CalendarEvent/action';
import toast from 'react-hot-toast';

interface CalendarBaseProps {
  initialReserves?: Reserves[]; // Mudei para initialReserves para evitar confusão
}

export function MonthCalendarView({ initialReserves = [] }: CalendarBaseProps) {
  const [currentDate] = useState<Date>(new Date());
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedDayReserves, setSelectedDayReserves] = useState<Reserves[]>([]);
  const [selectedReserve, setSelectedReserve] = useState<Reserves | null>(null);
  const [isReservesModalOpen, setIsReservesModalOpen] = useState(false);
  const [isReserveDetailsOpen, setIsReserveDetailsOpen] = useState(false);
  const [reserves, setReserves] = useState<Reserves[]>(initialReserves); // Estado interno
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

  const getReservesForDay = (dayDate: Date): Reserves[] => {
    return reserves.filter((reserve) => {
      if (!reserve?.date_Start) return false;

      const eventDate = new Date(reserve.date_Start);
      return (
        dayDate.getDate() === eventDate.getDate() &&
        dayDate.getMonth() === eventDate.getMonth() &&
        dayDate.getFullYear() === eventDate.getFullYear()
      );
    });
  };

  const handleSaveReserve = async (updatedData: any) => {
    try {
      const route = updatedData.sport
        ? 'reserve-sport'
        : updatedData.classroom
        ? 'reserve-classroom'
        : 'reserve-event';

      await updateReserve(updatedData.id, route, updatedData);

      setReserves((prev) => prev.map((r) => (r.id === updatedData.id ? updatedData : r)));

      toast.success('Reserva atualizada com sucesso!');
      setIsReserveDetailsOpen(false);
    } catch (error) {
      toast.error('Erro ao atualizar reserva');
      console.error(error);
    }
  };

  const handleDayClick = (dayDate: Date) => {
    const dayReserves = getReservesForDay(dayDate);

    if (dayReserves.length === 1) {
      setSelectedReserve(dayReserves[0]);
      setIsReserveDetailsOpen(true);
    } else if (dayReserves.length > 1) {
      setSelectedDayReserves(dayReserves);
      setIsReservesModalOpen(true);
    } else {
      router.push('/request-reservation');
    }
  };

  const handleReserveClick = (reserve: Reserves, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedReserve(reserve);
    setIsReserveDetailsOpen(true);
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

  const isCurrentWeek = isSameDay(currentDate, new Date());

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
          const dayReserves = getReservesForDay(dayDate);
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

              {dayReserves.length > 0 && (
                <div className="space-y-1 mt-1">
                  <div
                    key={dayReserves[0].id}
                    onClick={(e) => handleReserveClick(dayReserves[0], e)}
                    className="gap-1 flex flex-col justify-center items-center p-1 rounded-md text-xs bg-green-300 hover:bg-green-400">
                    <div className="font-semibold truncate">
                      {dayReserves[0].sport?.type_Practice ||
                        dayReserves[0].classroom?.matter ||
                        dayReserves[0].event?.name}
                    </div>
                    <div className="font-semibold truncate">{dayReserves[0].type_Reserve}</div>
                    <div className="text-xs truncate">
                      {dayReserves[0].hour_Start}-{dayReserves[0].hour_End}
                    </div>
                  </div>

                  {dayReserves.length > 1 && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDayReserves(dayReserves);
                        setIsReservesModalOpen(true);
                      }}
                      className="text-xs text-center text-blue-600 hover:text-blue-800 cursor-pointer">
                      +{dayReserves.length - 1} mais
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal de múltiplas reservas */}
      <Dialog
        open={isReservesModalOpen}
        onOpenChange={setIsReservesModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              Reservas do dia {selectedDayReserves[0]?.date_Start?.slice(0, 10)}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            {selectedDayReserves.map((reserve) => (
              <div
                key={reserve.id}
                onClick={() => {
                  setSelectedReserve(reserve);
                  setIsReservesModalOpen(false);
                  setIsReserveDetailsOpen(true);
                }}
                className="p-3 rounded-lg cursor-pointer hover:bg-gray-100 bg-green-300">
                <div className="font-bold">{reserve.type_Reserve}</div>
                <div className="text-sm">
                  {reserve.hour_Start} - {reserve.hour_End}
                </div>
                {reserve.sport?.type_Practice && (
                  <div className="text-sm mt-1">{reserve.sport.type_Practice}</div>
                )}
                {reserve.classroom?.matter && (
                  <div className="text-sm mt-1">{reserve.classroom.matter}</div>
                )}
                {reserve.event?.name && <div className="text-sm mt-1">{reserve.event.name}</div>}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de detalhes da reserva */}
      <Dialog
        open={isReserveDetailsOpen}
        onOpenChange={setIsReserveDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedReserve && (
            <CalendarEventDetails
              reserve={selectedReserve}
              onClose={() => setIsReserveDetailsOpen(false)}
              onSave={handleSaveReserve}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
