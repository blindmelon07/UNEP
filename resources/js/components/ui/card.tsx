import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                'min-w-0 rounded-xl bg-white shadow-sm ring-1 ring-slate-200',
                className,
            )}
            {...props}
        />
    );
}

type CardHeaderProps = {
    title: string;
    description?: string;
    actions?: ReactNode;
};

export function CardHeader({ title, description, actions }: CardHeaderProps) {
    return (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
            <div>
                <h2 className="text-base font-semibold text-slate-900">
                    {title}
                </h2>
                {description && (
                    <p className="mt-0.5 text-sm text-slate-500">
                        {description}
                    </p>
                )}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
    );
}

export function CardBody({
    className,
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    return <div className={cn('p-5', className)} {...props} />;
}

type StatCardProps = {
    label: string;
    value: ReactNode;
    hint?: ReactNode;
    tone?: 'default' | 'warning' | 'danger' | 'success';
};

const statTones = {
    default: 'text-slate-900',
    warning: 'text-amber-600',
    danger: 'text-rose-600',
    success: 'text-emerald-600',
};

export function StatCard({ label, value, hint, tone = 'default' }: StatCardProps) {
    return (
        <Card className="p-5">
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p
                className={cn(
                    'mt-2 text-2xl font-semibold tabular-nums',
                    statTones[tone],
                )}
            >
                {value}
            </p>
            {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
        </Card>
    );
}
