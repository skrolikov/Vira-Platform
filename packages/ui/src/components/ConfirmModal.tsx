import React from "react";
import { Modal, ModalProps } from "./Modal";
import { Button } from "./Button";
import { Flex } from "./Flex";
import { Text } from "./Text";
import { AlertTriangle, Info, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { DesignProps } from "../types";

export type ConfirmModalVariant = "danger" | "warning" | "info" | "success";

export interface ConfirmModalProps extends Omit<ModalProps, "children" | "footer"> {
  variant?: ConfirmModalVariant;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode; // Дополнительный контент после сообщения
}

const variantConfig: Record<
  ConfirmModalVariant,
  {
    icon: React.ReactNode;
    confirmPreset: "primary" | "danger" | "success" | "warning" | "secondary";
    iconColor: string;
  }
> = {
  danger: {
    icon: <Trash2 size={24} />,
    confirmPreset: "danger",
    iconColor: "color.danger",
  },
  warning: {
    icon: <AlertTriangle size={24} />,
    confirmPreset: "warning",
    iconColor: "color.warning",
  },
  info: {
    icon: <Info size={24} />,
    confirmPreset: "primary",
    iconColor: "color.primary",
  },
  success: {
    icon: <CheckCircle size={24} />,
    confirmPreset: "success",
    iconColor: "color.success",
  },
};

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  variant = "info",
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  isLoading = false,
  icon,
  title,
  onClose,
  size = "sm",
  children,
  ...modalProps
}) => {
  const config = variantConfig[variant];
  const displayIcon = icon || config.icon;
  const displayTitle = title || (variant === "danger" ? "Подтвердите действие" : variant === "warning" ? "Внимание" : variant === "success" ? "Подтверждение" : "Информация");
  const displayConfirmText = confirmText || (variant === "danger" ? "Удалить" : variant === "warning" ? "Продолжить" : variant === "success" ? "Подтвердить" : "ОК");
  const displayCancelText = cancelText || "Отмена";

  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  };

  const iconContainerDesign: DesignProps = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "48px",
    height: "48px",
    borderRadius: "radius.full",
    bg: "color.bg.secondary",
    
  };

  const messageDesign: DesignProps = {
    color: "color.text.primary",
    fontSize: "typography.fontSize.md",
    lineHeight: "1.5",
    margin: 0,
  };

  return (
    <Modal
      {...modalProps}
      isOpen={modalProps.isOpen}
      onClose={onClose}
      title={displayTitle}
      size={size}
      closeOnOverlayClick={!isLoading}
      closeOnEscape={!isLoading}
      footer={
        <Flex align="center" justify="flex-end" gap={2}>
          <Button
            onClick={handleCancel}
            preset="ghost"
            disabled={isLoading}
          >
            {displayCancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            preset={config.confirmPreset}
            loading={isLoading}
          >
            {displayConfirmText}
          </Button>
        </Flex>
      }
    >
      <Flex direction="column" align="center" gap={3}>
        {/* Icon */}
        <Flex
          design={{
            ...iconContainerDesign,
            color: config.iconColor,
          }}
        >
          {displayIcon}
        </Flex>

        {/* Message */}
        {message && (
          <Text design={messageDesign} style={{ textAlign: "center" }}>
            {message}
          </Text>
        )}

        {/* Children (дополнительный контент) */}
        {children}
      </Flex>
    </Modal>
  );
};

ConfirmModal.displayName = "ConfirmModal";

