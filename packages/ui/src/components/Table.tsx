import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { DesignProps } from "../types";
import { Flex } from "./Flex";
import { Box } from "./Box";
import { Button } from "./Button";
import { Text } from "./Text";
import { EmptyState } from "./EmptyState";
import { Modal } from "./Modal";
import { Checkbox } from "./Checkbox";
import { Settings, ChevronRight, ChevronDown } from "lucide-react";
import { SearchInput } from "./SearchInput";
import { presets } from "../presets";
import { mergeDesign, getDesignClass, getDataDesignAttribute } from "../utils/design-utils";
import { ContextMenu, ContextMenuItem } from "./ContextMenu";

/**
 * Получает текущую дату в формате ISO (YYYY-MM-DD) для локального времени
 * Используется для экспорта файлов с корректным именем
 */
function getLocalISOString(date?: Date): string {
  const d = date || new Date();
  
  // Получаем локальные компоненты даты
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  const milliseconds = String(d.getMilliseconds()).padStart(3, '0');
  
  // Форматируем как ISO, но БЕЗ timezone (Z или offset)
  // Это гарантирует использование локального времени
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`;
}

export interface TableColumn<T = any> {
  key: string;
  label: string;
  width?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
  sortable?: boolean;
  resizable?: boolean;
  align?: "left" | "center" | "right";
  render?: (value: any, row: T) => React.ReactNode;
  sticky?: boolean;
}

export interface TablePagination {
  currentPage: number;
  totalPages: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export interface TableAction<T = any> {
  id: string;
  label: string | React.ReactNode;
  icon?: React.ReactNode;
  onClick: (row: T) => void;
  variant?: "primary" | "secondary" | "danger";
}

export interface TableProps<T = any> extends React.HTMLAttributes<HTMLDivElement> {
  columns: TableColumn<T>[];
  data?: T[];
  design?: DesignProps;
  selectable?: boolean;
  selectedRows?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  onRowClick?: (row: T) => void;
  rowActions?: (row: T) => TableAction<T>[];
  contextMenuItems?: (row: T) => ContextMenuItem[];
  searchable?: boolean;
  searchPlaceholder?: string;
  exportable?: boolean;
  columnConfigurable?: boolean;
  pagination?: TablePagination;
  loading?: boolean;
  emptyMessage?: string;
  storageKey?: string;
  defaultHiddenColumns?: string[];
  fullWidth?: boolean;
  toolbarContent?: React.ReactNode;
  onSavePreferences?: (key: string, value: { hiddenColumns: string[]; columnWidths: Record<string, number> }) => void;
  onLoadPreferences?: (key: string) => Promise<{ hiddenColumns?: string[]; columnWidths?: Record<string, number> } | null>;
  expandable?: boolean;
  expandedContent?: (row: T) => React.ReactNode;
  sortConfig?: { key: string; direction: "asc" | "desc" } | null;
  onSortChange?: (config: { key: string; direction: "asc" | "desc" } | null) => void;
  disableSorting?: boolean;
}

function TableComponent<T extends Record<string, any>>({
  columns,
  data: externalData,
  design,
  selectable = false,
  selectedRows: controlledSelectedRows,
  onSelectionChange,
  onRowClick,
  rowActions,
  contextMenuItems,
  searchable = false,
  searchPlaceholder = "Поиск...",
  exportable = false,
  columnConfigurable = true,
  pagination,
  loading: externalLoading,
  emptyMessage = "Нет данных",
  storageKey,
  defaultHiddenColumns = [],
  fullWidth = true,
  toolbarContent,
  onSavePreferences,
  onLoadPreferences,
  expandable = false,
  expandedContent,
  sortConfig: externalSortConfig,
  onSortChange,
  disableSorting = false,
  className,
  ...props
}: TableProps<T>): React.ReactElement {
  const [internalSortConfig, setInternalSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  
  // Use external sort config if provided, otherwise use internal
  const sortConfig = externalSortConfig !== undefined ? externalSortConfig : internalSortConfig;
  
  // Create a unified setSortConfig function
  const setSortConfig = useCallback((config: { key: string; direction: "asc" | "desc" } | null) => {
    if (onSortChange) {
      // If external control, call the external handler
      onSortChange(config);
    } else {
      // Otherwise, use internal state
      setInternalSortConfig(config);
    }
  }, [onSortChange]);
  const [internalSelectedRows, setInternalSelectedRows] = useState<string[]>([]);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [hiddenColumns, setHiddenColumns] = useState<string[]>(defaultHiddenColumns);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(pagination?.pageSize || 10);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const isInitializedRef = React.useRef(false); // Ref для отслеживания инициализации (не триггерит ре-рендер)
  const saveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null); // Ref для debounce сохранения
  const lastSavedWidthsRef = React.useRef<string>(''); // Ref для отслеживания последних сохраненных widths
  const lastSavedHiddenRef = React.useRef<string>(''); // Ref для отслеживания последних сохраненных hidden

  const data = externalData || [];
  const isLoading = externalLoading || false;
  const selectedRows = controlledSelectedRows ?? internalSelectedRows;

  // Load preferences (только один раз при монтировании, когда columns готовы)
  useEffect(() => {
    if (isInitializedRef.current || columns.length === 0) return; // Не повторяем инициализацию, ждем columns
    
    if (storageKey) {
      // Сначала пытаемся загрузить из API (если доступен)
      const loadFromAPI = async () => {
        let loadedWidths: Record<string, number> | null = null;
        let loadedHidden: string[] | null = null;

        if (onLoadPreferences) {
          try {
            const prefs = await onLoadPreferences(`tableColumns.${storageKey}`);
            if (prefs) {
              if (prefs.hiddenColumns) loadedHidden = prefs.hiddenColumns;
              if (prefs.columnWidths) loadedWidths = prefs.columnWidths;
            }
          } catch (error) {
            console.error('Error loading preferences from API:', error);
          }
        }
        
        // Fallback: загружаем из localStorage (если не загрузили из API)
        if (!loadedWidths) {
          try {
            const saved = localStorage.getItem(`vira-table-${storageKey}`);
            if (saved) {
              const parsed = JSON.parse(saved);
              if (parsed.columnWidths) loadedWidths = parsed.columnWidths;
              if (!loadedHidden && parsed.hiddenColumns) loadedHidden = parsed.hiddenColumns;
            }
          } catch { }
        }

        // Инициализируем widths: сначала сохраненные, потом дефолтные из columns (не перезаписывая)
        const widths: Record<string, number> = loadedWidths || {};
        
        // Дополняем недостающими колонками из columns (но не перезаписываем существующие)
        columns.forEach(col => {
          if (!(col.key in widths)) {
            widths[col.key] = col.width ? (typeof col.width === "number" ? col.width : parseInt(col.width as string)) : 150;
          }
        });

        // Применяем загруженные значения
        if (loadedHidden) setHiddenColumns(loadedHidden);
        setColumnWidths(widths);
        isInitializedRef.current = true; // Отмечаем как инициализированное
      };
      
      loadFromAPI();
    } else {
      // Если нет storageKey, просто инициализируем из columns один раз
      const widths: Record<string, number> = {};
      columns.forEach(col => {
        widths[col.key] = col.width ? (typeof col.width === "number" ? col.width : parseInt(col.width as string)) : 150;
      });
      setColumnWidths(widths);
      isInitializedRef.current = true; // Отмечаем как инициализированное
    }
  }, [storageKey, onLoadPreferences, columns]); // Добавил columns чтобы инициализировать когда они готовы

  // Дополняем widths для новых колонок (если columns изменились после инициализации)
  useEffect(() => {
    if (!isInitializedRef.current) return;
    
    // Добавляем только новые колонки, не трогая существующие
    setColumnWidths(prev => {
      const updated = { ...prev };
      let changed = false;
      
      columns.forEach(col => {
        if (!(col.key in updated)) {
          updated[col.key] = col.width ? (typeof col.width === "number" ? col.width : parseInt(col.width as string)) : 150;
          changed = true;
        }
      });
      
      return changed ? updated : prev;
    });
  }, [columns]);

  useEffect(() => {
    // Сохраняем только после инициализации, чтобы не сохранять пустые значения
    if (!isInitializedRef.current) return;
    
    if (!storageKey || Object.keys(columnWidths).length === 0) return;
    
    // Проверяем, действительно ли что-то изменилось
    const currentWidthsStr = JSON.stringify(columnWidths);
    const currentHiddenStr = JSON.stringify(hiddenColumns.sort());
    
    if (currentWidthsStr === lastSavedWidthsRef.current && currentHiddenStr === lastSavedHiddenRef.current) {
      // Ничего не изменилось, не сохраняем
      return;
    }
    
    // Очищаем предыдущий таймаут
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Debounce: сохраняем через 500ms после последнего изменения
    saveTimeoutRef.current = setTimeout(() => {
      // Сохраняем в localStorage
      localStorage.setItem(`vira-table-${storageKey}`, JSON.stringify({ hiddenColumns, columnWidths }));
      
      // Также сохраняем через onSavePreferences для БД (user_preferences)
      if (onSavePreferences) {
        onSavePreferences(`tableColumns.${storageKey}`, { 
          hiddenColumns, 
          columnWidths 
        });
      }
      
      // Обновляем refs с сохраненными значениями
      lastSavedWidthsRef.current = currentWidthsStr;
      lastSavedHiddenRef.current = currentHiddenStr;
      
      saveTimeoutRef.current = null;
    }, 500);
    
    // Cleanup при размонтировании или изменении зависимостей
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [hiddenColumns, columnWidths, storageKey, onSavePreferences]);

  const visibleColumns = useMemo(() => columns.filter(c => !hiddenColumns.includes(c.key)), [columns, hiddenColumns]);

  const filteredData = useMemo(() => {
    if (!searchable || !searchTerm) return data;
    const term = searchTerm.toLowerCase();
    return data.filter(item =>
      visibleColumns.some(col => {
        const value = item[col.key];
        return value != null && String(value).toLowerCase().includes(term);
      })
    );
  }, [data, searchTerm, searchable, visibleColumns]);

  const sortedData = useMemo(() => {
    // If sorting is disabled or no sort config, return filtered data as-is
    if (disableSorting || !sortConfig) return filteredData;
    // If external sort config is provided, data should already be sorted externally, return as-is
    if (externalSortConfig !== undefined && onSortChange) {
      // External control - data is already sorted by parent component
      return filteredData;
    }
    // Otherwise, apply internal sorting
    return [...filteredData].sort((a, b) => {
      const aV = a[sortConfig.key]; const bV = b[sortConfig.key];
      if (aV < bV) return sortConfig.direction === "asc" ? -1 : 1;
      if (aV > bV) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig, disableSorting, externalSortConfig, onSortChange]);

  const handleSort = useCallback((key: string, sortable?: boolean) => {
    if (!sortable || disableSorting) return;
    const current = sortConfig;
    const newConfig = {
      key,
      direction: current?.key === key && current?.direction === "asc" ? "desc" : "asc" as "asc" | "desc"
    };
    
    // If external control, call onSortChange; otherwise use internal state
    if (onSortChange) {
      onSortChange(newConfig);
    } else {
      setSortConfig(newConfig);
    }
  }, [sortConfig, disableSorting, setSortConfig, onSortChange]);

  const handleRowSelect = useCallback((id: string) => {
    const newSelected = selectedRows.includes(id)
      ? selectedRows.filter(x => x !== id)
      : [...selectedRows, id];
    if (!controlledSelectedRows) setInternalSelectedRows(newSelected);
    onSelectionChange?.(newSelected);
  }, [selectedRows, onSelectionChange, controlledSelectedRows]);

  const handleSelectAll = useCallback(() => {
    const newSelected = selectedRows.length === sortedData.length ? [] : sortedData.map(x => x.id);
    if (!controlledSelectedRows) setInternalSelectedRows(newSelected);
    onSelectionChange?.(newSelected);
  }, [sortedData, selectedRows, onSelectionChange, controlledSelectedRows]);

  const handleExportCSV = useCallback(() => {
    const headers = visibleColumns.map(c => c.label).join(",");
    const rows = sortedData.map(r => visibleColumns.map(c => `"${String(r[c.key] ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([`${headers}\n${rows}`], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `table-export-${getLocalISOString().split("T")[0]}.csv`;
    link.click();
  }, [sortedData, visibleColumns]);

  const handleCopyToClipboard = useCallback(() => {
    const text = sortedData.map(r => visibleColumns.map(c => String(r[c.key] ?? "")).join("\t")).join("\n");
    navigator.clipboard.writeText(text).catch(console.error);
  }, [sortedData, visibleColumns]);

  const getColumnFlexProps = (col: TableColumn<T>) => ({
    flex: `0 0 ${columnWidths[col.key] || col.width || 150}px`,
    width: `${columnWidths[col.key] || col.width || 150}px`,
    minWidth: col.minWidth ? `${col.minWidth}px` : "80px",
    maxWidth: col.maxWidth ? `${col.maxWidth}px` : "none",
    overflow: "visible",
    position: "relative",
  });

  return (
    <Flex direction="column" design={{ width: "100%"}} style={{overflow: "auto", position: "relative"}} {...props}>
      {/* Toolbar */}
      {(toolbarContent || searchable || exportable) && (
        <Flex justify="space-between" align="center" wrap>
          {toolbarContent && <Flex align="center" wrap design={{ flex: 1 }}>{toolbarContent}</Flex>}
          {searchable && !toolbarContent && (
            <SearchInput value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder={searchPlaceholder} />
          )}
          {exportable && (
            <Flex align="center" gap={2}>
              <Button onClick={handleExportCSV} preset="secondary"><Text>📥 Экспорт</Text></Button>
              <Button onClick={handleCopyToClipboard} preset="secondary"><Text>Копировать</Text></Button>
            </Flex>
          )}
        </Flex>
      )}

      {/* Header */}
      <Flex design={{ minWidth: "100%", width: "100%", marginBottom: "12px", position: "relative", overflow: "visible" }}>
        {/* Expand column */}
        {expandable && (
          <Flex align="center" justify="center" design={{minWidth: "48px", maxWidth: "48px" }} style={{ flex: "0 0 48px" }}>
          </Flex>
        )}
        
        {/* Checkbox column */}
        {selectable && (
          <Flex align="center" justify="center" design={{minWidth: "48px", maxWidth: "48px" }} style={{ flex: "0 0 48px" }}>
            <Checkbox checked={sortedData.length > 0 && selectedRows.length === sortedData.length}
              onChange={handleSelectAll} />
          </Flex>
        )}

        {/* Column headers */}
        {visibleColumns.map(col => {
          const flexProps = getColumnFlexProps(col);
          const sortIndicator = sortConfig?.key === col.key ? (sortConfig.direction === "asc" ? " ↑" : " ↓") : "";
          const isSortable = col.sortable === true && !disableSorting;
          const isActivelySorted = sortConfig?.key === col.key;
          
          const headerCellDesign: DesignProps = mergeDesign(presets.soft, {
            ...flexProps,
            position: "relative",
            cursor: isSortable ? "pointer" : "default",
            padding: 3,
            margin: 0,
            minHeight: "44px",
            fontWeight: "typography.fontWeight.semibold",
            fontSize: "typography.fontSize.sm",
            display: "flex",
            alignItems: "center",
            justifyContent: col.align === "center" ? "center" : col.align === "right" ? "flex-end" : "flex-start",
            // Visual indication for sortable columns
            ...(isSortable && {
              color: isActivelySorted ? "color.primary" : "color.text.primary",
              hover: {
                bg: "color.bg.tertiary",
                color: "color.primary",
              },
              transition: "all 0.2s ease",
            }),
            // Active sort indication
            ...(isActivelySorted && {
              bg: "rgba(59, 130, 246, 0.08)",
              borderBottom: "2px solid",
              borderBottomColor: "color.primary",
            }),
          });
          const headerClass = getDesignClass(headerCellDesign);

          return (
            <Box
              key={col.key}
              data-column={col.key}
              className={headerClass}
              preset="soft"
              design={headerCellDesign}
              onClick={() => handleSort(col.key, col.sortable && !disableSorting)}
            >
              <Flex align="center" gap={1} design={{ userSelect: "none" }}>
                <Text>{col.label}</Text>
                {isSortable && (
                  <Text design={{ fontSize: "0.75rem", opacity: isActivelySorted ? 1 : 0.4 }}>
                    {sortIndicator || "⇅"}
                  </Text>
                )}
              </Flex>
              {/* Resize handle */}
              {(col.resizable !== false) && (
                <Box
                  as="div"
                  onMouseDown={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    e.preventDefault();
                    // Отключаем выделение текста при resize
                    document.body.style.userSelect = 'none';
                    document.body.style.cursor = 'col-resize';
                    setIsResizing(col.key);
                    const startX = e.clientX;
                    const startWidth = columnWidths[col.key] || (typeof col.width === 'number' ? col.width : parseInt(col.width as string) || 150);
                    
                    const handleMouseMove = (e: MouseEvent) => {
                      const diff = e.clientX - startX;
                      const newWidth = Math.max(col.minWidth ? (typeof col.minWidth === 'number' ? col.minWidth : parseInt(col.minWidth as string)) : 80, startWidth + diff);
                      const maxW = col.maxWidth ? (typeof col.maxWidth === 'number' ? col.maxWidth : parseInt(col.maxWidth as string)) : Infinity;
                      if (newWidth <= maxW) {
                        setColumnWidths(prev => ({ ...prev, [col.key]: newWidth }));
                      }
                    };
                    
                    const handleMouseUp = () => {
                      // Восстанавливаем выделение текста
                      document.body.style.userSelect = '';
                      document.body.style.cursor = '';
                      setIsResizing(null);
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };
                    
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                  design={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    bottom: 0,
                    width: '4px',
                    cursor: 'col-resize',
                    backgroundColor: isResizing === col.key ? 'color.primary' : 'transparent',
                    hover: {
                      backgroundColor: 'color.primary',
                    },
                    transition: 'background-color 0.2s',
                  }}
                />
              )}
            </Box>
          );
        })}

        {/* Settings column */}
        {columnConfigurable && (
          <Flex align="center" justify="center" design={{minWidth: "48px", maxWidth: "48px" }} style={{ flex: "0 0 48px" }}>
            <Button onClick={() => setShowColumnSettings(!showColumnSettings)} preset="ghost" title={`Настроить столбцы (${visibleColumns.length}/${columns.length})`}>
              <Settings />
            </Button>
          </Flex>
        )}

        {/* Actions column */}
        {rowActions && (
          <Flex align="center" justify="center" design={{minWidth: "120px", maxWidth: "120px" }} style={{ flex: "0 0 120px" }}>
            <Text>Действия</Text>
          </Flex>
        )}
      </Flex>

      {/* Table Body */}
      <Flex direction="column" design={{ width: "100%", position: "relative", overflow: "visible" }}>
        {isLoading ? (
          <Flex direction="column" align="center" justify="center" design={{ padding: 8 }}>
            <Box design={{ width: 8, height: 8, border: "3px solid bg.tertiary", borderTopColor: "primary", borderRadius: "50%", mb: 3, animation: "spin 1s linear infinite" }} />
            <Text>Загрузка данных...</Text>
          </Flex>
        ) : sortedData.length === 0 ? (
          <EmptyState title={emptyMessage} description={searchTerm ? "Попробуйте изменить поисковый запрос" : undefined} />
        ) : (
          sortedData.map((row, idx) => {
            const isSelected = selectedRows.includes(row.id);
            const isExpanded = expandedRows.has(row.id);
            const rowDesign: DesignProps = {
              minWidth: "100%", width: "100%", cursor: onRowClick || expandable ? "pointer" : "default", margin: "4px 0", padding: 2,
              borderRadius: "radius.md", transition: "all 0.2s ease",
              position: "relative",
              overflow: "visible",
              hover: { bg: "color.bg.tertiary", shadow: "shadow.sm" }
            };
            const rowClass = getDesignClass(rowDesign);

            const handleRowClickInternal = (e: React.MouseEvent) => {
              // Проверяем, не был ли клик на интерактивном элементе
              const target = e.target as HTMLElement;
              const currentTarget = e.currentTarget as HTMLElement;
              
              // Проверяем, есть ли обработчик onClick у target или его родителей
              let element: HTMLElement | null = target;
              while (element && element !== currentTarget) {
                // Проверяем только реальные интерактивные HTML элементы
                const tagName = element.tagName?.toLowerCase();
                if (tagName === 'button' || tagName === 'a' || tagName === 'input' || 
                    tagName === 'select' || tagName === 'textarea') {
                  return; // Блокируем клик строки
                }
                
                // Проверяем атрибут data-stop-propagation
                if (element.getAttribute && element.getAttribute('data-stop-propagation')) {
                  return;
                }
                
                // Проверяем наличие onClick обработчика (React synthetic events)
                // @ts-ignore - проверяем внутренние свойства React
                const hasOnClick = element.onclick || 
                                   (element as any).__reactProps$?.onClick ||
                                   (element as any)._reactProps?.onClick;
                
                // Проверяем cursor: pointer как признак кликабельности (но только для span, div и подобных)
                if (hasOnClick || (element.style.cursor === 'pointer' && 
                    (tagName === 'span' || tagName === 'div') && hasOnClick !== undefined)) {
                  return; // Элемент имеет обработчик клика
                }
                
                element = element.parentElement;
              }
              
              if (expandable) {
                e.stopPropagation();
                setExpandedRows(prev => {
                  const newSet = new Set(prev);
                  if (newSet.has(row.id)) {
                    newSet.delete(row.id);
                  } else {
                    newSet.add(row.id);
                  }
                  return newSet;
                });
              }
              onRowClick?.(row);
            };

            const rowContent = (
              <>
                <Flex 
                  key={row.id || idx} 
                  align="center" 
                  className={rowClass} 
                  {...(getDataDesignAttribute(rowDesign) && { "data-design": getDataDesignAttribute(rowDesign) })} 
                  onClick={handleRowClickInternal}
                  style={{ position: "relative", width: "100%" }}
                >
                  {/* Expand icon */}
                  {expandable && (
                    <Flex align="center" justify="center" design={{ flex: "0 0 48px", minWidth: "48px", maxWidth: "48px" }}>
                      <Button 
                        preset="ghost" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedRows(prev => {
                            const newSet = new Set(prev);
                            if (newSet.has(row.id)) {
                              newSet.delete(row.id);
                            } else {
                              newSet.add(row.id);
                            }
                            return newSet;
                          });
                        }}
                        design={{ padding: 1 }}
                      >
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </Button>
                    </Flex>
                  )}
                  
                  {/* Checkbox */}
                  {selectable && (
                    <Flex align="center" justify="center" design={{ flex: "0 0 48px", minWidth: "48px", maxWidth: "48px" }}>
                      <Checkbox checked={isSelected} onChange={() => handleRowSelect(row.id)} />
                    </Flex>
                  )}

                {/* Cells */}
                {visibleColumns.map(col => {
                  const value = row[col.key];
                  const content = col.render ? col.render(value, row) : value;
                  const isReactElement = React.isValidElement(content);
                  return (
                    <Flex 
                      key={col.key} 
                      align="center" 
                      justify={col.align === "center" ? "center" : col.align === "right" ? "flex-end" : "flex-start"} 
                      design={{ ...getColumnFlexProps(col), overflow: "visible" }}
                    >
                      {isReactElement ? (
                        <Box as="div" design={{ minWidth: 0, flex: 1, overflow: "visible" }}>{content}</Box>
                      ) : (
                        <Text truncate>{content}</Text>
                      )}
                    </Flex>
                  );
                })}

                {/* Settings cell (empty) */}
                {columnConfigurable && <Flex design={{ flex: "0 0 48px", minWidth: "48px", maxWidth: "48px" }} />}

                {/* Actions */}
                {rowActions && (
                  <Flex align="center" justify="center" gap={1} design={{ flex: "0 0 120px", minWidth: "120px", maxWidth: "120px", overflow: "visible" }}>
                    {rowActions(row).map(action => (
                      <Button key={action.id} onClick={e => { e.stopPropagation(); action.onClick(row); }} preset={action.variant || "ghost"} design={{ overflow: "visible" }}>
                        {action.icon || action.label}
                      </Button>
                    ))}
                  </Flex>
                )}
                </Flex>
                
                {/* Expanded content */}
                {expandable && isExpanded && expandedContent && (
                  <Box design={{ 
                    padding: 4, 
                     
                    
                    borderRadius: "radius.md",
                    bg: "color.bg.secondary",
                    border: "1px solid",
                    borderColor: "color.border",
                  }}>
                    {expandedContent(row)}
                  </Box>
                )}
              </>
            );

            if (contextMenuItems) {
              const menuItems = contextMenuItems(row);
              // Wrap row content in a Box so ContextMenu can attach event handlers
              const wrappedContent = (
                <Box key={row.id || idx} style={{ width: "100%" }}>
                  {rowContent}
                </Box>
              );
              return <ContextMenu items={menuItems}>{wrappedContent}</ContextMenu>;
            }

            return <Box key={row.id || idx}>{rowContent}</Box>;
          })
        )}
      </Flex>

      {/* Footer */}
      {
        (pagination || sortedData.length > 0) && (
          <Flex justify="space-between" align="center">
            <Text color="text.secondary" size="sm">
              Показано: {sortedData.length} из {data.length}
              {searchTerm && ` (отфильтровано)`}
            </Text>

            {pagination && (
              <Flex align="center" gap={2}>
                <Button disabled={pagination.currentPage === 1} onClick={() => pagination.onPageChange(pagination.currentPage - 1)} preset="secondary">←</Button>
                <Text>Страница {pagination.currentPage} из {pagination.totalPages}</Text>
                <Button disabled={pagination.currentPage === pagination.totalPages} onClick={() => pagination.onPageChange(pagination.currentPage + 1)} preset="secondary">→</Button>
              </Flex>
            )}
          </Flex>
        )
      }

      {/* Column Settings Modal */}
      <Modal isOpen={showColumnSettings} onClose={() => setShowColumnSettings(false)} title="Видимость столбцов" size="xs">
        <Flex direction="column" gap={1}>
          {columns.map(col => (
            <Flex key={col.key} align="center" gap={3} design={{ padding: "10px 12px", cursor: "pointer" }}>
              <Checkbox
                checked={!hiddenColumns.includes(col.key)}
                label={col.label}
                onChange={(e) => {
                  if (e.target.checked) setHiddenColumns(prev => prev.filter(k => k !== col.key));
                  else setHiddenColumns(prev => [...prev, col.key]);
                }}
                size="sm"
              />
            </Flex>
          ))}
        </Flex>
      </Modal>
    </Flex >
  );
}

// Export with proper generic typing to ensure all props are recognized
export const Table: <T extends Record<string, any>>(props: TableProps<T>) => React.ReactElement = TableComponent;
