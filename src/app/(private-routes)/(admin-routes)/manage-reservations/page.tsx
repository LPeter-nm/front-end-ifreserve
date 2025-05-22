'use client';
import DashboardManageReserve from '@/components/DashboardManageReserve/manage-reserve-dashboard';
import Footer from '@/components/Footer/footer';
import NavbarPrivate, { Role } from '@/components/NavBarPrivate/navbar-private';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface JwtPayload {
  id: string;
  role: string;
}

const ManageReserve = () => {
  const [Role, setRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

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
        if (decoded.role === 'USER') {
          router.push('/home');
          toast.error('Área restrita');
        }

        setRole(decoded.role as Role);
      } catch (error: any) {
        console.error('Erro detectado:', error);
        toast.error(error.message);
        localStorage.removeItem('token');
        window.location.reload();
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
    <div className="flex bg-[#ebe2e2] min-h-screen">
      <NavbarPrivate Role={Role} />

      <div className="flex-1 flex flex-col min-h-screen">
        <main className="p-4 flex-grow">
          <div className="flex items-center gap-2 justify-end"></div>
          <DashboardManageReserve />
        </main>

        <Footer
          footer_bg_color="#1E3231"
          text_color="#FFFFFF"
        />
      </div>
    </div>
  );
};

export default ManageReserve;
