import React from "react";
import { Button } from "./Button";
import { Flex } from "./Flex";
import { Text } from "./Text";
import { Badge } from "./Badge";
import { ChevronRight } from "lucide-react";
import { NavItem, NavItemRenderCtx } from "./Navbar";
import { navItemDesign } from "./navbar.design";

export interface NavButtonProps {
  item: NavItem;
  active: boolean;
  expanded: boolean;
  collapsed: boolean;
  level: number;
  onClick: (e?: React.MouseEvent) => void;
  formatBadge: (badge: string | number, max: number) => string;
}

export const NavButton: React.FC<NavButtonProps> = ({
  item,
  active,
  expanded,
  collapsed,
  level,
  onClick,
  formatBadge,
}) => {
  const hasChildren = item.children && item.children.length > 0 && !collapsed;
  const hasBadge = item.badge !== undefined && 
    (typeof item.badge === "string" || (typeof item.badge === "number" && item.badge > 0));
  const badgeValue = hasBadge ? item.badge! : null;

  const renderCtx: NavItemRenderCtx = {
    item,
    active,
    expanded,
    collapsed,
    level,
  };

  return (
    <Button
      preset={active ? "primary" : undefined}
      design={navItemDesign.button({ active, collapsed, level })}
      onClick={onClick}
      disabled={item.disabled}
      role="menuitem"
      aria-current={active ? "page" : undefined}
      aria-expanded={hasChildren ? expanded : undefined}
      aria-label={collapsed ? item.label : undefined}
    >
      {item.icon && (
        <Flex design={navItemDesign.icon()}>
          {item.icon}
        </Flex>
      )}
      
      {!collapsed && (
        <>
          <Text design={navItemDesign.text(active)}>
            {item.label}
          </Text>
          
          {hasChildren && (
            <Flex design={navItemDesign.chevron(expanded)}>
              <ChevronRight size={20} />
            </Flex>
          )}
          
          {!hasChildren && badgeValue && (
            <Badge design={navItemDesign.badge(active)}>
              {typeof badgeValue === "number" ? formatBadge(badgeValue, 99) : badgeValue}
            </Badge>
          )}

          {item.renderRight && (
            <Flex design={{ marginLeft: "auto", flexShrink: 0 }}>
              {item.renderRight(renderCtx)}
            </Flex>
          )}
        </>
      )}
      
      {collapsed && badgeValue && (
        <Flex design={navItemDesign.badgeCollapsed(active)}>
          {typeof badgeValue === "number" ? formatBadge(badgeValue, 9) : badgeValue}
        </Flex>
      )}
    </Button>
  );
};

