import React, { useState, useCallback, useRef } from "react";
import type { DesignProps } from "@vira-ui/ui";
import { mergeDesign, getDesignClass, applyDesignClass, Flex, Text, Button } from "@vira-ui/ui";
import type { ViraComponentProps } from "@vira-ui/core";
import { Upload, X, File as FileIcon, Check } from "lucide-react";

// Вспомогательные функции для accessibility
const generateAriaId = (prefix: string) => `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
const useAriaAttributes = (options: any) => ({
  role: options.role,
  "aria-labelledby": options.labelledBy,
  "aria-describedby": options.describedBy,
  ...options.customAria,
});

/**
 * ViraFileUpload - Компонент для загрузки файлов с drag & drop
 * 
 * Поддерживает:
 * - design prop для стилей
 * - drag & drop
 * - множественная загрузка
 * - предпросмотр файлов
 * - валидация типов и размера
 */

export interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  progress?: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}

export interface ViraFileUploadProps extends ViraComponentProps {
  multiple?: boolean;
  accept?: string;
  maxSize?: number; // в байтах
  maxFiles?: number;
  onUpload?: (files: File[]) => void | Promise<void>;
  onFileRemove?: (fileId: string) => void;
  value?: UploadedFile[];
  onChange?: (files: UploadedFile[]) => void;
  uploadUrl?: string;
  autoUpload?: boolean;
  showPreview?: boolean;
  className?: string;
}

export const ViraFileUpload: React.FC<ViraFileUploadProps> = ({
  multiple = false,
  accept,
  maxSize,
  maxFiles,
  onUpload,
  onFileRemove,
  value: controlledFiles,
  onChange,
  uploadUrl,
  autoUpload = false,
  showPreview = true,
  design,
  className,
  ...props
}) => {
  const [internalFiles, setInternalFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const dropZoneIdRef = useRef(generateAriaId("fileupload-dropzone"));

  const files = controlledFiles !== undefined ? controlledFiles : internalFiles;

  // ARIA атрибуты
  const dropZoneAria = useAriaAttributes({
    role: "button",
    label: "Перетащите файлы сюда или нажмите для выбора",
    controls: dropZoneIdRef.current,
    customAria: {
      "aria-describedby": dropZoneIdRef.current,
    },
  });

  const handleFileAdd = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    
    // Валидация количества файлов
    if (maxFiles && files.length + fileArray.length > maxFiles) {
      alert(`Максимум ${maxFiles} файлов`);
      return;
    }

    const validatedFiles: UploadedFile[] = fileArray
      .filter(file => {
        // Валидация размера
        if (maxSize && file.size > maxSize) {
          return false;
        }
        // Валидация типа (если accept указан)
        if (accept) {
          const acceptedTypes = accept.split(",").map(t => t.trim());
          const fileType = file.type;
          const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
          
          const matches = acceptedTypes.some(type => {
            if (type.startsWith(".")) {
              return fileExtension === type;
            }
            if (type.includes("*")) {
              const baseType = type.split("/")[0];
              return fileType.startsWith(baseType);
            }
            return fileType === type;
          });
          
          if (!matches) {
            return false;
          }
        }
        return true;
      })
      .map(file => ({
        id: `${Date.now()}-${Math.random()}`,
        file,
        preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
        status: "pending" as const,
      }));

    const updatedFiles = [...files, ...validatedFiles];
    
    if (controlledFiles === undefined) {
      setInternalFiles(updatedFiles);
    }
    
    if (onChange) {
      onChange(updatedFiles);
    }

    if (autoUpload && onUpload) {
      onUpload(validatedFiles.map(f => f.file));
    }
  }, [files, maxFiles, maxSize, accept, controlledFiles, onChange, onUpload, autoUpload]);

  const handleFileRemove = useCallback((fileId: string) => {
    const updatedFiles = files.filter(f => {
      if (f.id === fileId && f.preview) {
        URL.revokeObjectURL(f.preview);
      }
      return f.id !== fileId;
    });

    if (controlledFiles === undefined) {
      setInternalFiles(updatedFiles);
    }

    if (onChange) {
      onChange(updatedFiles);
    }

    if (onFileRemove) {
      onFileRemove(fileId);
    }
  }, [files, controlledFiles, onChange, onFileRemove]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileAdd(e.dataTransfer.files);
    }
  }, [handleFileAdd]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileAdd(e.target.files);
      e.target.value = "";
    }
  }, [handleFileAdd]);

  const handleUpload = useCallback(async () => {
    if (onUpload) {
      const pendingFiles = files.filter(f => f.status === "pending");
      await onUpload(pendingFiles.map(f => f.file));
    }
  }, [files, onUpload]);

  const containerDesign: DesignProps = {
    display: "flex",
    flexDirection: "column",
    gap: 3,
    ...design,
  };

  const dropZoneDesign: DesignProps = {
    border: "2px dashed",
    borderColor: isDragging ? "color.primary" : "color.bg.tertiary",
    bg: isDragging ? "color.bg.tertiary" : "color.bg.primary",
    radius: "radius.lg",
    padding: 6,
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.2s",
    hover: {
      borderColor: "color.primary",
      bg: "color.bg.tertiary",
    },
  };

  const fileItemDesign: DesignProps = {
    display: "flex",
    alignItems: "center",
    gap: 2,
    padding: 3,
    bg: "color.bg.tertiary",
    radius: "radius.md",
    border: "1px solid",
    borderColor: "color.bg.tertiary",
  };

  const mergedDesign = mergeDesign(containerDesign, design);
  const designClass = getDesignClass(mergedDesign);
  const finalClassName = applyDesignClass(className, designClass);

  return (
    <Flex className={finalClassName} design={mergedDesign} {...props}>
      {/* Drop Zone */}
      <Flex
        ref={dropZoneRef}
        id={dropZoneIdRef.current}
        design={dropZoneDesign}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        tabIndex={0}
        {...dropZoneAria}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleInputChange}
          style={{ display: "none" }}
        />
        <Flex design={{ flexDirection: "column", alignItems: "center", gap: 2 }}>
          <Upload size={48} color="var(--color-primary)" />
          <Text design={{ fontSize: "typography.fontSize.lg", fontWeight: "typography.fontWeight.medium" }}>
            Перетащите файлы сюда или нажмите для выбора
          </Text>
          {accept && (
            <Text design={{ fontSize: "typography.fontSize.sm", color: "color.text.secondary" }}>
              Разрешенные типы: {accept}
            </Text>
          )}
          {maxSize && (
            <Text design={{ fontSize: "typography.fontSize.sm", color: "color.text.secondary" }}>
              Максимальный размер: {(maxSize / 1024 / 1024).toFixed(2)} MB
            </Text>
          )}
        </Flex>
      </Flex>

      {/* Список файлов */}
      {files.length > 0 && (
        <Flex design={{ flexDirection: "column", gap: 2 }}>
          {files.map(file => (
            <Flex key={file.id} design={fileItemDesign}>
              {showPreview && file.preview ? (
                <img
                  src={file.preview}
                  alt={file.file.name}
                  className={getDesignClass({ width: "48px", height: "48px", objectFit: "cover" as any, radius: "radius.md" })}
                />
              ) : (
                <FileIcon size={48} color="var(--color-text-secondary)" />
              )}
              <Flex design={{ flex: 1, flexDirection: "column", gap: 1 }}>
                <Text design={{ fontWeight: "typography.fontWeight.medium" }}>
                  {file.file.name}
                </Text>
                <Text design={{ fontSize: "typography.fontSize.sm", color: "color.text.secondary" }}>
                  {(file.file.size / 1024).toFixed(2)} KB
                </Text>
                {file.status === "uploading" && file.progress !== undefined && (
                  <div
                    className={getDesignClass({
                      width: "100%",
                      height: "4px",
                      bg: "color.bg.tertiary",
                      radius: "radius.sm",
                      overflow: "hidden",
                    })}
                  >
                    <div
                      className={getDesignClass({
                        width: `${file.progress}%`,
                        height: "100%",
                        bg: "color.primary",
                        transition: "width 0.3s",
                      })}
                    />
                  </div>
                )}
              </Flex>
              <Flex design={{ alignItems: "center", gap: 2 }}>
                {file.status === "success" && (
                  <Check size={20} color="var(--color-success)" />
                )}
                {file.status === "error" && (
                  <Text design={{ fontSize: "typography.fontSize.sm", color: "color.danger" }}>
                    {file.error || "Ошибка"}
                  </Text>
                )}
                <Button
                  preset="secondary"
                  onClick={() => handleFileRemove(file.id)}
                  design={{ padding: 1, minWidth: "auto" }}
                  aria-label="Удалить файл"
                >
                  <X size={20} />
                </Button>
              </Flex>
            </Flex>
          ))}
        </Flex>
      )}

      {/* Кнопка загрузки */}
      {files.length > 0 && !autoUpload && onUpload && (
        <Button preset="primary" onClick={handleUpload}>
          Загрузить {files.filter(f => f.status === "pending").length} файлов
        </Button>
      )}
    </Flex>
  );
};

