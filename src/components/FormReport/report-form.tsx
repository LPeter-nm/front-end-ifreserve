import { Card, CardContent } from '../ui/card';

import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { handleSubmit } from './action';
import toast from 'react-hot-toast';

const formSchema = z.object({
  peopleAppear: z.string().min(1, 'Número de participantes é obrigatório'),
  requestedEquipment: z.string().min(1, 'Equipamentos solicitados é obrigatório'),
  generalComments: z.string(),
  courtCondition: z.string().min(1, 'Descrição da quadra é obrigatória'),
  equipmentCondition: z.string().min(1, 'Descrição do equipamento é obrigatória'),
});

interface ReportFormParams {
  sportId: string;
  date: string;
  timeUsed: string;
  userName: string;
}

const ReportForm = ({ params }: { params: ReportFormParams }) => {
  const { sportId, date, timeUsed, userName } = params;
  const router = useRouter();

  const {
    register,
    handleSubmit: formHandleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      equipmentCondition: '',
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00Z');
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        toast.error('Sessão expirada');
        router.push('/login');
        return;
      }

      const formData = new FormData();
      formData.append('token', token);
      formData.append('name_User', userName);
      formData.append('peopleAppear', values.peopleAppear);
      formData.append('requestedEquipment', values.requestedEquipment);
      formData.append('generalComments', values.generalComments);
      formData.append('courtCondition', values.courtCondition);
      formData.append('equipmentCondition', values.equipmentCondition);
      formData.append('time_Used', timeUsed);
      formData.append('date_Used', date);

      const result = await handleSubmit(formData, sportId);

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Relatório enviado com sucesso!');
        setTimeout(() => router.push('/home'), 2000);
      }
    } catch (error) {
      console.error('Erro no envio:', error);
      toast.error('Erro ao enviar relatório');
    }
  }

  const handleBackHome = () => router.push('/home');

  return (
    <div className="p-10 px-44">
      <Card className="bg-[#ebe2e2] border-1 border-black pb-0">
        <CardContent>
          <form onSubmit={formHandleSubmit(onSubmit)}>
            <div className="flex flex-col gap-4">
              {/* Cabeçalho */}
              <div className="flex gap-4">
                <div className="grid gap-2 w-full">
                  <label htmlFor="nameUser">Solicitante</label>
                  <input
                    id="nameUser"
                    className="bg-white disabled:bg-gray-300 rounded  px-3 py-2"
                    value={userName}
                    disabled
                  />
                </div>
                <div className="grid gap-2 w-full">
                  <label htmlFor="date">Horário</label>
                  <input
                    id="date"
                    className="bg-white disabled:bg-gray-300 rounded  px-3 py-2"
                    value={timeUsed}
                    disabled
                  />
                </div>
              </div>

              {/* Corpo do formulário */}

              <div className="flex gap-4 ">
                <div className="grid gap-2 w-full">
                  <label htmlFor="equipment">Equipamentos solicitados</label>
                  <input
                    id="equipment"
                    className={`bg-white rounded  h-10 px-3 py-2 ${
                      errors.equipmentCondition ? 'border-red-500' : ''
                    }`}
                    {...register('requestedEquipment')}
                  />
                  {errors.requestedEquipment && (
                    <p className="text-red-500 text-sm">{errors.requestedEquipment.message}</p>
                  )}
                </div>
                <div className="grid gap-2  w-full">
                  <label htmlFor="date">Data</label>
                  <input
                    id="date"
                    className="bg-white disabled:bg-gray-300 rounded px-3 py-2"
                    value={formatDate(date)}
                    disabled
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <label htmlFor="participants">Partipantes</label>
                <textarea
                  id="participants"
                  className={`bg-white rounded w-full px-3 py-2 ${
                    errors.peopleAppear ? 'border-red-500' : ''
                  }`}
                  {...register('peopleAppear')}
                />
                {errors.peopleAppear && (
                  <p className="text-red-500 text-sm">{errors.peopleAppear.message}</p>
                )}
              </div>

              <div className="flex gap-5">
                <div className="grid gap-2 w-full h-full">
                  <label htmlFor="generalCommentsCourt">Descrição da quadra</label>
                  <textarea
                    id="generalCommentsCourt"
                    className={`bg-white rounded px-3 py-2 h-full ${
                      errors.generalComments ? 'border-red-500' : ''
                    }`}
                    {...register('courtCondition')}
                  />
                  {errors.generalComments && (
                    <p className="text-red-500 text-sm">{errors.generalComments.message}</p>
                  )}
                </div>

                <div className="grid gap-2 w-full h-full">
                  <label htmlFor="generalCommentsEquipment">Descrição dos equipamentos</label>
                  <textarea
                    id="generalCommentsEquipment"
                    className={`bg-white rounded px-3 py-2 h-full ${
                      errors.generalComments ? 'border-red-500' : ''
                    }`}
                    {...register('equipmentCondition')}
                  />
                  {errors.generalComments && (
                    <p className="text-red-500 text-sm">{errors.generalComments.message}</p>
                  )}
                </div>
              </div>
              <div className="grid gap-2 h-full">
                <label htmlFor="generalComments">Descrição livre</label>
                <textarea
                  id="generalComments"
                  className={`bg-white rounded px-3 py-2 h-full ${
                    errors.generalComments ? 'border-red-500' : ''
                  }`}
                  {...register('generalComments')}
                />
                {errors.generalComments && (
                  <p className="text-red-500 text-sm">{errors.generalComments.message}</p>
                )}
              </div>

              {/* Rodapé do formulário */}
              <div className="flex justify-center gap-4 p-8">
                <button
                  type="button"
                  className="cursor-pointer bg-[#EC221F] text-white rounded p-3 px-10"
                  onClick={handleBackHome}>
                  Voltar
                </button>
                <button
                  type="submit"
                  className="cursor-pointer bg-[#2C2C2C] text-white rounded p-3 px-10"
                  disabled={isSubmitting}>
                  {isSubmitting ? 'Enviando...' : 'Enviar Relatório'}
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
