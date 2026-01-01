import React from "react";
import { Modal } from "@vira-ui/ui";
import type { ModalProps, ModalSize } from "@vira-ui/ui";
import type { ViraComponentProps } from "@vira-ui/core";

/**
 * ViraModal - Modal с поддержкой Vira Framework
 * Обёртка над базовым Modal компонентом из @vira-ui/ui
 */

export type ViraModalSize = ModalSize;

export interface ViraModalProps extends Omit<ModalProps, "design" | "children">, Omit<ViraComponentProps, "design" | "children"> {
  design?: ModalProps["design"];
  children: React.ReactNode; // Required from ModalProps
}

export const ViraModal: React.FC<ViraModalProps> = ({
  design,
  ...props
}) => {
  return <Modal {...props} design={design} />;
};

// Re-export для удобства
export { Modal } from "@vira-ui/ui";
export type { ModalProps, ModalSize } from "@vira-ui/ui";

