'use client'; // Indica que este é um componente cliente

// --- Importações de Bibliotecas e Componentes ---
// Agrupando importações por tipo: bibliotecas externas, depois componentes internos.
import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Hook para navegação
import { useForm } from 'react-hook-form'; // Para gerenciamento de formulários
import { zodResolver } from '@hookform/resolvers/zod'; // Integrar Zod com React Hook Form
import { z } from 'zod'; // Para validação de esquema
import { toast } from 'react-hot-toast'; // Para exibir notificações (toasts)

// Componentes de UI locais
import { cn } from '@/lib/utils'; // Função utilitária para classes CSS
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// --- Ações de API (Server Action) ---
import { handleSubmit } from './action'; // Server Action para submeter o código

// --- Esquema de Validação (Zod) ---
// Define o esquema de validação para o campo 'code' do formulário.
const formSchema = z.object({
  code: z.string().min(4, { message: 'O código deve ter 4 caracteres.' }),
});

// --- Tipos de Dados ---
// Define o tipo inferido do esquema de validação.
type FormData = z.infer<typeof formSchema>;

// --- Componente Principal ---
export function CodeForm({ className, ...props }: React.ComponentProps<'div'>) {
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

  // Obtém o e-mail do `localStorage` (assumindo que foi armazenado antes de vir para esta página).
  const email = typeof window !== 'undefined' ? localStorage.getItem('email') : ''; // Acesso seguro ao localStorage

  // --- Handlers de Interação do Usuário ---
  // Função executada quando o formulário é submetido com sucesso.
  async function onSubmit(values: FormData) {
    setIsSubmitting(true); // Ativa o estado de carregamento.

    // Obtém o `tokenId` do `localStorage` (necessário para a Server Action).
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
      formData.append('code', values.code);
      formData.append('tokenId', tokenId); // Anexa o tokenId à FormData.

      const result = await handleSubmit(formData); // Chama a Server Action.

      if (result?.error) {
        toast.error(result.error); // Exibe erro retornado pela Server Action.
      } else if (result?.success) {
        toast.success(result.message || 'Código verificado com sucesso!'); // Exibe mensagem de sucesso.
        setTimeout(() => {
          router.push('/new-credentials'); // Redireciona após 2 segundos.
        }, 2000);
      }
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
            <div className="flex flex-col gap-6">
              <h1 className="flex font-bold justify-center text-xl">Recuperar senha</h1>

              {/* Campo de E-mail (Somente Leitura) */}
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  className="bg-white text-black"
                  id="email"
                  type="email"
                  value={email || ''} // Exibe o e-mail obtido do localStorage.
                  disabled // Desabilitado para que o usuário não possa alterá-lo.
                />
              </div>

              {/* Campo de Código */}
              <div className="grid gap-3">
                <Label htmlFor="code">Código</Label>
                <Input
                  className="bg-white text-black"
                  id="code"
                  type="text"
                  placeholder="Insira o código enviado no e-mail"
                  required // Marca o campo como obrigatório.
                  {...register('code')} // Registra o input no `react-hook-form`.
                />
                {/* Exibe mensagem de erro de validação do Zod/React Hook Form. */}
                {errors.code && <p className="text-red-500 text-sm">{errors.code.message}</p>}
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-5 justify-center items-center">
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
                  {isSubmitting ? 'Comparando código...' : 'Prosseguir'}{' '}
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
