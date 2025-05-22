'use client';

import { ReactNode, useEffect, useState } from 'react';
import { redirect, useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';

interface DecodedToken {
  exp: number;
}

const PrivateLayout = ({ children }: { children: ReactNode }) => {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const storedToken = localStorage.getItem('token');

      if (!storedToken) {
        setIsValid(false);
        redirect('/');
        return;
      }

      try {
        const decoded = jwtDecode<DecodedToken>(storedToken);
        const isExpired = Date.now() >= decoded.exp * 1000;

        if (isExpired) {
          toast.error('Sua sessão expirou | Faça Login novamente');
          localStorage.removeItem('token');
          setIsValid(false);
          redirect('/?expired=true');
        } else {
          setIsValid(true);
          router.push('home');
        }
      } catch (error) {
        toast.error('Sua sessão expirou | Faça Login novamente');
        console.error('Token inválido:', error);
        localStorage.removeItem('token');
        setIsValid(false);
        redirect('/');
      }
    };

    checkAuth();

    // Opcional: Verificar periodicamente (a cada minuto, por exemplo)
    const interval = setInterval(checkAuth, 60000);
    return () => clearInterval(interval);
  }, []);

  if (isValid === null) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-50">
        <div className="flex flex-col items-center gap-2">
          <div className="h-10 w-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Carregando...</span>
        </div>
      </div>
    );
  }

  if (!isValid) {
    return null;
  }

  return <>{children}</>;
};

export default PrivateLayout;
