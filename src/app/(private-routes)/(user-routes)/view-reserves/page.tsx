'use client'; // Indica que este é um componente cliente

// --- Importações de Bibliotecas e Componentes ---
// Agrupando importações por tipo: bibliotecas externas, depois componentes internos.
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

import DashboardViewReserves from '@/components/DashboardViewReserves/view-reserve-dashboard';
import Footer from '@/components/Footer/footer';
import NavbarPrivate, { Role } from '@/components/NavBarPrivate/navbar-private';

// --- Interfaces ---
// Definir interfaces próximas ao local de uso, ou em um arquivo separado se forem reusadas.
interface JwtPayload {
  id: string;
  role: string;
}

// --- Componente Principal ---
const ViewReservesPage = () => {
  // --- Estados do Componente ---
  // Agrupar todos os `useState` no início.
  const [userRole, setUserRole] = useState<Role | null>(null); // Renomeado para evitar conflito com a interface Role
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  // --- Efeitos Colaterais (useEffect) ---
  // Lógica para decodificar o token e definir a role do usuário.
  useEffect(() => {
    setIsLoading(true); // Inicia o estado de carregamentoPage

    // A verificação `typeof window !== 'undefined'` é crucial para garantir que o localStorage
    // seja acessado apenas no lado do cliente.
    if (typeof window !== 'undefined') {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          // Se não há token, o usuário não está logado.
          router.push('/');
          console.warn(
            'Token não encontrado no localStorage na página de visualização de reservas.'
          );
          toast.error('Você precisa estar logado para acessar esta área.');
          return; // Sai da função do efeito.
        }

        const decoded = jwtDecode<JwtPayload>(token);
        setUserRole(decoded.role as Role); // Define a role do usuário.
      } catch (error: any) {
        console.error('Erro ao decodificar token em ViewReserves:', error);
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
  }, []); // Array de dependências vazio para rodar apenas uma vez na montagem do componente.Page

  // --- Renderização Condicional (Early Returns) ---
  // Mostra o spinner de carregamento enquanto a verificação está em andamento.
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#ebe2e2]">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]">
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
            Carregando...
          </span>
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
        <main className="p-4 flex-grow">
          <div className="flex items-center gap-2 justify-end">
            {/* Este div está vazio, pode ser removido se não for usado */}
          </div>
          {/* Dashboard de visualização de reservas */}
          <DashboardViewReserves />
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

export default ViewReservesPage;
