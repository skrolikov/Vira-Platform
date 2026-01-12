import { DesignProps } from "../types";

export interface NavItemDesignContext {
  active: boolean;
  collapsed: boolean;
  level?: number;
}

export const navItemDesign = {
  button: (ctx: NavItemDesignContext): DesignProps => ({
    display: "flex",
    alignItems: "center",
    gap: 2,
    width: "100%",
    justifyContent: {
      base: "flex-start",
      md: "center",
    },
    padding: {
      base: 3,
      md: ctx.collapsed ? "10px 20px" : 3,
    },
    paddingLeft: ctx.level && ctx.level > 0 
      ? `${16 + ctx.level * 16}px` 
      : undefined,
    bg: ctx.active ? "color.bg.tertiary" : "transparent",
    color: ctx.active ? "color.primary" : "color.text.primary",
    border: "none",
    borderRadius: "radius.md",
    fontWeight: ctx.active ? "600" : "500",
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    position: "relative",
    hover: {
      bg: "color.bg.tertiary",
    },
  }),

  icon: (): DesignProps => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "20px",
    height: "20px",
    flexShrink: 0,
  }),

  text: (active: boolean): DesignProps => ({
    fontWeight: active ? "600" : "500",
    fontSize: "14px",
    margin: 0,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    flex: 1,
    textAlign: "left",
  }),

  badge: (active: boolean): DesignProps => ({
    marginLeft: "auto",
    bg: active ? "color.bg.tertiary" : "color.primary",
    color: active ? "color.text.primary" : "color.text.inverse",
    fontSize: "11px",
    fontWeight: "600",
    padding: "2px 8px",
    borderRadius: "radius.full",
    minWidth: "20px",
    height: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  }),

  badgeCollapsed: (active: boolean): DesignProps => ({
    position: "absolute",
    top: "-4px",
    right: "-4px",
    bg: active ? "color.bg.tertiary" : "color.primary",
    color: active ? "color.text.primary" : "color.text.inverse",
    borderRadius: "radius.full",
    width: "18px",
    height: "18px",
    fontSize: "10px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }),

  chevron: (expanded: boolean): DesignProps => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "16px",
    height: "16px",
    flexShrink: 0,
    transition: "transform 0.2s ease",
    transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
  }),

  childrenContainer: (): DesignProps => ({
    display: "flex",
    flexDirection: "column",
    gap: 1,
    paddingLeft: {
      base: 2,
      md: 4,
    },
    marginTop: 1,
    borderLeft: "2px solid var(--color-bg-tertiary, #e5e5e7)",
  }),
};

