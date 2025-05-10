import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '../ui/card';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { handleSubmit } from './action';
import toast from 'react-hot-toast';

const formSchema = z.object({
  //Sport
  numberParticipants: z.string(),
  participants: z.string(),
  requestEquipment: z.string(),
  dateTimeStart: z.string().refine((val) => !isNaN(new Date(val).getTime()), {
    message: 'Data/hora inicial inválida',
  }),
  dateTimeEnd: z.string().refine((val) => !isNaN(new Date(val).getTime()), {
    message: 'Data/hora final inválida',
  }),
  occurrence: z.enum(['SEMANALMENTE', 'EVENTO_UNICO']),
  typePractice: z.enum(['TREINO', 'AMISTOSO', 'RECREACAO']),

  // Classroom
  course: z.string(),
  matter: z.string(),

  // Event
  name: z.string(),
  description: z.string(),
  location: z.string(),
});

export const ReserveSportForm = () => {
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedOccurrence, setSelectedOccurrence] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit: formHandleSubmit,
    setValue,
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  // Atualiza o form value quando selectedType muda
  useEffect(() => {
    setValue('occurrence', selectedOccurrence as any);
    setValue('typePractice', selectedType as any);
  }, [selectedType, setValue]);

  const formatToDDMMYYYYHHMM = (dateString: string) => {
    const date = new Date(dateString);

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day}/${month}/${year}, ${hours}:${minutes}`;
  };
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      if (!selectedType || !selectedOccurrence) {
        toast.error('Por favor, preencha todos os campos obrigatórios');
        setIsSubmitting(false);
        return;
      }
      const formattedStart = formatToDDMMYYYYHHMM(values.dateTimeStart);
      const formattedEnd = formatToDDMMYYYYHHMM(values.dateTimeEnd);

      const formData = new FormData();
      formData.append('token', token as string);
      formData.append('type_Practice', selectedType);
      formData.append('number_People', values.numberParticipants.toString()); // Adicionado
      formData.append('participants', values.participants);
      formData.append('request_Equipment', values.requestEquipment);
      formData.append('occurrence', selectedOccurrence); // Corrigido o nome do campo

      // Formatando as datas antes de enviar
      formData.append('dateTimeStart', formattedStart);
      formData.append('dateTimeEnd', formattedEnd);

      console.log('Dados sendo enviados:', Object.fromEntries(formData.entries())); // Para debug

      const result = await handleSubmit(formData);

      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        toast.success(result.message);
        setTimeout(() => {
          router.push('/home');
        }, 2000);
      }
    } catch (error) {
      console.error('Erro no onSubmit:', error);
      toast.error('Ocorreu um erro ao enviar o formulário');
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleBackHome = () => {
    router.push('/');
  };
  return (
    <div className="p-5">
      <Card className="bg-[#ebe2e2] border-1 border-black pb-0">
        <CardContent>
          <form onSubmit={formHandleSubmit(onSubmit)}>
            <div className="flex flex-col gap-4">
              <div className="flex gap-50">
                {/* Tipo de reserva - Corrigido */}
                <div className="grid gap-2">
                  <label htmlFor="reservation-type">Tipo de reserva</label>
                  <Select
                    value={selectedType}
                    onValueChange={(value) => setSelectedType(value)}>
                    <SelectTrigger
                      id="reservation-type"
                      className="flex cursor-pointer items-center justify-between text-start px-3 py-2 w-96 rounded bg-white text-black border border-gray-300">
                      <SelectValue placeholder="Selecione o tipo de reserva" />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      className="z-50 w-[var(--radix-select-trigger-width)] bg-white rounded shadow-lg border border-gray-200 mt-1">
                      <SelectItem
                        value="TREINO"
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer">
                        Treino
                      </SelectItem>
                      <SelectItem
                        value="AMISTOSO"
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer">
                        Amistoso
                      </SelectItem>
                      <SelectItem
                        value="EXTERNO"
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer">
                        Recreação
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Número de participantes */}
                <div className="grid gap-2">
                  <label htmlFor="participants-count">Número de participantes</label>
                  <input
                    id="participants-count"
                    type="number"
                    className="bg-white rounded w-44 px-3 py-2"
                    min="1"
                    required
                    {...register('numberParticipants')}
                  />
                </div>
              </div>

              <div className="flex gap-50">
                <div className="flex flex-col gap-8">
                  {/* Equipamentos solicitados */}
                  <div className="grid gap-2 h-20">
                    <label htmlFor="equipment">Equipamentos solicitados</label>
                    <input
                      id="equipment"
                      type="text"
                      className="bg-white rounded w-96  h-10 px-3 py-2"
                      placeholder="Bola de vôlei"
                      {...register('requestEquipment')}
                    />
                  </div>
                  {/* Ocorrência - Corrigido */}
                  <div className="grid gap-2">
                    <label htmlFor="occurrence">Ocorrência</label>
                    <Select
                      value={selectedOccurrence}
                      onValueChange={(value) => setSelectedOccurrence(value)}>
                      <SelectTrigger
                        id="occurrence"
                        className="flex items-center justify-between cursor-pointer text-start px-3 py-2 w-96 rounded bg-white text-black border border-gray-300">
                        <SelectValue placeholder="Selecione a ocorrência" />
                      </SelectTrigger>
                      <SelectContent
                        position="popper"
                        className="z-50 w-[var(--radix-select-trigger-width)] bg-white rounded shadow-lg border border-gray-200 mt-1">
                        <SelectItem
                          value="SEMANALMENTE"
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer">
                          Semanalmente
                        </SelectItem>
                        <SelectItem
                          value="EVENTO_UNICO"
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer">
                          Evento único
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {/* Lista de participantes (textarea) */}
                <div className="grid gap-2 w-full">
                  <label htmlFor="participants">Lista de participantes</label>
                  <textarea
                    id="participants"
                    className="bg-white rounded  px-3 py-2 h-44"
                    placeholder="Fulano nome - matrícula ou CPF"
                    required
                    {...register('participants')}
                  />
                </div>
              </div>

              {/* Datas e Horas */}
              <div className="flex gap-50">
                {/* Data inicial */}
                <div className="flex flex-col w-96 gap-2">
                  <label htmlFor="dateTimeStart">Data e Hora inicial</label>
                  <input
                    id="dateTimeStart"
                    type="datetime-local"
                    className="bg-white rounded w-full px-3 py-2"
                    required
                    {...register('dateTimeStart')}
                  />
                </div>

                {/* Data final */}
                <div className="flex flex-col w-96 gap-2">
                  <label htmlFor="dateTimeEnd">Data final</label>
                  <input
                    id="dateTimeEnd"
                    type="datetime-local"
                    className="bg-white rounded w-full px-3 py-2"
                    required
                    {...register('dateTimeEnd')}
                  />
                </div>
              </div>
            </div>
            <div className="flex p-10 gap-50 justify-center">
              <button
                className="cursor-pointer bg-[#EC221F] text-white rounded p-3 px-10"
                onClick={handleBackHome}>
                Voltar
              </button>
              <button
                type="submit"
                className="cursor-pointer bg-[#2C2C2C]  text-white rounded p-3 px-10"
                disabled={isSubmitting}>
                {isSubmitting ? 'Solicitando...' : 'Solicitar'}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReserveSportForm;
