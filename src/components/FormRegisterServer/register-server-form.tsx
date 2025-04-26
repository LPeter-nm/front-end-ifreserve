'use client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { handleSubmit } from './action';
import { toast } from 'sonner';

const formSchema = z.object({
  name: z.string().min(5, { message: 'O nome deve ter no mínimo 2 caracteres' }),
  registration: z
    .string()
    .min(6, { message: 'A mátricula deve ter no mínimo 6 caracteres' })
    .max(8, { message: 'A mátricula deve ter no máximo 8 caracteres' }),
  email: z
    .string()
    .min(6, { message: 'Seu email deve ter no mínimo 6 caracteres' })
    .email({ message: 'Digite um email válido' }),
  password: z.string().min(8, { message: 'Sua senha deve ter no mínimo 8 caracteres' }),
});

export function RegisterServerForm({ className, ...props }: React.ComponentProps<'div'>) {
  const [selectedFunction, setSelectedFunction] = useState('');
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
      formData.append('name', values.name);
      formData.append('registration', values.registration);
      formData.append('functionServer', selectedFunction);
      formData.append('email', values.email);
      formData.append('password', values.password);

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

  return (
    <div
      className={cn('flex flex-col gap-6', className)}
      {...props}>
      <Card className="bg-[#264543] border-0 text-white">
        <CardContent>
          <form onSubmit={formHandleSubmit(onSubmit)}>
            {error && (
              <div className="mt-4 mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>
            )}
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
                />
                {errors.registration && (
                  <p className="text-red-500 text-sm">{errors.registration.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="functionServer">Função</Label>
                <Select
                  value={selectedFunction}
                  onValueChange={(value) => setSelectedFunction(value)}>
                  <SelectTrigger
                    id="functionServer"
                    className="w-full bg-white text-black">
                    <SelectValue placeholder="Selecione sua função que exerce no Instituto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PROFESSOR DE EDUCAÇÃO FÍSICA">
                      Professor de Educação Física
                    </SelectItem>
                    <SelectItem value="PROFESSOR">Professor</SelectItem>
                    <SelectItem value="OUTRO">Outro</SelectItem>
                  </SelectContent>
                </Select>
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
