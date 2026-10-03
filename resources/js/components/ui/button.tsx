import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md';

const variants: Record<Variant, string> = {
    primary:
        'bg-brand-700 text-white shadow-sm hover:bg-brand-800 focus-visible:outline-brand-700',
    secondary:
        'bg-white text-slate-700 shadow-sm ring-1 ring-slate-300 ring-inset hover:bg-slate-50 focus-visible:outline-slate-400',
    danger: 'bg-rose-600 text-white shadow-sm hover:bg-rose-700 focus-visible:outline-rose-600',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-slate-400',
};

const sizes: Record<Size, string> = {
    sm: 'h-8 gap-1.5 px-3 text-xs',
    md: 'h-10 gap-2 px-4 text-sm',
};

export function buttonClasses({
    variant = 'primary',
    size = 'md',
    className,
}: { variant?: Variant; size?: Size; className?: string } = {}) {
    return cn(
        'inline-flex cursor-pointer items-center justify-center rounded-lg font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
    );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: Variant;
    size?: Size;
};

export function Button({
    variant,
    size,
    className,
    type = 'button',
    ...props
}: ButtonProps) {
    return (
        <button
            type={type}
            className={buttonClasses({ variant, size, className })}
            {...props}
        />
    );
}
