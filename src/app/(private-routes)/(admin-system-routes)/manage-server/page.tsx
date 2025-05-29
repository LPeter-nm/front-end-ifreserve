'use client'; // Indica que este é um componente cliente

// --- Importações de Bibliotecas e Componentes ---
// Agrupando importações por tipo: bibliotecas externas, depois componentes internos.
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
// O useRouter e toast não estão sendo usados neste componente, então podem ser removidos.
// import { useRouter } from 'next/navigation';
// import toast from 'react-hot-toast';

import Footer from '@/components/Footer/footer';
import ServerTable from '@/components/ManageServer/manage-server-table'; // Importação do ServerTable
import NavbarPrivate, { Role } from '@/components/NavBarPrivate/navbar-private';
import NotificationModal from '@/components/NotificationModal/notification-modal';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

// --- Interfaces ---
// Definir interfaces próximas ao local de uso, ou em um arquivo separado se forem reusadas.
interface JwtPayload {
  id: string;
  role: string;
}

// --- Componente Principal ---
const ManageServerPage = () => {
  // --- Estados do Componente ---
  // Agrupar todos os `useState` no início.
  const [userRole, setUserRole] = useState<Role | null>(null); // Renomeado para evitar conflito com a interface Role

  const router = useRouter();

  // --- Efeitos Colaterais (useEffect) ---
  // Lógica para decodificar o token e definir a role do usuário.
  useEffect(() => {
    // A verificação `typeof window !== 'undefined'` é crucial para garantir que o localStorage
    // seja acessado apenas no lado do cliente, já que este é um componente cliente.
    if (typeof window !== 'undefined') {
      try {
        const token = localStorage.getItem('token') as string;
        // Verifica se o token existe antes de tentar decodificar.
        if (token) {
          const decoded = jwtDecode<JwtPayload>(token);
          setUserRole(decoded.role as Role);
        } else {
          console.warn('Token não encontrado no localStorage para ManageServer.');
          toast.error('Não autorizado | Token inexistente');
          router.push('/');
        }
      } catch (error) {
        console.error('Erro ao decodificar o token em ManageServer:', error);
        localStorage.removeItem('token');
        window.location.reload();
      }
    }
  }, []); // Array de dependências vazio para rodar apenas uma vez no montagem do componente.

  // --- Renderização Condicional (Early Return) ---
  // Se a role ainda não foi definida, não renderiza nada.
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
            {/* Modal de Notificações */}
            <NotificationModal />
          </div>
          <div className="min-h-screen">
            {/* Tabela para gerenciamento de servidores */}
            <ServerTable />
          </div>
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

export default ManageServerPage;
