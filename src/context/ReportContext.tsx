// Crie um arquivo src/context/ReportContext.tsx
'use client';

import { createContext, useContext, ReactNode, useState } from 'react';

interface ReportData {
  sportId: string;
  date: string;
  timeUsed: string;
  userName: string;
}

interface ReportContextType {
  reportData: ReportData | null;
  setReportData: (data: ReportData | null) => void;
}

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export function ReportProvider({ children }: { children: ReactNode }) {
  const [reportData, setReportData] = useState<ReportData | null>(null);

  return (
    <ReportContext.Provider value={{ reportData, setReportData }}>
      {children}
    </ReportContext.Provider>
  );
}

export function useReport() {
  const context = useContext(ReportContext);
  if (context === undefined) {
    throw new Error('useReport must be used within a ReportProvider');
  }
  return context;
}
