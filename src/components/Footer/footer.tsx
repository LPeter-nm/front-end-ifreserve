import Link from 'next/link';
import { Instagram, Linkedin } from 'lucide-react';

type FooterColorProps = {
  footer_bg_color: string;
  text_color: string;
};

export default function Footer({ footer_bg_color, text_color }: FooterColorProps) {
  return (
    <footer
      className="w-full py-5 px-6"
      style={{ backgroundColor: footer_bg_color }}>
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-start md:items-center">
        <div
          className="border-l-2 pl-4"
          style={{ borderLeftColor: text_color, color: text_color }}>
          <Link
            href="https://portal.ifma.edu.br/inicio/"
            target="_blank">
            <p className="text-sm font-medium">Portal IFMA</p>
          </Link>
          <Link
            href="#"
            target="_blank">
            <p className="text-sm font-medium">Como funciona o site?</p>
          </Link>
          <Link
            href="#"
            target="_blank">
            <p className="text-sm font-medium">Sobre o site</p>
          </Link>
        </div>
        <p
          className="text-sm mt-12 mr-16"
          style={{ color: text_color }}>
          Copyright © 2023 Pedro Gabriel
        </p>

        <div className="flex mt-8">
          <div className="flex space-x-2">
            <Link
              href="https://www.instagram.com/pedin_nm/"
              target="_blank"
              aria-label="Instagram">
              <Instagram
                size={20}
                style={{ color: text_color }}
              />
            </Link>
            <Link
              href="https://www.linkedin.com/in/pedro-gabriel-488a05284/"
              target="_blank"
              aria-label="LinkedIn">
              <Linkedin
                size={20}
                style={{ color: text_color }}
              />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
