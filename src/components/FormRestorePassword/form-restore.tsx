import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { redirect } from 'next/navigation';

export function RestoreForm({ className, ...props }: React.ComponentProps<'div'>) {
  function handleRedirectLogin() {
    redirect('/');
  }

  return (
    <div
      className={cn('flex flex-col gap-6', className)}
      {...props}>
      <Card className="bg-[#264543] border-0 text-white">
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              <h1 className="flex font-bold justify-center text-xl">Recuperar senha</h1>
              <div className="grid gap-3">
                <div className="text-sm">
                  <ol className="list-decimal pl-4 space-y-1 p-2 mb-5">
                    <li>Digite seu e-mail e clique em “Enviar código”</li>
                    <li>Será enviado um código em seu e-mail</li>
                    <li>Digite o código</li>
                    <li>Após a verificação, você poderá criar uma nova senha.</li>
                  </ol>
                </div>

                <Label htmlFor="email">Email</Label>
                <Input
                  className="bg-white"
                  id="email"
                  type="email"
                  placeholder="Digite seu email"
                  required
                />
              </div>
              <div className="flex gap-5 justify-center items-center">
                <Button
                  type="submit"
                  onClick={handleRedirectLogin}
                  className="w-36 bg-white text-black cursor-pointer transition-colors">
                  Voltar para Login
                </Button>
                <Button
                  type="submit"
                  onClick={handleRedirectLogin}
                  className="w-36 bg-[#E3E3E3] text-black cursor-pointer transition-colors">
                  Enviar Código
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
