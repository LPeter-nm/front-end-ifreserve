'use client'; // Indica que este é um componente cliente

// --- Importações de Bibliotecas e Componentes ---
// Agrupando importações por tipo: bibliotecas externas, depois componentes internos.
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';

import DashboardManageReserve from '@/components/DashboardManageReserve/manage-reserve-dashboard';
import Footer from '@/components/Footer/footer';
import NavbarPrivate, { Role } from '@/components/NavBarPrivate/navbar-private';

// --- Interfaces ---
// Definir interfaces próximas ao local de uso, ou em um arquivo separado se forem reusadas.
interface JwtPayload {
  id: string;
  role: string;
}

// --- Componente Principal ---
const ManageReservePage = () => {
  // --- Estados do Componente ---
  // Agrupar todos os `useState` no início.
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- Hooks de Navegação ---
  const router = useRouter();

  // --- Efeitos Colaterais (useEffect) ---
  // Lógica de autenticação e redirecionamento.
  useEffect(() => {
    // A verificação `typeof window !== 'undefined'` é importante para garantir que o localStorage
    // seja acessado apenas no lado do cliente.
    if (typeof window !== 'undefined') {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          // Se não há token, o usuário não está autenticado. Redirecionar para login.
          router.push('/');
          toast.error('Você precisa estar logado para acessar esta área.');
          setIsLoading(false);
          return;
        }

        const decoded = jwtDecode<JwtPayload>(token);

        // Verifica a permissão do usuário.
        if (decoded.role === 'USER') {
          router.push('/');
          toast.error('Área restrita. Você não tem permissão para acessar.');
          setIsLoading(false);
          return;
        }

        setUserRole(decoded.role as Role); // Define a role do usuário.
      } catch (error: any) {
        console.error('Erro na autenticação:', error);
        toast.error('Erro na autenticação. Por favor, faça login novamente.');
        localStorage.removeItem('token'); // Remove token inválido/expirado.
        window.location.reload(); // Recarrega a página para iniciar um novo fluxo de login.
      } finally {
        setIsLoading(false); // Finaliza o carregamento.
      }
    }
  }, [router]); // `router` como dependência para garantir que o efeito reaja a mudanças na instância do router.

  // --- Renderização Condicional (Early Returns) ---
  // Lógica de renderização baseada no estado de carregamento e permissão.
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

  // Se o usuário não tem uma role definida após o carregamento (e não foi redirecionado),
  // isso pode indicar que ele não tem permissão ou que algo deu errado na decodificação.
  // Neste caso, retornar `null` (ou redirecionar) é apropriado.
  if (!userRole) {
    return null;
  }

  // --- JSX Principal ---
  // A estrutura principal da UI do componente.
  return (
    <div className="flex bg-[#ebe2e2] min-h-screen">
      {/* NavbarPrivate recebe a role do usuário para renderizar links específicos */}
      <NavbarPrivate Role={userRole} />

      <div className="flex-1 flex flex-col min-h-screen">
        <main className="p-4 flex-grow">
          <div className="flex items-center gap-2 justify-end">
            {/* Este div está vazio, pode ser removido se não for usado */}
          </div>
          {/* Componente principal de gerenciamento de reservas */}
          <DashboardManageReserve />
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

export default ManageReservePage;
