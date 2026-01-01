import React, { useState, useCallback } from "react";
import type { DesignProps } from "@vira-ui/ui";
import { mergeDesign, getDesignClass, applyDesignClass, Flex, Heading, Text, Button } from "@vira-ui/ui";
import type { ViraComponentProps } from "@vira-ui/core";
import { ViraForm, type ViraFormProps } from "./ViraForm";

/**
 * ViraMultiStepForm - Многошаговая форма
 * Поддержка multi-step форм для сложных сценариев
 */

export interface FormStep {
  id: string;
  title: string;
  description?: string;
  model?: any; // ModelDefinition для этого шага
  component?: React.ComponentType<any>; // Кастомный компонент шага
  validateBeforeNext?: (model: any) => boolean | Promise<boolean>;
}

export interface ViraMultiStepFormProps extends Omit<ViraFormProps, "model">, ViraComponentProps {
  steps: FormStep[];
  service: string;
  onComplete?: (data: Record<string, any>) => void | Promise<void>;
  showProgress?: boolean;
  showStepNumbers?: boolean;
}

export const ViraMultiStepForm: React.FC<ViraMultiStepFormProps> = ({
  steps,
  service,
  onComplete,
  showProgress = true,
  showStepNumbers = true,
  design,
  className,
  ...props
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepData, setStepData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentStepConfig = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = useCallback(async () => {
    // Валидация перед переходом
    if (currentStepConfig.validateBeforeNext) {
      const isValid = await currentStepConfig.validateBeforeNext(stepData);
      if (!isValid) {
        setErrors({ [currentStepConfig.id]: "Заполните все обязательные поля" });
        return;
      }
    }

    if (isLastStep) {
      // Завершение формы
      if (onComplete) {
        await onComplete(stepData);
      }
    } else {
      // Переход к следующему шагу
      setCurrentStep(prev => prev + 1);
      setErrors({});
    }
  }, [currentStep, currentStepConfig, stepData, isLastStep, onComplete]);

  const handlePrevious = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
      setErrors({});
    }
  }, [isFirstStep]);

  const handleStepChange = useCallback((stepId: string) => {
    const stepIndex = steps.findIndex(s => s.id === stepId);
    if (stepIndex !== -1 && stepIndex <= currentStep) {
      setCurrentStep(stepIndex);
      setErrors({});
    }
  }, [steps, currentStep]);

  const containerDesign: DesignProps = {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    ...design,
  };

  const mergedDesign = mergeDesign(containerDesign, design);
  const designClass = getDesignClass(mergedDesign);
  const finalClassName = applyDesignClass(className, designClass);

  return (
    <div className={finalClassName} data-design={JSON.stringify(mergedDesign)}>
      {/* Progress Bar */}
      {showProgress && (
        <Flex design={{ flexDirection: "column", gap: 1, marginBottom: 6 }}>
          <div
            className={getDesignClass({
              width: "100%",
              height: "4px",
              bg: "color.bg.tertiary",
              radius: "radius.sm",
              overflow: "hidden",
            })}
          >
            <div
              className={getDesignClass({
                width: `${progress}%`,
                height: "100%",
                bg: "color.primary",
                transition: "width 0.3s ease",
              })}
            />
          </div>
          <Text
            design={{
              fontSize: "typography.fontSize.sm",
              color: "color.text.secondary",
              marginTop: 1,
              textAlign: "center",
            }}
          >
            Шаг {currentStep + 1} из {steps.length}
          </Text>
        </Flex>
      )}

      {/* Step Navigation */}
      <Flex design={{ gap: 2, marginBottom: 4, flexWrap: "wrap" }}>
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isDisabled = index > currentStep;
          
          return (
            <Button
              key={step.id}
              preset={isActive ? "primary" : "secondary"}
              onClick={() => handleStepChange(step.id)}
              disabled={isDisabled}
              design={{
                opacity: isDisabled ? 0.5 : 1,
                cursor: isDisabled ? "not-allowed" : "pointer",
              }}
            >
              {showStepNumbers && (
                <Text design={{ marginRight: 2, display: "inline" }}>
                  {index + 1}.
                </Text>
              )}
              {step.title}
            </Button>
          );
        })}
      </Flex>

      {/* Current Step Content */}
      <Flex design={{ flexDirection: "column", gap: 2 }}>
        <Heading level={3} design={{ marginBottom: 1 }}>
          {currentStepConfig.title}
        </Heading>
        {currentStepConfig.description && (
          <Text design={{ color: "color.text.secondary", marginBottom: 4 }}>
            {currentStepConfig.description}
          </Text>
        )}

        {errors[currentStepConfig.id] && (
          <Flex
            design={{
              padding: 3,
              bg: "color.danger",
              color: "color.text.inverse",
              radius: "radius.md",
              marginBottom: 4,
            }}
          >
            <Text design={{ color: "color.text.inverse" }}>
              {errors[currentStepConfig.id]}
            </Text>
          </Flex>
        )}

        {currentStepConfig.component ? (
          <currentStepConfig.component
            service={service}
            data={stepData}
            onChange={(data: any) => setStepData(prev => ({ ...prev, ...data }))}
          />
        ) : currentStepConfig.model ? (
          <ViraForm
            service={service}
            model={currentStepConfig.model}
            layout="vertical"
            {...props}
          />
        ) : (
          <Text design={{ color: "color.text.secondary" }}>
            Контент шага не определен
          </Text>
        )}
      </Flex>

      {/* Navigation Buttons */}
      <Flex design={{ gap: 2, justifyContent: "space-between", marginTop: 4 }}>
        <Button
          onClick={handlePrevious}
          preset="secondary"
          disabled={isFirstStep}
        >
          Назад
        </Button>
        <Button
          onClick={handleNext}
          preset="primary"
        >
          {isLastStep ? "Завершить" : "Далее"}
        </Button>
      </Flex>
    </div>
  );
};

