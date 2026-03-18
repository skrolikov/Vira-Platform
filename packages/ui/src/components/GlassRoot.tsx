import React, { useEffect, useRef } from "react";
import { Box } from "./Box";
import { DesignProps } from "../types";

export interface GlassRootProps {
  children: React.ReactNode;
  /**
   * Радиус размытия в пикселях.
   * По умолчанию использует --vi-glass-blur из темы.
   * Передай число чтобы переопределить для конкретной секции.
   */
  blur?: number | string;
  /** Насыщенность (saturate) — только при blur=число. Default: 180 */
  saturate?: number;
  /** Включает scroll-reactive highlight (блик от движения контента). Default: true */
  reactiveHighlight?: boolean;
  /** Множитель сдвига блика при скролле. Default: 0.15 */
  highlightParallax?: number;
  /** Дополнительные design-пропы для контейнера */
  design?: DesignProps;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

/**
 * GlassRoot — обёртка для секции с единым слоем backdrop-filter.
 *
 * Главная идея: вместо того чтобы вешать backdrop-filter на каждую карточку
 * (что убивает GPU), мы применяем его ОДИН РАЗ на весь контейнер.
 * Карточки внутри (GlassCard) используют только полупрозрачный фон — без blur.
 *
 * Дополнительно: при скролле световой блик слегка смещается, создавая
 * иллюзию рефракции настоящего стекла (трюк из Apple visionOS UI).
 *
 * Highlight background содержит CSS-переменную --_hl-y которую мы меняем
 * через style.setProperty при скролле. design-хэш вычисляется ОДИН раз
 * (строка стабильна), браузер резолвит переменную сам на каждый paint.
 *
 * @example
 * <GlassRoot>
 *   <GlassCard>...</GlassCard>
 *   <GlassCard>...</GlassCard>
 * </GlassRoot>
 */
export const GlassRoot = React.forwardRef<HTMLDivElement, GlassRootProps>(({
  children,
  blur,
  saturate = 180,
  reactiveHighlight = true,
  highlightParallax = 0.15,
  design,
  className,
  as = "div",
}, ref) => {
  const highlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!reactiveHighlight) return;
    const handleScroll = () => {
      if (!highlightRef.current) return;
      highlightRef.current.style.setProperty("--_hl-y", `${window.scrollY * highlightParallax}px`);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [reactiveHighlight, highlightParallax]);

  // blur берётся из темы (--vi-glass-blur), если не передан явно
  const backdropValue = blur !== undefined
    ? (typeof blur === "number" ? `blur(${blur}px) saturate(${saturate}%)` : blur)
    : "var(--vi-glass-blur, none)";

  return (
    <Box
      as={as}
      ref={ref}
      className={className}
      design={{ position: "relative", isolation: "isolate", ...design }}
    >
      {/* Слой 1: единый backdrop-filter на весь контейнер.
          В default теме: none (fake-glass).
          В apple теме: blur(20px) saturate(180%).
          getDesignClass() вычислит хэш один раз и закэширует. */}
      <Box
        aria-hidden
        design={{
          position: "absolute",
          inset: 0,
          backdropFilter: backdropValue,
          pointerEvents: "none",
          zIndex: 0,
          borderRadius: "inherit",
        }}
      />

      {/* Слой 2: scroll-reactive highlight.
          background содержит var(--_hl-y, 0px) — CSS переменная, которую
          мы меняем через ref.style.setProperty при скролле.
          design-хэш стабилен (строка не меняется) → CSS класс создаётся один раз.
          Браузер сам пересчитывает gradient при изменении --_hl-y без React. */}
      {reactiveHighlight && (
        <Box
          ref={highlightRef}
          aria-hidden
          design={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse 80% 60% at 50% calc(-20% + var(--_hl-y, 0px)), var(--vi-glass-highlight, rgba(255,255,255,0.22)) 0%, transparent 70%)",
            pointerEvents: "none",
            zIndex: 1,
            borderRadius: "inherit",
            mixBlendMode: "overlay",
          }}
        />
      )}

      {/* Слой 3: контент */}
      <Box design={{ position: "relative", zIndex: 2 }}>
        {children}
      </Box>
    </Box>
  );
});

GlassRoot.displayName = "GlassRoot";
