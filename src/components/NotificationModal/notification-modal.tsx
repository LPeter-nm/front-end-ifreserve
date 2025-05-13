'use client';

import { Bell, Trash, Eye, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useState, useEffect } from 'react';
import { api } from '@/app/server/api';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';

type Notification = {
  id: string;
  title: string;
  content: string;
  type: string;
  isRead?: boolean;
  linkTo?: string;
  createdAt: string;
};

export default function NotificationModal() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAsRead, setMarkingAsRead] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const router = useRouter();

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await api.get('notifications', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Erro ao carregar notificações');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/notifications/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotifications(notifications.filter((n) => n.id !== id));
      toast.success('Notificação removida');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Erro ao remover notificação');
    }
  };

  const handleDeleteAll = async () => {
    try {
      const token = localStorage.getItem('token');
      await api.delete('/notifications', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotifications([]);
      toast.success('Todas as notificações foram removidas');
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      toast.error('Erro ao remover notificações');
    }
  };

  const handleReadNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMarkingAsRead(id);
    try {
      const token = localStorage.getItem('token');
      const result = await api.patch(`notifications/${id}`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotifications(notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)));

      toast.success(result.data.message);
    } catch (error: any) {
      console.error('Erro ao atualizar o status da notificação: ', error);
      toast.error(error.message);
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, isRead: false } : n)));
    } finally {
      setMarkingAsRead(null); // Desativa o feedback visual
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      handleReadNotification(
        notification.id,
        new MouseEvent('click') as unknown as React.MouseEvent
      );
    }

    if (notification.linkTo) {
      router.push(notification.linkTo);
    }
    setIsOpen(false);
  };

  return (
    <>
      <Popover
        open={isOpen}
        onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative">
            <Bell size={20} />
            {notifications.filter((n) => !n.isRead).length > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                {notifications.filter((n) => !n.isRead).length}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0 mr-4 mt-2">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="font-semibold">Notificações</h3>
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700"
                onClick={() => handleDeleteAll()}>
                <Trash
                  size={16}
                  className="mr-2"
                />
                Limpar todas
              </Button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
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
              <div className="p-4 text-center text-gray-500">Nenhuma notificação</div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="border-b p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleNotificationClick(notification)}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{notification.title}</h4>
                      <p className="text-sm text-gray-600">{notification.content}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                    {!notification.isRead ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-6 w-6 ${
                          markingAsRead === notification.id
                            ? 'text-blue-600 animate-pulse'
                            : 'text-gray-400 hover:text-blue-500'
                        }`}
                        onClick={(e) => handleReadNotification(notification.id, e)}
                        title="Marcar como lida"
                        disabled={markingAsRead === notification.id}>
                        {markingAsRead === notification.id ? (
                          <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Eye size={14} />
                        )}
                      </Button>
                    ) : (
                      <div className="h-6 w-6 flex items-center justify-center text-green-500">
                        <Check size={14} />
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-gray-400 hover:text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(notification.id);
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
