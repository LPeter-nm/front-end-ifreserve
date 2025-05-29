'use client'; // Indica que este é um componente cliente

// --- Importações de Bibliotecas e Componentes ---
import React, { useState } from 'react'; // React e hooks básicos
import { useRouter } from 'next/navigation'; // Hook para navegação
import { useForm } from 'react-hook-form'; // Para gerenciamento de formulários
import { zodResolver } from '@hookform/resolvers/zod'; // Integrar Zod com React Hook Form
import { z } from 'zod'; // Para validação de esquema
import toast from 'react-hot-toast'; // Para exibir notificações (toasts)

// Componentes de UI locais
import { Card, CardContent } from '@/components/ui/card'; // Corrigido o caminho de importação
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'; // Corrigido o caminho de importação
import { Label } from '@/components/ui/label'; // Adicionado, pois Label é uma boa prática para inputs
import { Textarea } from '@/components/ui/textarea'; // Adicionado para o campo 'participants'

// --- Ações de API (Server Action) ---
import { handleSubmit as submitFormData } from './action'; // Server Action para submeter a reserva esportiva

// --- Constantes de Validação ---
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB em bytes.
const ACCEPTED_FILE_TYPES = ['application/pdf']; // Apenas PDFs.

// --- Esquema de Validação (Zod) ---
// Define o esquema de validação para os campos do formulário de reserva esportiva.
const formSchema = z.object({
  typePractice: z.enum(['TREINO', 'AMISTOSO', 'RECREACAO'], {
    message: 'O tipo de prática é obrigatório.',
  }),
  numberParticipants: z.string().min(1, { message: 'O número de participantes é obrigatório.' }), // Adicionado .min(1)
  participants: z.string().min(1, { message: 'A lista de participantes é obrigatória.' }), // Adicionado .min(1)
  requestEquipment: z.string().optional(), // Opcional, não precisa de min(1) se não for obrigatório
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
    .optional(), // O campo é opcional
});

// --- Tipos de Dados ---
// Define o tipo inferido do esquema de validação para os dados do formulário.
type ReserveSportFormValues = z.infer<typeof formSchema>;

// --- Funções Utilitárias / Formatadores ---
// Função para formatar uma string de data para o formato "dd/mm/yyyy, hh:mm".
const formatToDDMMYYYYHHMM = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    // Verifica se a data é inválida
    console.error('Data inválida fornecida para formatToDDMMYYYYHHMM:', dateString);
    return dateString; // Retorna a string original para não quebrar.
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
  const [isSubmitting, setIsSubmitting] = useState(false); // Controla o estado de carregamento do formulário.
  const [file, setFile] = useState<File | null>(null); // Armazena o arquivo PDF selecionado.

  // --- Hooks de Navegação e Formulário ---
  const router = useRouter(); // Instancia o roteador para navegação programática.

  // Configura o `react-hook-form` com o resolver Zod para validação.
  const {
    register, // Função para registrar inputs no formulário.
    handleSubmit: formHandleSubmit, // Função para lidar com a submissão do formulário.
    setValue, // Função para definir o valor de um campo do formulário programaticamente.
    formState: { errors }, // Objeto que contém os erros de validação.
  } = useForm<ReserveSportFormValues>({
    resolver: zodResolver(formSchema), // Conecta o Zod como resolvedor de validação.
    defaultValues: {
      // Define valores padrão para os campos do formulário.
      numberParticipants: '',
      participants: '',
      requestEquipment: '',
      dateTimeStart: '',
      dateTimeEnd: '',
      occurrence: 'SEMANALMENTE',
      typePractice: undefined, // undefined para placeholder aparecer
    },
  });

  // --- Handlers de Arquivo ---
  // Lida com a seleção de arquivos (PDF).
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      // Validação de tamanho do arquivo.
      if (selectedFile.size > MAX_FILE_SIZE) {
        toast.error(`O arquivo deve ser menor que ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
        e.target.value = ''; // Limpa o input file.
        setFile(null);
        setValue('pdfFile', null);
        return;
      }
      // Validação do tipo de arquivo.
      if (!ACCEPTED_FILE_TYPES.includes(selectedFile.type)) {
        toast.error('Apenas arquivos PDF são permitidos.');
        e.target.value = ''; // Limpa o input file.
        setFile(null);
        setValue('pdfFile', null);
        return;
      }
      setFile(selectedFile); // Armazena o arquivo no estado local.
      setValue('pdfFile', selectedFile); // Define o valor do campo no React Hook Form.
    } else {
      setFile(null);
      setValue('pdfFile', null);
    }
  };

  // --- Handlers de Interação do Usuário ---
  // Função executada quando o formulário é submetido com sucesso.
  async function onSubmit(values: ReserveSportFormValues) {
    setIsSubmitting(true); // Ativa o estado de carregamento.
    console.log('Valores do formulário no submit:', JSON.stringify(values, null, 2));

    try {
      // Obtém o token do localStorage (acesso seguro no cliente).
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        toast.error('Sessão expirada. Por favor, faça login novamente.');
        setIsSubmitting(false);
        router.push('/login'); // Redireciona para o login.
        return;
      }

      // Validação de datas: data de término deve ser após a de início.
      const startDate = new Date(values.dateTimeStart);
      const endDate = new Date(values.dateTimeEnd);
      if (startDate >= endDate) {
        toast.error('A data de término deve ser após a data de início.');
        setIsSubmitting(false);
        return;
      }

      // Cria um objeto FormData para enviar os dados para a Server Action.
      const formData = new FormData();
      formData.append('token', token);
      formData.append('typePractice', values.typePractice);
      formData.append('numberParticipants', values.numberParticipants);
      formData.append('participants', values.participants);
      formData.append('requestEquipment', values.requestEquipment || ''); // Garante string vazia se undefined.
      formData.append('occurrence', values.occurrence);
      formData.append('dateTimeStart', formatToDDMMYYYYHHMM(values.dateTimeStart));
      formData.append('dateTimeEnd', formatToDDMMYYYYHHMM(values.dateTimeEnd));

      if (file) {
        formData.append('pdfFile', file); // Anexa o arquivo PDF se um foi selecionado.
      }

      // Log para depuração dos dados que estão sendo enviados no FormData.
      console.log('Dados do FormData:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const result = await submitFormData(formData); // Chama a Server Action.
      console.log('Resultado da Server Action:', result);

      if (result?.error) {
        toast.error(result.error); // Exibe erro retornado pela Server Action.
      } else if (result?.success) {
        toast.success(result.message || 'Solicitação de reserva enviada com sucesso!'); // Exibe mensagem de sucesso.
        // Redireciona para a home após um pequeno atraso.
        setTimeout(() => router.push('/home'), 2000);
      } else {
        toast.error('Resposta inesperada do servidor ao enviar solicitação.'); // Caso a resposta não seja sucesso nem erro.
      }
    } catch (error) {
      // Captura erros gerais na chamada da Server Action.
      console.error('Erro no onSubmit da reserva esportiva:', error);
      toast.error('Ocorreu um erro ao enviar sua solicitação de reserva.');
    } finally {
      setIsSubmitting(false); // Desativa o estado de carregamento, mesmo em caso de erro.
    }
  }

  // Função para redirecionar de volta para a página inicial.
  const handleBackHome = () => {
    router.push('/home'); // Redireciona para a home.
  };

  // --- JSX Principal ---
  return (
    <div className="p-5">
      {' '}
      {/* Padding geral */}
      <Card className="bg-[#ebe2e2] border border-black pb-0">
        {' '}
        {/* Adicionado 'border' para visibilidade */}
        <CardContent>
          <form onSubmit={formHandleSubmit(onSubmit)}>
            {' '}
            {/* Conecta o onSubmit do React Hook Form. */}
            <div className="flex flex-col gap-4">
              {/* Seção Tipo de Reserva e Número de Participantes */}
              <div className="flex flex-wrap gap-x-10 gap-y-4 justify-between w-full">
                {' '}
                {/* Usado flex-wrap para responsividade */}
                <div className="grid gap-2 flex-1 min-w-[200px]">
                  {' '}
                  {/* Flex-1 para preencher espaço */}
                  <Label htmlFor="typePractice">Tipo de reserva*</Label>
                  <Select
                    onValueChange={(value) => {
                      setValue('typePractice', value as 'TREINO' | 'AMISTOSO' | 'RECREACAO');
                    }}
                    // defaultValue={getValues('typePractice')} // Opcional: para controlar o Select com RHF
                  >
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
                  {/* Mensagem de erro para typePractice: use ?.message */}
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
                  {/* Mensagem de erro para numberParticipants: use ?.message */}
                  {errors.numberParticipants?.message && (
                    <p className="text-red-500 text-sm mt-1">{errors.numberParticipants.message}</p>
                  )}
                </div>
              </div>

              {/* Seção Equipamentos e Ocorrência / Lista de Participantes */}
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
                    {/* Mensagem de erro para requestEquipment: use ?.message */}
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
                    {/* Mensagem de erro para occurrence: use ?.message */}
                    {errors.occurrence?.message && (
                      <p className="text-red-500 text-sm mt-1">{errors.occurrence.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-2 md:w-1/2">
                  <Label htmlFor="participants">Lista de participantes*</Label>
                  <Textarea
                    id="participants"
                    className="bg-white rounded px-3 py-2 h-44"
                    placeholder="Ex: Fulano nome - matrícula ou CPF&#10;Ciclano nome - matrícula ou CPF"
                    required
                    {...register('participants')}
                  />
                  {/* Mensagem de erro para participants: use ?.message */}
                  {errors.participants?.message && (
                    <p className="text-red-500 text-sm mt-1">{errors.participants.message}</p>
                  )}
                </div>
              </div>

              {/* Seção Data e Hora */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex flex-col w-full md:w-1/2 gap-2">
                  <Label htmlFor="dateTimeStart">Data e Hora inicial*</Label>
                  <Input
                    id="dateTimeStart"
                    type="datetime-local"
                    className="w-full"
                    required
                    {...register('dateTimeStart')}
                  />
                  {/* Mensagem de erro para dateTimeStart: use ?.message */}
                  {errors.dateTimeStart?.message && (
                    <p className="text-red-500 text-sm mt-1">{errors.dateTimeStart.message}</p>
                  )}
                </div>
                <div className="flex flex-col w-full md:w-1/2 gap-2">
                  <Label htmlFor="dateTimeEnd">Data e Hora final*</Label>
                  <Input
                    id="dateTimeEnd"
                    type="datetime-local"
                    className="w-full"
                    required
                    {...register('dateTimeEnd')}
                  />
                  {/* Mensagem de erro para dateTimeEnd: use ?.message */}
                  {errors.dateTimeEnd?.message && (
                    <p className="text-red-500 text-sm mt-1">{errors.dateTimeEnd.message}</p>
                  )}
                </div>
              </div>

              {/* Seção Anexar PDF */}
              <div className="grid gap-2 mt-4">
                <Label htmlFor="pdfFile">Anexar PDF (Opcional)</Label>
                <Input
                  id="pdfFile"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="bg-white rounded px-3 py-2 border border-gray-300"
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
            {/* Rodapé do formulário (Botões de Ação) */}
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
