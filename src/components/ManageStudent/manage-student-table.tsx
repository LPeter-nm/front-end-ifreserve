'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import StudentTableContent from '../TableContentStudent/student-table-content';
import { getStudents } from './action';
import toast from 'react-hot-toast';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext,
} from '@/components/ui/pagination';

export type Student = {
  user: {
    id: string;
    name: string;
    email: string;
    identification: string;
    status: 'ATIVO' | 'INATIVO';
  };
};

export default function StudentTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const pageSize = 5;

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append('token', localStorage.getItem('token') as string);
        formData.append('page', currentPage.toString());
        formData.append('pageSize', pageSize.toString());

        const result = await getStudents(formData);

        if (result?.data) {
          setStudents(result.data);
          setTotalPages(result.totalPages);
          setTotalStudents(result.totalStudents || 0);
        }

        if (result?.error) {
          toast.error(result.error);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
        toast.error('Erro ao carregar alunos');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [currentPage]);

  const filteredStudents = students.filter(
    (student) =>
      student.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.user.identification.toLowerCase().includes(searchTerm.toLowerCase())
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
          placeholder="Procurar aluno..."
          className="pl-8 bg-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-md overflow-hidden border">
        <StudentTableContent
          students={filteredStudents}
          loading={loading}
          totalStudents={totalStudents}
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
