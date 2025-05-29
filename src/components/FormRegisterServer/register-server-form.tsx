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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'; // Corrigido o caminho

// --- Ações de API (Server Action) ---
import { handleSubmit } from './action'; // Server Action para submeter o registro

// --- Esquema de Validação (Zod) ---
// Define o esquema de validação para os campos do formulário de registro de servidor.
const formSchema = z.object({
  name: z.string().min(2, { message: 'O nome deve ter no mínimo 2 caracteres.' }),
  identification: z
    .string()
    .min(6, { message: 'A matrícula deve ter no mínimo 6 caracteres.' })
    .max(8, { message: 'A matrícula deve ter no máximo 8 caracteres.' }),
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
export function RegisterServerForm({ className, ...props }: React.ComponentProps<'div'>) {
  // --- Estados do Componente ---
  // `selectedFunction` armazena a função selecionada no dropdown.
  const [selectedFunction, setSelectedFunction] = useState('');
  // `isSubmitting` controla o estado de carregamento durante a submissão do formulário.
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Hooks de Navegação e Formulário ---
  const router = useRouter(); // Instancia o roteador para navegação programática.

  // Configura o `react-hook-form` com o resolver Zod para validação.
  const {
    register, // Função para registrar inputs no formulário.
    handleSubmit: formHandleSubmit, // Função para lidar com a submissão do formulário.
    formState: { errors }, // Objeto que contém os erros de validação.
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(formSchema), // Conecta o Zod como resolvedor de validação.
  });

  // --- Handlers de Interação do Usuário ---
  // Função executada quando o formulário é submetido com sucesso.
  async function onSubmit(values: RegisterFormValues) {
    setIsSubmitting(true); // Ativa o estado de carregamento.

    // Validação adicional para `selectedFunction` (campo de seleção).
    if (!selectedFunction) {
      toast.error('Por favor, selecione sua função na instituição.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Cria um objeto FormData para enviar os dados para a Server Action.
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('identification', values.identification);
      formData.append('roleInInstitution', selectedFunction); // Adiciona a função selecionada
      formData.append('email', values.email);
      formData.append('password', values.password);

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

              {/* Campo de Matrícula */}
              <div className="grid gap-2">
                <Label htmlFor="identification">Matrícula</Label>
                <Input
                  className="bg-white text-black"
                  id="identification"
                  type="text"
                  placeholder="Digite sua matrícula"
                  required
                  {...register('identification')}
                />
                {/* Exibe erro de validação para a matrícula. */}
                {errors.identification && (
                  <p className="text-red-500 text-sm">{errors.identification.message}</p>
                )}
              </div>

              {/* Campo de Função (Select) */}
              <div className="grid gap-2">
                <Label htmlFor="roleInInstitution">Função</Label>
                <Select
                  value={selectedFunction}
                  onValueChange={(value) => setSelectedFunction(value)}
                  required>
                  <SelectTrigger
                    id="roleInInstitution"
                    className="w-full bg-white text-black">
                    <SelectValue placeholder="Selecione sua função que exerce no Instituto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PROFESSOR_EDUCACAO_FISICA">
                      Professor de Educação Física
                    </SelectItem>
                    <SelectItem value="PROFESSOR_OUTROS">Professor</SelectItem>
                    <SelectItem value="DIRETOR">Diretor</SelectItem>
                    <SelectItem value="COORDENADOR">Coordenador</SelectItem>
                    <SelectItem value="OUTRO">Outro</SelectItem>
                  </SelectContent>
                </Select>
                {/* Opcional: Adicionar erro de validação para o Select */}
                {/* {selectedFunction === '' && <p className="text-red-500 text-sm">Por favor, selecione uma função.</p>} */}
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
