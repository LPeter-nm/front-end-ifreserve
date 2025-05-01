interface FilterWeekMonthProps {
  filterValue: 'week' | 'month';
  onFilterChange: (value: 'week' | 'month') => void;
}

const FilterWeekMonth = ({ filterValue, onFilterChange }: FilterWeekMonthProps) => {
  const handleFilterValue = (value: 'week' | 'month') => {
    onFilterChange(value);
  };

  return (
    <div className="flex bg-[#D9D9D9] p-3 rounded w-72 justify-between">
      <h2 className="flex items-center">Filtro</h2>
      <div className="flex gap-2">
        <div
          className={`px-4 rounded ${
            filterValue === 'week' ? 'bg-white border border-blue-500' : 'bg-white'
          }`}>
          <button
            className="cursor-pointer"
            id="week"
            value={'week'}
            onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
              handleFilterValue(e.currentTarget.value as 'week')
            }>
            semana
          </button>
        </div>
        <div
          className={`px-4 rounded ${
            filterValue === 'month' ? 'bg-white border border-blue-500' : 'bg-white'
          }`}>
          <button
            className="cursor-pointer"
            id="month"
            value={'month'}
            onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
              handleFilterValue(e.currentTarget.value as 'month')
            }>
            mês
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterWeekMonth;
