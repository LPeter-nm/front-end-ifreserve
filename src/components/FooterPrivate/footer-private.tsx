'use client';
import { Instagram, Link, Linkedin } from 'lucide-react';

const FooterPrivate = () => {
  return (
    <footer className="bg-[]  pl-26 pr-10 pt-5 pb-2 text-xs text-white">
      <div className="container  flex justify-between items-center">
        <div>
          <p>Portal Beta</p>
          <p>Versão 1.0.0</p>
          <p>Desenvolvido por RESOLVE</p>
        </div>
        <p className="text-sm mt-8 mr-16">Copyright © 2023 Pedro Gabriel</p>
        <div className="flex mt-8">
          <div className="flex space-x-2">
            <Link
              href="#"
              aria-label="Instagram">
              <Instagram
                size={20}
                className="text-black"
              />
            </Link>
            <Link
              href="#"
              aria-label="LinkedIn">
              <Linkedin
                size={20}
                className="text-black"
              />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterPrivate;
