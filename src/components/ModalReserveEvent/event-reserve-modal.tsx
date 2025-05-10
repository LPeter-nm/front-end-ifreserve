// components/ModalSelectTypeReserve/event-reserve-modal.tsx
'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface EventReserveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: string;
}

export function EventReserveModal({ open, onOpenChange, role }: EventReserveModalProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 border-none shadow-lg">
        <div className="bg-white rounded-md overflow-hidden">
          <div className="flex justify-between items-center p-4 pb-2">
            <DialogTitle className="text-xl font-bold">Registro de evento</DialogTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>

          <div className="p-4 pt-2">
            <div className="border border-gray-200 rounded-md p-4">
              <div className="mb-4">
                <label className="block text-sm mb-1">Nome do evento</label>
                <Input
                  placeholder="Digite o nome do evento"
                  className="w-full border-gray-300"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm mb-1">Descrição</label>
                <Textarea
                  placeholder="Descreva o evento"
                  className="w-full border-gray-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">Data de início</label>
                  <Input
                    type="datetime-local"
                    className="w-full border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Data de término</label>
                  <Input
                    type="datetime-local"
                    className="w-full border-gray-300"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-4">
              <Button
                variant="destructive"
                onClick={() => onOpenChange(false)}
                className="bg-red-500 hover:bg-red-600 text-white px-8">
                Fechar
              </Button>
              {role === 'PE_ADMIN' || role === 'SISTEMA_ADMIN' ? (
                <Button
                  variant="default"
                  className="bg-black hover:bg-gray-800 text-white px-8">
                  Registrar
                </Button>
              ) : (
                <Button
                  variant="default"
                  className="bg-black hover:bg-gray-800 text-white px-8">
                  Solicitar
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
