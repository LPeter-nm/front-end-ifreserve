'use client'; // Indica que este é um componente cliente

// --- Importações de Bibliotecas e Componentes ---
// Agrupando importações por tipo: bibliotecas externas, depois componentes internos.
import React from 'react';
import { useRouter } from 'next/navigation'; // Hook para navegação
import { useForm } from 'react-hook-form'; // Para gerenciamento de formulários
import { zodResolver } from '@hookform/resolvers/zod'; // Integrar Zod com React Hook Form
import { z } from 'zod'; // Para validação de esquema
import toast from 'react-hot-toast'; // Para exibir notificações (toasts)

// Componentes de UI locais
import { Card, CardContent } from '../ui/card'; // Corrigido o caminho de importação

// --- Ações de API (Server Action) ---
import { handleSubmit } from './action'; // Server Action para submeter o relatório

// --- Esquema de Validação (Zod) ---
// Define o esquema de validação para os campos do formulário de relatório.
const formSchema = z.object({
  peopleAppear: z.string().min(1, 'Número de participantes é obrigatório.'),
  requestedEquipment: z.string().min(1, 'Equipamentos solicitados é obrigatório.'),
  generalComments: z.string(), // Este campo é opcional, mas deve ser string
  courtCondition: z.string().min(1, 'Descrição da condição da quadra é obrigatória.'),
  equipmentCondition: z.string().min(1, 'Descrição da condição do equipamento é obrigatória.'),
});

// --- Tipos de Dados ---
// Define o tipo inferido do esquema de validação para os dados do formulário.
type ReportFormValues = z.infer<typeof formSchema>;

// Define as props esperadas para o componente ReportForm.
interface ReportFormParams {
  sportId: string; // ID do esporte relacionado à reserva.
  date: string; // Data da reserva.
  timeUsed: string; // Tempo de uso da reserva.
  userName: string; // Nome do usuário solicitante.
}

// --- Componente Principal ---
const ReportForm = ({ sportId, date, timeUsed, userName }: ReportFormParams) => {
  // --- Hooks de Navegação e Formulário ---
  const router = useRouter(); // Instancia o roteador para navegação programática.

  // Configura o `react-hook-form` com o resolver Zod para validação.
  const {
    register, // Função para registrar inputs no formulário.
    handleSubmit: formHandleSubmit, // Função para lidar com a submissão do formulário.
    setValue, // Função para definir o valor de um campo do formulário programaticamente (usado no defaultValues).
    formState: { errors, isSubmitting }, // Objeto que contém os erros de validação e o estado de submissão.
  } = useForm<ReportFormValues>({
    resolver: zodResolver(formSchema), // Conecta o Zod como resolvedor de validação.
    defaultValues: {
      // Define valores padrão para campos, útil para garantir que strings vazias sejam tratadas.
      peopleAppear: '',
      requestedEquipment: '',
      generalComments: '',
      courtCondition: '',
      equipmentCondition: '',
    },
  });

  // --- Funções Auxiliares / Formatadores ---
  // Função para formatar uma string de data para o formato YYYY-MM-DD.
  const formatDate = (dateString: string) => {
    // Verifica se a data está no formato "dd/mm/yyyy, hh:mm"
    if (dateString.includes('/') && dateString.includes(',')) {
      const [datePart] = dateString.split(', ');
      const [day, month, year] = datePart.split('/').map(Number);

      // Cria a data no fuso horário local e formata para YYYY-MM-DD
      const dateObj = new Date(year, month - 1, day); // month-1 pois mês é base 0
      return dateObj.toISOString().split('T')[0];
    }
    // Se já estiver em outro formato (ex: YYYY-MM-DD), retorna como está
    return dateString;
  };

  // --- Handlers de Interação do Usuário ---
  // Função executada quando o formulário é submetido com sucesso.
  async function onSubmit(values: ReportFormValues) {
    // `isSubmitting` é controlado automaticamente pelo `formState` do RHF.

    try {
      // Obtém o token do localStorage (acesso seguro no cliente).
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        toast.error('Sessão expirada. Por favor, faça login novamente.');
        router.push('/login');
        return;
      }

      // Cria um objeto FormData para enviar os dados para a Server Action.
      const formData = new FormData();
      formData.append('token', token); // Anexa o token para autenticação na Server Action.
      formData.append('nameUser', userName);
      formData.append('peopleAppear', values.peopleAppear);
      formData.append('requestedEquipment', values.requestedEquipment);
      formData.append('generalComments', values.generalComments);
      formData.append('courtCondition', values.courtCondition);
      formData.append('equipmentCondition', values.equipmentCondition);
      formData.append('timeUsed', timeUsed);
      formData.append('dateUsed', formatDate(date)); // Formata a data antes de enviar.

      const result = await handleSubmit(formData, sportId); // Chama a Server Action.

      if (result?.error) {
        toast.error(result.error); // Exibe erro retornado pela Server Action.
      } else {
        toast.success(result.message || 'Relatório enviado com sucesso!'); // Exibe mensagem de sucesso.
        // Redireciona para a home após um pequeno atraso.
        setTimeout(() => router.push('/home'), 2000);
      }
    } catch (error) {
      // Captura erros gerais na chamada da Server Action.
      console.error('Erro no envio do relatório:', error);
      toast.error('Erro ao enviar relatório.');
    }
    // `isSubmitting` é resetado automaticamente pelo RHF após a submissão.
  }

  // Função para redirecionar de volta para a página inicial.
  const handleBackHome = () => router.push('/home');

  // --- JSX Principal ---
  return (
    <div className="p-10 px-44">
      {' '}
      {/* Padding e padding horizontal ajustado para layout. */}
      <Card className="bg-[#ebe2e2] border border-black pb-0">
        {' '}
        {/* Borda ajustada. */}
        <CardContent>
          <form onSubmit={formHandleSubmit(onSubmit)}>
            {' '}
            {/* Conecta o onSubmit do React Hook Form. */}
            <div className="flex flex-col gap-4">
              {/* Seção de Cabeçalho (Solicitante e Horário/Data) */}
              <div className="flex gap-4">
                <div className="grid gap-2 w-full">
                  <label
                    htmlFor="nameUser"
                    className="font-medium text-gray-700">
                    Solicitante
                  </label>
                  <input
                    id="nameUser"
                    className="bg-white disabled:bg-gray-200 rounded px-3 py-2 text-gray-800"
                    value={userName}
                    disabled
                  />
                </div>
                <div className="grid gap-2 w-full">
                  <label
                    htmlFor="timeUsed"
                    className="font-medium text-gray-700">
                    Horário
                  </label>
                  <input
                    id="timeUsed"
                    className="bg-white disabled:bg-gray-200 rounded px-3 py-2 text-gray-800"
                    value={timeUsed}
                    disabled
                  />
                </div>
                <div className="grid gap-2 w-full">
                  <label
                    htmlFor="dateUsed"
                    className="font-medium text-gray-700">
                    Data
                  </label>
                  <input
                    id="dateUsed"
                    className="bg-white disabled:bg-gray-200 rounded px-3 py-2 text-gray-800"
                    value={formatDate(date)} // Exibe a data formatada
                    disabled
                  />
                </div>
              </div>

              {/* Corpo do Formulário */}
              <div className="flex gap-4">
                {' '}
                {/* Adicionado gap */}
                <div className="grid gap-2 w-full">
                  <label
                    htmlFor="requestedEquipment"
                    className="font-medium text-gray-700">
                    Equipamentos solicitados
                  </label>
                  <input
                    id="requestedEquipment"
                    className={`bg-white rounded h-10 px-3 py-2 ${
                      errors.requestedEquipment ? 'border-red-500 border' : '' // Adicionado 'border'
                    }`}
                    {...register('requestedEquipment')}
                  />
                  {errors.requestedEquipment && (
                    <p className="text-red-500 text-sm">{errors.requestedEquipment.message}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-2">
                <label
                  htmlFor="peopleAppear"
                  className="font-medium text-gray-700">
                  Participantes
                </label>
                <textarea
                  id="peopleAppear"
                  className={`bg-white rounded w-full px-3 py-2 ${
                    errors.peopleAppear ? 'border-red-500 border' : ''
                  }`}
                  {...register('peopleAppear')}
                />
                {errors.peopleAppear && (
                  <p className="text-red-500 text-sm">{errors.peopleAppear.message}</p>
                )}
              </div>

              <div className="flex gap-5">
                <div className="grid gap-2 w-full">
                  <label
                    htmlFor="courtCondition"
                    className="font-medium text-gray-700">
                    Condição da quadra
                  </label>
                  <textarea
                    id="courtCondition"
                    className={`bg-white rounded px-3 py-2 h-24 ${
                      // Altura fixa para textareas
                      errors.courtCondition ? 'border-red-500 border' : ''
                    }`}
                    {...register('courtCondition')}
                  />
                  {errors.courtCondition && (
                    <p className="text-red-500 text-sm">{errors.courtCondition.message}</p>
                  )}
                </div>

                <div className="grid gap-2 w-full">
                  <label
                    htmlFor="equipmentCondition"
                    className="font-medium text-gray-700">
                    Condição dos equipamentos
                  </label>
                  <textarea
                    id="equipmentCondition"
                    className={`bg-white rounded px-3 py-2 h-24 ${
                      // Altura fixa
                      errors.equipmentCondition ? 'border-red-500 border' : ''
                    }`}
                    {...register('equipmentCondition')}
                  />
                  {errors.equipmentCondition && (
                    <p className="text-red-500 text-sm">{errors.equipmentCondition.message}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-2">
                <label
                  htmlFor="generalComments"
                  className="font-medium text-gray-700">
                  Comentários gerais
                </label>
                <textarea
                  id="generalComments"
                  className={`bg-white rounded px-3 py-2 h-24 ${
                    // Altura fixa
                    errors.generalComments ? 'border-red-500 border' : ''
                  }`}
                  {...register('generalComments')}
                />
                {errors.generalComments && (
                  <p className="text-red-500 text-sm">{errors.generalComments.message}</p>
                )}
              </div>

              {/* Rodapé do formulário (Botões de Ação) */}
              <div className="flex justify-center gap-4 p-8">
                <button
                  type="button" // Define como tipo "button" para não submeter o formulário.
                  className="cursor-pointer bg-[#EC221F] text-white rounded p-3 px-10 hover:bg-red-600 transition-colors"
                  onClick={handleBackHome}>
                  Voltar
                </button>
                <button
                  type="submit" // Define como tipo "submit" para submeter o formulário.
                  className="cursor-pointer bg-[#2C2C2C] text-white rounded p-3 px-10 hover:bg-[#444444] transition-colors"
                  disabled={isSubmitting}>
                  {' '}
                  {/* Desabilita o botão durante o carregamento. */}
                  {isSubmitting ? 'Enviando...' : 'Enviar Relatório'}{' '}
                  {/* Altera texto durante submissão. */}
                </button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportForm;
