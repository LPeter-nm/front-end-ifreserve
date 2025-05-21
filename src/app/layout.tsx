import { ReportProvider } from '@/context/ReportContext';
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
        <ReportProvider>
          <Toaster position="bottom-center" />
          {children}
        </ReportProvider>
      </body>
    </html>
  );
}
