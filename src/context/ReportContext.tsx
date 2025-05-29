// src/context/ReportContext.tsx
'use client'; // Indica que este é um Client Component e usa hooks do React.

import React, { createContext, useContext, ReactNode, useState } from 'react';

// --- Interfaces de Dados ---
/**
 * Define a estrutura dos dados do relatório que serão armazenados no contexto.
 * Esses dados são transferidos entre páginas para gerar o relatório de uso.
 */
interface ReportData {
  sportId: string;
  date: string;
  timeUsed: string;
  userName: string;
}

// --- Interfaces do Contexto ---
/**
 * Define o tipo do valor que será fornecido pelo ReportContext.
 * Inclui os dados do relatório e a função para atualizá-los.
 */
interface ReportContextType {
  reportData: ReportData | null; // Os dados do relatório, podem ser nulos se não houver um relatório ativo.
  setReportData: (data: ReportData | null) => void; // Função para definir os dados do relatório.
}

// --- Criação do Contexto ---
/**
 * Cria o contexto de relatório. O valor inicial é `undefined` porque o contexto
 * será fornecido pelo `ReportProvider`.
 */
const ReportContext = createContext<ReportContextType | undefined>(undefined);

// --- Componente Provedor do Contexto ---
/**
 * `ReportProvider` é um componente que encapsula os componentes filhos
 * e fornece o `reportData` e `setReportData` para toda a subárvore.
 *
 * @param {object} props - As propriedades do componente.
 * @param {ReactNode} props.children - Os elementos filhos que terão acesso ao contexto.
 */
export function ReportProvider({ children }: { children: ReactNode }) {
  // `reportData` é o estado que armazena os dados do relatório.
  const [reportData, setReportData] = useState<ReportData | null>(null);

  return (
    // O `ReportContext.Provider` torna `reportData` e `setReportData` disponíveis
    // para todos os componentes aninhados que usarem o `useReport` hook.
    <ReportContext.Provider value={{ reportData, setReportData }}>
      {children}
    </ReportContext.Provider>
  );
}

// --- Hook Personalizado para Consumir o Contexto ---
/**
 * `useReport` é um hook personalizado que permite a componentes filhos
 * acessar facilmente o `reportData` e `setReportData` do `ReportContext`.
 *
 * @returns {ReportContextType} O objeto de contexto contendo `reportData` e `setReportData`.
 * @throws {Error} Se o hook for usado fora de um `ReportProvider`.
 */
export function useReport() {
  const context = useContext(ReportContext);
  // Garante que o hook seja usado apenas dentro do `ReportProvider` para evitar erros de tempo de execução.
  if (context === undefined) {
    throw new Error('useReport must be used within a ReportProvider');
  }
  return context;
}
