import React, { useEffect } from "react";
import { DesignProps } from "../types";
import { mergeDesign, getDesignClass } from "../utils/design-utils";
import { Card } from "./Card";
import { Text } from "./Text";
import { Button } from "./Button";
import { Flex } from "./Flex";
import { X, CheckCircle, AlertCircle, Info, XCircle } from "lucide-react";
import { resolveToken } from "../utils/token-resolver";
import { getCachedToken } from "../utils/token-cache";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
  design?: DesignProps;
}

/**
 * Toast - Компонент уведомления
 */
export const Toast: React.FC<ToastProps> = ({ toast, onClose, design }) => {
  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        onClose(toast.id);
      }, toast.duration);

      return () => clearTimeout(timer);
    }
  }, [toast.duration, toast.id, onClose]);

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  };

  const colors = {
    success: { border: "color.success", icon: "color.success" },
    error: { border: "color.danger", icon: "color.danger" },
    warning: { border: "color.warning", icon: "color.warning" },
    info: { border: "color.primary", icon: "color.primary" },
  };

  const type = toast.type || "info";
  const Icon = icons[type];
  const colorScheme = colors[type];

  // Разрешаем токен цвета в реальное значение для иконки
  const iconColor = getCachedToken(colorScheme.icon, resolveToken) || colorScheme.icon;


  return (
    <Card
      design={{
        effect: "glassLight",
        minWidth: "300px",
        maxWidth: "500px",
        borderColor: { value: `${colorScheme.border}`, important: true },
        border: '2px solid',
        shadow: "shadow.lg",
        
        animation: "slideInRight 0.3s ease-out",
      }}
    >
      <Flex design={{ alignItems: "flex-start", gap: 3 }}>
        <Icon size={20} color={iconColor} style={{ flexShrink: 0, marginTop: "2px" }} />
        <Flex design={{ flexDirection: "column", gap: 2, flex: 1 }}>
          <Text
            design={{
              fontSize: "14px",
              color: "color.text.primary",
              lineHeight: "1.5",
            }}
          >
            {toast.message}
          </Text>
          {toast.action && (
            <Button
              preset="ghost"
              design={{
                padding: 1,
                fontSize: "12px",
                alignSelf: "flex-start",
              }}
              onClick={toast.action.onClick}
            >
              {toast.action.label}
            </Button>
          )}
        </Flex>
        <Button
          preset="ghost"
          design={{
            padding: 1,
            minWidth: "auto",
            hover: { bg: "rgba(0,0,0,0.05)" },
          }}
          onClick={() => onClose(toast.id)}
        >
          <X size={20} />
        </Button>
      </Flex>
    </Card>
  );
};

// Toast Container
export interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
  placement?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center";
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onClose,
  placement = "top-right",
}) => {
  useEffect(() => {
    const styleId = "vira-toast-animation";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const positionMap = {
    "top-right": { top: "20px", right: "20px" },
    "top-left": { top: "20px", left: "20px" },
    "bottom-right": { bottom: "20px", right: "20px" },
    "bottom-left": { bottom: "20px", left: "20px" },
    "top-center": { top: "20px", left: "50%", transform: "translateX(-50%)" },
    "bottom-center": { bottom: "20px", left: "50%", transform: "translateX(-50%)" },
  };

  const position = positionMap[placement];

  return (
    <div
      style={{
        position: "fixed",
        ...position,
        zIndex: 10000,
        display: "flex",
        flexDirection: placement.includes("bottom") ? "column-reverse" : "column",
        gap: "8px",
        pointerEvents: "none",
      }}
    >
      {toasts.map((toast) => (
        <div key={toast.id} style={{ pointerEvents: "auto" }}>
          <Toast toast={toast} onClose={onClose} />
        </div>
      ))}
    </div>
  );
};

// Toast Hook
let toastIdCounter = 0;
let toasts: Toast[] = [];
let listeners: Set<(toasts: Toast[]) => void> = new Set();

const notify = () => {
  listeners.forEach((listener) => listener([...toasts]));
};

export const toast = {
  show: (message: string, options?: Omit<Toast, "id" | "message">) => {
    const id = `toast-${++toastIdCounter}`;
    const newToast: Toast = {
      id,
      message,
      type: "info",
      duration: 5000,
      ...options,
    };
    toasts.push(newToast);
    notify();
    return id;
  },
  success: (message: string, options?: Omit<Toast, "id" | "message" | "type">) => {
    return toast.show(message, { ...options, type: "success" });
  },
  error: (message: string, options?: Omit<Toast, "id" | "message" | "type">) => {
    return toast.show(message, { ...options, type: "error" });
  },
  warning: (message: string, options?: Omit<Toast, "id" | "message" | "type">) => {
    return toast.show(message, { ...options, type: "warning" });
  },
  info: (message: string, options?: Omit<Toast, "id" | "message" | "type">) => {
    return toast.show(message, { ...options, type: "info" });
  },
  dismiss: (id: string) => {
    toasts = toasts.filter((t) => t.id !== id);
    notify();
  },
  dismissAll: () => {
    toasts = [];
    notify();
  },
};

export const useToast = () => {
  const [currentToasts, setCurrentToasts] = React.useState<Toast[]>([]);

  useEffect(() => {
    const listener = (newToasts: Toast[]) => {
      setCurrentToasts(newToasts);
    };
    listeners.add(listener);
    listener(toasts);

    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    toasts: currentToasts,
    show: toast.show,
    success: toast.success,
    error: toast.error,
    warning: toast.warning,
    info: toast.info,
    dismiss: toast.dismiss,
    dismissAll: toast.dismissAll,
  };
};

