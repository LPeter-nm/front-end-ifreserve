import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { handleSubmit } from './action';
import toast from 'react-hot-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@radix-ui/react-label';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type ParamsProps = {
  email: string;
  name: string;
  userId: string;
};

const formSchema = z.object({
  identification: z
    .string()
    .length(16, { message: 'A matrícula deve ter exatamente 16 caracteres.' }) // Usar .length para comprimento exato
    .regex(/^\d{5}[A-Z]{3}\.TMN\d{4}$/, {
      message: 'Formato inválido. Use: 00000XXX.TMN0000 (ex: 20221ADM.TMN0034).',
    }),
  password: z.string().min(8, { message: 'Sua senha deve ter no mínimo 8 caracteres.' }),
});

type RegisterFormValues = z.infer<typeof formSchema>;

const RegisterCompleteServer = (props: ParamsProps & React.ComponentProps<'div'>) => {
  const { email, name, userId, className, ...rest } = props;
  // --- Estados do Componente ---
  // `isSubmitting` controla o estado de carregamento durante a submissão do formulário.
  const [isSubmitting, setIsSubmitting] = useState(false);
  // `showPassword` controla a visibilidade da senha.
  const [showPassword, setShowPassword] = useState(false);
  const [selectedFunction, setSelectedFunction] = useState('');

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

    try {
      // Cria um objeto FormData para enviar os dados para a Server Action.
      const formData = new FormData();
      formData.append('identification', values.identification);
      formData.append('password', values.password);
      formData.append('roleInInstitution', selectedFunction);

      const result = await handleSubmit(formData, userId, email); // Chama a Server Action de registro.

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

  // Função para alternar a visibilidade da senha.
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev); // Alterna o estado `showPassword`.
  };

  // --- JSX Principal ---
  return (
    <div
      className={cn('flex flex-col gap-6', className)} // `cn` para mesclar classes CSS condicionalmente.
      {...rest}>
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
                  value={name || ''}
                  readOnly
                />
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
                  onChange={(e) => {
                    // Converte o valor para maiúsculas em tempo real.
                    const value = e.target.value.toUpperCase();
                    // Atualiza o valor do input diretamente, sem precisar de `setValue` do RHF,
                    // já que `register` já está controlando.
                    e.target.value = value;
                  }}
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
                  value={email || ''}
                  readOnly
                />
              </div>

              {/* Campo de Senha */}
              <div className="grid gap-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  {' '}
                  {/* Adicionado um contêiner relativo para posicionar o ícone */}
                  <Input
                    className="bg-white text-black pr-10" // Adiciona padding à direita para o ícone
                    placeholder="Digite sua senha"
                    id="password"
                    type={showPassword ? 'text' : 'password'} // Alterna entre 'text' e 'password'
                    required
                    {...register('password')}
                  />
                  <button
                    type="button" // Importante: para não submeter o formulário ao clicar no ícone
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
};

export default RegisterCompleteServer;
