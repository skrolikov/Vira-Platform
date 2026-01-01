import React, { useState, useCallback, useMemo } from "react";

import { Flex } from "./Flex";
import { Table, type TableProps, type TableColumn } from "./Table";
import { Input } from "./Input";
import { Checkbox } from "./Checkbox";
import { DesignProps } from "../types";

/**
 * DataGrid - Enterprise Data Grid с inline editing, drag & drop колонок
 */

export interface EditableCellProps {
  value: any;
  row: any;
  column: TableColumn<any>;
  onSave: (value: any) => void;
  onCancel: () => void;
}

export interface DataGridProps<T = any> extends Omit<TableProps<T>, "columns" | "design"> {
  design?: DesignProps;
  columns: TableColumn<T>[];
  editable?: boolean | string[]; // true для всех, или массив ключей колонок
  onCellEdit?: (row: T, column: string, newValue: any, oldValue: any) => void | Promise<void>;
  onColumnReorder?: (columns: TableColumn<T>[]) => void;
  columnReorderable?: boolean;
  inlineEditComponent?: (props: EditableCellProps) => React.ReactNode;
}

export const DataGrid = <T extends Record<string, any>>({
  columns: initialColumns,
  editable = false,
  onCellEdit,
  onColumnReorder,
  columnReorderable = true,
  inlineEditComponent,
  ...props
}: DataGridProps<T>) => {
  const [columns, setColumns] = useState(initialColumns);
  const [editingCell, setEditingCell] = useState<{ rowId: string | number; columnKey: string } | null>(null);
  const [editValue, setEditValue] = useState<any>(null);

  // Определяем, какие колонки редактируемые
  const isColumnEditable = useCallback((columnKey: string): boolean => {
    if (!editable) return false;
    if (editable === true) return true;
    return Array.isArray(editable) && editable.includes(columnKey);
  }, [editable]);

  // Начало редактирования ячейки
  const handleCellClick = useCallback((row: T, column: TableColumn<T>) => {
    if (!isColumnEditable(column.key)) return;

    setEditingCell({ rowId: (row as any).id || Math.random(), columnKey: column.key });
    setEditValue(row[column.key]);
  }, [isColumnEditable]);

  // Сохранение изменения
  const handleSave = useCallback(async (row: T, columnKey: string) => {
    const oldValue = (row as any)[columnKey];
    
    if (onCellEdit) {
      await onCellEdit(row, columnKey, editValue, oldValue);
    }

    // Обновляем значение в строке (через any так как T может быть readonly)
    (row as any)[columnKey] = editValue;
    
    setEditingCell(null);
    setEditValue(null);
  }, [editValue, onCellEdit]);

  // Отмена редактирования
  const handleCancel = useCallback(() => {
    setEditingCell(null);
    setEditValue(null);
  }, []);

  // Render ячейки с поддержкой inline editing
  const renderEditableCell = useCallback((value: any, row: T, column: TableColumn<T>) => {
    const cellKey = `${(row as any).id || Math.random()}-${column.key}`;
    const isEditing = editingCell?.rowId === ((row as any).id || Math.random()) && 
                      editingCell?.columnKey === column.key;

    if (!isEditing) {
      const cellDesign: DesignProps = {
        cursor: isColumnEditable(column.key) ? "pointer" : "default",
        padding: 2,
        minHeight: "2rem",
        display: "flex",
        alignItems: "center",
        ...(isColumnEditable(column.key) && {
          hover: {
            bg: "color.bg.tertiary",
          },
        }),
      };

      return (
        <Flex
          onClick={() => handleCellClick(row, column)}
          design={cellDesign}
        >
          {column.render ? column.render(value, row) : String(value || "")}
        </Flex>
      );
    }

    // Кастомный компонент для редактирования
    if (inlineEditComponent) {
      return inlineEditComponent({
        value,
        row,
        column,
        onSave: (newValue) => handleSave(row, column.key),
        onCancel: handleCancel,
      });
    }

    // Дефолтные компоненты в зависимости от типа
    const inputType = typeof value === "number" ? "number" : 
                     typeof value === "boolean" ? "checkbox" : "text";

    const editContainerDesign: DesignProps = {
      padding: 1,
    };

    return (
      <Flex design={editContainerDesign}>
        {inputType === "checkbox" ? (
          <Checkbox
            checked={editValue}
            onUpdateModelValue={(val) => setEditValue(val)}
            onBlur={() => handleSave(row, column.key)}
          />
        ) : (
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            type={inputType}
            onBlur={() => handleSave(row, column.key)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter") {
                handleSave(row, column.key);
              } else if (e.key === "Escape") {
                handleCancel();
              }
            }}
            autoFocus
            design={{ width: "100%" }}
          />
        )}
      </Flex>
    );
  }, [editingCell, editValue, isColumnEditable, handleCellClick, handleSave, handleCancel, inlineEditComponent]);

  // Обновленные колонки с поддержкой редактирования
  const enhancedColumns = useMemo(() => {
    return columns.map(column => ({
      ...column,
      render: isColumnEditable(column.key)
        ? (value: any, row: T) => renderEditableCell(value, row, column)
        : column.render,
    }));
  }, [columns, isColumnEditable, renderEditableCell]);

  return (
    <Table
      {...props}
      columns={enhancedColumns}
    />
  );
};

