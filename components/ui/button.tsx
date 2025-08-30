'use client';

import * as React from 'react';

export type ButtonVariant = 'default' | 'outline' | 'ghost' | (string & {});
export type ButtonSize = 'sm' | 'md' | 'lg' | (string & {});

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function buttonVariants(opts?: { variant?: ButtonVariant; size?: ButtonSize }) {
  const variant = opts?.variant ?? 'default';
  const size = opts?.size ?? 'md';

  const base = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none';
  const variants: Record<string, string> = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-200 bg-white text-gray-900 hover:bg-gray-50',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
  };
  const sizes: Record<string, string> = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-5 text-base',
  };

  return [
    base,
    variants[variant] ?? variants.default,
    sizes[size] ?? sizes.md,
  ].join(' ');
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'default', size = 'md', ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={[buttonVariants({ variant, size }), className].filter(Boolean).join(' ')}
      {...props}
    />
  );
});

export default Button;
