'use client'; // Indica que este é um componente cliente

// --- Importações de Bibliotecas e Componentes ---
// Agrupando importações por tipo: bibliotecas externas, depois componentes internos.
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Hook para navegação
import toast from 'react-hot-toast'; // Para exibir notificações (toasts)
import { formatDistanceToNow } from 'date-fns'; // Para formatar tempo como "há X tempo"
import { ptBR } from 'date-fns/locale'; // Localização para `date-fns` (Português do Brasil)

// Ícones
import { Bell, Trash, Eye, Check } from 'lucide-react';

// Componentes de UI locais
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input'; // Input é importado, mas não usado diretamente aqui
import { Skeleton } from '@/components/ui/skeleton'; // Para exibir um estado de carregamento de esqueleto

// --- Ações de API ---
import { api } from '@/app/server/api'; // Importa a instância pré-configurada do Axios

// --- Tipos de Dados ---
// Define a estrutura de uma notificação.
type Notification = {
  id: string;
  title: string;
  content: string;
  type: string;
  isRead?: boolean;
  linkTo?: string;
  createdAt: string; // Data de criação da notificação.
};

// --- Componente Principal ---
export default function NotificationModal() {
  // --- Estados do Componente ---
  const [notifications, setNotifications] = useState<Notification[]>([]); // Lista de notificações.
  const [loading, setLoading] = useState(true); // Estado de carregamento das notificações.
  // `markingAsRead` armazena o ID da notificação que está sendo marcada como lida (para feedback visual).
  const [markingAsRead, setMarkingAsRead] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false); // Controla a visibilidade do popover de notificação.

  const router = useRouter(); // Instancia o roteador para navegação programática.

  // --- Funções de Busca de Dados ---
  // Função assíncrona para buscar as notificações do backend.
  const fetchNotifications = async () => {
    setLoading(true); // Ativa o estado de carregamento.
    try {
      // Obtém o token do localStorage (acesso seguro no cliente).
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      if (!token) {
        console.warn('Token de autenticação ausente, não foi possível carregar notificações.');
        // Opcional: toast.error('Faça login para ver notificações.');
        setNotifications([]); // Limpa as notificações se não houver token.
        return;
      }

      // Faz uma requisição GET para o endpoint de notificações.
      const response = await api.get('notifications', {
        headers: {
          Authorization: `Bearer ${token}`, // Envia o token de autenticação.
        },
      });
      setNotifications(response.data); // Atualiza o estado com as notificações recebidas.
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      toast.error('Erro ao carregar notificações.');
    } finally {
      setLoading(false); // Desativa o estado de carregamento.
    }
  };

  // --- Handlers de Ações de Notificação ---
  // Lida com a exclusão de uma notificação específica.
  const handleDelete = async (id: string) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        toast.error('Sessão expirada. Faça login novamente.');
        return;
      }

      await api.delete(`/notifications/${id}`, {
        // Faz a requisição DELETE para remover a notificação.
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Atualiza o estado removendo a notificação excluída.
      setNotifications(notifications.filter((n) => n.id !== id));
      toast.success('Notificação removida com sucesso!');
    } catch (error) {
      console.error('Erro ao remover notificação:', error);
      toast.error('Erro ao remover notificação.');
    }
  };

  // Lida com a exclusão de todas as notificações.
  const handleDeleteAll = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        toast.error('Sessão expirada. Faça login novamente.');
        return;
      }

      await api.delete('/notifications', {
        // Faz a requisição DELETE para remover todas as notificações.
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotifications([]); // Limpa todas as notificações do estado.
      toast.success('Todas as notificações foram removidas.');
    } catch (error) {
      console.error('Erro ao remover todas as notificações:', error);
      toast.error('Erro ao remover todas as notificações.');
    }
  };

  // Lida com a marcação de uma notificação como lida.
  const handleReadNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Previne que o clique se propague para o item da notificação.
    setMarkingAsRead(id); // Ativa o feedback visual de "marcando como lida".
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        toast.error('Sessão expirada. Faça login novamente.');
        return;
      }

      const result = await api.patch(`notifications/${id}`, null, {
        // Faz a requisição PATCH para marcar como lida.
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Atualiza o estado da notificação para `isRead: true`.
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      toast.success(result.data?.message || 'Notificação marcada como lida.');
    } catch (error: any) {
      console.error('Erro ao atualizar o status da notificação:', error);
      toast.error(error.message || 'Erro ao marcar notificação como lida.');
    } finally {
      setMarkingAsRead(null); // Desativa o feedback visual.
    }
  };

  // Lida com o clique em uma notificação individual.
  const handleNotificationClick = (notification: Notification) => {
    // Se a notificação não estiver lida, marca como lida.
    if (!notification.isRead) {
      // Cria um evento de clique sintético para chamar `handleReadNotification`.
      handleReadNotification(
        notification.id,
        new MouseEvent('click') as unknown as React.MouseEvent
      );
    }

    // Se a notificação tiver um link, redireciona.
    if (notification.linkTo) {
      router.push(notification.linkTo);
    }
    setIsOpen(false); // Fecha o popover após o clique.
  };

  // --- Efeitos Colaterais (useEffect) ---
  // 1. Efeito para buscar notificações na montagem inicial do componente.
  useEffect(() => {
    fetchNotifications();
  }, []); // Array de dependências vazio para rodar apenas uma vez.

  // 2. Efeito para buscar notificações novamente quando o popover é aberto.
  useEffect(() => {
    if (isOpen) {
      fetchNotifications(); // Recarrega as notificações ao abrir o popover.
    }
  }, [isOpen]); // Dependência: `isOpen`

  // --- JSX Principal ---
  return (
    <>
      <Popover
        open={isOpen}
        onOpenChange={setIsOpen}>
        {' '}
        {/* Controla a visibilidade do popover. */}
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative">
            <Bell size={20} />
            {/* Contador de notificações não lidas */}
            {notifications.filter((n) => !n.isRead).length > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                {notifications.filter((n) => !n.isRead).length}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0 mr-4 mt-2">
          {/* Cabeçalho do Popover de Notificações */}
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="font-semibold">Notificações</h3>
            {/* Botão "Limpar todas", visível apenas se houver notificações. */}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700"
                onClick={handleDeleteAll}>
                {' '}
                {/* Chama a função para apagar todas. */}
                <Trash
                  size={16}
                  className="mr-2"
                />
                Limpar todas
              </Button>
            )}
          </div>

          {/* Lista de Notificações */}
          <div className="max-h-96 overflow-y-auto">
            {/* Estado de Carregamento (esqueleto) */}
            {loading ? (
              <div className="space-y-2 p-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton
                    key={i}
                    className="h-20 w-full"
                  />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              // Mensagem quando não há notificações.
              <div className="p-4 text-center text-gray-500">Nenhuma notificação</div>
            ) : (
              // Mapeia e renderiza cada notificação.
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="border-b p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleNotificationClick(notification)}>
                  <div className="flex justify-between items-start">
                    {/* Conteúdo da Notificação */}
                    <div>
                      <h4 className="font-medium">{notification.title}</h4>
                      <p className="text-sm text-gray-600">{notification.content}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {/* Formata a data para "há X tempo" */}
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true, // Adiciona sufixo como "há 2 dias"
                          locale: ptBR, // Usa localização Português do Brasil
                        })}
                      </p>
                    </div>
                    {/* Botão "Marcar como lida" ou Ícone "Lida" */}
                    {!notification.isRead ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-6 w-6 ${
                          markingAsRead === notification.id
                            ? 'text-blue-600 animate-pulse' // Feedback visual de marcando
                            : 'text-gray-400 hover:text-blue-500'
                        }`}
                        onClick={(e) => handleReadNotification(notification.id, e)}
                        title="Marcar como lida"
                        disabled={markingAsRead === notification.id}>
                        {' '}
                        {/* Desabilita durante o processo */}
                        {markingAsRead === notification.id ? (
                          // Spinner enquanto marca como lida
                          <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Eye size={14} /> // Ícone de "olho" para não lida
                        )}
                      </Button>
                    ) : (
                      <div className="h-6 w-6 flex items-center justify-center text-green-500">
                        <Check size={14} /> {/* Ícone de "check" para lida */}
                      </div>
                    )}
                    {/* Botão de Excluir Notificação Individual */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-gray-400 hover:text-red-500 ml-2" // Adicionado ml-2 para espaçamento
                      onClick={(e) => {
                        e.stopPropagation(); // Previne o clique na notificação de disparar o handleNotificationClick.
                        handleDelete(notification.id); // Chama a função para apagar a notificação.
                      }}>
                      <Trash size={14} />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
