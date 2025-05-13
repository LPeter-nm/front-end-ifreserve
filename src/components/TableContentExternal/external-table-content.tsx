import { RefreshCcw, Edit, Loader2, Trash } from 'lucide-react';
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
import type { External } from '../ManageExternal/manage-external-table';
import { useState } from 'react';
import { deleteExternal } from './action';
import toast from 'react-hot-toast';

interface ExternalTableContentProps {
  externals: External[];
  loading: boolean;
  totalExternals: number;
}

export default function ExternalTableContent({
  externals,
  loading,
  totalExternals,
}: ExternalTableContentProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [externalToDelete, setExternalToDelete] = useState<External | null>(null);

  const renderStatusIndicator = (status: External['user']['status']) => {
    const statusColors = {
      ATIVO: 'bg-green-500',
      INATIVO: 'bg-gray-300',
    };

    return <div className={`w-3 h-3 rounded-full ${statusColors[status]}`} />;
  };

  const handleDeleteClick = (external: External) => {
    setExternalToDelete(external);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (externalToDelete) {
      const token = localStorage.getItem('token') as string;
      const result = await deleteExternal(externalToDelete.user.id, token);

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
            <TableHead className="font-bold text-black w-1/5">Nome</TableHead>
            <TableHead className="font-bold text-black w-1/5">Email</TableHead>
            <TableHead className="font-bold text-black w-1/5">Documento</TableHead>
            <TableHead className="font-bold text-black w-1/5">Telefone</TableHead>
            <TableHead className="font-bold text-black w-1/5">Endereço</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {externals.length > 0 ? (
            externals.map((external) => (
              <TableRow
                key={external.user.id}
                className="border-b">
                <TableCell className="py-3">{external.user.name}</TableCell>
                <TableCell>{external.user.email}</TableCell>
                <TableCell>{external.user.identification}</TableCell>
                <TableCell>{external.phone}</TableCell>
                <TableCell>{external.address}</TableCell>
                <TableCell className="flex items-center space-x-1 justify-end">
                  <div className="px-2">{renderStatusIndicator(external.user.status)}</div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-700"
                    onClick={() => handleDeleteClick(external)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={6}
                className="h-24 text-center">
                Nenhum usuário externo encontrado
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Modal de Confirmação */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o usuário {externalToDelete?.user.name}?
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
