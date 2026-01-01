import React, { useState, useMemo, useCallback, useEffect } from "react";
import { DesignProps } from "../types";
import { Flex } from "./Flex";
import { Box } from "./Box";
import { Button } from "./Button";
import { Text } from "./Text";
import { EmptyState } from "./EmptyState";
import { Modal } from "./Modal";
import { Checkbox } from "./Checkbox";
import { Settings } from "lucide-react";
import { SearchInput } from "./SearchInput";
import { presets } from "../presets";
import { mergeDesign, getDesignClass, getDataDesignAttribute } from "../utils/design-utils";
import { ContextMenu, ContextMenuItem } from "./ContextMenu";

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
}

export const Table = <T extends Record<string, any>>({
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
  className,
  ...props
}: TableProps<T>) => {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const [internalSelectedRows, setInternalSelectedRows] = useState<string[]>([]);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [hiddenColumns, setHiddenColumns] = useState<string[]>(defaultHiddenColumns);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(pagination?.pageSize || 10);

  const data = externalData || [];
  const isLoading = externalLoading || false;
  const selectedRows = controlledSelectedRows ?? internalSelectedRows;

  // Load / save settings
  useEffect(() => {
    if (storageKey) {
      try {
        const saved = localStorage.getItem(`vira-table-${storageKey}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.hiddenColumns) setHiddenColumns(parsed.hiddenColumns);
          if (parsed.columnWidths) setColumnWidths(parsed.columnWidths);
        }
      } catch { }
    }
  }, [storageKey]);

  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(`vira-table-${storageKey}`, JSON.stringify({ hiddenColumns, columnWidths }));
    }
  }, [hiddenColumns, columnWidths, storageKey]);

  // Init column widths
  useEffect(() => {
    if (!Object.keys(columnWidths).length) {
      const widths: Record<string, number> = {};
      columns.forEach(col => {
        widths[col.key] = col.width ? (typeof col.width === "number" ? col.width : parseInt(col.width as string)) : 150;
      });
      setColumnWidths(widths);
    }
  }, [columns, columnWidths]);

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
    if (!sortConfig) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aV = a[sortConfig.key]; const bV = b[sortConfig.key];
      if (aV < bV) return sortConfig.direction === "asc" ? -1 : 1;
      if (aV > bV) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  const handleSort = useCallback((key: string, sortable?: boolean) => {
    if (!sortable) return;
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current?.direction === "asc" ? "desc" : "asc"
    }));
  }, []);

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
    link.download = `table-export-${new Date().toISOString().split("T")[0]}.csv`;
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
  });

  return (
    <Flex direction="column" design={{ width: "100%"}} style={{overflow: "auto"}} {...props}>
      {/* Toolbar */}
      {(toolbarContent || searchable || exportable) && (
        <Flex justify="space-between" align="center" wrap design={{ marginBottom: 4 }}>
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
      <Flex design={{ minWidth: "100%", width: "100%", marginBottom: "12px" }}>
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
          const headerCellDesign: DesignProps = mergeDesign(presets.soft, {
            ...flexProps,
            position: "relative",
            cursor: col.sortable ? "pointer" : "default",
            padding: 3,
            margin: 0,
            minHeight: "44px",
            fontWeight: "typography.fontWeight.semibold",
            fontSize: "typography.fontSize.sm",
            display: "flex",
            alignItems: "center",
            justifyContent: col.align === "center" ? "center" : col.align === "right" ? "flex-end" : "flex-start",
          });
          const headerClass = getDesignClass(headerCellDesign);

          return (
            <Box
              key={col.key}
              data-column={col.key}
              className={headerClass}
              preset="soft"
              design={headerCellDesign}
              onClick={() => handleSort(col.key, col.sortable)}
            >
              <Text>{col.label}{sortIndicator}</Text>
              {/* Здесь пока не трогаем resize */}
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
      <Flex direction="column" design={{ width: "100%" }}>
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
            const rowDesign: DesignProps = {
              minWidth: "100%", width: "100%", cursor: onRowClick ? "pointer" : "default", margin: "4px 0", padding: 2,
              borderRadius: "radius.md", transition: "all 0.2s ease",
              hover: { bg: "color.bg.tertiary", shadow: "shadow.sm" }
            };
            const rowClass = getDesignClass(rowDesign);

            const rowContent = (
              <Flex key={row.id || idx} align="center" className={rowClass} {...(getDataDesignAttribute(rowDesign) && { "data-design": getDataDesignAttribute(rowDesign) })} onClick={() => onRowClick?.(row)}>
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
                    <Flex key={col.key} align="center" justify={col.align === "center" ? "center" : col.align === "right" ? "flex-end" : "flex-start"} design={{ ...getColumnFlexProps(col) }}>
                      {isReactElement ? (
                        <Box as="div" design={{ minWidth: 0, flex: 1 }}>{content}</Box>
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
            );

            if (contextMenuItems) {
              const menuItems = contextMenuItems(row);
              return <ContextMenu key={row.id || idx} items={menuItems}>{rowContent}</ContextMenu>;
            }

            return rowContent;
          })
        )}
      </Flex>

      {/* Footer */}
      {
        (pagination || sortedData.length > 0) && (
          <Flex justify="space-between" align="center" design={{ marginTop: 4 }}>
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
};
