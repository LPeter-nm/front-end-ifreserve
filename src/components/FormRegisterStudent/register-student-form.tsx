'use client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { handleSubmit } from './action';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  name: z.string().min(5, { message: 'O nome deve ter no mínimo 5 caracteres' }),
  registration: z
    .string()
    .min(16, { message: 'A matrícula deve ter exatamente 16 caracteres' })
    .regex(/^\d{5}TMN\.[A-Z]{3}\d{4}$/, {
      message: 'Formato inválido. Use: 00000TMN.XXX0000 (ex: 20221TMN.ADM0034)',
    }),
  email: z
    .string()
    .min(6, { message: 'Seu email deve ter no mínimo 6 caracteres' })
    .email({ message: 'Digite um email válido' }),
  password: z.string().min(8, { message: 'Sua senha deve ter no mínimo 8 caracteres' }),
});

export function RegisterStudentForm({ className, ...props }: React.ComponentProps<'div'>) {
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
      formData.append('name', values.name);
      formData.append('registration', values.registration);
      formData.append('email', values.email);
      formData.append('password', values.password);

      const result = await handleSubmit(formData);

      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        toast.success(result.message);
        setTimeout(() => {
          router.push('/');
        }, 2000);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className={cn('flex flex-col gap-6', className)}
      {...props}>
      <Card className="bg-[#264543] border-0 text-white">
        <CardContent>
          <form onSubmit={formHandleSubmit(onSubmit)}>
            <div className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  className="bg-white text-black"
                  id="name"
                  type="text"
                  placeholder="Digite seu nome"
                  required
                  {...register('name')}
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="registration">Matrícula</Label>
                <Input
                  className="bg-white text-black"
                  id="registration"
                  type="text"
                  placeholder="Digite sua matrícula"
                  required
                  {...register('registration')}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase();
                    e.target.value = value;
                  }}
                />
                {errors.registration && (
                  <p className="text-red-500 text-sm">{errors.registration.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  className="bg-white text-black"
                  id="email"
                  type="email"
                  placeholder="Digite seu email"
                  {...register('email')}
                  required
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Senha</Label>
                </div>
                <Input
                  className="bg-white text-black"
                  placeholder="Digite sua senha"
                  id="password"
                  type="password"
                  {...register('password')}
                  required
                />
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-3 items-center">
                <Button
                  type="submit"
                  className="w-48 bg-[#E3E3E3] text-black cursor-pointer transition-colors"
                  disabled={isSubmitting}>
                  {isSubmitting ? 'Registrando...' : 'Registrar'}
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Já fez cadastro?{' '}
              <a
                href="#"
                className="cursor-pointer underline underline-offset-4">
                Faça login
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
