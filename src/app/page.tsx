'use client';
import Footer from '@/components/Footer/footer';
import { LoginForm } from '@/components/FormLogin/login-form';
import { TypeUserForm } from '@/components/FormTypeUser/typeuser-form';
import Navbar from '@/components/NavBarPublic';
import { Button } from '@/components/ui/button';
import { redirect } from 'next/navigation';

export default function Home() {
  function handleRedirectTypeUser() {
    redirect('/type-user');
  }
  return (
    <div className="min-h-screen flex flex-col">
      <div className="fixed top-0 left-0 w-full z-50">
        <Navbar
          rightContent={
            <Button
              variant={'outline'}
              onClick={handleRedirectTypeUser}
              className="bg-[#2C2C2C] text-white w-24 border-0 cursor-pointer">
              Register
            </Button>
          }
        />
      </div>

      <div className="flex-1 flex items-center justify-center pt-20">
        <div className="w-full max-w-md px-4">
          <LoginForm />
        </div>
      </div>
      <Footer
        footer_bg_color="#00ff7f"
        text_color="#000000"
      />
    </div>
  );
}
