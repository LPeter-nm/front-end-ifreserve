'use client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function TypeUserForm({ className, ...props }: React.ComponentProps<'div'>) {
  const [selectedType, setSelectedType] = useState('');
  const router = useRouter();
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    sessionStorage.setItem('user_Type', selectedType);

    if (selectedType === 'EXTERNO') {
      router.push('/register-external');
    } else if (selectedType === 'SERVIDOR') {
      router.push('/register-server');
    } else if (selectedType === 'ALUNO') {
      router.push('/register-student');
    }
  }
  return (
    <div
      className={cn('flex flex-col gap-6 ', className)}
      {...props}>
      <Card className="bg-[#264543] border-0 text-white">
        {/* ... */}
        <CardContent>
          <form onSubmit={onSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="user-type">Tipo de usuário</Label>
                <Select
                  value={selectedType}
                  onValueChange={(value) => setSelectedType(value)}>
                  <SelectTrigger
                    id="user-type"
                    className="w-full bg-white text-black">
                    <SelectValue placeholder="Selecione seu tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALUNO">Aluno</SelectItem>
                    <SelectItem value="SERVIDOR">Servidor</SelectItem>
                    <SelectItem value="EXTERNO">Externo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-3 items-center">
                <Button
                  type="submit"
                  className="w-48 cursor-pointer bg-[#00FD94] text-black">
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
