/**
 * @vira-ui/bindings-react
 * 
 * React bindings for Vira Framework with auto-binding support
 * 
 * This package provides Vira-prefixed components that integrate with
 * @vira-ui/core for automatic model binding, action execution, and
 * reactive state management.
 */

// Core Vira Components with auto-binding
// Button, Input, Checkbox, Select теперь объединены с обычными компонентами в @vira-ui/ui
export { Button } from "@vira-ui/ui";
export type { ButtonProps } from "@vira-ui/ui";
export { Input } from "@vira-ui/ui";
export type { InputProps } from "@vira-ui/ui";
export { Checkbox } from "@vira-ui/ui";
export type { CheckboxProps } from "@vira-ui/ui";
export { Select } from "@vira-ui/ui";
export type { SelectProps, SelectOption } from "@vira-ui/ui";

// Re-export for backwards compatibility (deprecated, use Button, Input, Checkbox, Select from @vira-ui/ui)
export type { ButtonProps as ViraButtonProps } from "@vira-ui/ui";
export type { InputProps as ViraInputProps } from "@vira-ui/ui";
export type { CheckboxProps as ViraCheckboxProps } from "@vira-ui/ui";
export type { SelectProps as ViraSelectProps, SelectOption as ViraSelectOption } from "@vira-ui/ui";

export { ViraTable } from "./components/ViraTable";
export type { ViraTableProps, ViraTableColumn } from "./components/ViraTable";

// Form Components
export { ViraForm } from "./components/ViraForm";
export type { ViraFormProps } from "./components/ViraForm";


export { ViraMultiStepForm } from "./components/ViraMultiStepForm";
export type { ViraMultiStepFormProps, FormStep } from "./components/ViraMultiStepForm";

export { ViraConditionalForm } from "./components/ViraConditionalForm";
export type { ViraConditionalFormProps, ConditionalFieldRule, FieldDependency } from "./components/ViraConditionalForm";

export { ViraDatePicker } from "./components/ViraDatePicker";
export type { ViraDatePickerProps } from "./components/ViraDatePicker";

export { ViraFileUpload } from "./components/ViraFileUpload";
export type { ViraFileUploadProps, UploadedFile } from "./components/ViraFileUpload";

// Data Grid
export { ViraDataGrid } from "./components/ViraDataGrid";
export type { ViraDataGridProps, EditableCellProps } from "./components/ViraDataGrid";

// Modal & Drawer
export { ViraModal, Modal } from "./components/ViraModal";
export type { ViraModalProps, ViraModalSize } from "./components/ViraModal";

export { ViraDrawer } from "./components/ViraDrawer";
export type { ViraDrawerProps } from "./components/ViraDrawer";

// Loading & Error Handling
export { ViraSkeleton } from "./components/ViraSkeleton";
export type { ViraSkeletonProps } from "./components/ViraSkeleton";

export { ViraSuspense } from "./components/ViraSuspense";
export type { ViraSuspenseProps } from "./components/ViraSuspense";

export { ViraLazy, createLazyComponent } from "./components/ViraLazy";
export type { ViraLazyProps } from "./components/ViraLazy";

export { ViraErrorBoundary } from "./components/ViraErrorBoundary";
export type { ViraErrorBoundaryProps } from "./components/ViraErrorBoundary";

// Virtual List
export { ViraVirtualList } from "./components/ViraVirtualList";
export type { ViraVirtualListProps } from "./components/ViraVirtualList";

// Runtime для автоматического связывания
export { BindingRuntime } from "./BindingRuntime";
export type { BindingRuntimeProps } from "./BindingRuntime";

// Re-export from @vira-ui/core for convenience
export type { ViraComponentProps } from "@vira-ui/core";
export { useViraContext, useService } from "@vira-ui/core";
