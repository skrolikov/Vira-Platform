import React from "react";
import type { DesignProps } from "@vira-ui/ui";
import { getDesignClass, applyDesignClass, Flex, Text } from "@vira-ui/ui";
import type { ViraComponentProps } from "@vira-ui/core";
import { useService } from "@vira-ui/core";
import { Input } from "@vira-ui/ui";
import { Select } from "@vira-ui/ui";
import { Checkbox } from "@vira-ui/ui";

// Временный импорт из исходников (пока core не собран)
// @ts-ignore
import { getModelMetadata } from "../../../core/src/models";
// @ts-ignore
import type { FieldDefinition } from "../../../core/src/models";

/**
 * ViraForm - Автоматическая генерация форм из модели
 * 
 * Пример:
 * const ClientModel = defineModel({
 *   name: { type: "string", required: true },
 *   email: { type: "email", required: true },
 * });
 * 
 * <ViraForm service="clientForm" model={ClientModel} />
 */

export interface ViraFormProps extends ViraComponentProps {
  service: string;
  model?: any;
  onSubmit?: (data: any) => void | Promise<void>;
  layout?: "vertical" | "horizontal" | "grid";
  columns?: number;
  className?: string;
}

/**
 * Генерация типа input из типа поля
 */
function getInputType(fieldType: string): string {
  switch (fieldType) {
    case "email":
      return "email";
    case "number":
      return "number";
    case "date":
      return "date";
    case "url":
      return "url";
    default:
      return "text";
  }
}

/**
 * Определяет, какой компонент использовать для поля
 */
function getFieldComponent(fieldDef: FieldDefinition): "input" | "select" | "checkbox" {
  if (fieldDef.type === "boolean") {
    return "checkbox";
  }
  // Если есть enum или options - используем select
  if ((fieldDef as any).options || (fieldDef as any).enum) {
    return "select";
  }
  return "input";
}

/**
 * Генерация поля формы
 */
function renderField(
  fieldName: string,
  fieldDef: FieldDefinition,
  serviceName: string,
  formDesign?: DesignProps
): React.ReactNode {
  const modelPath = `${serviceName}.${fieldName}`;
  const inputType = getInputType(fieldDef.type);

  const fieldContainerDesign: DesignProps = {
    display: "flex",
    flexDirection: "column",
    gap: 1,
    ,
  };

  const labelDesign: DesignProps = {
    display: "block",
    
    fontWeight: "typography.fontWeight.medium",
    fontSize: "typography.fontSize.sm",
    color: "color.text.primary",
  };

  const requiredStarDesign: DesignProps = {
    color: "color.danger",
    marginLeft: 1,
  };

  const inputDesign: DesignProps = {
    width: "100%",
    preset: "default",
    ...formDesign,
  };

  return (
    <Flex
      key={fieldName}
      className="vira-form-field"
      design={fieldContainerDesign}
    >
      {fieldDef.label && getFieldComponent(fieldDef) !== "checkbox" && (
        <label htmlFor={fieldName}>
          <Text design={labelDesign}>
            {fieldDef.label}
            {fieldDef.required && (
              <span 
                className={getDesignClass(requiredStarDesign)}
                data-design={JSON.stringify(requiredStarDesign)}
              >
                *
              </span>
            )}
          </Text>
        </label>
      )}

      {getFieldComponent(fieldDef) === "checkbox" ? (
        <Checkbox
          data-model={modelPath}
          label={fieldDef.label}
          required={fieldDef.required}
        />
      ) : getFieldComponent(fieldDef) === "select" ? (
        <Select
          data-model={modelPath}
          placeholder={fieldDef.placeholder}
          options={(fieldDef as any).options || ((fieldDef as any).enum?.map((v: any) => ({ value: v, label: String(v) }))) || []}
          required={fieldDef.required}
          design={inputDesign}
        />
      ) : (
        <Input
          data-model={modelPath}
          type={inputType}
          placeholder={fieldDef.placeholder}
          required={fieldDef.required}
          design={inputDesign}
        />
      )}

      {/* Ошибка валидации будет показана через модель */}
    </Flex>
  );
}

export const ViraForm: React.FC<ViraFormProps> = ({
  service,
  model,
  onSubmit,
  design,
  layout = "vertical",
  columns = 1,
  children,
  className,
  ...props
}) => {
  // Получаем метаданные модели
  const modelMetadata = model ? getModelMetadata(model) : {};

  const formDesign: DesignProps = {
    display: "flex",
    flexDirection: layout === "horizontal" ? "row" : "column",
    gap: 3,
    ...design,
  };

  const gridDesign: DesignProps = {
    display: "grid",
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: 3,
    ...design,
  };

  const finalDesign = layout === "grid" ? gridDesign : formDesign;
  const designClass = getDesignClass(finalDesign);
  const finalClassName = applyDesignClass(className, designClass);

  // Получаем сервис формы
  let formService: any = null;
  try {
    formService = useService(service);
  } catch (err) {
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Если есть onSubmit - вызываем его
    if (onSubmit) {
      try {
        // Получаем данные из модели сервиса
        if (formService && (formService as any).model) {
          const data = (formService as any).model.toJSON();
          await onSubmit(data);
        } else {
          await onSubmit({});
        }
      } catch (err) {
      }
    }

    // Если у сервиса есть метод submit - вызываем его
    if (formService && typeof (formService as any).submit === "function") {
      try {
        await (formService as any).submit();
      } catch (err) {
      }
    }
  };

  return (
    <form
      className={finalClassName}
      onSubmit={handleSubmit}
      data-design={JSON.stringify(finalDesign)}
      data-service={service}
      {...(props as any)}
    >
      {/* Автогенерация полей из модели */}
      {Object.entries(modelMetadata).map(([fieldName, fieldDef]) =>
        renderField(fieldName, fieldDef, service, design)
      )}

      {/* Кастомные поля */}
      {children}

      {/* Кнопка submit будет добавлена отдельно или через children */}
    </form>
  );
};

