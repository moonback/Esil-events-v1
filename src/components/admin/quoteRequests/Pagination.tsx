import React from 'react';

interface PaginationProps {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  indexOfFirstItem: number;
  indexOfLastItem: number;
  filteredRequestsLength: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  setCurrentPage,
  totalPages,
  indexOfFirstItem,
  indexOfLastItem,
  filteredRequestsLength
}) => {
  if (totalPages <= 1) return null;
  
  return (
    <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 bg-gradient-to-r from-indigo-50 to-indigo-100">
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 border border-indigo-300 text-sm font-medium rounded-lg text-indigo-700 bg-white hover:bg-indigo-50 transition-all duration-200 disabled:opacity-50 shadow-sm"
        > Précédent </button>
        <span className="text-sm font-medium text-indigo-700 my-auto"> Page {currentPage} sur {totalPages} </span>
        <button
          onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-indigo-300 text-sm font-medium rounded-lg text-indigo-700 bg-white hover:bg-indigo-50 transition-all duration-200 disabled:opacity-50 shadow-sm"
        > Suivant </button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-indigo-700 font-medium">
            Affichage de <span className="font-bold">{Math.max(indexOfFirstItem + 1, 1)}</span> à <span className="font-bold">{Math.min(indexOfLastItem, filteredRequestsLength)}</span> sur <span className="font-bold">{filteredRequestsLength}</span> résultats
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-indigo-300 bg-white text-sm font-medium text-indigo-500 hover:bg-indigo-50 transition-all duration-200 disabled:opacity-50"
            >
              <span className="sr-only">Première page</span>
              <span className="text-xs">«</span>
            </button>
            <button
              onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-3 py-2 border border-indigo-300 bg-white text-sm font-medium text-indigo-500 hover:bg-indigo-50 transition-all duration-200 disabled:opacity-50"
            >
              <span className="sr-only">Précédent</span>
              <span className="text-xs">‹</span>
            </button>
            
            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Logic to show pages around current page
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-all duration-200 ${currentPage === pageNum ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600 font-bold' : 'bg-white border-indigo-300 text-indigo-500 hover:bg-indigo-50'}`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-3 py-2 border border-indigo-300 bg-white text-sm font-medium text-indigo-500 hover:bg-indigo-50 transition-all duration-200 disabled:opacity-50"
            >
              <span className="sr-only">Suivant</span>
              <span className="text-xs">›</span>
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-indigo-300 bg-white text-sm font-medium text-indigo-500 hover:bg-indigo-50 transition-all duration-200 disabled:opacity-50"
            >
              <span className="sr-only">Dernière page</span>
              <span className="text-xs">»</span>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export { Pagination };