import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getReports, getReserves } from './action';
import toast from 'react-hot-toast';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Reserves {
  id: string;
  type_Reserve: string;
  comments: string;
  status: string;
  ocurrence: string;
  dateTimeStart: Date;
  dateTimeEnd: Date;
  user: {
    name: string;
    role: string;
  };
  sport: {
    id: string;
    typePractice: string;
    numberParticipants: number;
    participants: string;
    requestEquipment: string;
  };
  classroom: {
    course: string;
    matter: string;
  };
  event: {
    name: string;
    description: string;
    location: string;
  };
}

interface Reports {
  id: string;
  name_User: string;
  people_Appear: string;
  requested_Equipment: string;
  description: string;
  description_Court: string;
  description_Equipment: string;
  time_Used: string;
  date_Used: string;
}

export default function DashboardViewReserves() {
  const [reserves, setReserves] = useState<Reserves[]>([]);
  const [selectedTab, setSelectedTab] = useState('all');
  const [selectedReserve, setSelectedReserve] = useState<Reserves | null>(null);
  const [reports, setReports] = useState();
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<any>({});

  const getAllReserves = async () => {
    try {
      const formData = new FormData();
      formData.append('token', localStorage.getItem('token') as string);
      const data = await getReserves(formData);
      console.log('Dados recebidos:', data);
      setReserves(data);
    } catch (error: any) {
      toast.error(error.message);
      console.error('Erro ao buscar reservas:', error);
    }
  };

  const handleSaveChanges = async () => {
    try {
      toast.success('Alterações salvas com sucesso');
      setIsEditing(false);
      await getAllReserves();
    } catch (error) {
      toast.error('Erro ao salvar alterações');
      console.error(error);
    }
  };

  useEffect(() => {
    if (selectedReserve) {
      setEditedData({
        ...selectedReserve,
        ...(selectedReserve.sport || {}),
        ...(selectedReserve.classroom || {}),
        ...(selectedReserve.event || {}),
      });
    }
  }, [selectedReserve]);

  const handleInputChange = (field: string, value: string) => {
    setEditedData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getAllReports = async () => {
    try {
      const formData = new FormData();
      formData.append('token', localStorage.getItem('token') as string);
      const data = await getReports(formData);
      console.log('Relatórios', reports);
      setReports(data);
    } catch (error: any) {
      toast.error(error.message);
      console.error('Error ao buscar relatórios', error);
    }
  };

  useEffect(() => {
    getAllReserves();
  }, []);

  const renderActionButtons = () => {
    if (isEditing) {
      return (
        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => setIsEditing(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSaveChanges}>Salvar</Button>
        </div>
      );
    } else if (selectedReserve?.status?.toLowerCase() === 'pendente') {
      return (
        <Button
          variant="outline"
          onClick={() => setIsEditing(true)}>
          Editar
        </Button>
      );
    }
    return null;
  };

  const filteredReserves = reserves.filter((reserve) => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'RECREACAO') return reserve.ocurrence === 'RECREACAO';
    if (selectedTab === 'TREINO') return reserve.sport?.typePractice === 'TREINO';
    if (selectedTab === 'AMISTOSO') return reserve.sport?.typePractice === 'AMISTOSO';
    return true;
  });
  const formatDateTimeForInput = (dateTime: Date) => {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    const offset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - offset);
    return localDate.toISOString().slice(0, 16);
  };

  const renderStatus = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pendente':
        return <span className="text-gray-400 text-sm">Pendente</span>;
      case 'confirmada':
        return <span className="text-green-500 text-sm">Confirmada</span>;
      case 'recusada':
        return <span className="text-red-500 text-sm">Recusada</span>;
      default:
        return <span className="text-gray-400 text-sm">Status desconhecido</span>;
    }
  };

  const formatDateTime = (dateTime: Date) => {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const disabledInputClass =
    'disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed';

  const renderReserveDetails = () => {
    if (!selectedReserve) {
      return (
        <div className="w-full bg-white  md:w-1/2 border rounded-md p-8 flex flex-col items-center justify-center min-h-[600px]">
          <div className="w-24 h-24 flex items-center justify-center">
            <Mail className="w-16 h-16" />
          </div>
          <p className="mt-4 text-lg font-medium">Selecione um item</p>
        </div>
      );
    }

    return (
      <div className="w-full bg-white md:w-1/2 border rounded-md p-6">
        <h2 className="text-xl font-bold mb-4">Detalhes da Reserva</h2>
        {renderActionButtons()}
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Informações Básicas</h3>
            <div className="space-y-2 mt-2">
              <div className="flex gap-5">
                <div>
                  <label className="block text-sm font-medium mb-1">ID</label>
                  <Input
                    value={selectedReserve.id}
                    disabled
                    className="bg-gray-100 text-gray-600 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Solicitante</label>
                  <Input
                    value={selectedReserve.user.name}
                    disabled
                    className={disabledInputClass}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de Prática</label>
                <Select
                  value={editedData.typePractice || ''}
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
                <label className="block text-sm font-medium mb-1">Número de participantes</label>
                <Input
                  value={editedData.numberParticipants || ''}
                  onChange={(e) => handleInputChange('numberParticipants', e.target.value)}
                  disabled={!isEditing}
                  className={disabledInputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Participantes</label>
                <Input
                  value={editedData.participants || ''}
                  onChange={(e) => handleInputChange('participants', e.target.value)}
                  disabled={!isEditing}
                  className={disabledInputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Equipamentos solicitados</label>
                <Input
                  value={editedData.requestEquipment || ''}
                  onChange={(e) => handleInputChange('requestEquipment', e.target.value)}
                  disabled={!isEditing}
                  className={disabledInputClass}
                />
              </div>

              <div className="flex gap-5">
                <div>
                  <label className="block text-sm font-medium mb-1">Início</label>
                  <Input
                    type="datetime-local"
                    value={formatDateTimeForInput(selectedReserve.dateTimeStart)}
                    onChange={(e) => handleInputChange('dateTimeStart', e.target.value)}
                    disabled={!isEditing}
                    className={disabledInputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Término</label>
                  <Input
                    type="datetime-local"
                    value={formatDateTimeForInput(selectedReserve.dateTimeEnd)}
                    onChange={(e) => handleInputChange('dateTimeEnd', e.target.value)}
                    disabled={!isEditing}
                    className={disabledInputClass}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-auto md:w-1/2">
          <Tabs
            defaultValue="all"
            onValueChange={(value) => setSelectedTab(value)}
            className="mb-4">
            <TabsList className="grid grid-cols-6 w-full">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="RECREACAO">Recreação</TabsTrigger>
              <TabsTrigger value="TREINO">Treino</TabsTrigger>
              <TabsTrigger value="AMISTOSO">Amistoso</TabsTrigger>
            </TabsList>
          </Tabs>

          <div
            className="space-y-2 p-2 overflow-y-auto pr-2"
            style={{ maxHeight: '70vh' }}>
            {filteredReserves.length === 0 && (
              <Card className="p-4 bg-gray-100">
                <div>
                  <h3 className="font-bold text-sm">Nenhuma reserva encontrada</h3>
                  <p className="text-sm">Não há reservas para o filtro selecionado</p>
                </div>
              </Card>
            )}

            {filteredReserves.map((reserve) => (
              <Card
                key={reserve.id}
                className={`p-4 bg-gray-100 relative cursor-pointer hover:bg-gray-200 ${
                  selectedReserve?.id === reserve.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedReserve(reserve)}>
                <div>
                  <h3 className="font-bold text-sm">
                    {reserve.classroom?.matter && 'Aula adicionada'}
                    {reserve.event?.name && 'Evento adicionado'}
                    {reserve.sport?.typePractice && `Reserva ${reserve.status ? 'Solicitada' : ''}`}
                  </h3>
                  <p className="text-sm">Reserva Solicitada</p>

                  <p className="text-xs mt-1">
                    {formatDateTime(reserve.dateTimeStart)} - {formatDateTime(reserve.dateTimeEnd)}
                  </p>
                </div>

                {reserve.status && (
                  <div className="absolute top-4 right-4">{renderStatus(reserve.status)}</div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {renderReserveDetails()}
      </div>
    </div>
  );
}
