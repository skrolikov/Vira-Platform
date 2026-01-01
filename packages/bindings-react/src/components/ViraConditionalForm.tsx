import React, { useEffect, useState } from "react";
import { ViraForm, type ViraFormProps } from "./ViraForm";
import { useService } from "@vira-ui/core";

// Временные типы (будут из core после сборки)
export interface ConditionalFieldRule {
  field: string;
  condition: (model: any) => boolean;
  show?: boolean;
  required?: boolean;
  disabled?: boolean;
}

export interface FieldDependency {
  sourceField: string;
  targetField: string;
  transform: (sourceValue: any) => any;
}

/**
 * ViraConditionalForm - Форма с условными полями и зависимостями
 */

export interface ViraConditionalFormProps extends ViraFormProps {
  conditionalRules?: ConditionalFieldRule[];
  fieldDependencies?: FieldDependency[];
  renderField?: (fieldName: string, fieldDef: any, isVisible: boolean, isDisabled: boolean) => React.ReactNode;
}

export const ViraConditionalForm: React.FC<ViraConditionalFormProps> = ({
  service,
  model,
  conditionalRules = [],
  fieldDependencies = [],
  renderField,
  ...props
}) => {
  const formService = useService(service);
  const [forceUpdate, setForceUpdate] = useState({});

  // Применяем conditional rules при изменении модели
  useEffect(() => {
    if (!formService || !formService.model || !conditionalRules.length) return;

    // Простая реализация conditional rules
    const modelInstance = formService.model;
    conditionalRules.forEach(rule => {
      const shouldShow = rule.condition(modelInstance);
      
      if (rule.show !== undefined) {
        (modelInstance as any).__fieldVisibility__ = (modelInstance as any).__fieldVisibility__ || {};
        (modelInstance as any).__fieldVisibility__[rule.field] = rule.show ? shouldShow : !shouldShow;
      }
    });

    setForceUpdate({});
  }, [formService, conditionalRules, forceUpdate]);

  // Применяем field dependencies
  useEffect(() => {
    if (!formService || !formService.model || !fieldDependencies.length) return;

    const modelInstance = formService.model;
    fieldDependencies.forEach(dep => {
      const sourceValue = (modelInstance as any).data?.[dep.sourceField];
      if (sourceValue !== undefined && sourceValue !== null) {
        const transformedValue = dep.transform(sourceValue);
        (modelInstance as any).data[dep.targetField] = transformedValue;
      }
    });

    setForceUpdate({});
  }, [formService, fieldDependencies, forceUpdate]);

  return <ViraForm service={service} model={model} {...props} />;
};

