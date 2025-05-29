'use client'; // Indica que este é um componente cliente

// --- Importações de Bibliotecas e Componentes ---
import React, { useState } from 'react'; // React e hooks básicos
import { useRouter } from 'next/navigation'; // Hook para navegação
import { useForm } from 'react-hook-form'; // Para gerenciamento de formulários
import { zodResolver } from '@hookform/resolvers/zod'; // Integrar Zod com React Hook Form
import { z } from 'zod'; // Para validação de esquema
import toast from 'react-hot-toast'; // Para exibir notificações (toasts)
import { X } from 'lucide-react'; // Ícone de "fechar" (X)

// Componentes de UI locais
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; // Adicionado para consistência
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'; // Importação principal do Dialog

// --- Ações de API (Server Action) ---
import { submitEventReserve } from './action'; // Server Action para submeter a reserva de evento

// --- Interfaces de Props ---
interface EventReserveModalProps {
  open: boolean; // Controla a visibilidade do modal.
  onOpenChange: (open: boolean) => void; // Callback para quando o modal é aberto/fechado.
  role: string; // O papel do usuário logado (ex: 'PE_ADMIN', 'SISTEMA_ADMIN', 'USER').
}

// --- Esquema de Validação (Zod) ---
// Define o esquema de validação para os campos do formulário de reserva de evento.
const formSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório.'),
  description: z.string().min(1, 'A descrição é obrigatória.'),
  location: z.string().min(1, 'O local é obrigatório.'),
  occurrence: z.enum(['SEMANALMENTE', 'EVENTO_UNICO'], {
    message: 'Selecione o tipo de ocorrência.',
  }),
  dateTimeStart: z.string().min(1, 'A data de início é obrigatória.'),
  dateTimeEnd: z.string().min(1, 'A data de término é obrigatória.'),
});

// --- Tipos de Dados ---
// Define o tipo inferido do esquema de validação para os dados do formulário.
type EventReserveFormValues = z.infer<typeof formSchema>;

// --- Funções Utilitárias / Formatadores ---
// Função para formatar uma string de data para o formato "dd/mm/yyyy, hh:mm".
const formatToDDMMYYYYHHMM = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);

  // Verifica se a data é inválida.
  if (isNaN(date.getTime())) {
    console.error('Data inválida fornecida para formatToDDMMYYYYHHMM:', dateString);
    return dateString; // Retorna a string original ou uma string vazia para evitar erro.
  }

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Mês é base 0.
  const year = date.getFullYear().toString();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${day}/${month}/${year}, ${hours}:${minutes}`;
};

// --- Componente Principal ---
export function EventReserveModal({ open, onOpenChange, role }: EventReserveModalProps) {
  const router = useRouter(); // Instancia o roteador para navegação programática.

  // Configura o `react-hook-form` com o resolver Zod para validação.
  const {
    register, // Função para registrar inputs no formulário.
    handleSubmit: formHandleSubmit, // Função para lidar com a submissão do formulário.
    formState: { errors, isSubmitting }, // Objeto com erros de validação e estado de submissão.
    setValue, // Função para definir o valor de um campo do formulário programaticamente.
    reset, // Função para resetar o formulário.
  } = useForm<EventReserveFormValues>({
    resolver: zodResolver(formSchema), // Conecta o Zod como resolvedor de validação.
    defaultValues: {
      occurrence: 'SEMANALMENTE', // Define o valor padrão para o Select.
      name: '',
      description: '',
      location: '',
      dateTimeStart: '',
      dateTimeEnd: '',
    },
  });

  // --- Handlers de Interação do Usuário ---
  // Função executada quando o formulário é submetido.
  async function onSubmit(values: EventReserveFormValues) {
    try {
      // Obtém o token do localStorage (acesso seguro no cliente).
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        toast.error('Sessão expirada. Por favor, faça login novamente.');
        router.push('/login'); // Redireciona para o login.
        return;
      }

      const startDate = new Date(values.dateTimeStart);
      const endDate = new Date(values.dateTimeEnd);

      // Validação de datas: data de término deve ser após a de início.
      if (startDate >= endDate) {
        toast.error('A data de término deve ser após a data de início.');
        return;
      }

      // Cria um objeto FormData para enviar os dados para a Server Action.
      const formData = new FormData();
      formData.append('token', token); // Anexa o token para autenticação.
      formData.append('name', values.name);
      formData.append('description', values.description);
      formData.append('location', values.location);
      formData.append('occurrence', values.occurrence);
      // Formata as datas para o padrão esperado pelo backend (se for "dd/mm/yyyy, hh:mm").
      formData.append('dateTimeStart', formatToDDMMYYYYHHMM(values.dateTimeStart));
      formData.append('dateTimeEnd', formatToDDMMYYYYHHMM(values.dateTimeEnd));

      // Log para depuração dos dados que estão sendo enviados.
      console.log('Enviando dados do evento/reserva:', {
        name: values.name,
        description: values.description,
        location: values.location,
        occurrence: values.occurrence,
        dateTimeStart: startDate, // Enviando objetos Date para o log, mas FormData envia strings.
        dateTimeEnd: endDate,
      });

      const result = await submitEventReserve(formData); // Chama a Server Action.

      if (result?.error) {
        toast.error(result.error); // Exibe erro retornado pela Server Action.
      } else {
        toast.success(result?.message || 'Evento/reserva registrada com sucesso!'); // Exibe mensagem de sucesso.
        reset(); // Reseta o formulário para os valores padrão.
        onOpenChange(false); // Fecha o modal.
        // Recarrega a página ou a parte do calendário para refletir a nova reserva.
        // `router.refresh()` é uma boa opção no Next.js App Router para revalidar dados.
        setTimeout(() => router.refresh(), 1000);
      }
    } catch (error) {
      // Captura erros gerais na chamada da Server Action.
      console.error('Erro ao enviar formulário de evento/reserva:', error);
      toast.error('Ocorreu um erro ao processar sua solicitação.');
    }
  }

  // --- JSX Principal ---
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}>
      {' '}
      {/* Controla o estado de abertura/fechamento do modal. */}
      <DialogContent className="sm:max-w-md p-0 gap-0 border-none shadow-lg">
        {/* Formulário contido dentro do DialogContent */}
        <form
          onSubmit={formHandleSubmit(onSubmit)}
          className="bg-white rounded-md overflow-hidden">
          {/* Cabeçalho do Modal */}
          <div className="flex justify-between items-center p-4 pb-2">
            <DialogTitle className="text-xl font-bold">Registro de Evento/Reserva</DialogTitle>
            {/* Botão de Fechar Modal */}
            <button
              type="button" // Essencial para não submeter o formulário.
              onClick={() => onOpenChange(false)}
              className="text-gray-500 hover:text-gray-700 transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Corpo do Formulário */}
          <div className="p-4 pt-2">
            <div className="border border-gray-200 rounded-md p-4 space-y-4">
              {/* Campo de Nome do Evento */}
              <div>
                <Label className="block text-sm mb-1">Nome do evento*</Label>
                <Input
                  placeholder="Digite o nome do evento"
                  className="w-full"
                  {...register('name')} // Registra o input no formulário.
                />
                {/* Exibe erro de validação para o nome. */}
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              {/* Campo de Descrição */}
              <div>
                <Label className="block text-sm mb-1">Descrição*</Label>
                <Input // Usado Input, mas para descrição, talvez um Textarea seja mais adequado.
                  placeholder="Digite a descrição"
                  className="w-full"
                  {...register('description')} // Registra o input.
                />
                {/* Exibe erro de validação para a descrição. */}
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
                )}
              </div>

              {/* Campo de Localização */}
              <div>
                <Label className="block text-sm mb-1">Localização*</Label>
                <Input
                  placeholder="Digite o local"
                  className="w-full"
                  {...register('location')} // Registra o input.
                />
                {/* Exibe erro de validação para o local. */}
                {errors.location && (
                  <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>
                )}
              </div>

              {/* Campo de Ocorrência (Select) */}
              <div>
                <Label className="block text-sm mb-1">Ocorrência*</Label>
                <Select
                  onValueChange={(value) =>
                    // Atualiza o valor do campo 'occurrence' no formulário.
                    setValue('occurrence', value as 'SEMANALMENTE' | 'EVENTO_UNICO')
                  }
                  defaultValue="SEMANALMENTE">
                  {' '}
                  {/* Define o valor padrão visualmente. */}
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SEMANALMENTE">Semanalmente</SelectItem>
                    <SelectItem value="EVENTO_UNICO">Evento único</SelectItem>
                  </SelectContent>
                </Select>
                {/* Exibe erro de validação para a ocorrência. */}
                {errors.occurrence && (
                  <p className="text-red-500 text-xs mt-1">{errors.occurrence.message}</p>
                )}
              </div>

              {/* Campos de Data e Hora (Início e Término) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="block text-sm mb-1">Data de início*</Label>
                  <Input
                    type="datetime-local" // Tipo específico para data e hora local.
                    className="w-full"
                    {...register('dateTimeStart')} // Registra o input.
                  />
                  {/* Exibe erro de validação para a data de início. */}
                  {errors.dateTimeStart && (
                    <p className="text-red-500 text-xs mt-1">{errors.dateTimeStart.message}</p>
                  )}
                </div>
                <div>
                  <Label className="block text-sm mb-1">Data de término*</Label>
                  <Input
                    type="datetime-local" // Tipo específico para data e hora local.
                    className="w-full"
                    {...register('dateTimeEnd')} // Registra o input.
                  />
                  {/* Exibe erro de validação para a data de término. */}
                  {errors.dateTimeEnd && (
                    <p className="text-red-500 text-xs mt-1">{errors.dateTimeEnd.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Rodapé do Formulário (Botões de Ação) */}
            <div className="flex justify-between mt-4 p-4">
              {' '}
              {/* Adicionado p-4 para padding no rodapé do formulário */}
              <Button
                type="button" // Define como tipo "button" para não submeter o formulário.
                variant="destructive" // Estilo de botão destrutivo.
                onClick={() => onOpenChange(false)} // Fecha o modal.
                className="px-8 hover:bg-red-700 transition-colors">
                Fechar
              </Button>
              <Button
                type="submit" // Define como tipo "submit" para submeter o formulário.
                variant="default" // Estilo de botão padrão.
                className="bg-black hover:bg-gray-800 text-white px-8"
                disabled={isSubmitting}>
                {' '}
                {/* Desabilita o botão enquanto submetendo. */}
                {/* Texto do botão condicional com base no papel do usuário. */}
                {role === 'PE_ADMIN' || role === 'SISTEMA_ADMIN' ? 'Registrar' : 'Solicitar'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
