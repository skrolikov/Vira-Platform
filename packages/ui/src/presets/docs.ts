import { DesignProps } from "../types";

/**
 * Пресеты для документации
 * Упрощают создание страниц документации без повторяющихся design props
 */
export const docsPresets = {
  // Карточки
  card: {
    padding: 5,
    bg: "#ffffff",
    radius: "12px",
    border: "1px solid #e5e7eb",
    shadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
  } as DesignProps,

  cardNoBorder: {
    bg: "transparent",
    radius: "0",
    border: "none",
    padding: 0,
  } as DesignProps,

  // Sidebar
  sidebar: {
    width: "280px",
    bg: "#1f2937",
    borderRight: "1px solid #374151",
    flexDirection: "column",
  } as DesignProps,

  sidebarHeader: {
    padding: "24px 20px",
    bg: "transparent",
    radius: "0",
    border: "none",
    borderBottom: "1px solid #374151",
  } as DesignProps,

  sidebarNav: {
    flex: 1,
    overflowY: "auto",
    padding: "16px 12px",
    flexDirection: "column",
  } as DesignProps,

  sidebarFooter: {
    padding: "16px",
    bg: "transparent",
    radius: "0",
    border: "none",
    borderTop: "1px solid #374151",
  } as DesignProps,

  // Навигация
  navSection: {
    marginBottom: "24px",
    flexDirection: "column",
  } as DesignProps,

  navButton: {
    display: "flex",
    alignItems: "center",
    gap: 2,
    width: "100%",
    padding: "10px 12px",
    marginBottom: "4px",
    bg: "transparent",
    color: "#d1d5db",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s",
    hover: {
      bg: "#374151",
      color: "#ffffff",
    },
  } as DesignProps,

  navButtonActive: {
    display: "flex",
    alignItems: "center",
    gap: 2,
    width: "100%",
    padding: "10px 12px",
    marginBottom: "4px",
    bg: "#3b82f6",
    color: "#ffffff",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    transition: "all 0.2s",
    hover: {
      bg: "#2563eb",
      color: "#ffffff",
    },
  } as DesignProps,

  // Блоки кода
  codeBlock: {
    position: "relative",
    bg: "#1f2937",
    padding: 0,
    radius: "12px",
    
    
    overflow: "hidden",
    border: "1px solid #374151",
  } as DesignProps,

  codeHeader: {
    padding: 3,
    bg: "#111827",
    radius: "0",
    border: "none",
    borderBottom: "1px solid #374151",
  } as DesignProps,

  // IconBox
  iconBox: {
    width: "48px",
    height: "48px",
    radius: "12px",
    bg: "color.primary",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    padding: 0,
    color: "#ffffff",
  } as DesignProps,

  iconBoxSm: {
    width: "40px",
    height: "40px",
    radius: "10px",
    bg: "#dbeafe",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    padding: 0,
  } as DesignProps,

  // Секции
  section: {
    marginBottom: "48px",
    bg: "transparent",
    border: "none",
    padding: 0,
  } as DesignProps,

  sectionHeader: {
    alignItems: "center",
    gap: 3,
    
  } as DesignProps,

  // Примеры
  exampleCard: {
    padding: 0,
    bg: "#ffffff",
    radius: "12px",
    border: "1px solid #e5e7eb",
    overflow: "hidden",
  } as DesignProps,

  exampleHeader: {
    padding: "16px 20px",
    bg: "#f9fafb",
    radius: "0",
    border: "none",
    borderBottom: "1px solid #e5e7eb",
  } as DesignProps,

  examplePreview: {
    padding: "24px",
    bg: "#ffffff",
    minHeight: "100px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    radius: "0",
    border: "none",
  } as DesignProps,

  // Текст
  title: {
    fontSize: "36px",
    fontWeight: "800",
    color: "#111827",
  } as DesignProps,

  subtitle: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#111827",
    lineHeight: "1.2",
  } as DesignProps,

  description: {
    fontSize: "18px",
    color: "#6b7280",
    lineHeight: "1.6",
  } as DesignProps,

  sectionTitle: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "8px",
    paddingLeft: "12px",
  } as DesignProps,

  // Layout
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    bg: "transparent",
    radius: "0",
    border: "none",
    width: "100%",
  } as DesignProps,

  topBar: {
    height: "64px",
    bg: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    alignItems: "center",
    padding: "0 24px",
    gap: "16px",
  } as DesignProps,
} as const;

export type DocsPresetName = keyof typeof docsPresets;

