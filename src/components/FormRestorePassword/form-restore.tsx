'use client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { handleSubmit } from './action';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  email: z
    .string()
    .min(6, { message: 'Seu email deve ter no mínimo 6 caracteres' })
    .email({ message: 'Digite um email válido' }),
});

export function RestoreForm({ className, ...props }: React.ComponentProps<'div'>) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit: formHandleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('email', values.email);

      const result = await handleSubmit(formData);

      localStorage.setItem('email', values.email);
      localStorage.setItem('tokenId', result.tokenId);

      if (result?.error) {
        setError(result.error);
        toast.error(result.error);
      } else if (result?.success) {
        toast.success(result.message);
        alert(result.message);
        router.push('/code-mail');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleRedirectLogin() {
    redirect('/');
  }

  return (
    <div
      className={cn('flex flex-col gap-6', className)}
      {...props}>
      <Card className="bg-[#264543] border-0 text-white">
        <CardContent>
          <form onSubmit={formHandleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <h1 className="flex font-bold justify-center text-xl">Recuperar senha</h1>
              <div className="grid gap-3">
                <div className="text-sm">
                  <ol className="list-decimal pl-4 space-y-1 p-2 mb-5">
                    <li>Digite seu e-mail e clique em “Enviar código”</li>
                    <li>Será enviado um código em seu e-mail</li>
                    <li>Digite o código</li>
                    <li>Após a verificação, você poderá criar uma nova senha.</li>
                  </ol>
                </div>
                {error && (
                  <div className="mt-4 mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>
                )}
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
              <div className="flex gap-5 justify-center items-center">
                <Button
                  type="submit"
                  onClick={handleRedirectLogin}
                  className="w-36 bg-white text-black cursor-pointer transition-colors">
                  Voltar para Login
                </Button>
                <Button
                  type="submit"
                  className="w-36 bg-[#E3E3E3] text-black cursor-pointer transition-colors"
                  disabled={isSubmitting}>
                  {isSubmitting ? 'Enviando código...' : 'Enviar Código'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
