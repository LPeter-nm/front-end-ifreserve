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

export type UserType = 'USER' | 'ADMIN' | 'GENERAL';

interface NavbarPrivateProps {
  userType: UserType;
}

const NavbarPrivate = ({ userType }: NavbarPrivateProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeLink, setActiveLink] = useState('inicio');

  const handleLinkClick = (linkName: string) => {
    setActiveLink(linkName);
    console.log(`Navegando para: ${linkName}`);
  };

  const handleLogOut = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  const NavButton = ({
    icon: Icon,
    linkName,
    label,
    onClick,
  }: {
    icon: React.ComponentType<{ size: number }>;
    linkName: string;
    label: string;
    onClick?: () => void;
  }) => (
    <button
      onClick={onClick || (() => handleLinkClick(linkName))}
      className={`cursor-pointer flex items-center gap-3 w-full px-4 group
      ${activeLink === linkName ? 'text-[#00ff9d]' : ''}`}>
      <div
        className={`w-8 h-8 flex items-center justify-center 
        ${collapsed ? 'mx-auto' : ''} 
        ${
          activeLink === linkName
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
          linkName="inicio"
          label="Início"
        />

        {userType === 'USER' && (
          <NavButton
            icon={History}
            linkName="historico"
            label="Histórico"
          />
        )}

        {/* Botão de Reservas (admin e general) */}
        {(userType === 'ADMIN' || userType === 'GENERAL') && (
          <NavButton
            icon={Bookmark}
            linkName="reservas"
            label="Reservas"
          />
        )}

        {/* Botões de Gerenciamento (apenas general) */}
        {userType === 'GENERAL' && (
          <>
            <NavButton
              icon={User}
              linkName="gerenciar-alunos"
              label="Alunos"
            />
            <NavButton
              icon={UserCog}
              linkName="gerenciar-servidores"
              label="Servidores"
            />
            <NavButton
              icon={Users}
              linkName="gerenciar-externos"
              label="Externos"
            />
          </>
        )}

        {/* Botão de Sair (todos os usuários) */}
        <NavButton
          icon={LogOut}
          linkName="sair"
          label="Sair"
          onClick={handleLogOut}
        />
      </nav>
    </div>
  );
};

export default NavbarPrivate;
