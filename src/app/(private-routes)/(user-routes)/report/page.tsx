'use client'; // Indica que este é um componente cliente

// --- Importações de Bibliotecas e Componentes ---
// Agrupando importações por tipo: bibliotecas externas, depois componentes internos.
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';

import Footer from '@/components/Footer/footer';
import ReportForm from '@/components/FormReport/report-form';
import NavbarPrivate, { Role } from '@/components/NavBarPrivate/navbar-private';
import { useReport } from '@/context/ReportContext'; // Importa o hook do contexto

// --- Interfaces ---
// Definir interfaces próximas ao local de uso, ou em um arquivo separado se forem reusadas.
interface JwtPayload {
  id: string;
  role: string;
}

// --- Componente Principal ---
const ReportPage = () => {
  // --- Estados do Componente ---
  // Agrupar todos os `useState` no início.
  const [userRole, setUserRole] = useState<Role | null>(null); // Renomeado para evitar conflito com a interface Role
  const [isLoading, setIsLoading] = useState(true);

  // --- Hooks de Navegação e Contexto ---
  const router = useRouter();
  const { reportData } = useReport(); // Acessa os dados do relatório do contexto

  // --- Efeitos Colaterais (useEffect) ---
  // Lógica principal para verificação de dados e autenticação.
  useEffect(() => {
    // 1. Inicia o estado de carregamento
    setIsLoading(true);

    // 2. Verifica a existência de dados do relatório no contexto.
    // Esta é a primeira verificação crucial para este componente.
    if (!reportData?.sportId) {
      toast.error('Nenhum dado de reserva encontrado para gerar o relatório.');
      router.push('/home'); // Redireciona para a home se não houver dados.
      // É importante definir isLoading para false aqui para não deixar o spinner travado
      // caso o redirecionamento não seja instantâneo ou por algum motivo a renderização continue.
      setIsLoading(false);
      return; // Sai do useEffect, pois não há dados para processar.
    }

    // 3. Verificação de autenticação (apenas no cliente).
    if (typeof window !== 'undefined') {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          // Se não há token, redireciona para o login.
          router.push('/');
          toast.error('Faça o login para ter acesso a esta página.');
          // Define isLoading para false e sai, já que o redirecionamento será feito.
          setIsLoading(false);
          return;
        }

        const decoded = jwtDecode<JwtPayload>(token);
        setUserRole(decoded.role as Role); // Define a role do usuário.
      } catch (error: any) {
        // Erro na decodificação do token.
        console.error('Erro de autenticação na página de relatório:', error);
        toast.error('Sessão inválida. Por favor, faça login novamente.');
        localStorage.removeItem('token'); // Remove o token inválido.
        router.push('/'); // Redireciona para o login.
        // É importante definir isLoading para false aqui também.
        setIsLoading(false);
      } finally {
        // Garante que o estado de carregamento seja definido como false
        // após todas as verificações e processamentos do token, se não houve redirecionamento.
        // NOTA: Se um `return` foi chamado antes, este `finally` não será executado.
        // O `setIsLoading(false)` já foi tratado nos blocos `if` de erro/redirecionamento.
        // Caso chegue aqui sem redirecionar, significa que o token foi decodificado com sucesso.
        if (!reportData?.sportId) {
          // Verifica novamente caso o estado tenha mudado durante o async operation (unlikely)
          setIsLoading(false);
        } else {
          setIsLoading(false);
        }
      }
    } else {
      // Se não está no ambiente do navegador (SSR), definimos isLoading como false.
      // A lógica do localStorage e decodificação só ocorre no cliente.
      setIsLoading(false);
    }
  }, [reportData, router]); // Dependências: reportData (para reagir a mudanças no contexto) e router.

  // --- Renderização Condicional (Early Returns) ---
  // Mostra o spinner de carregamento enquanto as verificações estão em andamento.
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

  // Se a role não foi definida OU os dados do relatório não estão disponíveis (e não houve redirecionamento anterior),
  // não renderiza o conteúdo principal. Isso pode acontecer se o token for inválido, mas o erro não for crítico
  // o suficiente para redirecionar, ou se reportData se tornar null por algum motivo inesperado.
  if (!userRole || !reportData) {
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
          {/* Formulário de Relatório, preenchido com os dados do contexto */}
          <ReportForm
            sportId={reportData.sportId}
            date={reportData.date}
            timeUsed={reportData.timeUsed}
            userName={reportData.userName}
          />
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

export default ReportPage;
