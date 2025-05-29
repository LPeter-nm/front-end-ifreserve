'use client'; // Indica que este é um componente cliente

// --- Importações de Bibliotecas e Componentes ---
import React, { useState } from 'react'; // React e hooks básicos
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
import { handleSubmit } from './action'; // Server Action para submeter o email de recuperação

// --- Esquema de Validação (Zod) ---
// Define o esquema de validação para o campo 'email' do formulário.
const formSchema = z.object({
  email: z
    .string()
    .min(6, { message: 'Seu email deve ter no mínimo 6 caracteres.' })
    .email({ message: 'Digite um email válido.' }),
});

// --- Tipos de Dados ---
// Define o tipo inferido do esquema de validação.
type FormData = z.infer<typeof formSchema>;

// --- Componente Principal ---
export function RestoreForm({ className, ...props }: React.ComponentProps<'div'>) {
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

    try {
      // Cria um objeto FormData para enviar os dados para a Server Action.
      const formData = new FormData();
      formData.append('email', values.email);

      const result = await handleSubmit(formData); // Chama a Server Action.

      if (result?.error) {
        toast.error(result.error); // Exibe erro retornado pela Server Action.
      } else if (result?.success) {
        // Armazena o email e o tokenId no localStorage para uso posterior no fluxo de recuperação.
        // Acesso seguro a `localStorage` no ambiente do cliente.
        if (typeof window !== 'undefined') {
          localStorage.setItem('email', values.email);
          localStorage.setItem('tokenId', result.tokenId || ''); // `result.tokenId` deve vir da Server Action.
        }
        toast.success(result.message || 'Código enviado com sucesso!'); // Exibe mensagem de sucesso.
        // Redireciona para a página de inserção do código após um pequeno atraso.
        setTimeout(() => {
          router.push('/code-mail');
        }, 2000);
      }
    } catch (error) {
      // Captura erros gerais na chamada da Server Action.
      toast.error('Ocorreu um erro ao enviar o código de recuperação.');
      console.error('Erro no envio de código:', error);
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
              {/* Instruções para o Usuário */}
              <div className="grid gap-3">
                <div className="text-sm">
                  <ol className="list-decimal pl-4 space-y-1 p-2 mb-5">
                    <li>Digite seu e-mail e clique em “Enviar código”.</li>
                    <li>Será enviado um código para o seu e-mail.</li>
                    <li>Digite o código na próxima tela para verificação.</li>
                    <li>Após a verificação, você poderá criar uma nova senha.</li>
                  </ol>
                </div>
                {/* Campo de Email */}
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

              {/* Botões de Ação */}
              <div className="flex gap-5 justify-center items-center">
                <Button
                  type="button" // Define como tipo "button" para não submeter o formulário.
                  onClick={handleRedirectLogin}
                  className="w-36 bg-white text-black cursor-pointer transition-colors hover:bg-gray-200">
                  Voltar para Login
                </Button>
                <Button
                  type="submit" // Define como tipo "submit" para submeter o formulário.
                  className="w-36 bg-[#E3E3E3] text-black cursor-pointer transition-colors hover:bg-[#d0d0d0]"
                  disabled={isSubmitting}>
                  {' '}
                  {/* Desabilita o botão enquanto submetendo. */}
                  {isSubmitting ? 'Enviando código...' : 'Enviar Código'}{' '}
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
