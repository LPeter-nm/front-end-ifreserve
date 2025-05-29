// Não é necessário 'use client' se este componente não usa hooks, mas como ele usa eventos onClick,
// e é um componente interativo que recebe props de um pai 'use client', é apropriado mantê-lo.
'use client';

import React from 'react'; // React é importado automaticamente em algumas versões do Next.js, mas é boa prática mantê-lo.

// --- Interfaces de Props ---
interface FilterWeekMonthProps {
  filterValue: 'week' | 'month'; // O valor atualmente selecionado ('week' ou 'month').
  onFilterChange: (value: 'week' | 'month') => void; // Callback para quando o filtro muda.
}

// --- Componente Principal ---
const FilterWeekMonth = ({ filterValue, onFilterChange }: FilterWeekMonthProps) => {
  // --- Handlers de Interação do Usuário ---
  // Função para lidar com a mudança do filtro.
  const handleFilterValue = (value: 'week' | 'month') => {
    onFilterChange(value); // Chama a função de callback passada via props.
  };

  // --- JSX Principal ---
  return (
    <div className="flex bg-[#D9D9D9] p-3 rounded w-72 justify-between">
      {/* Título do Filtro */}
      <h2 className="flex items-center text-gray-800 font-semibold">Filtro</h2>

      {/* Contêiner dos Botões de Filtro */}
      <div className="flex gap-2">
        {/* Botão para Visualização por Semana */}
        <div
          className={`px-4 py-2 rounded transition-all duration-200 cursor-pointer ${
            filterValue === 'week'
              ? 'bg-white border-2 border-blue-500 shadow-md'
              : 'bg-white border border-gray-300'
          }`}
          // Usando onClick no div pai para uma área clicável maior e mais fácil.
          onClick={() => handleFilterValue('week')}>
          <button
            className="text-gray-700 font-medium"
            id="week"
            value={'week'}
            // onClick interno não é estritamente necessário se o pai já lida, mas pode ser mantido para acessibilidade.
            // Poderia ser removido para simplificar, já que o div pai já o envolve.
          >
            Semana
          </button>
        </div>

        {/* Botão para Visualização por Mês */}
        <div
          className={`px-4 py-2 rounded transition-all duration-200 cursor-pointer ${
            filterValue === 'month'
              ? 'bg-white border-2 border-blue-500 shadow-md'
              : 'bg-white border border-gray-300'
          }`}
          // Usando onClick no div pai.
          onClick={() => handleFilterValue('month')}>
          <button
            className="text-gray-700 font-medium"
            id="month"
            value={'month'}>
            Mês
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterWeekMonth;
