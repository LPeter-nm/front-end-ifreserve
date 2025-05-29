'use client'; // Indica que este é um componente cliente

// --- Importações de Bibliotecas e Componentes ---
// Agrupando importações por tipo: bibliotecas externas, depois componentes internos.
import React, { useState } from 'react';
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
import { handleSubmit } from './action'; // Server Action para submeter as novas credenciais

// --- Esquema de Validação (Zod) ---
// Define o esquema de validação para a nova senha e confirmação de senha.
const formSchema = z
  .object({
    password: z.string().min(8, { message: 'Sua senha deve ter no mínimo 8 caracteres.' }),
    confirmPassword: z.string(), // O campo é inicialmente apenas uma string
  })
  // Refine para adicionar validação cruzada: as senhas devem coincidir.
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem.', // Mensagem de erro se não coincidirem.
    path: ['confirmPassword'], // O erro será associado ao campo 'confirmPassword'.
  });

// --- Tipos de Dados ---
// Define o tipo inferido do esquema de validação para o formulário.
type FormData = z.infer<typeof formSchema>;

// --- Componente Principal ---
export function NewCredentialsForm({ className, ...props }: React.ComponentProps<'div'>) {
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
  } = useForm<FormData>({
    resolver: zodResolver(formSchema), // Conecta o Zod como resolvedor de validação.
  });

  // --- Handlers de Interação do Usuário ---
  // Função executada quando o formulário é submetido com sucesso.
  async function onSubmit(values: FormData) {
    setIsSubmitting(true); // Ativa o estado de carregamento.

    // Obtém o `tokenId` do `localStorage` (necessário para a Server Action).
    // Acesso seguro a `localStorage` no ambiente do cliente.
    const tokenId = typeof window !== 'undefined' ? localStorage.getItem('tokenId') : null;

    if (!tokenId) {
      toast.error(
        'Token de verificação ausente. Por favor, tente o processo de recuperação novamente.'
      );
      setIsSubmitting(false);
      router.push('/'); // Redireciona para o login ou para o início da recuperação.
      return;
    }

    try {
      // Cria um objeto FormData para enviar os dados para a Server Action.
      const formData = new FormData();
      formData.append('password', values.password); // Anexa a nova senha.
      formData.append('tokenId', tokenId); // Anexa o tokenId.

      const result = await handleSubmit(formData); // Chama a Server Action.

      if (result?.error) {
        toast.error(result.error); // Exibe erro retornado pela Server Action.
      } else if (result?.success) {
        toast.success(result.message || 'Senha alterada com sucesso!'); // Exibe mensagem de sucesso.
        // Redireciona para a página de login após um pequeno atraso.
        setTimeout(() => {
          router.push('/');
        }, 2000);
      }
    } catch (error) {
      // Captura erros gerais na chamada da Server Action.
      toast.error('Ocorreu um erro ao salvar a nova senha.');
      console.error('Erro ao submeter nova senha:', error);
    } finally {
      setIsSubmitting(false); // Desativa o estado de carregamento, mesmo em caso de erro.
    }
  }

  // Função para redirecionar de volta para a página de login.
  function handleRedirectLogin() {
    router.push('/');
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
            <div className="flex flex-col gap-6">
              <h1 className="flex font-bold justify-center text-xl">Recuperar senha</h1>
              {/* Campo de Nova Senha */}
              <div className="grid gap-3">
                <Label htmlFor="new-password">Nova senha</Label>
                <Input
                  className="bg-white text-black"
                  id="new-password"
                  type="password" // Tipo 'password' para ocultar a entrada.
                  placeholder="Digite sua nova senha"
                  required // Marca o campo como obrigatório.
                  {...register('password')} // Registra o input no `react-hook-form`.
                />
                {/* Exibe mensagem de erro de validação para a senha. */}
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password.message}</p>
                )}
              </div>

              {/* Campo de Confirmação de Senha */}
              <div className="grid gap-3">
                <Label htmlFor="confirm-password">Confirme sua nova senha</Label>
                <Input
                  className="bg-white text-black"
                  placeholder="Digite novamente sua nova senha"
                  id="confirm-password"
                  type="password" // Tipo 'password'.
                  required
                  {...register('confirmPassword')} // Registra o input.
                />
                {/* Exibe mensagem de erro de validação para a confirmação de senha. */}
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-3 justify-center items-center">
                <Button
                  type="button" // Define como tipo "button" para não submeter o formulário.
                  onClick={handleRedirectLogin}
                  className="w-36 bg-white text-black cursor-pointer transition-colors">
                  Voltar para Login
                </Button>
                <Button
                  type="submit" // Define como tipo "submit" para submeter o formulário.
                  className="w-36 bg-[#E3E3E3] text-black cursor-pointer transition-colors"
                  disabled={isSubmitting}>
                  {' '}
                  {/* Desabilita o botão enquanto submetendo. */}
                  {isSubmitting ? 'Salvando...' : 'Prosseguir'}{' '}
                  {/* Altera texto durante submissão. */}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
