import React from 'react';
import { Filter, ChevronDown } from 'lucide-react';

interface FilterButtonProps {
  isFilterOpen: boolean;
  toggleFilter: () => void;
}

const FilterButton: React.FC<FilterButtonProps> = ({ isFilterOpen, toggleFilter }) => {
  return (
    <div className="lg:hidden mb-4">
      <button
        onClick={toggleFilter}
        className="flex items-center justify-center w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        <Filter className="h-5 w-5 mr-2" />
        Filtres
        <ChevronDown className={`h-5 w-5 ml-2 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
      </button>
    </div>
  );
};

export default FilterButton;