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
import { updateReserve } from '../CalendarEventWeek/action';
import { Role } from '../NavBarPrivate/navbar-private';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { Textarea } from '../ui/textarea';
import { useReport } from '@/context/ReportContext';

interface Reserves {
  id: string;
  type_Reserve: string;
  comments: string;
  status: string;
  ocurrence: string;
  dateTimeStart: Date;
  dateTimeEnd: Date;
  user: {
    id: string;
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
  nameUser: string;
  peopleAppear: string;
  requestedEquipment: string;
  generalComments: string;
  courtCondition: string;
  equipmentCondition: string;
  statusReadAdmin: boolean;
  timeUsed: string;
  dateUsed: string;
  sportId: string;
}

interface JwtPayload {
  id: string;
  role: string;
}

export default function DashboardViewReserves() {
  const [reserves, setReserves] = useState<Reserves[]>([]);
  const [selectedTab, setSelectedTab] = useState('all');
  const [selectedReserve, setSelectedReserve] = useState<Reserves | null>(null);
  const [reports, setReports] = useState<Reports[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Reports | null>(null);
  const [Role, setRole] = useState<Role | null>();
  const { reportData, setReportData } = useReport();
  const [userId, setUserId] = useState('');

  const router = useRouter();

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
      formData.append('id', selectedReserve?.user.id || '');
      const data = await getReports(formData);
      setReports(Array.isArray(data) ? data : []); // Garante que seja um array
    } catch (error: any) {
      toast.error(error.message);
      console.error('Error ao buscar relatórios', error);
      setReports([]); // Em caso de erro, define como array vazio
    }
  };

  const getRoute = () => {
    if (selectedReserve?.sport) return 'reserve-sport';
    if (selectedReserve?.classroom) return 'reserve-classroom';
    if (selectedReserve?.event) return 'reserve-event';
    return 'reserves';
  };

  const formatDateForBackend = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year}, ${hours}:${minutes}`;
  };

  const handleSaveChanges = async () => {
    try {
      const dataToSend = {
        ...editedData,
        dateTimeStart: formatDateForBackend(editedData.dateTimeStart),
        dateTimeEnd: formatDateForBackend(editedData.dateTimeEnd),
      };

      const response = await updateReserve(
        selectedReserve?.id as string,
        getRoute(),
        JSON.stringify(dataToSend)
      );

      if (response.success) {
        toast.success('Alterações salvas com sucesso');
        setIsEditing(false);
        await getAllReserves();
      } else {
        toast.error(response.error || 'Erro ao salvar alterações');
      }
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

  useEffect(() => {
    getAllReserves();
    getAllReports();
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setIsLoading(false);
        return;
      }

      const decoded = jwtDecode<JwtPayload>(token);
      setRole(decoded.role as Role);
      setUserId(decoded.id);
    } catch (error: any) {
      console.error('Error decoding token:', error);
      toast.error(error.message);
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
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
        <div className="flex gap-5">
          <Button
            variant="outline"
            onClick={() => setIsEditing(true)}>
            Editar
          </Button>
        </div>
      );
    }
    return <CompareHours />;
  };

  const filteredReserves = reserves.filter((reserve) => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'RECREACAO') return reserve.sport?.typePractice === 'RECREACAO';
    if (selectedTab === 'TREINO') return reserve.sport?.typePractice === 'TREINO';
    if (selectedTab === 'AMISTOSO') return reserve.sport?.typePractice === 'AMISTOSO';
    return true;
  });

  const filteredReports = reports.filter((report) => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'RECREACAO' || selectedTab === 'TREINO' || selectedTab === 'AMISTOSO') {
      return true;
    }
    return false;
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

  const renderReportDetails = () => {
    if (!selectedReport) {
      if (selectedReserve) return null;

      return (
        <div className="w-full bg-white md:w-1/2 border rounded-md p-8 flex flex-col items-center justify-center min-h-[600px]">
          <div className="w-24 h-24 flex items-center justify-center">
            <Mail className="w-16 h-16" />
          </div>
          <p className="mt-4 text-lg font-medium">Selecione um item</p>
        </div>
      );
    }

    return (
      <div className="w-full bg-white md:w-1/2 border rounded-md p-6">
        <h2 className="text-xl font-bold mb-4">Detalhes do Relatório</h2>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Informações Básicas</h3>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <label className="block text-sm font-medium mb-1">ID</label>
                <Input
                  value={selectedReport.id}
                  disabled
                  className={disabledInputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Responsável</label>
                <Input
                  value={selectedReport.nameUser}
                  disabled
                  className={disabledInputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Data de Uso</label>
                <Input
                  value={selectedReport.dateUsed}
                  disabled
                  className={disabledInputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tempo de Uso</label>
                <Input
                  value={selectedReport.timeUsed}
                  disabled
                  className={disabledInputClass}
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold">Detalhes do Relatório</h3>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <label className="block text-sm font-medium mb-1">Pessoas Presentes</label>
                <Input
                  value={selectedReport.peopleAppear}
                  disabled
                  className={disabledInputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Equipamentos Solicitados</label>
                <Input
                  value={selectedReport.requestedEquipment}
                  disabled
                  className={disabledInputClass}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Condição da Quadra</label>
                <Textarea
                  value={selectedReport.courtCondition}
                  disabled
                  className={disabledInputClass}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Condição dos Equipamentos</label>
                <Textarea
                  value={selectedReport.equipmentCondition}
                  disabled
                  className={disabledInputClass}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Comentários Gerais</label>
                <Textarea
                  value={selectedReport.generalComments}
                  disabled
                  className={disabledInputClass}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderReserveDetails = () => {
    if (!selectedReserve) {
      return renderReportDetails();
    }

    return (
      <div className="w-full bg-white md:w-1/2 border rounded-md p-6">
        <h2 className="text-xl font-bold mb-4">Detalhes da Reserva</h2>

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
              <div className="flex justify-between">
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
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Participantes</label>
                <Textarea
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

              <div className="flex justify-between">
                <div>
                  <label className="block text-sm font-medium mb-1">Início</label>
                  <Input
                    type="datetime-local"
                    value={formatDateTimeForInput(editedData.dateTimeStart)}
                    onChange={(e) => handleInputChange('dateTimeStart', e.target.value)}
                    disabled={!isEditing}
                    className={disabledInputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Término</label>
                  <Input
                    type="datetime-local"
                    value={formatDateTimeForInput(editedData.dateTimeEnd)}
                    onChange={(e) => handleInputChange('dateTimeEnd', e.target.value)}
                    disabled={!isEditing}
                    className={disabledInputClass}
                  />
                </div>
              </div>
            </div>
          </div>
          {renderActionButtons()}
        </div>
      </div>
    );
  };

  function ReportButton() {
    return (
      <Button
        variant="outline"
        onClick={() => handleViewReport(selectedReport as Reports)}>
        Visualizar Relatório
      </Button>
    );
  }

  const handleViewReport = (report: Reports) => {
    router.push(`/report/${report.sportId}`);
  };

  const handleReportForm = () => {
    if (!editedData) return;

    const calculateTimeUsed = () => {
      const start = new Date(editedData.dateTimeStart);
      const end = new Date(editedData.dateTimeEnd);
      const diffMs = end.getTime() - start.getTime();
      const diffMins = Math.round(diffMs / 60000);
      const hours = Math.floor(diffMins / 60);
      const minutes = diffMins % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    };

    // Armazena os dados no contexto antes de navegar
    setReportData({
      sportId: editedData.sport?.id || '',
      date: formatDateTime(editedData.dateTimeStart),
      timeUsed: calculateTimeUsed(),
      userName: editedData.user.name,
    });

    router.push('/report');
  };

  function CompareHours() {
    const hourEnd = new Date(selectedReserve?.dateTimeEnd || '');
    const hourNow = new Date();

    if (hourNow > hourEnd) {
      if (Role === 'USER' && selectedReserve?.sport && selectedReserve?.user.id === userId) {
        return (
          <Button
            variant="outline"
            className="bg-[#2C2C2C] text-white"
            onClick={handleReportForm}>
            Enviar Relatório
          </Button>
        );
      } else if ((Role === 'PE_ADMIN' || Role === 'SISTEMA_ADMIN') && selectedReserve?.sport) {
        // Verificar se existe um relatório para esta reserva
        const hasReport = reports.some((report) => report.sportId === selectedReserve?.sport?.id);
        if (hasReport) {
          const report = reports.find((report) => report.sportId === selectedReserve?.sport?.id);
          return (
            <Button
              variant="outline"
              onClick={() => {
                setSelectedReport(report as Reports);
                setSelectedReserve(null);
              }}>
              Visualizar Relatório
            </Button>
          );
        }
      }
    }
    return null;
  }

  const getReserveMessage = (reserve: Reserves) => {
    return `Reserva Solicitada por ${reserve.user.name}`;
  };

  const getReportMessage = (report: Reports) => {
    return `Relatório de uso - ${report.dateUsed}`;
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
            {filteredReserves.length === 0 && filteredReports.length === 0 && (
              <Card className="p-4 bg-gray-100">
                <div>
                  <h3 className="font-bold text-sm">Nenhum item encontrado</h3>
                  <p className="text-sm">Não há reservas ou relatórios para o filtro selecionado</p>
                </div>
              </Card>
            )}

            {/* Mostrar reservas */}
            {filteredReserves.map((reserve) => (
              <Card
                key={`reserve-${reserve.id}`}
                className={`p-4 bg-gray-100 relative cursor-pointer hover:bg-gray-200 ${
                  selectedReserve?.id === reserve.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => {
                  setSelectedReserve(reserve);
                  setSelectedReport(null);
                }}>
                <div>
                  <h3 className="font-bold text-sm">
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

            {/* Mostrar relatórios */}
            {filteredReports.map((report) => (
              <Card
                key={`report-${report.id}`}
                className={`p-4 bg-blue-50 relative cursor-pointer hover:bg-blue-100 ${
                  selectedReport?.id === report.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => {
                  setSelectedReport(report);
                  setSelectedReserve(null);
                }}>
                <div>
                  <h3 className="font-bold text-sm">Relatório de uso</h3>
                  <p className="text-sm">{getReportMessage(report)}</p>
                  <p className="text-xs mt-1">Tempo de uso: {report.timeUsed}</p>
                </div>
                <div className="absolute top-4 right-4 text-green-500 text-sm">
                  {report.statusReadAdmin ? 'Lido' : 'Não lido'}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {selectedReport ? renderReportDetails() : renderReserveDetails()}
      </div>
    </div>
  );
}
