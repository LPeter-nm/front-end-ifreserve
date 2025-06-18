'use client'; // Indica que este é um componente cliente

// --- Importações de Bibliotecas e Componentes ---
// Agrupando importações por tipo: bibliotecas externas, depois componentes internos.
import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Dialog, DialogContent, DialogHeader } from '../ui/dialog'; // Componentes de diálogo (modal).
import { DialogTitle } from '@radix-ui/react-dialog'; // Importação específica do título do diálogo (Radix UI).
import { Input } from '@/components/ui/input'; // Componente de input.
import { Textarea } from '@/components/ui/textarea'; // Componente de textarea.
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'; // Componentes de seleção.

import { Reserves } from '../Calendar/calendar'; // Importa a interface Reserves.

// --- Interfaces ---
// Define as props esperadas para o componente CalendarEvent.
interface ReservesProps {
  reserve: Reserves; // Os dados da reserva a serem exibidos.
  color: string; // A cor de fundo do evento no calendário.
  onUpdate?: () => void; // Função opcional, caso haja alguma necessidade de atualização.
}

// --- Componente Principal ---
export function CalendarEvent({ reserve, color }: ReservesProps) {
  // --- Estados do Componente ---
  // `isOpen` controla a visibilidade do modal de detalhes do evento.
  const [isOpen, setIsOpen] = useState(false);

  // --- Constantes / Classes CSS Reutilizáveis ---
  // Define uma classe CSS para inputs desabilitados para evitar repetição.
  const disabledInputClass =
    'disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed';

  // --- Funções Utilitárias / Formatadores ---
  // Função para formatar objetos Date em strings de data/hora para exibição ou inputs.
  // Mover esta função para um arquivo de utilitários (ex: `utils/date-helpers.ts`)
  // seria ideal para evitar duplicação com `CalendarEventDetails`.
  const formatDateTime = (dateTime: Date) => {
    if (!dateTime) return '';
    const date = new Date(dateTime);

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    if (reserve.occurrence === 'SEMANALMENTE') {
      return `${hours}:${minutes}`;
    }

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // --- Funções de Renderização Condicional (Sub-componentes de Lógica) ---
  // Funções que encapsulam partes do JSX para manter o `return` principal mais limpo,
  // renderizando campos específicos baseados no tipo de reserva.

  const renderEventTitle = () => {
    // Determina o título principal do evento com base no tipo de reserva.
    const title =
      reserve.sport?.typePractice ||
      reserve.classroom?.matter ||
      reserve.event?.name ||
      reserve.type_Reserve;

    return (
      <>
        <div className="font-bold">{reserve.type_Reserve}</div>
        {/* Converte o título para minúsculas para consistência visual. */}
        <div className="font-medium">{title.toLowerCase()}</div>
        {/* Exibe o dia da semana se a ocorrência for semanal. */}
        {reserve.occurrence === 'SEMANALMENTE' && (
          <div className="text-xs italic">
            (Todo/a {format(new Date(reserve.dateTimeStart), 'EEEE', { locale: ptBR })})
          </div>
        )}
      </>
    );
  };

  const renderSpecificFields = () => {
    // Renderiza campos específicos para reservas de Esporte.
    if (reserve.sport) {
      return (
        <>
          <h4 className="text-md font-semibold mt-4 mb-2">Detalhes Esportivos</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tipo de prática</label>
              <Select
                value={reserve.sport.typePractice || ''} // Acessa diretamente de `reserve.sport`
                disabled>
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
                type="number"
                value={reserve.sport.numberParticipants || ''} // Acessa de `reserve.sport`
                disabled
                className={disabledInputClass}
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Equipamentos Solicitados</label>
            <Input
              value={reserve.sport.requestEquipment || ''} // Acessa de `reserve.sport`
              disabled
              className={disabledInputClass}
            />
          </div>
        </>
      );
    }

    // Renderiza campos específicos para reservas de Sala de Aula.
    if (reserve.classroom) {
      return (
        <>
          <h4 className="text-md font-semibold mt-4 mb-2">Detalhes da Sala de Aula</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Curso</label>
              <Input
                value={reserve.classroom.course || ''} // Acessa de `reserve.classroom`
                disabled
                className={disabledInputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Matéria</label>
              <Input
                value={reserve.classroom.matter || ''} // Acessa de `reserve.classroom`
                disabled
                className={disabledInputClass}
              />
            </div>
          </div>
        </>
      );
    }

    // Renderiza campos específicos para reservas de Evento.
    if (reserve.event) {
      return (
        <>
          <h4 className="text-md font-semibold mt-4 mb-2">Detalhes do Evento</h4>
          <div className="flex gap-5">
            <div className="flex flex-col w-full">
              <label className=" text-sm font-medium mb-1">Nome do Evento</label>
              <Input
                value={reserve.event.name || ''} // Acessa de `reserve.event`
                disabled
                className={disabledInputClass}
              />
            </div>
            <div className="flex flex-col w-full">
              <label className="text-sm font-medium mb-1">Local</label>
              <Input
                value={reserve.event.location || ''} // Acessa de `reserve.event`
                disabled
                className={disabledInputClass}
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Descrição</label>
            <Textarea
              value={reserve.event.description || ''} // Acessa de `reserve.event`
              disabled
              className={disabledInputClass}
            />
          </div>
        </>
      );
    }

    return null; // Retorna null se nenhum tipo específico de reserva for encontrado.
  };

  const renderCommonFields = () => {
    // Renderiza campos comuns a todos os tipos de reserva.
    return (
      <>
        <h4 className="text-md font-semibold mt-4 mb-2">Informações Gerais</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              {reserve.occurrence === 'SEMANALMENTE' ? 'Hora de início' : 'Data e Hora de início'}
            </label>
            {reserve.occurrence === 'SEMANALMENTE' ? (
              <Input
                type="text"
                value={formatDateTime(reserve.dateTimeStart)}
                disabled
                className={disabledInputClass}
              />
            ) : (
              <Input
                type="datetime-local"
                value={formatDateTime(reserve.dateTimeStart)}
                disabled
                className={disabledInputClass}
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              {reserve.occurrence === 'SEMANALMENTE' ? 'Hora de fim' : 'Data e Hora de fim'}
            </label>
            {reserve.occurrence === 'SEMANALMENTE' ? (
              <Input
                type="text"
                value={formatDateTime(reserve.dateTimeEnd)}
                disabled
                className={disabledInputClass}
              />
            ) : (
              <Input
                type="datetime-local"
                value={formatDateTime(reserve.dateTimeEnd)}
                disabled
                className={disabledInputClass}
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ocorrência</label>
            <Select
              value={reserve.occurrence || ''}
              disabled>
              <SelectTrigger className={disabledInputClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SEMANALMENTE">Semanalmente</SelectItem>
                <SelectItem value="EVENTO_UNICO">Evento único</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Solicitante</label>
            <Input
              value={reserve.user.name || ''}
              disabled
              className={disabledInputClass}
            />
          </div>
          {reserve.comments && ( // Exibe comentários apenas se existirem.
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Comentários (Admin)</label>
              <Textarea
                value={reserve.comments}
                disabled
                className={disabledInputClass}
              />
            </div>
          )}
        </div>
      </>
    );
  };

  // --- JSX Principal ---
  // A estrutura principal da UI do componente.
  return (
    <div className="grid h-16">
      {/* O "tile" do evento no calendário, clicável para abrir o modal. */}
      <div
        onClick={(e) => {
          e.stopPropagation(); // Previne que o clique se propague para elementos pai.
          setIsOpen(true); // Abre o modal.
        }}
        className={`flex flex-col justify-center items-center ${color} p-1 h-full rounded text-sm overflow-hidden text-center cursor-pointer`}>
        {renderEventTitle()}
      </div>

      {/* Modal de Diálogo para exibir os detalhes da reserva. */}
      <Dialog
        open={isOpen}
        onOpenChange={setIsOpen}>
        {' '}
        {/* Controla o estado de abertura/fechamento do modal. */}
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          {' '}
          {/* Adicionado scroll para conteúdo longo. */}
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-center">Detalhes da Reserva</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Campos comuns no topo do modal de detalhes. */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Solicitante</label>
                <Input
                  value={reserve.user.name}
                  disabled
                  className={disabledInputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tipo</label>
                <Input
                  value={reserve.type_Reserve}
                  disabled
                  className={disabledInputClass}
                />
              </div>
            </div>

            {/* Renderiza campos específicos e comuns com base no tipo de reserva. */}
            {renderSpecificFields()}
            {renderCommonFields()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
