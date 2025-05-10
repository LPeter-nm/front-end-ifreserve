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
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { Role } from '../NavBarPrivate/navbar-private';

interface ReservesProps {
  reserve: Reserves;
  color: string;
  onUpdate?: () => void;
}

interface JwtPayload {
  id: string;
  role: string;
}

export function CalendarEvent({ reserve, color, onUpdate }: ReservesProps) {
  const [isOpen, setIsOpen] = useState(false); // Controla o modal
  const [isEditing, setIsEditing] = useState(false); // Modo edição
  const [isLoading, setIsLoading] = useState(false); // Loading durante ações
  const [editedData, setEditedData] = useState<any>({}); // Dados em edição
  const [Role, setRole] = useState<Role | null>(); // Tipo de usuário
  const router = useRouter();

  const getRole = () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setIsLoading(false);
        return;
      }

      const decoded = jwtDecode<JwtPayload>(token);
      setRole(decoded.role as Role);
    } catch (error: any) {
      console.error('Error decoding token:', error);
      toast.error(error.message);
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      initializeEditData();
      getRole();
    }
  }, [isOpen]);

  const initializeEditData = () => {
    const baseData = {
      dateTimeStart: reserve.dateTimeStart.toLocaleString(),
      dateTimeEnd: reserve.dateTimeEnd.toLocaleString(),
      ocurrence: reserve.occurrence || '',
    };

    if (reserve.sport) {
      setEditedData({
        ...baseData,
        typePractice: reserve.sport.typePractice,
        numberParticipants: reserve.sport.numberParticipants || '',
        requestEquipment: reserve.sport.requestEquipment || '',
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
        dateTimeStart: editedData.dateTimeStart,
        dateTimeEnd: editedData.dateTimeEnd,
      };

      const result = await updateReserve(reserve.id, getRoute(), dataToSend);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result?.message);
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

  const handleViewReport = () => {
    router.push(`/report/${reserve.sport?.id}`);
  };

  const handleReportForm = () => {
    const calculateTimeUsed = () => {
      const start = new Date(reserve.dateTimeStart);
      const end = new Date(reserve.dateTimeEnd);

      const diffMs = end.getTime() - start.getTime();
      const diffMins = Math.round(diffMs / 60000);

      const hours = Math.floor(diffMins / 60);
      const minutes = diffMins % 60;

      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    };

    const timeUsed = calculateTimeUsed();
    router.push(`/report?sportId=${reserve.sport?.id}`);
  };

  const renderEventTitle = () => {
    if (reserve.sport) return reserve.sport.typePractice.toLocaleLowerCase();
    if (reserve.classroom) return reserve.classroom.matter;
    if (reserve.event) return reserve.event.name;
    return reserve.typeReserve;
  };

  function ReportButton() {
    return (
      <Button
        variant="outline"
        onClick={handleViewReport}>
        Visualizar Relatório
      </Button>
    );
  }

  function CompareHours() {
    const hourEnd = new Date(reserve.dateTimeEnd);
    const hourNow = new Date();

    if (hourNow > hourEnd) {
      if (Role === 'USER' && reserve.sport) {
        return (
          <Button
            variant="outline"
            className="bg-[#2C2C2C] text-white"
            onClick={handleReportForm}>
            Enviar Relatório
          </Button>
        );
      } else if ((Role === 'PE_ADMIN' || Role === 'SISTEMA_ADMIN') && reserve.sport) {
        return <ReportButton />;
      }
    } else {
      return (
        <Button
          variant="default"
          disabled>
          {Role === 'USER' ? 'Enviar Relatório' : 'Visualizar Relatório'}
        </Button>
      );
    }
    return null;
  }

  const renderActionButtons = () => {
    if (Role === 'PE_ADMIN' || Role === 'SISTEMA_ADMIN') {
      return (
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
          {reserve.sport && <CompareHours />}
        </div>
      );
    }

    if (Role === 'USER' && reserve.sport) {
      return (
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
          <CompareHours />
        </div>
      );
    }

    return (
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={() => setIsOpen(false)}>
          Voltar
        </Button>
      </div>
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
                value={editedData.typePractice}
                onValueChange={(value) => setEditedData({ ...editedData, typePractice: value })}
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
                value={editedData.numberParticipants || ''}
                onChange={(e) =>
                  setEditedData({ ...editedData, numberParticipants: e.target.value })
                }
                disabled={!isEditing}
                className={!isEditing ? 'bg-gray-100' : ''}
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Equipamentos Solicitados</label>
            <Input
              value={editedData.requestEquipment || ''}
              onChange={(e) => setEditedData({ ...editedData, requestEquipment: e.target.value })}
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

  const renderCommonFields = () => {
    const formatDateTime = (dateTime: Date) => {
      if (!dateTime) return '';
      const date = new Date(dateTime);

      // Ajusta para o fuso horário local
      const offset = date.getTimezoneOffset() * 60000; // offset em milissegundos
      const localDate = new Date(date.getTime() - offset);

      return localDate.toISOString().slice(0, 16);
    };

    return (
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium mb-1">Data e Hora de início</label>
          <Input
            type="datetime-local"
            value={formatDateTime(editedData.dateTimeStart)}
            onChange={(e) =>
              setEditedData({ ...editedData, dateTimeStart: new Date(e.target.value) })
            }
            disabled={!isEditing}
            className={!isEditing ? 'bg-gray-100' : ''}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Data e Hora de fim</label>
          <Input
            type="datetime-local"
            value={formatDateTime(editedData.dateTimeEnd)}
            onChange={(e) =>
              setEditedData({ ...editedData, dateTimeEnd: new Date(e.target.value) })
            }
            disabled={!isEditing}
            className={!isEditing ? 'bg-gray-100' : ''}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ocorrência</label>
          <Select
            value={editedData.occurrence}
            onValueChange={(value) => setEditedData({ ...editedData, occurrence: value })}
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
  };

  return (
    <div className="grid h-16">
      <div
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
        className={`flex flex-col justify-center items-center ${color} p-1 h-full rounded text-sm overflow-hidden text-center`}>
        <div className="font-bold">{reserve.typeReserve}</div>
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
                  value={reserve.typeReserve}
                  disabled
                  className="bg-gray-100"
                />
              </div>
            </div>

            {renderSpecificFields()}
            {renderCommonFields()}

            {renderActionButtons()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
