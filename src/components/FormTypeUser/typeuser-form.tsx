import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { redirect } from "next/navigation"

export function TypeUserForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  function handleRedirectRegister(e: React.FormEvent){
    e.preventDefault()
    redirect('/register-external')
  }
  return (
    <div className={cn("flex flex-col gap-6 ", className)} {...props}>
      <Card className="bg-[#264543] border-0 text-white">
        <CardHeader>
          <CardTitle>Selecione seu tipo de usuário</CardTitle>
          <CardDescription>
            Escolha a opção que melhor descreve seu perfil
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="user-type">Tipo de usuário</Label>
                <Select>
                  <SelectTrigger id="user-type" className="w-full bg-white text-black">
                    <SelectValue placeholder="Selecione seu tipo" />
                  </SelectTrigger>
                  <SelectContent >
                    <SelectItem value="student">ALUNO</SelectItem>
                    <SelectItem value="teacher">SERVIDOR</SelectItem>
                    <SelectItem value="staff">EXTERNO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-col gap-3 items-center">
                <Button type="submit" onClick={handleRedirectRegister} className="w-48 cursor-pointer bg-[#00FD94] text-black">
                  Prosseguir
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}