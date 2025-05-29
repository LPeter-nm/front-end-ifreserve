import { api } from '@/app/server/api'; // Importa a instância pré-configurada do Axios

/**
 * Busca todas as reservas com status 'confirm' ou 'confirmada'.
 *
 * Esta função interage com a API de backend para obter um subconjunto de reservas
 * que foram aceitas ou confirmadas.
 *
 * @returns {Promise<any[]>} Uma Promise que resolve para um array de reservas
 * confirmadas, ou um array vazio em caso de erro.
 */
export async function getReservesAcepted(): Promise<any[]> {
  // Retorna um array vazio em caso de erro
  try {
    // Realiza uma requisição GET para o endpoint 'reserve/reserves/confirm'.
    // A URL base já está configurada na instância `api`.
    const response = await api.get('reserve/reserves/confirm');

    // Retorna os dados da resposta, que devem ser as reservas confirmadas.
    return response.data;
  } catch (error: any) {
    // Captura qualquer erro que ocorra durante a requisição ou processamento.
    // Loga a mensagem de erro para depuração. A mensagem já é tratada pelo interceptor do Axios.
    console.error('Erro ao buscar reservas aceitas:', error.message);

    // Em caso de erro, retorna um array vazio para que o componente chamador
    // possa lidar com a ausência de dados de forma segura, sem travar.
    return [];
  }
}
