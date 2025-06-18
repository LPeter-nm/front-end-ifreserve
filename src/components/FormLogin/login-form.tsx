'use client'; // Indica que este é um componente cliente

// --- Importações de Bibliotecas e Componentes ---
// Agrupando importações por tipo: bibliotecas externas, depois componentes internos.
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // Hooks para navegação e parâmetros de URL
import { useForm } from 'react-hook-form'; // Para gerenciamento de formulários
import { zodResolver } from '@hookform/resolvers/zod'; // Integrar Zod com React Hook Form
import { z } from 'zod'; // Para validação de esquema
import { toast } from 'react-hot-toast'; // Para exibir notificações (toasts)
import { Eye, EyeOff } from 'lucide-react'; // Ícones de olho para exibir/ocultar senha
import { jwtDecode } from 'jwt-decode'; // Para decodificar tokens JWT

// Componentes de UI locais
import { cn } from '@/lib/utils'; // Função utilitária para mesclar classes CSS
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// --- Ações de API (Server Action) ---
import { handleSubmit } from './action'; // Server Action para submeter os dados de login
import Image from 'next/image';
import google from '../../assets/images/google.png';

// --- Interfaces ---
// Define a estrutura esperada para um token JWT decodificado.
interface DecodedToken {
  exp: number; // Timestamp de expiração do token (em segundos desde a Época).
  [key: string]: any; // Permite outras propriedades no token.
}

// --- Esquema de Validação (Zod) ---
// Define o esquema de validação para os campos 'email' e 'password' do formulário.
const formSchema = z.object({
  email: z
    .string()
    .min(6, { message: 'Seu email deve ter no mínimo 6 caracteres.' })
    .email({ message: 'Digite um email válido.' }),
  password: z.string().min(8, { message: 'Sua senha deve ter no mínimo 8 caracteres.' }),
});

// --- Tipos de Dados ---
// Define o tipo inferido do esquema de validação para o formulário.
type LoginFormValues = z.infer<typeof formSchema>;

// --- Componente Principal ---
export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
  // --- Hooks de Navegação e Estado ---
  const router = useRouter(); // Hook para navegação programática.
  const searchParams = useSearchParams(); // Hook para acessar parâmetros de URL.

  // --- Estados do Componente ---
  const [loading, setLoading] = useState(false); // Controla o estado de carregamento do login.
  const [showPassword, setShowPassword] = useState(false); // Controla a visibilidade da senha.
  const [hasTokenExpired, setHasTokenExpired] = useState(false); // Indica se o login é devido a um token expirado.

  // --- Configuração do Formulário (React Hook Form) ---
  const {
    register, // Função para registrar inputs no formulário.
    handleSubmit: formHandleLogin, // Função para lidar com a submissão do formulário.
    formState: { errors }, // Objeto que contém os erros de validação do formulário.
  } = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema), // Conecta o Zod como resolvedor de validação.
  });

  // --- Efeitos Colaterais (useEffect) ---
  // 1. Efeito para verificar o status do token na montagem e parâmetros de URL.
  useEffect(() => {
    // Verifica se foi redirecionado por token expirado (do PrivateLayout, por exemplo).
    const expiredParam = searchParams.get('expired');
    if (expiredParam === 'true') {
      setHasTokenExpired(true);
      toast.error('Sua sessão expirou. Por favor, faça login novamente.');
    }

    // Verifica se já existe um token válido no localStorage para redirecionar o usuário logado.
    if (typeof window !== 'undefined') {
      // Acesso seguro ao localStorage.
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = jwtDecode<DecodedToken>(token);
          const isExpired = Date.now() >= decoded.exp * 1000;

          if (!isExpired) {
            router.push('/home'); // Redireciona para a home se o token for válido e não expirado.
          } else {
            localStorage.removeItem('token'); // Remove o token expirado.
          }
        } catch (error) {
          // Captura erros de decodificação de token (token malformado).
          localStorage.removeItem('token'); // Remove o token inválido.
          console.error('Erro ao decodificar token existente:', error);
        }
      }
    }
  }, [router, searchParams]); // Dependências: `router` e `searchParams` para reagir a mudanças.

  // --- Handlers de Interação do Usuário ---
  // Função executada quando o formulário de login é submetido com sucesso.
  async function onSubmit(values: LoginFormValues) {
    setLoading(true); // Ativa o estado de carregamento.
    try {
      // Cria um objeto FormData para enviar os dados para a Server Action.
      const formData = new FormData();
      formData.append('email', values.email);
      formData.append('password', values.password);

      const result = await handleSubmit(formData); // Chama a Server Action de login.

      console.log(result);
      if (result?.success === false) {
        toast.error(result?.error || ''); // Exibe mensagem de erro retornada pela Server Action.
      } else if (result?.success && result.token) {
        // Se o login for bem-sucedido e um token for retornado:
        try {
          const decoded = jwtDecode<DecodedToken>(result.token);
          const isExpired = Date.now() >= decoded.exp * 1000;

          if (isExpired) {
            // Caso raro de um token já expirado ser retornado.
            toast.error('O token recebido já está expirado. Tente novamente.');
            localStorage.removeItem('token');
            return;
          }

          localStorage.setItem('token', result.token); // Armazena o token no localStorage.
          toast.success(result.message || 'Login realizado com sucesso!'); // Exibe mensagem de sucesso.
          router.push('/home'); // Redireciona para a página inicial privada.
        } catch (error) {
          // Erro ao decodificar o token recebido da API.
          toast.error('Token inválido recebido da API. Tente novamente.');
          console.error('Erro ao decodificar token de resposta:', error);
        }
      }
    } catch (error) {
      // Erro geral na chamada da Server Action.
      toast.error('Ocorreu um erro inesperado durante o login.');
      console.error('Erro na submissão do login:', error);
    } finally {
      setLoading(false); // Desativa o estado de carregamento.
    }
  }

  async function handleLoginGoogle() {
    try {
      setLoading(true);
      // Redireciona para a rota de login do Google no backend
      window.location.href = `http://localhost:4000/auth/google/login`;
    } catch (error) {
      console.error('Erro ao iniciar login com Google:', error);
      toast.error('Erro ao tentar login com Google');
    } finally {
      setLoading(false);
    }
  }

  // Função para redirecionar para a página de recuperação de senha.
  function handleRedirectRestorePass(e: React.MouseEvent) {
    e.preventDefault(); // Previne o comportamento padrão do link.
    router.push('/restore-password');
  }

  // Função para redirecionar para a página de seleção do tipo de usuário (registro).
  function handleRedirectTypeUser(e: React.MouseEvent) {
    e.preventDefault(); // Previne o comportamento padrão do link.
    router.push('/type-user');
  }

  // Função para alternar a visibilidade da senha.
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev); // Alterna o estado `showPassword`.
  };

  // --- JSX Principal ---
  return (
    <div
      className={cn('flex flex-col gap-6', className)} // Mescla classes passadas via props.
      {...props}>
      <Card className="bg-[#264543] border-0 text-white">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Insira seu email e senha para entrar em sua conta.</CardDescription>
          {/* Mensagem de token expirado, exibida condicionalmente. */}
          {hasTokenExpired && (
            <div className="text-yellow-400 text-sm">
              Sua sessão anterior expirou. Por favor, faça login novamente.
            </div>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={formHandleLogin(onSubmit)}>
            {' '}
            {/* Conecta o onSubmit do React Hook Form. */}
            <div className="flex flex-col gap-6">
              {/* Campo de Email */}
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  className="bg-white text-black"
                  id="email"
                  type="email"
                  placeholder="Digite seu email"
                  required
                  {...register('email')} // Registra o input no formulário.
                />
                {/* Exibe erro de validação para o email. */}
                {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
              </div>

              {/* Campo de Senha */}
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Senha</Label>
                  {/* Link para recuperação de senha. */}
                  <a
                    href="#" // Usar '#' para prevenir navegação padrão sem `e.preventDefault()`.
                    onClick={handleRedirectRestorePass}
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline">
                    Esqueceu sua senha?
                  </a>
                </div>
                <div className="relative">
                  <Input
                    className="bg-white text-black pr-10" // Padding à direita para o ícone.
                    placeholder="Digite sua senha"
                    id="password"
                    type={showPassword ? 'text' : 'password'} // Alterna tipo entre 'text' e 'password'.
                    required
                    {...register('password')} // Registra o input no formulário.
                  />
                  {/* Botão para alternar a visibilidade da senha. */}
                  <button
                    type="button" // Essencial para prevenir a submissão do formulário.
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={togglePasswordVisibility}>
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {/* Exibe erro de validação para a senha. */}
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password.message}</p>
                )}
              </div>

              {/* Botão de Login */}
              <div className="flex gap-3 justify-center">
                <Button
                  type="submit" // Define como tipo "submit" para submeter o formulário.
                  className="w-44 bg-[#E3E3E3] text-black cursor-pointer hover:bg-[#d0d0d0]"
                  disabled={loading}>
                  {' '}
                  {/* Desabilita o botão durante o carregamento. */}
                  {loading ? 'Logando...' : 'Login'} {/* Altera texto durante o carregamento. */}
                </Button>

                <Button
                  type="button" // Define como tipo "submit" para submeter o formulário.
                  className="w-44 bg-[#E3E3E3] text-black cursor-pointer hover:bg-[#d0d0d0]"
                  onClick={handleLoginGoogle}>
                  {' '}
                  <Image
                    src={google.src} // Fonte da imagem do logo.
                    alt="IFReserve Logo" // Texto alternativo para acessibilidade.
                    width={20} // Largura original do logo (ajuste conforme necessário).
                    height={20} // Altura original do logo (ajuste conforme necessário).
                    className="object-contain" // Garante que a imagem se ajuste sem cortar.
                    priority // Otimiza o carregamento da imagem, pois é um elemento acima da dobra.
                  />
                  Login com google{' '}
                </Button>
              </div>
            </div>
            {/* Link para Registro */}
            <div className="mt-4 text-center text-sm">
              Ainda não se registrou?{' '}
              <a
                href="#" // Usar '#' ou omitir `href` e usar `onClick` para evitar navegação padrão.
                onClick={handleRedirectTypeUser}
                className="cursor-pointer underline underline-offset-4">
                Clique aqui
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
