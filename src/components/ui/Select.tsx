'use client';

import React, { forwardRef, SelectHTMLAttributes } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** 选项列表 */
  options: SelectOption[];
  /** 占位符文本 */
  placeholder?: string;
  /** 选择框大小 */
  size?: 'sm' | 'md' | 'lg';
  /** 标签文本 */
  label?: string;
  /** 错误信息 */
  error?: string;
  /** 是否全宽 */
  fullWidth?: boolean;
}

/**
 * 下拉选择组件
 * 支持自定义选项、占位符、错误状态等
 */
const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      options,
      placeholder,
      size = 'md',
      label,
      error,
      fullWidth = false,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    // 大小样式
    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-5 py-3 text-lg',
    };

    // 基础样式
    const baseStyles = `
      input-base
      appearance-none
      cursor-pointer
      pr-10
      ${sizeStyles[size]}
      ${fullWidth ? 'w-full' : ''}
      ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    `;

    return (
      <div className={`${fullWidth ? 'w-full' : 'inline-block'}`}>
        {label && (
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={`${baseStyles} ${className}`.replace(/\s+/g, ' ').trim()}
            disabled={disabled}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          {/* 下拉箭头图标 */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg
              className="h-4 w-4 text-[var(--muted-foreground)]"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
