import React, { useState, useEffect, useRef } from "react";
import { DesignProps } from "../types";
import { mergeDesign, getDesignClass, applyDesignClass } from "../utils/design-utils";
import { Modal } from "./Modal";
import { Input } from "./Input";
import { Card } from "./Card";
import { Text } from "./Text";
import { Flex } from "./Flex";
import { Search, Command, ArrowRight } from "lucide-react";

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  keywords?: string[];
  group?: string;
  action: () => void;
}

export interface CommandPaletteProps {
  items: CommandItem[];
  isOpen: boolean;
  onClose: () => void;
  trigger?: string; // Горячая клавиша (например, "ctrl+k")
  placeholder?: string;
  design?: DesignProps;
}

/**
 * Command Palette - Компонент командной палитры (как в VS Code)
 * 
 * Поддерживает:
 * - Поиск по командам
 * - Группировка команд
 * - Горячие клавиши
 * - Клавиатурная навигация
 */
export const CommandPalette: React.FC<CommandPaletteProps> = ({
  items,
  isOpen,
  onClose,
  trigger = "ctrl+k",
  placeholder = "Поиск команд...",
  design,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Фильтрация команд
  const filteredItems = items.filter((item) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.label.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.keywords?.some((k) => k.toLowerCase().includes(query))
    );
  });

  // Группировка
  const groupedItems = filteredItems.reduce((acc, item) => {
    const group = item.group || "Другие";
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  // Горячая клавиша
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlK = trigger.includes("ctrl") && e.ctrlKey && e.key === trigger.split("+")[1];
      if (isCtrlK) {
        e.preventDefault();
        // onToggle будет вызван извне
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [trigger]);

  // Сброс при открытии
  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Клавиатурная навигация
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
        onClose();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  // Выполнение команды
  const executeCommand = (item: CommandItem) => {
    item.action();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      closeOnOverlayClick
      closeOnEscape
      showCloseButton={false}
    >
      <Flex design={{ flexDirection: "column", gap: 3 }}>
        {/* Поиск */}
        <Flex
          design={{
            position: "relative",
            alignItems: "center",
          }}
        >
          <Search
            size={20}
            style={{
              position: "absolute",
              left: "12px",
              color: "#9ca3af",
              pointerEvents: "none",
            }}
          />
          <Input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            design={{
              paddingLeft: "40px",
              padding: 3,
              width: "100%",
              fontSize: "16px",
            }}
          />
        </Flex>

        {/* Список команд */}
        <Card
          design={{
            maxHeight: "400px",
            overflowY: "auto",
            padding: 0,
            bg: "#ffffff",
            border: "1px solid #e5e7eb",
            radius: "8px",
          }}
        >
          {Object.keys(groupedItems).length === 0 ? (
            <Flex
              design={{
                padding: 5,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <Text design={{ fontSize: "16px", color: "#6b7280" }}>
                Команды не найдены
              </Text>
              <Text design={{ fontSize: "14px", color: "#9ca3af" }}>
                Попробуйте другой запрос
              </Text>
            </Flex>
          ) : (
            Object.entries(groupedItems).map(([groupName, groupItems]) => (
              <Flex key={groupName} design={{ flexDirection: "column" }}>
                {groupName !== "Другие" && (
                  <Text
                    design={{
                      padding: "8px 12px",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#6b7280",
                      textTransform: "uppercase",
                      bg: "#f9fafb",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    {groupName}
                  </Text>
                )}
                {groupItems.map((item, index) => {
                  const globalIndex = filteredItems.indexOf(item);
                  const isSelected = globalIndex === selectedIndex;

                  return (
                    <Card
                      key={item.id}
                      onClick={() => executeCommand(item)}
                      design={{
                        padding: "12px",
                        cursor: "pointer",
                        bg: isSelected ? "#f3f4f6" : "#ffffff",
                        border: "none",
                        radius: "0",
                        hover: {
                          bg: "#f9fafb",
                        },
                      }}
                    >
                      <Flex design={{ alignItems: "center", gap: 3 }}>
                        {item.icon && (
                          <Flex
                            design={{
                              width: "32px",
                              height: "32px",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#6b7280",
                            }}
                          >
                            {item.icon}
                          </Flex>
                        )}
                        <Flex design={{ flexDirection: "column", gap: 1, flex: 1 }}>
                          <Text
                            design={{
                              fontSize: "14px",
                              fontWeight: "500",
                              color: "#111827",
                            }}
                          >
                            {item.label}
                          </Text>
                          {item.description && (
                            <Text
                              design={{
                                fontSize: "12px",
                                color: "#6b7280",
                              }}
                            >
                              {item.description}
                            </Text>
                          )}
                        </Flex>
                        {isSelected && (
                          <ArrowRight size={16} color="#9ca3af" />
                        )}
                      </Flex>
                    </Card>
                  );
                })}
              </Flex>
            ))
          )}
        </Card>

        {/* Подсказка */}
        <Flex
          design={{
            padding: 2,
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "12px",
            color: "#9ca3af",
          }}
        >
          <Flex design={{ gap: 4 }}>
            <Text design={{ fontSize: "12px", color: "#9ca3af" }}>
              ↑↓ навигация
            </Text>
            <Text design={{ fontSize: "12px", color: "#9ca3af" }}>
              Enter выбрать
            </Text>
            <Text design={{ fontSize: "12px", color: "#9ca3af" }}>
              Esc закрыть
            </Text>
          </Flex>
        </Flex>
      </Flex>
    </Modal>
  );
};

