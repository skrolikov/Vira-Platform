import React, { useEffect, useRef, CSSProperties } from "react";
import { Box } from "./Box";
import { DesignProps } from "../types";

export type GlassPanelPlacement = "left" | "right";

export interface GlassPanelProps {
  /** Управляет видимостью. Компонент всегда остаётся в DOM (offscreen rendering). */
  open: boolean;
  onClose?: () => void;
  placement?: GlassPanelPlacement;
  /** Ширина панели. Default: 480 */
  width?: number | string;
  children: React.ReactNode;
  /** Закрывать по Escape. Default: true */
  closeOnEscape?: boolean;
  /** Показывать полупрозрачный backdrop. Default: false */
  backdrop?: boolean;
  /** Дополнительные design-пропы для панели */
  design?: DesignProps;
  className?: string;
  style?: CSSProperties;
  /** z-index. Default: 400 */
  zIndex?: number;
}

/**
 * GlassPanel — боковая панель с offscreen rendering.
 *
 * Главный трюк: компонент ВСЕГДА остаётся в DOM.
 * Когда закрыт — уходит за экран через `transform: translateX(±100%)`.
 * Когда открыт — возвращается через `transform: translateX(0)`.
 *
 * Это убивает самую распространённую причину лагов при открытии панелей:
 * React больше не монтирует 200 дочерних элементов при клике — они уже готовы.
 *
 * Анимация идёт только по transform и opacity → только compositing, без layout/paint.
 * design-хэш вычисляется ДВА раза (open=true и open=false) и оба закэшируются.
 *
 * @example
 * const [open, setOpen] = useState(false)
 *
 * <GlassPanel open={open} onClose={() => setOpen(false)} width={520}>
 *   <OrderDetails orderId={selectedId} />
 * </GlassPanel>
 */
export const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(({
  open,
  onClose,
  placement = "right",
  width = 480,
  children,
  closeOnEscape = true,
  backdrop = false,
  design,
  className,
  style,
  zIndex = 400,
}, ref) => {
  const hasOpenedOnce = useRef(false);

  // Lazy mount: не рендерим ничего до первого открытия
  if (open && !hasOpenedOnce.current) {
    hasOpenedOnce.current = true;
  }

  useEffect(() => {
    if (!closeOnEscape || !open || !onClose) return;
    const handle = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [open, closeOnEscape, onClose]);

  if (!hasOpenedOnce.current) return null;

  const widthValue = typeof width === "number" ? `${width}px` : width;
  const translateClosed = placement === "right" ? "translateX(100%)" : "translateX(-100%)";

  // 2 стабильных значения transform → getDesignClass вычислит 2 хэша и закэширует оба
  const panelDesign: DesignProps = {
    position: "fixed",
    top: 0,
    bottom: 0,
    [placement]: 0,
    width: widthValue,
    maxWidth: "90vw",
    zIndex,
    transform: open ? "translateX(0)" : translateClosed,
    opacity: open ? 1 : 0,
    transition: "transform var(--vi-duration-normal, 240ms) var(--vi-ease-spring, cubic-bezier(0.16, 1, 0.3, 1)), opacity var(--vi-duration-fast, 120ms) var(--vi-ease-out, cubic-bezier(0,0,0.2,1))",
    willChange: "transform",
    contain: "layout paint",
    overflow: "hidden",
    pointerEvents: open ? "auto" : "none",
    ...design,
  };

  const backdropDesign: DesignProps = {
    position: "fixed",
    inset: 0,
    zIndex: zIndex - 1,
    bg: "rgba(0,0,0,0.3)",
    opacity: open ? 1 : 0,
    pointerEvents: open ? "auto" : "none",
    transition: "opacity var(--vi-duration-fast, 120ms) var(--vi-ease-out, cubic-bezier(0,0,0.2,1))",
  };

  return (
    <>
      {backdrop && (
        <Box
          aria-hidden
          design={backdropDesign}
          onClick={onClose}
        />
      )}
      <Box
        ref={ref}
        role="dialog"
        aria-modal={open}
        aria-hidden={!open}
        className={className}
        style={style}
        design={panelDesign}
        {...(!open && { "data-inert": "" })}
      >
        {children}
      </Box>
    </>
  );
});

GlassPanel.displayName = "GlassPanel";
