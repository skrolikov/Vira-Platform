import { 
  createElement, 
  forwardRef, 
  useCallback, 
  useMemo,
  ComponentType,
  ForwardRefExoticComponent,
  PropsWithoutRef,
  RefAttributes
} from "react";
import { 
  ComponentDeclaration, 
  ViraComponentProps,
  HookContext,
  EmitFunction,
  ProvideFunction,
  InjectFunction
} from "./types";
import { executeHooks } from "./hooks";
import { useViraContext, resolveAction, resolveModel } from "./context";
import { useProvideInject } from "./provide-inject";

/**
 * defineComponent - создание компонента как декларация
 * Это ядро Vira Framework
 */

export function defineComponent<P extends ViraComponentProps = ViraComponentProps>(
  declaration: ComponentDeclaration<P> & {
    render: (props: P & { generatedProps?: any }) => React.ReactElement;
  }
): ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<any>> {
  
  const Component = forwardRef<any, P>((props, ref) => {
    const viraContext = useViraContext();

    // ============================================
    // EMIT FUNCTION
    // ============================================
    const emit: EmitFunction = useCallback((event: string, ...args: any[]) => {
      const eventHandler = (props as any)[`on${event.charAt(0).toUpperCase()}${event.slice(1)}`];
      if (typeof eventHandler === "function") {
        eventHandler(...args);
      }
    }, [props]);

    // ============================================
    // PROVIDE / INJECT через Context API
    // ============================================
    const { provide: provideFromContext, inject: injectFromContext } = useProvideInject();
    
    const provide: ProvideFunction = useCallback((key: string, value: any) => {
      provideFromContext(key, value);
    }, [provideFromContext]);

    const inject: InjectFunction = useCallback(<T = any>(key: string, defaultValue?: T): T => {
      return injectFromContext<T>(key, defaultValue);
    }, [injectFromContext]);

    // ============================================
    // HOOK CONTEXT
    // ============================================
    const hookContext: HookContext<P> = useMemo(() => ({
      props: props as P,
      emit,
      provide,
      inject,
    }), [props, emit, provide, inject]);

    // ============================================
    // EXECUTE HOOKS
    // ============================================
    const hooksResult = useMemo(() => {
      if (!declaration.hooks || declaration.hooks.length === 0) {
        return {};
      }

      const hookNames = declaration.hooks.map(h => 
        typeof h === "string" ? h : h.name
      );

      return executeHooks(hookNames, hookContext);
    }, [hookContext]);

    // ============================================
    // AUTO-BINDING для action
    // ============================================
    const actionBinding = useMemo(() => {
      if (!props.action) return null;

      try {
        const actionFn = resolveAction(props.action as string, viraContext);
        return actionFn;
      } catch (err) {
        console.error("Failed to resolve action:", err);
        return null;
      }
    }, [props.action, viraContext]);

    // ============================================
    // AUTO-BINDING для model
    // ============================================
    const modelBinding = useMemo(() => {
      if (!props.model) return null;

      try {
        const model = resolveModel(props.model as string, viraContext);
        return model;
      } catch (err) {
        console.error("Failed to resolve model:", err);
        return null;
      }
    }, [props.model, viraContext]);

    // ============================================
    // GENERATED PROPS - всё что генерируется автоматически
    // ============================================
    const generatedProps = useMemo(() => {
      const generated: any = {
        ...hooksResult,
        ref,
      };

      // Если есть action binding - добавляем onClick
      if (actionBinding) {
        generated.onClick = actionBinding;
      }

      // Если есть model binding - добавляем value и onChange
      if (modelBinding) {
        generated.value = modelBinding.value;
        generated.onChange = (e: any) => {
          const value = e.target ? e.target.value : e;
          modelBinding.setValue(value);
          emit("update:modelValue", value);
        };
      }

      return generated;
    }, [hooksResult, ref, actionBinding, modelBinding, emit]);

    // ============================================
    // RENDER
    // ============================================
    return declaration.render({
      ...(props as P),
      generatedProps,
    });
  });

  // Устанавливаем имя компонента для DevTools
  Component.displayName = declaration.name || "ViraComponent";

  return Component;
}

