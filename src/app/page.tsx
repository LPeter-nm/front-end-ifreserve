'use client'; // Indica que este é um componente cliente

// --- Importações de Bibliotecas e Componentes ---
// Agrupando importações por tipo: bibliotecas externas, depois componentes internos.
import { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Importa useRouter para redirecionamento no cliente

import Footer from '@/components/Footer/footer';
import { LoginForm } from '@/components/FormLogin/login-form'; // Componente do formulário de login
import Navbar from '@/components/NavBarPublic/navibar-public';
import { Button } from '@/components/ui/button';

// --- Componente Principal ---
export default function LoginPage() {
  // Renomeado o componente para refletir seu propósito
  // --- Hooks de Navegação ---
  const router = useRouter();

  // --- Efeitos Colaterais (useEffect) ---
  // Verifica se o usuário já está logado e redireciona para a home.
  useEffect(() => {
    // A verificação `typeof window !== 'undefined'` é crucial para garantir que o localStorage
    // seja acessado apenas no lado do cliente.
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      // Se um token existe, significa que o usuário já está logado.
      if (token) {
        router.push('/home'); // Redireciona para a página inicial privada.
      }
    }
  }, [router]); // Array de dependências vazio para rodar apenas uma vez na montagem do componente.

  // --- Handlers de Interação do Usuário ---
  // Função para lidar com o clique do botão de redirecionamento para o registro de tipo de usuário.
  const handleRedirectTypeUser = () => {
    router.push('/type-user'); // Redireciona para a página de seleção do tipo de usuário.
  };

  // --- JSX Principal ---
  // A estrutura principal da UI do componente.
  return (
    <div className="min-h-screen flex flex-col">
      {/* Barra de Navegação Fixa no Topo */}
      <div className="fixed top-0 left-0 w-full z-50">
        <Navbar
          rightContent={
            <Button
              variant={'outline'}
              onClick={handleRedirectTypeUser}
              className="bg-[#2C2C2C] text-white w-24 border-0 cursor-pointer">
              Register
            </Button>
          }
        />
      </div>

      {/* Conteúdo Principal Centralizado */}
      <div className="flex-1 flex items-center justify-center pt-20">
        <div className="w-full max-w-md px-4">
          {/* Formulário de Login */}
          <LoginForm />
        </div>
      </div>

      {/* Rodapé */}
      <Footer
        footer_bg_color="#00ff7f"
        text_color="#000000"
      />
    </div>
  );
}
