'use client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { z } from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { handleSubmit } from './action';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const formSchema = z
  .object({
    password: z.string().min(8, { message: 'Sua senha deve ter no mínimo 8 caracteres' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

export function NewCredentialsForm({ className, ...props }: React.ComponentProps<'div'>) {
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

      formData.append('password', values.password);
      formData.append('tokenId', localStorage.getItem('tokenId') as string);

      const result = await handleSubmit(formData);

      if (result?.error) {
        setError(result.error);
        toast.error(result.error);
      } else if (result?.success) {
        toast.success(result.message);
        alert(result.message);
        router.push('/');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleRedirectLogin() {
    router.push('/');
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
              {error && (
                <div className="mt-4 mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>
              )}
              <div className="grid gap-3">
                <Label htmlFor="new-password">Nova senha</Label>
                <Input
                  className="bg-white text-black"
                  id="new-password"
                  type="password"
                  placeholder="Digite sua nova senha"
                  required
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password.message}</p>
                )}
              </div>
              <div className="grid gap-3">
                <Label htmlFor="confirm-password">Confirme sua nova senha</Label>
                <Input
                  className="bg-white text-black"
                  placeholder="Digite novamente sua nova senha"
                  id="confirm-password"
                  type="password"
                  required
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>
                )}
              </div>
              <div className="flex gap-3 justify-center items-center">
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
                  {isSubmitting ? 'Salvando...' : 'Prosseguir'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
