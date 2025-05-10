'use client';

import { useState, useEffect } from 'react';
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
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';
import { Role } from '../NavBarPrivate/navbar-private';

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
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    ...reserve,
    ...(reserve.sport || {}),
    ...(reserve.classroom || {}),
    ...(reserve.event || {}),
  });
  const [userRole, setUserRole] = useState<Role | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        setUserRole(decoded.role as Role);
      } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.removeItem('token');
      }
    }
  }, []);

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

  const handleSubmitReport = () => {
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

  const handleViewReport = () => {
    router.push(`/view-report/${reserve.sport?.id}`);
  };

  function CompareHours() {
    const hourEnd = new Date(reserve.dateTimeEnd);
    const hourNow = new Date();

    if (hourNow > hourEnd) {
      if (userRole === 'USER' && reserve.sport) {
        return (
          <Button
            variant="outline"
            className="bg-[#2C2C2C] text-white"
            onClick={handleSubmitReport}>
            Enviar Relatório
          </Button>
        );
      } else if ((userRole === 'PE_ADMIN' || userRole === 'SISTEMA_ADMIN') && reserve.sport) {
        return (
          <Button
            variant="outline"
            className="bg-[#2C2C2C] text-white"
            onClick={handleViewReport}>
            Visualizar Relatório
          </Button>
        );
      }
    } else {
      return (
        <Button
          variant="default"
          disabled>
          {userRole === 'USER' ? 'Enviar Relatório' : 'Visualizar Relatório'}
        </Button>
      );
    }
    return null;
  }

  const renderActionButtons = () => {
    if (isEditing) {
      return (
        <>
          <Button
            variant="outline"
            onClick={() => setIsEditing(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar</Button>
        </>
      );
    } else {
      return (
        <>
          <Button
            variant="outline"
            onClick={onClose}>
            Fechar
          </Button>
          {(userRole === 'PE_ADMIN' || userRole === 'SISTEMA_ADMIN') && (
            <Button onClick={() => setIsEditing(true)}>Editar</Button>
          )}
          {userRole === 'USER' && reserve.sport && (
            <Button onClick={() => setIsEditing(true)}>Editar</Button>
          )}
        </>
      );
    }
  };

  const disabledInputClass =
    'disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed';

  const formatDateTime = (dateTime: Date) => {
    if (!dateTime) return '';
    const date = new Date(dateTime);

    // Ajusta para o fuso horário local
    const offset = date.getTimezoneOffset() * 60000; // offset em milissegundos
    const localDate = new Date(date.getTime() - offset);

    return localDate.toISOString().slice(0, 16);
  };

  const renderSportFields = () => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Prática</label>
          <Select
            value={editedData.typePractice}
            onValueChange={(value) => handleInputChange('typePractice', value)}
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
            value={editedData.numberParticipants || ''}
            onChange={(e) => handleInputChange('numberParticipants', e.target.value)}
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
          value={editedData.requestEquipment || ''}
          onChange={(e) => handleInputChange('requestEquipment', e.target.value)}
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
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Data e Hora de início
        </label>
        <Input
          type="datetime-local"
          value={formatDateTime(editedData.dateTimeStart)}
          onChange={(e) => handleInputChange('dateTimeStart', e.target.value)}
          disabled={!isEditing}
          className={disabledInputClass}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Data e Hora de fim</label>
        <Input
          type="datetime-local"
          value={formatDateTime(editedData.dateTimeEnd)}
          onChange={(e) => handleInputChange('dateTimeEnd', e.target.value)}
          disabled={!isEditing}
          className={disabledInputClass}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ocorrência</label>
        <Select
          value={editedData.occurrence}
          onValueChange={(value) => handleInputChange('occurrence', value)}
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
        {renderActionButtons()}
        {reserve.sport && <CompareHours />}
      </div>
    </>
  );
}
