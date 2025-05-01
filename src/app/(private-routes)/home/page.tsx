'use client';
import Footer from '@/components/Footer/footer';
import NavbarPrivate, { UserType } from '@/components/NavBarPrivate/navbar-private';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  id: string;
  role: string;
}

const token = localStorage.getItem('token') as string;

const HomeUser = () => {
  if (!token) {
    return null;
  }

  const decoded = jwtDecode<JwtPayload>(token);
  const userType = decoded.role as UserType;

  return (
    <div className="flex min-h-screen bg-[#F5F5F5]">
      {/* Sidebar (NavbarPrivate) fixo */}
      <NavbarPrivate userType={userType} />

      {/* Conteúdo principal + Footer (ocupam o restante do espaço) */}
      <div className="flex-1 flex flex-col">
        {/* Conteúdo principal (cresce para ocupar o espaço disponível) */}
        <main className="flex-grow p-4">
          {/* Seu conteúdo aqui */}
          <p>Conteúdo principal da página</p>
        </main>

        {/* Footer (sempre no final) */}
        <Footer
          footer_bg_color="#1E3231"
          text_color="#FFFFFF"
        />
      </div>
    </div>
  );
};

export default HomeUser;
