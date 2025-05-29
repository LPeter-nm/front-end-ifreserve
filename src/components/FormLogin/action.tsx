// Define que todas as funções neste arquivo são Server Actions.
// Isso significa que elas rodam exclusivamente no servidor.
'use server';

import { api } from '@/app/server/api'; // Importa a instância pré-configurada do Axios para requisições HTTP.
import { jwtDecode } from 'jwt-decode'; // Importa a biblioteca para decodificar JWTs.

// --- Interfaces ---
// Define a estrutura esperada para o payload do token JWT decodificado.
interface JwtPayload {
  id: string; // ID do usuário.
  role: string; // Papel/perfil do usuário (ex: 'USER', 'ADMIN').
  exp?: number; // Opcional: timestamp de expiração (Unix timestamp).
  iat?: number; // Opcional: timestamp de emissão (Unix timestamp).
  // Adicione outras propriedades que você espera no payload do seu token aqui.
  [key: string]: any; // Permite quaisquer outras propriedades no token.
}

/**
 * Lida com a submissão das credenciais de login (email e senha).
 * Esta Server Action envia os dados do formulário para o endpoint de login da API,
 * decodifica o token de acesso recebido e retorna informações relevantes para o cliente.
 *
 * @param {FormData} formData Objeto FormData contendo 'email' e 'password'.
 * @returns {Promise<{success: boolean, token?: string, role?: string, message?: string, error?: string}>}
 * Uma Promise que resolve com um objeto indicando sucesso ou falha, e os dados/mensagem relevantes.
 */
export async function handleSubmit(
  formData: FormData
): Promise<{ success: boolean; token?: string; role?: string; message?: string; error?: string }> {
  try {
    // Extrai o email e a senha do objeto FormData.
    const email = formData.get('email');
    const password = formData.get('password');

    // Validação básica no servidor: verifica se email e senha foram fornecidos.
    // Embora o cliente valide, esta é uma camada de segurança essencial.
    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
      return { success: false, error: 'Email e senha são obrigatórios.' };
    }

    // Faz uma requisição POST para o endpoint de login da API.
    // Assumimos que o backend retorna um `access_token` em caso de sucesso.
    const response = await api.post('auth/login', {
      email: email,
      password: password,
    });

    const token = response.data.access_token;

    // Verifica se um token foi realmente retornado pela API.
    if (!token || typeof token !== 'string') {
      console.error('API não retornou um token válido no login.');
      return { success: false, error: 'Falha no login: Token não recebido.' };
    }

    // Decodifica o token JWT para extrair informações como o papel (role) do usuário.
    // É importante notar que a decodificação aqui é para `extrair` informações, não para `validar` a autenticidade criptográfica do token.
    // A validação de autenticidade (assinatura do token) deve ser feita pelo seu backend.
    const decoded = jwtDecode<JwtPayload>(token);

    // Retorna os dados de sucesso, incluindo o token, o papel do usuário e uma mensagem.
    return {
      success: true,
      token: token,
      role: decoded.role,
      message: 'Login realizado com sucesso.',
    };
  } catch (error: any) {
    // Captura erros da requisição (ex: credenciais inválidas, erro de rede).
    // Extrai a mensagem de erro da resposta da API (se disponível) ou usa a mensagem padrão do erro.
    const errorMessage = error.response?.data?.message || error.message;
    console.error('Erro no handleSubmit da Server Action de login:', errorMessage);
    // Retorna um objeto de erro para o componente cliente.
    return {
      success: false,
      error: errorMessage,
    };
  }
}
