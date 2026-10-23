import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./Pagination.module.css";

export interface PaginationProps {
  currentPage: number; // 0-indexed
  totalPages: number;
  totalElements?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  className?: string;
  showDetails?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalElements,
  pageSize = 10,
  onPageChange,
  className = "",
  showDetails = true,
}) => {
  if (totalPages <= 0 && (!totalElements || totalElements <= 0)) {
    return null;
  }

  const effectiveTotalPages = Math.max(1, totalPages);
  const currentDisplayPage = currentPage + 1;

  // Calculate element range
  let startElement = 0;
  let endElement = 0;
  if (totalElements !== undefined) {
    startElement = totalElements === 0 ? 0 : currentPage * pageSize + 1;
    endElement = Math.min((currentPage + 1) * pageSize, totalElements);
  }

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    const maxVisible = 5;

    if (effectiveTotalPages <= maxVisible + 2) {
      for (let i = 0; i < effectiveTotalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(0);

      const leftBound = Math.max(1, currentPage - 1);
      const rightBound = Math.min(effectiveTotalPages - 2, currentPage + 1);

      if (leftBound > 1) {
        pages.push("...");
      }

      for (let i = leftBound; i <= rightBound; i++) {
        pages.push(i);
      }

      if (rightBound < effectiveTotalPages - 2) {
        pages.push("...");
      }

      pages.push(effectiveTotalPages - 1);
    }

    return pages;
  };

  const handlePageClick = (page: number) => {
    if (page !== currentPage && page >= 0 && page < effectiveTotalPages) {
      onPageChange(page);
    }
  };

  return (
    <div className={`${styles.paginationContainer} ${className}`}>
      {showDetails && (
        <div className={styles.details}>
          {totalElements !== undefined ? (
            <>
              Hiển thị <span className={styles.detailsBold}>{startElement}</span> -{" "}
              <span className={styles.detailsBold}>{endElement}</span> trong tổng số{" "}
              <span className={styles.detailsBold}>{totalElements}</span> mục (Trang{" "}
              <span className={styles.detailsBold}>{currentDisplayPage}</span> /{" "}
              <span className={styles.detailsBold}>{effectiveTotalPages}</span>)
            </>
          ) : (
            <>
              Trang <span className={styles.detailsBold}>{currentDisplayPage}</span> /{" "}
              <span className={styles.detailsBold}>{effectiveTotalPages}</span>
            </>
          )}
        </div>
      )}

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.pageBtn}
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage <= 0}
          aria-label="Trang trước"
          title="Trang trước"
        >
          <ChevronLeft size={16} />
        </button>

        {getPageNumbers().map((page, idx) => {
          if (page === "...") {
            return (
              <span key={`ellipsis-${idx}`} className={styles.ellipsis}>
                …
              </span>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return (
            <button
              key={`page-${pageNum}`}
              type="button"
              className={`${styles.pageBtn} ${isActive ? styles.activePageBtn : ""}`}
              onClick={() => handlePageClick(pageNum)}
              aria-current={isActive ? "page" : undefined}
            >
              {pageNum + 1}
            </button>
          );
        })}

        <button
          type="button"
          className={styles.pageBtn}
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage >= effectiveTotalPages - 1}
          aria-label="Trang sau"
          title="Trang sau"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
