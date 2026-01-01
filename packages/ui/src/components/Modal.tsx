import React, { useEffect, useRef } from "react";
import type { DesignProps } from "../types";
import { mergeDesign, getDataDesignAttribute } from "../utils/design-utils";
import { Backdrop } from "./Backdrop";
import { Box } from "./Box";
import { Flex } from "./Flex";
import { Heading } from "./Heading";
import { Button } from "./Button";
import { Text } from "./Text";
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
 * Modal - Модальное окно
 * 
 * Поддерживает:
 * - Использует пресеты для стилизации
 * - Адаптивность (мобильные/десктоп)
 * - Плавные анимации открытия/закрытия
 * - Закрытие по ESC и клику вне области
 * - Focus trap и accessibility (ARIA)
 * - Блокировка скролла фона
 * 
 * @example
 * <Modal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Заголовок"
 *   size="md"
 * >
 *   Содержимое
 * </Modal>
 */

export type ModalSize = "xs" | "sm" | "md" | "lg" | "xl" | "full";

export interface ModalProps {
  design?: DesignProps;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: ModalSize;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const sizeMap: Record<ModalSize, { width: string; maxWidth?: string }> = {
  xs: { width: "90%", maxWidth: "400px" },
  sm: { width: "90%", maxWidth: "500px" },
  md: { width: "90%", maxWidth: "600px" },
  lg: { width: "90%", maxWidth: "800px" },
  xl: { width: "90%", maxWidth: "1000px" },
  full: { width: "100%", maxWidth: "100%" },
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  size = "md",
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  footer,
  className,
  children,
  design,
  ...props
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  // Генерируем уникальные ID для ARIA
  const titleIdRef = useRef(generateAriaId("modal-title"));
  const descriptionIdRef = useRef(generateAriaId("modal-description"));

  // ARIA атрибуты
  const modalAria = useAriaAttributes({
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

  // Focus trap и фокус на модалке при открытии
  useEffect(() => {
    if (!isOpen || !contentRef.current) return;

    // Сохраняем текущий активный элемент
    const previousActiveElement = document.activeElement as HTMLElement;

    // Устанавливаем фокус
    setTimeout(() => {
      contentRef.current?.focus();
    }, 100);

    // Создаем focus trap
    const cleanup = createFocusTrap(contentRef.current);

    return () => {
      cleanup();
      // Восстанавливаем фокус
      if (previousActiveElement) {
        previousActiveElement.focus();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeStyles = sizeMap[size];

  // Design для основного контейнера модалки
  const modalContentDesign: DesignProps = mergeDesign(
    {
      position: "relative",
      width: sizeStyles.width,
      maxWidth: sizeStyles.maxWidth,
      height: "auto",
      maxHeight: "90vh",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      outline: "none",
      zIndex: 1001,
    },
    design
  );

  // Design для header
  const headerDesign: DesignProps = {
    padding: 3,
    borderBottom: "1px solid var(--color-primary)",
    flexShrink: 0,
  };

  // Design для title container
  const titleContainerDesign: DesignProps = {
    flex: 1,
  };

  // Design для heading
  const headingDesign: DesignProps = {
    margin: 0,
  };

  // Design для description text
  const descriptionDesign: DesignProps = {
    margin: 0,
    color: "color.text.secondary",
  };

  // Design для close button
  const closeButtonDesign: DesignProps = {
    flexShrink: 0,
  };

  // Design для body
  const bodyDesign: DesignProps = {
    flex: "1 1 0%",
    padding: 3,
    overflowY: "auto",
    overflowX: "hidden",
    minHeight: 0,
  };

  // Design для footer
  const footerDesign: DesignProps = {
    padding: 3,
    borderTop: "1px solid var(--color-primary)",
    flexShrink: 0,
  };

  return (
    <>
      <style>{`
        @keyframes vira-modal-fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes vira-modal-slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .vira-modal-content {
          animation: vira-modal-slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .vira-modal-content:focus {
          outline: none;
        }
      `}</style>
      <Backdrop
        isOpen={isOpen}
        onClick={closeOnOverlayClick ? onClose : undefined}
        zIndex={1000}
      >
        <Box
          ref={contentRef}
          tabIndex={-1}
          className={`vira-modal-content ${className || ""}`}
          preset="modal"
          design={modalContentDesign}
          onClick={(e) => e.stopPropagation()}
          {...modalAria}
          {...props}
        >
          {/* Header */}
          {title && (
            <Flex
              justify="space-between"
              align="center"
              gap={4}
              design={headerDesign}
            >
              <Flex direction="column" gap={1} design={titleContainerDesign}>
                <Heading level={2} id={titleIdRef.current} design={headingDesign}>
                  {title}
                </Heading>
                {description && (
                  <Text
                    id={descriptionIdRef.current}
                    design={descriptionDesign}
                  >
                    {description}
                  </Text>
                )}
              </Flex>
              {showCloseButton && (
                <Button
                  onClick={onClose}
                  preset="ghost"
                  design={closeButtonDesign}
                  aria-label="Закрыть"
                >
                  <X size={20} />
                </Button>
              )}
            </Flex>
          )}

          {/* Body */}
          <Box design={bodyDesign}>
            {children}
          </Box>

          {/* Footer */}
          {footer && (
            <Flex
              align="center"
              justify="flex-end"
              gap={3}
              design={footerDesign}
            >
              {footer}
            </Flex>
          )}
        </Box>
      </Backdrop>
    </>
  );
};

