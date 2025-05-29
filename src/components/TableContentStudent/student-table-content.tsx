'use client'; // Indica que este é um componente cliente.

import React, { useState } from 'react'; // React e hooks básicos.
import toast from 'react-hot-toast'; // Para exibir notificações (toasts).

// Ícones.
import { Loader2, Trash } from 'lucide-react'; // Ícones para carregar e lixeira.

// Componentes de UI.
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Tipos.
import type { Student } from '../ManageStudent/manage-student-table'; // Tipo para dados de usuário estudante.

// --- Server Actions ---
// Importa a Server Action para exclusão de usuário.
// Assumindo que 'deleteUser' é uma Server Action genérica que deleta um usuário por ID.
import { deleteUser } from '../TableContentExternal/action';

// --- Interfaces para Props ---
interface StudentTableContentProps {
  students: Student[]; // Array de usuários estudantes para exibir.
  loading: boolean; // Estado de carregamento do componente pai.
  totalStudents: number; // Número total de estudantes (não usado diretamente aqui, mas bom para contexto).
}

// --- Componente Principal ---
export default function StudentTableContent({
  students,
  loading,
  totalStudents, // `totalStudents` não é usado neste componente, considere remover se não for necessário.
}: StudentTableContentProps) {
  // --- Estados do Componente ---
  // `isDeleteDialogOpen` controla a visibilidade do diálogo de confirmação de exclusão.
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  // `studentToDelete` armazena o usuário estudante selecionado para exclusão.
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // --- Funções Utilitárias / Render Helpers ---
  /**
   * Renderiza um indicador de status (círculo colorido) baseado no status do usuário.
   * @param status - O status do usuário ('ATIVO' ou 'INATIVO').
   */
  const renderStatusIndicator = (status: Student['user']['status']) => {
    const statusColors = {
      ATIVO: 'bg-green-500',
      INATIVO: 'bg-gray-300',
    };
    return <div className={`w-3 h-3 rounded-full ${statusColors[status]}`} />;
  };

  // --- Event Handlers ---
  /**
   * Lida com o clique no botão de exclusão para um estudante específico.
   * Abre o diálogo de confirmação.
   * @param student - O objeto do usuário estudante a ser excluído.
   */
  const handleDeleteClick = (student: Student) => {
    setStudentToDelete(student);
    setIsDeleteDialogOpen(true);
  };

  /**
   * Lida com a confirmação de exclusão do AlertDialog.
   * Chama a Server Action para excluir o estudante.
   */
  const handleConfirmDelete = async () => {
    if (!studentToDelete) return; // Não deve acontecer se o diálogo for aberto corretamente.

    // Safely attempt to get the token, ensuring it exists before calling the server action.
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (!token) {
      toast.error('Token de autenticação ausente. Faça login novamente.');
      setIsDeleteDialogOpen(false);
      // Opcional: redirecionar para a página de login
      // useRouter().push('/login');
      return;
    }

    try {
      // Chama a Server Action genérica `deleteUser` para excluir o estudante pelo ID.
      const result = await deleteUser(studentToDelete.user.id, token);

      if (result.error) {
        toast.error(result.error); // Exibe mensagem de erro da Server Action.
      } else {
        toast.success('Aluno excluído com sucesso!'); // Exibe mensagem de sucesso.
        // Assumindo que o componente pai (ManageStudentTable) irá refazer a busca para atualizar a lista.
        // Você pode precisar de uma prop de callback como `onStudentDeleted` aqui se o pai não auto-atualizar.
      }
    } catch (error) {
      console.error('Erro durante a exclusão do aluno:', error);
      toast.error('Erro ao excluir aluno.');
    } finally {
      setIsDeleteDialogOpen(false); // Sempre fecha o diálogo.
      setStudentToDelete(null); // Limpa o usuário a ser excluído.
    }
  };

  // --- Renderização Condicional: Estado de Carregamento ---
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-md">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-600">Carregando alunos...</span>
      </div>
    );
  }

  // --- Renderização Principal do JSX ---
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-200">
            <TableHead className="font-bold text-black w-1/3">Nome</TableHead>
            <TableHead className="font-bold text-black w-1/3">Email</TableHead>
            <TableHead className="font-bold text-black w-1/3">Matrícula</TableHead>
            <TableHead className="w-[100px]"></TableHead> {/* Coluna de Ações */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.length > 0 ? (
            students.map((student) => (
              <TableRow
                key={`student-${student.user.id}`}
                className="border-b hover:bg-gray-50">
                <TableCell className="py-3">{student.user.name}</TableCell>
                <TableCell>{student.user.email}</TableCell>
                <TableCell>{student.user.identification}</TableCell>
                <TableCell className="flex items-center space-x-1 justify-end">
                  {/* Botão de Excluir */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors"
                    onClick={() => handleDeleteClick(student)}
                    title="Excluir aluno">
                    <Trash className="h-4 w-4" />
                  </Button>
                  {/* Indicador de Status */}
                  <div className="px-2">{renderStatusIndicator(student.user.status)}</div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={4}
                className="h-24 text-center text-gray-500">
                Nenhum aluno encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Diálogo de Confirmação de Exclusão */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o aluno **{studentToDelete?.user.name}**?
              <br />
              <span className="text-red-500 font-semibold">Esta ação não pode ser desfeita.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600 focus:ring-red-500" // Adicionado estilo de foco.
              onClick={handleConfirmDelete}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
