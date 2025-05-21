'use client';

import { useState } from 'react';

import { DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Reserves } from '../Calendar/calendar';

interface CalendarEventDetailsProps {
  reserve: Reserves;
  onClose: () => void;
  onSave: (updatedData: any) => Promise<void>;
}

interface JwtPayload {
  id: string;
  role: string;
}

export function CalendarEventDetails({ reserve, onClose, onSave }: CalendarEventDetailsProps) {
  const [data, setData] = useState({
    ...reserve,
    ...(reserve.sport || {}),
    ...(reserve.classroom || {}),
    ...(reserve.event || {}),
  });

  const disabledInputClass =
    'disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed';

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

  const renderSportFields = () => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Prática</label>
          <Select
            value={data.typePractice}
            disabled>
            <SelectTrigger className={disabledInputClass}>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número de Participantes
          </label>
          <Input
            type="number"
            value={data.numberParticipants || ''}
            disabled
            className={disabledInputClass}
          />
        </div>
      </div>
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Equipamentos Solicitados
        </label>
        <Input
          value={data.requestEquipment || ''}
          disabled
          className={disabledInputClass}
        />
      </div>
    </>
  );

  const renderClassroomFields = () => (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Curso</label>
        <Input
          value={data.course || ''}
          disabled
          className={disabledInputClass}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Matéria</label>
        <Input
          value={data.matter || ''}
          disabled
          className={disabledInputClass}
        />
      </div>
    </div>
  );

  const renderEventFields = () => (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Evento</label>
        <Input
          value={data.name || ''}
          disabled
          className={disabledInputClass}
        />
      </div>
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
        <Textarea
          value={data.description || ''}
          disabled
          className={disabledInputClass}
        />
      </div>
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Local</label>
        <Input
          value={data.location || ''}
          disabled
          className={disabledInputClass}
        />
      </div>
    </>
  );

  const renderCommonFields = () => (
    <div className="grid grid-cols-2 gap-4 mt-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {reserve.occurrence === 'SEMANALMENTE' ? 'Hora de início' : 'Data e Hora de início'}
        </label>
        {reserve.occurrence === 'SEMANALMENTE' ? (
          <Input
            type="text"
            value={formatDateTime(data.dateTimeStart)}
            disabled
            className={disabledInputClass}
          />
        ) : (
          <Input
            type="datetime-local"
            value={formatDateTime(data.dateTimeStart)}
            disabled
            className={disabledInputClass}
          />
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {reserve.occurrence === 'SEMANALMENTE' ? 'Hora de fim' : 'Data e Hora de fim'}
        </label>
        {reserve.occurrence === 'SEMANALMENTE' ? (
          <Input
            type="text"
            value={formatDateTime(data.dateTimeEnd)}
            disabled
            className={disabledInputClass}
          />
        ) : (
          <Input
            type="datetime-local"
            value={formatDateTime(data.dateTimeEnd)}
            disabled
            className={disabledInputClass}
          />
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ocorrência</label>
        <Select
          value={data.occurrence}
          disabled>
          <SelectTrigger className={disabledInputClass}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SEMANALMENTE">Semanalmente</SelectItem>
            <SelectItem value="EVENTO_UNICO">Evento Único</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <>
      <DialogTitle className="text-lg font-bold mb-4">Detalhes da Reserva</DialogTitle>

      {reserve.sport && renderSportFields()}
      {reserve.classroom && renderClassroomFields()}
      {reserve.event && renderEventFields()}
      {renderCommonFields()}
    </>
  );
}
