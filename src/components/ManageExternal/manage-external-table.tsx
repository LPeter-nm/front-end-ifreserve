'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import ExternalTableContent from '../TableContentExternal/external-table-content';
import { getExternals } from './action';
import toast from 'react-hot-toast';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext,
} from '@/components/ui/pagination';

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

export default function ExternalTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [externals, setExternals] = useState<External[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalExternals, setTotalExternals] = useState(0);
  const pageSize = 5;

  useEffect(() => {
    const fetchExternals = async () => {
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append('token', localStorage.getItem('token') as string);
        formData.append('page', currentPage.toString());
        formData.append('pageSize', pageSize.toString());

        const result = await getExternals(formData);

        if (result?.data) {
          setExternals(result.data);
          setTotalPages(result.totalPages);
          setTotalExternals(result.totalExternals || 0);
        }

        if (result?.error) {
          toast.error(result.error);
        }
      } catch (error) {
        console.error('Error fetching externals:', error);
        toast.error('Erro ao carregar usuários externos');
      } finally {
        setLoading(false);
      }
    };

    fetchExternals();
  }, [currentPage]);

  const filteredExternals = externals.filter(
    (external) =>
      external.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      external.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      external.user.identification.toLowerCase().includes(searchTerm.toLowerCase())
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
          placeholder="Procurar usuário externo..."
          className="pl-8 bg-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-md overflow-hidden border">
        <ExternalTableContent
          externals={filteredExternals}
          loading={loading}
          totalExternals={totalExternals}
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
