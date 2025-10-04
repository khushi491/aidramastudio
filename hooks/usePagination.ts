import { useState, useMemo, useCallback } from 'react';

export interface UsePaginationReturn {
  currentPage: number;
  isFlipping: boolean;
  pages: string[][];
  totalPages: number;
  isFirstPage: boolean;
  isLastPage: boolean;
  nextPage: () => void;
  prevPage: () => void;
  setCurrentPage: (page: number) => void;
}

export function usePagination(panels: string[]): UsePaginationReturn {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  
  // Memoize pages calculation to prevent recalculation on every render
  const pages = useMemo(() => {
    const result: string[][] = [];
    for (let i = 0; i < panels.length; i += 2) {
      result.push(panels.slice(i, i + 2));
    }
    return result;
  }, [panels]);
  
  const totalPages = pages.length;
  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage === totalPages - 1;

  const nextPage = useCallback(() => {
    if (currentPage < totalPages - 1 && !isFlipping) {
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage(currentPage + 1);
        setIsFlipping(false);
      }, 300);
    }
  }, [currentPage, totalPages, isFlipping]);

  const prevPage = useCallback(() => {
    if (currentPage > 0 && !isFlipping) {
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage(currentPage - 1);
        setIsFlipping(false);
      }, 300);
    }
  }, [currentPage, isFlipping]);

  return {
    currentPage,
    isFlipping,
    pages,
    totalPages,
    isFirstPage,
    isLastPage,
    nextPage,
    prevPage,
    setCurrentPage
  };
}
