'use client'; // Indica que este é um componente cliente

// --- Importações de Bibliotecas e Componentes ---
// Agrupando importações por tipo: bibliotecas externas, depois componentes internos.
import { useEffect, useState } from 'react';

import { CalendarGrid } from '../CalendarGrid/calendar-grid';
import FilterWeekMonth from '../FilterWeekorMonth/week-month-filter';
import { MonthCalendarView } from '../MonthView/month-view';
import { Role } from '../NavBarPrivate/navbar-private'; // Importa o tipo Role

// --- Ações de API/Dados ---
import { getReservesAcepted } from './action'; // Função para buscar reservas aceitas
import toast from 'react-hot-toast';

// --- Interfaces ---
// Definir interfaces próximas ao local de uso ou em um arquivo global de tipos se reusadas extensivamente.
export interface Reserves {
  id: string;
  type_Reserve: string;
  occurrence: string;
  dateTimeStart: Date;
  dateTimeEnd: Date;
  status: string;
  comments?: string;
  user: {
    id: string;
    name: string;
    role: string;
    typeUser: string;
  };
  sport: {
    id: string;
    typePractice: string;
    numberParticipants: string;
    requestEquipment: string;
  } | null;
  classroom: {
    id: string;
    course: string;
    matter: string;
  } | null;
  event: {
    id: string;
    name: string;
    description: string;
    location: string;
  } | null;
}

// --- Componente Principal ---
export default function CalendarHome({ Role }: { Role: Role }) {
  // --- Estados do Componente ---
  // Agrupar todos os `useState` no início para clareza sobre o estado da UI.
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedView, setSelectedView] = useState<'week' | 'month'>('week');
  const [reserves, setReserves] = useState<Reserves[]>([]);

  // --- Funções de Busca de Dados ---
  // Funções assíncronas para buscar dados da API.
  const getAllReservesSport = async () => {
    try {
      const data = await getReservesAcepted();
      setReserves(data);
    } catch (error) {
      console.error('Erro ao buscar reservas aceitas:', error);
      toast.error('Não foi possível retornar reservas confirmadas');
    }
  };

  // --- Efeitos Colaterais (useEffect) ---
  // Carrega as reservas quando o componente é montado.
  useEffect(() => {
    getAllReservesSport();
  }, []); // Array de dependências vazio para rodar apenas uma vez na montagem.

  // --- JSX Principal ---
  // A estrutura principal da UI do componente.
  return (
    <div className="flex flex-col flex-1 bg-[#ebe2e2] min-h-screen p-10 gap-5">
      {/* Componente para filtrar entre visualização de semana e mês */}
      <FilterWeekMonth
        filterValue={selectedView}
        onFilterChange={setSelectedView}
      />

      {/* Renderização Condicional da Visualização do Calendário */}
      {selectedView === 'week' ? (
        <CalendarGrid
          Role={Role} // Passa a role do usuário para o CalendarGrid
          onDateChange={(newDate) => setCurrentDate(newDate)} // Permite ao CalendarGrid atualizar a data atual
          currentDate={currentDate} // Data atual para a visualização da semana
          events={reserves} // Passa as reservas para o CalendarGrid
        />
      ) : (
        <MonthCalendarView
          Role={Role} // Passa a role do usuário para o MonthCalendarView
          initialReserves={reserves} // Passa as reservas iniciais para o MonthCalendarView
        />
      )}
    </div>
  );
}
