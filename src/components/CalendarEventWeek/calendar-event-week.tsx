'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader } from '../ui/dialog';
import { DialogTitle } from '@radix-ui/react-dialog';
import { Reserves } from '../Calendar/calendar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ReservesProps {
  reserve: Reserves;
  color: string;
  onUpdate?: () => void;
}

export function CalendarEvent({ reserve, color }: ReservesProps) {
  const [isOpen, setIsOpen] = useState(false); // Controla o modal
  // Dados em edição

  const router = useRouter();

  const formatToDDMMYYYYHHMM = (dateString: string) => {
    const date = new Date(dateString);

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day}/${month}/${year}, ${hours}:${minutes}`;
  };

  const renderEventTitle = () => {
    const title =
      reserve.sport?.typePractice ||
      reserve.classroom?.matter ||
      reserve.event?.name ||
      reserve.type_Reserve;

    return (
      <>
        <div className="font-bold">{reserve.type_Reserve}</div>
        <div className="font-medium">{title.toLowerCase()}</div>
        {reserve.occurrence === 'SEMANALMENTE' && (
          <div className="text-xs italic">
            (Todo/a {format(new Date(reserve.dateTimeStart), 'EEEE', { locale: ptBR })})
          </div>
        )}
      </>
    );
  };

  const renderSpecificFields = () => {
    if (reserve.sport) {
      return (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tipo de prática</label>
              <Select
                value={reserve.sport.typePractice}
                disabled>
                <SelectTrigger className="bg-gray-100">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TREINO">Treino</SelectItem>
                  <SelectItem value="AMISTOSO">Amistoso</SelectItem>
                  <SelectItem value="RECREACAO">Recreação</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Número de participantes</label>
              <Input
                type="number"
                value={reserve.sport.numberParticipants || ''}
                disabled
                className="bg-gray-100"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Equipamentos Solicitados</label>
            <Input
              value={reserve.sport.requestEquipment || ''}
              disabled
              className="bg-gray-100"
            />
          </div>
        </>
      );
    }

    if (reserve.classroom) {
      return (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Curso</label>
            <Input
              value={reserve.classroom.course || ''}
              disabled
              className="bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Matéria</label>
            <Input
              value={reserve.classroom.matter || ''}
              disabled
              className="bg-gray-100"
            />
          </div>
        </div>
      );
    }

    if (reserve.event) {
      return (
        <>
          <div className="flex gap-5">
            <div className="flex flex-col w-full">
              <label className=" text-sm font-medium mb-1">Nome do Evento</label>
              <Input
                value={reserve.event.name || ''}
                disabled
                className="bg-gray-100"
              />
            </div>
            <div className="flex flex-col w-full">
              <label className="text-sm font-medium mb-1">Local</label>
              <Input
                value={reserve.event.location || ''}
                disabled
                className="bg-gray-100"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Descrição</label>
            <Textarea
              value={reserve.event.description || ''}
              disabled
              className="bg-gray-100"
            />
          </div>
        </>
      );
    }

    return null;
  };

  const renderCommonFields = () => {
    const formatDateTime = (dateTime: Date) => {
      if (!dateTime) return '';
      const date = new Date(dateTime);

      // Horário local
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');

      if (reserve.occurrence === 'SEMANALMENTE') {
        return `${hours}:${minutes}`;
      }

      // Data local para datetime-local input
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');

      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    return (
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            {reserve.occurrence === 'SEMANALMENTE' ? 'Hora de início' : 'Data e Hora de início'}
          </label>
          {reserve.occurrence === 'SEMANALMENTE' ? (
            <Input
              type="text"
              value={formatDateTime(reserve.dateTimeStart)}
              disabled
              className="bg-gray-100"
            />
          ) : (
            <Input
              type="datetime-local"
              value={formatDateTime(reserve.dateTimeStart)}
              disabled
              className="bg-gray-100"
            />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            {reserve.occurrence === 'SEMANALMENTE' ? 'Hora de fim' : 'Data e Hora de fim'}
          </label>
          {reserve.occurrence === 'SEMANALMENTE' ? (
            <Input
              type="text"
              value={formatDateTime(reserve.dateTimeEnd)}
              disabled
              className="bg-gray-100"
            />
          ) : (
            <Input
              type="datetime-local"
              value={formatDateTime(reserve.dateTimeEnd)}
              disabled
              className="bg-gray-100"
            />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ocorrência</label>
          <Select
            value={reserve.occurrence || ''}
            disabled>
            <SelectTrigger className="bg-gray-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SEMANALMENTE">Semanalmente</SelectItem>
              <SelectItem value="EVENTO_UNICO">Evento único</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };

  return (
    <div className="grid h-16">
      <div
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
        className={`flex flex-col justify-center items-center ${color} p-1 h-full rounded text-sm overflow-hidden text-center`}>
        {renderEventTitle()}
      </div>

      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
        }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-center">Detalhes da Reserva</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Solicitante</label>
                <Input
                  value={reserve.user.name}
                  disabled
                  className="bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tipo</label>
                <Input
                  value={reserve.type_Reserve}
                  disabled
                  className="bg-gray-100"
                />
              </div>
            </div>

            {renderSpecificFields()}
            {renderCommonFields()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
