'use client';

// --- Importações de Bibliotecas e Componentes ---
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';
import { Mail } from 'lucide-react';

// Componentes de UI
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Contextos e Outros Módulos
import { Role } from '../NavBarPrivate/navbar-private';
import { useReport } from '@/context/ReportContext';

// --- Ações de API (Server Actions) ---
import { getReports, getReserves } from '../DashboardViewReserves/action';
import { updateReserve } from '../DashboardManageReserve/action';

// --- Interfaces ---
interface Reserves {
  id: string;
  type_Reserve: string;
  answeredBy?: string;
  comments?: string;
  status: string;
  occurrence: string;
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
  } | null;
  classroom: {
    course: string;
    matter: string;
  } | null;
  event: {
    name: string;
    description: string;
    location: string;
  } | null;
}

interface Reports {
  id: string;
  nameUser: string;
  peopleAppear: string;
  requestedEquipment: string;
  generalComments: string;
  courtCondition: string;
  equipmentCondition: string;
  commentsAdmin: string;
  statusReadAdmin: boolean;
  timeUsed: string;
  dateUsed: string;
  sportId: string;
  sport: {
    reserve: {
      userId: string;
    };
  }; // Adicionado para filtro por usuário
}

interface JwtPayload {
  id: string;
  role: string;
}

// --- Componente Principal ---
export default function DashboardViewReserves() {
  // --- Estados do Componente ---
  const [reserves, setReserves] = useState<Reserves[]>([]);
  const [selectedTab, setSelectedTab] = useState('all');
  const [selectedReserve, setSelectedReserve] = useState<Reserves | null>(null);
  const [reports, setReports] = useState<Reports[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Reports | null>(null);
  const [userRole, setUserRole] = useState<Role | null>();
  const { setReportData } = useReport();
  const [userId, setUserId] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [reportFilterStatus, setReportFilterStatus] = useState('all'); // Novo estado para filtro de relatórios

  // Estados para edição de relatório
  const [isEditingReport, setIsEditingReport] = useState(false);
  const [editedReport, setEditedReport] = useState<any>({});

  const router = useRouter();

  // --- Funções de Inicialização e Busca de Dados ---
  const getRoleAndToken = () => {
    setIsLoading(true);
    try {
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!storedToken) {
        setIsLoading(false);
        return;
      }
      setToken(storedToken);
      const decoded = jwtDecode<JwtPayload>(storedToken);
      console.log(decoded);
      setUserRole(decoded.role as Role);
      setUserId(decoded.id);
    } catch (error: any) {
      console.error('Error decoding token:', error);
      toast.error(error.message || 'Erro ao decodificar token. Sessão inválida.');
      localStorage.removeItem('token');
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Busca todas as reservas do usuário logado
  const getAllReserves = async () => {
    if (!token) {
      console.warn('Token ausente, não foi possível buscar reservas.');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('token', token);
      formData.append('userId', userId); // Filtra por ID do usuário logado
      const data = await getReserves(formData);
      if (data && data.error) {
        toast.error(data.error);
        console.error('Erro ao buscar reservas:', data.error);
        setReserves([]);
      } else {
        setReserves(data);
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro desconhecido ao buscar reservas');
      console.error('Erro ao buscar reservas:', error);
    }
  };

  // Busca todos os relatórios do usuário logado
  const getAllReports = async () => {
    if (!token || !userId) {
      // Verifica tanto o token quanto o userId
      console.warn('Token ou ID do usuário ausente, não foi possível buscar relatórios.');
      setReports([]);
      return;
    }
    try {
      const formData = new FormData();
      formData.append('token', token);
      formData.append('userId', userId);
      const data = await getReports(formData);
      if (data?.error) {
        toast.error(data.error);
        console.error('Erro ao buscar relatórios:', data.error);
        setReports([]);
      } else {
        setReports(Array.isArray(data) ? data : []);
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro desconhecido ao buscar relatórios');
      console.error('Error ao buscar relatórios', error);
    }
  };

  // --- Funções Auxiliares / Utilitárias ---
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

  const formatDateLocal = (dateString: string) => {
    if (!dateString) return '';

    try {
      // Se a data vem como 'YYYY-MM-DD' sem timezone
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        // Adiciona o timezone local
        const date = new Date(`${dateString}T00:00:00`);
        return date.toLocaleDateString('pt-BR');
      }

      // Se já vem com timestamp
      const date = new Date(dateString);

      // Corrige o offset do timezone
      const correctedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);

      return correctedDate.toLocaleDateString('pt-BR');
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return dateString;
    }
  };

  const disabledInputClass =
    'disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed';

  // --- Handlers de Interação do Usuário (Reservas) ---
  const handleSaveChanges = async () => {
    if (!token) {
      toast.error('Token de autenticação ausente. Faça login novamente.');
      return;
    }
    try {
      const response = await updateReserve(
        selectedReserve?.id as string,
        'reserve-sport', // Assumindo que é sempre esporte para simplificar
        JSON.stringify(editedData),
        token
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

  const handleInputChange = (field: string, value: string) => {
    setEditedData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleReportForm = () => {
    if (!editedData || !token) {
      toast.error('Dados de reserva ou token ausente para gerar relatório.');
      return;
    }

    const calculateTimeUsed = () => {
      const start = new Date(editedData.dateTimeStart);
      const end = new Date(editedData.dateTimeEnd);
      const diffMs = end.getTime() - start.getTime();
      const diffMins = Math.round(diffMs / 60000);
      const hours = Math.floor(diffMins / 60);
      const minutes = diffMins % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    };

    setReportData({
      sportId: editedData.sport?.id || '',
      date: formatDateTime(editedData.dateTimeStart),
      timeUsed: calculateTimeUsed(),
      userName: editedData.user.name,
    });

    router.push('/report');
  };

  // --- Funções de Renderização Específicas / Botões Condicionais ---
  const CompareHours = () => {
    const hourEnd = new Date(selectedReserve?.dateTimeEnd || '');
    const hourNow = new Date();

    if (hourNow > hourEnd) {
      if (
        selectedReserve?.sport &&
        selectedReserve?.user.id === userId &&
        selectedReserve.status === 'CONFIRMADA'
      ) {
        return (
          <Button
            variant="outline"
            className="bg-[#2C2C2C] text-white"
            onClick={handleReportForm}>
            Enviar Relatório
          </Button>
        );
      }
    } else if (
      selectedReserve?.sport &&
      selectedReserve?.user.id === userId &&
      selectedReserve.status === 'CONFIRMADA'
    ) {
      return (
        <Button
          variant="outline"
          disabled
          className={disabledInputClass}>
          Enviar Relatório
        </Button>
      );
    }
    return null;
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
      selectedReserve?.status?.toLowerCase() === 'cadastrado' ||
      selectedReserve?.status?.toLowerCase() === 'confirmada'
    ) {
      return (
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsEditing(true)}>
            Editar
          </Button>
          <CompareHours />
        </div>
      );
    }
    return <CompareHours />;
  };

  // --- Lógica de Mensagens para Exibição ---
  const getReserveMessage = (reserve: Reserves) => {
    return `Reserva Solicitada por ${reserve.user.name}`;
  };

  const getReportMessage = (report: Reports) => {
    return `Relatório de uso - ${formatDateLocal(report.dateUsed)}`;
  };

  // --- Efeitos Colaterais (useEffect) ---
  useEffect(() => {
    getRoleAndToken();
  }, []);

  useEffect(() => {
    if (token && userId) {
      // Só executa se ambos existirem
      getAllReserves();
      getAllReports();
    }
  }, [token, userId]); // Adicione userId como dependência

  useEffect(() => {
    if (selectedReserve) {
      setEditedData({
        ...selectedReserve,
        ...(selectedReserve.sport || {}),
        ...(selectedReserve.classroom || {}),
        ...(selectedReserve.event || {}),
      });
      setSelectedReport(null);
    }
  }, [selectedReserve]);

  useEffect(() => {
    if (selectedReport) {
      setEditedReport({
        peopleAppear: selectedReport.peopleAppear,
        requestedEquipment: selectedReport.requestedEquipment,
        generalComments: selectedReport.generalComments,
        courtCondition: selectedReport.courtCondition,
        equipmentCondition: selectedReport.equipmentCondition,
      });
      setSelectedReserve(null);
    }
  }, [selectedReport]);

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p>Carregando informações do usuário...</p>
        </div>
      </div>
    );
  }

  // --- Lógica de Filtro ---
  const filteredReserves = reserves.filter((reserve) => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'RECREACAO') return reserve.sport?.typePractice === 'RECREACAO';
    if (selectedTab === 'TREINO') return reserve.sport?.typePractice === 'TREINO';
    if (selectedTab === 'AMISTOSO') return reserve.sport?.typePractice === 'AMISTOSO';
    return false;
  });

  const filteredReports = reports.filter((report) => {
    if (selectedTab !== 'Relatório') return false;

    if (reportFilterStatus === 'all') return true;
    if (reportFilterStatus === 'validated') return report.statusReadAdmin === true;
    if (reportFilterStatus === 'pending') return report.statusReadAdmin === false;

    return false;
  });

  // --- Funções de Renderização de Detalhes (Sub-componentes) ---
  const renderReportDetails = () => {
    if (!selectedReport) {
      if (selectedReserve) return null;

      return (
        <div className="w-full bg-white md:w-1/2 border rounded-md p-8 flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-24 h-24 flex items-center justify-center">
            <Mail className="w-16 h-16" />
          </div>
          <p className="mt-4 text-lg font-medium">Selecione um item</p>
        </div>
      );
    }

    const canEditReport = userId === selectedReport.sport?.reserve?.userId;

    return (
      <div className="w-full bg-white md:w-1/2 border rounded-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Detalhes do Relatório</h2>
          <div className="flex gap-2">
            {isEditingReport ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsEditingReport(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    // Implementar lógica de atualização do relatório aqui
                    setIsEditingReport(false);
                    toast.success('Relatório atualizado com sucesso');
                  }}>
                  Salvar
                </Button>
              </>
            ) : (
              <>
                {canEditReport && (
                  <Button
                    variant="outline"
                    onClick={() => setIsEditingReport(true)}>
                    Editar
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

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
                  value={formatDateLocal(selectedReport.dateUsed)}
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
                  value={
                    isEditingReport ? editedReport.peopleAppear || '' : selectedReport.peopleAppear
                  }
                  onChange={(e) =>
                    setEditedReport({ ...editedReport, peopleAppear: e.target.value })
                  }
                  disabled={!isEditingReport}
                  className={disabledInputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Equipamentos Solicitados</label>
                <Input
                  value={
                    isEditingReport
                      ? editedReport.requestedEquipment || ''
                      : selectedReport.requestedEquipment
                  }
                  onChange={(e) =>
                    setEditedReport({ ...editedReport, requestedEquipment: e.target.value })
                  }
                  disabled={!isEditingReport}
                  className={disabledInputClass}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Condição da Quadra</label>
                <Textarea
                  value={
                    isEditingReport
                      ? editedReport.courtCondition || ''
                      : selectedReport.courtCondition
                  }
                  onChange={(e) =>
                    setEditedReport({ ...editedReport, courtCondition: e.target.value })
                  }
                  disabled={!isEditingReport}
                  className={disabledInputClass}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Condição dos Equipamentos</label>
                <Textarea
                  value={
                    isEditingReport
                      ? editedReport.equipmentCondition || ''
                      : selectedReport.equipmentCondition
                  }
                  onChange={(e) =>
                    setEditedReport({ ...editedReport, equipmentCondition: e.target.value })
                  }
                  disabled={!isEditingReport}
                  className={disabledInputClass}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Comentários Gerais</label>
                <Textarea
                  value={
                    isEditingReport
                      ? editedReport.generalComments || ''
                      : selectedReport.generalComments
                  }
                  onChange={(e) =>
                    setEditedReport({ ...editedReport, generalComments: e.target.value })
                  }
                  disabled={!isEditingReport}
                  className={disabledInputClass}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Comentários do Administrador
                </label>
                <Textarea
                  value={selectedReport.commentsAdmin}
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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Detalhes da Reserva</h2>
          {renderActionButtons()}
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Informações Básicas</h3>
            <div className="space-y-2 mt-2">
              <div className="flex gap-5">
                <div className="w-full">
                  <label className="block text-sm font-medium mb-1">ID</label>
                  <Input
                    value={selectedReserve.id}
                    disabled
                    className={disabledInputClass}
                  />
                </div>
                <div className="w-full">
                  <label className="block text-sm font-medium mb-1">Solicitante</label>
                  <Input
                    value={selectedReserve.user.name}
                    disabled
                    className={disabledInputClass}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                {editedData.participants && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Participantes</label>
                    <Textarea
                      value={editedData.participants || ''}
                      onChange={(e) => handleInputChange('participants', e.target.value)}
                      disabled={!isEditing}
                      className={disabledInputClass}
                    />
                  </div>
                )}
                {editedData.requestEquipment && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      Equipamentos solicitados
                    </label>
                    <Input
                      value={editedData.requestEquipment || ''}
                      onChange={(e) => handleInputChange('requestEquipment', e.target.value)}
                      disabled={!isEditing}
                      className={disabledInputClass}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
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

              {selectedReserve.status === 'RECUSADA' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Comentários (Recusa)</label>
                  <Textarea
                    value={editedData.comments}
                    disabled
                    className={disabledInputClass}
                  />
                </div>
              )}
              {selectedReserve.answeredBy && (
                <div>
                  <label className="block text-sm font-medium mb-1">Atualizado por:</label>
                  <Input
                    type="text"
                    value={editedData.answeredBy}
                    disabled
                    className={disabledInputClass}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- JSX Principal ---
  return (
    <div className="container mx-auto p-4">
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-50">
          <div className="flex flex-col items-center gap-2">
            <div className="h-10 w-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600">Carregando...</span>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/2">
          <Tabs
            defaultValue="all"
            onValueChange={(value) => {
              setSelectedTab(value);
              setSelectedReserve(null);
              setSelectedReport(null);
              setReportFilterStatus('all');
            }}
            className="mb-4">
            <TabsList className="flex w-full overflow-x-auto">
              {' '}
              {/* Adicione flex e overflow-x-auto */}
              <div className="flex space-x-1">
                {' '}
                {/* Container interno para os TabsTriggers */}
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="RECREACAO">Recreação</TabsTrigger>
                <TabsTrigger value="TREINO">Treino</TabsTrigger>
                <TabsTrigger value="AMISTOSO">Amistoso</TabsTrigger>
                <TabsTrigger value="Relatório">Relatório</TabsTrigger>
              </div>
            </TabsList>
          </Tabs>

          {selectedTab === 'Relatório' && (
            <div className="mb-4">
              <Select
                value={reportFilterStatus}
                onValueChange={setReportFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Relatórios</SelectItem>
                  <SelectItem value="validated">Validados</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div
            className="space-y-2 p-2 overflow-y-auto pr-2"
            style={{ maxHeight: '70vh' }}>
            {filteredReserves.length === 0 &&
              filteredReports.length === 0 &&
              selectedTab !== 'Relatório' && (
                <Card className="p-4 bg-gray-100">
                  <div>
                    <h3 className="font-bold text-sm">Nenhuma reserva encontrada</h3>
                    <p className="text-sm">
                      Não há reservas para o filtro selecionado ou tipo de prática.
                    </p>
                  </div>
                </Card>
              )}

            {selectedTab === 'Relatório' && filteredReports.length === 0 && (
              <Card className="p-4 bg-gray-100">
                <div>
                  <h3 className="font-bold text-sm">Nenhum relatório encontrado</h3>
                  <p className="text-sm">Não há relatórios para o filtro de status selecionado.</p>
                </div>
              </Card>
            )}

            {selectedTab !== 'Relatório' &&
              filteredReserves.map((reserve) => (
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
                      {reserve.sport?.typePractice &&
                        `Reserva ${reserve.status ? 'Solicitada' : ''}`}
                    </h3>
                    <p className="text-sm">{getReserveMessage(reserve)}</p>
                    <p className="text-xs mt-1">
                      {formatDateTime(reserve.dateTimeStart)} -{' '}
                      {formatDateTime(reserve.dateTimeEnd)}
                    </p>
                  </div>
                  {reserve.status && (
                    <div className="absolute top-4 right-4">{renderStatus(reserve.status)}</div>
                  )}
                </Card>
              ))}

            {selectedTab === 'Relatório' &&
              filteredReports.map((report) => (
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
                  <div className="absolute top-4 right-4">
                    {report.statusReadAdmin ? (
                      <span className="text-green-500 text-sm">Validado</span>
                    ) : (
                      <span className="text-yellow-500 text-sm">Pendente</span>
                    )}
                  </div>
                </Card>
              ))}
          </div>
        </div>

        {selectedReserve ? renderReserveDetails() : renderReportDetails()}
      </div>
    </div>
  );
}
