import React, { useMemo } from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  indexOfFirstItem: number;
  indexOfLastItem: number;
  totalItems: number;
}

// Composant pour les boutons de pagination
const PaginationButton: React.FC<{
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}> = ({ onClick, disabled = false, children, className = '', ariaLabel }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 ${className}`}
    aria-label={ariaLabel}
  >
    {children}
  </button>
);

// Composant pour les boutons de navigation (précédent/suivant)
const NavigationButton: React.FC<{
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  isNext?: boolean;
}> = ({ onClick, disabled = false, children, isNext = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`relative inline-flex items-center px-2 py-2 ${isNext ? 'rounded-r-md' : 'rounded-l-md'} border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50`}
  >
    {children}
  </button>
);

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  setCurrentPage,
  indexOfFirstItem,
  indexOfLastItem,
  totalItems
}) => {
  // Si pas de pagination nécessaire, ne rien afficher
  if (totalPages <= 1) return null;
  
  // Fonction pour aller à la page précédente
  const goToPreviousPage = () => setCurrentPage(Math.max(currentPage - 1, 1));
  
  // Fonction pour aller à la page suivante
  const goToNextPage = () => setCurrentPage(Math.min(currentPage + 1, totalPages));
  
  // Calcul des pages à afficher (optimisé avec useMemo)
  const pageNumbers = useMemo(() => {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }, [totalPages]);

  return (
    <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 bg-gray-50 sm:px-6">
      {/* Mobile Pagination */}
      <div className="flex-1 flex justify-between sm:hidden">
        <PaginationButton
          onClick={goToPreviousPage}
          disabled={currentPage === 1}
          ariaLabel="Page précédente"
        >
          Précédent
        </PaginationButton>
        <span className="text-sm text-gray-700 my-auto"> Page {currentPage} sur {totalPages} </span>
        <PaginationButton
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
          className="ml-3"
          ariaLabel="Page suivante"
        >
          Suivant
        </PaginationButton>
      </div>
      
      {/* Desktop Pagination */}
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Affichage de <span className="font-medium">{Math.max(indexOfFirstItem + 1, 1)}</span> à <span className="font-medium">{Math.min(indexOfLastItem, totalItems)}</span> sur <span className="font-medium">{totalItems}</span> résultats
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <NavigationButton
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
            >
              <span className="sr-only">Précédent</span>{'<'}
            </NavigationButton>
            
            {pageNumbers.map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                aria-current={currentPage === page ? 'page' : undefined}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${ currentPage === page ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-100'}`}
              >
                {page}
              </button>
            ))}
            
            <NavigationButton
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              isNext
            >
              <span className="sr-only">Suivant</span>{'>'}
            </NavigationButton>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;