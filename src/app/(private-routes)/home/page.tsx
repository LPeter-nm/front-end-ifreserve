'use client';
import CalendarHome from '@/components/Calendar/calendar';
import Footer from '@/components/Footer/footer';
import NavbarPrivate, { Role } from '@/components/NavBarPrivate/navbar-private';
import { Button } from '@/components/ui/button';
import { jwtDecode } from 'jwt-decode';
import { Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface JwtPayload {
  id: string;
  role: string;
}

const HomeUser = () => {
  const [Role, setRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verifica se estamos no cliente antes de acessar localStorage
    if (typeof window !== 'undefined') {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          setIsLoading(false);
          return;
        }

        const decoded = jwtDecode<JwtPayload>(token);
        setRole(decoded.role as Role);
      } catch (error: any) {
        console.error('Error decoding token:', error);
        toast.error(error.message);
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#ebe2e2]">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]">
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  if (!Role) {
    // Redirecionar para login ou mostrar conteúdo para usuário não autenticado
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[#ebe2e2]">
      {/* Sidebar (NavbarPrivate) fixo */}
      <NavbarPrivate Role={Role} />

      {/* Conteúdo principal + Footer */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Conteúdo principal */}
        <main className="p-4">
          <div className="flex items-center gap-2 justify-end">
            <Button
              variant="ghost"
              size="icon">
              <Bell size={20} />
            </Button>
          </div>
          <CalendarHome Role={Role} />
        </main>

        {/* Footer */}
        <Footer
          footer_bg_color="#1E3231"
          text_color="#FFFFFF"
        />
      </div>
    </div>
  );
};

export default HomeUser;
