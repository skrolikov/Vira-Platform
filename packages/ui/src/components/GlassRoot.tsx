import React, { useEffect, useRef, CSSProperties } from "react";

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
  className?: string;
  style?: CSSProperties;
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
  className,
  style,
  as: Tag = "div",
}, ref) => {
  const highlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!reactiveHighlight) return;

    const handleScroll = () => {
      if (!highlightRef.current) return;
      const y = window.scrollY * highlightParallax;
      highlightRef.current.style.setProperty("--_hl-y", `${y}px`);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [reactiveHighlight, highlightParallax]);

  // blur берётся из темы (--vi-glass-blur), если не передан явно
  const backdropValue = blur !== undefined
    ? (typeof blur === "number" ? `blur(${blur}px) saturate(${saturate}%)` : blur)
    : "var(--vi-glass-blur, none)";

  // Highlight opacity тоже из темы
  const highlightStop = "var(--vi-glass-highlight, rgba(255,255,255,0.22))";

  const Element = Tag as any;

  return (
    <Element
      ref={ref}
      className={className}
      style={{
        position: "relative",
        isolation: "isolate",
        ...style,
      }}
    >
      {/* Слой 1: единый backdrop-filter на весь контейнер.
          В default теме: none (fake-glass).
          В apple теме: blur(20px) saturate(180%). */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backdropFilter: backdropValue,
          WebkitBackdropFilter: backdropValue,
          pointerEvents: "none",
          zIndex: 0,
          borderRadius: "inherit",
        }}
      />

      {/* Слой 2: scroll-reactive highlight — имитирует преломление.
          Когда контент скроллится — блик смещается → иллюзия рефракции. */}
      {reactiveHighlight && (
        <div
          ref={highlightRef}
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(
              ellipse 80% 60% at 50% calc(-20% + var(--_hl-y, 0px)),
              ${highlightStop} 0%,
              transparent 70%
            )`,
            pointerEvents: "none",
            zIndex: 1,
            borderRadius: "inherit",
            mixBlendMode: "overlay",
          } as CSSProperties}
        />
      )}

      {/* Слой 3: контент */}
      <div style={{ position: "relative", zIndex: 2 }}>
        {children}
      </div>
    </Element>
  );
});

GlassRoot.displayName = "GlassRoot";
