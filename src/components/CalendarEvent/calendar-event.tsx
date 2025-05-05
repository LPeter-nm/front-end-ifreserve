'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader } from '../ui/dialog';
import { DialogTitle } from '@radix-ui/react-dialog';
import toast from 'react-hot-toast';
import { Reserves } from '../Calendar/calendar';
import { updateReserve } from './action';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ReservesProps {
  reserve: Reserves;
  color: string;
  onUpdate?: () => void;
}

export function CalendarEvent({ reserve, color, onUpdate }: ReservesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editedData, setEditedData] = useState<any>({});

  useEffect(() => {
    if (isOpen) {
      initializeEditData();
    }
  }, [isOpen]);

  const initializeEditData = () => {
    const baseData = {
      date_Start: reserve.date_Start?.slice(0, 10) || '',
      date_End: reserve.date_End?.slice(0, 10) || '',
      hour_Start: reserve.hour_Start || '',
      hour_End: reserve.hour_End || '',
      ocurrence: reserve.ocurrence || '',
    };

    if (reserve.sport) {
      setEditedData({
        ...baseData,
        type_Practice: reserve.sport.type_Practice,
        number_People: reserve.sport.number_People || '',
        request_Equipment: reserve.sport.request_Equipment || '',
      });
    } else if (reserve.classroom) {
      setEditedData({
        ...baseData,
        course: reserve.classroom.course,
        matter: reserve.classroom.matter,
      });
    } else if (reserve.event) {
      setEditedData({
        ...baseData,
        name: reserve.event.name,
        description: reserve.event.description || '',
        location: reserve.event.location || '',
      });
    } else {
      setEditedData(baseData);
    }
  };

  const getRoute = () => {
    if (reserve.sport) return 'reserve-sport';
    if (reserve.classroom) return 'reserve-classroom';
    if (reserve.event) return 'reserve-event';
    return 'reserves';
  };

  const handleSaveChanges = async () => {
    setIsLoading(true);
    try {
      const dataToSend = {
        ...editedData,
        date_Start: editedData.date_Start + 'T00:00:00Z',
        date_End: editedData.date_End + 'T00:00:00Z',
      };

      const result = await updateReserve(reserve.id, getRoute(), dataToSend);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Reserva atualizada com sucesso!');
        setIsEditing(false);
        onUpdate?.();
      }
    } catch (error) {
      toast.error('Erro ao atualizar reserva');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderEventTitle = () => {
    if (reserve.sport) return reserve.sport.type_Practice.toLocaleLowerCase();
    if (reserve.classroom) return reserve.classroom.matter;
    if (reserve.event) return reserve.event.name;
    return reserve.type_Reserve;
  };

  const renderSpecificFields = () => {
    if (reserve.sport) {
      return (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tipo de prática</label>
              <Select
                value={editedData.type_Practice}
                onValueChange={(value) => setEditedData({ ...editedData, type_Practice: value })}
                disabled={!isEditing}>
                <SelectTrigger className={!isEditing ? 'bg-gray-100' : ''}>
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
                value={editedData.number_People || ''}
                onChange={(e) => setEditedData({ ...editedData, number_People: e.target.value })}
                disabled={!isEditing}
                className={!isEditing ? 'bg-gray-100' : ''}
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Equipamentos Solicitados</label>
            <Input
              value={editedData.request_Equipment || ''}
              onChange={(e) => setEditedData({ ...editedData, request_Equipment: e.target.value })}
              disabled={!isEditing}
              className={!isEditing ? 'bg-gray-100' : ''}
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
              value={editedData.course || ''}
              onChange={(e) => setEditedData({ ...editedData, course: e.target.value })}
              disabled={!isEditing}
              className={!isEditing ? 'bg-gray-100' : ''}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Matéria</label>
            <Input
              value={editedData.matter || ''}
              onChange={(e) => setEditedData({ ...editedData, matter: e.target.value })}
              disabled={!isEditing}
              className={!isEditing ? 'bg-gray-100' : ''}
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
                value={editedData.name || ''}
                onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                disabled={!isEditing}
                className={!isEditing ? 'bg-gray-100' : ''}
              />
            </div>
            <div className="flex flex-col w-full">
              <label className="text-sm font-medium mb-1">Local</label>
              <Input
                value={editedData.location || ''}
                onChange={(e) => setEditedData({ ...editedData, location: e.target.value })}
                disabled={!isEditing}
                className={!isEditing ? 'bg-gray-100' : ''}
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Descrição</label>
            <Textarea
              value={editedData.description || ''}
              onChange={(e) => setEditedData({ ...editedData, description: e.target.value })}
              disabled={!isEditing}
              className={!isEditing ? 'bg-gray-100' : ''}
            />
          </div>
        </>
      );
    }

    return null;
  };

  const renderCommonFields = () => (
    <div className="grid grid-cols-2 gap-4 mt-4">
      <div>
        <label className="block text-sm font-medium mb-1">Data de início</label>
        <Input
          type="date"
          value={editedData.date_Start}
          onChange={(e) => setEditedData({ ...editedData, date_Start: e.target.value })}
          disabled={!isEditing}
          className={!isEditing ? 'bg-gray-100' : ''}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Data de fim</label>
        <Input
          type="date"
          value={editedData.date_End}
          onChange={(e) => setEditedData({ ...editedData, date_End: e.target.value })}
          disabled={!isEditing}
          className={!isEditing ? 'bg-gray-100' : ''}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Hora de início</label>
        <Input
          type="time"
          value={editedData.hour_Start}
          onChange={(e) => setEditedData({ ...editedData, hour_Start: e.target.value })}
          disabled={!isEditing}
          className={!isEditing ? 'bg-gray-100' : ''}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Hora de fim</label>
        <Input
          type="time"
          value={editedData.hour_End}
          onChange={(e) => setEditedData({ ...editedData, hour_End: e.target.value })}
          disabled={!isEditing}
          className={!isEditing ? 'bg-gray-100' : ''}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Ocorrência</label>
        <Select
          value={editedData.ocurrence}
          onValueChange={(value) => setEditedData({ ...editedData, ocurrence: value })}
          disabled={!isEditing}>
          <SelectTrigger className={!isEditing ? 'bg-gray-100' : ''}>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SEMANALMENTE">Semanalmente</SelectItem>
            <SelectItem value="EVENTO_UNICO">Evento único</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="grid h-16">
      <div
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
        className={`flex flex-col justify-center items-center ${color} p-1 h-full rounded text-sm overflow-hidden text-center`}>
        <div className="font-bold">{reserve.type_Reserve}</div>
        <div className="font-medium">{renderEventTitle()}</div>
      </div>

      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) {
            setIsEditing(false);
          }
        }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {isEditing ? 'Editar Reserva' : 'Detalhes da Reserva'}
            </DialogTitle>
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
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}>
                Voltar
              </Button>
              <Button
                onClick={isEditing ? handleSaveChanges : () => setIsEditing(true)}
                disabled={isLoading}>
                {isLoading ? 'Salvando...' : isEditing ? 'Salvar' : 'Editar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
