'use client';

import { ReactNode, useEffect, useState } from 'react';
import { redirect } from 'next/navigation';

const PrivateLayout = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);

    if (!storedToken) {
      redirect('/');
    }
  }, []);

  return <>{children}</>;
};

export default PrivateLayout;
