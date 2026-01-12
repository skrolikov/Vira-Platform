import React from "react";
import { DesignProps } from "../types";
import { mergeDesign, getDesignClass, applyDesignClass, getDataDesignAttribute } from "../utils/design-utils";
import { Flex } from "./Flex";
import { Heading } from "./Heading";
import { useNavbarState } from "../utils/useNavbarState";
import { NavButton } from "./NavButton";
import { navItemDesign } from "./navbar.design";
import { Dropdown } from "./Dropdown";
import type { DropdownItem } from "./Dropdown";
import { Box } from "./Box";
import { Tooltip } from "./Tooltip";
// Note: ViraComponentProps removed - component works independently

export interface NavItemRenderCtx {
  item: NavItem;
  active: boolean;
  expanded: boolean;
  collapsed: boolean;
  level: number;
}

export interface NavItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  active?: boolean;
  onClick?: () => void;
  action?: string; // Note: Requires Vira Framework (moved to bindings package)
  children?: NavItem[]; // Дочерние элементы навигации

  // Поведение
  href?: string;
  disabled?: boolean;
  external?: boolean;

  // Кастомный рендер
  renderRight?: (ctx: NavItemRenderCtx) => React.ReactNode;
}

export interface NavbarProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  design?: DesignProps;
  items: NavItem[];
  activeItem?: string;
  onItemClick?: (id: string) => void;
  collapsed?: boolean;
  logo?: React.ReactNode;
  title?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  items,
  activeItem,
  onItemClick,
  collapsed = false,
  logo,
  title,
  design,
  className,
  ...props
}) => {
  const { expanded, toggle, isExpanded } = useNavbarState({
    items,
    activeItem,
    collapsed,
  });

  const containerDesign: DesignProps = {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    padding: 0,
    width: {
      base: "100%",
      md: collapsed ? "72px" : "280px",
    },
    height: {
      base: "auto",
      md: "100%", // Занимает всю высоту родителя
    },
    minHeight: {
      base: "auto",
      md: "100%",
    },
    maxHeight: {
      base: "none",
      md: "100%",
    },
    position: {
      base: "relative",
      md: "relative", // Убрали sticky, так как теперь в flex контейнере
    },
    transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    overflowY: "auto",
    flexShrink: 0, // Не сжимается
    ...design,
  };

  const mergedDesign = mergeDesign(containerDesign, design);
  const containerClass = getDesignClass(mergedDesign);
  const finalClassName = applyDesignClass(className, containerClass);

  const isItemActive = (item: NavItem): boolean => {
    if (activeItem === item.id || item.active) return true;
    if (item.children) {
      return item.children.some(child => isItemActive(child));
    }
    return false;
  };

  const handleItemClick = (item: NavItem, e?: React.MouseEvent) => {
    if (item.disabled) {
      e?.preventDefault();
      return;
    }

    // Если есть дочерние элементы, переключаем раскрытие
    if (item.children && item.children.length > 0 && !collapsed) {
      e?.stopPropagation();
      toggle(item.id);
      return;
    }

    // Если есть href, используем навигацию
    if (item.href) {
      if (item.external) {
        window.open(item.href, "_blank", "noopener,noreferrer");
      } else {
        // Для внутренней навигации можно использовать роутер
        // Здесь просто обновляем URL без перезагрузки
        window.history.pushState({}, "", item.href);
      }
    }

    if (item.onClick) {
      item.onClick();
    }
    if (onItemClick) {
      onItemClick(item.id);
    }
    // Note: item.action requires Vira Framework (moved to bindings package)
    if (item.action) {
      console.warn("item.action requires Vira Framework");
    }
  };

  // Функция для форматирования бейджа
  const formatBadge = (badge: string | number, max: number): string => {
    if (typeof badge === "number" && badge > max) {
      return `${max}+`;
    }
    return String(badge);
  };

  // Рендер элемента навигации (рекурсивно)
  const renderNavItem = (item: NavItem, level: number = 0): React.ReactNode => {
    const isActive = Boolean(isItemActive(item));
    const itemExpanded = isExpanded(item.id);
    const hasChildren = item.children && item.children.length > 0 && !collapsed;
    const hasChildrenCollapsed = item.children && item.children.length > 0 && collapsed;

    // В свернутом режиме показываем dropdown при КЛИКЕ на элемент с дочерними
    if (hasChildrenCollapsed) {
      const dropdownItems: DropdownItem[] = [];

      // Добавляем сам родительский элемент
      dropdownItems.push({
        id: item.id,
        label: item.label,
        icon: item.icon,
        onClick: () => handleItemClick(item),
        design: {
          fontWeight: "600",
          borderBottom: "1px solid",
          borderColor: "color.bg.tertiary",
          paddingBottom: "8px",
          marginBottom: "4px",
        },
      });

      // Добавляем дочерние элементы
      item.children!.forEach(child => {
        dropdownItems.push({
          id: child.id,
          label: child.label,
          icon: child.icon,
          onClick: () => handleItemClick(child),
        });
      });

      return (
        <Box key={item.id}>
          <Dropdown
            trigger={
              <div style={{ cursor: "pointer" }}>
                <NavButton
                  item={item}
                  active={isActive}
                  expanded={false}
                  collapsed={collapsed}
                  level={level}
                  onClick={(e) => {
                    // Ничего не делаем, Dropdown сам обработает клик
                  }}
                  formatBadge={formatBadge}
                />
              </div>
            }
            items={dropdownItems}
            placement="bottom-end"
          />
        </Box>
      );
    }

    return (
      <Flex key={item.id} design={{ flexDirection: "column", gap: 0 }}>
        {collapsed ? (
          <Tooltip content={item.label} placement="right">
            <Box>
              <NavButton
                item={item}
                active={isActive}
                expanded={itemExpanded}
                collapsed={collapsed}
                level={level}
                onClick={(e) => handleItemClick(item, e)}
                formatBadge={formatBadge}
              />
            </Box>
          </Tooltip>
        ) : (
          <NavButton
            item={item}
            active={isActive}
            expanded={itemExpanded}
            collapsed={collapsed}
            level={level}
            onClick={(e) => handleItemClick(item, e)}
            formatBadge={formatBadge}
          />
        )}

        {hasChildren && itemExpanded && (
          <Flex design={navItemDesign.childrenContainer()}>
            {item.children!.map(child => renderNavItem(child, level + 1))}
          </Flex>
        )}
      </Flex>
    );
  };

  return (
    <nav
      className={finalClassName}
      aria-label="Main navigation"
      {...(mergedDesign && { "data-design": getDataDesignAttribute(mergedDesign) })}
      {...props}
    >
      <Box>
        {/* Лого и название в Navbar - скрыто на мобильных */}
        {(logo || title) && !collapsed && (
          <Flex
            gap={2}
            align="center"
            direction="row"
            design={{
              padding: 3,
              borderBottom: "1px solid",
              borderColor: "color.bg.tertiary",
              shadow: "shadow.sm",
              height: "90px",
              display: { base: "none", md: "flex" }, // Скрываем на мобильных
            }}
          >
            {logo && (
              <Flex gap={2}>
                {logo}
              </Flex>
            )}
            {title && (
              <Heading level={3} design={{ margin: 0, fontSize: "typography.fontSize.lg", fontWeight: "typography.fontWeight.bold" }}>
                {title}
              </Heading>
            )}
          </Flex>
        )}
      </Box>
      <Box design={{ padding: 4 }}>
        {items.map(item => renderNavItem(item))}
      </Box>
    </nav>
  );
};
