'use client'; // Indica que este é um componente cliente

// --- Importações de Bibliotecas e Componentes ---
import React from 'react'; // React é necessário para JSX (embora em Next.js moderno possa ser inferido).
import Image from 'next/image'; // Componente Image para otimização de imagens.

// Importa o logo como um módulo de imagem.
import logo from '../../assets/images/logo.png'; // Caminho relativo para o arquivo de imagem.

// --- Interfaces de Props ---
// Define as propriedades que o componente Navbar espera receber.
type NavbarProps = {
  rightContent?: React.ReactNode; // Conteúdo opcional a ser exibido no lado direito da navbar.
};

// --- Componente Principal ---
// O componente Navbar exibe o logo e um espaço para conteúdo dinâmico.
const Navbar = ({ rightContent }: NavbarProps) => {
  return (
    <div className="bg-[#1E3231] h-20 p-3 fixed w-full z-50">
      <div className="flex items-center justify-between h-full px-4 md:px-6 lg:px-8">
        {' '}
        {/* Melhorado espaçamento e alinhamento */}
        {/* Seção do Logo */}
        <div className="flex items-center">
          {/* Usar o componente `next/image` para otimização, acessando `logo.src` */}
          <Image
            src={logo.src} // Fonte da imagem do logo.
            alt="IFReserve Logo" // Texto alternativo para acessibilidade.
            width={90} // Largura original do logo (ajuste conforme necessário).
            height={60} // Altura original do logo (ajuste conforme necessário).
            className="object-contain" // Garante que a imagem se ajuste sem cortar.
            priority // Otimiza o carregamento da imagem, pois é um elemento acima da dobra.
          />
        </div>
        {/* Seção de Conteúdo à Direita (botões, etc.) */}
        <div className="flex items-center gap-4">
          {' '}
          {/* Mantém espaçamento entre itens. */}
          {rightContent} {/* Renderiza o conteúdo passado via prop. */}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
