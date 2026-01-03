import React, { useEffect, useRef } from "react";
import { useViraContext, resolveAction, resolveModel, parseModel } from "@vira-ui/core";

/**
 * BindingRuntime - Runtime для автоматического связывания UI компонентов с Vira Core
 * 
 * Обрабатывает data-атрибуты:
 * - data-action="service.method" - автоматически вызывает action при клике
 * - data-model="service.property" - автоматически связывает значение input'а с сервисом
 * 
 * @example
 * // В корне приложения
 * <ViraProvider>
 *   <BindingRuntime />
 *   <App />
 * </ViraProvider>
 * 
 * // Использование
 * <Button data-action="client.create">Создать</Button>
 * <Input data-model="client.name" />
 */
export interface BindingRuntimeProps {
  /**
   * Корневой элемент для обработки событий
   * По умолчанию - document
   */
  root?: HTMLElement | Document;
  
  /**
   * Отключить обработку data-action
   */
  disableActions?: boolean;
  
  /**
   * Отключить обработку data-model
   */
  disableModels?: boolean;
}

export const BindingRuntime: React.FC<BindingRuntimeProps> = ({
  root = document,
  disableActions = false,
  disableModels = false,
}) => {
  const context = useViraContext();
  const modelBindingsRef = useRef<Map<HTMLElement, {
    model: string;
    binding: { value: any; setValue: (value: any) => void; service: any };
    cleanup: () => void;
  }>>(new Map());

  // Guard against infinite loops:
  // When we programmatically update element.value and dispatch input/change to sync React-controlled components,
  // we must ignore that synthetic event in our own handler.
  const runtimeUpdatingRef = useRef<WeakSet<HTMLElement>>(new WeakSet());

  const setNativeValue = (el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, next: string) => {
    // IMPORTANT:
    // For React-controlled inputs, direct `el.value = ...` may desync React's internal value tracker.
    // Use the native setter so the DOM + React stay consistent and the user sees typed text.
    const w = window as any;
    let proto: any = null;
    if (el instanceof w.HTMLTextAreaElement) proto = w.HTMLTextAreaElement.prototype;
    else if (el instanceof w.HTMLSelectElement) proto = w.HTMLSelectElement.prototype;
    else proto = w.HTMLInputElement.prototype;

    const desc = Object.getOwnPropertyDescriptor(proto, "value");
    const setter = desc?.set;
    if (setter) setter.call(el, next);
    else (el as any).value = next;
  };

  // ============================================
  // ОБРАБОТКА data-action (клики)
  // ============================================
  useEffect(() => {
    if (disableActions) return;

    const handleClick = async (e: MouseEvent) => {
      // e.target can be a Text node in some browsers. Normalize to an Element for closest().
      const rawTarget = e.target as any;
      const targetEl: HTMLElement | null =
        rawTarget && rawTarget.nodeType === Node.ELEMENT_NODE
          ? (rawTarget as HTMLElement)
          : (rawTarget?.parentElement as HTMLElement | null);
      
      // Ищем ближайший элемент с data-action (может быть на самом элементе или его родителе)
      const actionElement = targetEl?.closest?.('[data-action]') as HTMLElement;
      
      if (!actionElement) return;

      const action = actionElement.getAttribute('data-action');
      if (!action || typeof action !== 'string') return;

      // Предотвращаем default только если это не нативная форма
      if (actionElement.tagName === 'BUTTON' && (actionElement as HTMLButtonElement).type === 'submit') {
        // Для submit кнопок не предотвращаем, пусть форма обрабатывает сама
        // Но action всё равно выполним
      }

      try {
        const actionBinding = resolveAction(action, context);
        
        if (!actionBinding) {
          console.warn(`[BindingRuntime] Action "${action}" not found`);
          return;
        }

        // Выполняем action (resolveAction возвращает функцию)
        if (typeof actionBinding === 'function') {
          await actionBinding();
        } else {
        }
      } catch (err) {
      }
    };

    root.addEventListener('click', handleClick as any);
    
    return () => {
      root.removeEventListener('click', handleClick as any);
    };
  }, [context, root, disableActions]);

  // ============================================
  // ОБРАБОТКА data-model (двустороннее связывание)
  // ============================================
  useEffect(() => {
    if (disableModels) return;

    const updateModelBinding = (element: HTMLElement, model: string) => {
      // Удаляем старое связывание если есть
      const existing = modelBindingsRef.current.get(element);
      if (existing) {
        existing.cleanup();
        modelBindingsRef.current.delete(element);
      }

      try {
        const binding = resolveModel(model, context);
        const parsed = parseModel(model);
        
        if (!binding) {
          console.warn(`[BindingRuntime] Model "${model}" not found`);
          return;
        }

        // Определяем тип элемента и обновляем значение
        const tagName = element.tagName.toLowerCase();
        const updateElementValue = () => {
          // IMPORTANT:
          // resolveModel() returns a snapshot "value" at resolve time.
          // For reactive updates we must read the *current* value from the service each time.
          const readBindingValue = () => {
            const propertyValue = (binding.service as any)[parsed.property];
            return typeof propertyValue === "function"
              ? propertyValue.call(binding.service)
              : propertyValue;
          };

          if (tagName === 'input' || tagName === 'textarea') {
            const input = element as HTMLInputElement | HTMLTextAreaElement;
            const isCheckbox = tagName === 'input' && (input as HTMLInputElement).type === 'checkbox';
            const currentValue = isCheckbox 
              ? (input as HTMLInputElement).checked 
              : input.value;
            
            // Обновляем только если значение изменилось
            const bindingValue = readBindingValue();
            if (currentValue !== bindingValue) {
              if (isCheckbox) {
                (input as HTMLInputElement).checked = Boolean(bindingValue);
              } else {
                setNativeValue(input, bindingValue != null ? String(bindingValue) : '');
              }

              // Для React-controlled компонентов нужно триггерить событие,
              // но чтобы не зациклиться — помечаем элемент как "runtime updating".
              runtimeUpdatingRef.current.add(element);
              try {
                input.dispatchEvent(new Event('input', { bubbles: true }));
              } finally {
                runtimeUpdatingRef.current.delete(element);
              }
            }
          } else if (tagName === 'select') {
            const select = element as HTMLSelectElement;
            const bindingValue = readBindingValue();
            const next = bindingValue != null ? String(bindingValue) : '';
            if (select.value !== next) {
              setNativeValue(select, next);
              runtimeUpdatingRef.current.add(element);
              try {
                select.dispatchEvent(new Event('change', { bubbles: true }));
              } finally {
                runtimeUpdatingRef.current.delete(element);
              }
            }
          }
        };

        // Обновляем элемент при изменении модели
        updateElementValue();

        // Подписываемся на изменения сервиса
        let cleanupSubscription: (() => void) | null = null;
        try {
          const service = binding.service;
          
          if (service && (service as any).__reactive__ && (service as any).__subscribers__) {
            const updateFn = () => {
              requestAnimationFrame(() => updateElementValue());
            };
            
            (service as any).__subscribers__.add(updateFn);
            
            cleanupSubscription = () => {
              if ((service as any).__subscribers__) {
                (service as any).__subscribers__.delete(updateFn);
              }
            };
          }
        } catch (err) {
          // Игнорируем ошибки подписки
        }

        // Сохраняем binding
        modelBindingsRef.current.set(element, {
          model,
          binding,
          cleanup: () => {
            if (cleanupSubscription) cleanupSubscription();
          },
        });
      } catch (err) {
      }
    };

    // Обработчик изменений input'ов
    const handleInputChange = (e: Event) => {
      const target = e.target as HTMLElement;
      const model = target.getAttribute('data-model');
      
      if (!model) return;

      // Ignore synthetic events triggered by our own updateElementValue
      if (runtimeUpdatingRef.current.has(target)) {
        runtimeUpdatingRef.current.delete(target);
        return;
      }

      const bindingData = modelBindingsRef.current.get(target);
      if (!bindingData) {
        // Если binding еще не создан, создаем его
        updateModelBinding(target, model);
        return;
      }

      // Обновляем значение в модели
      try {
        const value = (target as HTMLInputElement).type === 'checkbox'
          ? (target as HTMLInputElement).checked
          : (target as HTMLInputElement | HTMLTextAreaElement).value;
        
        bindingData.binding.setValue(value);
      } catch (err) {
      }
    };

    // Observer для отслеживания новых элементов с data-model
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;
            const model = element.getAttribute('data-model');
            
            if (model) {
              updateModelBinding(element, model);
            }

            // Также проверяем вложенные элементы
            const nestedElements = element.querySelectorAll('[data-model]');
            nestedElements.forEach((el) => {
              const nestedModel = el.getAttribute('data-model');
              if (nestedModel) {
                updateModelBinding(el as HTMLElement, nestedModel);
              }
            });
          }
        });
      });
    });

    // Инициализируем существующие элементы
    const existingElements = root.querySelectorAll('[data-model]');
    existingElements.forEach((element) => {
      const model = element.getAttribute('data-model');
      if (model) {
        updateModelBinding(element as HTMLElement, model);
      }
    });

    // Наблюдаем за изменениями DOM
    observer.observe(root as any, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-model'],
    });

    // Добавляем обработчики событий
    root.addEventListener('input', handleInputChange);
    root.addEventListener('change', handleInputChange);

    return () => {
      observer.disconnect();
      root.removeEventListener('input', handleInputChange);
      root.removeEventListener('change', handleInputChange);
      
      // Очищаем все bindings
      modelBindingsRef.current.forEach(({ cleanup }) => cleanup());
      modelBindingsRef.current.clear();
    };
  }, [context, root, disableModels]);

  // Компонент не рендерит ничего
  return null;
};

