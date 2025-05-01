import './globals.css';
import { Toaster } from 'react-hot-toast';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased bg-[#305F5C]`}>
        <Toaster position="bottom-left" />
        {children}
      </body>
    </html>
  );
}
