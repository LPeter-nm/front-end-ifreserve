import Link from "next/link"
import { Instagram, Linkedin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="w-full bg-[#00ff7f] py-5 px-6">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="border-l-2 border-black pl-4">
          <p className="text-sm font-medium">Send e-mail</p>
          <p className="text-sm font-medium">Lorem ipsum</p>
          <p className="text-sm font-medium">Lorem ipsum v1.0</p>
        </div>
        <p className="text-sm mt-12 mr-16">Copyright © 2023 Pedro Gabriel</p>

        <div className="flex  mt-8">
          <div className="flex space-x-2">
            <Link href="#" aria-label="Instagram">
              <Instagram size={20} className="text-black" />
            </Link>
            <Link href="#" aria-label="LinkedIn">
              <Linkedin size={20} className="text-black" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

