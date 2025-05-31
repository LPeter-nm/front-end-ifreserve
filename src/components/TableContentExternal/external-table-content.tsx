'use client'; // Indicates this is a client component.

import React, { useState } from 'react'; // React and basic hooks.
import toast from 'react-hot-toast'; // For displaying notifications (toasts).

// Icons.
import { Trash, Loader2 } from 'lucide-react'; // Icons for trash and loading spinner.

// UI Components.
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

// Types.
import type { External } from '../ManageExternal/manage-external-table'; // Type for external user data.

// Server Actions.
import { deleteUser } from './action'; // Server Action to delete an external user.

// --- Interfaces for Props ---
interface ExternalTableContentProps {
  externals: External[]; // Array of external users to display.
  loading: boolean; // Loading state from the parent component.
  totalExternals: number; // Total number of external users (not directly used in this component's render, but good for context).
}

// --- Main Component ---
export default function ExternalTableContent({ externals, loading }: ExternalTableContentProps) {
  // --- Component States ---
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // Controls the visibility of the delete confirmation dialog.
  const [externalToDelete, setExternalToDelete] = useState<External | null>(null); // Stores the external user selected for deletion.

  // --- Utility Functions / Render Helpers ---
  /**
   * Renders a status indicator (colored circle) based on user status.
   * @param status - The status of the user ('ATIVO' or 'INATIVO').
   */
  const renderStatusIndicator = (status: External['user']['status']) => {
    const statusColors = {
      ATIVO: 'bg-green-500',
      INATIVO: 'bg-gray-300',
    };
    return <div className={`w-3 h-3 rounded-full ${statusColors[status]}`} />;
  };

  // --- Event Handlers ---
  /**
   * Handles the click on the delete button for a specific external user.
   * Opens the confirmation dialog.
   * @param external - The external user object to be deleted.
   */
  const handleDeleteClick = (external: External) => {
    setExternalToDelete(external);
    setIsDeleteDialogOpen(true);
  };

  /**
   * Handles the confirmation of deletion from the AlertDialog.
   * Calls the server action to delete the user.
   */
  const handleConfirmDelete = async () => {
    if (!externalToDelete) return; // Should not happen if dialog is opened correctly.

    // Safely attempt to get the token, ensuring it exists before calling the server action.
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (!token) {
      toast.error('Token de autenticação ausente. Faça login novamente.');
      setIsDeleteDialogOpen(false);
      // Optionally, redirect to login page.
      // useRouter().push('/login');
      return;
    }

    try {
      // Calls the server action to delete the user by their ID.
      const result = await deleteUser(externalToDelete.user.id, token);

      if (result.error) {
        toast.error(result.error); // Display error message from server action.
      } else {
        toast.success('Usuário excluído com sucesso!'); // Display success message.
        // Assuming the parent component (ManageExternalTable) will re-fetch data to update the list.
        // You might need a callback prop like `onUserDeleted` here if the parent doesn't auto-refresh.
      }
    } catch (error) {
      console.error('Error during user deletion:', error);
      toast.error('Erro ao excluir usuário.');
    } finally {
      setIsDeleteDialogOpen(false); // Always close the dialog.
      setExternalToDelete(null); // Clear the user to delete.
    }
  };

  // --- Conditional Render: Loading State ---
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-md">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-600">Carregando usuários...</span>
      </div>
    );
  }

  // --- Main JSX Render ---
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
                className="border-b hover:bg-gray-50">
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
                    className="h-8 w-8 text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors"
                    onClick={() => handleDeleteClick(external)}
                    title="Excluir usuário">
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={6}
                className="h-24 text-center text-gray-500">
                Nenhum usuário externo encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o usuário **{externalToDelete?.user.name}**?
              <br />
              <span className="text-red-500 font-semibold">Esta ação não pode ser desfeita.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600 focus:ring-red-500" // Added focus styling.
              onClick={handleConfirmDelete}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
