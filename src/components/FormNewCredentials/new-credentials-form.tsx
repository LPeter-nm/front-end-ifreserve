import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { redirect } from 'next/navigation';

export function NewCredentialsForm({ className, ...props }: React.ComponentProps<'div'>) {
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
                <Label htmlFor="new-password">Nova senha</Label>
                <Input
                  className="bg-white"
                  id="new-password"
                  type="password"
                  placeholder="Digite sua nova senha"
                  required
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="confirm-password">Confirme sua nova senha</Label>
                <Input
                  className="bg-white"
                  placeholder="Digite novamente sua nova senha"
                  id="confirm-password"
                  type="password"
                  required
                />
              </div>
              <div className="flex gap-3 justify-center items-center">
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
