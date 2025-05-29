'use client'; // Indica que este é um componente cliente

// --- Importações de Bibliotecas e Componentes ---
// Agrupando importações por tipo: bibliotecas externas, depois componentes internos.
import { useState } from 'react';

import { DialogTitle } from '@/components/ui/dialog'; // Usado para o título do modal/diálogo.
import { Input } from '@/components/ui/input'; // Componente de input.
import { Textarea } from '@/components/ui/textarea'; // Componente de textarea.
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'; // Componentes de seleção.

import { Reserves } from '../Calendar/calendar'; // Importa a interface Reserves do componente pai.

// --- Interfaces ---
// Define as props esperadas para o componente.
interface CalendarEventDetailsProps {
  reserve: Reserves; // Os dados da reserva a serem exibidos.
  onClose?: () => void; // Função para fechar os detalhes (opcional, pois não está sendo usada atualmente).
  onSave?: (updatedData: any) => Promise<void>; // Função para salvar dados (opcional, pois não está sendo usada atualmente).
}

// --- Componente Principal ---
export function CalendarEventDetails({ reserve }: CalendarEventDetailsProps) {
  // --- Estados do Componente ---
  // `data` armazena uma cópia da reserva e seus detalhes específicos (esporte, sala de aula, evento).
  // É usada para pré-popular os campos de input, mesmo que estejam desabilitados.
  const [data] = useState({
    ...reserve,
    ...(reserve.sport || {}), // Mescla as propriedades de 'sport' se existirem.
    ...(reserve.classroom || {}), // Mescla as propriedades de 'classroom' se existirem.
    ...(reserve.event || {}), // Mescla as propriedades de 'event' se existirem.
  });

  // --- Constantes / Classes CSS Reutilizáveis ---
  // Define uma classe CSS para inputs desabilitados, para evitar repetição.
  const disabledInputClass =
    'disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed';

  // --- Funções Utilitárias / Formatadores ---
  // Função para formatar objetos Date em strings de data/hora para exibição ou inputs.
  const formatDateTime = (dateTime: Date) => {
    if (!dateTime) return ''; // Retorna string vazia se a data for inválida.
    const date = new Date(dateTime);

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    // Lógica para formatar apenas a hora se a ocorrência for semanal.
    if (reserve.occurrence === 'SEMANALMENTE') {
      return `${hours}:${minutes}`;
    }

    // Formata para o formato `datetime-local` exigido por inputs HTML (YYYY-MM-DDTHH:mm).
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Mês é base 0.
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // --- Funções de Renderização Condicional (Sub-componentes de Lógica) ---
  // Funções que encapsulam partes do JSX para manter o `return` principal mais limpo,
  // renderizando campos específicos baseados no tipo de reserva.

  const renderSportFields = () => (
    <>
      <h3 className="text-md font-semibold mt-4 mb-2">Detalhes Esportivos</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Prática</label>
          <Select
            value={data.sport?.typePractice || ''} // Acessa diretamente de `data.sport`
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número de Participantes
          </label>
          <Input
            type="number"
            value={data.sport?.numberParticipants || ''} // Acessa de `data.sport`
            disabled
            className={disabledInputClass}
          />
        </div>
      </div>
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Equipamentos Solicitados
        </label>
        <Input
          value={data.sport?.requestEquipment || ''} // Acessa de `data.sport`
          disabled
          className={disabledInputClass}
        />
      </div>
    </>
  );

  const renderClassroomFields = () => (
    <>
      <h3 className="text-md font-semibold mt-4 mb-2">Detalhes da Sala de Aula</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Curso</label>
          <Input
            value={data.classroom?.course || ''} // Acessa de `data.classroom`
            disabled
            className={disabledInputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Matéria</label>
          <Input
            value={data.classroom?.matter || ''} // Acessa de `data.classroom`
            disabled
            className={disabledInputClass}
          />
        </div>
      </div>
    </>
  );

  const renderEventFields = () => (
    <>
      <h3 className="text-md font-semibold mt-4 mb-2">Detalhes do Evento</h3>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Evento</label>
        <Input
          value={data.event?.name || ''} // Acessa de `data.event`
          disabled
          className={disabledInputClass}
        />
      </div>
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
        <Textarea
          value={data.event?.description || ''} // Acessa de `data.event`
          disabled
          className={disabledInputClass}
        />
      </div>
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Local</label>
        <Input
          value={data.event?.location || ''} // Acessa de `data.event`
          disabled
          className={disabledInputClass}
        />
      </div>
    </>
  );

  const renderCommonFields = () => (
    <>
      <h3 className="text-md font-semibold mt-4 mb-2">Informações Gerais</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {reserve.occurrence === 'SEMANALMENTE' ? 'Hora de início' : 'Data e Hora de início'}
          </label>
          {reserve.occurrence === 'SEMANALMENTE' ? (
            <Input
              type="text" // Input de texto para exibir apenas a hora.
              value={formatDateTime(data.dateTimeStart)}
              disabled
              className={disabledInputClass}
            />
          ) : (
            <Input
              type="datetime-local" // Input de datetime-local para data e hora.
              value={formatDateTime(data.dateTimeStart)}
              disabled
              className={disabledInputClass}
            />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {reserve.occurrence === 'SEMANALMENTE' ? 'Hora de fim' : 'Data e Hora de fim'}
          </label>
          {reserve.occurrence === 'SEMANALMENTE' ? (
            <Input
              type="text" // Input de texto para exibir apenas a hora.
              value={formatDateTime(data.dateTimeEnd)}
              disabled
              className={disabledInputClass}
            />
          ) : (
            <Input
              type="datetime-local" // Input de datetime-local para data e hora.
              value={formatDateTime(data.dateTimeEnd)}
              disabled
              className={disabledInputClass}
            />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ocorrência</label>
          <Select
            value={data.occurrence}
            disabled>
            <SelectTrigger className={disabledInputClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SEMANALMENTE">Semanalmente</SelectItem>
              <SelectItem value="EVENTO_UNICO">Evento Único</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Solicitante</label>
          <Input
            value={data.user?.name || ''}
            disabled
            className={disabledInputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <Input
            value={data.status || ''}
            disabled
            className={disabledInputClass}
          />
        </div>
        {data.comments && ( // Exibe comentários apenas se existirem
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comentários (Admin)
            </label>
            <Textarea
              value={data.comments}
              disabled
              className={disabledInputClass}
            />
          </div>
        )}
      </div>
    </>
  );

  // --- JSX Principal ---
  // A estrutura principal da UI do componente.
  return (
    <div className="p-4">
      {' '}
      {/* Adicionado um padding ao container principal */}
      <DialogTitle className="text-lg font-bold mb-4">Detalhes da Reserva</DialogTitle>
      {/* Renderiza campos específicos com base no tipo de reserva */}
      {reserve.sport && renderSportFields()}
      {reserve.classroom && renderClassroomFields()}
      {reserve.event && renderEventFields()}
      {/* Renderiza campos comuns a todos os tipos de reserva */}
      {renderCommonFields()}
    </div>
  );
}
