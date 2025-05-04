'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader } from '../ui/dialog';

import { DialogTitle } from '@radix-ui/react-dialog';
import toast from 'react-hot-toast';

export interface ReserveSportProps {
  event: {
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
    color: string;
  };
}

export function CalendarEvent({ event }: ReserveSportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const timeStringToDate = (dateString: string, timeString: string): Date => {
    // Divide a string de data em ano, mês e dia
    const [year, month, day] = dateString.slice(0, 10).split('-').map(Number);

    // Divide a string de horário em horas e minutos
    const [hours, minutes] = timeString.split(':').map(Number);

    // Cria um novo objeto Date com a data e horário especificados
    // Nota: O mês no construtor do Date é 0-indexed (janeiro = 0)
    const resultDate = new Date(year, month - 1, day, hours, minutes);

    return resultDate;
  };

  function CompareHours({ date, time }: { date: string; time: string }) {
    const hourEnd = timeStringToDate(date, time);
    const hourNow = new Date();

    console.log(hourEnd);
    console.log(hourNow);
    if (hourNow > hourEnd) {
      return (
        <button className="p-2 rounded bg-[#2C2C2C] text-white font-medium">
          Realizar relatório
        </button>
      );
    } else {
      return (
        <button
          className="p-2 rounded text-white font-medium disabled:bg-gray-200 disabled:text-gray-300 disabled:border-gray-200"
          disabled>
          Realizar relatório
        </button>
      );
    }
  }
  return (
    <>
      <div
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
        className={`flex flex-col justify-center items-center ${event.color} p-1 h-full rounded text-sm overflow-hidden text-center`}>
        <div className="font-bold">{event.reserve.type_Reserve}</div>
        <div className="font-medium">{event.type_Practice.toLocaleLowerCase()}</div>
      </div>

      <Dialog
        open={isOpen}
        onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Evento</DialogTitle>
          </DialogHeader>
          <div className="border-1 h-auto">
            <div className="flex flex-col gap-4 p-5">
              <div className="flex gap-6">
                <div className="flex flex-col">
                  <label htmlFor="type-practice">Solicitante</label>
                  <input
                    id="type-practice"
                    type="text"
                    value={event.reserve.user.name}
                    className="rounded w-50 border-1 px-3 py-2 disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200"
                    min="1"
                    disabled
                  />
                </div>

                <div className="flex flex-col">
                  <label htmlFor="number-people">Ocorrência</label>
                  <input
                    id="number-people"
                    type="text"
                    value={event.reserve.ocurrence}
                    className="rounded w-50 border-1 px-3 py-2 disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200"
                    min="1"
                    disabled
                  />
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex flex-col">
                  <label htmlFor="type-practice">Tipo de prática</label>
                  <input
                    id="type-practice"
                    type="text"
                    value={event.type_Practice}
                    className="rounded w-50 border-1 px-3 py-2 disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200"
                    min="1"
                    disabled
                  />
                </div>

                <div className="flex flex-col">
                  <label htmlFor="number-people">Número de participantes</label>
                  <input
                    id="number-people"
                    type="text"
                    value={event.number_People}
                    className="rounded w-50 border-1 px-3 py-2 disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200"
                    min="1"
                    disabled
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label htmlFor="participants">Equipamentos Solicitados</label>
                <input
                  id="participants"
                  type="text"
                  value={event.request_Equipment}
                  className="rounded w-full border-1 px-3 py-2 disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200"
                  min="1"
                  disabled
                />
              </div>

              <div className="flex gap-6">
                <div className="flex flex-col">
                  <label htmlFor="type-practice">Data de início</label>
                  <input
                    id="type-practice"
                    type="text"
                    value={event.reserve.date_Start?.slice(0, 10)}
                    className="rounded w-50 border-1 px-3 py-2 disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200"
                    min="1"
                    disabled
                  />
                </div>

                <div className="flex flex-col">
                  <label htmlFor="number-people">Data de fim</label>
                  <input
                    id="number-people"
                    type="text"
                    value={event.reserve.date_End?.slice(0, 10)}
                    className="rounded w-50 border-1 px-3 py-2 disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200"
                    min="1"
                    disabled
                  />
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex flex-col">
                  <label htmlFor="type-practice">Hora de início</label>
                  <input
                    id="type-practice"
                    type="text"
                    value={event.reserve.hour_Start}
                    className="rounded w-50 border-1 px-3 py-2 disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200"
                    min="1"
                    disabled
                  />
                </div>

                <div className="flex flex-col">
                  <label htmlFor="number-people">Hora de fim</label>
                  <input
                    id="number-people"
                    type="text"
                    value={event.reserve.hour_End}
                    className="rounded w-50 border-1 px-3 py-2 disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200"
                    min="1"
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-12 justify-center">
            <button className="bg-red-700 p-2 px-5 rounded text-white font-medium">Voltar</button>
            <button className="bg-[#2C2C2C] p-2 rounded px-5 text-white font-medium">Editar</button>
            <CompareHours
              time={event.reserve.hour_End}
              date={event.reserve.date_End}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
