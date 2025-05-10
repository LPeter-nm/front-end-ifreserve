'use client';
import DashboardManageReserve from '@/components/DashboardManageReserve/manage-reserve-dashboard';
import Footer from '@/components/Footer/footer';
import NavbarPrivate, { UserType } from '@/components/NavBarPrivate/navbar-private';
import ReserveSportForm from '@/components/ReserveSportForm/form-reserve-form';
import { Button } from '@/components/ui/button';
import { jwtDecode } from 'jwt-decode';
import { Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface JwtPayload {
  id: string;
  role: string;
}

const ManageReserve = () => {
  const [userType, setUserType] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
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

        setUserType(decoded.role as UserType);
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
      <div className="flex items-center justify-center min-h-screen bg-[#ebe2e2]">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]">
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  if (!userType) {
    return null;
  }

  return (
    <div className="flex bg-[#ebe2e2] min-h-screen">
      <NavbarPrivate userType={userType} />

      <div className="flex-1 flex flex-col min-h-screen">
        <main className="p-4 flex-grow">
          <div className="flex items-center gap-2 justify-end">
            <Button
              variant="ghost"
              size="icon">
              <Bell size={20} />
            </Button>
          </div>
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
