import type {
    HTMLAttributes,
    TdHTMLAttributes,
    ThHTMLAttributes,
} from 'react';
import { cn } from '@/lib/utils';

export function Table({
    className,
    ...props
}: HTMLAttributes<HTMLTableElement>) {
    return (
        <div className="overflow-x-auto">
            <table
                className={cn(
                    'min-w-full divide-y divide-slate-200 text-sm',
                    className,
                )}
                {...props}
            />
        </div>
    );
}

export function Th({
    className,
    ...props
}: ThHTMLAttributes<HTMLTableCellElement>) {
    return (
        <th
            scope="col"
            className={cn(
                'bg-slate-50 px-4 py-2.5 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase first:pl-5 last:pr-5',
                className,
            )}
            {...props}
        />
    );
}

export function Td({
    className,
    ...props
}: TdHTMLAttributes<HTMLTableCellElement>) {
    return (
        <td
            className={cn(
                'px-4 py-3 align-middle text-slate-700 first:pl-5 last:pr-5',
                className,
            )}
            {...props}
        />
    );
}

export function TBody({
    className,
    ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
    return (
        <tbody
            className={cn('divide-y divide-slate-100 bg-white', className)}
            {...props}
        />
    );
}

export function EmptyRow({
    colSpan,
    message,
}: {
    colSpan: number;
    message: string;
}) {
    return (
        <tr>
            <td
                colSpan={colSpan}
                className="px-5 py-10 text-center text-sm text-slate-500"
            >
                {message}
            </td>
        </tr>
    );
}
