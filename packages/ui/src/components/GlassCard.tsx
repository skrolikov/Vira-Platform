import React, { CSSProperties } from "react";
import { DesignProps } from "../types";
import { mergeDesign, getDesignClass, applyDesignClass } from "../utils/design-utils";

// SVG-noise как data URI — имитирует текстуру матового стекла.
// Noise ломает идеальную прозрачность → мозг читает как реальное матовое стекло.
// Для Apple/стеклянных тем opacity управляется через --vi-glass-noise.
const NOISE_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E")`;

export type GlassCardVariant = "light" | "dark" | "tinted";

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Вариант стекла:
   * - `light`  — использует --vi-glass-bg/border (светлое стекло)
   * - `dark`   — использует --vi-glass-dark-bg/border (тёмное стекло)
   * - `tinted` — с лёгким оттенком от --color-primary
   */
  variant?: GlassCardVariant;
  /** Показывать световой блик сверху. Default: true */
  highlight?: boolean;
  /** Показывать noise-текстуру. Default: true */
  noise?: boolean;
  /**
   * Border-radius. Default: var(--radius-lg)
   * Можно передать строку CSS: "var(--radius-xl)", "24px", etc.
   */
  radius?: string;
  /** Дополнительные design props */
  design?: DesignProps;
  children?: React.ReactNode;
}

/**
 * GlassCard — карточка с эффектом матового стекла.
 *
 * **Автоматически адаптируется к теме через CSS переменные:**
 * - Default тема → fake glass (без backdrop-filter, 10× быстрее)
 * - Apple тема   → настоящий blur (--vi-glass-blur = "blur(20px) saturate(180%)")
 *
 * Для blur нужен прозрачный/градиентный фон за компонентом или <GlassRoot>.
 *
 * Эффект стекла строится из 5 слоёв:
 * 1. `backdrop-filter: var(--vi-glass-blur)` — blur (в apple теме)
 * 2. Полупрозрачный фон `var(--vi-glass-bg)`
 * 3. Тонкая белая/прозрачная граница `var(--vi-glass-border)`
 * 4. SVG noise текстура (opacity: var(--vi-glass-noise)) — главный трюк
 * 5. Световой градиент сверху (симулирует освещение)
 *
 * @example
 * // Базовое использование (auto-themed)
 * <GlassCard>Контент</GlassCard>
 *
 * // Тёмный вариант
 * <GlassCard variant="dark" radius="var(--radius-xl)">
 *   <p>Тёмное стекло</p>
 * </GlassCard>
 *
 * // С максимальным контролем — обёрни в GlassRoot для shared blur layer
 * <GlassRoot blur={24}>
 *   <GlassCard noise={false}>...</GlassCard>
 * </GlassRoot>
 */
export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(({
  variant = "light",
  highlight = true,
  noise = true,
  radius = "var(--radius-lg, 18px)",
  design,
  className,
  children,
  style,
  ...props
}, ref) => {
  const baseDesign: DesignProps = {};
  const finalDesign = design ? mergeDesign(baseDesign, design) : baseDesign;
  const designClass = Object.keys(finalDesign).length > 0 ? getDesignClass(finalDesign) : "";
  const finalClassName = applyDesignClass(className, designClass);

  // Фон, граница и blur берутся из CSS переменных темы.
  // Default тема → rgba с opacity ~0.06, blur = none (fake-glass).
  // Apple тема   → rgba(255,255,255,0.72), blur = "blur(20px) saturate(180%)".
  const bgVar = variant === "dark"
    ? "var(--vi-glass-dark-bg, rgba(0,0,0,0.20))"
    : variant === "tinted"
      ? "color-mix(in srgb, var(--color-primary, #007aff) 6%, var(--vi-glass-bg, rgba(255,255,255,0.06)))"
      : "var(--vi-glass-bg, rgba(255,255,255,0.06))";

  const borderVar = variant === "dark"
    ? "var(--vi-glass-dark-border, rgba(255,255,255,0.08))"
    : "var(--vi-glass-border, rgba(255,255,255,0.14))";

  const containerStyle: CSSProperties = {
    position: "relative",
    borderRadius: radius,
    background: bgVar,
    border: "1px solid",
    borderColor: borderVar,
    boxShadow: [
      "var(--vi-depth-2, 0 6px 20px rgba(0,0,0,0.15))",
      "inset 0 1px 0 rgba(255,255,255,0.2)",
    ].join(", "),
    overflow: "hidden",
    // blur — "none" в default теме, реальный blur в apple теме
    backdropFilter: "var(--vi-glass-blur, none)",
    WebkitBackdropFilter: "var(--vi-glass-blur, none)",
    ...style,
  };

  return (
    <div
      ref={ref}
      className={finalClassName}
      style={containerStyle}
      {...props}
    >
      {/* Noise текстура — главный секрет матового стекла.
          opacity берётся из --vi-glass-noise (0.04 default, 0.03 apple) */}
      {noise && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: NOISE_SVG,
            backgroundRepeat: "repeat",
            backgroundSize: "200px 200px",
            opacity: "var(--vi-glass-noise, 0.04)" as any,
            pointerEvents: "none",
            zIndex: 0,
            borderRadius: "inherit",
          }}
        />
      )}

      {/* Световой градиент сверху — симулирует освещение сверху */}
      {highlight && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(
              180deg,
              var(--vi-glass-highlight, rgba(255,255,255,0.22)) 0%,
              rgba(255,255,255,0.04) 40%,
              transparent 100%
            )`,
            pointerEvents: "none",
            zIndex: 0,
            borderRadius: "inherit",
          }}
        />
      )}

      {/* Контент поверх слоёв */}
      <div style={{ position: "relative", zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
});

GlassCard.displayName = "GlassCard";
