import React from "react";
import { DesignProps } from "../types";
import { mergeDesign, getDesignClass, applyDesignClass } from "../utils/design-utils";
import { Button } from "./Button";
import { Flex } from "./Flex";
import { Text } from "./Text";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPrevNext?: boolean;
  showFirstLast?: boolean;
  maxVisible?: number;
  design?: DesignProps;
}

/**
 * Pagination - Компонент пагинации
 * 
 * Поддерживает:
 * - Кнопки предыдущая/следующая
 * - Кнопки первая/последняя
 * - Ограничение видимых страниц
 */
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showPrevNext = true,
  showFirstLast = false,
  maxVisible = 7,
  design,
}) => {
  const containerDesign: DesignProps = {
    display: "flex",
    alignItems: "center",
    gap: 1,
    ...design,
  };

  const mergedDesign = mergeDesign(containerDesign, design);
  const designClass = getDesignClass(mergedDesign);

  const getVisiblePages = (): (number | "ellipsis")[] => {
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | "ellipsis")[] = [];
    const half = Math.floor(maxVisible / 2);

    if (currentPage <= half + 1) {
      for (let i = 1; i <= maxVisible - 2; i++) {
        pages.push(i);
      }
      pages.push("ellipsis");
      pages.push(totalPages);
    } else if (currentPage >= totalPages - half) {
      pages.push(1);
      pages.push("ellipsis");
      for (let i = totalPages - (maxVisible - 3); i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      pages.push("ellipsis");
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pages.push(i);
      }
      pages.push("ellipsis");
      pages.push(totalPages);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <Flex className={designClass} design={mergedDesign} data-design={JSON.stringify(mergedDesign)}>
      {showFirstLast && currentPage > 1 && (
        <Button
          preset="ghost"
          onClick={() => onPageChange(1)}
          design={{
            padding: "8px 12px",
          }}
        >
          Первая
        </Button>
      )}

      {showPrevNext && (
        <Button
          preset="ghost"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          design={{
            padding: "8px",
          }}
        >
          <ChevronLeft size={20} />
        </Button>
      )}

      {visiblePages.map((page, index) => {
        if (page === "ellipsis") {
          return (
            <Flex
              key={`ellipsis-${index}`}
              design={{
                alignItems: "center",
                justifyContent: "center",
                width: "40px",
                height: "40px",
              }}
            >
              <MoreHorizontal size={20} color="#9ca3af" />
            </Flex>
          );
        }

        const isActive = page === currentPage;

        return (
          <Button
            key={page}
            preset={isActive ? "primary" : "ghost"}
            onClick={() => onPageChange(page)}
            design={{
              padding: "8px 12px",
              minWidth: "40px",
            }}
          >
            {page}
          </Button>
        );
      })}

      {showPrevNext && (
        <Button
          preset="ghost"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          design={{
            padding: "8px",
          }}
        >
          <ChevronRight size={20} />
        </Button>
      )}

      {showFirstLast && currentPage < totalPages && (
        <Button
          preset="ghost"
          onClick={() => onPageChange(totalPages)}
          design={{
            padding: "8px 12px",
          }}
        >
          Последняя
        </Button>
      )}
    </Flex>
  );
};

