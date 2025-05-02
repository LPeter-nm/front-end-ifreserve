import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '../ui/card';
import { useState } from 'react';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { handleSubmit } from './action';
import toast from 'react-hot-toast';

const formSchema = z.object({
  number_People: z.string(),
  participants: z.string(),
  request_Equipment: z.string(),
  date_Start: z.string(),
  date_End: z.string(),
  hour_Start: z.string(),
  hour_End: z.string(),
});

const ReserveSportForm = () => {
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedOccurrence, setSelectedOccurrence] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const { register, handleSubmit: formHandleSubmit } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
      const formData = new FormData();
      formData.append('token', token as string);
      formData.append('type_Practice', selectedType);
      formData.append('number_People', values.number_People.toString()); // Adicionado
      formData.append('participants', values.participants);
      formData.append('request_Equipment', values.request_Equipment);
      formData.append('ocurrence', selectedOccurrence); // Corrigido o nome do campo

      // Formatando as datas antes de enviar
      formData.append('date_Start', formatDate(values.date_Start));
      formData.append('date_End', formatDate(values.date_End));

      formData.append('hour_Start', values.hour_Start);
      formData.append('hour_End', values.hour_End);

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
      <Card className="bg-[#ebe2e2] border-1 border-black">
        <CardContent>
          <form onSubmit={formHandleSubmit(onSubmit)}>
            <div className="flex flex-col gap-4">
              {/* Solicitante */}
              <div className="grid gap-2">
                <label>Solicitante</label>
                <input
                  id="name"
                  type="text"
                  className="bg-gray-200 rounded w-full px-3 py-2"
                  disabled
                />
              </div>
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
                    {...register('number_People')}
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
                      {...register('request_Equipment')}
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
              <div className="grid grid-cols-4 gap-4">
                {/* Data inicial */}
                <div className="grid gap-2">
                  <label htmlFor="start-date">Data inicial</label>
                  <input
                    id="start-date"
                    type="date"
                    className="bg-white rounded w-full px-3 py-2"
                    required
                    {...register('date_Start')}
                  />
                </div>

                {/* Data final */}
                <div className="grid gap-2">
                  <label htmlFor="end-date">Data final</label>
                  <input
                    id="end-date"
                    type="date"
                    className="bg-white rounded w-full px-3 py-2"
                    required
                    {...register('date_End')}
                  />
                </div>

                {/* Hora inicial */}
                <div className="grid gap-2">
                  <label htmlFor="start-time">Hora inicial</label>
                  <input
                    id="start-time"
                    type="time"
                    className="bg-white rounded w-full px-3 py-2"
                    required
                    {...register('hour_Start')}
                  />
                </div>

                {/* Hora final */}
                <div className="grid gap-2">
                  <label htmlFor="end-time">Hora final</label>
                  <input
                    id="end-time"
                    type="time"
                    className="bg-white rounded w-full px-3 py-2"
                    required
                    {...register('hour_End')}
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
