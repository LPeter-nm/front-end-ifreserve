'use client'; // Indica que este é um componente cliente

// --- Importações de Bibliotecas e Componentes ---
// Agrupando importações por tipo: bibliotecas externas, depois componentes internos.
import { ReactNode, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';

// --- Interfaces ---
// Definir interfaces próximas ao local de uso, ou em um arquivo separado se forem reusadas.
interface DecodedToken {
  exp: number; // Timestamp de expiração do token (em segundos desde a Época).
}

// --- Componente Principal ---
const PrivateLayout = ({ children }: { children: ReactNode }) => {
  // --- Estados do Componente ---
  // `isValid` pode ser `null` (inicial), `true` (autenticado) ou `false` (não autenticado/expirado).
  const [isValid, setIsValid] = useState<boolean | null>(null);

  // --- Hooks de Navegação ---
  const router = useRouter();
  const queryParams = useSearchParams();

  const tokenParams = queryParams.get('token');

  // --- Efeitos Colaterais (useEffect) ---
  // Lógica principal para verificação de autenticação e expiração do token.
  useEffect(() => {
    // Função assíncrona para encapsular a lógica de checagem de autenticação.
    const checkAuth = async () => {
      // Inicia o estado de validação como nulo para mostrar o loading.
      setIsValid(null);

      // A verificação `typeof window !== 'undefined'` é crucial para garantir que
      // `localStorage` seja acessado apenas no lado do cliente.
      if (typeof window === 'undefined') {
        // Em SSR, consideramos que a autenticação será verificada no cliente.
        // Podemos definir isValid para false ou null e deixar a verificação do cliente lidar.
        // Aqui, optamos por null para mostrar o spinner até o useEffect rodar no cliente.
        return;
      }

      let storedToken = localStorage.getItem('token');

      if (tokenParams) {
        localStorage.setItem('token', tokenParams);
        storedToken = tokenParams;
        router.push('/home');
      }
      if (!storedToken) {
        // Se não há token, o usuário não está autenticado.
        toast.error('Você não está logado. Por favor, faça login.');
        localStorage.removeItem('token'); // Garante que não há lixo.
        setIsValid(false);
        router.push('/'); // Redireciona para a página inicial ou de login.
        return; // Sai da função do efeito.
      }

      try {
        const decoded = jwtDecode<DecodedToken>(storedToken);
        // Calcula se o token expirou: `Date.now()` (ms) vs `decoded.exp * 1000` (ms).
        const isExpired = Date.now() >= decoded.exp * 1000;

        if (isExpired) {
          // Se o token expirou, informa o usuário e limpa o armazenamento.
          toast.error('Sua sessão expirou. Por favor, faça login novamente.');
          localStorage.removeItem('token');
          setIsValid(false);
          router.push('/?expired=true'); // Redireciona com um parâmetro para indicação.
        } else {
          // Se o token é válido e não expirou, permite o acesso.
          setIsValid(true);
        }
      } catch (error) {
        // Erro na decodificação do token (token malformado, etc.).
        console.error('Token inválido ou malformado:', error);
        toast.error('Sua sessão está inválida. Por favor, faça login novamente.');
        localStorage.removeItem('token'); // Remove o token inválido.
        setIsValid(false);
        router.push('/'); // Redireciona para a página inicial ou de login.
      }
    };

    // Executa a função de checagem ao montar o componente.
    checkAuth();
  }, [router]); // Array de dependências: `router` é uma dependência estável, mas explícita.

  // --- Renderização Condicional (Early Returns) ---
  // Mostra o spinner de carregamento enquanto a validação está em andamento.
  if (isValid === null) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-50">
        <div className="flex flex-col items-center gap-2">
          <div className="h-10 w-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Carregando...</span>
        </div>
      </div>
    );
  }

  // Se o token não é válido, não renderiza o conteúdo privado.
  // O redirecionamento já é tratado no `useEffect`.
  if (!isValid) {
    return null;
  }

  // Se o token é válido, renderiza os componentes filhos.
  return <>{children}</>;
};

export default PrivateLayout;
