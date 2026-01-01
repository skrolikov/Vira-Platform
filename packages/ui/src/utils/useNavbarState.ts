import { useState, useEffect } from "react";
import { NavItem } from "../components/Navbar";

export interface UseNavbarStateOptions {
  items: NavItem[];
  activeItem?: string;
  collapsed?: boolean;
}

export function useNavbarState({
  items,
  activeItem,
  collapsed = false,
}: UseNavbarStateOptions) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!activeItem || collapsed) return;

    const findParent = (
      items: NavItem[],
      target: string,
      parent?: string
    ): string | null => {
      for (const item of items) {
        if (item.id === target && parent) return parent;
        if (item.children) {
          const found = findParent(item.children, target, item.id);
          if (found) return found;
        }
      }
      return null;
    };

    const parent = findParent(items, activeItem);
    if (parent) {
      setExpanded(prev => new Set(prev).add(parent));
    }
  }, [activeItem, collapsed, items]);

  const toggle = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const isExpanded = (id: string) => expanded.has(id);

  return { expanded, toggle, isExpanded };
}

