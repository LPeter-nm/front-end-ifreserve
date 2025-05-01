'use client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { redirect, useRouter } from 'next/navigation';
import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { handleSubmit } from './action';
import { Eye, EyeOff } from 'lucide-react';

const formSchema = z.object({
  email: z
    .string()
    .min(6, { message: 'Seu email deve ter no mínimo 6 caracteres' })
    .email({ message: 'Digite um email válido' }),
  password: z.string().min(8, { message: 'Sua senha deve ter no mínimo 8 caracteres' }),
});

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit: formHandleLogin,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('email', values.email);
      formData.append('password', values.password);

      const result = await handleSubmit(formData);

      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        localStorage.setItem('token', result.token);

        toast.success(result.message);
        setTimeout(() => {
          router.push('/home');
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  }
  function handleRedirectRestorePass() {
    redirect('/restore-password');
  }

  function handleRedirectTypeUser() {
    redirect('/type-user');
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div
      className={cn('flex flex-col gap-6', className)}
      {...props}>
      <Card className="bg-[#264543] border-0 text-white">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Insira seu email para entrar em sua conta</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={formHandleLogin(onSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  className="bg-white text-black"
                  id="email"
                  type="email"
                  placeholder="Digite seu email"
                  required
                  {...register('email')}
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Senha</Label>
                  <a
                    href="#"
                    onClick={handleRedirectRestorePass}
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline">
                    Esqueceu sua senha?
                  </a>
                </div>
                <div className="relative">
                  <Input
                    className="bg-white text-black pr-10"
                    placeholder="Digite sua senha"
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    {...register('password')}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={togglePasswordVisibility}>
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-3 items-center">
                <Button
                  type="submit"
                  className="w-48 bg-[#E3E3E3] text-black cursor-pointer"
                  disabled={loading}>
                  {loading ? 'Logando...' : 'Login'}
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Ainda não se registrou?{' '}
              <a
                href="#"
                onClick={handleRedirectTypeUser}
                className="cursor-pointer underline underline-offset-4">
                Clique aqui
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
