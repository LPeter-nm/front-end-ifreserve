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
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  name: z.string().min(2, { message: 'O nome deve ter no mínimo 2 caracteres' }),
  cpf: z
    .string()
    .min(14, { message: 'CPF inválido' })
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, { message: 'Formato de CPF inválido' }),
  phone: z.string().min(11, { message: 'Seu telefone deve ter no mínimo 11 caracteres' }),
  address: z.string().min(5, { message: 'Seu endereço deve ter no mínimo 5 caracteres' }),
  email: z
    .string()
    .min(6, { message: 'Seu email deve ter no mínimo 6 caracteres' })
    .email({ message: 'Digite um email válido' }),
  password: z.string().min(8, { message: 'Sua senha deve ter no mínimo 8 caracteres' }),
});

export function RegisterExternalForm({ className, ...props }: React.ComponentProps<'div'>) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit: formHandleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const cpfValue = watch('cpf');

  useEffect(() => {
    if (cpfValue) {
      // Remove todos os caracteres não numéricos
      const numericValue = cpfValue.replace(/\D/g, '');

      // Aplica a formatação do CPF (XXX.XXX.XXX-XX)
      let formattedValue = numericValue;
      if (numericValue.length > 3) {
        formattedValue = `${numericValue.substring(0, 3)}.${numericValue.substring(3)}`;
      }
      if (numericValue.length > 6) {
        formattedValue = `${formattedValue.substring(0, 7)}.${formattedValue.substring(7)}`;
      }
      if (numericValue.length > 9) {
        formattedValue = `${formattedValue.substring(0, 11)}-${formattedValue.substring(11)}`;
      }

      // Limita o tamanho máximo (14 caracteres com a formatação)
      formattedValue = formattedValue.substring(0, 14);

      // Atualiza o valor apenas se for diferente do atual
      if (formattedValue !== cpfValue) {
        setValue('cpf', formattedValue);
      }
    }
  }, [cpfValue, setValue]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    try {
      // Remove a formatação antes de enviar
      const cleanValues = {
        ...values,
        cpf: values.cpf.replace(/\D/g, ''),
        phone: values.phone.replace(/\D/g, ''),
      };

      const formData = new FormData();
      formData.append('name', cleanValues.name);
      formData.append('cpf', cleanValues.cpf);
      formData.append('phone', cleanValues.phone);
      formData.append('address', cleanValues.address);
      formData.append('email', cleanValues.email);
      formData.append('password', cleanValues.password);

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
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  className="bg-white text-black"
                  id="cpf"
                  type="text"
                  placeholder="000.000.000-00"
                  required
                  maxLength={14}
                  {...register('cpf')}
                />
                {errors.cpf && <p className="text-red-500 text-sm">{errors.cpf.message}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  className="bg-white text-black"
                  id="phone"
                  type="text"
                  placeholder="(00) 0 0000-0000"
                  required
                  {...register('phone')}
                />
                {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  className="bg-white text-black"
                  id="address"
                  type="text"
                  placeholder="Rua exemplo; Bairro exemplo; n. EX"
                  required
                  {...register('address')}
                />
                {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
              </div>

              <div className="grid gap-2">
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

              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Senha</Label>
                </div>
                <Input
                  className="bg-white text-black"
                  placeholder="Digite sua senha"
                  id="password"
                  type="password"
                  required
                  {...register('password')}
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
