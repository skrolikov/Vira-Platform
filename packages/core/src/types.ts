import { ReactNode, ComponentType } from "react";

/**
 * Базовые типы для Vira Framework
 */

// ============================================
// COMPONENT TYPES
// ============================================

export interface ComponentDeclaration<P = any> {
  name?: string;
  props?: PropDefinition;
  design?: DesignDeclaration;
  hooks?: string[] | HookDefinition[];
  emits?: string[];
  provide?: Record<string, any>;
  inject?: string[];
  slots?: string[];
}

export interface PropDefinition {
  [key: string]: PropType | PropOptions;
}

export interface PropOptions {
  type: PropType;
  default?: any;
  required?: boolean;
  validator?: (value: any) => boolean;
}

export type PropType = 
  | StringConstructor 
  | NumberConstructor 
  | BooleanConstructor 
  | ArrayConstructor 
  | ObjectConstructor
  | FunctionConstructor;

export interface DesignDeclaration {
  [key: string]: any;
}

export interface HookDefinition {
  name: string;
  options?: any;
}

// ============================================
// HOOKS TYPES
// ============================================

export interface HookContext<P = any> {
  props: P;
  emit: EmitFunction;
  provide: ProvideFunction;
  inject: InjectFunction;
}

export type HookFunction<P = any, R = any> = (
  context: HookContext<P>
) => R;

export type EmitFunction = (event: string, ...args: any[]) => void;
export type ProvideFunction = (key: string, value: any) => void;
export type InjectFunction = <T = any>(key: string, defaultValue?: T) => T;

// ============================================
// SERVICE TYPES
// ============================================

export interface ServiceDefinition<T = any> {
  name: string;
  factory: ServiceFactory<T>;
  singleton?: boolean;
}

export type ServiceFactory<T = any> = () => T;

export interface ServiceContainer {
  register<T>(name: string, factory: ServiceFactory<T>, singleton?: boolean): void;
  get<T>(name: string): T;
  has(name: string): boolean;
}

// ============================================
// AUTO-BINDING TYPES
// ============================================

export interface BindingContext {
  services: ServiceContainer;
  currentService?: any;
}

export interface ActionBinding {
  service: string;
  method: string;
  params?: any[];
}

export interface ModelBinding {
  service: string;
  property: string;
}

export type ActionProp = string | ActionBinding;
export type ModelProp = string | ModelBinding;

// ============================================
// GENERATION TYPES
// ============================================

export interface GeneratedComponent<P = any> {
  props: P;
  classes: string;
  bindings: ComponentBindings;
  state: Record<string, any>;
  methods: Record<string, Function>;
  refs: Record<string, any>;
}

export interface ComponentBindings {
  events?: Record<string, Function>;
  attributes?: Record<string, any>;
  models?: Record<string, any>;
}

// ============================================
// VIRA COMPONENT PROPS
// ============================================

export interface ViraComponentProps {
  design?: DesignDeclaration;
  action?: ActionProp;
  model?: ModelProp;
  source?: string;
  preset?: string;
  children?: ReactNode;
}

