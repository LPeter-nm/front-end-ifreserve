'use client'; // Indica que este é um componente cliente

// --- Importações de Bibliotecas e Componentes ---
// Agrupando importações por tipo: bibliotecas externas, depois componentes internos.
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast'; // Para exibir notificações (toasts)
import { Search } from 'lucide-react'; // Ícone de pesquisa

// Componentes de UI locais
import { Input } from '@/components/ui/input';
import ExternalTableContent from '../TableContentExternal/external-table-content';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext,
} from '@/components/ui/pagination';

// --- Ações de API (Server Action) ---
import { getExternals } from './action'; // Server Action para buscar usuários externos

// --- Tipos de Dados ---
// Define a estrutura de um usuário externo.
export type External = {
  user: {
    id: string;
    name: string;
    email: string;
    identification: string;
    status: 'ATIVO' | 'INATIVO';
    role: string;
  };
  phone: string;
  address: string;
};

// --- Constantes ---
// Define o número de itens por página para a paginação.
const PAGE_SIZE = 5;

// --- Componente Principal ---
export default function ExternalTable() {
  // --- Estados do Componente ---
  const [searchTerm, setSearchTerm] = useState(''); // Termo de busca para filtrar usuários.
  const [externals, setExternals] = useState<External[]>([]); // Lista de usuários externos.
  const [loading, setLoading] = useState(false); // Estado de carregamento dos dados.
  const [totalPages, setTotalPages] = useState(1); // Número total de páginas para a paginação.
  const [currentPage, setCurrentPage] = useState(1); // Página atual da paginação.
  const [totalExternals, setTotalExternals] = useState(0); // Número total de usuários externos.

  // --- Funções de Busca de Dados ---
  // Função assíncrona para buscar usuários externos da API.
  const fetchExternals = async () => {
    setLoading(true); // Ativa o estado de carregamento.
    try {
      // Obtém o token do localStorage (acesso seguro no cliente).
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      if (!token) {
        toast.error('Sessão expirada. Faça login novamente.');
        // Opcional: redirecionar para a página de login
        // useRouter().push('/login');
        return;
      }

      // Cria um objeto FormData para passar o token e parâmetros de paginação para a Server Action.
      const formData = new FormData();
      formData.append('token', token);
      formData.append('page', currentPage.toString());
      formData.append('pageSize', PAGE_SIZE.toString());

      const result = await getExternals(formData); // Chama a Server Action.

      if (result?.data) {
        setExternals(result.data);
        setTotalPages(result.totalPages || 0);
        setTotalExternals(result.totalExternals || 0);
      }

      if (result?.error) {
        toast.error(result.error); // Exibe erro retornado pela Server Action.
      }
    } catch (error) {
      // Captura erros gerais na chamada da Server Action.
      console.error('Erro ao carregar usuários externos:', error);
      toast.error('Erro ao carregar usuários externos.');
    } finally {
      setLoading(false); // Desativa o estado de carregamento.
    }
  };

  // --- Efeitos Colaterais (useEffect) ---
  // Efeito para buscar usuários externos sempre que a página atual muda.
  useEffect(() => {
    fetchExternals();
  }, [currentPage]); // Dependência: `currentPage`

  // --- Lógica de Filtro ---
  // Filtra os usuários externos com base no termo de busca.
  const filteredExternals = externals.filter(
    (external) =>
      external.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      external.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      external.user.identification.toLowerCase().includes(searchTerm.toLowerCase())
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
          placeholder="Procurar usuário externo..."
          className="pl-8 bg-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Conteúdo da Tabela de Usuários Externos */}
      <div className="bg-white rounded-md overflow-hidden border">
        <ExternalTableContent
          externals={filteredExternals}
          loading={loading}
          totalExternals={totalExternals}
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
