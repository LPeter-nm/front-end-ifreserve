'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { submitEventReserve } from './action'; // Renomeie a função importada

interface EventReserveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: string;
}

const formSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  location: z.string().min(1, 'Locação é obrigatória'),
  occurrence: z.enum(['SEMANALMENTE', 'EVENTO_UNICO']),
  dateTimeStart: z.string().min(1, 'Data de início é obrigatória'),
  dateTimeEnd: z.string().min(1, 'Data de término é obrigatória'),
});

export function EventReserveModal({ open, onOpenChange, role }: EventReserveModalProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      occurrence: 'SEMANALMENTE',
    },
  });

  const formatToDDMMYYYYHHMM = (dateString: string) => {
    const date = new Date(dateString);

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day}/${month}/${year}, ${hours}:${minutes}`;
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Por favor, faça login novamente');
        return;
      }

      // Verifique se as datas são válidas
      const startDate = new Date(values.dateTimeStart);
      const endDate = new Date(values.dateTimeEnd);

      if (startDate >= endDate) {
        toast.error('A data de término deve ser após a data de início');
        return;
      }

      const formData = new FormData();
      formData.append('token', token);
      formData.append('description', values.description);
      formData.append('name', values.name);
      formData.append('location', values.location);
      formData.append('occurrence', values.occurrence);
      formData.append('dateTimeStart', formatToDDMMYYYYHHMM(values.dateTimeStart));
      formData.append('dateTimeEnd', formatToDDMMYYYYHHMM(values.dateTimeEnd));

      console.log('Enviando dados:', {
        description: values.description,
        name: values.name,
        occurrence: values.occurrence,
        dateTimeStart: startDate,
        dateTimeEnd: endDate,
      });

      const result = await submitEventReserve(formData);

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(result?.message || 'Aula registrada com sucesso!');
        reset();
        onOpenChange(false);
        setTimeout(() => router.refresh(), 1000);
      }
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      toast.error('Ocorreu um erro ao processar sua solicitação');
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 border-none shadow-lg">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-md overflow-hidden">
          <div className="flex justify-between items-center p-4 pb-2">
            <DialogTitle className="text-xl font-bold">Registro de aula</DialogTitle>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>

          <div className="p-4 pt-2">
            <div className="border border-gray-200 rounded-md p-4 space-y-4">
              <div>
                <label className="block text-sm mb-1">Nome do evento*</label>
                <Input
                  placeholder="Digite o Nome do evento"
                  className="w-full"
                  {...register('name')}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm mb-1">Descrição*</label>
                <Input
                  placeholder="Digite a Descrição"
                  className="w-full"
                  {...register('description')}
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm mb-1">Locação*</label>
                <Input
                  placeholder="Digite a Locação"
                  className="w-full"
                  {...register('location')}
                />
                {errors.location && (
                  <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm mb-1">Ocorrência*</label>
                <Select
                  onValueChange={(value) =>
                    setValue('occurrence', value as 'SEMANALMENTE' | 'EVENTO_UNICO')
                  }
                  defaultValue="SEMANALMENTE">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SEMANALMENTE">Semanalmente</SelectItem>
                    <SelectItem value="EVENTO_UNICO">Evento único</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">Data de início*</label>
                  <Input
                    type="datetime-local"
                    className="w-full"
                    {...register('dateTimeStart')}
                  />
                  {errors.dateTimeStart && (
                    <p className="text-red-500 text-xs mt-1">{errors.dateTimeStart.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm mb-1">Data de término*</label>
                  <Input
                    type="datetime-local"
                    className="w-full"
                    {...register('dateTimeEnd')}
                  />
                  {errors.dateTimeEnd && (
                    <p className="text-red-500 text-xs mt-1">{errors.dateTimeEnd.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-4">
              <Button
                type="button"
                variant="destructive"
                onClick={() => onOpenChange(false)}
                className="px-8">
                Fechar
              </Button>
              <Button
                type="submit"
                variant="default"
                className="bg-black hover:bg-gray-800 text-white px-8">
                {role === 'PE_ADMIN' || role === 'SISTEMA_ADMIN' ? 'Registrar' : 'Solicitar'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
