// components/ModalSelectTypeReserve/select-type-reserve.tsx
'use client'; // Indica que este é um componente cliente

// --- Importações de Bibliotecas e Componentes ---
// Agrupando importações por tipo: bibliotecas externas, depois componentes internos.
import React, { useState } from 'react'; // React e hooks básicos
import { useRouter } from 'next/navigation'; // Hook para navegação

// Componentes de UI locais
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Modais aninhados para diferentes tipos de reserva
import { ClassroomReserveModal } from '../ModalReserveClassroom/classroom-reserve-modal';
import { EventReserveModal } from '../ModalReserveEvent/event-reserve-modal';

// --- Interfaces de Props ---
interface SelectTypeReserveProps {
  open: boolean; // Controla a visibilidade do modal principal (SelectTypeReserve).
  onOpenChange: (open: boolean) => void; // Callback para quando o modal principal é aberto/fechado.
  role: string; // O papel do usuário logado (ex: 'PE_ADMIN', 'SISTEMA_ADMIN').
}

// --- Componente Principal ---
export function SelectTypeReserve({ open, onOpenChange, role }: SelectTypeReserveProps) {
  // --- Estados do Componente ---
  // `classroomModalOpen` controla a visibilidade do modal de reserva de sala de aula.
  const [classroomModalOpen, setClassroomModalOpen] = useState(false);
  // `eventModalOpen` controla a visibilidade do modal de reserva de evento.
  const [eventModalOpen, setEventModalOpen] = useState(false);

  // --- Hooks de Navegação ---
  const router = useRouter(); // Instancia o roteador para navegação programática.

  // --- Handlers de Interação do Usuário ---
  // Lida com a seleção do tipo de reserva e redireciona ou abre o modal apropriado.
  const handleSelect = (type: 'sport' | 'classroom' | 'event') => {
    // Fecha o modal atual (SelectTypeReserve) antes de abrir outro ou redirecionar.
    onOpenChange(false);

    if (type === 'sport') {
      // Redireciona para a página de solicitação de reserva esportiva.
      router.push('/request-reservation');
    } else if (type === 'classroom') {
      // Abre o modal de reserva de sala de aula.
      setClassroomModalOpen(true);
    } else if (type === 'event') {
      // Abre o modal de reserva de evento.
      setEventModalOpen(true);
    }
  };

  // --- JSX Principal ---
  return (
    <>
      {/* Modal Principal para Seleção do Tipo de Reserva */}
      <Dialog
        open={open}
        onOpenChange={onOpenChange}>
        {' '}
        {/* Controla o estado de abertura/fechamento. */}
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Selecione o tipo de reserva</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center gap-4 py-4">
            {/* Botão para Reservar Ofício (Esporte) */}
            <Button
              className="px-10"
              onClick={() => handleSelect('sport')}>
              Ofício
            </Button>
            {/* Botão para Reservar Aula */}
            <Button
              className="px-10"
              onClick={() => handleSelect('classroom')}>
              Aula
            </Button>
            {/* Botão para Reservar Evento */}
            <Button
              className="px-10"
              onClick={() => handleSelect('event')}>
              Evento
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Reserva de Sala de Aula (condicionalmente renderizado e controlado) */}
      <ClassroomReserveModal
        role={role} // Passa o papel do usuário para o modal de reserva de aula.
        open={classroomModalOpen}
        onOpenChange={setClassroomModalOpen} // Controla a visibilidade do modal de aula.
      />

      {/* Modal de Reserva de Evento (condicionalmente renderizado e controlado) */}
      <EventReserveModal
        role={role} // Passa o papel do usuário para o modal de reserva de evento.
        open={eventModalOpen}
        onOpenChange={setEventModalOpen} // Controla a visibilidade do modal de evento.
      />
    </>
  );
}
