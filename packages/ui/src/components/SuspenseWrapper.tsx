import React, { Suspense, SuspenseProps } from "react";
import { Skeleton } from "./Skeleton";
import type { SkeletonProps } from "./Skeleton";

/**
 * SuspenseWrapper - Обёртка над React.Suspense с автоматическим skeleton
 */

export interface SuspenseWrapperProps extends Omit<SuspenseProps, "fallback"> {
  fallback?: React.ReactNode;
  skeleton?: SkeletonProps;
  children: React.ReactNode;
}

export const SuspenseWrapper: React.FC<SuspenseWrapperProps> = ({
  fallback,
  skeleton,
  children,
  ...props
}) => {
  const defaultFallback = skeleton ? (
    <Skeleton {...skeleton} />
  ) : (
    <Skeleton variant="rectangular" width="100%" height="200px" />
  );

  return (
    <Suspense fallback={fallback || defaultFallback} {...props}>
      {children}
    </Suspense>
  );
};

