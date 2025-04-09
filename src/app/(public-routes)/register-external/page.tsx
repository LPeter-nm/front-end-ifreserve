'use client'
import Footer from "@/components/Footer/footer";
import { RegisterExternalForm } from "@/components/FormRegisterExternal/register-external-form";
import Navbar from "@/components/NavBarPublic";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="fixed top-0 left-0 w-full z-50">
        <Navbar rightContent={
          <Button variant={'outline'} className="bg-[#E3E3E3] text-black w-24 cursor-pointer">Login</Button>
        }/> 
      </div>

      <div className="flex-1 flex items-center justify-center pt-20"> 
        <div className="w-full max-w-md px-4">
          <RegisterExternalForm/>
        </div>
      </div>
      <Footer/>
    </div>
  );
}