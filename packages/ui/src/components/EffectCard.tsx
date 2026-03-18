import React from "react";
import { Box } from "./Box";
import { DesignProps } from "../types";
import { PresetName } from "../presets";

// SVG-noise (аналогично GlassCard)
const NOISE_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E")`;

export interface EffectCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  design?: DesignProps;
  preset?: PresetName;
  as?: keyof JSX.IntrinsicElements;
  children: React.ReactNode;
  /**
   * Показывать noise-текстуру. Default: true
   * В default теме едва заметна, в apple теме усиливает эффект стекла.
   */
  noise?: boolean;
}

/**
 * EffectCard — контейнер для popup/dropdown/floated UI элементов.
 *
 * Автоматически адаптируется к активной теме:
 * - **Default тема** → чистая белая карточка с тенью (Card-like)
 * - **Apple тема**   → матовое стекло: blur(28px) + полупрозрачный фон + noise
 *
 * Использует CSS переменные --vi-glass-popup-* из темы:
 * - `--vi-glass-popup-bg`     → фон
 * - `--vi-glass-popup-border` → цвет рамки
 * - `--vi-glass-popup-blur`   → backdrop-filter
 * - `--vi-glass-noise`        → прозрачность noise слоя
 *
 * @example
 * <EffectCard design={{ maxHeight: "500px", overflow: "auto" }}>
 *   {items}
 * </EffectCard>
 */
export const EffectCard: React.FC<EffectCardProps> = ({
  design,
  preset,
  as,
  noise = true,
  children,
  className,
  ...props
}) => {
  const containerDesign: DesignProps = {
    position: "relative",
    bg: "var(--vi-glass-popup-bg, var(--color-bg-primary, #fff))",
    border: "1px solid",
    borderColor: "var(--vi-glass-popup-border, var(--color-bg-tertiary, #e5e5e7))",
    borderRadius: "var(--radius-lg, 18px)",
    boxShadow: "var(--vi-depth-3, 0 12px 40px rgba(0,0,0,0.25)), inset 0 1px 0 rgba(255,255,255,0.3)",
    overflow: "hidden",
    backdropFilter: "var(--vi-glass-popup-blur, none)",
    ...design,
  };

  return (
    <Box
      as={as}
      preset={preset}
      className={className}
      design={containerDesign}
      {...props}
    >
      {/* Noise слой — в apple теме усиливает матовость.
          opacity через style (CSS-переменная не совместима с typed number). */}
      {noise && (
        <Box
          aria-hidden
          design={{
            position: "absolute",
            inset: 0,
            backgroundImage: NOISE_SVG,
            backgroundRepeat: "repeat",
            backgroundSize: "200px 200px",
            pointerEvents: "none",
            zIndex: 0,
            borderRadius: "inherit",
          }}
          style={{ opacity: "var(--vi-glass-noise, 0.03)" as unknown as number }}
        />
      )}

      {/* Световой блик сверху */}
      <Box
        aria-hidden
        design={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 50%)",
          pointerEvents: "none",
          zIndex: 0,
          borderRadius: "inherit",
        }}
      />

      {/* Контент */}
      <Box design={{ position: "relative", zIndex: 1 }}>
        {children}
      </Box>
    </Box>
  );
};
