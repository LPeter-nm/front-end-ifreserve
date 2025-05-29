'use client'; // Indica que este é um componente cliente

// --- Importações de Bibliotecas e Componentes ---
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast'; // Para exibir notificações (toasts)
import { Search } from 'lucide-react'; // Ícone de pesquisa

// Componentes de UI locais
import { Input } from '@/components/ui/input';
import ServerTableContent from '../TableContentServer/server-table-content'; // Componente de conteúdo da tabela
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext,
} from '@/components/ui/pagination';

// --- Ações de API (Server Action) ---
import { getServers } from './action'; // Server Action para buscar usuários servidores

// --- Tipos de Dados ---
// Define a estrutura de um usuário servidor.
export type Server = {
  user: {
    id: string;
    name: string;
    email: string;
    identification: string;
    status: 'ATIVO' | 'INATIVO';
    role: string; // Adicionado 'role' se for necessário para exibição
  };
  roleInInstitution: string;
};

// --- Constantes ---
// Define o número de itens por página para a paginação.
const PAGE_SIZE = 5;

// --- Componente Principal ---
export default function ServerTable() {
  // --- Estados do Componente ---
  const [searchTerm, setSearchTerm] = useState(''); // Termo de busca para filtrar usuários.
  const [servers, setServers] = useState<Server[]>([]); // Lista de usuários servidores.
  const [loading, setLoading] = useState(false); // Estado de carregamento dos dados.
  const [totalPages, setTotalPages] = useState(1); // Número total de páginas para a paginação.
  const [currentPage, setCurrentPage] = useState(1); // Página atual da paginação.
  const [totalServers, setTotalServers] = useState(0); // Número total de usuários servidores.

  // --- Funções de Busca de Dados ---
  // Função assíncrona para buscar usuários servidores da API.
  const fetchServers = async () => {
    setLoading(true); // Ativa o estado de carregamento.
    try {
      // Obtém o token do localStorage (acesso seguro no cliente).
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      if (!token) {
        toast.error('Sessão expirada. Faça login novamente.');
        // Opcional: redirecionar para a página de login com useRouter().push('/login');
        return;
      }

      // Cria um objeto FormData para passar o token e parâmetros de paginação para a Server Action.
      const formData = new FormData();
      formData.append('token', token);
      formData.append('page', currentPage.toString());
      formData.append('pageSize', PAGE_SIZE.toString());

      const result = await getServers(formData); // Chama a Server Action.

      if (result?.data) {
        setServers(result.data);
        setTotalPages(result.totalPages || 0);
        setTotalServers(result.totalServers || 0);
      }

      if (result?.error) {
        toast.error(result.error); // Exibe erro retornado pela Server Action.
      }
    } catch (error) {
      // Captura erros gerais na chamada da Server Action.
      console.error('Erro ao carregar servidores:', error);
      toast.error('Erro ao carregar usuários servidores.');
    } finally {
      setLoading(false); // Desativa o estado de carregamento.
    }
  };

  // --- Efeitos Colaterais (useEffect) ---
  // Efeito para buscar usuários servidores sempre que a página atual muda.
  useEffect(() => {
    fetchServers();
  }, [currentPage]); // Dependência: `currentPage`

  // --- Lógica de Filtro ---
  // Filtra os usuários servidores com base no termo de busca.
  const filteredServers = servers.filter(
    (server) =>
      server.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      server.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      server.user.identification.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Handlers de Paginação ---
  // Lida com a mudança de página da paginação.
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // --- JSX Principal ---
  return (
    <div className="space-y-4 bg-gray-100 p-4 rounded-lg">
      {/* Campo de Busca */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          type="search"
          placeholder="Procurar servidor..."
          className="pl-8 bg-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Conteúdo da Tabela de Usuários Servidores */}
      <div className="bg-white rounded-md overflow-hidden border">
        <ServerTableContent
          servers={filteredServers}
          loading={loading}
          totalServers={totalServers}
        />
      </div>

      {/* Componente de Paginação (visível apenas se houver mais de uma página) */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            {/* Botão de Página Anterior */}
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault(); // Previne o comportamento padrão do link.
                  if (currentPage > 1) handlePageChange(currentPage - 1);
                }}
                // Desabilita o botão se estiver na primeira página.
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>

            {/* Links para Cada Página */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault(); // Previne o comportamento padrão do link.
                    handlePageChange(page);
                  }}
                  isActive={page === currentPage}>
                  {' '}
                  {/* Ativa o estilo da página atual. */}
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            {/* Botão de Próxima Página */}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault(); // Previne o comportamento padrão do link.
                  if (currentPage < totalPages) handlePageChange(currentPage + 1);
                }}
                // Desabilita o botão se estiver na última página.
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
