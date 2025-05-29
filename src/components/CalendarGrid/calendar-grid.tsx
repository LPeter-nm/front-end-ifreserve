'use client'; // Indica que este é um componente cliente

import React, { useState, useEffect } from 'react';
import { addDays, format, startOfWeek, isSameWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

// --- Componentes Locais e de UI ---
import { CalendarEvent } from '../CalendarEventWeek/calendar-event-week';
import { SelectTypeReserve } from '../ModalSelectTypeReserve/select-type-reserve';

// --- Tipos Importados ---
import { Reserves } from '../Calendar/calendar'; // Interface de Reservas
import { Role } from '../NavBarPrivate/navbar-private'; // Tipo de Papel do Usuário

// --- Ações de API (Server Actions) ---
import { getReservesAcepted } from '../Calendar/action'; // Função para buscar reservas aceitas

// --- Interfaces de Props ---
interface CalendarGridProps {
  Role: Role; // Papel do usuário logado
  currentDate: Date; // Data atual para a visualização da semana
  events?: Reserves[]; // Eventos (reservas) a serem exibidos (opcional)
  onDateChange: (newDate: Date) => void; // Callback para mudar a data no componente pai
}

// --- Componente Principal ---
export function CalendarGrid({ Role, currentDate, events = [], onDateChange }: CalendarGridProps) {
  // --- Estados do Componente ---
  // `selectedCell` não parece ser usado ativamente para renderização condicional ou lógica,
  // mas foi mantido se houver planos futuros.
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  // `reserves` é o estado que armazena os eventos do calendário.
  // Inicializado com `events` passado via prop, mas é atualizado por `fetchReserves`.
  const [reserves, setReserves] = useState<Reserves[]>(events);
  // `isReserveTypeModalOpen` controla a visibilidade do modal de seleção de tipo de reserva.
  const [isReserveTypeModalOpen, setIsReserveTypeModalOpen] = useState(false);

  const router = useRouter();

  // --- Funções de Busca de Dados ---
  // Busca as reservas aceitas da API.
  const fetchReserves = async () => {
    try {
      const data = await getReservesAcepted();

      setReserves(data);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao buscar reservas do calendário.');
      console.error('Erro ao buscar reservas aceitas:', error);
    }
  };

  // --- Funções de Navegação do Calendário ---
  const goToPreviousWeek = () => {
    const newDate = addDays(currentDate, -7);
    onDateChange(newDate);
  };

  const goToNextWeek = () => {
    const newDate = addDays(currentDate, 7);
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  // --- Lógica de Geração do Calendário (Valores Derivados do Estado) ---
  // Calcula o início da semana (segunda-feira).
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  // Gera um array com 6 dias da semana (segunda a sábado).
  const weekDays = Array.from({ length: 6 }).map((_, i) => addDays(weekStart, i));

  // Gera os horários das células (de 07:00 a 22:00).
  const timeSlots = Array.from({ length: 16 }).map((_, i) => {
    const hour = i + 7; // Começa às 7h
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  // Verifica se a semana atual exibida é a mesma semana de "hoje".
  const isCurrentWeek = isSameWeek(new Date(), currentDate, { weekStartsOn: 1 });

  // --- Funções de Lógica e Event Handlers ---
  // Lida com o clique em uma célula do calendário.
  const handleCellClick = (cellEvents: Reserves[]) => {
    // Se a célula não tem eventos e o usuário é comum, redireciona para a solicitação de reserva.
    if (cellEvents.length === 0 && Role === 'USER') {
      router.push('/request-reservation');
    }
    // Se a célula não tem eventos e o usuário é admin, abre o modal de seleção de tipo de reserva.
    else if (cellEvents.length === 0 && (Role === 'PE_ADMIN' || Role === 'SISTEMA_ADMIN')) {
      setIsReserveTypeModalOpen(true);
    }
    // Se houver eventos na célula, não faz nada (os eventos são clicáveis individualmente).
  };

  // Filtra os eventos relevantes para uma célula específica (dia e horário).
  const getEventsForCell = (dayDate: Date, time: string) => {
    return reserves.filter((reserve) => {
      // Validação básica dos campos de data.
      if (!reserve.dateTimeStart || !reserve.dateTimeEnd) return false;

      const eventDate = new Date(reserve.dateTimeStart);
      const eventEndDate = new Date(reserve.dateTimeEnd);

      const isWeekly = reserve.occurrence === 'SEMANALMENTE';

      // Verifica se o dia da semana do evento corresponde ao dia da célula.
      const isSameWeekDay = eventDate.getDay() === dayDate.getDay();

      // Verifica se o dia, mês e ano do evento correspondem ao dia da célula.
      const isSameDay =
        eventDate.getDate() === dayDate.getDate() &&
        eventDate.getMonth() === dayDate.getMonth() &&
        eventDate.getFullYear() === dayDate.getFullYear();

      // Calcula o início e fim da célula de horário.
      const [hour, minute] = time.split(':').map(Number);
      const cellStartTime = new Date(dayDate);
      cellStartTime.setHours(hour, minute, 0, 0);
      const cellEndTime = new Date(dayDate);
      cellEndTime.setHours(hour + 1, minute, 0, 0);

      // Normaliza as datas para comparação de horários (definindo ano/mês/dia fixos).
      const eventStartTimeCompare = new Date(eventDate);
      eventStartTimeCompare.setFullYear(2000, 0, 1);
      const eventEndTimeCompare = new Date(eventEndDate);
      eventEndTimeCompare.setFullYear(2000, 0, 1);
      const cellStartCompare = new Date(cellStartTime);
      cellStartCompare.setFullYear(2000, 0, 1);
      const cellEndCompare = new Date(cellEndTime);
      cellEndCompare.setFullYear(2000, 0, 1);

      // Verifica se o evento está dentro do intervalo de tempo da célula.
      const isInTimeRange =
        (eventStartTimeCompare >= cellStartCompare && eventStartTimeCompare < cellEndCompare) ||
        (eventEndTimeCompare > cellStartCompare && eventEndTimeCompare <= cellEndCompare) ||
        (eventStartTimeCompare <= cellStartCompare && eventEndTimeCompare >= cellEndCompare);

      if (isWeekly) {
        return isSameWeekDay && isInTimeRange;
      }

      return isSameDay && isInTimeRange;
    });
  };

  // --- Efeitos Colaterais (useEffect) ---
  // Carrega as reservas sempre que a `currentDate` muda (ou na montagem inicial).
  useEffect(() => {
    fetchReserves();
  }, [currentDate]); // Dependência: `currentDate`

  // --- JSX Principal ---
  return (
    <div className="flex-1 overflow-auto">
      {/* Seção de Navegação Semanal */}
      <div className="flex justify-between items-center mb-4 p-2 rounded">
        {/* Exibe o mês da semana atual */}
        <div>
          <span className="text-lg font-semibold bg-gray-300 rounded p-2">
            {format(weekStart, 'MMMM', { locale: ptBR })}
          </span>
        </div>
        {/* Botões de Navegação */}
        <div className="flex gap-2">
          <button
            onClick={goToPreviousWeek}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition">
            &lt; Semana anterior
          </button>

          <button
            onClick={goToToday}
            className={`px-3 py-1 rounded transition ${
              isCurrentWeek ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-200 hover:bg-blue-300'
            }`}
            disabled={isCurrentWeek}>
            Hoje
          </button>

          <button
            onClick={goToNextWeek}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition">
            Próxima semana &gt;
          </button>
        </div>
      </div>

      {/* Grid do Calendário */}
      <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_1fr] min-w-full gap-2">
        {/* Canto superior esquerdo (vazio) */}
        <div className="sticky top-0 z-10 bg-[#ebe2e2]">
          <div className="h-12 border-b border-r flex items-center justify-center font-medium"></div>
        </div>
        {/* Cabeçalhos dos Dias da Semana */}
        {weekDays.map((day, index) => (
          <div
            key={index}
            className="sticky top-0 z-10 bg-[#D9D9D9] rounded">
            <div className="h-12 border-b border-r flex items-center justify-center font-medium">
              {format(day, 'EEEE', { locale: ptBR })} {/* Nome do dia da semana */}
              <div className="text-sm ml-2">{format(day, 'dd/MM')}</div> {/* Data do dia */}
            </div>
          </div>
        ))}

        {/* Linhas de Horário e Células de Evento */}
        {timeSlots.map((time) => (
          <React.Fragment key={time}>
            {/* Célula de Horário (coluna da esquerda) */}
            <div className="border-b border-r bg-[#D9D9D9] rounded">
              <div className="h-16 px-4 flex items-center justify-center text-sm">{time}</div>
            </div>

            {/* Células de Evento para cada dia da semana */}
            {weekDays.map((dayDate, dayIndex) => {
              const cellId = `${dayIndex}-${time}`;
              const isSelected = selectedCell === cellId; // Não usado ativamente na renderização, mas mantido.
              const cellEvents = getEventsForCell(dayDate, time);

              return (
                <div
                  key={`${dayIndex}-${time}`}
                  className={`cursor-pointer rounded border-b border-r relative ${
                    isSelected ? 'bg-blue-100' : 'bg-white' // Estilo condicional com base em selectedCell
                  }`}
                  onClick={() => handleCellClick(cellEvents)}>
                  <div className="h-16">
                    {/* Renderiza CalendarEvent para cada evento na célula */}
                    {cellEvents.map((reserve) => (
                      <CalendarEvent
                        key={reserve.id}
                        reserve={reserve}
                        color="bg-green-300" // Cor do evento no calendário
                        onUpdate={fetchReserves} // Callback para recarregar eventos após atualização.
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Modal de Seleção de Tipo de Reserva (para admins) */}
      <SelectTypeReserve
        open={isReserveTypeModalOpen}
        onOpenChange={setIsReserveTypeModalOpen}
        role={Role}
      />
    </div>
  );
}
