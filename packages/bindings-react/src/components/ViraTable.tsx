import React, { useState, useEffect } from "react";
import { getDesignClass, applyDesignClass } from "@vira-ui/ui";
import { 
  ViraComponentProps, 
  useViraContext, 
  parseModel 
} from "@vira-ui/core";

/**
 * ViraTable - Table с поддержкой Vira Framework
 * 
 * Поддерживает:
 * - design prop для стилей
 * - source prop для auto-binding к данным из сервисов
 * 
 * @example
 * // С auto-binding к сервису
 * <ViraTable 
 *   source="client.list"
 *   columns={[
 *     { key: "name", label: "Имя" },
 *     { key: "email", label: "Email" }
 *   ]} 
 * />
 */

export interface ViraTableColumn {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

export interface ViraTableProps extends ViraComponentProps {
  columns: ViraTableColumn[];
  data?: any[];
  className?: string;
  loading?: boolean;
}

export const ViraTable: React.FC<ViraTableProps> = ({ 
  design, 
  source,
  columns,
  data: externalData,
  className,
  loading: externalLoading,
  ...props 
}) => {
  const viraContext = useViraContext();
  const [, forceUpdate] = useState({});
  const [internalData, setInternalData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // ============================================
  // AUTO-BINDING для source (реактивный)
  // ============================================
  useEffect(() => {
    if (!source || typeof source !== "string") return;

    const updateData = () => {
      try {
        const { service: serviceName, property: propertyName } = parseModel(source);
        const service = viraContext.services.get(serviceName);
        
        if (!service) {
          return;
        }

        // Получаем данные (может быть геттер)
        const data = typeof (service as any)[propertyName] === "function"
          ? (service as any)[propertyName]()
          : (service as any)[propertyName];
        
        if (Array.isArray(data)) {
          setInternalData([...data]); // Создаём копию для триггера
          forceUpdate({});
        } else {
          console.warn(`Property "${propertyName}" in service "${serviceName}" is not an array`);
        }
      } catch (err) {
      }
    };

    // Первоначальная загрузка
    updateData();

    // Подписка на изменения если сервис реактивный
    try {
      const { service: serviceName } = parseModel(source);
      const service = viraContext.services.get(serviceName);
      
      if (service && (service as any).__reactive__ && (service as any).__subscribers__) {
        (service as any).__subscribers__.add(updateData);

        return () => {
          if ((service as any).__subscribers__) {
            (service as any).__subscribers__.delete(updateData);
          }
        };
      }
    } catch (err) {
    }
  }, [source, viraContext]);

  // ============================================
  // COMPUTED DATA
  // ============================================
  const computedData = externalData !== undefined ? externalData : internalData;
  const isLoading = externalLoading !== undefined ? externalLoading : loading;

  // ============================================
  // DESIGN
  // ============================================
  const mergedDesign = design;
  const designClass = mergedDesign ? getDesignClass(mergedDesign) : "";
  const finalClassName = applyDesignClass(className, designClass);
  
  if (isLoading) {
    return <div className={finalClassName}>Loading...</div>;
  }

  return (
    <table 
      className={finalClassName}
      {...(mergedDesign && { "data-design": JSON.stringify(mergedDesign) })}
      {...(source && { "data-source": source })}
      {...props as any}
    >
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key}>{column.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {computedData.length === 0 ? (
          <tr>
            <td colSpan={columns.length} style={{ textAlign: "center", padding: "1rem" }}>
              Нет данных
            </td>
          </tr>
        ) : (
          computedData.map((row, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td key={column.key}>
                  {column.render 
                    ? column.render(row[column.key], row)
                    : row[column.key]
                  }
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

