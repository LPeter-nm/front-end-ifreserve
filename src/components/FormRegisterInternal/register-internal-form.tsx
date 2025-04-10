import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { redirect } from "next/navigation"

export function RegisterInternalForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
    function handleRedirectLogin () {
        redirect('/')
    }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="bg-[#264543] border-0 text-white">
        <CardContent>
          <form>
            <div className="flex flex-col gap-4">
            <div className="grid gap-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  className="bg-white"
                  id="name"
                  type='text'
                  placeholder="Digite seu nome"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="registration">Matrícula</Label>
                <Input
                  className="bg-white"
                  id="registration"
                  type="text"
                  placeholder="Digite sua matrícula"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  className="bg-white"
                  id="email"
                  type="email"
                  placeholder="Digite seu email"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Senha</Label>
                </div>
                <Input className="bg-white" placeholder="Digite sua senha" id="password" type="password" required />
              </div>
              <div className="flex flex-col gap-3 items-center">
                <Button type="submit" onClick={handleRedirectLogin} className="w-48 bg-[#E3E3E3] text-black cursor-pointer transition-colors">
                  Registrar
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Já fez cadastro?{" "}
              <a href="#" className="cursor-pointer underline underline-offset-4">
                Faça login
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
