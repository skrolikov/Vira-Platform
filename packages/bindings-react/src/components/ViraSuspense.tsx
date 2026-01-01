import React, { Suspense, SuspenseProps } from "react";
import { ViraSkeleton } from "./ViraSkeleton";
import type { ViraSkeletonProps } from "./ViraSkeleton";

/**
 * ViraSuspense - Обёртка над React.Suspense с автоматическим skeleton
 */

export interface ViraSuspenseProps extends Omit<SuspenseProps, "fallback"> {
  fallback?: React.ReactNode;
  skeleton?: ViraSkeletonProps;
  children: React.ReactNode;
}

export const ViraSuspense: React.FC<ViraSuspenseProps> = ({
  fallback,
  skeleton,
  children,
  ...props
}) => {
  const defaultFallback = skeleton ? (
    <ViraSkeleton {...skeleton} />
  ) : (
    <ViraSkeleton variant="rectangular" width="100%" height="200px" />
  );

  return (
    <Suspense fallback={fallback || defaultFallback} {...props}>
      {children}
    </Suspense>
  );
};

