'use client';

import React from 'react';
import { ChevronRight, ChevronLeft, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1
}: PaginationProps) {
  
  const range = (start: number, end: number) => {
    let length = end - start + 1;
    return Array.from({ length }, (_, idx) => idx + start);
  };

  const paginationRange = () => {
    const totalPageNumbers = siblingCount + 5;

    if (totalPageNumbers >= totalPages) {
      return range(1, totalPages);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      let leftItemCount = 3 + 2 * siblingCount;
      let leftRange = range(1, leftItemCount);
      return [...leftRange, 'DOTS', totalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      let rightItemCount = 3 + 2 * siblingCount;
      let rightRange = range(totalPages - rightItemCount + 1, totalPages);
      return [firstPageIndex, 'DOTS', ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      let middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [firstPageIndex, 'DOTS', ...middleRange, 'DOTS', lastPageIndex];
    }
  };

  const pages = paginationRange() || [];

  if (currentPage === 0 || totalPages < 2) {
    return null;
  }

  const onNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  const onPrevious = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  return (
    <nav className="flex items-center justify-center gap-2 mt-6 animate-fade-in" aria-label="التنقل بين الصفحات">
      {/* Previous Button */}
      <button
        onClick={onPrevious}
        disabled={currentPage === 1}
        className={`
          p-2 rounded-lg border border-border transition-all duration-300
          ${currentPage === 1 
            ? 'opacity-30 cursor-not-allowed' 
            : 'hover:bg-primary-light/10 hover:border-primary text-text hover:text-primary active:scale-90'}
        `}
      >
        <ChevronRight size={18} />
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pages.map((pageNumber, idx) => {
          if (pageNumber === 'DOTS') {
            return (
              <span key={`dots-${idx}`} className="px-2 text-text-muted">
                <MoreHorizontal size={16} />
              </span>
            );
          }

          const pageNum = pageNumber as number;
          const isActive = pageNum === currentPage;

          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`
                min-w-9 h-9 rounded-lg text-sm font-bold transition-all duration-300
                ${isActive 
                  ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-110' 
                  : 'text-text-muted hover:bg-primary-light/10 hover:text-primary'}
              `}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      <button
        onClick={onNext}
        disabled={currentPage === totalPages}
        className={`
          p-2 rounded-lg border border-border transition-all duration-300
          ${currentPage === totalPages 
            ? 'opacity-30 cursor-not-allowed' 
            : 'hover:bg-primary-light/10 hover:border-primary text-text hover:text-primary active:scale-90'}
        `}
      >
        <ChevronLeft size={18} />
      </button>
    </nav>
  );
}
