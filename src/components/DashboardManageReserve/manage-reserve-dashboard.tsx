import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
import { confirmReserve, getReports, getReserves, refusedReserve } from './action';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  status: string;
  comments: string;
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
    numberParticipants?: string;
    requestEquipment?: string;
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

export default function DashboardManageReserve() {
  const [reserves, setReserves] = useState<Reserves[]>([]);
  const [selectedTab, setSelectedTab] = useState('all');
  const [selectedReserve, setSelectedReserve] = useState<Reserves | null>(null);
  const [reports, setReports] = useState();
  const [comment, setComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<any>({});

  const getAllReserves = async () => {
    try {
      const formData = new FormData();
      formData.append('token', localStorage.getItem('token') as string);
      const data = await getReserves(formData);
      setReserves(data);
    } catch (error: any) {
      toast.error(error.message);
      console.error('Erro ao buscar reservas:', error);
    }
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

  const handleConfirmReserve = async (reserveId: string) => {
    try {
      const formData = new FormData();
      formData.append('token', localStorage.getItem('token') as string);

      const result = await confirmReserve(formData, reserveId, comment);

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Reserva confirmada com sucesso');
        setComment('');
        await getAllReserves();
      }
    } catch (error: any) {
      toast.error(error.message);
      console.error('Erro ao confirmar reserva', error);
    }
  };

  const handleRejectReserve = async (reserveId: string) => {
    try {
      const formData = new FormData();
      formData.append('token', localStorage.getItem('token') as string);

      const result = await refusedReserve(formData, reserveId, comment);

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Reserva recusada com sucesso');
        setComment('');
        await getAllReserves();
      }
    } catch (error: any) {
      toast.error(error.message);
      console.error('Erro ao recusar reserva', error);
    }
  };

  useEffect(() => {
    getAllReserves();
  }, []);

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

  const filteredReserves = reserves.filter((reserve) => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'RECREACAO') return reserve.ocurrence === 'RECREACAO';
    if (selectedTab === 'TREINO') return reserve.sport?.typePractice === 'TREINO';
    if (selectedTab === 'AMISTOSO') return reserve.sport?.typePractice === 'AMISTOSO';
    if (selectedTab === 'aula') return reserve.classroom?.matter;
    if (selectedTab === 'evento') return reserve.event?.name;
    return true;
  });

  const renderStatus = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pendente':
        return <span className="text-gray-400 text-sm">Pendente</span>;
      case 'confirmada':
        return <span className="text-green-500 text-sm">Confirmada</span>;
      case 'recusada':
        return <span className="text-red-500 text-sm">Recusada</span>;
      case 'cadastrado':
        return <span className="text-green-500 text-sm">Cadastrada</span>;
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

  const formatDateTimeForInput = (dateTime: Date) => {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    const offset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - offset);
    return localDate.toISOString().slice(0, 16);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditedData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveChanges = async () => {
    try {
      // Aqui você implementaria a lógica para salvar as alterações
      // Por exemplo, chamando uma API para atualizar a reserva
      toast.success('Alterações salvas com sucesso');
      setIsEditing(false);
      await getAllReserves();
    } catch (error) {
      toast.error('Erro ao salvar alterações');
      console.error(error);
    }
  };

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
    } else if (
      selectedReserve?.status?.toLowerCase() === 'pendente' ||
      selectedReserve?.status?.toLowerCase() === 'cadastrado'
    ) {
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

  const renderReserveDetails = () => {
    if (!selectedReserve) {
      return (
        <div className="w-full bg-white md:w-1/2 border rounded-md p-8 flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-24 h-24 flex items-center justify-center">
            <Mail className="w-16 h-16" />
          </div>
          <p className="mt-4 text-lg font-medium">Selecione um item</p>
        </div>
      );
    }

    const disabledInputClass =
      'disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed';

    return (
      <div className="w-full bg-white md:w-1/2 border rounded-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Detalhes da Reserva</h2>
          {renderActionButtons()}
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Informações Básicas</h3>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <label className="block text-sm font-medium mb-1">ID</label>
                <Input
                  value={selectedReserve.id}
                  disabled
                  className={disabledInputClass}
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

          {selectedReserve.sport && (
            <div>
              <h3 className="font-semibold">Detalhes Esportivos</h3>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo de Prática</label>
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
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <Input
                    value={selectedReserve.status}
                    disabled
                    className={disabledInputClass}
                  />
                </div>
                {editedData.numberParticipants && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Participantes</label>
                    <Input
                      value={editedData.numberParticipants}
                      onChange={(e) => handleInputChange('numberParticipants', e.target.value)}
                      disabled={!isEditing}
                      className={disabledInputClass}
                    />
                  </div>
                )}
                {editedData.requestEquipment && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Equipamentos</label>
                    <Input
                      value={editedData.requestEquipment}
                      onChange={(e) => handleInputChange('requestEquipment', e.target.value)}
                      disabled={!isEditing}
                      className={disabledInputClass}
                    />
                  </div>
                )}
              </div>

              {selectedReserve.status?.toLowerCase() === 'pendente' && !isEditing && (
                <div className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Comentário (opcional)</label>
                    <textarea
                      rows={3}
                      className="w-full p-2 border rounded-md"
                      placeholder="Adicione um comentário sobre a decisão..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleRejectReserve(selectedReserve.id)}
                      className="cursor-pointer bg-red-500 hover:bg-red-600">
                      Recusar
                    </Button>
                    <Button
                      onClick={() => handleConfirmReserve(selectedReserve.id)}
                      className="cursor-pointer bg-green-500 hover:bg-green-600">
                      Confirmar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedReserve.classroom && (
            <div>
              <h3 className="font-semibold">Detalhes de Aula</h3>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Matéria</label>
                  <Input
                    value={editedData.matter}
                    onChange={(e) => handleInputChange('matter', e.target.value)}
                    disabled={!isEditing}
                    className={disabledInputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Curso</label>
                  <Input
                    value={editedData.course}
                    onChange={(e) => handleInputChange('course', e.target.value)}
                    disabled={!isEditing}
                    className={disabledInputClass}
                  />
                </div>
              </div>
            </div>
          )}

          {selectedReserve.event && (
            <div>
              <h3 className="font-semibold">Detalhes do Evento</h3>
              <div className="grid grid-cols-1 gap-4 mt-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome</label>
                  <Input
                    value={editedData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={!isEditing}
                    className={disabledInputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Local</label>
                  <Input
                    value={editedData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    disabled={!isEditing}
                    className={disabledInputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Descrição</label>
                  <Textarea
                    value={editedData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    disabled={!isEditing}
                    className={disabledInputClass}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const getReserveMessage = (reserve: Reserves) => {
    if (reserve.user.role === 'PE_ADMIN' || reserve.user.role === 'SISTEMA ADMIN') {
      return `${reserve.type_Reserve} - Cadastrado por ${reserve.user?.name}`;
    } else if (reserve.user.role === 'USER') {
      return `${reserve.type_Reserve} - Solicitado por ${reserve.user?.name}`;
    }
    return reserve.type_Reserve;
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/2">
          <Tabs
            defaultValue="all"
            onValueChange={(value) => setSelectedTab(value)}
            className="mb-4">
            <TabsList className="grid grid-cols-6 w-full">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="RECREACAO">Recreação</TabsTrigger>
              <TabsTrigger value="TREINO">Treino</TabsTrigger>
              <TabsTrigger value="AMISTOSO">Amistoso</TabsTrigger>
              <TabsTrigger value="aula">Aula</TabsTrigger>
              <TabsTrigger value="evento">Evento</TabsTrigger>
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
                  <p className="text-sm">{getReserveMessage(reserve)}</p>

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
