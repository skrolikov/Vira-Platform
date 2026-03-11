import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { DesignProps } from "../types";
import { mergeDesign, getDesignClass, applyDesignClass, getDataDesignAttribute } from "../utils/design-utils";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, X } from "lucide-react";
import { Card } from "./Card";
import { Flex } from "./Flex";
import { Text } from "./Text";
import { Button } from "./Button";
import { Grid } from "./Grid";
import { EffectCard } from "./EffectCard";
import { Input } from "./Input";
import { Popover } from "./Popover";
import { useIsMobile } from "../utils/useMediaQuery";

export interface QuickFilter {
  label: string;
  getValue?: () => Date; // For single date mode
  getRangeValue?: () => { from: Date; to: Date }; // For range mode
}

export interface DateTimeRange {
  from: string;
  to: string;
}

export interface DateTimePickerProps {
  value?: string | DateTimeRange; // Local date string (YYYY-MM-DD or YYYY-MM-DDTHH:MM) or range object
  onChange?: (value: string | DateTimeRange) => void;
  placeholder?: string;
  time?: boolean; // Show time picker
  calendar?: boolean; // Show calendar
  filters?: boolean; // Show quick filters
  quickFilters?: QuickFilter[]; // Custom quick filters (if not provided, uses default)
  mode?: 'date' | 'datetime' | 'time' | 'range'; // Mode selection
  design?: DesignProps;
  className?: string;
  disabled?: boolean;
}

const quickFilters: QuickFilter[] = [
  { label: 'Сегодня', getValue: () => new Date() },
  { label: 'Вчера', getValue: () => { const d = new Date(); d.setDate(d.getDate() - 1); return d; } },
  { label: 'Неделя назад', getValue: () => { const d = new Date(); d.setDate(d.getDate() - 7); return d; } },
  { label: 'Месяц назад', getValue: () => { const d = new Date(); d.setMonth(d.getMonth() - 1); return d; } },
  { label: 'Год назад', getValue: () => { const d = new Date(); d.setFullYear(d.getFullYear() - 1); return d; } },
  { label: 'Начало месяца', getValue: () => { const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0); return d; } },
  { label: 'Начало года', getValue: () => { const d = new Date(); d.setMonth(0, 1); d.setHours(0, 0, 0, 0); return d; } },
];

const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

// Parse local date string (YYYY-MM-DD or YYYY-MM-DDTHH:MM) to Date object
const parseLocalDate = (value: string): Date => {
  if (!value) return new Date();

  if (value.length === 10) {
    // YYYY-MM-DD
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day, 0, 0, 0);
  }

  if (value.includes('T')) {
    // YYYY-MM-DDTHH:MM
    const [datePart, timePart] = value.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);
    return new Date(year, month - 1, day, hours, minutes, 0);
  }

  return new Date(value);
};

// Format Date to local string (YYYY-MM-DD or YYYY-MM-DDTHH:MM)
const formatLocalDate = (date: Date, includeTime: boolean): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  if (includeTime) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  return `${year}-${month}-${day}`;
};

// Format Date for display (DD.MM.YYYY or DD.MM.YYYY HH:MM)
const formatDisplayValue = (date: Date | null, includeTime: boolean): string => {
  if (!date) return '';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  if (includeTime) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  }

  return `${day}.${month}.${year}`;
};

// Format range for display
const formatRangeDisplayValue = (range: DateTimeRange | null): string => {
  if (!range || !range.from || !range.to) return '';
  const fromDate = parseLocalDate(range.from);
  const toDate = parseLocalDate(range.to);
  return `${formatDisplayValue(fromDate, false)} - ${formatDisplayValue(toDate, false)}`;
};

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  onChange,
  placeholder = 'Выберите дату',
  time = false,
  calendar = true,
  filters = false,
  quickFilters: customQuickFilters,
  mode = 'date',
  design,
  className,
  disabled = false,
}) => {
  const isRangeMode = mode === 'range';
  const isMobile = useIsMobile();
  
  const [isOpen, setIsOpen] = useState(false);

  // Parse initial value
  const parseValue = useCallback(() => {
    if (isRangeMode) {
      if (typeof value === 'object' && value !== null && 'from' in value && 'to' in value) {
        return {
          fromDate: parseLocalDate(value.from),
          toDate: parseLocalDate(value.to),
        };
      }
      return {
        fromDate: new Date(),
        toDate: new Date(),
      };
    } else {
      const date = typeof value === 'string' ? parseLocalDate(value) : new Date();
      return { selectedDate: date };
    }
  }, [value, isRangeMode]);

  const initialValue = parseValue();
  
  const [selectedDate, setSelectedDate] = useState<Date>(isRangeMode ? new Date() : (initialValue as any).selectedDate || new Date());
  const [fromDate, setFromDate] = useState<Date>(isRangeMode ? (initialValue as any).fromDate || new Date() : new Date());
  const [toDate, setToDate] = useState<Date>(isRangeMode ? (initialValue as any).toDate || new Date() : new Date());
  const [selectingFrom, setSelectingFrom] = useState(true); // For range mode: which date is being selected

  const [viewMonth, setViewMonth] = useState<number>(selectedDate.getMonth());
  const [viewYear, setViewYear] = useState<number>(selectedDate.getFullYear());
  const [viewMonthTo, setViewMonthTo] = useState<number>(() => {
    const toMonth = isRangeMode ? toDate.getMonth() : new Date(viewYear, viewMonth + 1, 1).getMonth();
    return toMonth;
  });
  const [viewYearTo, setViewYearTo] = useState<number>(() => {
    const toYear = isRangeMode ? toDate.getFullYear() : new Date(viewYear, viewMonth + 1, 1).getFullYear();
    return toYear;
  });

  // Update when value changes externally
  useEffect(() => {
    if (isRangeMode) {
      if (typeof value === 'object' && value !== null && 'from' in value && 'to' in value) {
        setFromDate(parseLocalDate(value.from));
        setToDate(parseLocalDate(value.to));
      }
    } else {
      if (typeof value === 'string' && value) {
        const newDate = parseLocalDate(value);
        setSelectedDate(newDate);
        setViewMonth(newDate.getMonth());
        setViewYear(newDate.getFullYear());
      }
    }
  }, [value, isRangeMode]);


  const handleDateSelect = useCallback((date: Date, calendarSide: 'left' | 'right' = 'left') => {
    if (isRangeMode) {
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
      
      let newFrom = fromDate;
      let newTo = toDate;
      let newSelectingFrom = selectingFrom;

      if (selectingFrom) {
        newFrom = dateOnly;
        newSelectingFrom = false;
        // If toDate is before new fromDate, update toDate
        if (toDate < dateOnly) {
          newTo = dateOnly;
        }
      } else {
        newTo = dateOnly;
        // If toDate is before fromDate, swap them
        if (dateOnly < fromDate) {
          newFrom = dateOnly;
          newTo = fromDate;
          newSelectingFrom = false;
        } else {
          newSelectingFrom = true;
          // Close if both dates are selected
          setIsOpen(false);
        }
      }

      setFromDate(newFrom);
      setToDate(newTo);
      setSelectingFrom(newSelectingFrom);

      if (onChange) {
        onChange({ from: formatLocalDate(newFrom, false), to: formatLocalDate(newTo, false) });
      }
    } else {
      // Preserve time, only change date
      const newDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        selectedDate.getHours(),
        selectedDate.getMinutes(),
        0,
        0
      );

      setSelectedDate(newDate);

      if (onChange) {
        const includeTime = mode === 'datetime' || time;
        onChange(formatLocalDate(newDate, includeTime));
      }

      if (!time && mode !== 'datetime') {
        setIsOpen(false);
      }
    }
  }, [selectedDate, mode, time, onChange, isRangeMode, selectingFrom, fromDate, toDate]);

  const handleQuickFilter = useCallback((filter: QuickFilter) => {
    if (isRangeMode) {
      if (filter.getRangeValue) {
        const range = filter.getRangeValue();
        setFromDate(range.from);
        setToDate(range.to);
        setSelectingFrom(true);
        if (onChange) {
          onChange({
            from: formatLocalDate(range.from, false),
            to: formatLocalDate(range.to, false),
          });
        }
        setIsOpen(false);
      }
    } else {
      if (filter.getValue) {
        const date = filter.getValue();
        handleDateSelect(date);
      }
    }
  }, [handleDateSelect, isRangeMode, onChange]);

  const handleTimeChange = useCallback((hours: number, minutes: number) => {
    if (isRangeMode) return; // No time for range mode
    
    // Preserve date, only change time
    const newDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      hours,
      minutes,
      0,
      0
    );

    setSelectedDate(newDate);

    if (onChange) {
      const includeTime = mode === 'datetime' || time;
      onChange(formatLocalDate(newDate, includeTime));
    }
  }, [selectedDate, mode, time, onChange, isRangeMode]);

  // Calendar days for single calendar
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);

    let firstDayOfWeek = firstDay.getDay();
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    const days: Array<{ date: Date; isCurrentMonth: boolean; isToday: boolean; isSelected: boolean; isInRange?: boolean; isRangeStart?: boolean; isRangeEnd?: boolean }> = [];

    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(viewYear, viewMonth, -i),
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (isRangeMode) {
      const fromDateOnly = new Date(fromDate);
      fromDateOnly.setHours(0, 0, 0, 0);
      const toDateOnly = new Date(toDate);
      toDateOnly.setHours(0, 0, 0, 0);

      for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(viewYear, viewMonth, day);
        const dateOnly = new Date(date);
        dateOnly.setHours(0, 0, 0, 0);

        const isInRange = dateOnly >= fromDateOnly && dateOnly <= toDateOnly;
        const isRangeStart = dateOnly.getTime() === fromDateOnly.getTime();
        const isRangeEnd = dateOnly.getTime() === toDateOnly.getTime();

        days.push({
          date,
          isCurrentMonth: true,
          isToday: dateOnly.getTime() === today.getTime(),
          isSelected: isRangeStart || isRangeEnd,
          isInRange,
          isRangeStart,
          isRangeEnd,
        });
      }
    } else {
      const selectedDateOnly = new Date(selectedDate);
      selectedDateOnly.setHours(0, 0, 0, 0);

      for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(viewYear, viewMonth, day);
        const dateOnly = new Date(date);
        dateOnly.setHours(0, 0, 0, 0);

        days.push({
          date,
          isCurrentMonth: true,
          isToday: dateOnly.getTime() === today.getTime(),
          isSelected: dateOnly.getTime() === selectedDateOnly.getTime(),
        });
      }
    }

    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: new Date(viewYear, viewMonth + 1, day),
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
      });
    }

    return days;
  }, [viewYear, viewMonth, selectedDate, isRangeMode, fromDate, toDate]);

  // Calendar days for second calendar (range mode)
  const calendarDaysTo = useMemo(() => {
    if (!isRangeMode) return [];

    const firstDay = new Date(viewYearTo, viewMonthTo, 1);
    const lastDay = new Date(viewYearTo, viewMonthTo + 1, 0);

    let firstDayOfWeek = firstDay.getDay();
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    const days: Array<{ date: Date; isCurrentMonth: boolean; isToday: boolean; isSelected: boolean; isInRange?: boolean; isRangeStart?: boolean; isRangeEnd?: boolean }> = [];

    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(viewYearTo, viewMonthTo, -i),
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const fromDateOnly = new Date(fromDate);
    fromDateOnly.setHours(0, 0, 0, 0);
    const toDateOnly = new Date(toDate);
    toDateOnly.setHours(0, 0, 0, 0);

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(viewYearTo, viewMonthTo, day);
      const dateOnly = new Date(date);
      dateOnly.setHours(0, 0, 0, 0);

      const isInRange = dateOnly >= fromDateOnly && dateOnly <= toDateOnly;
      const isRangeStart = dateOnly.getTime() === fromDateOnly.getTime();
      const isRangeEnd = dateOnly.getTime() === toDateOnly.getTime();

      days.push({
        date,
        isCurrentMonth: true,
        isToday: dateOnly.getTime() === today.getTime(),
        isSelected: isRangeStart || isRangeEnd,
        isInRange,
        isRangeStart,
        isRangeEnd,
      });
    }

    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: new Date(viewYearTo, viewMonthTo + 1, day),
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
      });
    }

    return days;
  }, [viewYearTo, viewMonthTo, isRangeMode, fromDate, toDate]);

  const previousMonth = useCallback(() => {
    setViewMonth(viewMonth === 0 ? 11 : viewMonth - 1);
    if (viewMonth === 0) setViewYear(viewYear - 1);
  }, [viewMonth, viewYear]);

  const nextMonth = useCallback(() => {
    setViewMonth(viewMonth === 11 ? 0 : viewMonth + 1);
    if (viewMonth === 11) setViewYear(viewYear + 1);
  }, [viewMonth, viewYear]);

  const previousMonthTo = useCallback(() => {
    setViewMonthTo(viewMonthTo === 0 ? 11 : viewMonthTo - 1);
    if (viewMonthTo === 0) setViewYearTo(viewYearTo - 1);
  }, [viewMonthTo, viewYearTo]);

  const nextMonthTo = useCallback(() => {
    setViewMonthTo(viewMonthTo === 11 ? 0 : viewMonthTo + 1);
    if (viewMonthTo === 11) setViewYearTo(viewYearTo + 1);
  }, [viewMonthTo, viewYearTo]);

  const displayValue = useMemo(() => {
    if (isRangeMode) {
      if (typeof value === 'object' && value !== null && 'from' in value && 'to' in value) {
        return formatRangeDisplayValue(value);
      }
      return '';
    } else {
      if (typeof value === 'string' && value) {
        return formatDisplayValue(parseLocalDate(value), mode === 'datetime' || time);
      }
      return '';
    }
  }, [value, isRangeMode, mode, time]);

  const pickerWidth = useMemo(() => {
    if (isMobile) {
      // На мобилке используем почти всю ширину экрана с небольшими отступами
      return "calc(100vw - 32px)";
    }
    return isRangeMode 
      ? (filters ? "1000px" : "640px")
      : (filters ? "750px" : calendar && (time || mode === 'datetime') ? "520px" : "320px");
  }, [isMobile, isRangeMode, filters, calendar, time, mode]);

  // Use custom filters if provided, otherwise use default
  const activeQuickFilters = customQuickFilters || quickFilters;

  const inputDesign: DesignProps = {
    cursor: disabled ? "not-allowed" : "pointer",
    width: "100%",
    ...design,
  };

  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onChange) {
      if (isRangeMode) {
        onChange({ from: '', to: '' });
      } else {
        onChange('');
      }
    }
  }, [onChange, isRangeMode]);

  const renderCalendar = useCallback((
    year: number,
    month: number,
    days: Array<{ date: Date; isCurrentMonth: boolean; isToday: boolean; isSelected: boolean; isInRange?: boolean; isRangeStart?: boolean; isRangeEnd?: boolean }>,
    onPrevMonth: () => void,
    onNextMonth: () => void,
    onDateSelect: (date: Date) => void
  ) => (
    <Card design={{ flex: 1, padding: isMobile ? 2 : 3, flexDirection: 'column', gap: 2, minWidth: isMobile ? '100%' : '280px' }}>
      <Flex design={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Button preset="ghost" onClick={onPrevMonth} design={{ width: '32px', height: '32px', padding: 1 }}>
          <ChevronLeft size={18} />
        </Button>
        <Text design={{ fontWeight: 'var(--typography-fontWeight-semibold)', fontSize: 'typography.fontSize.md' }}>
          {monthNames[month]} {year}
        </Text>
        <Button preset="ghost" onClick={onNextMonth} design={{ width: '32px', height: '32px', padding: 1 }}>
          <ChevronRight size={18} />
        </Button>
      </Flex>

      <Grid columns="repeat(7, 1fr)" gap="4px">
        {weekDays.map((day) => (
          <Text key={day} design={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 'var(--typography-fontWeight-semibold)', opacity: 0.6, padding: 1 }}>
            {day}
          </Text>
        ))}
      </Grid>

      <Grid columns="repeat(7, 1fr)" gap={isMobile ? "2px" : "4px"}>
        {days.map((day, index) => {
          const isSelected = day.isSelected;
          const isInRange = day.isInRange || false;
          const isRangeStart = day.isRangeStart || false;
          const isRangeEnd = day.isRangeEnd || false;

          return (
            <Button
              key={index}
              preset={isSelected ? "primary" : "ghost"}
              onClick={() => onDateSelect(day.date)}
              design={{
                padding: isMobile ? 1 : 2,
                fontSize: isMobile ? '0.75rem' : '0.875rem',
                fontWeight: isSelected ? '600' : '400',
                opacity: day.isCurrentMonth ? 1 : 0.3,
                bg: isSelected
                  ? 'color.primary'
                  : isInRange
                  ? 'color.bg.tertiary'
                  : day.isToday
                  ? 'color.bg.tertiary'
                  : 'transparent',
                color: isSelected ? 'white' : 'color.text.primary',
                minWidth: isMobile ? '32px' : '36px',
                height: isMobile ? '32px' : '36px',
              }}
            >
              {day.date.getDate()}
            </Button>
          );
        })}
      </Grid>
    </Card>
  ), [isMobile]);

  const pickerContent = (
    <EffectCard
      design={{
        minWidth: pickerWidth,
        maxWidth: pickerWidth,
        maxHeight: isMobile ? '90vh' : undefined,
        overflowY: isMobile ? 'auto' : undefined,
      }}
    >
      <Card design={{bg: 'transparent', padding: 0}}>
        <Flex design={{ flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 2 : 0 }}>
          {filters && (
            <Card
              design={{
                width: isMobile ? '100%' : '160px',
                padding: 3,
                flexDirection: 'column',
                gap: 1,
              }}
            >
              <Text design={{ fontSize: '0.7rem', fontWeight: 'var(--typography-fontWeight-semibold)', opacity: 0.7,  letterSpacing: '0.05em' }}>
                БЫСТРЫЙ ВЫБОР
              </Text>
              {isMobile ? (
                <Grid columns="repeat(2, 1fr)" gap="8px">
                  {activeQuickFilters.map((filter) => (
                    <Button
                      key={filter.label}
                      preset="ghost"
                      onClick={() => handleQuickFilter(filter)}
                      design={{
                        justifyContent: 'center',
                        fontSize: '0.875rem',
                        padding: '8px 12px',
                      }}
                    >
                      {filter.label}
                    </Button>
                  ))}
                </Grid>
              ) : (
                activeQuickFilters.map((filter) => (
                  <Button
                    key={filter.label}
                    preset="ghost"
                    onClick={() => handleQuickFilter(filter)}
                    design={{
                      justifyContent: 'flex-start',
                      fontSize: '0.875rem',
                      padding: '8px 12px',
                    }}
                  >
                    {filter.label}
                  </Button>
                ))
              )}
            </Card>
          )}

          {calendar && !isRangeMode && (
            renderCalendar(
              viewYear,
              viewMonth,
              calendarDays,
              previousMonth,
              nextMonth,
              (date) => handleDateSelect(date)
            )
          )}

          {calendar && isRangeMode && (
            <Flex design={{ flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 2 : 0, flex: 1 }}>
              {renderCalendar(
                viewYear,
                viewMonth,
                calendarDays,
                previousMonth,
                nextMonth,
                (date) => handleDateSelect(date, 'left')
              )}
              {renderCalendar(
                viewYearTo,
                viewMonthTo,
                calendarDaysTo,
                previousMonthTo,
                nextMonthTo,
                (date) => handleDateSelect(date, 'right')
              )}
            </Flex>
          )}

          {(time || mode === 'datetime') && !isRangeMode && (
            <Card
              design={{
                width: isMobile ? '100%' : '140px',
                padding: 3,
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <Text design={{ fontSize: '0.7rem', fontWeight: 'var(--typography-fontWeight-semibold)', opacity: 0.7, textAlign: 'center', letterSpacing: '0.05em' }}>
                ВРЕМЯ
              </Text>

              <Flex design={{ gap: 2, alignItems: 'flex-start', justifyContent: 'center' }}>
                <Flex design={{ flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <Flex
                    design={{
                      height: isMobile ? '150px' : '200px',
                      width: isMobile ? '60px' : '50px',
                      overflowY: 'auto',
                      position: 'relative',
                      bg: 'color.bg.tertiary',
                      radius: 'radius.md',
                      flexDirection: 'column',
                    }}
                  >
                    {Array.from({ length: 24 }, (_, i) => i).map((hour) => {
                      const isSelected = hour === selectedDate.getHours();
                      return (
                        <Button
                          key={hour}
                          preset="ghost"
                          onClick={() => handleTimeChange(hour, selectedDate.getMinutes())}
                          design={{
                            width: '100%',
                            height: isMobile ? '36px' : '32px',
                            padding: 0,
                            fontSize: isSelected ? (isMobile ? '1.2rem' : '1.1rem') : (isMobile ? '1rem' : '0.875rem'),
                            fontWeight: isSelected ? '600' : '400',
                            color: isSelected ? 'color.primary' : 'color.text.primary',
                            opacity: isSelected ? 1 : 0.5,
                            flexShrink: 0,
                            justifyContent: 'center',
                          }}
                        >
                          {String(hour).padStart(2, '0')}
                        </Button>
                      );
                    })}

                    <Flex design={{ height: isMobile ? '60px' : '84px', flexShrink: 0 }} />
                  </Flex>
                  <Text design={{ fontSize: '0.7rem', opacity: 0.7 }}>Часы</Text>
                </Flex>

                <Text design={{ fontSize: isMobile ? '2rem' : '1.5rem', fontWeight: '300', opacity: 0.3,  }}>:</Text>

                <Flex design={{ flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <Flex
                    design={{
                      height: isMobile ? '150px' : '200px',
                      width: isMobile ? '60px' : '50px',
                      overflowY: 'auto',
                      position: 'relative',
                      bg: 'color.bg.tertiary',
                      radius: 'radius.md',
                      flexDirection: 'column',
                    }}
                  >

                    {Array.from({ length: 60 }, (_, i) => i).map((minute) => {
                      const isSelected = minute === selectedDate.getMinutes();
                      return (
                        <Button
                          key={minute}
                          preset="ghost"
                          onClick={() => handleTimeChange(selectedDate.getHours(), minute)}
                          design={{
                            width: '100%',
                            height: isMobile ? '36px' : '32px',
                            padding: 0,
                            fontSize: isSelected ? (isMobile ? '1.2rem' : '1.1rem') : (isMobile ? '1rem' : '0.875rem'),
                            fontWeight: isSelected ? '600' : '400',
                            color: isSelected ? 'color.primary' : 'color.text.primary',
                            opacity: isSelected ? 1 : 0.5,
                            flexShrink: 0,
                            justifyContent: 'center',
                          }}
                        >
                          {String(minute).padStart(2, '0')}
                        </Button>
                      );
                    })}

                    <Flex design={{ height: isMobile ? '60px' : '84px', flexShrink: 0 }} />
                  </Flex>
                  <Text design={{ fontSize: '0.7rem', opacity: 0.7 }}>Минуты</Text>
                </Flex>
              </Flex>
            </Card>
          )}
        </Flex>
      </Card>
    </EffectCard>
  );

  return (
    <Popover
      isOpen={isOpen}
      onOpenChange={(open) => !disabled && setIsOpen(open)}
      trigger="click"
      placement={isMobile ? "bottom" : "bottom-start"}
      content={pickerContent}
    >
      <Flex design={{ width: '100%', position: 'relative' }}>
        <Input
          readOnly
          value={displayValue}
          placeholder={placeholder}
          disabled={disabled}
          design={inputDesign}
          className={className}
        />
        <Flex
          design={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            alignItems: 'center',
            gap: 1,
            pointerEvents: 'none',
          }}
        >
          {value && !disabled && (
            <Flex
              design={{
                cursor: 'pointer',
                opacity: 0.6,
                alignItems: 'center',
                hover: { opacity: 1 },
                pointerEvents: 'auto',
              }}
              onClick={handleClear}
            >
              <X size={16} />
            </Flex>
          )}
          {time || mode === 'datetime' ? <Clock size={18} /> : <CalendarIcon size={18} />}
        </Flex>
      </Flex>
    </Popover>
  );
};
