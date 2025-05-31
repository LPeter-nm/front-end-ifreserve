'use client'; // Indica que este é um componente cliente

// --- Importações de Bibliotecas e Componentes ---
import React, { useState, useEffect } from 'react'; // React e hooks básicos, incluindo useEffect
import { useRouter } from 'next/navigation'; // Hook para navegação
import { useForm } from 'react-hook-form'; // Para gerenciamento de formulários
import { zodResolver } from '@hookform/resolvers/zod'; // Integrar Zod com React Hook Form
import { z } from 'zod'; // Para validação de esquema
import toast from 'react-hot-toast'; // Para exibir notificações (toasts)

// Componentes de UI locais
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// --- Ações de API (Server Action) ---
import { handleSubmit as submitFormData } from './action';

// --- Constantes de Validação ---
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB em bytes.
const ACCEPTED_FILE_TYPES = ['application/pdf']; // Apenas PDFs.

// --- Esquema de Validação (Zod) ---
const formSchema = z.object({
  typePractice: z.enum(['TREINO', 'AMISTOSO', 'RECREACAO'], {
    message: 'O tipo de prática é obrigatório.',
  }),
  numberParticipants: z.string().min(1, { message: 'O número de participantes é obrigatório.' }),
  participants: z.string().min(1, { message: 'A lista de participantes é obrigatória.' }),
  requestEquipment: z.string().optional(),
  occurrence: z.enum(['SEMANALMENTE', 'EVENTO_UNICO'], { message: 'A ocorrência é obrigatória.' }),
  dateTimeStart: z.string().min(1, { message: 'A data e hora de início são obrigatórias.' }),
  dateTimeEnd: z.string().min(1, { message: 'A data e hora de término são obrigatórias.' }),
  pdfFile: z
    .any()
    .refine(
      (file) => !file || file.size <= MAX_FILE_SIZE,
      `O arquivo deve ser menor que ${MAX_FILE_SIZE / (1024 * 1024)}MB.`
    )
    .refine(
      (file) => !file || ACCEPTED_FILE_TYPES.includes(file.type),
      'Apenas arquivos PDF são permitidos.'
    )
    .optional(),
});

// --- Tipos de Dados ---
type ReserveSportFormValues = z.infer<typeof formSchema>;

// --- Funções Utilitárias / Formatadores ---
const formatToDDMMYYYYHHMM = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    console.error('Data inválida fornecida para formatToDDMMYYYYHHMM:', dateString);
    return dateString;
  }

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day}/${month}/${year}, ${hours}:${minutes}`;
};

// --- Componente Principal ---
export const ReserveSportForm = () => {
  // --- Estados do Componente ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  // --- Hooks de Navegação e Formulário ---
  const router = useRouter();

  const {
    register,
    handleSubmit: formHandleSubmit,
    setValue,
    watch, // Adicionado watch para observar o campo numberParticipants
    formState: { errors },
  } = useForm<ReserveSportFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      numberParticipants: '',
      participants: '',
      requestEquipment: '',
      dateTimeStart: '',
      dateTimeEnd: '',
      occurrence: 'SEMANALMENTE',
      typePractice: undefined,
    },
  });

  // Observa o valor de 'numberParticipants'
  const watchedNumberParticipants = watch('numberParticipants');

  // --- Efeito para gerar a lista de participantes ---
  // Este useEffect será executado sempre que 'watchedNumberParticipants' mudar.
  useEffect(() => {
    const num = parseInt(watchedNumberParticipants, 10);
    // Verifica se o número é válido (maior que zero e não é NaN)
    if (num > 0 && !isNaN(num)) {
      let participantList = '';
      for (let i = 1; i <= num; i++) {
        participantList += `${i}.\n`; // Adiciona a sequência numérica e quebra de linha
      }
      setValue('participants', participantList); // Preenche o campo 'participants'
    } else if (watchedNumberParticipants === '') {
      setValue('participants', ''); // Limpa o campo se o número for vazio
    }
  }, [watchedNumberParticipants, setValue]); // Dependências do useEffect

  // --- Handlers de Arquivo ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      if (selectedFile.size > MAX_FILE_SIZE) {
        toast.error(`O arquivo deve ser menor que ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
        e.target.value = '';
        setFile(null);
        setValue('pdfFile', null);
        return;
      }
      if (!ACCEPTED_FILE_TYPES.includes(selectedFile.type)) {
        toast.error('Apenas arquivos PDF são permitidos.');
        e.target.value = '';
        setFile(null);
        setValue('pdfFile', null);
        return;
      }
      setFile(selectedFile);
      setValue('pdfFile', selectedFile);
    } else {
      setFile(null);
      setValue('pdfFile', null);
    }
  };

  // --- Handlers de Interação do Usuário ---
  async function onSubmit(values: ReserveSportFormValues) {
    setIsSubmitting(true);
    console.log('Valores do formulário no submit:', JSON.stringify(values, null, 2));

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        toast.error('Sessão expirada. Por favor, faça login novamente.');
        setIsSubmitting(false);
        router.push('/login');
        return;
      }

      const startDate = new Date(values.dateTimeStart);
      const endDate = new Date(values.dateTimeEnd);
      if (startDate >= endDate) {
        toast.error('A data de término deve ser após a data de início.');
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

      if (file) {
        formData.append('pdfFile', file);
      }

      console.log('Dados do FormData:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const result = await submitFormData(formData);
      console.log('Resultado da Server Action:', result);

      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        toast.success(result.message || 'Solicitação de reserva enviada com sucesso!');
        setTimeout(() => router.push('/home'), 2000);
      } else {
        toast.error('Resposta inesperada do servidor ao enviar solicitação.');
      }
    } catch (error) {
      console.error('Erro no onSubmit da reserva esportiva:', error);
      toast.error('Ocorreu um erro ao enviar sua solicitação de reserva.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleBackHome = () => {
    router.push('/home');
  };

  // --- JSX Principal ---
  return (
    <div className="p-5">
      <Card className="bg-[#ebe2e2] border border-black pb-0">
        <CardContent>
          <form onSubmit={formHandleSubmit(onSubmit)}>
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-x-4 gap-y-4 justify-between w-full">
                <div className="grid gap-2 flex-1 min-w-[200px]">
                  <Label htmlFor="typePractice">Tipo de reserva*</Label>
                  <Select
                    onValueChange={(value) => {
                      setValue('typePractice', value as 'TREINO' | 'AMISTOSO' | 'RECREACAO');
                    }}>
                    <SelectTrigger
                      id="typePractice"
                      className="flex cursor-pointer items-center justify-between text-start px-3 py-2 rounded bg-white text-black border border-gray-300">
                      <SelectValue placeholder="Selecione o tipo de reserva" />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      className="z-50 bg-white rounded shadow-lg border border-gray-200 mt-1">
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
                        value="RECREACAO"
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer">
                        Recreação
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.typePractice?.message && (
                    <p className="text-red-500 text-sm mt-1">{errors.typePractice.message}</p>
                  )}
                </div>
                <div className="grid gap-2 flex-1 min-w-[200px]">
                  <Label htmlFor="numberParticipants">Número de participantes*</Label>
                  <Input
                    id="numberParticipants"
                    type="number"
                    className="bg-white rounded px-3 py-2"
                    min="1"
                    required
                    {...register('numberParticipants')}
                  />
                  {errors.numberParticipants?.message && (
                    <p className="text-red-500 text-sm mt-1">{errors.numberParticipants.message}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex flex-col gap-4 md:w-1/2">
                  <div className="grid gap-2">
                    <Label htmlFor="requestEquipment">Equipamentos solicitados (Opcional)</Label>
                    <Input
                      id="requestEquipment"
                      type="text"
                      className="bg-white rounded px-3 py-2"
                      placeholder="Ex: Bola de vôlei, rede de badminton"
                      {...register('requestEquipment')}
                    />
                    {errors.requestEquipment?.message && (
                      <p className="text-red-500 text-sm mt-1">{errors.requestEquipment.message}</p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="occurrence">Ocorrência*</Label>
                    <Select
                      onValueChange={(value) => {
                        setValue('occurrence', value as 'SEMANALMENTE' | 'EVENTO_UNICO');
                      }}>
                      <SelectTrigger
                        id="occurrence"
                        className="flex items-center justify-between cursor-pointer text-start px-3 py-2 rounded bg-white text-black border border-gray-300">
                        <SelectValue placeholder="Selecione a ocorrência" />
                      </SelectTrigger>
                      <SelectContent
                        position="popper"
                        className="z-50 bg-white rounded shadow-lg border border-gray-200 mt-1">
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
                    {errors.occurrence?.message && (
                      <p className="text-red-500 text-sm mt-1">{errors.occurrence.message}</p>
                    )}
                  </div>
                  <div className="flex flex-col md:flex-row gap-20">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="dateTimeStart">Data e Hora inicial*</Label>
                      <Input
                        id="dateTimeStart"
                        type="datetime-local"
                        className="bg-white rounded"
                        required
                        {...register('dateTimeStart')}
                      />
                      {errors.dateTimeStart?.message && (
                        <p className="text-red-500 text-sm mt-1">{errors.dateTimeStart.message}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="dateTimeEnd">Data e Hora final*</Label>
                      <Input
                        id="dateTimeEnd"
                        type="datetime-local"
                        className=" bg-white rounded "
                        required
                        {...register('dateTimeEnd')}
                      />
                      {errors.dateTimeEnd?.message && (
                        <p className="text-red-500 text-sm mt-1">{errors.dateTimeEnd.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid gap-2 md:w-1/2">
                  <Label htmlFor="participants">Lista de participantes*</Label>
                  <Textarea
                    id="participants"
                    className="bg-white rounded px-3 py-2 h-44"
                    placeholder="Ex: 1. Fulano nome - matrícula ou CPF"
                    required
                    {...register('participants')}
                  />
                  {errors.participants?.message && (
                    <p className="text-red-500 text-sm mt-1">{errors.participants.message}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-2 mt-4">
                <Label htmlFor="pdfFile">Anexar PDF (Opcional)</Label>
                <Input
                  id="pdfFile"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="bg-white rounded px-3 border border-gray-300"
                />
                {file && (
                  <p className="text-sm text-gray-600">
                    Arquivo selecionado: <span className="font-medium">{file.name}</span>
                  </p>
                )}
                {errors.pdfFile && typeof errors.pdfFile.message === 'string' && (
                  <p className="text-red-500 text-sm mt-1">{errors.pdfFile.message}</p>
                )}
              </div>
            </div>
            <div className="flex p-10 gap-4 justify-center">
              <button
                type="button"
                className="cursor-pointer bg-[#EC221F] text-white rounded p-3 px-10 hover:bg-red-600 transition-colors"
                onClick={handleBackHome}>
                Voltar
              </button>
              <button
                type="submit"
                className="cursor-pointer bg-[#2C2C2C] text-white rounded p-3 px-10 hover:bg-[#444444] transition-colors"
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
