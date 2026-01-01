import { useState, useCallback, useMemo } from "react";
import { HookContext, HookFunction } from "./types";

/**
 * Smart Hooks Layer - автоматические хуки для компонентов
 */

// Реестр хуков
const hooksRegistry = new Map<string, HookFunction>();

/**
 * Регистрация хука
 */
export function registerHook<P = any, R = any>(
  name: string,
  hook: HookFunction<P, R>
): void {
  hooksRegistry.set(name, hook);
}

/**
 * Получение хука
 */
export function getHook<P = any, R = any>(name: string): HookFunction<P, R> | undefined {
  return hooksRegistry.get(name);
}

/**
 * Выполнение хуков для компонента
 */
export function executeHooks<P = any>(
  hookNames: string[],
  context: HookContext<P>
): Record<string, any> {
  const results: Record<string, any> = {};

  for (const hookName of hookNames) {
    const hook = getHook(hookName);
    if (!hook) {
      console.warn(`Hook "${hookName}" not found`);
      continue;
    }

    const result = hook(context);
    Object.assign(results, result);
  }

  return results;
}

// ============================================
// ВСТРОЕННЫЕ ХУКИ
// ============================================

/**
 * Hook для Input компонента
 */
registerHook("input", ({ props, emit }) => {
  const [value, setValue] = useState(props.modelValue ?? props.defaultValue ?? "");

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    emit("update:modelValue", newValue);
    if (props.onChange) {
      props.onChange(e);
    }
  }, [props, emit]);

  return {
    value: props.modelValue !== undefined ? props.modelValue : value,
    onChange,
  };
});

/**
 * Hook для Toggle/Checkbox
 */
registerHook("toggle", ({ props, emit }) => {
  const [checked, setChecked] = useState(props.modelValue ?? props.defaultChecked ?? false);

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked;
    setChecked(newValue);
    emit("update:modelValue", newValue);
    if (props.onChange) {
      props.onChange(e);
    }
  }, [props, emit]);

  return {
    checked: props.modelValue !== undefined ? props.modelValue : checked,
    onChange,
  };
});

/**
 * Hook для Select
 */
registerHook("select", ({ props, emit }) => {
  const [value, setValue] = useState(props.modelValue ?? props.defaultValue ?? "");

  const onChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    emit("update:modelValue", newValue);
    if (props.onChange) {
      props.onChange(e);
    }
  }, [props, emit]);

  return {
    value: props.modelValue !== undefined ? props.modelValue : value,
    onChange,
  };
});

/**
 * Hook для Loading состояния
 */
registerHook("loading", ({ props }) => {
  const [loading, setLoading] = useState(props.loading ?? false);

  return {
    loading: props.loading !== undefined ? props.loading : loading,
    setLoading,
  };
});

/**
 * Hook для Data fetching
 */
registerHook("data", ({ props }) => {
  const [data, setData] = useState(props.data ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!props.source) return;

    setLoading(true);
    setError(null);

    try {
      // Здесь будет логика получения данных через сервисы
      // const service = useService(props.source);
      // const result = await service.fetch();
      // setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [props.source]);

  return {
    data: props.data !== undefined ? props.data : data,
    loading,
    error,
    fetchData,
    setData,
  };
});

