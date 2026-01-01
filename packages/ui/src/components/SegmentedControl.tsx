import React, { CSSProperties } from 'react';

export interface SegmentedControlOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface SegmentedControlProps {
  value: string;
  onChange: (value: string) => void;
  options: SegmentedControlOption[];
  design?: CSSProperties;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  value,
  onChange,
  options,
  design,
  size = 'md',
  fullWidth = false,
}) => {
  const sizeStyles = {
    sm: { padding: '0.375rem 0.75rem', fontSize: '0.875rem' },
    md: { padding: '0.5rem 1rem', fontSize: '0.9375rem' },
    lg: { padding: '0.625rem 1.25rem', fontSize: '1rem' },
  };

  const containerStyle: React.CSSProperties = {
    display: 'inline-flex',
    backgroundColor: '#F3F4F6',
    borderRadius: '0.5rem',
    padding: '0.25rem',
    gap: '0.25rem',
    width: fullWidth ? '100%' : 'auto',
    ...design,
  };

  const buttonBaseStyle: React.CSSProperties = {
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    borderRadius: '0.375rem',
    transition: 'all 0.2s',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flex: fullWidth ? 1 : 'none',
    justifyContent: 'center',
    ...sizeStyles[size],
  };

  const activeStyle: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    color: '#111827',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  };

  const inactiveStyle: React.CSSProperties = {
    color: '#6B7280',
  };

  const disabledStyle: React.CSSProperties = {
    cursor: 'not-allowed',
    opacity: 0.5,
  };

  return (
    <div style={containerStyle}>
      {options.map((option) => {
        const isActive = value === option.value;
        const isDisabled = option.disabled;

        return (
          <button
            key={option.value}
            onClick={() => !isDisabled && onChange(option.value)}
            style={{
              ...buttonBaseStyle,
              ...(isActive ? activeStyle : inactiveStyle),
              ...(isDisabled ? disabledStyle : {}),
            }}
            disabled={isDisabled}
            type="button"
          >
            {option.icon}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};

