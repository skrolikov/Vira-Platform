import React, { useEffect, useRef } from "react";
import type { DesignProps } from "@vira-ui/ui";
import { mergeDesign, getDesignClass, applyDesignClass, Flex, Heading, Button } from "@vira-ui/ui";
import type { ViraComponentProps } from "@vira-ui/core";
import { X } from "lucide-react";

// Вспомогательные функции для accessibility
const generateAriaId = (prefix: string) => `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
const useAriaAttributes = (options: any) => ({
  role: options.role,
  "aria-labelledby": options.labelledBy,
  "aria-describedby": options.describedBy,
  ...options.customAria,
});
const createFocusTrap = (element: HTMLElement) => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "Tab") return;
    
    const focusableElements = element.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement?.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement?.focus();
    }
  };
  
  document.addEventListener("keydown", handleKeyDown);
  return () => document.removeEventListener("keydown", handleKeyDown);
};

/**
 * ViraDrawer - Выдвижная панель справа с поддержкой Vira Framework
 * 
 * Поддерживает:
 * - design prop для стилей
 * - адаптивность (на мобильных занимает весь экран)
 * - анимации открытия/закрытия
 * - закрытие по ESC и клику вне области
 * - кастомизация размера
 * 
 * @example
 * <ViraDrawer
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Фильтры"
 *   width="400px"
 * >
 *   <ViraForm service="filters" model={FilterModel} />
 * </ViraDrawer>
 */

export interface ViraDrawerProps extends ViraComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  width?: string;
  position?: "left" | "right";
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const ViraDrawer: React.FC<ViraDrawerProps> = ({
  isOpen,
  onClose,
  title,
  description,
  width = "400px",
  position = "right",
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  footer,
  design,
  className,
  children,
  ...props
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Генерируем уникальные ID для ARIA
  const titleIdRef = useRef(generateAriaId("drawer-title"));
  const descriptionIdRef = useRef(generateAriaId("drawer-description"));

  // ARIA атрибуты
  const drawerAria = useAriaAttributes({
    role: "dialog",
    labelledBy: title ? titleIdRef.current : undefined,
    describedBy: description ? descriptionIdRef.current : undefined,
    customAria: {
      "aria-modal": "true",
    },
  });

  // Закрытие по ESC
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Блокировка скролла body при открытом drawer
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.setAttribute("aria-hidden", "true");
    } else {
      document.body.style.overflow = "";
      document.body.removeAttribute("aria-hidden");
    }
    return () => {
      document.body.style.overflow = "";
      document.body.removeAttribute("aria-hidden");
    };
  }, [isOpen]);

  // Focus trap и фокус на drawer при открытии
  useEffect(() => {
    if (!isOpen || !contentRef.current) return;

    const previousActiveElement = document.activeElement as HTMLElement;

    setTimeout(() => {
      contentRef.current?.focus();
    }, 0);

    const cleanup = createFocusTrap(contentRef.current);

    return () => {
      cleanup();
      if (previousActiveElement) {
        previousActiveElement.focus();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const overlayDesign: DesignProps = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    bg: "rgba(0, 0, 0, 0.5)",
    zIndex: 1000,
    animation: "fadeIn 0.2s ease-out",
    ...design,
  };

  const drawerContentDesign: DesignProps = {
    position: "fixed",
    top: 0,
    [position]: 0,
    bottom: 0,
    width: { base: "100%", md: width },
    maxWidth: { base: "100%", md: "90vw" },
    bg: "color.bg.primary",
    shadow: "shadow.xl",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    animation: position === "right" ? "slideInRight 0.3s ease-out" : "slideInLeft 0.3s ease-out",
    outline: "none",
    zIndex: 1001,
  };

  const headerDesign: DesignProps = {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    padding: 6,
    borderBottom: title ? "1px solid" : "none",
    borderColor: "color.bg.tertiary",
    gap: 4,
    flexShrink: 0,
  };

  const bodyDesign: DesignProps = {
    flex: 1,
    padding: 6,
    overflow: "auto",
    minHeight: 0,
  };

  const footerDesign: DesignProps = {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 3,
    padding: 6,
    borderTop: footer ? "1px solid" : "none",
    borderColor: "color.bg.tertiary",
    flexShrink: 0,
  };

  const mergedOverlayDesign = mergeDesign(overlayDesign, design);
  const overlayClass = getDesignClass(mergedOverlayDesign);
  const finalClassName = applyDesignClass(className, overlayClass);

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .${getDesignClass(drawerContentDesign)}:focus {
          outline: none;
        }
      `}</style>
      <div
        ref={drawerRef}
        className={finalClassName}
        data-design={JSON.stringify(mergedOverlayDesign)}
        onClick={closeOnOverlayClick ? (e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        } : undefined}
        {...props}
      >
        <div
          ref={contentRef}
          className={getDesignClass(drawerContentDesign)}
          data-design={JSON.stringify(drawerContentDesign)}
          tabIndex={-1}
          {...drawerAria}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {title && (
            <div className={getDesignClass(headerDesign)} data-design={JSON.stringify(headerDesign)}>
              <Flex design={{ flex: 1, flexDirection: "column", gap: 1 }}>
                <Heading level={2} id={titleIdRef.current} design={{ margin: 0 }}>
                  {title}
                </Heading>
                {description && (
                  <p
                    id={descriptionIdRef.current}
                    className={getDesignClass({
                      fontSize: "typography.fontSize.md",
                      color: "color.text.secondary",
                      margin: 0,
                    })}
                  >
                    {description}
                  </p>
                )}
              </Flex>
              {showCloseButton && (
                <Button
                  onClick={onClose}
                  design={{
                    bg: "transparent",
                    border: "none",
                    padding: "4px",
                    minWidth: "auto",
                    hover: { bg: "color.bg.tertiary" },
                  }}
                  aria-label="Закрыть"
                >
                  <X size={20} />
                </Button>
              )}
            </div>
          )}

          {/* Body */}
          <div className={getDesignClass(bodyDesign)} data-design={JSON.stringify(bodyDesign)}>
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className={getDesignClass(footerDesign)} data-design={JSON.stringify(footerDesign)}>
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

