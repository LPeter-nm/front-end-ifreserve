import { Loader2, Trash } from 'lucide-react';
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
import type { Student } from '../ManageStudent/manage-student-table';
import { useState } from 'react';
import { deleteExternal } from '../TableContentExternal/action';
import toast from 'react-hot-toast';

interface StudentTableContentProps {
  students: Student[];
  loading: boolean;
  totalStudents: number;
}

export default function StudentTableContent({
  students,
  loading,
  totalStudents,
}: StudentTableContentProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  const renderStatusIndicator = (status: Student['user']['status']) => {
    const statusColors = {
      ATIVO: 'bg-green-500',
      INATIVO: 'bg-gray-300',
    };
    return <div className={`w-3 h-3 rounded-full ${statusColors[status]}`} />;
  };

  const handleDeleteClick = (student: Student) => {
    setStudentToDelete(student);
    setIsDeleteDialogOpen(true);
  };
  const handleConfirmDelete = async () => {
    if (studentToDelete) {
      const token = localStorage.getItem('token') as string;
      const result = await deleteExternal(studentToDelete.user.id, token);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Usuário excluído com sucesso');
      }
    }
    setIsDeleteDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-200">
            <TableHead className="font-bold text-black w-1/3">Nome</TableHead>
            <TableHead className="font-bold text-black w-1/3">Email</TableHead>
            <TableHead className="font-bold text-black w-1/3">Matrícula</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.length > 0 ? (
            students.map((student) => (
              <TableRow
                key={`student-${student.user.id}`}
                className="border-b">
                <TableCell className="py-3">{student.user.name}</TableCell>
                <TableCell>{student.user.email}</TableCell>
                <TableCell>{student.user.identification}</TableCell>
                <TableCell className="flex items-center space-x-1 justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-700"
                    onClick={() => handleDeleteClick(student)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                  <div className="px-2">{renderStatusIndicator(student.user.status)}</div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={4}
                className="h-24 text-center">
                Nenhum aluno encontrado
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o aluno {studentToDelete?.user.name}?
              <br />
              <span className="text-red-500">Esta ação não pode ser desfeita.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={handleConfirmDelete}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
