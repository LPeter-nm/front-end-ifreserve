'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { addDays, format, isSameDay, startOfWeek } from 'date-fns'; // Adicionado startOfWeek para consistência na geração de dias
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';

// --- Componentes Locais e de UI ---
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CalendarEventDetails } from '../CalendarEventMonth/calendar-event-month'; // Componente de detalhes do evento (modal)
import { SelectTypeReserve } from '../ModalSelectTypeReserve/select-type-reserve'; // Modal de seleção de tipo de reserva

// --- Tipos Importados ---
import { Reserves } from '../Calendar/calendar'; // Interface de Reservas
import { Role } from '../NavBarPrivate/navbar-private'; // Tipo de Papel do Usuário

// --- Ações de API (Server Actions) ---
import { getReservesAcepted } from '../Calendar/action'; // Função para buscar reservas aceitas
import { updateReserve } from '../DashboardManageReserve/action'; // Server Action para atualizar reserva

// --- Interfaces de Props ---
interface CalendarBaseProps {
  initialReserves?: Reserves[]; // Reservas iniciais passadas como prop (opcional)
  Role: Role; // Papel do usuário logado
}

// --- Componente Principal ---
export function MonthCalendarView({ initialReserves = [], Role }: CalendarBaseProps) {
  // --- Estados do Componente ---
  // `currentDate` é o dia "hoje" ou o dia que o calendário estava focado ao entrar no mês.
  const [currentDate] = useState<Date>(new Date());
  // `selectedMonth` e `selectedYear` controlam o mês e o ano exibidos.
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  // `selectedDayReserves` armazena as reservas para o dia clicado (quando há múltiplas).
  const [selectedDayReserves, setSelectedDayReserves] = useState<Reserves[]>([]);
  // `selectedReserve` armazena a reserva selecionada para exibir detalhes.
  const [selectedReserve, setSelectedReserve] = useState<Reserves | null>(null);
  // Controla a visibilidade do modal que lista múltiplas reservas de um dia.
  const [isReservesModalOpen, setIsReservesModalOpen] = useState(false);
  // Controla a visibilidade do modal de detalhes de uma única reserva.
  const [isReserveDetailsOpen, setIsReserveDetailsOpen] = useState(false);
  // `reserves` é o estado principal que armazena todas as reservas do calendário.
  const [reserves, setReserves] = useState<Reserves[]>(initialReserves);
  // Controla a visibilidade do modal de seleção de tipo de reserva (para admins).
  const [isReserveTypeModalOpen, setIsReserveTypeModalOpen] = useState(false);
  // `token` armazenará o token do usuário logado, necessário para as Server Actions.
  const [token, setToken] = useState<string | null>(null);

  const router = useRouter(); // Hook para navegação.

  // --- Constantes para o Calendário ---
  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']; // Nomes dos dias da semana.
  const months = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ]; // Nomes dos meses.

  // --- Funções de Geração do Calendário ---
  // Gera um array de objetos Date para preencher a grade do calendário (42 dias).
  const generateCalendarDays = (): Date[] => {
    const firstDay = new Date(selectedYear, selectedMonth, 1);
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0); // Último dia do mês atual.
    const startingDayOfWeek = firstDay.getDay(); // Dia da semana em que o mês começa (0=Dom, 1=Seg...).

    const calendarDays: Date[] = [];

    // Preenche os dias do mês anterior para completar a primeira semana.
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendarDays.push(addDays(firstDay, -startingDayOfWeek + i));
    }

    // Preenche os dias do mês atual.
    for (let day = 1; day <= lastDay.getDate(); day++) {
      calendarDays.push(new Date(selectedYear, selectedMonth, day));
    }

    // Preenche os dias do próximo mês para completar o grid (42 células).
    const remainingDays = 42 - calendarDays.length;
    for (let i = 1; i <= remainingDays; i++) {
      calendarDays.push(new Date(selectedYear, selectedMonth + 1, i));
    }

    return calendarDays;
  };

  const days = generateCalendarDays(); // Dias do calendário para o mês exibido.

  // --- Funções de Busca de Dados ---
  // Busca as reservas aceitas da API.
  const fetchReserves = async () => {
    // Adicionado verificação de token para a Server Action.
    const fetchedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!fetchedToken) {
      toast.error('Token ausente. Faça login novamente.');
      // Opcional: router.push('/login');
      return;
    }
    setToken(fetchedToken); // Armazena o token no estado.

    try {
      // Prepara FormData para a Server Action.
      const formData = new FormData();
      formData.append('token', fetchedToken);
      const data = await getReservesAcepted(); // Chama a Server Action.

      setReserves(data);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao buscar reservas do calendário.');
      console.error('Erro ao buscar reservas aceitas:', error);
    }
  };

  // --- Funções de Lógica e Event Handlers ---
  // Filtra as reservas relevantes para um dia específico.
  const getReservesForDay = (dayDate: Date): Reserves[] => {
    return reserves.filter((reserve) => {
      if (!reserve?.dateTimeStart) return false;

      const eventDate = new Date(reserve.dateTimeStart);

      const isWeekly = reserve.occurrence === 'SEMANALMENTE';
      const isSameWeekDay = isWeekly && eventDate.getDay() === dayDate.getDay();

      const isSameDay =
        dayDate.getDate() === eventDate.getDate() &&
        dayDate.getMonth() === eventDate.getMonth() &&
        dayDate.getFullYear() === eventDate.getFullYear();

      // Para eventos semanais, verifica se a data do calendário é posterior ou igual à data de início do evento.
      // Isso impede que eventos semanais apareçam antes de sua data de criação/início real.
      return (
        (isSameDay || isSameWeekDay) &&
        (isWeekly ? dayDate >= startOfWeek(eventDate, { weekStartsOn: 0 }) : true)
      );
    });
  };

  // Lida com o clique em um dia do calendário.
  const handleDayClick = (dayDate: Date) => {
    const dayReserves = getReservesForDay(dayDate);

    if (dayReserves.length === 1) {
      // Se houver apenas uma reserva, abre os detalhes diretamente.
      setSelectedReserve(dayReserves[0]);
      setIsReserveDetailsOpen(true);
    } else if (dayReserves.length > 1) {
      // Se houver múltiplas reservas, abre o modal de listagem.
      setSelectedDayReserves(dayReserves);
      setIsReservesModalOpen(true);
    } else {
      // Se não houver reservas, lida com a criação/solicitação.
      if (Role === 'PE_ADMIN' || Role === 'SISTEMA_ADMIN') {
        // Admin pode selecionar o tipo de reserva.
        setIsReserveTypeModalOpen(true);
      } else if (Role === 'USER') {
        // Usuário comum sempre vai para a solicitação de reserva esportiva.
        router.push('/request-reservation');
      }
      // Nota: o código original tinha `reserve.user.typeUser === 'SERVIDOR'` para USER,
      // mas isso depende de `reserve` que não existe quando `dayReserves.length === 0`.
      // Adaptei para a lógica mais comum: USER sempre solicita, ADMIN escolhe tipo.
    }
  };

  // Lida com o clique em uma reserva dentro de uma célula ou lista.
  const handleReserveClick = (reserve: Reserves, e: React.MouseEvent) => {
    e.stopPropagation(); // Previne que o clique se propague para o dia inteiro.
    setSelectedReserve(reserve);
    setIsReserveDetailsOpen(true);
  };

  // Lida com a atualização de uma reserva (passada para CalendarEventDetails).
  const handleSaveReserve = async (updatedData: any) => {
    if (!token) {
      toast.error('Token de autenticação ausente. Faça login novamente.');
      return;
    }
    try {
      // Determina a rota da API com base no tipo de reserva.
      const route = updatedData.sport
        ? 'reserve-sport'
        : updatedData.classroom
        ? 'reserve-classroom'
        : 'reserve-event';

      // Chama a Server Action `updateReserve`, passando o token.
      const response = await updateReserve(
        updatedData.id,
        route,
        JSON.stringify(updatedData), // A Server Action espera uma string JSON
        token // Passa o token como o 4º argumento
      );

      if (response.success) {
        // Atualiza o estado local das reservas.
        setReserves((prev) => prev.map((r) => (r.id === updatedData.id ? updatedData : r)));
        toast.success('Reserva atualizada com sucesso!');
        setIsReserveDetailsOpen(false); // Fecha o modal de detalhes.
      } else {
        toast.error(response.error || 'Erro ao atualizar reserva.');
      }
    } catch (error) {
      toast.error('Erro ao atualizar reserva.');
      console.error('Erro ao salvar reserva:', error);
    }
  };

  // --- Funções de Navegação do Mês ---
  const prevMonth = () => {
    setSelectedMonth((prev) => (prev === 0 ? 11 : prev - 1));
    if (selectedMonth === 0) setSelectedYear((prev) => prev - 1);
  };

  const nextMonth = () => {
    setSelectedMonth((prev) => (prev === 11 ? 0 : prev + 1));
    if (selectedMonth === 11) setSelectedYear((prev) => prev + 1);
  };

  const goToToday = () => {
    const today = new Date();
    setSelectedMonth(today.getMonth());
    setSelectedYear(today.getFullYear());
  };

  // --- Funções de Formatação para o JSX ---
  const formatTime = (dateTime: Date) => {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  // --- Efeitos Colaterais (useEffect) ---
  // Efeito para buscar reservas quando o componente é montado ou o token muda.
  useEffect(() => {
    fetchReserves();
  }, [token]); // Dependência: `token` (para garantir que só busca quando o token está disponível)

  // --- JSX Principal ---
  return (
    <div className="bg-[#ebe2e2] p-4 rounded-lg">
      {/* Seção de Navegação do Mês */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={prevMonth}
          className="p-2 rounded-full hover:bg-gray-200 transition-colors">
          {' '}
          {/* Ajustado hover */}
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="text-center">
          <h2 className="text-xl font-bold">
            {months[selectedMonth]} {selectedYear}
          </h2>
          <button
            onClick={goToToday}
            className="text-sm text-gray-600 hover:text-gray-800 transition-colors">
            Hoje
          </button>
        </div>

        <button
          onClick={nextMonth}
          className="p-2 rounded-full hover:bg-gray-200 transition-colors">
          {' '}
          {/* Ajustado hover */}
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Grid do Calendário (Cabeçalhos dos Dias da Semana) */}
      <div className="grid grid-cols-7 gap-2">
        {weekdays.map((day) => (
          <div
            key={`header-${day}`}
            className="text-center text-sm font-medium text-gray-700">
            {day}
          </div>
        ))}

        {/* Células dos Dias do Calendário */}
        {days.map((dayDate, index) => {
          const dayReserves = getReservesForDay(dayDate);
          const isCurrentMonth = dayDate.getMonth() === selectedMonth;
          const isToday = isSameDay(dayDate, new Date());

          return (
            <div
              key={`day-${index}`}
              onClick={() => handleDayClick(dayDate)}
              className={`cursor-pointer p-1 h-32 relative rounded-lg border border-gray-200 ${
                // Adicionado altura e borda padrão
                !isCurrentMonth
                  ? 'bg-gray-100 text-gray-400' // Dias de outros meses
                  : isToday
                  ? 'bg-blue-100 border-blue-500' // Dia atual
                  : 'bg-white' // Dias do mês atual
              }`}>
              <div
                className={`text-sm font-medium text-right p-1 ${
                  isToday
                    ? 'bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center ml-auto'
                    : ''
                }`}>
                {dayDate.getDate()}
              </div>

              {/* Exibe o primeiro evento e um contador para os demais */}
              {dayReserves.length > 0 && (
                <div className="space-y-1 mt-1">
                  <div
                    key={dayReserves[0].id}
                    onClick={(e) => handleReserveClick(dayReserves[0], e)}
                    className="flex flex-col justify-center items-center p-1 rounded-md text-xs bg-green-300 hover:bg-green-400 transition-colors cursor-pointer">
                    <div className="font-semibold truncate w-full text-center">
                      {dayReserves[0].sport?.typePractice ||
                        dayReserves[0].classroom?.matter ||
                        dayReserves[0].event?.name ||
                        dayReserves[0].type_Reserve}{' '}
                      {/* Adicionado type_Reserve como fallback */}
                    </div>
                    <div className="text-xs truncate">
                      {formatTime(dayReserves[0].dateTimeStart)}-
                      {formatTime(dayReserves[0].dateTimeEnd)}
                    </div>
                  </div>

                  {dayReserves.length > 1 && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation(); // Previne a propagação para o clique no dia
                        setSelectedDayReserves(dayReserves);
                        setIsReservesModalOpen(true);
                      }}
                      className="text-xs text-center text-blue-600 hover:text-blue-800 cursor-pointer">
                      +{dayReserves.length - 1} mais
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal de Múltiplas Reservas do Dia */}
      <Dialog
        open={isReservesModalOpen}
        onOpenChange={setIsReservesModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              Reservas do dia{' '}
              {selectedDayReserves[0] &&
                format(new Date(selectedDayReserves[0].dateTimeStart), 'dd/MM/yyyy', {
                  locale: ptBR,
                })}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-2 py-4 max-h-[60vh] overflow-y-auto">
            {' '}
            {/* Adicionado max-h e overflow para scroll */}
            {selectedDayReserves.map((reserve) => (
              <div
                key={reserve.id}
                onClick={() => {
                  setSelectedReserve(reserve);
                  setIsReservesModalOpen(false); // Fecha este modal
                  setIsReserveDetailsOpen(true); // Abre o modal de detalhes
                }}
                className="p-3 rounded-lg cursor-pointer hover:bg-gray-100 bg-green-300">
                {' '}
                {/* Cor de fundo pode variar */}
                <div className="font-bold">{reserve.type_Reserve}</div>
                <div className="text-sm">
                  {formatTime(reserve.dateTimeStart)} - {formatTime(reserve.dateTimeEnd)}
                </div>
                {/* Exibição condicional de detalhes específicos */}
                {reserve.sport?.typePractice && (
                  <div className="text-sm mt-1">{reserve.sport.typePractice}</div>
                )}
                {reserve.classroom?.matter && (
                  <div className="text-sm mt-1">{reserve.classroom.matter}</div>
                )}
                {reserve.event?.name && <div className="text-sm mt-1">{reserve.event.name}</div>}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Detalhes de Reserva Única */}
      <Dialog
        open={isReserveDetailsOpen}
        onOpenChange={setIsReserveDetailsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          {' '}
          {/* Adicionado scroll */}
          {selectedReserve && (
            <CalendarEventDetails
              reserve={selectedReserve}
              onClose={() => setIsReserveDetailsOpen(false)}
              onSave={handleSaveReserve} // Passa a função de salvar para o componente de detalhes.
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Seleção de Tipo de Reserva (para Admins/Servidores que podem registrar) */}
      <SelectTypeReserve
        open={isReserveTypeModalOpen}
        onOpenChange={setIsReserveTypeModalOpen}
        role={Role}
      />
    </div>
  );
}
