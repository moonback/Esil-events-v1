import { useState, useMemo } from 'react';

interface UsePaginationResult<T> {
  currentItems: T[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  indexOfFirstItem: number;
  indexOfLastItem: number;
  itemsPerPage: number;
}

export const usePagination = <T>(items: T[], itemsPerPageParam = 10): UsePaginationResult<T> => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(itemsPerPageParam);

  // Reset to first page when items change
  useMemo(() => {
    if (currentPage > 1) {
      setCurrentPage(1);
    }
  }, [items.length]);

  // Calculate pagination values
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(items.length / itemsPerPage);

  return {
    currentItems,
    currentPage,
    setCurrentPage,
    totalPages,
    indexOfFirstItem,
    indexOfLastItem,
    itemsPerPage
  };
};