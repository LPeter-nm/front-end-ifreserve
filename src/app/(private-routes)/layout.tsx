'use client';

import { ReactNode, useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';

interface DecodedToken {
  exp: number;
}

const PrivateLayout = ({ children }: { children: ReactNode }) => {
  const [isValid, setIsValid] = useState<boolean | null>(null);

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
    return <div>Carregando...</div>; // Ou algum spinner
  }

  if (!isValid) {
    return null; // O redirecionamento já foi tratado no useEffect
  }

  return <>{children}</>;
};

export default PrivateLayout;
