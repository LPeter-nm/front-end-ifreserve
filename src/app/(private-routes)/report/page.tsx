'use client';
import Footer from '@/components/Footer/footer';
import ReportForm from '@/components/FormReport/report-form';
import NavbarPrivate, { Role } from '@/components/NavBarPrivate/navbar-private';
import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useSearchParams, useRouter } from 'next/navigation';

interface JwtPayload {
  id: string;
  role: string;
}

interface ReportParams {
  sportId: string;
  date: string;
  timeUsed: string;
  userName: string;
}

const Report = () => {
  const [Role, setRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Extrai e decodifica os parâmetros da URL
  const getReportParams = (): ReportParams => {
    const sportId = searchParams.get('sportId') || '';
    const date = searchParams.get('date') || '';
    const timeUsed = searchParams.get('timeUsed') || '';
    const userName = searchParams.get('nameUser') || '';

    return {
      sportId,
      date,
      timeUsed,
      userName: decodeURIComponent(userName),
    };
  };

  const reportParams = getReportParams();

  useEffect(() => {
    // Verifica parâmetros obrigatórios
    if (!reportParams.sportId || !reportParams.date) {
      toast.error('Parâmetros inválidos na URL');
      router.push('/home');
      return;
    }

    // Verificação de autenticação
    if (typeof window !== 'undefined') {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          setIsLoading(false);
          router.push('/login');
          toast.error('Faça o Login para ter acesso');
          return;
        }

        const decoded = jwtDecode<JwtPayload>(token);
        setRole(decoded.role as Role);
      } catch (error: any) {
        console.error('Erro detectado:', error);
        toast.error('Sessão inválida');
        localStorage.removeItem('token');
        window.location.reload();
      } finally {
        setIsLoading(false);
      }
    }
  }, [reportParams.sportId, reportParams.date, router]);

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

  if (!Role) return null;

  return (
    <div className="flex bg-[#ebe2e2] min-h-screen">
      <NavbarPrivate Role={Role} />

      <div className="flex-1 flex flex-col min-h-screen">
        <main className="p-4 flex-grow">
          <div className="flex items-center gap-2 justify-end"></div>
          <ReportForm params={reportParams} />
        </main>

        <Footer
          footer_bg_color="#1E3231"
          text_color="#FFFFFF"
        />
      </div>
    </div>
  );
};

export default Report;
