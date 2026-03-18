import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Box } from './Box';
import { Flex } from './Flex';
import { Input } from './Input';
import { Tag } from './Tag';
import { Text } from './Text';
import { Button } from './Button';

export interface TagInputProps {
  value: string | string[];
  onChange: (value: string | string[]) => void;
  mode?: 'single' | 'multiple';
  placeholder?: string;
  suggestions?: string[];
  onCreateNew?: (value: string) => Promise<void> | void;
  separator?: string;
  autoSeparator?: boolean;
  disabled?: boolean;
  className?: string;
  design?: any;
  maxSuggestions?: number;
  showSuggestionsOnFocus?: boolean;
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
  maxSuggestions = 10,
  showSuggestionsOnFocus = true,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const suggestionsListRef = useRef<HTMLDivElement>(null);
  const suggestionItemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const isClickingSuggestionRef = useRef(false);
  const blurTimeoutRef = useRef<NodeJS.Timeout>();
  
  // 👇 ВАЖНО: используем useRef для хранения ссылки на input
  // Но мы не можем напрямую передать его в Input, потому что Input ожидает ref
  // Вместо этого мы будем использовать функцию обратного вызова
  const inputRefCallback = useCallback((node: HTMLInputElement | null) => {
    // Сохраняем ссылку для внутреннего использования
    (inputRefCallback as any).current = node;
  }, []);
  
  // Получаем текущий input элемент
  const getInputElement = useCallback(() => {
    return (inputRefCallback as any).current as HTMLInputElement | null;
  }, []);

  // Нормализуем value к массиву для удобства работы
  const tags = useMemo(() => {
    if (mode === 'multiple') {
      return Array.isArray(value) ? value : value ? [value] : [];
    }
    return value ? [value as string] : [];
  }, [mode, value]);

  // Фильтруем suggestions при изменении input или внешних suggestions
  useEffect(() => {
    const tagsArray = mode === 'multiple' 
      ? (Array.isArray(value) ? value : value ? [value] : [])
      : (value ? [value as string] : []);
    
    let filtered: string[];
    
    if (inputValue.trim()) {
      // Если есть ввод, фильтруем по нему
      filtered = suggestions.filter(s =>
        s.toLowerCase().includes(inputValue.toLowerCase()) &&
        !tagsArray.includes(s)
      );
    } else {
      // Если ввод пустой, показываем все suggestions (кроме уже выбранных)
      filtered = suggestions.filter(s => !tagsArray.includes(s));
    }
    
    // Ограничиваем количество
    filtered = filtered.slice(0, maxSuggestions);
    
    setFilteredSuggestions(filtered);
    suggestionItemRefs.current = new Array(filtered.length).fill(null);
    
    // Сбрасываем выбранный индекс, если он выходит за пределы
    if (selectedIndex >= filtered.length) {
      setSelectedIndex(-1);
    }
  }, [inputValue, suggestions, mode, value, maxSuggestions, selectedIndex]);

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

  // Очищаем таймаут при размонтировании
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  const addTag = useCallback(async (tag: string, shouldCloseSuggestions = true) => {
    const trimmedTag = tag.trim();
    if (!trimmedTag) return;

    // Проверяем, существует ли тег в suggestions
    const isExisting = suggestions.includes(trimmedTag);
    
    // Если тега нет в suggestions, сохраняем в БД
    if (!isExisting && onCreateNew && !isCreatingNew) {
      setIsCreatingNew(true);
      try {
        await onCreateNew(trimmedTag);
      } finally {
        setIsCreatingNew(false);
      }
    }

    if (mode === 'single') {
      onChange(trimmedTag);
    } else {
      if (!tags.includes(trimmedTag)) {
        onChange([...tags, trimmedTag]);
      }
    }

    setInputValue('');
    if (shouldCloseSuggestions) {
      setShowSuggestions(false);
    }
    setSelectedIndex(-1);
    
    // Фокус на инпут после добавления
    setTimeout(() => {
      getInputElement()?.focus();
    }, 0);
  }, [mode, tags, onChange, onCreateNew, suggestions, isCreatingNew, getInputElement]);

  const removeTag = useCallback((indexToRemove: number) => {
    if (mode === 'single') {
      onChange('');
    } else {
      const newTags = tags.filter((_, index) => index !== indexToRemove);
      onChange(newTags);
    }
    
    // Фокус на инпут после удаления
    setTimeout(() => {
      getInputElement()?.focus();
    }, 0);
  }, [mode, tags, onChange, getInputElement]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    // Предотвращаем поведение по умолчанию для Tab, чтобы не уходить с поля
    if (e.key === 'Tab') {
      e.preventDefault();
    }

    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      
      if (selectedIndex >= 0 && filteredSuggestions[selectedIndex]) {
        // Выбираем suggestion из списка
        addTag(filteredSuggestions[selectedIndex]);
      } else if (inputValue.trim()) {
        // Добавляем введенное значение
        addTag(inputValue);
      } else if (e.key === 'Tab' && filteredSuggestions.length > 0) {
        // Если Tab при пустом вводе и есть suggestions, выбираем первый
        addTag(filteredSuggestions[0]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      
      if (!showSuggestions && filteredSuggestions.length > 0) {
        // Показываем suggestions при первом нажатии стрелки вниз
        setShowSuggestions(true);
        setSelectedIndex(0);
      } else if (showSuggestions && filteredSuggestions.length > 0) {
        // Перемещаемся вниз по списку
        setSelectedIndex(prev => {
          const next = prev + 1;
          return next < filteredSuggestions.length ? next : 0; // Зацикливаем
        });
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      
      if (showSuggestions && filteredSuggestions.length > 0) {
        // Перемещаемся вверх по списку
        setSelectedIndex(prev => {
          const next = prev - 1;
          return next >= 0 ? next : filteredSuggestions.length - 1; // Зацикливаем
        });
      }
    } else if (e.key === 'Home' && showSuggestions && filteredSuggestions.length > 0) {
      e.preventDefault();
      setSelectedIndex(0);
    } else if (e.key === 'End' && showSuggestions && filteredSuggestions.length > 0) {
      e.preventDefault();
      setSelectedIndex(filteredSuggestions.length - 1);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      // Удаляем последний тег при Backspace, если input пустой
      e.preventDefault();
      removeTag(tags.length - 1);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
      getInputElement()?.blur();
    }
  }, [selectedIndex, filteredSuggestions, inputValue, addTag, showSuggestions, tags.length, removeTag, getInputElement]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setSelectedIndex(-1);
    
    // Показываем suggestions при вводе
    if (newValue.trim() || showSuggestionsOnFocus) {
      setShowSuggestions(true);
    }
  }, [showSuggestionsOnFocus]);

  const handleInputFocus = useCallback(() => {
    if (showSuggestionsOnFocus && (inputValue.trim() || filteredSuggestions.length > 0)) {
      setShowSuggestions(true);
    }
  }, [showSuggestionsOnFocus, inputValue, filteredSuggestions.length]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    isClickingSuggestionRef.current = true;
    addTag(suggestion);
    
    // Очищаем флаг через некоторое время
    setTimeout(() => {
      isClickingSuggestionRef.current = false;
    }, 300);
  }, [addTag]);

  const handleBlur = useCallback(() => {
    // Очищаем предыдущий таймаут
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }
    
    // Небольшая задержка, чтобы onClick на suggestion успел сработать
    blurTimeoutRef.current = setTimeout(() => {
      // Если был клик на suggestion, не закрываем поповер и не добавляем тег
      if (isClickingSuggestionRef.current) {
        return;
      }
      
      const trimmedValue = inputValue.trim();
      
      if (trimmedValue) {
        // Добавляем введенное значение при потере фокуса
        addTag(trimmedValue);
      }
      
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 200);
  }, [inputValue, addTag]);

  // Показываем подсказку "Новый элемент" если введенного значения нет в suggestions
  const showCreateNew = inputValue.trim() && 
                       !filteredSuggestions.includes(inputValue.trim()) && 
                       !tags.includes(inputValue.trim()) &&
                       onCreateNew;

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
      <Flex
        wrap
        align="center"
        gap={2}
        design={{
          minHeight: '36px',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          backgroundColor: disabled ? 'var(--color-bg-tertiary)' : 'var(--color-bg-primary)',
          cursor: disabled ? 'not-allowed' : 'text',
          transition: 'border-color 0.15s',
          '&:hover': disabled ? {} : {
            borderColor: 'var(--color-primary)',
          },
          '&:focus-within': {
            borderColor: 'var(--color-primary)',
            boxShadow: '0 0 0 2px var(--color-primary-alpha)',
          },
        }}
        onClick={() => {
          if (!disabled) {
            getInputElement()?.focus();
          }
        }}
      >
        {/* Отображаем теги */}
        {tags.map((tag, index) => (
          <Tag
            key={`${tag}-${index}`}
            color="primary"
            variant="soft"
            size="sm"
            closable={!disabled}
            onClose={() => removeTag(index)}
            design={{
              margin: '2px',
            }}
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
              // 👇 Используем callback ref вместо RefObject
              ref={inputRefCallback}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={handleInputFocus}
              onBlur={handleBlur}
              placeholder={tags.length === 0 ? placeholder : ''}
              disabled={disabled}
              design={{
                border: 'none',
                padding: '4px 8px',
                height: 'auto',
                minHeight: '28px',
                backgroundColor: 'transparent',
                boxShadow: 'none',
                '&:focus': {
                  boxShadow: 'none',
                },
              }}
            />
          </Box>
        )}
      </Flex>

      {/* Popover с suggestions */}
      {showSuggestions && !disabled && (filteredSuggestions.length > 0 || showCreateNew) && (
        <Box
          ref={suggestionsListRef}
          design={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 9999,
            maxHeight: '250px',
            overflowY: 'auto',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-bg-primary)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            border: '1px solid var(--color-border)',
          }}
        >
          {/* Существующие suggestions */}
          {filteredSuggestions.map((suggestion, index) => (
            <Button
              key={suggestion}
              ref={(el: HTMLButtonElement | null) => {
                suggestionItemRefs.current[index] = el;
              }}
              onClick={() => handleSuggestionClick(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
              design={{
                width: '100%',
                justifyContent: 'flex-start',
                padding: '8px 12px',
                backgroundColor: selectedIndex === index ? 'var(--color-bg-tertiary)' : 'transparent',
                color: selectedIndex === index ? 'var(--color-primary)' : 'var(--color-text-primary)',
                fontWeight: selectedIndex === index ? '600' : '400',
                borderRadius: 'var(--radius-sm)',
                transition: 'all 0.15s',
                '&:hover': {
                  backgroundColor: 'var(--color-bg-tertiary)',
                },
              }}
            >
              <Text
                design={{
                  fontSize: '13px',
                }}
              >
                {suggestion}
              </Text>
            </Button>
          ))}

          {/* Опция создания нового */}
          {showCreateNew && (
            <>
              {filteredSuggestions.length > 0 && (
                <Box
                  design={{
                    height: '1px',
                    backgroundColor: 'var(--color-border)',
                    margin: '4px 0',
                  }}
                />
              )}
              <Button
                onClick={() => addTag(inputValue.trim())}
                onMouseEnter={() => setSelectedIndex(-1)}
                design={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  padding: '8px 12px',
                  backgroundColor: 'transparent',
                  color: 'var(--color-primary)',
                  fontWeight: '600',
                  borderRadius: 'var(--radius-sm)',
                  gap: '8px',
                  '&:hover': {
                    backgroundColor: 'var(--color-bg-tertiary)',
                  },
                }}
              >
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 16 16" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    d="M8 3V13M3 8H13" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    strokeLinecap="round"
                  />
                </svg>
                <Text
                  design={{
                    fontSize: '13px',
                  }}
                >
                  Создать: «{inputValue.trim()}»
                </Text>
              </Button>
            </>
          )}
        </Box>
      )}
    </Box>
  );
};