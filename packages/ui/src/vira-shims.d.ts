/**
 * Type shims для @vira-ui/core
 * Временный файл пока core не собран
 */

declare module "@vira-ui/core" {
  import { ReactNode } from "react";

  export interface ViraComponentProps {
    design?: any;
    action?: string;
    model?: string;
    source?: string;
    preset?: string;
    children?: ReactNode;
  }

  export interface BindingContext {
    services: ServiceContainer;
    currentService?: any;
  }

  export interface ServiceContainer {
    get<T>(name: string): T;
    has(name: string): boolean;
  }

  export function createService<T>(
    name: string,
    factory: () => T,
    options?: { singleton?: boolean }
  ): void;

  export function useService<T = any>(name: string): T;

  export function getServiceContainer(): ServiceContainer;

  export function useViraContext(): BindingContext;

  export function resolveAction(
    action: string,
    context: BindingContext
  ): Function;

  export function resolveModel(
    model: string,
    context: BindingContext
  ): { value: any; setValue: (value: any) => void };

  export function parseModel(model: string): {
    service: string;
    property: string;
  };

  export const ViraContextProvider: React.Provider<BindingContext>;

  // Models (v2.0)
  export function defineModel<T>(definition: any): () => any;
  export function getModelMetadata(definition: any): Record<string, any>;
  export type FieldDefinition = {
    type: string;
    required?: boolean;
    default?: any;
    min?: number;
    max?: number;
    pattern?: RegExp | string;
    validator?: (value: any) => boolean | string;
    message?: string;
    label?: string;
    placeholder?: string;
  };

  // Reactive (v2.0)
  export function createReactiveService<T>(service: T): T;
  export function useReactiveService<T>(service: T | (() => T)): T;

  // Lifecycle (v2.0)
  export function useServiceLifecycle(service: any, deps?: any[]): void;
  export function withLifecycle<T>(service: T, lifecycle: any): T;

  // REST Client (v2.0)
  export function createRestClient(config?: any): any;
  export function rest<T>(name: string): any;

  // State Graph (v2.0)
  export function getStateGraph(): any;
  export function exportStateGraph(): any;
}

