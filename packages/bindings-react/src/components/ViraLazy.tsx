import React, { lazy, Suspense, ComponentType } from "react";
import { ViraSkeleton } from "./ViraSkeleton";
import type { ViraSkeletonProps } from "./ViraSkeleton";

/**
 * ViraLazy - Lazy loading компонентов с автоматическим skeleton
 */

export interface ViraLazyProps {
  factory: () => Promise<{ default: ComponentType<any> }>;
  fallback?: React.ReactNode;
  skeleton?: ViraSkeletonProps;
  onError?: (error: Error) => void;
}

interface ViraLazyState {
  Component: ComponentType<any> | null;
  error: Error | null;
}

/**
 * Создание lazy компонента с error boundary
 */
export function createLazyComponent<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  options: {
    fallback?: React.ReactNode;
    skeleton?: ViraSkeletonProps;
    onError?: (error: Error) => void;
  } = {}
): ComponentType<React.ComponentProps<T>> {
  const LazyComponent = lazy(factory);

  return (props: React.ComponentProps<T>) => {
    const [error, setError] = React.useState<Error | null>(null);

    React.useEffect(() => {
      return () => setError(null);
    }, []);

    if (error) {
      if (options.onError) {
        options.onError(error);
      }
      return (
        <div style={{ padding: "2rem", textAlign: "center", color: "var(--color-danger)" }}>
          Ошибка загрузки компонента
        </div>
      );
    }

    const fallback = options.fallback || (
      options.skeleton ? (
        <ViraSkeleton {...options.skeleton} />
      ) : (
        <ViraSkeleton variant="rectangular" width="100%" height="200px" />
      )
    );

    return (
      <ErrorBoundary onError={setError}>
        <Suspense fallback={fallback}>
          <LazyComponent {...props} />
        </Suspense>
      </ErrorBoundary>
    );
  };
}

/**
 * Простой компонент для lazy loading
 */
export const ViraLazy: React.FC<ViraLazyProps & { [key: string]: any }> = ({
  factory,
  fallback,
  skeleton,
  onError,
  ...props
}) => {
  const [Component, setComponent] = React.useState<ComponentType<any> | null>(null);
  const [error, setError] = React.useState<Error | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    factory()
      .then((module) => {
        setComponent(() => module.default);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
        if (onError) {
          onError(err);
        }
      });
  }, [factory, onError]);

  if (error) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "var(--color-danger)" }}>
        Ошибка загрузки компонента: {error.message}
      </div>
    );
  }

  if (loading || !Component) {
    return fallback || (skeleton ? <ViraSkeleton {...skeleton} /> : <ViraSkeleton variant="rectangular" width="100%" height="200px" />);
  }

  return <Component {...props} />;
};

/**
 * Error Boundary для обработки ошибок в lazy компонентах
 */
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: (error: Error) => void },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; onError?: (error: Error) => void }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (this.props.onError) {
      this.props.onError(error);
    }
  }

  render() {
    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}

