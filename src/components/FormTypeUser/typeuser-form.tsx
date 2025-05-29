'use client'; // Indica que este é um componente cliente

// --- Importações de Bibliotecas e Componentes ---
// Agrupando importações por tipo: bibliotecas externas, depois componentes internos.
import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // Hook para navegação

// Componentes de UI locais
import { cn } from '@/lib/utils'; // Função utilitária para mesclar classes CSS
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'; // Corrigido o caminho de importação

// --- Componente Principal ---
export function TypeUserForm({ className, ...props }: React.ComponentProps<'div'>) {
  // --- Estados do Componente ---
  // `selectedType` armazena o tipo de usuário selecionado no dropdown.
  const [selectedType, setSelectedType] = useState('');

  // --- Hooks de Navegação ---
  const router = useRouter(); // Instancia o roteador para navegação programática.

  // --- Handlers de Interação do Usuário ---
  // Função executada quando o formulário é submetido.
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault(); // Previne o comportamento padrão de submissão do formulário.

    // Validação simples: verifica se um tipo foi selecionado.
    if (!selectedType) {
      alert('Por favor, selecione um tipo de usuário para prosseguir.'); // Usado alert para feedback simples
      return;
    }

    // Armazena o tipo de usuário na sessionStorage (acesso seguro no cliente).
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('user_Type', selectedType);
    }

    // Redireciona o usuário com base no tipo selecionado.
    if (selectedType === 'EXTERNO') {
      router.push('/register-external');
    } else if (selectedType === 'SERVIDOR') {
      router.push('/register-server');
    } else if (selectedType === 'ALUNO') {
      router.push('/register-student');
    }
  }

  // --- JSX Principal ---
  return (
    <div
      className={cn('flex flex-col gap-6', className)} // `cn` para mesclar classes CSS condicionalmente.
      {...props}>
      <Card className="bg-[#264543] border-0 text-white">
        <CardContent>
          <form onSubmit={onSubmit}>
            <div className="flex flex-col gap-6">
              {/* Campo de Seleção do Tipo de Usuário */}
              <div className="grid gap-3">
                <Label htmlFor="user-type">Tipo de usuário</Label>
                <Select
                  value={selectedType}
                  onValueChange={(value) => setSelectedType(value)}
                  required>
                  <SelectTrigger
                    id="user-type"
                    className="w-full bg-white text-black">
                    {' '}
                    <SelectValue placeholder="Selecione seu tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALUNO">Aluno</SelectItem>
                    <SelectItem value="SERVIDOR">Servidor</SelectItem>
                    <SelectItem value="EXTERNO">Externo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Botão de Prosseguir */}
              <div className="flex flex-col gap-3 items-center">
                <Button
                  type="submit" // Define como tipo "submit" para submeter o formulário.
                  className="w-48 cursor-pointer bg-[#00FD94] text-black hover:bg-[#00E080] transition-colors">
                  Prosseguir
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
