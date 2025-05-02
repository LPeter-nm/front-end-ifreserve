'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CalendarEvent {
  day: number;
  startTime: string;
  endTime: string;
  title: string;
  description: string;
}

export default function CalendarView() {
  const [currentDate] = useState<Date>(new Date());
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());

  // Dias da semana em Português (abreviados)
  const weekdays: string[] = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Meses em Português
  const months: string[] = [
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

  // Gerar dias do calendário
  const generateCalendarDays = (): (number | null)[] => {
    const firstDay = new Date(selectedYear, selectedMonth, 1);
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0);

    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const calendarDays: (number | null)[] = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      calendarDays.push(null);
    }

    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push(day);
    }

    return calendarDays;
  };

  const days = generateCalendarDays();

  // Eventos do calendário
  const events: CalendarEvent[] = [
    {
      day: 11,
      startTime: '7:00',
      endTime: '9:00',
      title: 'Recreação',
      description: 'Ata Patriótica',
    },
    {
      day: 23,
      startTime: '11:00',
      endTime: '12:00',
      title: 'Treino',
      description: 'Leg day',
    },
  ];
  const router = useRouter();

  const handleCellClick = () => {
    router.push('/request-reservation');
  };

  // Verificar se um dia tem evento
  const getEventForDay = (day: number | null): CalendarEvent | undefined => {
    if (day === null) return undefined;
    return events.find((event) => event.day === day);
  };

  // Navegação
  const prevMonth = () => {
    setSelectedMonth((prev) => (prev === 0 ? 11 : prev - 1));
    if (selectedMonth === 0) {
      setSelectedYear((prev) => prev - 1);
    }
  };

  const nextMonth = () => {
    setSelectedMonth((prev) => (prev === 11 ? 0 : prev + 1));
    if (selectedMonth === 11) {
      setSelectedYear((prev) => prev + 1);
    }
  };

  const goToToday = () => {
    const today = new Date();
    setSelectedMonth(today.getMonth());
    setSelectedYear(today.getFullYear());
  };

  return (
    <div className="bg-[#ebe2e2] p-4 rounded-lg">
      {/* Cabeçalho com navegação */}
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

      {/* Seletor de mês/ano */}
      <div className="flex gap-2 mb-4">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          className="p-2 rounded-lg bg-white">
          {months.map((month, index) => (
            <option
              key={month}
              value={index}>
              {month}
            </option>
          ))}
        </select>

        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="p-2 rounded-lg bg-white">
          {Array.from({ length: 10 }, (_, i) => currentDate.getFullYear() - 5 + i).map((year) => (
            <option
              key={year}
              value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Grade do calendário */}
      <div className="grid grid-cols-7 gap-2">
        {/* Cabeçalho dos dias da semana */}
        {weekdays.map((day) => (
          <div
            key={`header-${day}`}
            className="text-center text-sm font-medium">
            {day}
          </div>
        ))}

        {/* Dias do calendário */}
        {days.map((day, index) => {
          const event = getEventForDay(day);
          const isToday =
            day === currentDate.getDate() &&
            selectedMonth === currentDate.getMonth() &&
            selectedYear === currentDate.getFullYear();

          return (
            <div
              key={`day-${index}`}
              onClick={handleCellClick}
              className={`cursor-pointer p-1 h-24 relative rounded-lg ${
                isToday ? 'bg-blue-100' : 'bg-white'
              }`}>
              {day && (
                <>
                  <div
                    className={`text-sm font-medium text-right p-1 ${
                      isToday
                        ? 'bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center ml-auto'
                        : ''
                    }`}>
                    {day}
                  </div>

                  {/* Evento para este dia */}
                  {event && (
                    <div className="text-center bg-green-300 p-1 rounded-md text-xs mt-1">
                      <div className="font-semibold">
                        {event.startTime} - {event.endTime}
                      </div>
                      <div>
                        {event.title} - {event.description}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
