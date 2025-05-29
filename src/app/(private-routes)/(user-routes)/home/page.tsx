'use client'; // Indica que este é um componente cliente

// --- Importações de Bibliotecas e Componentes ---
// Agrupando importações por tipo: bibliotecas externas, depois componentes internos.
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

import CalendarHome from '@/components/Calendar/calendar';
import Footer from '@/components/Footer/footer';
import NavbarPrivate, { Role } from '@/components/NavBarPrivate/navbar-private';
import NotificationModal from '@/components/NotificationModal/notification-modal';

// --- Interfaces ---
// Definir interfaces próximas ao local de uso, ou em um arquivo separado se forem reusadas.
interface JwtPayload {
  id: string;
  role: string;
}

// --- Componente Principal ---
const HomePage = () => {
  // --- Estados do Componente ---
  // Agrupar todos os `useState` no início.
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  // --- Efeitos Colaterais (useEffect) ---
  // Lógica para decodificar o token e definir a role do usuário.
  useEffect(() => {
    setIsLoading(true); // Inicia o estado de carregamento

    // A verificação `typeof window !== 'undefined'` é crucial para garantir que o localStorage
    // seja acessado apenas no lado do cliente.
    if (typeof window !== 'undefined') {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          // Se não há token, o usuário não está logado.
          router.push('/');
          // Por enquanto, apenas define role como null e isLoading como false.
          console.warn('Token não encontrado no localStorage na página inicial.');
          toast.error('Você precisa estar logado para acessar esta área.');
          return; // Sai da função do efeito.
        }

        const decoded = jwtDecode<JwtPayload>(token);
        setUserRole(decoded.role as Role); // Define a role do usuário.
      } catch (error: any) {
        console.error('Erro ao decodificar token em HomePage:', error);
        toast.error('Erro de autenticação. Por favor, faça login novamente.');
        localStorage.removeItem('token'); // Remove o token inválido/expirado.
        router.push('/');
      } finally {
        setIsLoading(false); // Garante que o estado de carregamento seja definido como false.
      }
    } else {
      // Caso o componente seja renderizado no lado do servidor, definimos isLoading como false
      // para evitar que o spinner fique preso. A lógica do localStorage só ocorre no cliente.
      setIsLoading(false);
    }
  }, []); // Array de dependências vazio para rodar apenas uma vez na montagem do componente.

  // --- Renderização Condicional (Early Returns) ---
  // Mostra o spinner de carregamento enquanto a verificação está em andamento.
  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-50">
        <div className="flex flex-col items-center gap-2">
          <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Carregando...</span>
        </div>
      </div>
    );
  }

  // Se a role ainda não foi definida (ex: token ausente ou inválido e não houve redirecionamento), não renderiza nada.
  if (!userRole) {
    return null;
  }

  // --- JSX Principal ---
  // A estrutura principal da UI do componente.
  return (
    <div className="flex min-h-screen bg-[#ebe2e2]">
      {/* NavbarPrivate recebe a role do usuário para renderizar links específicos */}
      <NavbarPrivate Role={userRole} />

      <div className="flex-1 flex flex-col min-h-screen">
        <main className="p-4">
          <div className="flex items-center gap-2 justify-end">
            {/* Modal de Notificações */}
            <NotificationModal />
          </div>
          {/* Calendário principal que pode usar a role do usuário */}
          <CalendarHome Role={userRole} />
        </main>

        {/* Rodapé do site */}
        <Footer
          footer_bg_color="#1E3231"
          text_color="#FFFFFF"
        />
      </div>
    </div>
  );
};

export default HomePage;
