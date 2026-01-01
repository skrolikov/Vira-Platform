import React, { useState, useRef, useMemo } from "react";
import { DesignProps } from "../types";
import { mergeDesign, getDesignClass, applyDesignClass } from "../utils/design-utils";

/**
 * VirtualList - Виртуализированный список для больших данных
 * Рендерит только видимые элементы для оптимизации производительности
 */

export interface VirtualListProps<T = any> {
  design?: DesignProps;
  items: T[];
  itemHeight: number | ((index: number) => number);
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number; // Количество элементов для рендера за пределами видимой области
  onScroll?: (scrollTop: number) => void;
  className?: string;
}

export function VirtualList<T = any>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 3,
  onScroll,
  design,
  className,
  ...props
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Вычисляем высоту элемента
  const getItemHeight = useMemo(() => {
    if (typeof itemHeight === "function") {
      return itemHeight;
    }
    return () => itemHeight;
  }, [itemHeight]);

  // Вычисляем общую высоту
  const totalHeight = useMemo(() => {
    if (typeof itemHeight === "number") {
      return items.length * itemHeight;
    }
    return items.reduce((sum, _, index) => sum + getItemHeight(index), 0);
  }, [items, itemHeight, getItemHeight]);

  // Вычисляем видимые индексы
  const { startIndex, endIndex, offsetY } = useMemo(() => {
    let currentOffset = 0;
    let start = 0;
    let end = 0;

    // Находим начальный индекс
    for (let i = 0; i < items.length; i++) {
      const height = getItemHeight(i);
      if (currentOffset + height > scrollTop) {
        start = Math.max(0, i - overscan);
        break;
      }
      currentOffset += height;
    }

    // Находим конечный индекс
    const visibleHeight = scrollTop + containerHeight;
    let offset = currentOffset;
    for (let i = start; i < items.length; i++) {
      const height = getItemHeight(i);
      if (offset > visibleHeight) {
        end = Math.min(items.length, i + overscan);
        break;
      }
      offset += height;
      end = i + 1;
    }

    // Вычисляем offset для первого элемента
    let offsetY = 0;
    for (let i = 0; i < start; i++) {
      offsetY += getItemHeight(i);
    }

    return { startIndex: start, endIndex: Math.min(items.length, end + overscan), offsetY };
  }, [scrollTop, containerHeight, items, overscan, getItemHeight]);

  // Обработчик скролла
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    onScroll?.(newScrollTop);
  };

  // Видимые элементы
  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: startIndex + index,
    }));
  }, [items, startIndex, endIndex]);

  const containerDesign: DesignProps = {
    overflow: "auto",
    height: `${containerHeight}px`,
    ...design,
  };

  const mergedDesign = mergeDesign(containerDesign, design);
  const designClass = getDesignClass(mergedDesign);
  const finalClassName = applyDesignClass(className, designClass);

  return (
    <div
      ref={containerRef}
      className={finalClassName}
      onScroll={handleScroll}
      data-design={JSON.stringify(mergedDesign)}
      {...props}
    >
      <div style={{ height: `${totalHeight}px`, position: "relative" }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map(({ item, index }) => (
            <div key={index} style={{ height: `${getItemHeight(index)}px` }}>
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

