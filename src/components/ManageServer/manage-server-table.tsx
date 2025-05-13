'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import ServerTableContent from '../TableContentServer/server-table-content';
import { getServers } from './action';
import toast from 'react-hot-toast';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext,
} from '@/components/ui/pagination';

export type Server = {
  user: {
    id: string;
    name: string;
    email: string;
    identification: string;
    status: 'ATIVO' | 'INATIVO';
  };
  roleInInstitution: string;
};

export default function ServerTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalServers, setTotalServers] = useState(0);
  const pageSize = 5;

  useEffect(() => {
    const fetchServers = async () => {
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append('token', localStorage.getItem('token') as string);
        formData.append('page', currentPage.toString());
        formData.append('pageSize', pageSize.toString());

        const result = await getServers(formData);

        if (result?.data) {
          setServers(result.data);
          setTotalPages(result.totalPages);
          setTotalServers(result.totalServers || 0);
        }

        if (result?.error) {
          toast.error(result.error);
        }
      } catch (error) {
        console.error('Error fetching servers:', error);
        toast.error('Erro ao carregar servidores');
      } finally {
        setLoading(false);
      }
    };

    fetchServers();
  }, [currentPage]);

  const filteredServers = servers.filter(
    (server) =>
      server.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      server.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      server.user.identification.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-4 bg-gray-100 p-4 rounded-lg">
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

      <div className="bg-white rounded-md overflow-hidden border">
        <ServerTableContent
          servers={filteredServers}
          loading={loading}
          totalServers={totalServers}
        />
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) handlePageChange(currentPage - 1);
                }}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(page);
                  }}
                  isActive={page === currentPage}>
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) handlePageChange(currentPage + 1);
                }}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
