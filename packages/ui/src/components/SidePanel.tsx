import React, { useEffect, useRef } from "react";
import { DesignProps } from "../types";
import { Card } from "./Card";
import { Flex } from "./Flex";
import { Text } from "./Text";
import { Box } from "./Box";
import { Button } from "./Button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type SidePanelPlacement = "left" | "right";

export interface SidePanelProps {
    isOpen: boolean;
    onClose: () => void;
    placement?: SidePanelPlacement;
    title?: string;
    subtitle?: string;
    children: React.ReactNode;
    showCloseButton?: boolean;
    closeOnEscape?: boolean;
    size?: number | string;
    footer?: React.ReactNode;
    design?: DesignProps;
    headerDesign?: DesignProps;
    bodyDesign?: DesignProps;
    footerDesign?: DesignProps;
    className?: string;
    zIndex?: number;
}

/**
 * SidePanel — боковая панель с offscreen rendering.
 *
 * Анимация только через transform + opacity → только compositing (GPU),
 * без layout reflow. Контент монтируется один раз при первом открытии
 * и остаётся в DOM — повторные открытия мгновенны.
 */
export const SidePanel: React.FC<SidePanelProps> = ({
    isOpen,
    onClose,
    placement = "right",
    title,
    subtitle,
    children,
    showCloseButton = true,
    closeOnEscape = true,
    size,
    footer,
    design,
    headerDesign,
    bodyDesign,
    footerDesign,
    className,
    zIndex = 999,
}) => {
    const hasOpenedRef = useRef(false);

    if (isOpen && !hasOpenedRef.current) {
        hasOpenedRef.current = true;
    }

    useEffect(() => {
        if (!closeOnEscape || !isOpen || !onClose) return;
        const handle = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handle);
        return () => window.removeEventListener("keydown", handle);
    }, [isOpen, closeOnEscape, onClose]);

    if (!hasOpenedRef.current) return null;

    const panelSize = size ? (typeof size === "number" ? `${size}px` : size) : "500px";
    const translateClosed = placement === "right" ? "translateX(100%)" : "translateX(-100%)";

    const positionStyle: DesignProps = {
        position: "fixed",
        top: 0,
        bottom: 0,
        [placement]: 0,
        width: panelSize,
        maxWidth: "90vw",
        zIndex,
        // GPU-only анимация
        transform: isOpen ? "translateX(0)" : translateClosed,
        opacity: isOpen ? 1 : 0,
        transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.15s ease-out",
        willChange: "transform",
        contain: "layout paint",
        pointerEvents: isOpen ? "auto" : "none",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
        boxShadow: placement === "left"
            ? "4px 0 24px rgba(0,0,0,0.12)"
            : "-4px 0 24px rgba(0,0,0,0.12)",
        ...design,
    };

    const headerDesignMerged: DesignProps = {
        padding: 4,
        borderBottomWidth: "1px",
        borderBottomStyle: "solid",
        borderBottomColor: "color.bg.tertiary",
        flexShrink: 0,
        ...headerDesign,
    };

    const bodyDesignMerged: DesignProps = {
        flex: 1,
        minHeight: "0",
        overflowY: "auto",
        overflowX: "hidden",
        ...bodyDesign,
    };

    const footerDesignMerged: DesignProps = {
        padding: 3,
        borderTopWidth: "1px",
        borderTopStyle: "solid",
        borderTopColor: "color.bg.tertiary",
        flexShrink: 0,
        ...footerDesign,
    };

    return (
        <Card
            className={className}
            role="dialog"
            aria-modal={isOpen}
            aria-hidden={!isOpen}
            design={{ padding: 0, ...positionStyle }}
        >
            {/* Шапка */}
            {(title || subtitle || showCloseButton) && (
                <Flex
                    justify="space-between"
                    align="center"
                    design={headerDesignMerged}
                >
                    <Flex design={{ flexDirection: "column", gap: 1, flex: 1 }}>
                        {title && (
                            <Text design={{ fontSize: "24px", fontWeight: "700", color: "color.text.primary", lineHeight: "1.3" }}>
                                {title}
                            </Text>
                        )}
                        {subtitle && (
                            <Text design={{ fontSize: "14px", color: "color.text.secondary", lineHeight: "1.5" }}>
                                {subtitle}
                            </Text>
                        )}
                    </Flex>
                    {showCloseButton && (
                        <Button
                            preset="ghost"
                            onClick={onClose}
                            aria-label="Закрыть панель"
                            design={{
                                padding: 2,
                                minWidth: "auto",
                                width: "36px",
                                height: "36px",
                                borderRadius: "8px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                hover: { bg: "color.bg.tertiary", transform: "scale(1.05)" },
                                active: { transform: "scale(0.95)" },
                                transition: "all 0.2s ease",
                            }}
                        >
                            {placement === "left" ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                        </Button>
                    )}
                </Flex>
            )}

            {/* Тело */}
            <Box design={bodyDesignMerged}>
                {children}
            </Box>

            {/* Футер */}
            {footer && (
                <Flex align="center" justify="flex-end" gap={3} design={footerDesignMerged}>
                    {footer}
                </Flex>
            )}
        </Card>
    );
};
