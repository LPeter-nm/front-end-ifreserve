import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="bg-[#264543] border-0 text-white">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Insira seu email para entrar em sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  className="bg-white"
                  id="email"
                  type="email"
                  placeholder="Digite seu email"
                  required
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Senha</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Esqueceu sua senha?
                  </a>
                </div>
                <Input className="bg-white" placeholder="Digite sua senha" id="password" type="password" required />
              </div>
              <div className="flex flex-col gap-3 items-center">
                <Button type="submit" className="w-48 bg-[#E3E3E3] text-black">
                  Login
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Ainda não se registrou?{" "}
              <a href="#" className="underline underline-offset-4">
                Clique aqui
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
