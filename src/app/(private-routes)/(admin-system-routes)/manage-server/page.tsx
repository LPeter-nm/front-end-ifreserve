'use client';
import Footer from '@/components/Footer/footer';
import ServerTable from '@/components/ManageServer/manage-server-table';
import NavbarPrivate, { Role } from '@/components/NavBarPrivate/navbar-private';
import NotificationModal from '@/components/NotificationModal/notification-modal';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface JwtPayload {
  id: string;
  role: string;
}

const ManageServer = () => {
  const [Role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token') as string;
    const decoded = jwtDecode<JwtPayload>(token);

    setRole(decoded.role as Role);
  }, []);

  if (!Role) {
    return null;
  }

  return (
    <div className="flex bg-[#ebe2e2] min-h-screen">
      <NavbarPrivate Role={Role} />

      <div className="flex-1 flex flex-col min-h-screen">
        <main className="p-4 flex-grow">
          <div className="flex items-center gap-2 justify-end">
            <NotificationModal />
          </div>
          <div className="min-h-screen">
            <ServerTable />
          </div>
        </main>

        <Footer
          footer_bg_color="#1E3231"
          text_color="#FFFFFF"
        />
      </div>
    </div>
  );
};

export default ManageServer;
