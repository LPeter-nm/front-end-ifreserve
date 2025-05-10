'use client';
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
import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export type Role = 'USER' | 'PE_ADMIN' | 'SISTEMA_ADMIN';

interface NavbarPrivateProps {
  Role: Role;
}

const NavbarPrivate = ({ Role }: NavbarPrivateProps) => {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [activeLink, setActiveLink] = useState<string | null>(null);

  const handleLinkClick = (path: string) => {
    setActiveLink(path);
    router.push(path);
  };

  const handleLogOut = () => {
    localStorage.removeItem('token');
    router.push('/');
    window.location.reload();
  };

  const NavButton = ({
    icon: Icon,
    path,
    label,
    onClick,
  }: {
    icon: React.ComponentType<{ size: number }>;
    path?: string;
    label: string;
    onClick?: () => void;
  }) => (
    <button
      onClick={onClick || (() => handleLinkClick(path as string))}
      className={`cursor-pointer flex items-center gap-3 w-full px-4 group
      ${activeLink === path ? 'text-[#00ff9d]' : ''}`}>
      <div
        className={`w-8 h-8 flex items-center justify-center 
        ${collapsed ? 'mx-auto' : ''} 
        ${
          activeLink === path
            ? 'bg-[#00ff9d] text-[#1e4e4e]'
            : 'group-hover:bg-[#00ff9d] group-hover:text-[#1e4e4e]'
        } rounded-md`}>
        <Icon size={20} />
      </div>
      {!collapsed && <span className="text-xs">{label}</span>}
    </button>
  );

  return (
    <div
      className={`${collapsed ? 'w-20' : 'w-48'} 
      bg-[#1E3231] flex flex-col items-center py-4 min-h-screen 
      transition-all duration-300 ease-in-out relative`}>
      {/* Logo */}
      <div className="mb-8 flex justify-center">
        <Image
          src="/logo-ifreserve.png"
          alt="Logo"
          width={collapsed ? 50 : 90}
          height={40}
          className="object-contain"
        />
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-1/2 transform -translate-y-1/2 
        bg-[#00ff9d] text-[#1e4e4e] rounded-full p-1 z-10
        hover:scale-110 transition-all">
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      {/* Links da sidebar */}
      <nav className="flex flex-col items-center gap-6 text-white w-full">
        {/* Botões comuns a todos os usuários */}
        <NavButton
          icon={Home}
          path="/home"
          label="Início"
        />

        {Role === 'USER' && (
          <NavButton
            icon={History}
            path="/history"
            label="Histórico"
          />
        )}

        {/* Botão de Reservas (admin e general) */}
        {(Role === 'PE_ADMIN' || Role === 'SISTEMA_ADMIN') && (
          <NavButton
            icon={Bookmark}
            path="/manage-reservations"
            label="Reservas"
          />
        )}

        {/* Botões de Gerenciamento (apenas general) */}
        {Role === 'SISTEMA_ADMIN' && (
          <>
            <NavButton
              icon={User}
              path="/students"
              label="Alunos"
            />
            <NavButton
              icon={UserCog}
              path="/staff"
              label="Servidores"
            />
            <NavButton
              icon={Users}
              path="/externals"
              label="Externos"
            />
          </>
        )}

        {/* Botão de Sair (todos os usuários) */}
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
