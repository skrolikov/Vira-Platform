import React from "react";
import { DesignProps } from "../types";
import { mergeDesign, getDesignClass, applyDesignClass } from "../utils/design-utils";
import { Flex } from "./Flex";
import { Text } from "./Text";
import { Check } from "lucide-react";

export interface Step {
  id: string;
  label: string;
  description?: string;
}

export interface StepperProps {
  steps: Step[];
  currentStep: number;
  orientation?: "horizontal" | "vertical";
  design?: DesignProps;
}

/**
 * Stepper - Компонент шагового индикатора
 * 
 * Поддерживает:
 * - Горизонтальную и вертикальную ориентацию
 * - Показ текущего шага
 * - Визуальную индикацию завершенных шагов
 */
export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  orientation = "horizontal",
  design,
}) => {
  const containerDesign: DesignProps = {
    display: "flex",
    flexDirection: orientation === "horizontal" ? "row" : "column",
    gap: 4,
    alignItems: orientation === "horizontal" ? "flex-start" : "stretch",
    ...design,
  };

  const mergedDesign = mergeDesign(containerDesign, design);
  const containerClass = getDesignClass(mergedDesign);

  return (
    <div className={containerClass} data-design={JSON.stringify(mergedDesign)}>
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;
        const isPending = stepNumber > currentStep;

        const stepCircleDesign: DesignProps = {
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "600",
          fontSize: "14px",
          flexShrink: 0,
          ...(isCompleted && {
            bg: "#10b981",
            color: "#ffffff",
          }),
          ...(isCurrent && {
            bg: "#3b82f6",
            color: "#ffffff",
            border: "3px solid #93c5fd",
          }),
          ...(isPending && {
            bg: "#e5e7eb",
            color: "#6b7280",
          }),
        };

        const lineDesign: DesignProps = {
          ...(orientation === "horizontal" && {
            flex: 1,
            height: "2px",
            bg: isCompleted ? "#10b981" : "#e5e7eb",
            marginTop: "19px",
            minWidth: "50px",
          }),
          ...(orientation === "vertical" && {
            width: "2px",
            flex: 1,
            bg: isCompleted ? "#10b981" : "#e5e7eb",
            marginLeft: "19px",
            minHeight: "50px",
          }),
        };

        return (
          <React.Fragment key={step.id}>
            <Flex
              design={{
                flexDirection: orientation === "horizontal" ? "column" : "row",
                alignItems: orientation === "horizontal" ? "flex-start" : "flex-start",
                gap: 2,
              }}
            >
              <div
                className={getDesignClass(stepCircleDesign)}
                data-design={JSON.stringify(stepCircleDesign)}
              >
                {isCompleted ? (
                  <Check size={20} />
                ) : (
                  <Text
                    design={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: stepCircleDesign.color as string,
                    }}
                  >
                    {stepNumber}
                  </Text>
                )}
              </div>
              <Flex
                design={{
                  flexDirection: "column",
                  gap: 1,
                  ...(orientation === "vertical" && { marginTop: 0 }),
                }}
              >
                <Text
                  design={{
                    fontSize: "14px",
                    fontWeight: isCurrent ? "600" : "500",
                    color: isCurrent ? "#111827" : isCompleted ? "#6b7280" : "#9ca3af",
                  }}
                >
                  {step.label}
                </Text>
                {step.description && (
                  <Text
                    design={{
                      fontSize: "12px",
                      color: "#6b7280",
                    }}
                  >
                    {step.description}
                  </Text>
                )}
              </Flex>
            </Flex>
            {index < steps.length - 1 && (
              <div
                className={getDesignClass(lineDesign)}
                data-design={JSON.stringify(lineDesign)}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

