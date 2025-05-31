'use client';

import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
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
import { jwtDecode } from 'jwt-decode';
import { Role } from '../NavBarPrivate/navbar-private';

// --- Ações de API (Server Actions) ---
import {
  confirmReserve,
  getReports,
  getReserves,
  refusedReserve,
  removeReserve,
  updateReport,
  validateReport,
  removeReport,
  updateReserve,
} from './action';

// --- Interfaces ---
interface Reserves {
  id: string;
  type_Reserve: string;
  status: string;
  comments: string;
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
    participants: string;
    numberParticipants?: string;
    requestEquipment?: string;
    report?: {};
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
  generalComments?: string;
  courtCondition: string;
  equipmentCondition: string;
  timeUsed: string;
  dateUsed: string;
  sportId: string;
  commentsAdmin: string;
  statusReadAdmin: boolean;
  sport: {
    reserve: {
      userId: string;
    };
  }; // Adicionado para a lógica de edição do relatório
}

interface JwtPayload {
  id: string;
  role: string;
}

// --- Componente Principal ---
export default function DashboardManageReserve() {
  // --- Estados do Componente ---
  const [reserves, setReserves] = useState<Reserves[]>([]);
  const [selectedTab, setSelectedTab] = useState('all');
  const [selectedReserve, setSelectedReserve] = useState<Reserves | null>(null);
  const [selectedReport, setSelectedReport] = useState<Reports | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [reports, setReports] = useState<Reports[]>([]);
  const [reserveComment, setReserveComment] = useState(''); // Renomeado para clareza
  const [reportAdminComment, setReportAdminComment] = useState(''); // Novo estado para comentário do admin no relatório
  const [isEditing, setIsEditing] = useState(false);
  const [userRole, setUserRole] = useState<Role | null>();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null); // Novo estado para armazenar o ID do usuário logado
  const [isEditingReport, setIsEditingReport] = useState(false);
  const [editedReport, setEditedReport] = useState<Partial<Reports>>({}); // Usando Partial para edição
  const [editedData, setEditedData] = useState<any>({});
  const [token, setToken] = useState<string | null>(null);
  const [reportFilterStatus, setReportFilterStatus] = useState('all'); // Novo estado para o filtro de status do relatório

  // --- Funções de Carregamento e Autenticação ---
  const getRoleAndToken = () => {
    setIsLoading(true);
    try {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setIsLoading(false);
        // router.push('/login'); toast.error('Sessão expirada'); // Deixado comentado como no original
        return;
      }
      setToken(storedToken);
      const decoded = jwtDecode<JwtPayload>(storedToken);
      setUserRole(decoded.role as Role);
      setCurrentUserId(decoded.id); // Armazena o ID do usuário logado
    } catch (error: any) {
      console.error('Error decoding token:', error);
      toast.error(error.message);
      localStorage.removeItem('token');
      setToken(null);
      // router.push('/login'); // Deixado comentado como no original
    } finally {
      setIsLoading(false);
    }
  };

  const getAllReserves = async () => {
    if (!token) return;
    try {
      const formData = new FormData();
      formData.append('token', token);
      const data = await getReserves(formData);
      if (data.error) {
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

  const getAllReports = async () => {
    if (!token) return;
    try {
      const formData = new FormData();
      formData.append('token', token);
      const data = await getReports(formData);
      if (data.error) {
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
      // Se a data vem no formato ISO sem timezone (YYYY-MM-DD)
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const date = new Date(dateString);
        // Ajusta para o timezone local sem alterar a data física
        const day = date.getUTCDate();
        const month = date.getUTCMonth() + 1;
        const year = date.getUTCFullYear();

        return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
      }

      // Se já vem com timestamp completo
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return dateString;
    }
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
      case 'cadastrado':
        return <span className="text-green-500 text-sm">Cadastrada</span>;
      default:
        return <span className="text-gray-400 text-sm">Status desconhecido</span>;
    }
  };

  const getReserveMessage = (reserve: Reserves) => {
    if (reserve.user.role === 'PE_ADMIN' || reserve.user.role === 'SISTEMA_ADMIN') {
      return `${reserve.type_Reserve} - Cadastrado por ${reserve.user?.name}`;
    } else if (reserve.user.role === 'USER') {
      return `${reserve.type_Reserve} - Solicitado por ${reserve.user?.name}`;
    }
    return reserve.type_Reserve;
  };

  const getReportMessage = (report: Reports) => {
    return `Relatório de uso - ${formatDateLocal(report.dateUsed)}`;
  };

  const disabledInputClass =
    'disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed';

  // --- Handlers de Interação do Usuário (Reservas) ---
  const handleConfirmReserve = async (reserveId: string) => {
    if (!token) {
      toast.error('Token de autenticação ausente. Faça login novamente.');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('token', token);
      const result = await confirmReserve(formData, reserveId, reserveComment); // Usa reserveComment

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Reserva confirmada com sucesso');
        setReserveComment('');
        await getAllReserves();
      }
    } catch (error: any) {
      toast.error(error.message);
      console.error('Erro ao confirmar reserva', error);
    }
  };

  const handleRejectReserve = async (reserveId: string) => {
    if (!token) {
      toast.error('Token de autenticação ausente. Faça login novamente.');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('token', token);
      const result = await refusedReserve(formData, reserveId, reserveComment); // Usa reserveComment

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Reserva recusada com sucesso');
        setReserveComment('');
        await getAllReserves();
      }
    } catch (error: any) {
      toast.error(error.message);
      console.error('Erro ao recusar reserva', error);
    }
  };

  const handleRemoveReserve = async () => {
    if (!token) {
      toast.error('Token de autenticação ausente. Faça login novamente.');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('token', token);
      const result = await removeReserve(formData, getRoute(), selectedReserve?.id as string);

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Reserva deletada com sucesso');
        setSelectedReserve(null);
        await getAllReserves();
      }
    } catch (error: any) {
      toast.error(error.message);
      console.error('Erro ao deletar reserva', error);
    }
  };

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

      const response = await updateReserve(
        selectedReserve?.id as string,
        getRoute(),
        JSON.stringify(dataToSend),
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

  // --- Handlers de Interação do Usuário (Relatórios) ---
  const handleUpdateReport = async () => {
    if (!token) {
      toast.error('Token de autenticação ausente. Faça login novamente.');
      return;
    }
    if (!selectedReport) return;

    // Lógica para verificar se o usuário logado é o criador do relatório
    if (currentUserId !== selectedReport.sport.reserve.userId) {
      toast.error('Você só pode editar relatórios que você mesmo criou.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('token', token);
      const result = await updateReport(formData, selectedReport.id, editedReport);

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Relatório atualizado com sucesso');
        setIsEditingReport(false);
        await getAllReports();
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar relatório');
    }
  };

  const handleValidateReportWithComment = async () => {
    if (!selectedReport || !token) {
      toast.error('Relatório ou token não disponível');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('token', token);
      // Garante que sempre envie uma string (vazia se necessário)
      formData.append('commentsAdmin', reportAdminComment ?? '');

      const result = await validateReport(formData, selectedReport.id);

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Relatório validado com sucesso');
        // Limpa o estado após a validação
        setReportAdminComment('');
        // Atualiza a lista de relatórios
        await getAllReports();
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao validar relatório');
      console.error('Erro na validação:', error);
    }
  };

  const handleRemoveReport = async () => {
    if (!selectedReport) return;
    if (!token) {
      toast.error('Token de autenticação ausente. Faça login novamente.');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('token', token);
      const result = await removeReport(formData, selectedReport.id);

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Relatório removido com sucesso');
        setSelectedReport(null);
        await getAllReports();
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao remover relatório');
    }
  };

  const handleReportInputChange = (field: keyof Reports, value: string) => {
    setEditedReport((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // --- Efeitos Colaterais (useEffect) ---
  useEffect(() => {
    getRoleAndToken();
  }, []);

  useEffect(() => {
    if (token) {
      getAllReserves();
      getAllReports();
    }
  }, [token]);

  useEffect(() => {
    if (selectedReserve) {
      setEditedData({
        ...selectedReserve,
        ...(selectedReserve.sport || {}),
        ...(selectedReserve.classroom || {}),
        ...(selectedReserve.event || {}),
      });
      setReserveComment(selectedReserve.comments || '');
    } else {
      setEditedData({});
      setReserveComment('');
    }

    if (selectedReport) {
      // Limpa completamente o estado antes de preencher com novos dados
      setEditedReport({
        peopleAppear: selectedReport.peopleAppear || '',
        requestedEquipment: selectedReport.requestedEquipment || '',
        generalComments: selectedReport.generalComments || '',
        courtCondition: selectedReport.courtCondition || '',
        equipmentCondition: selectedReport.equipmentCondition || '',
      });

      // Força a limpeza do comentário antes de atribuir o novo valor
      setReportAdminComment('');
      setReportAdminComment(selectedReport.commentsAdmin || '');
    } else {
      // Limpa todos os estados quando nenhum relatório está selecionado
      setEditedReport({});
      setReportAdminComment('');
    }
  }, [selectedReserve, selectedReport]);

  // --- Lógica de Filtro ---
  const filteredReserves = reserves.filter((reserve) => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'RECREACAO') return reserve.sport?.typePractice === 'RECREACAO';
    if (selectedTab === 'TREINO') return reserve.sport?.typePractice === 'TREINO';
    if (selectedTab === 'AMISTOSO') return reserve.sport?.typePractice === 'AMISTOSO';
    if (selectedTab === 'aula') return reserve.classroom?.matter;
    if (selectedTab === 'evento') return reserve.event?.name;
    return false; // Retorna false se o tipo de tab não corresponder a uma reserva
  });

  const filteredReports = reports.filter((report) => {
    console.log(report);
    if (selectedTab !== 'Relatório') return false; // Somente exibe relatórios na aba "Relatório"

    if (reportFilterStatus === 'all') return true;
    if (reportFilterStatus === 'validated') return report.statusReadAdmin === true;
    if (reportFilterStatus === 'pending') return report.statusReadAdmin === false;

    return false;
  });

  // --- Funções de Renderização Condicional (Sub-componentes lógicos) ---
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
            variant="destructive"
            onClick={handleRemoveReserve}>
            Remover reserva
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsEditing(true)}>
            Editar
          </Button>
        </div>
      );
    }
    return null;
  };

  const renderReportDetails = () => {
    // Apenas renderiza os detalhes do relatório se selectedReport não for nulo
    if (!selectedReport) {
      return null; // Retorna null se nenhum relatório estiver selecionado para esta função
    }

    // Lógica para verificar se o usuário logado é o criador do relatório
    const canEditReport = currentUserId === selectedReport.sport.reserve.userId;
    const canValidateOrRemove = userRole === 'PE_ADMIN' || userRole === 'SISTEMA_ADMIN';

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
                <Button onClick={handleUpdateReport}>Salvar</Button>
              </>
            ) : (
              <>
                {canEditReport && ( // Renderiza o botão de editar apenas se o usuário for o criador
                  <Button
                    variant="outline"
                    onClick={() => setIsEditingReport(true)}>
                    Editar
                  </Button>
                )}
                {canValidateOrRemove && !selectedReport.statusReadAdmin && (
                  <Button
                    variant="default"
                    onClick={handleValidateReportWithComment}
                    disabled={isEditingReport}>
                    Validar
                  </Button>
                )}
                {canValidateOrRemove && (
                  <Button
                    variant="destructive"
                    onClick={handleRemoveReport}
                    disabled={isEditingReport}>
                    Remover
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
                  onChange={(e) => handleReportInputChange('peopleAppear', e.target.value)}
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
                  onChange={(e) => handleReportInputChange('requestedEquipment', e.target.value)}
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
                  onChange={(e) => handleReportInputChange('courtCondition', e.target.value)}
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
                  onChange={(e) => handleReportInputChange('equipmentCondition', e.target.value)}
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
                  onChange={(e) => handleReportInputChange('generalComments', e.target.value)}
                  disabled={!isEditingReport}
                  className={disabledInputClass}
                />
              </div>
            </div>
          </div>

          {(userRole === 'PE_ADMIN' || userRole === 'SISTEMA_ADMIN') &&
            !selectedReport?.statusReadAdmin && (
              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Comentário do Admin (opcional)
                  </label>
                  <Textarea
                    rows={3}
                    className="w-full p-2 border rounded-md"
                    placeholder="Adicione um comentário sobre a validação..."
                    value={reportAdminComment ?? ''} // Usa nullish coalescing para garantir string vazia
                    onChange={(e) => setReportAdminComment(e.target.value)}
                    disabled={isEditingReport}
                  />
                </div>
              </div>
            )}
          {selectedReport?.commentsAdmin && (
            <div className="mt-4 space-y-2">
              <label className="block text-sm font-medium">Comentário do Admin</label>
              <Textarea
                rows={3}
                value={selectedReport.commentsAdmin ?? ''} // Garante string vazia se for null
                disabled
                className={disabledInputClass}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderReserveDetails = () => {
    // Apenas renderiza os detalhes da reserva se selectedReserve não for nulo
    if (!selectedReserve) {
      return null; // Retorna null se nenhuma reserva estiver selecionada para esta função
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
                <label className="block text-sm font-medium mb-1">Ocorrência</label>
                <Input
                  value={selectedReserve.occurrence}
                  disabled
                  className={disabledInputClass}
                />
              </div>
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

          {selectedReserve.sport && (
            <div>
              <h3 className="font-semibold">Detalhes Esportivos</h3>
              <div className="grid grid-cols-2 gap-4 mt-2">
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
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <Input
                    value={selectedReserve.status}
                    disabled
                    className={disabledInputClass}
                  />
                </div>
                {editedData.numberParticipants && (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Número de participantes
                    </label>
                    <Input
                      value={editedData.numberParticipants || ''}
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
                      value={editedData.requestEquipment || ''}
                      onChange={(e) => handleInputChange('requestEquipment', e.target.value)}
                      disabled={!isEditing}
                      className={disabledInputClass}
                    />
                  </div>
                )}
                {editedData.participants && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Participantes</label>
                    <Textarea
                      value={editedData.participants || ''}
                      onChange={(e) => handleInputChange('participants', e.target.value)}
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
                      value={reserveComment} // Usa reserveComment
                      onChange={(e) => setReserveComment(e.target.value)} // Atualiza reserveComment
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
                    value={editedData.matter || ''}
                    onChange={(e) => handleInputChange('matter', e.target.value)}
                    disabled={!isEditing}
                    className={disabledInputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Curso</label>
                  <Input
                    value={editedData.course || ''}
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
                    value={editedData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={!isEditing}
                    className={disabledInputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Local</label>
                  <Input
                    value={editedData.location || ''}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    disabled={!isEditing}
                    className={disabledInputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Descrição</label>
                  <Textarea
                    value={editedData.description || ''}
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
              setReportFilterStatus('all'); // Reseta o filtro de status do relatório ao mudar de aba
            }}
            className="mb-4">
            <TabsList className="grid grid-cols-7 w-full">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="RECREACAO">Recreação</TabsTrigger>
              <TabsTrigger value="TREINO">Treino</TabsTrigger>
              <TabsTrigger value="AMISTOSO">Amistoso</TabsTrigger>
              <TabsTrigger value="aula">Aula</TabsTrigger>
              <TabsTrigger value="evento">Evento</TabsTrigger>
              <TabsTrigger value="Relatório">Relatório</TabsTrigger>
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

            {selectedTab === 'Relatório' &&
              filteredReports.length === 0 &&
              reserves.length === 0 && (
                <Card className="p-4 bg-gray-100">
                  <div>
                    <h3 className="font-bold text-sm">Nenhum relatório encontrado</h3>
                    <p className="text-sm">
                      Não há relatórios para o filtro de status selecionado.
                    </p>
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
                      {reserve.classroom?.matter && 'Aula adicionada'}
                      {reserve.event?.name && 'Evento adicionado'}
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
                    <h3 className="font-bold text-sm">Relatório de Pós Uso</h3>
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

        {/* Lógica de renderização do painel de detalhes */}
        {selectedReserve ? (
          renderReserveDetails()
        ) : selectedReport ? (
          renderReportDetails()
        ) : (
          <div className="w-full bg-white md:w-1/2 border rounded-md p-8 flex flex-col items-center justify-center min-h-[300px]">
            <div className="w-24 h-24 flex items-center justify-center">
              <Mail className="w-16 h-16" />
            </div>
            <p className="mt-4 text-lg font-medium">Selecione um item</p>
          </div>
        )}
      </div>
    </div>
  );
}
