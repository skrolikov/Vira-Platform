import React, { useState } from "react";
import { DesignProps } from "../types";
import { mergeDesign, getDesignClass, applyDesignClass } from "../utils/design-utils";
import { Box } from "./Box";
import { Skeleton } from "./Skeleton";

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: string;
  showLoader?: boolean;
  design?: DesignProps;
}

/**
 * Image - Компонент изображения с загрузкой и fallback
 * 
 * Поддерживает:
 * - Fallback при ошибке загрузки
 * - Индикатор загрузки
 * - Кастомный дизайн
 */
export const Image: React.FC<ImageProps> = ({
  src,
  alt,
  fallback,
  showLoader = true,
  design,
  className,
  onError,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoading(false);
    if (fallback && currentSrc !== fallback) {
      setCurrentSrc(fallback);
      setHasError(false);
    } else {
      setHasError(true);
    }
    onError?.(e);
  };

  const imageDesign: DesignProps = {
    maxWidth: "100%",
    height: "auto",
    ...design,
  };

  const mergedDesign = mergeDesign(imageDesign, design);
  const designClass = getDesignClass(mergedDesign);
  const finalClassName = applyDesignClass(className, designClass);

  if (hasError && !fallback) {
    return (
      <Box
        design={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bg: "#f3f4f6",
          color: "#9ca3af",
          padding: 4,
          ...design,
        }}
      >
        Не удалось загрузить изображение
      </Box>
    );
  }

  return (
    <Box design={{ position: "relative", ...design }}>
      {isLoading && showLoader && (
        <Skeleton
          variant="rectangular"
          width="100%"
          height={props.height || "200px"}
          animation="pulse"
        />
      )}
      <img
        src={currentSrc}
        alt={alt}
        className={finalClassName}
        data-design={JSON.stringify(mergedDesign)}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          display: isLoading ? "none" : "block",
          ...(design as any),
        }}
        {...props}
      />
    </Box>
  );
};

