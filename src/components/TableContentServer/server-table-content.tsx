'use client'; // Indica que este é um componente cliente.

import React, { useState } from 'react'; // React e hooks básicos.
import toast from 'react-hot-toast'; // Para exibir notificações (toasts).

// Ícones.
import { Edit, Loader2, Trash } from 'lucide-react'; // Ícones para editar, carregar e lixeira.

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
import type { Server } from '../ManageServer/manage-server-table'; // Tipo para dados de usuário servidor.

// --- Server Actions ---
// Importa a Server Action para exclusão.
// IMPORTANTE: Assumindo que você terá uma `deleteServer` ou uma `deleteUser` genérica
// no arquivo './action' deste componente (ManageServer/action.ts).
import { deleteUser } from '../TableContentExternal/action'; // Usar uma Server Action específica para servidor.

// --- Interfaces para Props ---
interface ServerTableContentProps {
  servers: Server[]; // Array de usuários servidores para exibir.
  loading: boolean; // Estado de carregamento do componente pai.
  totalServers: number; // Número total de servidores (não usado diretamente aqui, mas bom para contexto).
}

// --- Componente Principal ---
export default function ServerTableContent({
  servers,
  loading,
  totalServers, // `totalServers` não é usado neste componente, considere remover se não for necessário.
}: ServerTableContentProps) {
  // --- Estados do Componente ---
  // `isDeleteDialogOpen` controla a visibilidade do diálogo de confirmação de exclusão.
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  // `serverToDelete` armazena o usuário servidor selecionado para exclusão.
  const [serverToDelete, setServerToDelete] = useState<Server | null>(null);

  // --- Funções Utilitárias / Render Helpers ---
  /**
   * Renderiza um indicador de status (círculo colorido) baseado no status do usuário.
   * @param status - O status do usuário ('ATIVO' ou 'INATIVO').
   */
  const renderStatusIndicator = (status: Server['user']['status']) => {
    const statusColors = {
      ATIVO: 'bg-green-500',
      INATIVO: 'bg-gray-300',
    };
    return <div className={`w-3 h-3 rounded-full ${statusColors[status]}`} />;
  };

  // --- Event Handlers ---
  /**
   * Lida com o clique no botão de exclusão para um servidor específico.
   * Abre o diálogo de confirmação.
   * @param server - O objeto do usuário servidor a ser excluído.
   */
  const handleDeleteClick = (server: Server) => {
    setServerToDelete(server);
    setIsDeleteDialogOpen(true);
  };

  /**
   * Lida com a confirmação de exclusão do AlertDialog.
   * Chama a Server Action para excluir o servidor.
   */
  const handleConfirmDelete = async () => {
    if (!serverToDelete) return; // Não deve acontecer se o diálogo for aberto corretamente.

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
      // Chama a Server Action para excluir o usuário pelo ID.
      // Usando `deleteServer` que deve ser específica para servidores.
      const result = await deleteUser(serverToDelete.user.id, token);

      if (result.error) {
        toast.error(result.error); // Exibe mensagem de erro da Server Action.
      } else {
        toast.success('Servidor excluído com sucesso!'); // Exibe mensagem de sucesso.
        // Assumindo que o componente pai (ManageServerTable) irá refazer a busca para atualizar a lista.
        // Você pode precisar de uma prop de callback como `onServerDeleted` aqui se o pai não auto-atualizar.
      }
    } catch (error) {
      console.error('Erro durante a exclusão do servidor:', error);
      toast.error('Erro ao excluir servidor.');
    } finally {
      setIsDeleteDialogOpen(false); // Sempre fecha o diálogo.
      setServerToDelete(null); // Limpa o usuário a ser excluído.
    }
  };

  // --- Renderização Condicional: Estado de Carregamento ---
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-md">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-600">Carregando servidores...</span>
      </div>
    );
  }

  // --- Renderização Principal do JSX ---
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-200">
            <TableHead className="font-bold text-black w-1/4">Nome</TableHead>
            <TableHead className="font-bold text-black w-1/4">Email</TableHead>
            <TableHead className="font-bold text-black w-1/4">Matrícula</TableHead>
            <TableHead className="font-bold text-black w-1/4">Cargo</TableHead>
            <TableHead className="w-[100px]"></TableHead> {/* Coluna de Ações */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {servers.length > 0 ? (
            servers.map((server) => (
              <TableRow
                key={`server-${server.user.id}`}
                className="border-b hover:bg-gray-50">
                <TableCell className="py-3">{server.user.name}</TableCell>
                <TableCell>{server.user.email}</TableCell>
                <TableCell>{server.user.identification}</TableCell>
                <TableCell>{server.roleInInstitution}</TableCell>
                <TableCell className="flex items-center space-x-1 justify-end">
                  {/* Botão de Editar (funcionalidade a ser implementada) */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-blue-500 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                    title="Editar servidor">
                    <Edit className="h-4 w-4" />
                  </Button>
                  {/* Botão de Excluir */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors"
                    onClick={() => handleDeleteClick(server)}
                    title="Excluir servidor">
                    <Trash className="h-4 w-4" />
                  </Button>
                  {/* Indicador de Status */}
                  <div className="px-2">{renderStatusIndicator(server.user.status)}</div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={5}
                className="h-24 text-center text-gray-500">
                Nenhum servidor encontrado.
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
              Tem certeza que deseja excluir o servidor **{serverToDelete?.user.name}**?
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
