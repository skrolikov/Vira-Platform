import React, { useRef, useEffect, useState, createElement, isValidElement } from "react";
import { DesignProps } from "../types";
import { mergeDesign, getDesignClass, applyDesignClass } from "../utils/design-utils";
import { Flex } from "./Flex";
import { Button } from "./Button";
import { Text } from "./Text";
import { Badge } from "./Badge";

export interface Tab {
  id: string;
  label: string;
  count?: number;
  countModel?: string;
  disabled?: boolean;
  icon?: React.ReactNode | React.ComponentType<{ size?: number }>;
  isCustom?: boolean;
  color?: string;
}

export interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  tabs: Tab[];
  activeTab: string;
  activeTabModel?: string;
  onChange?: (tabId: string) => void;
  variant?: "default" | "pills" | "underline";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  scrollable?: boolean;
  rightContent?: React.ReactNode;
  design?: DesignProps; // <-- добавили сюда
}


export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab: controlledActiveTab,
  onChange,
  variant = "default",
  size = "md",
  fullWidth = true,
  scrollable = false,
  rightContent,
  design,
  className,
  ...props
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState(controlledActiveTab || tabs[0]?.id || "");
  const activeTab = controlledActiveTab ?? internalActiveTab;
  const [isMobile, setIsMobile] = useState(false);

  const tabsRef = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const effectiveScrollable = scrollable || isMobile;

  // Скролл логика
  useEffect(() => {
    const checkScroll = () => {
      if (!tabsRef.current || !effectiveScrollable) return;
      const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
      setShowLeftScroll(scrollLeft > 0);
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 1);
    };
    checkScroll();
    if (tabsRef.current) tabsRef.current.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    return () => {
      if (tabsRef.current) tabsRef.current.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [tabs, effectiveScrollable]);

  const scroll = (direction: "left" | "right") => {
    if (!tabsRef.current) return;
    const scrollAmount = 200;
    tabsRef.current.scrollTo({ left: tabsRef.current.scrollLeft + (direction === "right" ? scrollAmount : -scrollAmount), behavior: "smooth" });
  };

  const handleTabChange = (tabId: string) => {
    onChange?.(tabId);
    setInternalActiveTab(tabId);
  };

  const containerDesign: DesignProps = mergeDesign({
    position: "relative",
    marginBottom: 3,
    display: "flex",
    alignItems: "center",
    width: fullWidth ? "100%" : "auto",
    overflow: effectiveScrollable ? "hidden" : "visible",
    bg: "color.bg.primary",
    border: variant === "default" ? "1px solid" : "none",
    borderColor: "color.bg.tertiary",
    radius: variant === "default" ? "radius.lg" : "0",
    minHeight: size === "sm" ? "44px" : size === "lg" ? "64px" : "52px",
    padding: { base: 1, md: 2 },
    gap: 2,
  }, design);

  const scrollButtonDesign: DesignProps = {
    width: "32px",
    height: "32px",
    border: "none",
    bg: "color.bg.primary",
    radius: "radius.full",
    cursor: "pointer",
    color: "color.text.secondary",
    fontSize: "16px",
    fontWeight: "typography.fontWeight.bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    shadow: "shadow.sm",
    transition: "all 0.2s",
    hover: {
      bg: "color.primary",
      color: "color.text.inverse",
      shadow: "shadow.md",
      transform: "scale(1.1)",
    },
  };

  const getTabDesign = (tab: Tab, isActive: boolean): DesignProps => {
    const base: DesignProps = {
      padding: { base: 1, md: 2 },
      gap: { base: 1, md: 2 },
      border: "none",
      bg: "transparent",
      radius: variant === "underline" ? "0" : "radius.md",
      cursor: tab.disabled ? "not-allowed" : "pointer",
      fontSize: size === "sm" ? "typography.fontSize.sm" : size === "lg" ? "typography.fontSize.lg" : "typography.fontSize.md",
      fontWeight: isActive ? "typography.fontWeight.semibold" : "typography.fontWeight.medium",
      color: tab.disabled ? "color.text.secondary" : isActive ? "color.primary" : "color.text.secondary",
      hover: tab.disabled ? {} : {
        color: "color.text.primary",
        bg: variant === "underline" ? "transparent" : "color.bg.tertiary",
      },
      flexShrink: 0,
      whiteSpace: "nowrap",
      display: "flex",
      alignItems: "center",
      justifyContent: fullWidth ? "center" : "flex-start",
    };

    if (variant === "pills") {
      return {
        ...base,
        border: "2px solid",
        borderColor: isActive ? "color.primary" : "transparent",
        bg: isActive ? "color.primary" : "color.bg.tertiary",
        color: isActive ? "color.text.inverse" : base.color,
      };
    }

    if (variant === "underline") {
      return {
        ...base,
        borderBottom: isActive ? "3px solid color.primary" : "3px solid transparent",
      };
    }

    return base;
  };

  const getCountDesign = (tab: Tab, isActive: boolean): DesignProps => ({
    bg: isActive ? "color.primary" : "color.bg.tertiary",
    color: isActive ? "color.text.inverse" : "color.text.primary",
    padding: "3px 8px",
    radius: "radius.sm",
    fontSize: "11px",
    fontWeight: "typography.fontWeight.semibold",
    minWidth: "22px",
    textAlign: "center",
    lineHeight: 1.2,
  });

  const containerClass = getDesignClass(containerDesign);
  const finalClassName = applyDesignClass(className, containerClass);

  return (
    <Flex className={finalClassName} design={containerDesign} {...props}>
      {effectiveScrollable && showLeftScroll && <Button design={scrollButtonDesign} onClick={() => scroll("left")}>‹</Button>}

      <Flex design={{ flex: 1, overflowX: "auto", scrollBehavior: "smooth" }} ref={tabsRef}>
        <Flex design={{ flexWrap: "nowrap", gap: 2 }}>
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;

            let iconElement: React.ReactNode = null;
            if (tab.icon) {
              if (isValidElement(tab.icon)) iconElement = tab.icon;
              else if (typeof tab.icon === "function") iconElement = createElement(tab.icon, { size: 16 });
            }

            return (
              <Button
                key={tab.id}
                preset="soft"
                onClick={() => !tab.disabled && handleTabChange(tab.id)}
                disabled={tab.disabled}
                role="tab"
                aria-selected={isActive}
                design={getTabDesign(tab, isActive)}
              >
                {iconElement && <Flex design={{ marginRight: 1 }}>{iconElement}</Flex>}
                <Text>{tab.label}</Text>
                {(tab.count !== undefined || tab.countModel) && <Badge design={getCountDesign(tab, isActive)}>{tab.countModel ?? tab.count}</Badge>}
              </Button>
            );
          })}
        </Flex>
      </Flex>

      {rightContent && <Flex design={{ alignItems: "center", flexShrink: 0 }}>{rightContent}</Flex>}

      {effectiveScrollable && showRightScroll && <Button design={scrollButtonDesign} onClick={() => scroll("right")}>›</Button>}
    </Flex>
  );
};
