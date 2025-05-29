// Não é necessário 'use client' aqui, pois RootLayout é um Server Component por padrão no App Router.
// Se você adicionar hooks ou interatividade direta que precise de cliente, aí sim use.

// --- Importações de Bibliotecas e Estilos Globais ---
// Importações de componentes globais e estilos CSS.
import './globals.css'; // Importa os estilos CSS globais para a aplicação.
import { Toaster } from 'react-hot-toast'; // Componente para exibir toasts (notificações).

// --- Provedores de Contexto ---
// Importa provedores de contexto que envolvem toda a aplicação.
import { ReportProvider } from '@/context/ReportContext'; // Provedor para o contexto de relatórios.

// --- Definição do Root Layout ---
// Este é o componente de layout raiz para toda a aplicação Next.js.
// Ele envolve todo o conteúdo e fornece estruturas globais.
export default function RootLayout({
  children, // `children` representa o conteúdo aninhado (outras páginas e layouts).
}: Readonly<{
  children: React.ReactNode; // Define o tipo de `children` como um nó React.
}>) {
  return (
    // A tag <html> define a raiz de um documento HTML. `lang="en"` define o idioma principal.
    <html lang="en">
      {/* A tag <body> contém todo o conteúdo visível de uma página HTML.
          `className` aplica estilos globais ao corpo. */}
      <body className={`antialiased bg-[#305F5C]`}>
        {/* ReportProvider: Envolve os `children` para que todas as partes da aplicação
            tenham acesso ao contexto de relatórios. */}
        <ReportProvider>
          {/* Toaster: Componente para exibir notificações (toasts) em toda a aplicação.
              Posicionado no canto inferior central. */}
          <Toaster position="bottom-center" />
          {/* `children` serão as páginas e layouts aninhados que este RootLayout envolve. */}
          {children}
        </ReportProvider>
      </body>
    </html>
  );
}
