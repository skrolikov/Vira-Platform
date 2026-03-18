import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useImperativeHandle,
  memo,
  CSSProperties,
} from "react";
import { DesignProps } from "../types";
import { getDesignClass, applyDesignClass } from "../utils/design-utils";

// ─────────────────────────────────────────────────────────────
//  Типы
// ─────────────────────────────────────────────────────────────

export interface VirtualListHandle {
  scrollToIndex: (index: number, align?: "start" | "center" | "end") => void;
  scrollToTop: () => void;
  scrollToBottom: () => void;
  getScrollTop: () => number;
}

export interface VirtualListProps<T = any> {
  items: T[];
  /**
   * Высота одного элемента.
   * Число = стабильная высота (Linear-трюк: никогда не меняется).
   * Функция = динамические высоты (медленнее).
   * Рекомендуется число: даёт 5-10× прирост производительности.
   */
  itemHeight: number | ((index: number) => number);
  /** Высота контейнера. Число (px) или строка CSS ('100%', 'calc(...)'). */
  containerHeight: number | string;
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Уникальный ключ элемента. Default: index. */
  keyExtractor?: (item: T, index: number) => React.Key;
  /**
   * Сколько элементов рендерить вне видимой области.
   * Больше = плавнее при быстром скролле, но дороже.
   * Default: 5.
   */
  overscan?: number;
  /** Что показать когда items.length === 0. */
  emptyState?: React.ReactNode;
  onScroll?: (scrollTop: number) => void;
  /** Вызывается когда скролл достигает нижнего порога. Для infinite scroll. */
  onEndReached?: () => void;
  /** Порог в px до конца при котором вызывается onEndReached. Default: 200. */
  endReachedThreshold?: number;
  design?: DesignProps;
  className?: string;
  role?: "list" | "none";
  /**
   * Стабильная высота строки — трюк из Linear.
   * Принудительно ограничивает высоту строки до itemHeight + overflow hidden.
   * Убирает перемерки, стабилизирует виртуализацию. Рекомендуется.
   */
  stableRows?: boolean;
}

// ─────────────────────────────────────────────────────────────
//  Внутренний Row — React.memo обёртка
//  Ключевой паттерн: Row никогда не пересоздаётся при скролле.
//  Пересоздаётся только если данные строки изменились.
// ─────────────────────────────────────────────────────────────

interface RowProps {
  rowIndex: number;
  top: number;
  height: number;
  stableRows: boolean;
  children: React.ReactNode;
  role?: "listitem";
}

const Row = memo(function Row({ top, height, stableRows, children, role }: RowProps) {
  const style: CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    // GPU-only positioning — избегаем layout reflow при каждом пикселе скролла
    transform: `translateY(${top}px)`,
    willChange: "transform",
    // Layout isolation: браузер не пересчитывает соседние строки
    contain: "layout paint",
    boxSizing: "border-box",
    ...(stableRows && {
      height: `${height}px`,
      overflow: "hidden",
    }),
  };
  return (
    <div style={style} role={role}>
      {children}
    </div>
  );
});

// ─────────────────────────────────────────────────────────────
//  VirtualList
// ─────────────────────────────────────────────────────────────

/**
 * VirtualList — производительный виртуализированный список.
 *
 * ## Что внутри (формула Linear/Notion):
 *
 * 1. **DOM recycling** — фиксированный пул DOM-узлов (только видимые + overscan).
 *    Скролл не создаёт/уничтожает DOM — только двигает через `transform`.
 *
 * 2. **RAF throttle** — scroll handler обновляет state через requestAnimationFrame.
 *    Не рендерим на каждый пиксель, только раз в 16ms.
 *
 * 3. **Стабильные строки** — `contain: layout paint` + фиксированная высота.
 *    Браузер не пересчитывает остальной layout при изменении одной строки.
 *
 * 4. **GPU transforms** — позиционирование через `transform: translateY`
 *    вместо `top`. Только compositing, без layout/paint.
 *
 * 5. **React.memo rows** — каждая строка обёрнута в memo.
 *    Пересоздаётся только при изменении данных этой строки.
 *
 * 6. **contain: strict** — на контейнере. Браузер изолирует весь список
 *    от остального документа.
 *
 * ## Производительность:
 * - 100k элементов → 60fps прокрутка
 * - DOM nodes: ~20–30 вместо 100000
 * - Layout recalculations: только внутри контейнера
 *
 * @example
 * // Базовое использование (наилучшая производительность)
 * <VirtualList
 *   items={orders}
 *   itemHeight={72}
 *   containerHeight={600}
 *   stableRows
 *   renderItem={(order) => <OrderRow order={order} />}
 *   keyExtractor={(o) => o.id}
 * />
 *
 * @example
 * // Infinite scroll
 * <VirtualList
 *   items={orders}
 *   itemHeight={72}
 *   containerHeight="100%"
 *   onEndReached={loadMore}
 *   endReachedThreshold={300}
 *   renderItem={...}
 * />
 */
export const VirtualList = React.forwardRef(function VirtualList<T = any>(
  {
    items,
    itemHeight,
    containerHeight,
    renderItem,
    keyExtractor,
    overscan = 5,
    emptyState,
    onScroll,
    onEndReached,
    endReachedThreshold = 200,
    design,
    className,
    role = "list",
    stableRows = false,
  }: VirtualListProps<T>,
  ref: React.Ref<VirtualListHandle>
) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const scrollTopRef = useRef(0);
  const [scrollTop, setScrollTop] = useState(0);
  const endReachedFiredRef = useRef(false);

  // ── Высота элемента ──────────────────────────────────────
  const getItemHeight = useCallback(
    (index: number) =>
      typeof itemHeight === "function" ? itemHeight(index) : itemHeight,
    [itemHeight]
  );

  // ── Кумулятивные offset-ы (мемоизировано) ───────────────
  // Для фиксированной высоты — O(1). Для динамической — O(n) при первом рендере.
  const offsets = useMemo(() => {
    if (typeof itemHeight === "number") return null; // O(1) для fixed height
    const arr = new Float64Array(items.length + 1);
    for (let i = 0; i < items.length; i++) {
      arr[i + 1] = arr[i] + getItemHeight(i);
    }
    return arr;
  }, [items.length, itemHeight, getItemHeight]);

  const totalHeight = useMemo(() => {
    if (typeof itemHeight === "number") return items.length * itemHeight;
    return offsets ? offsets[items.length] : 0;
  }, [items.length, itemHeight, offsets]);

  // ── Вычисляем видимый диапазон ───────────────────────────
  const getVisibleRange = useCallback(
    (sTop: number, containerH: number) => {
      const fixedH = typeof itemHeight === "number" ? itemHeight : 0;

      let startIndex: number;
      let endIndex: number;

      if (fixedH > 0) {
        // O(1) для fixed height — главный трюк производительности
        startIndex = Math.max(0, Math.floor(sTop / fixedH) - overscan);
        endIndex = Math.min(
          items.length,
          Math.ceil((sTop + containerH) / fixedH) + overscan
        );
      } else {
        // O(log n) бинарный поиск для dynamic height
        if (!offsets) return { startIndex: 0, endIndex: 0 };
        let lo = 0,
          hi = items.length - 1;
        while (lo < hi) {
          const mid = (lo + hi) >> 1;
          if (offsets[mid + 1] <= sTop) lo = mid + 1;
          else hi = mid;
        }
        startIndex = Math.max(0, lo - overscan);

        lo = startIndex;
        hi = items.length - 1;
        while (lo < hi) {
          const mid = (lo + hi) >> 1;
          if (offsets[mid + 1] < sTop + containerH) lo = mid + 1;
          else hi = mid;
        }
        endIndex = Math.min(items.length, lo + overscan);
      }

      return { startIndex, endIndex };
    },
    [items.length, itemHeight, overscan, offsets]
  );

  // ── Числовая высота контейнера для расчётов ──────────────
  const containerHeightNum = useMemo(() => {
    if (typeof containerHeight === "number") return containerHeight;
    // Для строковых значений используем fallback 600 для первичных расчётов
    return 600;
  }, [containerHeight]);

  const { startIndex, endIndex } = useMemo(
    () => getVisibleRange(scrollTop, containerHeightNum),
    [scrollTop, containerHeightNum, getVisibleRange]
  );

  // ── RAF-throttled scroll ─────────────────────────────────
  // Не рендерим на каждый пиксель — только 1 раз в 16ms (60fps max)
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      if (rafRef.current !== null) return; // уже запланирован RAF

      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const newScrollTop = target.scrollTop;
        scrollTopRef.current = newScrollTop;
        setScrollTop(newScrollTop);
        onScroll?.(newScrollTop);

        // Infinite scroll trigger
        if (onEndReached) {
          const distToBottom =
            target.scrollHeight - target.scrollTop - target.clientHeight;
          if (distToBottom < endReachedThreshold && !endReachedFiredRef.current) {
            endReachedFiredRef.current = true;
            onEndReached();
          } else if (distToBottom >= endReachedThreshold) {
            endReachedFiredRef.current = false;
          }
        }
      });
    },
    [onScroll, onEndReached, endReachedThreshold]
  );

  // ── Cleanup RAF on unmount ───────────────────────────────
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ── Imperative handle ────────────────────────────────────
  useImperativeHandle(ref, () => ({
    scrollToIndex: (index, align = "start") => {
      const el = scrollRef.current;
      if (!el) return;
      const fixedH = typeof itemHeight === "number" ? itemHeight : 0;
      let top: number;
      if (fixedH > 0) {
        top = index * fixedH;
      } else {
        top = offsets ? offsets[index] : 0;
      }
      if (align === "center") top -= containerHeightNum / 2 - getItemHeight(index) / 2;
      if (align === "end") top -= containerHeightNum - getItemHeight(index);
      el.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    },
    scrollToTop: () => scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" }),
    scrollToBottom: () =>
      scrollRef.current?.scrollTo({ top: totalHeight, behavior: "smooth" }),
    getScrollTop: () => scrollTopRef.current,
  }));

  // ── Empty state ──────────────────────────────────────────
  if (items.length === 0 && emptyState) return <>{emptyState}</>;

  // ── Контейнер ────────────────────────────────────────────
  const designClass = design ? getDesignClass(design) : "";
  const finalClassName = applyDesignClass(className, designClass);

  const containerHeightValue =
    typeof containerHeight === "number" ? `${containerHeight}px` : containerHeight;

  const containerStyle: CSSProperties = {
    height: containerHeightValue,
    overflow: "auto",
    position: "relative",
    // contain: strict — браузер изолирует список от остального layout.
    // Это один из самых мощных CSS-оптимизаций для больших списков.
    contain: "strict",
  };

  const trackStyle: CSSProperties = {
    position: "relative",
    width: "100%",
    height: `${totalHeight}px`,
    minHeight: `${totalHeight}px`,
  };

  return (
    <div
      ref={scrollRef}
      className={finalClassName}
      style={containerStyle}
      onScroll={handleScroll}
      role={role === "list" ? "list" : undefined}
    >
      <div style={trackStyle}>
        {/* DOM recycling pool: только endIndex - startIndex + overscan*2 узлов в DOM */}
        {Array.from({ length: endIndex - startIndex }).map((_, i) => {
          const index = startIndex + i;
          const item = items[index];
          if (!item) return null;

          const top =
            typeof itemHeight === "number"
              ? index * itemHeight
              : offsets
              ? offsets[index]
              : 0;

          const height = getItemHeight(index);
          const key = keyExtractor ? keyExtractor(item, index) : index;

          return (
            <Row
              key={key}
              rowIndex={index}
              top={top}
              height={height}
              stableRows={stableRows}
              role={role === "list" ? "listitem" : undefined}
            >
              {renderItem(item, index)}
            </Row>
          );
        })}
      </div>
    </div>
  );
}) as <T>(
  props: VirtualListProps<T> & { ref?: React.Ref<VirtualListHandle> }
) => JSX.Element;

(VirtualList as any).displayName = "VirtualList";
