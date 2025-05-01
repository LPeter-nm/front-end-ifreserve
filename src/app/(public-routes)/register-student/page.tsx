'use client';
import Footer from '@/components/Footer/footer';
import { RegisterStudentForm } from '@/components/FormRegisterStudent/register-student-form';
import Navbar from '@/components/NavBarPublic';
import { Button } from '@/components/ui/button';
import { redirect } from 'next/navigation';

export default function Home() {
  function handleRedirectLogin() {
    redirect('/');
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="fixed top-0 left-0 w-full z-50">
        <Navbar
          rightContent={
            <Button
              variant={'outline'}
              onClick={handleRedirectLogin}
              className="bg-[#E3E3E3] text-black w-24 cursor-pointer">
              Login
            </Button>
          }
        />
      </div>

      <div className="flex-1 flex items-center justify-center pt-20">
        <div className="w-full max-w-md px-4">
          <RegisterStudentForm />
        </div>
      </div>
      <Footer
        footer_bg_color="#00ff7f"
        text_color="#000000"
      />
    </div>
  );
}
