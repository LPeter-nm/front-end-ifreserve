'use client'; // Indica que este é um componente cliente

// --- Importações de Bibliotecas e Componentes ---
// Agrupando importações por tipo: bibliotecas externas, depois componentes internos.
import { useRouter } from 'next/navigation'; // Importa useRouter para redirecionamento no cliente

import Footer from '@/components/Footer/footer';
import { NewCredentialsForm } from '@/components/FormNewCredentials/new-credentials-form'; // Componente do formulário de novas credenciais
import Navbar from '@/components/NavBarPublic/navibar-public';
import { Button } from '@/components/ui/button';

// --- Componente Principal ---
export default function NewCredentialsPage() {
  // --- Hooks de Navegação ---
  const router = useRouter();

  // --- Handlers de Interação do Usuário ---
  // Funções para lidar com os cliques dos botões de redirecionamento.
  const handleRedirectLogin = () => {
    router.push('/'); // Redireciona para a raiz, que presumivelmente é a página de login.
  };

  const handleRedirectRegister = () => {
    router.push('/register-internal'); // Redireciona para a página de registro interno.
  };

  // --- JSX Principal ---
  // A estrutura principal da UI do componente.
  return (
    <div className="min-h-screen flex flex-col">
      {/* Barra de Navegação Fixa no Topo */}
      <div className="fixed top-0 left-0 w-full z-50">
        <Navbar
          rightContent={
            <>
              <Button
                variant={'outline'}
                onClick={handleRedirectLogin}
                className="bg-[#E3E3E3] text-black w-24 cursor-pointer">
                Login
              </Button>
              <Button
                variant={'outline'}
                onClick={handleRedirectRegister}
                className="bg-[#2C2C2C] text-white w-24 border-0 cursor-pointer">
                Register
              </Button>
            </>
          }
        />
      </div>

      {/* Conteúdo Principal Centralizado */}
      <div className="flex-1 flex items-center justify-center pt-20">
        <div className="w-full max-w-md px-4">
          {/* Formulário de Novas Credenciais */}
          <NewCredentialsForm />
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
