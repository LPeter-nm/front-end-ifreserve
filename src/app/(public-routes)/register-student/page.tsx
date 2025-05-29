'use client'; // Indica que este é um componente cliente

// --- Importações de Bibliotecas e Componentes ---
// Agrupando importações por tipo: bibliotecas externas, depois componentes internos.
import { useRouter } from 'next/navigation'; // Importa useRouter para redirecionamento no cliente

import Footer from '@/components/Footer/footer';
import { RegisterStudentForm } from '@/components/FormRegisterStudent/register-student-form'; // Componente do formulário de registro de estudante
import Navbar from '@/components/NavBarPublic/navibar-public';
import { Button } from '@/components/ui/button';

// --- Componente Principal ---
export default function RegisterStudentPage() {
  // --- Hooks de Navegação ---
  const router = useRouter();

  // --- Handlers de Interação do Usuário ---
  // Função para lidar com o clique do botão de redirecionamento para o Login.
  const handleRedirectLogin = () => {
    router.push('/'); // Redireciona para a raiz, que presumivelmente é a página de login.
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
              onClick={handleRedirectLogin}
              className="bg-[#E3E3E3] text-black w-24 cursor-pointer">
              Login
            </Button>
          }
        />
      </div>

      {/* Conteúdo Principal Centralizado */}
      <div className="flex-1 flex items-center justify-center pt-20">
        <div className="w-full max-w-md px-4">
          {/* Formulário de Registro de Estudante */}
          <RegisterStudentForm />
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
