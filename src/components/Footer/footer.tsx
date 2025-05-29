import Link from 'next/link'; // Componente de navegação do Next.js
import { Instagram, Linkedin } from 'lucide-react'; // Ícones de redes sociais

// --- Interfaces de Props ---
// Define as propriedades que o componente Footer espera receber.
type FooterColorProps = {
  footer_bg_color: string; // Cor de fundo do rodapé (ex: '#1E3231').
  text_color: string; // Cor do texto e das bordas (ex: '#FFFFFF').
};

// --- Componente Principal ---
// O componente Footer exibe informações de copyright e links de redes sociais.
export default function Footer({ footer_bg_color, text_color }: FooterColorProps) {
  return (
    <footer
      // Define a largura total, padding vertical e horizontal, e a cor de fundo dinamicamente.
      className="w-full py-5 px-6"
      style={{ backgroundColor: footer_bg_color }}>
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-start md:items-center">
        {/* Seção de Links Institucionais/Sobre */}
        <div
          className="border-l-2 pl-4 mb-4 md:mb-0" // Adicionado margin-bottom para mobile
          style={{ borderLeftColor: text_color, color: text_color }}>
          <Link
            href="https://portal.ifma.edu.br/inicio/"
            target="_blank" // Abre o link em uma nova aba.
            rel="noopener noreferrer" // Recomendado para segurança ao usar target="_blank".
          >
            <p className="text-sm font-medium hover:underline">Portal IFMA</p>
          </Link>
          <Link
            href="#"
            target="_blank"
            rel="noopener noreferrer">
            <p className="text-sm font-medium hover:underline">Como funciona o site?</p>
          </Link>
          <Link
            href="#"
            target="_blank"
            rel="noopener noreferrer">
            <p className="text-sm font-medium hover:underline">Sobre o site</p>
          </Link>
        </div>

        {/* Informação de Copyright */}
        <p
          className="text-sm mt-8 md:mt-0 md:mr-16 text-center md:text-left" // Ajustado margins e alinhamento para responsividade
          style={{ color: text_color }}>
          Copyright &copy; 2023 Pedro Gabriel
        </p>

        {/* Seção de Ícones de Redes Sociais */}
        <div className="flex mt-8 md:mt-0">
          {' '}
          {/* Ajustado margin-top para responsividade */}
          <div className="flex space-x-4">
            {' '}
            {/* Aumentei o espaçamento entre os ícones para 4 */}
            <Link
              href="https://www.instagram.com/pedin_nm/"
              target="_blank"
              aria-label="Instagram" // Boa prática de acessibilidade
              rel="noopener noreferrer">
              <Instagram
                size={24} // Aumentado o tamanho dos ícones para melhor visibilidade
                style={{ color: text_color }}
                className="hover:scale-110 transition-transform duration-200" // Efeito de hover
              />
            </Link>
            <Link
              href="https://www.linkedin.com/in/pedro-gabriel-488a05284/"
              target="_blank"
              aria-label="LinkedIn" // Boa prática de acessibilidade
              rel="noopener noreferrer">
              <Linkedin
                size={24} // Aumentado o tamanho dos ícones
                style={{ color: text_color }}
                className="hover:scale-110 transition-transform duration-200" // Efeito de hover
              />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
