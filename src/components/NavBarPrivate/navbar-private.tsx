'use client'; // Indica que este é um componente cliente

// --- Importações de Bibliotecas e Componentes ---
// Agrupando importações por tipo: bibliotecas externas, depois componentes internos.
import React, { useState } from 'react'; // React e hooks básicos
import { useRouter } from 'next/navigation'; // Hook para navegação
import toast from 'react-hot-toast'; // Para exibir notificações (toasts)
import Image from 'next/image'; // Para otimização de imagens no Next.js

// Ícones
import {
  ChevronLeft,
  ChevronRight,
  Home,
  History,
  LogOut,
  Bookmark,
  Users,
  User,
  UserCog,
} from 'lucide-react';

// --- Tipos de Dados ---
// Define os possíveis papéis (roles) dos usuários.
export type Role = 'USER' | 'PE_ADMIN' | 'SISTEMA_ADMIN';

// --- Interfaces de Props ---
interface NavbarPrivateProps {
  Role: Role; // O papel do usuário logado, usado para renderização condicional de links.
}

// --- Componente Principal ---
const NavbarPrivate = ({ Role }: NavbarPrivateProps) => {
  // --- Hooks de Navegação ---
  const router = useRouter(); // Instancia o roteador para navegação programática.

  // --- Estados do Componente ---
  // `collapsed` controla se a barra de navegação está recolhida ou expandida.
  const [collapsed, setCollapsed] = useState(false);
  // `activeLink` armazena o caminho do link ativo para aplicar estilos de destaque.
  const [activeLink, setActiveLink] = useState<string | null>(null);

  // --- Handlers de Interação do Usuário ---
  // Lida com o clique em um link da navegação.
  const handleLinkClick = (path: string) => {
    setActiveLink(path); // Define o link ativo.
    router.push(path); // Navega para o caminho especificado.
  };

  // Lida com a ação de logout do usuário.
  const handleLogOut = async () => {
    try {
      if (typeof window !== 'undefined') {
        // Acesso seguro ao localStorage no cliente.
        localStorage.removeItem('token'); // Remove o token do armazenamento local.
      }
      toast.success('Sessão encerrada com sucesso.'); // Feedback ao usuário.
      router.push('/'); // Redireciona para a página de login.
      window.location.reload(); // Recarrega a página para garantir a limpeza completa do estado.
    } catch (error: any) {
      toast.error(error.message || 'Erro ao realizar logout.');
      console.error('Erro no logout:', error);
    }
  };

  // --- Sub-Componentes de Renderização (para organização do JSX) ---
  // Componente auxiliar para renderizar botões de navegação, promovendo reusabilidade.
  interface NavButtonProps {
    icon: React.ComponentType<{ size: number; className?: string }>; // Tipo para o componente de ícone.
    path?: string; // Caminho para navegação (opcional se houver onClick).
    label: string; // Texto do botão.
    onClick?: () => void; // Função de clique personalizada (opcional).
  }

  const NavButton: React.FC<NavButtonProps> = ({ icon: Icon, path, label, onClick }) => (
    <button
      onClick={onClick || (() => handleLinkClick(path as string))} // Usa onClick personalizado ou o handleLinkClick padrão.
      // Estilos condicionais para o botão e seu ícone com base no estado `collapsed` e `activeLink`.
      className={`cursor-pointer flex items-center gap-3 w-full px-4 py-2 rounded-md transition-colors
      ${
        activeLink === path ? 'text-[#00ff9d] bg-[#1e4e4e]' : 'text-white hover:bg-[#2c4241] group'
      }`}>
      <div
        className={`w-8 h-8 flex items-center justify-center 
        ${collapsed ? 'mx-auto' : ''} 
        ${
          activeLink === path
            ? 'bg-[#00ff9d] text-[#1e4e4e]'
            : 'group-hover:bg-[#00ff9d] group-hover:text-[#1e4e4e]'
        } rounded-md transition-colors`}>
        <Icon size={20} />
      </div>
      {!collapsed && <span className="text-sm font-medium">{label}</span>}{' '}
      {/* Label visível apenas quando expandido. */}
    </button>
  );

  // --- JSX Principal ---
  return (
    <div
      // Estilos da barra de navegação, com largura condicional baseada no estado `collapsed`.
      className={`${collapsed ? 'w-20' : 'w-56'} 
      bg-[#1E3231] flex flex-col items-center py-4 min-h-screen 
      transition-all duration-300 ease-in-out relative z-20`}>
      {' '}
      {/* Adicionado z-index para garantir que fique acima do conteúdo */}
      {/* Logo */}
      <div className="mb-8 flex justify-center">
        <Image
          src="/logo-ifreserve.png"
          alt="Logo"
          width={collapsed ? 50 : 90} // Largura condicional.
          height={40}
          className="object-contain"
        />
      </div>
      {/* Botão de Expandir/Recolher (Chevron) */}
      <button
        onClick={() => setCollapsed(!collapsed)} // Alterna o estado `collapsed`.
        className="absolute -right-3 top-1/2 transform -translate-y-1/2 
        bg-[#00ff9d] text-[#1e4e4e] rounded-full p-1 z-10
        hover:scale-110 transition-all duration-300">
        {' '}
        {/* Adicionado duration para o hover */}
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
      {/* Links da Sidebar (Navegação Principal) */}
      <nav className="flex flex-col items-start gap-6 text-white w-full px-2 mt-8">
        {' '}
        {/* Ajustado gap e padding */}
        {/* Botões comuns a todos os usuários */}
        <NavButton
          icon={Home}
          path="/home"
          label="Início"
        />
        {Role === 'USER' && (
          <NavButton
            icon={History}
            path="/view-reserves"
            label="Minhas Reservas"
          />
        )}
        {/* Botões de Gerenciamento de Reservas (apenas Admins) */}
        {(Role === 'PE_ADMIN' || Role === 'SISTEMA_ADMIN') && (
          <NavButton
            icon={Bookmark}
            path="/manage-reservations"
            label="Gerenciar Reservas"
          />
        )}
        {/* Botões de Gerenciamento de Usuários (apenas SISTEMA_ADMIN) */}
        {Role === 'SISTEMA_ADMIN' && (
          <>
            <NavButton
              icon={User}
              path="/manage-student"
              label="Gerenciar Alunos"
            />
            <NavButton
              icon={UserCog}
              path="/manage-server"
              label="Gerenciar Servidores"
            />
            <NavButton
              icon={Users}
              path="/manage-external"
              label="Gerenciar Externos"
            />
          </>
        )}
        {/* Botão de Sair (comum a todos, com onClick personalizado) */}
        <NavButton
          icon={LogOut}
          label="Sair"
          onClick={handleLogOut}
        />
      </nav>
    </div>
  );
};

export default NavbarPrivate;
