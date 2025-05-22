'use client';
import CalendarHome from '@/components/Calendar/calendar';
import Footer from '@/components/Footer/footer';
import NavbarPrivate, { Role } from '@/components/NavBarPrivate/navbar-private';
import NotificationModal from '@/components/NotificationModal/notification-modal';
import { jwtDecode } from 'jwt-decode';
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
    setIsLoading(true);

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
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-50">
        <div className="flex flex-col items-center gap-2">
          <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Carregando...</span>
        </div>
      </div>
    );
  }

  if (!Role) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[#ebe2e2]">
      <NavbarPrivate Role={Role} />

      <div className="flex-1 flex flex-col min-h-screen">
        <main className="p-4">
          <div className="flex items-center gap-2 justify-end">
            <NotificationModal />
          </div>
          <CalendarHome Role={Role} />
        </main>

        <Footer
          footer_bg_color="#1E3231"
          text_color="#FFFFFF"
        />
      </div>
    </div>
  );
};

export default HomeUser;
