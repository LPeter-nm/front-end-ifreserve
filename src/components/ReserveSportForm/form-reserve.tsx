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
import { handleSubmit as submitFormData } from './action';
import toast from 'react-hot-toast';

const formSchema = z.object({
  //Sport
  numberParticipants: z.string(),
  participants: z.string(),
  requestEquipment: z.string(),
  dateTimeStart: z.string(),
  dateTimeEnd: z.string(),
  occurrence: z.enum(['SEMANALMENTE', 'EVENTO_UNICO']),
  typePractice: z.enum(['TREINO', 'AMISTOSO', 'RECREACAO']),
  pdfFile: z.instanceof(File).optional(),
});

export const ReserveSportForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit: formHandleSubmit,
    setValue,
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
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

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (e.target.files[0].size > MAX_FILE_SIZE) {
        toast.error('O arquivo deve ser menor que 5MB');
        e.target.value = ''; // Limpa o input
        return;
      }
      if (e.target.files[0].type !== 'application/pdf') {
        toast.error('Apenas arquivos PDF são permitidos');
        e.target.value = '';
        return;
      }
      setFile(e.target.files[0]);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        toast.error('Por favor, faça login novamente');
        setIsSubmitting(false);
        return;
      }

      // Verifique todos os campos obrigatórios
      if (
        !values.typePractice ||
        !values.occurrence ||
        !values.dateTimeStart ||
        !values.dateTimeEnd ||
        !values.participants
      ) {
        toast.error('Por favor, preencha todos os campos obrigatórios');
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append('token', token);
      formData.append('typePractice', values.typePractice);
      formData.append('numberParticipants', values.numberParticipants);
      formData.append('participants', values.participants);
      formData.append('requestEquipment', values.requestEquipment || '');
      formData.append('occurrence', values.occurrence);
      formData.append('dateTimeStart', formatToDDMMYYYYHHMM(values.dateTimeStart));
      formData.append('dateTimeEnd', formatToDDMMYYYYHHMM(values.dateTimeEnd));
      // Adiciona o arquivo se existir
      if (file) {
        formData.append('pdfFile', file);
      }
      console.log('Dados do FormData:'); // Debug
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      const result = await submitFormData(formData);
      console.log('Resultado:', result); // Debug

      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        toast.success(result.message);
        setTimeout(() => router.push('/home'), 2000);
      } else {
        toast.error('Resposta inesperada do servidor');
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
                <div className="grid gap-2">
                  <label htmlFor="typePractice">Tipo de reserva</label>
                  <Select
                    onValueChange={(value) => {
                      setValue('typePractice', value as 'TREINO' | 'AMISTOSO' | 'RECREACAO');
                    }}>
                    <SelectTrigger
                      id="typePractice"
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

                <div className="grid gap-2">
                  <label htmlFor="numberParticipants">Número de participantes</label>
                  <input
                    id="numberParticipants"
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
                  <div className="grid gap-2 h-20">
                    <label htmlFor="requestEquipment">Equipamentos solicitados</label>
                    <input
                      id="requestEquipment"
                      type="text"
                      className="bg-white rounded w-96  h-10 px-3 py-2"
                      placeholder="Bola de vôlei"
                      {...register('requestEquipment')}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="occurrence">Ocorrência</label>
                    <Select
                      onValueChange={(value) => {
                        setValue('occurrence', value as 'SEMANALMENTE' | 'EVENTO_UNICO');
                      }}>
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
              <div className="flex gap-50">
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
              <div className="grid gap-2 mt-4">
                <label htmlFor="pdfFile">Anexar PDF (Opcional)</label>
                <input
                  id="pdfFile"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="bg-white rounded px-3 py-2 border border-gray-300"
                />
                {file && (
                  <p className="text-sm text-gray-600">
                    {' '}
                    {file.name ? `Arquivo selecionado: ${file.name}` : 'Selecione um arquivo'}
                  </p>
                )}
              </div>
            </div>

            <div className="flex p-10 gap-50 justify-center">
              <button
                type="button"
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
