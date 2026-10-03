import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type Tone = 'gray' | 'green' | 'blue' | 'amber' | 'red' | 'purple';

const tones: Record<Tone, string> = {
    gray: 'bg-slate-100 text-slate-700 ring-slate-500/20',
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    blue: 'bg-sky-50 text-sky-700 ring-sky-600/20',
    amber: 'bg-amber-50 text-amber-800 ring-amber-600/20',
    red: 'bg-rose-50 text-rose-700 ring-rose-600/20',
    purple: 'bg-violet-50 text-violet-700 ring-violet-600/20',
};

export function Badge({
    tone = 'gray',
    className,
    children,
}: {
    tone?: Tone;
    className?: string;
    children: ReactNode;
}) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset',
                tones[tone],
                className,
            )}
        >
            {children}
        </span>
    );
}

const statusTones: Record<string, Tone> = {
    available: 'green',
    occupied: 'blue',
    cleaning: 'amber',
    maintenance: 'red',
    out_of_service: 'gray',
    pending: 'amber',
    confirmed: 'blue',
    checked_in: 'green',
    checked_out: 'gray',
    cancelled: 'gray',
    open: 'amber',
    in_progress: 'blue',
    on_hold: 'purple',
    resolved: 'green',
    low: 'gray',
    medium: 'blue',
    high: 'amber',
    urgent: 'red',
    active: 'green',
    on_leave: 'amber',
    terminated: 'gray',
    in: 'green',
    out: 'red',
    adjustment: 'purple',
};

export function humanize(value: string) {
    return value
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Render any enum value (room, reservation, maintenance, employee status...) with a consistent color.
 */
export function StatusBadge({ status }: { status: string }) {
    return <Badge tone={statusTones[status] ?? 'gray'}>{humanize(status)}</Badge>;
}
