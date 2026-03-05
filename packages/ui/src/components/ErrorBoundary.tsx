import { Component, ErrorInfo, ReactNode } from "react";
import { Card } from "./Card";
import { Flex } from "./Flex";
import { Heading } from "./Heading";
import { Text } from "./Text";
import { Button } from "./Button";

/**
 * ErrorBoundary - Error Boundary компонент для обработки ошибок
 */

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: ErrorInfo) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error,
      errorInfo,
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.state.errorInfo!);
      }

      return (
        <Card
          design={{
            padding: 4,
            margin: 4,
            border: "2px solid",
            borderColor: "color.danger",
            bg: "color.bg.tertiary",
          }}
        >
          <Flex design={{ flexDirection: "column", gap: 3 }}>
            <Heading level={3} design={{ color: "color.danger" }}>
              Что-то пошло не так
            </Heading>

            <Text design={{ color: "color.text.secondary" }}>
              Произошла непредвиденная ошибка. Пожалуйста, попробуйте обновить страницу.
            </Text>

            {this.props.showDetails && this.state.error && (
              <details
                style={{
                  padding: "1rem",
                  background: "var(--color-bg-tertiary)",
                  borderRadius: "var(--radius-md)",
                  fontSize: "0.875rem",
                }}
              >
                <summary style={{ cursor: "pointer",  marginBottom: "0.5rem" }}>
                  Детали ошибки
                </summary>
                <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <Flex design={{ gap: 2 }}>
              <Button
                onClick={this.handleReset}
                preset="primary"
              >
                Попробовать снова
              </Button>
              <Button
                onClick={() => window.location.reload()}
                preset="secondary"
              >
                Обновить страницу
              </Button>
            </Flex>
          </Flex>
        </Card>
      );
    }

    return this.props.children;
  }
}

