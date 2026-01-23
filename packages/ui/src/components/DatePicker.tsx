import React, { useState, useRef, useEffect } from "react";
import { DesignProps } from "../types";
import { getDesignClass, mergeDesign, applyDesignClass } from "../utils/design-utils";
import { Input } from "./Input";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";
import { Flex } from "./Flex";
import { Text } from "./Text";

/**
 * DatePicker - Компонент выбора даты с календарём
 * 
 * Поддерживает:
 * - design prop для стилей
 * - календарь с навигацией
 * - выбор диапазона дат (опционально)
 * - локализация (опционально)
 */

export interface DatePickerProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  design?: DesignProps;
  preset?: "default" | "soft" | "outline";
  modelValue?: string;
  onUpdateModelValue?: (value: string) => void;
  showCalendar?: boolean;
  range?: boolean;
  format?: string;
  locale?: string;
}

const MONTHS = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
];

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export const DatePicker: React.FC<DatePickerProps> = ({
  design,
  preset = "default",
  modelValue,
  onUpdateModelValue,
  value: externalValue,
  onChange: externalOnChange,
  showCalendar = true,
  range = false,
  format = "YYYY-MM-DD",
  locale = "ru",
  className,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [internalValue, setInternalValue] = useState<string>("");
  const calendarRef = useRef<HTMLDivElement>(null);

  // Computed value
  let computedValue: string = "";
  if (modelValue !== undefined) {
    computedValue = modelValue;
  } else if (externalValue !== undefined) {
    computedValue = String(externalValue);
  } else {
    computedValue = internalValue;
  }

  // Закрытие календаря при клике вне
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Генерация дней месяца
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Понедельник = 0
  };

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(currentYear, currentMonth, day);
    const formattedDate = formatDate(selectedDate);
    
    setInternalValue(formattedDate);
    
    if (externalOnChange) {
      externalOnChange({ target: { value: formattedDate } } as any);
    }
    
    if (onUpdateModelValue) {
      onUpdateModelValue(formattedDate);
    }
    
    setIsOpen(false);
  };

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const parseDate = (dateString: string): Date | null => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  };

  const selectedDate = parseDate(computedValue);
  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  const days: (number | null)[] = [];

  // Пустые ячейки в начале
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Дни месяца
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const calendarDesign: DesignProps = {
    position: "absolute",
    top: "100%",
    left: 0,
    
    bg: "color.bg.primary",
    border: "1px solid",
    borderColor: "color.bg.tertiary",
    radius: "radius.md",
    shadow: "shadow.lg",
    padding: 3,
    zIndex: 1000,
    minWidth: "280px",
  };

  const headerDesign: DesignProps = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    
  };

  const monthYearDesign: DesignProps = {
    fontSize: "typography.fontSize.lg",
    fontWeight: "typography.fontWeight.semibold",
    color: "color.text.primary",
  };

  const navButtonDesign: DesignProps = {
    padding: 1,
    bg: "transparent",
    border: "none",
    cursor: "pointer",
    color: "color.text.secondary",
    hover: {
      bg: "color.bg.tertiary",
      color: "color.text.primary",
    },
  };

  const weekdayDesign: DesignProps = {
    fontSize: "typography.fontSize.sm",
    fontWeight: "typography.fontWeight.medium",
    color: "color.text.secondary",
    textAlign: "center",
    padding: 2,
  };

  const dayDesign = (day: number): DesignProps => {
    const isSelected = selectedDate &&
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth &&
      selectedDate.getFullYear() === currentYear;
    
    const isToday = new Date().getDate() === day &&
      new Date().getMonth() === currentMonth &&
      new Date().getFullYear() === currentYear;

    return {
      padding: 2,
      cursor: "pointer",
      textAlign: "center",
      fontSize: "typography.fontSize.sm",
      borderRadius: "radius.sm",
      bg: isSelected ? "color.primary" : "transparent",
      color: isSelected ? "color.text.inverse" : (isToday ? "color.primary" : "color.text.primary"),
      fontWeight: isToday ? "typography.fontWeight.semibold" : "typography.fontWeight.normal",
      hover: {
        bg: isSelected ? "color.primary" : "color.bg.tertiary",
      },
    };
  };

  const wrapperDesign: DesignProps = {
    position: "relative",
    width: "100%",
  };

  return (
    <div className={getDesignClass(wrapperDesign)} data-design={JSON.stringify(wrapperDesign)}>
      <Input
        {...props}
        modelValue={modelValue}
        onUpdateModelValue={onUpdateModelValue}
        value={computedValue}
        onChange={externalOnChange}
        type="date"
        design={design}
        className={className}
        onFocus={() => showCalendar && setIsOpen(true)}
        onClick={() => showCalendar && setIsOpen(true)}
        readOnly={showCalendar}
      />

      {showCalendar && isOpen && (
        <div
          ref={calendarRef}
          className={getDesignClass(calendarDesign)}
          data-design={JSON.stringify(calendarDesign)}
        >
          {/* Header с навигацией */}
          <Flex design={headerDesign}>
            <Button
              preset="secondary"
              onClick={handlePrevMonth}
              aria-label="Предыдущий месяц"
              design={navButtonDesign}
            >
              <ChevronLeft size={20} />
            </Button>
            <Text design={monthYearDesign}>
              {MONTHS[currentMonth]} {currentYear}
            </Text>
            <Button
              preset="secondary"
              onClick={handleNextMonth}
              aria-label="Следующий месяц"
              design={navButtonDesign}
            >
              <ChevronRight size={20} />
            </Button>
          </Flex>

          {/* Дни недели */}
          <Flex design={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1,  }}>
            {WEEKDAYS.map(day => (
              <Text key={day} design={weekdayDesign}>
                {day}
              </Text>
            ))}
          </Flex>

          {/* Календарная сетка */}
          <Flex design={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1 }}>
            {days.map((day, index) => (
              day === null ? (
                <div key={index} />
              ) : (
                <Button
                  key={day}
                  preset={selectedDate && selectedDate.getDate() === day && selectedDate.getMonth() === currentMonth && selectedDate.getFullYear() === currentYear ? "primary" : "secondary"}
                  onClick={() => handleDateSelect(day)}
                  aria-label={`Выбрать ${day} ${MONTHS[currentMonth]} ${currentYear}`}
                  design={dayDesign(day)}
                >
                  {day}
                </Button>
              )
            ))}
          </Flex>
        </div>
      )}
    </div>
  );
};

