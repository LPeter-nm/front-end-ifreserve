'use client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { handleSubmit } from './action';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  code: z.string().min(4, { message: 'O código deve ter 4 caracteres' }),
});

export function CodeForm({ className, ...props }: React.ComponentProps<'div'>) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit: formHandleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const email = localStorage.getItem('email') as string;
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    const tokenId = localStorage.getItem('tokenId') as string;

    try {
      const formData = new FormData();
      formData.append('code', values.code);
      formData.append('tokenId', tokenId);

      const result = await handleSubmit(formData);

      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        toast.success(result.message);
        setTimeout(() => {
          router.push('/new-credentials');
        }, 2000);
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

              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  className="bg-white text-black"
                  id="email"
                  type="email"
                  value={email || ''}
                  disabled
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="code">Código</Label>
                <Input
                  className="bg-white text-black"
                  id="code"
                  type="text"
                  placeholder="Insira o código enviado no e-mail"
                  required
                  {...register('code')}
                />
                {errors.code && <p className="text-red-500 text-sm">{errors.code.message}</p>}
              </div>

              <div className="flex gap-5 justify-center items-center">
                <Button
                  type="button"
                  onClick={handleRedirectLogin}
                  className="w-36 bg-white text-black cursor-pointer transition-colors">
                  Voltar para Login
                </Button>
                <Button
                  type="submit"
                  className="w-36 bg-[#E3E3E3] text-black cursor-pointer transition-colors"
                  disabled={isSubmitting}>
                  {isSubmitting ? 'Comparando código...' : 'Prosseguir'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
