'use client'; // Indica que este é um componente cliente

// --- Importações de Bibliotecas e Componentes ---
// Agrupando importações por tipo: bibliotecas externas, depois componentes internos.
import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';

// --- Interfaces ---
// Definir interfaces próximas ao local de uso, ou em um arquivo separado se forem reusadas.
interface JwtPayload {
  id: string;
  role: string; // A role pode ser uma string simples ou um tipo Role mais específico se você o definir.
}

// --- Componente Principal ---
const UserLayout = ({ children }: { children: ReactNode }) => {
  // --- Estados do Componente ---
  // Agrupar todos os `useState` no início.
  const [isLoading, setIsLoading] = useState(true);

  // --- Hooks de Navegação ---
  const router = useRouter();

  // --- Efeitos Colaterais (useEffect) ---
  // Lógica principal para verificação de token e controle de acesso.
  useEffect(() => {
    // Definir o estado de carregamento como true no início do efeito.
    setIsLoading(true);

    // A verificação `typeof window !== 'undefined'` é crucial para garantir que o localStorage
    // seja acessado apenas no lado do cliente.
    if (typeof window !== 'undefined') {
      try {
        const token = localStorage.getItem('token');

        // Se não há token, o usuário não está autenticado. Redirecionar.
        if (!token) {
          router.push('/'); // Ou para a página de login que você configurou no layout.tsx
          toast.error('Você precisa estar logado para acessar esta área.');
          return; // Sai da função do efeito.
        }

        const decoded = jwtDecode<JwtPayload>(token);

        // Verifica as roles permitidas para este layout.
        // Se a role decodificada não for permitida, redireciona.
        // O `UserLayout` parece ser para usuários que NÃO são 'USER' ou 'PE_ADMIN'.
        // Se a intenção é que usuários com 'USER' ou 'PE_ADMIN' sejam redirecionados,
        // então a lógica está correta.
        if (decoded.role === 'USER' || decoded.role === 'PE_ADMIN') {
          router.push('/home'); // Redireciona para uma página de "não autorizado" ou home.
          toast.error('Área restrita. Você não tem permissão para acessar.');
          return; // Sai da função do efeito.
        }

        // Se chegou até aqui, o token é válido e a role é permitida para este layout.
      } catch (error: any) {
        console.error('Erro na autenticação do layout:', error);
        toast.error('Erro de autenticação. Por favor, faça login novamente.');
        localStorage.removeItem('token'); // Remove o token inválido/expirado.
        router.push('/'); // Redireciona para o login.
      } finally {
        // Garante que o estado de carregamento seja definido como false no final do try/catch.
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, [router]); // Array de dependências: o efeito roda apenas uma vez, mas depende do objeto `router`.

  // --- Renderização Condicional (Early Return) ---
  // Mostra o spinner de carregamento enquanto a verificação está em andamento.
  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-50">
        <div className="flex flex-col items-center gap-2">
          <div className="h-10 w-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Carregando...</span>
        </div>
      </div>
    );
  }

  // Se o carregamento terminou e o usuário não foi redirecionado, renderiza os filhos.
  return <>{children}</>;
};

export default UserLayout;
