import { router } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

type DeleteButtonProps = {
    href: string;
    confirmMessage: string;
    children?: ReactNode;
    size?: 'sm' | 'md';
    variant?: 'danger' | 'ghost' | 'secondary';
};

export function DeleteButton({
    href,
    confirmMessage,
    children = 'Delete',
    size = 'sm',
    variant = 'ghost',
}: DeleteButtonProps) {
    return (
        <Button
            variant={variant}
            size={size}
            className={
                variant === 'ghost'
                    ? 'text-rose-600 hover:bg-rose-50 hover:text-rose-700'
                    : undefined
            }
            onClick={() => {
                if (window.confirm(confirmMessage)) {
                    router.delete(href, { preserveScroll: true });
                }
            }}
        >
            {children}
        </Button>
    );
}

type ActionButtonProps = {
    href: string;
    method?: 'post' | 'put' | 'patch';
    data?: Record<string, string | number>;
    confirmMessage?: string;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md';
    children: ReactNode;
};

/**
 * A button that submits a one-off request (check in, cancel, mark clean...) with an optional confirmation.
 */
export function ActionButton({
    href,
    method = 'post',
    data = {},
    confirmMessage,
    variant = 'primary',
    size = 'md',
    children,
}: ActionButtonProps) {
    return (
        <Button
            variant={variant}
            size={size}
            onClick={() => {
                if (!confirmMessage || window.confirm(confirmMessage)) {
                    router.visit(href, { method, data, preserveScroll: true });
                }
            }}
        >
            {children}
        </Button>
    );
}
