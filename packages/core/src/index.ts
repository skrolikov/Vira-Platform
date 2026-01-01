/**
 * @vira-ui/core
 * 
 * Vira Framework - Declarative UI framework layer over React
 * 
 * Это ядро фреймворка, которое предоставляет:
 * - defineComponent() - компоненты как декларация
 * - Smart Hooks Layer - автоматические хуки
 * - DI Container - dependency injection для сервисов
 * - Auto-binding - автоматическое связывание action/model
 * - generateComponent() - генерация всего "до return"
 */

// Component API
export { defineComponent } from "./component";
export { generateComponent } from "./generator";
// Note: generateAriaAttributes is exported from accessibility.ts (v3.1)

// Hooks API
export { 
  registerHook, 
  getHook, 
  executeHooks 
} from "./hooks";

// Services API
export { 
  createService, 
  useService, 
  hasService,
  getServiceContainer,
  clearServices
} from "./services";

// Context API
export {
  ViraContextProvider,
  useViraContext,
  parseAction,
  parseModel,
  resolveAction,
  resolveModel,
} from "./context";

// Reactive System (v2.0)
export {
  createSignal,
  useReactive,
  createReactiveService,
  useReactiveService,
  subscribeReactive,
} from "./reactive";

// Reactive V2 (experimental) - Полностью реактивное ядро без useState/useEffect
export {
  reactive,
  computed,
  effect,
  useReactive as useReactiveV2,
  useComputed,
  useReactiveEffect,
  reactiveObject,
} from "./reactive-v2";
export type { ReactiveRef } from "./reactive-v2";

// ViraSignals - Signal система как в SolidJS
export {
  signal,
  computed as computedSignal,
  effect as effectSignal,
  batch,
  useSignal,
  signalFromService,
} from "./signals";
export type { Signal, SignalSetter } from "./signals";

// Reactive Queries - Автоматические обновления при изменении API данных
export {
  query,
  mutation,
} from "./reactive-queries";
export type {
  QueryResult,
  QueryOptions,
  MutationResult,
  MutationOptions,
} from "./reactive-queries";

// Auto-bound Actions - Автоматическая обработка ошибок, загрузки, логирования
export {
  action,
  useAction,
  withActions,
} from "./actions";
export type {
  ActionOptions,
  ActionState,
} from "./actions";

// Smart Components - Компоненты без логики
export {
  smart,
  createSmartComponent,
  VIRA_JSX_TRANSFORMS,
} from "./smart-components";
export type {
  SmartComponentProps,
  SmartComponentConfig,
} from "./smart-components";

// Reactive Proxy - Реактивные объекты через Proxy (как Vue 3)
export {
  reactive as reactiveProxy,
  toRaw,
  runWithTracking,
} from "./reactive-proxy";
export type { Reactive } from "./reactive-proxy";

// Watchers - Система watchers с debounce/throttle
export {
  watch,
  watchEffect,
  watchEffectFn,
} from "./watchers";
export type { WatchOptions } from "./watchers";

// ViraService - Сервисный слой с DI
export {
  createViraService,
  useViraService,
  createTypedService,
} from "./vira-service";
export type {
  ViraService,
  ViraServiceFactory,
} from "./vira-service";

// Reactive Collections - Реактивные массивы/Set/Map
export {
  reactiveArray,
  reactiveSet,
  reactiveMap,
} from "./reactive-collections";
export type {
  ReactiveArray,
  ReactiveSet,
  ReactiveMap,
} from "./reactive-collections";

// Reactive Router - Реактивный роутер
export {
  reactiveRoute,
  useRouter,
  setGlobalRouter,
} from "./reactive-router";
export type {
  ReactiveRouter,
  RouteParams,
  RouteMatch,
} from "./reactive-router";

// ViraJS JSX Renderer (experimental) - Собственный рендерер
export {
  createElement,
  render,
} from "./jsx-renderer";
export type { ViraNode } from "./jsx-renderer";

// Advanced Renderer - Продвинутый рендерер с diff алгоритмом
export {
  patch,
  reactiveRender,
  renderWithSignals,
} from "./jsx-renderer-advanced";
// Note: hydrate exported from ssr.ts

// Vira Native Layer - Поддержка React Native
export {
  initViraNative,
  adaptDesignToNative,
  createNativeStyleSheet,
  platformStyle,
  ViraNative,
} from "./vira-native";
export type {
  ViraNativeConfig,
  ViraNativeStyle,
  StyleSheetAdapter,
} from "./vira-native";

// DevTools Integration - Граф состояний и отладка
export {
  devTools,
  trackSignal,
} from "./devtools-integration";
export type {
  DevToolsEvent,
  StateGraphNode,
} from "./devtools-integration";

// DevTools UI - Встроенная панель отладки
export {
  createDevToolsUI,
  showDevTools,
} from "./devtools-ui";

// Component Updates 2.0 - Локальные обновления компонентов
export {
  createComponent,
  mountComponent,
  createStaticComponent,
  shouldUpdateComponent,
} from "./component-updates";
export type { ViraComponent } from "./component-updates";

// DOM Scheduler - Умный рендер с приоритетами
export {
  scheduler,
  scheduleUpdate,
  startTransition,
  startIdle,
} from "./scheduler";
export type {
  UpdatePriority,
  ScheduledUpdate,
} from "./scheduler";

// Style Engine - Генерация CSS в рантайме
export {
  generateStyle,
  designToNative,
  clearStyleCache,
  getGeneratedStyles,
  setGlobalTokens,
} from "./style-engine";

// SSR - Server-Side Rendering
export {
  renderToString,
  hydrate,
  createSSRApp,
} from "./ssr";

// Micro-Optimizations
export {
  hoistStatic,
  markStatic,
  shouldDiff,
  getCachedChildren,
  keyedReorder,
} from "./micro-optimizations";

// Batch Updates (v2.1)
// Note: batch() exported from signals.ts (ViraSignals)
export {
  isBatchingUpdates,
} from "./batch";
// Note: scheduleUpdate exported from scheduler.ts (new version with priorities)

// Computed Values (v2.1)
export {
  createComputed,
  defineComputed,
} from "./computed";

// Lifecycle (v2.0)
export {
  useServiceLifecycle,
  withLifecycle,
} from "./lifecycle";
export type {
  ServiceLifecycle,
  ServiceWithLifecycle,
} from "./lifecycle";

// Models (v2.0)
export {
  defineModel,
  getModelMetadata,
} from "./models";
export type {
  FieldType,
  FieldDefinition,
  ModelDefinition,
  ModelInstance,
} from "./models";

// REST Client (v2.0 + v2.1)
export {
  createRestClient,
  getRestClient,
  rest,
  clearRestCache,
} from "./rest";
export type {
  RestClientConfig,
  RestQueryOptions,
  RestResponse,
  RestResource,
} from "./rest";

// Middleware System (v2.1)
export {
  MiddlewareManager,
  createAuthMiddleware,
  createRetryMiddleware,
  createLoggingMiddleware,
  createCacheMiddleware,
} from "./middleware";
export type {
  RestMiddleware,
  RequestConfig,
} from "./middleware";

// Memoization (v2.2)
export {
  memoize,
  memoComponent,
  useMemo,
} from "./memo";

// DevTools (v2.2) - Legacy
export {
  ViraDevTools,
  useDevTools,
  withDevToolsLogging,
} from "./devtools";
// Note: New devTools exported from devtools-integration.ts

// Service Optimizations (v2.2)
export {
  createLazyService,
  ServicePool,
  createServiceCache,
  debounceServiceMethod,
  throttleServiceMethod,
} from "./service-optimizer";

// Performance Monitoring (v2.3)
export {
  performanceMonitor,
  usePerformance,
  withPerformanceMonitoring,
} from "./performance";
export type {
  PerformanceMetric,
} from "./performance";

// Offline Support (v2.3)
export {
  offlineManager,
  useOnlineStatus,
} from "./offline";

// TypeScript Utilities (v2.3)
export type {
  DeepReadonly,
  DeepPartial,
  DeepRequired,
  KeysOfType,
  OmitByType,
  PickByType,
  Optional,
  Required as RequiredKeys,
  Awaited,
  PromiseType,
  FunctionWithParams,
  AsyncFunction,
  Constructor,
  InstanceType,
  Brand,
  Nominal,
  Prettify,
  StringKeys,
  Values,
  Entries,
  NonEmptyArray,
  AtLeastOne,
} from "./types-utils";

// Advanced Models (v3.0)
export {
  addAsyncValidator,
  validateFieldAsync,
  validateAsync,
  applyConditionalRules,
  applyFieldDependencies,
  isFieldVisible,
  isFieldDisabled,
} from "./models-advanced";
export type {
  AsyncValidator,
  ConditionalFieldRule,
  FieldDependency,
  AdvancedModelOptions,
} from "./models-advanced";

// Entity Module System (v3.0)
export {
  createEntityModule,
  registerFormService,
  createCRUDModule,
} from "./entity-module";
export type {
  EntityModuleConfig,
} from "./entity-module";

// State Graph (v2.0)
export {
  registerServiceInGraph,
  updateServiceInGraph,
  addDependencyToGraph,
  logStateGraphEvent,
  getStateGraph,
  getStateGraphNode,
  exportStateGraph,
  clearStateGraph,
} from "./state-graph";
export type {
  ServiceNode,
  StateGraph,
} from "./state-graph";

// Provide/Inject System
export {
  ViraProvide,
  useProvideInject,
} from "./provide-inject";
export type {
  ViraProvideProps,
} from "./provide-inject";

// Accessibility (v3.1)
export {
  generateAriaAttributes,
  mergeAriaAttributes,
  createKeyboardHandler,
  getFocusableElements,
  createFocusTrap,
  focusFirstElement,
  focusLastElement,
  FocusManager,
  generateAriaId,
} from "./accessibility";
export type {
  AriaAttributes,
  KeyboardNavigationOptions,
} from "./accessibility";

// Accessibility Hooks
export {
  useFocusTrap,
} from "./hooks/useFocusTrap";
export type {
  UseFocusTrapOptions,
} from "./hooks/useFocusTrap";
export {
  useKeyboardNavigation,
  useElementKeyboardNavigation,
  useArrowNavigation,
} from "./hooks/useKeyboardNavigation";
export type {
  UseArrowNavigationOptions,
} from "./hooks/useKeyboardNavigation";
export {
  useAriaAttributes,
} from "./hooks/useAriaAttributes";

// Vira Reactive Protocol (VRP) - Core client (no React dependency)
export {
  createViraClient,
} from "./vrp/vira-client";
export type {
  ViraClientOptions,
  ViraClient,
} from "./vrp/vira-client";
export {
  createViraConnection,
} from "./vrp/vira-connection";
export type {
  ViraConnection,
  ViraConnectionOptions,
  ViraReconnectOptions,
} from "./vrp/vira-connection";
export {
  getViraConnectionPool,
} from "./vrp/vira-pool";
export type {
  ViraConnectionPool,
  ViraPoolOptions,
  ViraPoolStatus,
  ViraPoolStatusListener,
  ViraChannelListener,
} from "./vrp/vira-pool";
export type {
  Message,
} from "./vrp/types";

// Utils
export {
  deepMerge,
} from "./utils/deepMerge";

// Note: React hooks (useViraState, useViraStream) are in @vira-ui/react package

// Types
export type {
  ComponentDeclaration,
  PropDefinition,
  PropOptions,
  PropType,
  DesignDeclaration,
  HookDefinition,
  HookContext,
  HookFunction,
  EmitFunction,
  ProvideFunction,
  InjectFunction,
  ServiceDefinition,
  ServiceFactory,
  ServiceContainer,
  BindingContext,
  ActionBinding,
  ModelBinding,
  ActionProp,
  ModelProp,
  GeneratedComponent,
  ComponentBindings,
  ViraComponentProps,
} from "./types";

