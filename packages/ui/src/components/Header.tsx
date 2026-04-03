import React, { useState, useEffect } from "react";
import { DesignProps } from "../types";
import { mergeDesign, getDesignClass, applyDesignClass } from "../utils/design-utils";
import { Button } from "./Button";
import { Flex } from "./Flex";
import { Box } from "./Box";
import { Text } from "./Text";
import { Input } from "./Input";
import { SearchInput } from "./SearchInput";
import { Select } from "./Select";
import { Dropdown } from "./Dropdown";
import { Popover } from "./Popover";
import { Card } from "./Card";
import { Avatar } from "./Avatar";
import { Badge } from "./Badge";
import { Search, Bell, Settings, User, ChevronRight, Menu, LogOut, X, ShoppingCart, UserSquare2, Users, Package, Contact } from "lucide-react";
import { useIsMobile } from "../utils/useMediaQuery";
import { EmptyState } from "./EmptyState";
import { EffectCard } from "./EffectCard";
import type { DropdownItem } from "./Dropdown";

export type SearchEntityType = "all" | "orders" | "leads" | "customers" | "products" | "employees";

export interface SearchOption {
  id: SearchEntityType;
  label: string;
  icon?: React.ReactNode;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type?: string;
  is_read?: boolean;
  created_at: string;
  entity_type?: string;
  entity_id?: string;
  onClick?: () => void;
}

export interface HeaderProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  logo?: React.ReactNode;
  title?: string;
  user?: {
    name?: string;
    avatar?: string;
    email?: string;
  };
  onMenuToggle?: () => void;
  navbarCollapsed?: boolean;
  onSearch?: (value: string, entityType?: SearchEntityType) => void;
  onSearchResults?: (value: string, entityType: SearchEntityType) => Promise<Array<{
    id: string;
    title: string;
    subtitle?: string;
    type: SearchEntityType;
    onClick?: () => void;
  }>>;
  searchValue?: string;
  searchEntityType?: SearchEntityType;
  /**
   * Опции для поиска (типы сущностей и их метки).
   * Должны определяться приложением, а не библиотекой.
   * Поиск будет отображен только если этот массив передан и не пуст.
   */
  searchOptions?: SearchOption[];
  searchModel?: string;
  onNotificationClick?: () => void;
  onNotificationItemClick?: (notification: NotificationItem) => void;
  onNotificationMarkAsRead?: (notificationId: string) => void;
  onNotificationMarkAllAsRead?: () => void;
  onNotificationDelete?: (notificationId: string) => void;
  notifications?: number;
  notificationItems?: NotificationItem[];
  onSettingsClick?: () => void;
  onProfileClick?: () => void;
  onLogoutClick?: () => void;
  /**
   * Опции для меню пользователя (выпадающий список профиля).
   * Должны определяться приложением, а не библиотекой.
   * Если не переданы, меню пользователя не будет отображено.
   */
  userMenuItems?: DropdownItem[];
  design?: DesignProps;
  actions?: React.ReactNode;
}

// Подкомпонент: Кнопка уведомлений с Popover
const NotificationButton: React.FC<{
  count: number;
  items?: NotificationItem[];
  onItemClick?: (notification: NotificationItem) => void;
  onMarkAsRead?: (notificationId: string) => void;
  onMarkAllAsRead?: () => void;
  onDelete?: (notificationId: string) => void;
  onViewAll?: () => void;
}> = ({
  count,
  items = [],
  onItemClick,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onViewAll,
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const unreadCount = items.filter(n => !n.is_read).length;
    const displayCount = count > 0 ? count : unreadCount;

    const formatTime = (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Только что';
      if (diffMins < 60) return `${diffMins} мин. назад`;
      if (diffHours < 24) return `${diffHours} ч. назад`;
      if (diffDays < 7) return `${diffDays} дн. назад`;
      return date.toLocaleDateString('ru-RU');
    };

    const getNotificationIcon = (type?: string) => {
      switch (type) {
        case 'stage_change':
          return '🔄';
        case 'deadline_overdue':
          return '⚠️';
        case 'call_created':
          return '📞';
        case 'lead_created':
          return '👤';
        default:
          return '📢';
      }
    };

    return (
      <Popover
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        trigger="click"
        placement="bottom-end"
        content={
          <EffectCard design={{ maxHeight: "500px", overflow: "auto" }}>
            {/* Header */}
            <Flex
              design={{
                padding: 3,
                borderBottom: "1px solid",
                borderColor: "color.bg.tertiary",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text design={{ fontWeight: "700", fontSize: "1rem" }}>
                Уведомления {unreadCount > 0 && `(${unreadCount})`}
              </Text>
              {unreadCount > 0 && onMarkAllAsRead && (
                <Button
                  preset="ghost"
                  design={{ padding: 1 }}
                  onClick={() => {
                    onMarkAllAsRead();
                  }}
                >
                  <Text design={{ fontSize: "0.75rem" }}>Прочитать все</Text>
                </Button>
              )}
            </Flex>

            {/* Notifications list */}
            {items.length === 0 ? (
              <Flex design={{ padding: 4 }}>
                <EmptyState
                  title="Нет уведомлений"
                  description="У вас пока нет уведомлений"
                  icon={<Bell size={48} />}
                />
              </Flex>
            ) : (
              <Flex design={{ flexDirection: "column" }}>
                {items.slice(0, 10).map((notification) => (
                  <Flex
                    key={notification.id}
                    design={{
                      padding: 2,
                      borderBottom: "1px solid",
                      borderColor: "color.bg.tertiary",
                      cursor: "pointer",
                      bg: notification.is_read ? "transparent" : "color.bg.tertiary",
                      hover: { bg: "color.bg.hover" },
                    }}
                    onClick={() => {
                      if (!notification.is_read && onMarkAsRead) {
                        onMarkAsRead(notification.id);
                      }
                      if (onItemClick) {
                        onItemClick(notification);
                      } else if (notification.onClick) {
                        notification.onClick();
                      }
                      setIsOpen(false);
                    }}
                  >
                    <Flex gap={2 as any} design={{ flex: 1, alignItems: "flex-start" }}>
                      <Text design={{ fontSize: "1.5rem" }}>
                        {getNotificationIcon(notification.type)}
                      </Text>
                      <Flex design={{ flexDirection: "column", gap: 1, flex: 1 }}>
                        <Text
                          design={{
                            fontWeight: notification.is_read ? "400" : "600",
                            fontSize: "0.875rem",
                          }}
                        >
                          {notification.title}
                        </Text>
                        <Text design={{ fontSize: "0.75rem", color: "color.text.secondary" }}>
                          {notification.message}
                        </Text>
                        <Text design={{ fontSize: "0.7rem", color: "color.text.secondary" }}>
                          {formatTime(notification.created_at)}
                        </Text>
                      </Flex>
                      {onDelete && (
                        <Button
                          preset="ghost"
                          design={{ padding: 1 }}
                          onClick={(e: any) => {
                            e.stopPropagation();
                            onDelete(notification.id);
                          }}
                        >
                          <X size={14} />
                        </Button>
                      )}
                    </Flex>
                  </Flex>
                ))}
              </Flex>
            )}

            {/* Footer */}
            {items.length > 10 && onViewAll && (
              <Flex
                design={{
                  padding: 2,
                  borderTop: "1px solid",
                  borderColor: "color.bg.tertiary",
                  justifyContent: "center",
                }}
              >
                <Button preset="ghost" onClick={() => {
                  onViewAll();
                  setIsOpen(false);
                }}>
                  Показать все уведомления
                </Button>
              </Flex>
            )}
          </EffectCard>
        }
      >
        <Button
          preset="soft"
          design={{
            padding: 2,
            minWidth: "auto",
            position: "relative",
            hover: { bg: "color.bg.tertiary" },
          }}
          title="Уведомления"
        >
          <Bell size={20} />
          {displayCount > 0 && (
            <Badge
              preset="danger"
              design={{
                position: "absolute",
                top: "-6px",
                right: "-6px",
                minWidth: "18px",
                height: "18px",
                fontSize: "10px",
                fontWeight: "600",
                padding: "0 4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {displayCount > 9 ? "9+" : displayCount}
            </Badge>
          )}
        </Button>
      </Popover>
    );
  };

// Подкомпонент: Универсальный поиск на мобильных
const MobileSearch: React.FC<{
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  entityType: SearchEntityType;
  searchOptions: SearchOption[];
  onValueChange: (value: string) => void;
  onEntityTypeChange: (type: SearchEntityType) => void;
  onSearch?: (value: string, entityType: SearchEntityType) => void;
}> = ({
  isOpen,
  onOpenChange,
  value,
  entityType,
  searchOptions,
  onValueChange,
  onEntityTypeChange,
  onSearch
}) => {
    // Защита от пустого массива searchOptions
    if (!searchOptions || searchOptions.length === 0) {
      return null;
    }

    return (
      <Popover
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        trigger="click"
        placement="bottom-start"
        content={
          <EffectCard design={{ padding: 2, minWidth: "320px", maxWidth: "90vw" }}>
            <Flex direction="column" gap={2 as any}>
              <Select
                value={entityType}
                onChange={(e) => {
                  const newType = e.target.value as SearchEntityType;
                  onEntityTypeChange(newType);
                }}
                options={searchOptions.map(opt => ({
                  value: opt.id,
                  label: opt.label,
                }))}
              />
              <SearchInput
                placeholder="Поиск..."
                value={value}
                onChange={(e) => {
                  const newValue = e.target.value;
                  onValueChange(newValue);
                  onSearch?.(newValue, entityType);
                }}
                autoFocus
              />
            </Flex>
          </EffectCard>
        }
      >
        <Button
          preset="soft"
          design={{
            padding: 2,
            minWidth: "auto",
            hover: { bg: "color.bg.tertiary" },
          }}
          title="Поиск"
        >
          <Search size={20} />
        </Button>
      </Popover>
    );
  };

// Подкомпонент: Универсальный поиск на десктопе
const DesktopSearch: React.FC<{
  value: string;
  entityType: SearchEntityType;
  searchOptions: SearchOption[];
  onValueChange: (value: string) => void;
  onEntityTypeChange: (type: SearchEntityType) => void;
  onSearch?: (value: string, entityType: SearchEntityType) => void;
  onSearchResults?: (value: string, entityType: SearchEntityType) => Promise<Array<{
    id: string;
    title: string;
    subtitle?: string;
    type: SearchEntityType;
    onClick?: () => void;
  }>>;
}> = ({
  value,
  entityType,
  searchOptions,
  onValueChange,
  onEntityTypeChange,
  onSearch,
  onSearchResults,
}) => {
    const [isEntitySelectorOpen, setIsEntitySelectorOpen] = useState(false);
    const [searchResults, setSearchResults] = useState<Array<{
      id: string;
      title: string;
      subtitle?: string;
      type: SearchEntityType;
      onClick?: () => void;
    }>>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);

    // Защита от пустого массива searchOptions
    if (!searchOptions || searchOptions.length === 0) {
      return null;
    }

    const currentOption = searchOptions.find(opt => opt.id === entityType) || searchOptions[0];

    // Загрузка результатов поиска
    useEffect(() => {
      if (!value.trim() || !onSearchResults) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      const timeoutId = setTimeout(async () => {
        setIsLoading(true);
        try {
          const results = await onSearchResults(value, entityType);
          setSearchResults(results);
          setShowResults(results.length > 0);
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
          setShowResults(false);
        } finally {
          setIsLoading(false);
        }
      }, 300); // Debounce 300ms

      return () => clearTimeout(timeoutId);
    }, [value, entityType, onSearchResults]);

    return (
      <Flex
        gap={1 as any}
        align="center"
        design={{
          flex: 1,
          maxWidth: "700px",
          margin: "0 auto",
          position: "relative",
        }}
      >
        {/* Селектор типа поиска */}
        <Popover
          isOpen={isEntitySelectorOpen}
          onOpenChange={setIsEntitySelectorOpen}
          trigger="click"
          placement="bottom-start"
          content={
            <EffectCard design={{ display: 'flex', gap: 2, flexDirection: 'column', padding: 3, minWidth: "180px" }}>
              {searchOptions.map((option) => (
                <Box
                  key={option.id}
                  as="button"
                  onClick={() => {
                    onEntityTypeChange(option.id);
                    setIsEntitySelectorOpen(false);
                  }}
                  design={{
                    width: "100%",
                    padding: 2,
                    textAlign: "left",
                    bg: entityType === option.id ? "color.bg.tertiary" : "transparent",
                    border: "none",
                    borderRadius: "radius.sm",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    hover: { bg: "color.bg.tertiary" },
                  }}
                >
                  {option.icon && (
                    <Box design={{ display: "flex", alignItems: "center" }}>
                      {option.icon}
                    </Box>
                  )}
                  <Text design={{ fontSize: "14px" }}>{option.label}</Text>
                </Box>
              ))}
            </EffectCard>
          }
        >
          <Button
            preset="secondary"
            design={{
              padding: 2,
              fontSize: "13px",
              fontWeight: "500",
              whiteSpace: "nowrap",
            }}
          >
            {currentOption.icon && (
              <Box design={{ marginRight: "6px", display: "flex", alignItems: "center" }}>
                {currentOption.icon}
              </Box>
            )}
            {currentOption.label}
          </Button>
        </Popover>

        {/* Поле поиска с результатами */}
        <Box design={{ flex: 1, position: "relative" }}>
          <Flex
            gap={1 as any}
            align="center"
            design={{
              position: "relative",
            }}
          >
            <Box
              design={{
                position: "absolute",
                left: "14px",
                color: "color.text.secondary",
                pointerEvents: "none",
                zIndex: 1,
                display: "flex",
                alignItems: "center",
              }}
            >
              <Search size={20} />
            </Box>
            <Input
              value={value}
              onChange={(e) => {
                const newValue = e.target.value;
                onValueChange(newValue);
                onSearch?.(newValue, entityType);
              }}
              onFocus={() => {
                if (searchResults.length > 0 || isLoading) {
                  setShowResults(true);
                }
              }}
              placeholder={`Поиск ${currentOption.label.toLowerCase()}...`}
              preset="default"
              design={{
                width: "100%",
                paddingLeft: 5,
                bg: "color.bg.tertiary",
              }}
            />
            {value && (
              <Button
                preset="ghost"
                onClick={() => {
                  onValueChange("");
                  onSearch?.("", entityType);
                  setSearchResults([]);
                  setShowResults(false);
                }}
                design={{
                  position: "absolute",
                  right: "8px",
                  padding: 1,
                  minWidth: "auto",
                  color: "color.text.secondary",
                  hover: { bg: "color.bg.tertiary", color: "color.text.primary" },
                }}
                title="Очистить"
              >
                <X size={20} />
              </Button>
            )}
          </Flex>

          {/* Результаты поиска */}
          {showResults && onSearchResults && (
            <Box
              design={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                marginTop: "4px",
                zIndex: 1000,
              }}
            >
              <EffectCard design={{ width: "100%", maxHeight: "400px", overflow: "auto", shadow: "shadow.lg" }}>
                {isLoading ? (
                  <Flex design={{ padding: 4, justifyContent: "center", alignItems: "center", gap: 2 }}>
                    <Box
                      design={{
                        width: "16px",
                        height: "16px",
                        border: "2px solid",
                        borderColor: "color.bg.tertiary",
                        borderTopColor: "color.primary",
                        borderRadius: "radius.full",
                        animation: "spin 1s linear infinite",
                      }}
                    />
                    <Text design={{ color: "color.text.secondary", fontSize: "0.875rem" }}>Поиск...</Text>
                  </Flex>
                ) : searchResults.length === 0 ? (
                  <Flex design={{ padding: 4, justifyContent: "center", flexDirection: "column", alignItems: "center", gap: 2 }}>
                    <Box
                      design={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "radius.full",
                        bg: "color.bg.tertiary",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Search size={24} style={{ color: "#9ca3af" }} />
                    </Box>
                    <Text design={{ color: "color.text.secondary", fontSize: "0.875rem" }}>Ничего не найдено</Text>
                    <Text design={{ color: "color.text.secondary", fontSize: "0.75rem" }}>Попробуйте изменить запрос</Text>
                  </Flex>
                ) : (
                  <Flex design={{ flexDirection: "column" }}>
                    {(() => {
                      // Группируем результаты по типам
                      const grouped = searchResults.reduce((acc, result) => {
                        if (!acc[result.type]) {
                          acc[result.type] = [];
                        }
                        acc[result.type].push(result);
                        return acc;
                      }, {} as Record<SearchEntityType, typeof searchResults>);

                      const typeLabels: Record<SearchEntityType, string> = {
                        all: "Результаты",
                        orders: "Заказы",
                        leads: "Лиды",
                        customers: "Клиенты",
                        products: "Товары",
                        employees: "Сотрудники",
                      };

                      const getTypeIcon = (type: SearchEntityType) => {
                        switch (type) {
                          case "orders":
                            return <ShoppingCart size={14} style={{ color: "#3b82f6" }} />;
                          case "leads":
                            return <UserSquare2 size={14} style={{ color: "#10b981" }} />;
                          case "customers":
                            return <Users size={14} style={{ color: "#8b5cf6" }} />;
                          case "products":
                            return <Package size={14} style={{ color: "#f59e0b" }} />;
                          case "employees":
                            return <Contact size={14} style={{ color: "#ef4444" }} />;
                          default:
                            return <Search size={14} style={{ color: "#6b7280" }} />;
                        }
                      };

                      return Object.entries(grouped).map(([type, items]) => (
                        <React.Fragment key={type}>
                          {Object.keys(grouped).length > 1 && (
                            <Flex
                              design={{
                                padding: "8px 12px",
                                bg: "color.bg.tertiary",
                                borderBottom: "1px solid",
                                borderColor: "color.bg.tertiary",
                                gap: 1,
                                alignItems: "center",
                              }}
                            >
                              {getTypeIcon(type as SearchEntityType)}
                              <Text design={{ fontSize: "0.75rem", fontWeight: "600", color: "color.text.secondary", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                {typeLabels[type as SearchEntityType]}
                              </Text>
                              <Box design={{ flex: 1 }} />
                              <Text design={{ fontSize: "0.75rem", color: "color.text.secondary" }}>
                                {items.length}
                              </Text>
                            </Flex>
                          )}
                          {items.map((result) => {
                            return (
                              <Flex
                                key={result.id}
                                design={{
                                  padding: 2,
                                  borderBottom: "1px solid",
                                  borderColor: "color.bg.tertiary",
                                  cursor: "pointer",
                                  hover: { bg: "color.bg.tertiary" },
                                  gap: 2,
                                  alignItems: "flex-start",
                                  transition: "background-color 0.15s ease",
                                }}
                                onClick={() => {
                                  if (result.onClick) {
                                    result.onClick();
                                  }
                                  setShowResults(false);
                                }}
                              >
                                <Box
                                  design={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "36px",
                                    height: "36px",
                                    borderRadius: "radius.md",
                                    bg: "color.bg.tertiary",
                                    flexShrink: 0,
                                  }}
                                >
                                  {getTypeIcon(result.type)}
                                </Box>
                                <Flex direction="column" gap={0.5 as any} design={{ flex: 1, minWidth: 0 }}>
                                  <Text
                                    design={{
                                      fontWeight: "500",
                                      fontSize: "0.875rem",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {result.title}
                                  </Text>
                                  {result.subtitle && (
                                    <Text
                                      design={{
                                        fontSize: "0.75rem",
                                        color: "color.text.secondary",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {result.subtitle}
                                    </Text>
                                  )}
                                </Flex>
                                <Box
                                  design={{
                                    display: "flex",
                                    alignItems: "center",
                                    color: "color.text.secondary",
                                    flexShrink: 0,
                                  }}
                                >
                                  <ChevronRight size={20} />
                                </Box>
                              </Flex>
                            );
                          })}
                        </React.Fragment>
                      ));
                    })()}
                  </Flex>
                )}
              </EffectCard>
            </Box>
          )}
        </Box>
      </Flex>
    );
  };

// Подкомпонент: Профиль пользователя с настройками и выходом
const UserProfile: React.FC<{
  user: HeaderProps["user"];
  isMobile: boolean;
  userMenuItems?: DropdownItem[];
}> = ({ user, isMobile, userMenuItems }) => {
  if (!user || !userMenuItems || userMenuItems.length === 0) return null;

  const trigger = isMobile ? (
    <Button
      preset="soft"
      title={user.name || user.email}
    >
      <Avatar
        src={user.avatar}
        name={user.name || user.email}
        size="sm"
        variant="circle"
      />
    </Button>
  ) : (
    <Button
      preset="soft"
      as="div"
      design={{
        gap: 2,
        padding: 2,
        borderRadius: "radius.md",
      }}
      title={user.name || user.email}
    >
      <Avatar
        src={user.avatar}
        name={user.name || user.email}
        size="sm"
        variant="circle"
      />
      <Flex direction="column" gap={0 as any}>
        {user.name && (
          <Text
            design={{
              fontWeight: "500",
              fontSize: "14px",
              margin: 0,
              lineHeight: "1.2",
            }}
          >
            {user.name}
          </Text>
        )}
        {user.email && (
          <Text
            design={{
              fontSize: "12px",
              color: "color.text.secondary",
              margin: 0,
              lineHeight: "1.2",
            }}
          >
            {user.email}
          </Text>
        )}
      </Flex>
    </Button>
  );

  return (
    <Dropdown
      trigger={trigger}
      items={userMenuItems}
      placement="bottom-end"
    />
  );
};

export const Header: React.FC<HeaderProps> = ({
  logo,
  title = "CRM",
  user,
  onMenuToggle,
  navbarCollapsed = false,
  onSearch,
  onSearchResults,
  searchValue: externalSearchValue,
  searchEntityType: externalEntityType,
  searchOptions,
  searchModel,
  onNotificationClick,
  onNotificationItemClick,
  onNotificationMarkAsRead,
  onNotificationMarkAllAsRead,
  onNotificationDelete,
  notifications = 0,
  notificationItems = [],
  onSettingsClick,
  onProfileClick,
  onLogoutClick,
  userMenuItems,
  design,
  actions,
  className,
  ...props
}) => {
  const isMobile = useIsMobile();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [internalSearchValue, setInternalSearchValue] = useState("");
  const [internalEntityType, setInternalEntityType] = useState<SearchEntityType>("all");

  const searchValue = externalSearchValue !== undefined ? externalSearchValue : internalSearchValue;
  const searchEntityType = externalEntityType !== undefined ? externalEntityType : internalEntityType;

  const handleSearchChange = (value: string) => {
    if (externalSearchValue === undefined) {
      setInternalSearchValue(value);
    }
    onSearch?.(value, searchEntityType);
  };

  const handleEntityTypeChange = (type: SearchEntityType) => {
    if (externalEntityType === undefined) {
      setInternalEntityType(type);
    }
    // Вызываем onSearch с текущим значением и новым типом
    onSearch?.(searchValue, type);
  };

  const containerDesign: DesignProps = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    
    padding: 3,
    height: "90px",
    bg: "color.bg.primary",
    borderBottom: "1px solid",
    borderColor: "color.bg.tertiary",
    position: "sticky",
    top: 0,
    zIndex: 100,
    shadow: "shadow.sm",
    ...design,
  };

  const mergedDesign = mergeDesign(containerDesign, design);
  const containerClass = getDesignClass(mergedDesign);
  const finalClassName = applyDesignClass(className, containerClass);

  // Поиск показывается только если переданы searchOptions
  // Это гарантирует, что опции поиска определяются приложением, а не библиотекой
  const showSearch = (onSearch || searchModel) && searchOptions && searchOptions.length > 0;

  return (
    <Box
      as="header"
      className={finalClassName}
      {...(mergedDesign && { design: mergedDesign })}
      {...props}
    >
      {/* Левая секция: Меню и логотип */}
      <Flex gap={3 as any} align="center">
        {onMenuToggle && (
          <Button
            preset="secondary"
            onClick={onMenuToggle}
            design={{ padding: 2 }}
            title={navbarCollapsed ? "Развернуть меню" : "Свернуть меню"}
          >
            {navbarCollapsed ? <ChevronRight size={20} /> : <Menu size={20} />}
          </Button>
        )}
      </Flex>

      {/* Центральная секция: Универсальный поиск */}
      {/* Поиск показывается только если переданы searchOptions - опции определяются приложением */}
      {showSearch && searchOptions && (
        isMobile ? (
          <MobileSearch
            isOpen={mobileSearchOpen}
            onOpenChange={setMobileSearchOpen}
            value={searchValue}
            entityType={searchEntityType}
            searchOptions={searchOptions}
            onValueChange={handleSearchChange}
            onEntityTypeChange={handleEntityTypeChange}
            onSearch={onSearch}
          />
        ) : (
          <DesktopSearch
            value={searchValue}
            entityType={searchEntityType}
            searchOptions={searchOptions}
            onValueChange={handleSearchChange}
            onEntityTypeChange={handleEntityTypeChange}
            onSearch={onSearch}
            onSearchResults={onSearchResults}
          />
        )
      )}

      {/* Правая секция: Действия, уведомления, профиль */}
      <Flex gap={2 as any} align="center">
        {actions}

        <NotificationButton
          count={notifications}
          items={notificationItems}
          onItemClick={onNotificationItemClick}
          onMarkAsRead={onNotificationMarkAsRead}
          onMarkAllAsRead={onNotificationMarkAllAsRead}
          onDelete={onNotificationDelete}
          onViewAll={onNotificationClick}
        />

        <UserProfile
          user={user}
          isMobile={isMobile}
          userMenuItems={userMenuItems}
        />
      </Flex>
    </Box>
  );
};
