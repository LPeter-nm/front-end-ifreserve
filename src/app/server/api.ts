import axios from 'axios';

// --- Configuração da Instância Axios ---
// Exporta uma instância pré-configurada do Axios para reutilização.
export const api = axios.create({
  // Define a URL base para todas as requisições feitas com esta instância.
  // Prioriza `process.env.API_URL` (para ambientes de produção) ou usa um fallback local.
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/', // Usar NEXT_PUBLIC_API_URL para variáveis de ambiente do lado do cliente no Next.js
  // Garante que cookies (como tokens de sessão) sejam enviados em requisições cross-origin.
  withCredentials: true,
});

// --- Interceptadores de Resposta ---
// Configura interceptadores para lidar com respostas da API globalmente.
api.interceptors.response.use(
  // Em caso de sucesso, simplesmente retorna a resposta.
  (response) => response,
  // Em caso de erro, extrai a mensagem de erro e a rejeita.
  (error) => {
    // Tenta extrair a mensagem de erro do corpo da resposta (comum em APIs RESTful).
    // Se não encontrar, usa a mensagem padrão do erro do Axios.
    const errorMessage = error.response?.data || error.message;
    // `Promise.reject` propaga o erro para o `catch` que chamou a API, mas com uma mensagem limpa.
    return Promise.reject(errorMessage);
  }
);

// --- Funções de Utilitário da API (Opcional, mas comum) ---
// Funções que encapsulam chamadas específicas à API para maior reusabilidade e clareza.

/**
 * Verifica o tipo de usuário através da sessão ativa.
 * @returns O tipo de usuário se a sessão for válida, ou `null` em caso de erro.
 */
export const checkSession = async () => {
  try {
    const response = await api.get('user/type-user');
    return response.data; // Retorna os dados da resposta, que devem conter o tipo de usuário.
  } catch (error) {
    // Loga o erro para depuração. O interceptor já tratou a mensagem, mas aqui é para registrar a falha.
    console.error('Erro ao verificar sessão:', error);
    return null; // Retorna null para indicar que a sessão não pôde ser verificada ou é inválida.
  }
};
