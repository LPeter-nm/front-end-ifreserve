'use client'; // Indica que este é um componente cliente

// --- Importações de Bibliotecas e Componentes ---
// Agrupando importações por tipo: bibliotecas externas, depois componentes internos.
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Hook para navegação
import { useForm } from 'react-hook-form'; // Para gerenciamento de formulários
import { zodResolver } from '@hookform/resolvers/zod'; // Integrar Zod com React Hook Form
import { z } from 'zod'; // Para validação de esquema
import { toast } from 'react-hot-toast'; // Para exibir notificações (toasts)

// Componentes de UI locais
import { cn } from '@/lib/utils'; // Função utilitária para mesclar classes CSS
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// --- Ações de API (Server Action) ---
import { handleSubmit } from './action'; // Server Action para submeter o registro

// --- Esquema de Validação (Zod) ---
// Define o esquema de validação para os campos do formulário de registro externo.
const formSchema = z.object({
  name: z.string().min(2, { message: 'O nome deve ter no mínimo 2 caracteres.' }),
  cpf: z
    .string()
    .min(14, { message: 'CPF inválido.' }) // 14 caracteres para 000.000.000-00
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, {
      message: 'Formato de CPF inválido (Ex: 000.000.000-00).',
    }),
  phone: z
    .string()
    .min(11, { message: 'Seu telefone deve ter no mínimo 11 caracteres (incluindo DDD).' }),
  // Pode adicionar regex para (00) 0 0000-0000 ou (00) 0000-0000
  address: z.string().min(5, { message: 'Seu endereço deve ter no mínimo 5 caracteres.' }),
  email: z
    .string()
    .min(6, { message: 'Seu email deve ter no mínimo 6 caracteres.' })
    .email({ message: 'Digite um email válido.' }),
  password: z.string().min(8, { message: 'Sua senha deve ter no mínimo 8 caracteres.' }),
});

// --- Tipos de Dados ---
// Define o tipo inferido do esquema de validação para os dados do formulário.
type RegisterFormValues = z.infer<typeof formSchema>;

// --- Componente Principal ---
export function RegisterExternalForm({ className, ...props }: React.ComponentProps<'div'>) {
  // --- Estados do Componente ---
  // `isSubmitting` controla o estado de carregamento durante a submissão do formulário.
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Hooks de Navegação e Formulário ---
  const router = useRouter(); // Instancia o roteador para navegação programática.

  // Configura o `react-hook-form` com o resolver Zod para validação.
  const {
    register, // Função para registrar inputs no formulário.
    handleSubmit: formHandleSubmit, // Função para lidar com a submissão do formulário.
    formState: { errors }, // Objeto que contém os erros de validação.
    setValue, // Função para definir o valor de um campo do formulário programaticamente.
    watch, // Função para "observar" (monitorar) o valor de um campo.
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(formSchema), // Conecta o Zod como resolvedor de validação.
  });

  // Observa o valor do campo 'cpf' para aplicar formatação em tempo real.
  const cpfValue = watch('cpf');

  // --- Efeitos Colaterais (useEffect) ---
  // Efeito para aplicar a formatação do CPF em tempo real.
  useEffect(() => {
    if (cpfValue) {
      // Remove todos os caracteres não numéricos.
      let numericValue = cpfValue.replace(/\D/g, '');

      // Aplica a formatação do CPF (XXX.XXX.XXX-XX).
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

      // Limita o tamanho máximo (14 caracteres com a formatação).
      formattedValue = formattedValue.substring(0, 14);

      // Atualiza o valor do campo 'cpf' no formulário apenas se for diferente do atual,
      // para evitar loops de renderização desnecessários.
      if (formattedValue !== cpfValue) {
        setValue('cpf', formattedValue);
      }
    }
  }, [cpfValue, setValue]); // Dependências: `cpfValue` para reagir a mudanças e `setValue` para atualizar o campo.

  // --- Handlers de Interação do Usuário ---
  // Função executada quando o formulário é submetido com sucesso.
  async function onSubmit(values: RegisterFormValues) {
    setIsSubmitting(true); // Ativa o estado de carregamento.

    try {
      // Remove a formatação do CPF e do telefone antes de enviar os dados para a API,
      // garantindo que o backend receba apenas números.
      const cleanValues = {
        ...values,
        cpf: values.cpf.replace(/\D/g, ''),
        phone: values.phone.replace(/\D/g, ''),
      };

      // Cria um objeto FormData para enviar os dados para a Server Action.
      const formData = new FormData();
      formData.append('name', cleanValues.name);
      formData.append('cpf', cleanValues.cpf);
      formData.append('phone', cleanValues.phone);
      formData.append('address', cleanValues.address);
      formData.append('email', cleanValues.email);
      formData.append('password', cleanValues.password);

      const result = await handleSubmit(formData); // Chama a Server Action de registro.

      if (result?.error) {
        toast.error(result.error); // Exibe erro retornado pela Server Action.
      } else if (result?.success) {
        toast.success(result.message || 'Registro realizado com sucesso!'); // Exibe mensagem de sucesso.
        // Redireciona para a página de login após um pequeno atraso.
        setTimeout(() => {
          router.push('/');
        }, 2000);
      }
    } catch (error) {
      // Captura erros gerais na chamada da Server Action.
      toast.error('Ocorreu um erro durante o registro.');
      console.error('Erro de registro:', error);
    } finally {
      setIsSubmitting(false); // Desativa o estado de carregamento, mesmo em caso de erro.
    }
  }

  // --- JSX Principal ---
  return (
    <div
      className={cn('flex flex-col gap-6', className)} // `cn` para mesclar classes CSS condicionalmente.
      {...props}>
      <Card className="bg-[#264543] border-0 text-white">
        <CardContent>
          <form onSubmit={formHandleSubmit(onSubmit)}>
            {' '}
            {/* Conecta o onSubmit do React Hook Form. */}
            <div className="flex flex-col gap-4">
              {' '}
              {/* Reduzido gap para 4 para campos de formulário. */}
              {/* Campo de Nome */}
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
                {/* Exibe erro de validação para o nome. */}
                {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
              </div>
              {/* Campo de CPF */}
              <div className="grid gap-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  className="bg-white text-black"
                  id="cpf"
                  type="text"
                  placeholder="000.000.000-00"
                  required
                  maxLength={14} // Limita a entrada visualmente para o formato.
                  {...register('cpf')}
                />
                {/* Exibe erro de validação para o CPF. */}
                {errors.cpf && <p className="text-red-500 text-sm">{errors.cpf.message}</p>}
              </div>
              {/* Campo de Telefone */}
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
                {/* Exibe erro de validação para o telefone. */}
                {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
              </div>
              {/* Campo de Endereço */}
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
                {/* Exibe erro de validação para o endereço. */}
                {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
              </div>
              {/* Campo de Email */}
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
                {/* Exibe erro de validação para o email. */}
                {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
              </div>
              {/* Campo de Senha */}
              <div className="grid gap-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  className="bg-white text-black"
                  placeholder="Digite sua senha"
                  id="password"
                  type="password"
                  required
                  {...register('password')}
                />
                {/* Exibe erro de validação para a senha. */}
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password.message}</p>
                )}
              </div>
              {/* Botão de Registro */}
              <div className="flex flex-col gap-3 items-center mt-2">
                {' '}
                {/* Adicionado mt-2 para espaçamento. */}
                <Button
                  type="submit" // Define como tipo "submit" para submeter o formulário.
                  className="w-48 bg-[#E3E3E3] text-black cursor-pointer transition-colors hover:bg-[#d0d0d0]"
                  disabled={isSubmitting}>
                  {' '}
                  {/* Desabilita o botão durante o carregamento. */}
                  {isSubmitting ? 'Registrando...' : 'Registrar'}{' '}
                  {/* Altera texto durante submissão. */}
                </Button>
              </div>
            </div>
            {/* Link para Login */}
            <div className="mt-4 text-center text-sm">
              Já fez cadastro?{' '}
              <a
                href="/" // Usar '/' para redirecionar para a página de login.
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
