import React from 'react';
import { Filter, ChevronDown } from 'lucide-react';

interface FilterButtonProps {
  isFilterOpen: boolean;
  toggleFilter: () => void;
}

const FilterButton: React.FC<FilterButtonProps> = ({ isFilterOpen, toggleFilter }) => {
  return (
    <button
      className="flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
      onClick={toggleFilter}
    >
      <Filter className="h-5 w-5 mr-2" />
      Filtrer
      <ChevronDown className={`h-5 w-5 ml-2 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
    </button>
  );
};

export default FilterButton;