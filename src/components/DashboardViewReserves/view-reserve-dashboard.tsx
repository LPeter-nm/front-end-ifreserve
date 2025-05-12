import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getReports, getReserves } from './action';
import toast from 'react-hot-toast';

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
  const [comment, setComment] = useState('');

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

  const renderReserveDetails = () => {
    if (!selectedReserve) {
      return (
        <div className="w-full md:w-1/2 border rounded-md p-8 flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-24 h-24 flex items-center justify-center">
            <Mail className="w-16 h-16" />
          </div>
          <p className="mt-4 text-lg font-medium">Selecione um item</p>
        </div>
      );
    }

    return (
      <div className="w-full md:w-1/2 border rounded-md p-6">
        <h2 className="text-xl font-bold mb-4">Detalhes da Reserva</h2>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Informações Básicas</h3>
            <p>ID: {selectedReserve.id}</p>
            <p>Solicitante: {selectedReserve.user.name}</p>
            <p>Início: {formatDateTime(selectedReserve.dateTimeStart)}</p>
            <p>Término: {formatDateTime(selectedReserve.dateTimeEnd)}</p>
          </div>

          {selectedReserve.classroom && (
            <div>
              <h3 className="font-semibold">Detalhes de Aula</h3>
              <p>Matéria: {selectedReserve.classroom.matter}</p>
              <p>Curso: {selectedReserve.classroom.course}</p>
            </div>
          )}

          {selectedReserve.event && (
            <div>
              <h3 className="font-semibold">Detalhes do Evento</h3>
              <p>Nome: {selectedReserve.event.name}</p>
              <p>Local: {selectedReserve.event.location}</p>
            </div>
          )}
        </div>
      </div>
    );
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
