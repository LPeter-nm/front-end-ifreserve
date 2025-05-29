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
// Importa as Server Actions do arquivo './action' do DashboardManageReserve
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
  statusReadAdmin: boolean;
  timeUsed: string;
  dateUsed: string;
  sportId: string;
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
  const [token, setToken] = useState<string | null>(null); // Estado para armazenar o token

  // --- Estados para Edição de Relatório (Corrigido) ---
  // Esses estados foram adicionados aqui para permitir a edição de relatórios.
  const [isEditingReport, setIsEditingReport] = useState(false);
  const [editedReport, setEditedReport] = useState<any>({});

  const router = useRouter();

  // --- Função de Carregamento Global (UI) ---
  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-50">
        <div className="flex flex-col items-center gap-2">
          <div className="h-10 w-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Carregando...</span>
        </div>
      </div>
    );
  }

  // --- Funções de Inicialização e Busca de Dados ---
  // Obtém o token e o papel/ID do usuário na montagem do componente.
  const getRoleAndToken = () => {
    setIsLoading(true);
    try {
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!storedToken) {
        setIsLoading(false);
        // router.push('/login'); toast.error('Sessão expirada. Faça login novamente.');
        return;
      }
      setToken(storedToken);
      const decoded = jwtDecode<JwtPayload>(storedToken);
      setUserRole(decoded.role as Role);
      setUserId(decoded.id);
    } catch (error: any) {
      console.error('Error decoding token:', error);
      toast.error(error.message || 'Erro ao decodificar token. Sessão inválida.');
      localStorage.removeItem('token');
      setToken(null);
      // router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  // Busca todas as reservas usando a Server Action `getReserves`.
  const getAllReserves = async () => {
    if (!token) {
      console.warn('Token ausente, não foi possível buscar reservas.');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('token', token);
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

  // Busca todos os relatórios usando a Server Action `getReports`.
  // Adaptei para ser chamado APENAS quando há um `selectedReserve`
  // e o usuário é admin, para buscar relatórios específicos daquela reserva.
  const getAllReports = async () => {
    if (!token || !selectedReserve?.user.id) {
      console.warn(
        'Token ou ID do usuário da reserva ausente, não foi possível buscar relatórios.'
      );
      setReports([]); // Garante que relatórios sejam limpos se as dependências não forem atendidas.
      return;
    }
    try {
      const formData = new FormData();
      formData.append('token', token);
      formData.append('id', selectedReserve.user.id); // Passa o ID do usuário da reserva selecionada
      const data = await getReports(formData);
      if (data && data.error) {
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

  // --- Handlers de Interação do Usuário (Reservas) ---
  const handleSaveChanges = async () => {
    if (!token) {
      toast.error('Token de autenticação ausente. Faça login novamente.');
      return;
    }
    try {
      const dataToSend = {
        ...editedData,
        dateTimeStart: formatDateForBackend(editedData.dateTimeStart),
        dateTimeEnd: formatDateForBackend(editedData.dateTimeEnd),
      };

      // Passa o token como argumento explícito para a Server Action `updateReserve`
      const response = await updateReserve(
        selectedReserve?.id as string,
        getRoute(),
        JSON.stringify(dataToSend), // Server Action espera string JSON
        token // Passando o token aqui
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

  // --- Handlers de Interação do Usuário (Relatórios) ---
  const handleViewReport = (report: Reports) => {
    // Redireciona para a página de relatório, passando o ID do esporte.
    router.push(`/report/${report.sportId}`);
  };

  const handleReportForm = () => {
    if (!editedData || !token) {
      toast.error('Dados de reserva ou token ausente para gerar relatório.');
      return;
    }

    // Calcula o tempo de uso da reserva para o relatório.
    const calculateTimeUsed = () => {
      const start = new Date(editedData.dateTimeStart);
      const end = new Date(editedData.dateTimeEnd);
      const diffMs = end.getTime() - start.getTime();
      const diffMins = Math.round(diffMs / 60000);
      const hours = Math.floor(diffMins / 60);
      const minutes = diffMins % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    };

    // Armazena os dados no contexto antes de navegar.
    setReportData({
      sportId: editedData.sport?.id || '',
      date: formatDateTime(editedData.dateTimeStart), // Use formatDateTime para exibir a data
      timeUsed: calculateTimeUsed(),
      userName: editedData.user.name,
    });

    router.push('/report'); // Redireciona para a página de relatório.
  };

  // --- Funções de Renderização Específicas / Botões Condicionais ---
  const CompareHours = () => {
    const hourEnd = new Date(selectedReserve?.dateTimeEnd || '');
    const hourNow = new Date();

    if (hourNow > hourEnd) {
      // Lógica para usuários comuns enviarem relatório
      if (
        selectedReserve?.sport && // Verifica se é uma reserva de esporte
        selectedReserve?.user.id === userId && // Verifica se o usuário logado é o solicitante
        selectedReserve.status === 'CONFIRMADA' // Verifica se a reserva está confirmada
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
      // Lógica para admins visualizarem relatório existente
      else if (
        (userRole === 'PE_ADMIN' || userRole === 'SISTEMA_ADMIN') &&
        selectedReserve?.sport
      ) {
        const hasReport = reports.some((report) => report.sportId === selectedReserve?.sport?.id);
        if (hasReport) {
          const report = reports.find((report) => report.sportId === selectedReserve?.sport?.id);
          return (
            <Button
              variant="outline"
              onClick={() => {
                setSelectedReport(report as Reports); // Define o relatório selecionado
                setSelectedReserve(null); // Limpa a reserva selecionada para exibir detalhes do relatório
              }}>
              Visualizar Relatório
            </Button>
          );
        }
      }
    } else if (
      selectedReserve?.sport && // Verifica se é uma reserva de esporte
      selectedReserve?.user.id === userId && // Verifica se o usuário logado é o solicitante
      selectedReserve.status === 'CONFIRMADA' // Verifica se a reserva está confirmada
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
    return null; // Não renderiza botão se as condições não forem atendidas
  };

  const renderActionButtons = () => {
    // Buttons de Editar/Salvar/Remover
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
          {/* Adiciona o botão de relatório/visualizar relatório aqui, se aplicável */}
          <CompareHours />
        </div>
      );
    }
    // Se não estiver editando e a reserva não for 'pendente', 'cadastrado' ou 'confirmada',
    // ainda pode haver um botão de relatório (e.g., para reservas já passadas).
    return <CompareHours />;
  };

  // --- Lógica de Mensagens para Exibição ---
  const getReserveMessage = (reserve: Reserves) => {
    return `Reserva Solicitada por ${reserve.user.name}`;
  };

  const getReportMessage = (report: Reports) => {
    return `Relatório de uso - ${report.dateUsed}`;
  };

  // --- Efeitos Colaterais (useEffect) ---
  // 1. Efeito para obter o token, o papel do usuário e o ID na montagem do componente.
  useEffect(() => {
    getRoleAndToken();
  }, []); // Executa apenas uma vez ao montar.

  // 2. Efeito para buscar dados de reservas e relatórios quando o token está disponível.
  useEffect(() => {
    if (token) {
      // Só chama as funções de busca se o token estiver disponível
      getAllReserves();
      // getAllReports é chamado no terceiro useEffect, quando uma reserva é selecionada
    }
  }, [token]); // Depende do estado `token`

  // 3. Efeito para buscar relatórios APENAS quando uma reserva é selecionada E o usuário é admin.
  // Isso evita buscar todos os relatórios desnecessariamente.
  useEffect(() => {
    if (selectedReserve && (userRole === 'PE_ADMIN' || userRole === 'SISTEMA_ADMIN')) {
      getAllReports(); // Busca relatórios relacionados à reserva selecionada
    } else {
      // Limpa os relatórios se nenhuma reserva estiver selecionada ou se não for admin
      setReports([]);
    }
  }, [selectedReserve, userRole, token]); // Depende da reserva, role e token

  // 4. Efeito para atualizar `editedData` quando uma reserva é selecionada.
  useEffect(() => {
    if (selectedReserve) {
      setEditedData({
        ...selectedReserve,
        ...(selectedReserve.sport || {}),
        ...(selectedReserve.classroom || {}),
        ...(selectedReserve.event || {}),
      });
      // Ao selecionar uma reserva, limpa o relatório selecionado para evitar inconsistência.
      setSelectedReport(null);
    }
  }, [selectedReserve]);

  // 5. Efeito para atualizar `editedReport` quando um relatório é selecionado.
  useEffect(() => {
    if (selectedReport) {
      setEditedReport({
        peopleAppear: selectedReport.peopleAppear,
        requestedEquipment: selectedReport.requestedEquipment,
        description: selectedReport.generalComments, // Usando generalComments para consistência
        courtCondition: selectedReport.courtCondition,
        equipmentCondition: selectedReport.equipmentCondition,
      });
      // Ao selecionar um relatório, limpa a reserva selecionada para evitar inconsistência.
      setSelectedReserve(null);
    }
  }, [selectedReport]);

  // --- Lógica de Filtro ---
  const filteredReserves = reserves.filter((reserve) => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'RECREACAO') return reserve.sport?.typePractice === 'RECREACAO';
    if (selectedTab === 'TREINO') return reserve.sport?.typePractice === 'TREINO';
    if (selectedTab === 'AMISTOSO') return reserve.sport?.typePractice === 'AMISTOSO';
    // Notas: 'aula', 'evento', 'Relatório' não estão nas TabsList para este componente,
    // então a lógica foi simplificada para refletir apenas os filtros de esporte.
    return true;
  });

  const filteredReports = reports.filter((report) => {
    if (selectedTab === 'all') return true;
    // Se o tab 'Relatório' for adicionado, a lógica aqui precisaria ser ajustada.
    // Por enquanto, todos os relatórios são mostrados em 'all' e nos tabs de esporte (sem filtro específico de relatório).
    return true; // Retorna todos os relatórios
  });

  // --- Funções de Renderização de Detalhes (Sub-componentes) ---
  const renderReportDetails = () => {
    if (!selectedReport) {
      if (selectedReserve) return null; // Não renderiza se uma reserva estiver selecionada.

      return (
        <div className="w-full bg-white md:w-1/2 border rounded-md p-8 flex flex-col items-center justify-center min-h-[300px]">
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
                  value={selectedReport.generalComments} // Mantido como generalComments aqui
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
      return renderReportDetails(); // Se nenhuma reserva estiver selecionada, tenta renderizar detalhes do relatório.
    }

    return (
      <div className="w-full bg-white md:w-1/2 border rounded-md p-6">
        <h2 className="text-xl font-bold mb-4">Detalhes da Reserva</h2>

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
          {renderActionButtons()}
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
            }}
            className="mb-4">
            <TabsList className="grid grid-cols-4 w-full">
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
