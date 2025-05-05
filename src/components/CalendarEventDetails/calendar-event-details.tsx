'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
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

export function CalendarEventDetails({ reserve, onClose, onSave }: CalendarEventDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    ...reserve,
    ...(reserve.sport || {}),
    ...(reserve.classroom || {}),
    ...(reserve.event || {}),
  });

  const handleInputChange = (field: string, value: string) => {
    setEditedData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    await onSave(editedData);
    setIsEditing(false);
  };

  // Estilo personalizado para inputs desabilitados
  const disabledInputClass =
    'disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed';

  const renderSportFields = () => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Prática</label>
          <Select
            value={editedData.type_Practice}
            onValueChange={(value) => handleInputChange('type_Practice', value)}
            disabled={!isEditing}>
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
            value={editedData.number_People || ''}
            onChange={(e) => handleInputChange('number_People', e.target.value)}
            disabled={!isEditing}
            className={disabledInputClass}
          />
        </div>
      </div>
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Equipamentos Solicitados
        </label>
        <Input
          value={editedData.request_Equipment || ''}
          onChange={(e) => handleInputChange('request_Equipment', e.target.value)}
          disabled={!isEditing}
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
          value={editedData.course || ''}
          onChange={(e) => handleInputChange('course', e.target.value)}
          disabled={!isEditing}
          className={disabledInputClass}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Matéria</label>
        <Input
          value={editedData.matter || ''}
          onChange={(e) => handleInputChange('matter', e.target.value)}
          disabled={!isEditing}
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
          value={editedData.name || ''}
          onChange={(e) => handleInputChange('name', e.target.value)}
          disabled={!isEditing}
          className={disabledInputClass}
        />
      </div>
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
        <Textarea
          value={editedData.description || ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
          disabled={!isEditing}
          className={disabledInputClass}
        />
      </div>
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Local</label>
        <Input
          value={editedData.location || ''}
          onChange={(e) => handleInputChange('location', e.target.value)}
          disabled={!isEditing}
          className={disabledInputClass}
        />
      </div>
    </>
  );

  const renderCommonFields = () => (
    <div className="grid grid-cols-2 gap-4 mt-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
        <Input
          type="date"
          value={editedData.date_Start?.slice(0, 10) || ''}
          onChange={(e) => handleInputChange('date_Start', e.target.value)}
          disabled={!isEditing}
          className={disabledInputClass}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Horário</label>
        <div className="flex gap-2">
          <Input
            type="time"
            value={editedData.hour_Start || ''}
            onChange={(e) => handleInputChange('hour_Start', e.target.value)}
            disabled={!isEditing}
            className={disabledInputClass}
          />
          <span className="self-center text-gray-500">às</span>
          <Input
            type="time"
            value={editedData.hour_End || ''}
            onChange={(e) => handleInputChange('hour_End', e.target.value)}
            disabled={!isEditing}
            className={disabledInputClass}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ocorrência</label>
        <Select
          value={editedData.ocurrence}
          onValueChange={(value) => handleInputChange('ocurrence', value)}
          disabled={!isEditing}>
          <SelectTrigger className={disabledInputClass}>
            <SelectValue placeholder="Selecione" />
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
      <DialogTitle className="text-lg font-bold mb-4">
        {isEditing ? 'Editar Reserva' : 'Detalhes da Reserva'}
      </DialogTitle>

      {reserve.sport && renderSportFields()}
      {reserve.classroom && renderClassroomFields()}
      {reserve.event && renderEventFields()}
      {renderCommonFields()}

      <div className="flex justify-end gap-2 mt-6">
        {isEditing ? (
          <>
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar</Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              onClick={onClose}>
              Fechar
            </Button>
            <Button onClick={() => setIsEditing(true)}>Editar</Button>
          </>
        )}
      </div>
    </>
  );
}
