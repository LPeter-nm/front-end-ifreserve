// components/ModalSelectTypeReserve/select-type-reserve.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ClassroomReserveModal } from '../ModalReserveClassroom/classroom-reserve-modal';
import { EventReserveModal } from '../ModalReserveEvent/event-reserve-modal';

interface SelectTypeReserveProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: string;
}

export function SelectTypeReserve({ open, onOpenChange, role }: SelectTypeReserveProps) {
  const [classroomModalOpen, setClassroomModalOpen] = useState(false);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const router = useRouter();

  const handleSelect = (type: 'sport' | 'classroom' | 'event') => {
    if (type === 'sport') {
      router.push('/request-reservation');
    } else if (type === 'classroom') {
      setClassroomModalOpen(true);
    } else if (type === 'event') {
      setEventModalOpen(true);
    }
    onOpenChange(false);
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Selecione o tipo de reserva</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center  gap-4 py-4">
            <Button
              className="px-10"
              onClick={() => handleSelect('sport')}>
              Ofício{' '}
            </Button>
            <Button
              className="px-10"
              onClick={() => handleSelect('classroom')}>
              Aula{' '}
            </Button>
            <Button
              className="px-10"
              onClick={() => handleSelect('event')}>
              Evento
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ClassroomReserveModal
        role={role}
        open={classroomModalOpen}
        onOpenChange={setClassroomModalOpen}
      />

      <EventReserveModal
        role={role}
        open={eventModalOpen}
        onOpenChange={setEventModalOpen}
      />
    </>
  );
}
