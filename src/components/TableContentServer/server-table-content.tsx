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
import type { Server } from '../ManageServer/manage-server-table';
import { useState } from 'react';
import { deleteExternal } from '../TableContentExternal/action';
import toast from 'react-hot-toast';

interface ServerTableContentProps {
  servers: Server[];
  loading: boolean;
  totalServers: number;
}

export default function ServerTableContent({
  servers,
  loading,
  totalServers,
}: ServerTableContentProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [serverToDelete, setServerToDelete] = useState<Server | null>(null);

  const renderStatusIndicator = (status: Server['user']['status']) => {
    const statusColors = {
      ATIVO: 'bg-green-500',
      INATIVO: 'bg-gray-300',
    };
    return <div className={`w-3 h-3 rounded-full ${statusColors[status]}`} />;
  };

  const handleDeleteClick = (server: Server) => {
    setServerToDelete(server);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (serverToDelete) {
      const token = localStorage.getItem('token') as string;
      const result = await deleteExternal(serverToDelete.user.id, token);

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
            <TableHead className="font-bold text-black w-1/4">Nome</TableHead>
            <TableHead className="font-bold text-black w-1/4">Email</TableHead>
            <TableHead className="font-bold text-black w-1/4">Matrícula</TableHead>
            <TableHead className="font-bold text-black w-1/4">Cargo</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {servers.length > 0 ? (
            servers.map((server) => (
              <TableRow
                key={`server-${server.user.id}`}
                className="border-b">
                <TableCell className="py-3">{server.user.name}</TableCell>
                <TableCell>{server.user.email}</TableCell>
                <TableCell>{server.user.identification}</TableCell>
                <TableCell>{server.roleInInstitution}</TableCell>
                <TableCell className="flex items-center space-x-1 justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-700"
                    onClick={() => handleDeleteClick(server)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                  <div className="px-2">{renderStatusIndicator(server.user.status)}</div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={5}
                className="h-24 text-center">
                Nenhum servidor encontrado
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
              Tem certeza que deseja excluir o servidor {serverToDelete?.user.name}?
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
