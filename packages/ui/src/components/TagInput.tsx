import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Box } from './Box';
import { Flex } from './Flex';
import { Input } from './Input';
import { Tag } from './Tag';
import { Text } from './Text';
import { Card } from './Card';
import { Button } from './Button';

export interface TagInputProps {
  /**
   * Текущее значение (для single mode - строка, для multiple - массив строк)
   */
  value: string | string[];
  
  /**
   * Callback при изменении значения
   */
  onChange: (value: string | string[]) => void;
  
  /**
   * Режим: single (один тег) или multiple (несколько тегов)
   */
  mode?: 'single' | 'multiple';
  
  /**
   * Placeholder
   */
  placeholder?: string;
  
  /**
   * Список предложений для автодополнения
   */
  suggestions?: string[];
  
  /**
   * Callback для сохранения нового значения в БД
   */
  onCreateNew?: (value: string) => Promise<void> | void;
  
  /**
   * Разделитель для множественных тегов (по умолчанию запятая)
   */
  separator?: string;
  
  /**
   * Автоматически добавлять разделитель при нажатии Enter (только для multiple mode)
   */
  autoSeparator?: boolean;
  
  /**
   * Disabled state
   */
  disabled?: boolean;
  
  /**
   * CSS класс
   */
  className?: string;
  
  /**
   * Design props для кастомизации
   */
  design?: any;
}

export const TagInput: React.FC<TagInputProps> = ({
  value,
  onChange,
  mode = 'single',
  placeholder = 'Введите значение...',
  suggestions = [],
  onCreateNew,
  separator = ',',
  autoSeparator = false,
  disabled = false,
  className = '',
  design,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const suggestionsListRef = useRef<HTMLDivElement>(null);
  const suggestionItemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const isClickingSuggestionRef = useRef(false);

  // Нормализуем value к массиву для удобства работы
  const tags = useMemo(() => {
    if (mode === 'multiple') {
      return Array.isArray(value) ? value : value ? [value] : [];
    }
    return value ? [value as string] : [];
  }, [mode, value]);

  // Фильтруем suggestions при изменении input
  useEffect(() => {
    if (inputValue.trim()) {
      const tagsArray = mode === 'multiple' 
        ? (Array.isArray(value) ? value : value ? [value] : [])
        : (value ? [value as string] : []);
      
      const filtered = suggestions.filter(s =>
        s.toLowerCase().includes(inputValue.toLowerCase()) &&
        !tagsArray.includes(s)
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setSelectedIndex(-1); // Сбрасываем выбор при изменении фильтра
      // Очищаем и инициализируем refs для новых элементов
      suggestionItemRefs.current = new Array(filtered.length).fill(null);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
      setSelectedIndex(-1);
      suggestionItemRefs.current = [];
    }
  }, [inputValue, suggestions, mode, value]);

  // Скроллим к выбранному элементу
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionItemRefs.current[selectedIndex]) {
      const element = suggestionItemRefs.current[selectedIndex];
      if (element && suggestionsListRef.current) {
        const container = suggestionsListRef.current;
        const elementTop = element.offsetTop;
        const elementBottom = elementTop + element.offsetHeight;
        const containerTop = container.scrollTop;
        const containerBottom = containerTop + container.offsetHeight;

        if (elementTop < containerTop) {
          container.scrollTop = elementTop;
        } else if (elementBottom > containerBottom) {
          container.scrollTop = elementBottom - container.offsetHeight;
        }
      }
    }
  }, [selectedIndex]);

  // Закрываем popover при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addTag = async (tag: string) => {
    const trimmedTag = tag.trim();
    if (!trimmedTag) return;

    // Проверяем, существует ли тег в suggestions
    const isExisting = suggestions.includes(trimmedTag);
    
    // Если тега нет в suggestions, сохраняем в БД
    if (!isExisting && onCreateNew) {
      await onCreateNew(trimmedTag);
    }

    if (mode === 'single') {
      onChange(trimmedTag);
    } else {
      if (!tags.includes(trimmedTag)) {
        onChange([...tags, trimmedTag]);
      }
    }

    setInputValue('');
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const removeTag = (indexToRemove: number) => {
    if (mode === 'single') {
      onChange('');
    } else {
      const newTags = tags.filter((_, index) => index !== indexToRemove);
      onChange(newTags);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      
      if (selectedIndex >= 0 && filteredSuggestions[selectedIndex]) {
        // Выбираем suggestion из списка
        addTag(filteredSuggestions[selectedIndex]);
      } else if (inputValue.trim()) {
        // Добавляем введенное значение
        addTag(inputValue);
        
        // Автоматически добавляем разделитель для multiple mode
        if (mode === 'multiple' && autoSeparator) {
          setTimeout(() => {
            setInputValue('');
          }, 0);
        }
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (showSuggestions && filteredSuggestions.length > 0) {
        setSelectedIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
      } else if (inputValue.trim() && suggestions.length > 0) {
        // Показываем suggestions при первом нажатии стрелки вниз
        const tagsArray = mode === 'multiple' 
          ? (Array.isArray(value) ? value : value ? [value] : [])
          : (value ? [value as string] : []);
        
        const filtered = suggestions.filter(s =>
          s.toLowerCase().includes(inputValue.toLowerCase()) &&
          !tagsArray.includes(s)
        );
        if (filtered.length > 0) {
          setFilteredSuggestions(filtered);
          setShowSuggestions(true);
          setSelectedIndex(0);
        }
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (showSuggestions && filteredSuggestions.length > 0) {
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
      }
    } else if (e.key === 'Home' && showSuggestions && filteredSuggestions.length > 0) {
      e.preventDefault();
      setSelectedIndex(0);
    } else if (e.key === 'End' && showSuggestions && filteredSuggestions.length > 0) {
      e.preventDefault();
      setSelectedIndex(filteredSuggestions.length - 1);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      // Удаляем последний тег при Backspace, если input пустой
      removeTag(tags.length - 1);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
      const input = containerRef.current?.querySelector('input');
      input?.blur();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Убираем автоматическое разделение по запятой
    // Пользователь может вводить запятые как часть значения
    setInputValue(newValue);
    setSelectedIndex(-1);
  };

  const handleSuggestionClick = (suggestion: string) => {
    isClickingSuggestionRef.current = true;
    addTag(suggestion);
    const input = containerRef.current?.querySelector('input');
    input?.focus();
    setTimeout(() => {
      isClickingSuggestionRef.current = false;
    }, 300);
  };

  // Автоматически добавляем тег при потере фокуса, если есть введенное значение
  const handleBlur = useCallback(() => {
    // Небольшая задержка, чтобы onClick на suggestion успел сработать
    setTimeout(async () => {
      // Если был клик на suggestion, не добавляем тег при blur
      if (isClickingSuggestionRef.current) {
        return;
      }
      
      const trimmedValue = inputValue.trim();
      
      if (trimmedValue) {
        // Получаем актуальные теги
        const currentTags = mode === 'multiple'
          ? (Array.isArray(value) ? value : value ? [value] : [])
          : (value ? [value as string] : []);
        
        // Проверяем, есть ли точное совпадение в suggestions
        const exactMatch = suggestions.find(
          s => s.toLowerCase() === trimmedValue.toLowerCase()
        );
        
        if (exactMatch && !currentTags.includes(exactMatch)) {
          // Если есть точное совпадение, используем его
          const isExisting = suggestions.includes(exactMatch);
          if (!isExisting && onCreateNew) {
            await onCreateNew(exactMatch);
          }
          
          if (mode === 'single') {
            onChange(exactMatch);
          } else {
            onChange([...currentTags, exactMatch]);
          }
          setInputValue('');
        } else if (!currentTags.includes(trimmedValue)) {
          // Если нет точного совпадения, добавляем как есть
          const isExisting = suggestions.includes(trimmedValue);
          if (!isExisting && onCreateNew) {
            await onCreateNew(trimmedValue);
          }
          
          if (mode === 'single') {
            onChange(trimmedValue);
          } else {
            onChange([...currentTags, trimmedValue]);
          }
          setInputValue('');
        } else {
          // Если тег уже существует, просто очищаем input
          setInputValue('');
        }
      }
      
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 200);
  }, [inputValue, suggestions, mode, value, onChange, onCreateNew]);

  return (
    <Box
      ref={containerRef}
      className={className}
      design={{
        position: 'relative',
        width: '100%',
        ...design,
      }}
    >
      <Flex wrap
        onClick={() => {
          if (!disabled) {
            const input = containerRef.current?.querySelector('input');
            input?.focus();
          }
        }}
      >
        {/* Отображаем теги */}
        {tags.map((tag, index) => (
          <Tag
            key={index}
            color="primary"
            variant="soft"
            size="sm"
            closable={!disabled}
            onClose={() => removeTag(index)}
          >
            {tag}
          </Tag>
        ))}

        {/* Input для ввода */}
        {(mode === 'multiple' || tags.length === 0) && (
          <Box
            design={{
              flex: 1,
              minWidth: '120px',
            }}
          >
            <Input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (inputValue.trim() && filteredSuggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              onBlur={handleBlur}
              placeholder={tags.length === 0 ? placeholder : ''}
              disabled={disabled}
            />
          </Box>
        )}
      </Flex>

      {/* Popover с suggestions */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <Box
          ref={suggestionsListRef}
          design={{
            position: 'absolute',
            top: 'calc(100% + 0.25rem)',
            left: 0,
            right: 0,
            zIndex: 50,
            maxHeight: '200px',
            overflowY: 'auto',
            padding: 3,
            radius: "radius.md",
            bg: "color.bg.primary",
            effect: 'glassHeavy',
          }}
        >
          {filteredSuggestions.map((suggestion, index) => (
            <Button
              preset='ghost'
              key={index}
              ref={(el: HTMLButtonElement | null) => {
                suggestionItemRefs.current[index] = el;
              }}
              onClick={() => handleSuggestionClick(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
              design={{
                width: "100%",
                justifyContent: 'flex-start',
                backgroundColor: selectedIndex === index ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
                transition: 'background-color 0.15s ease',
              }}
            >
              <Text
                design={{
                  fontWeight: selectedIndex === index ? '600' : '400',
                  color: selectedIndex === index ? 'var(--color-primary, #0066cc)' : 'inherit',
                }}
              >
                {suggestion}
              </Text>
            </Button>
          ))}
        </Box>
      )}
    </Box>
  );
};
