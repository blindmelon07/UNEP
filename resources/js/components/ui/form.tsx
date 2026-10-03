import type {
    InputHTMLAttributes,
    LabelHTMLAttributes,
    ReactNode,
    SelectHTMLAttributes,
    TextareaHTMLAttributes,
} from 'react';
import { cn } from '@/lib/utils';
import type { Option } from '@/types';

const controlClasses =
    'block w-full rounded-lg border-0 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm ring-1 ring-slate-300 ring-inset placeholder:text-slate-400 focus:ring-2 focus:ring-brand-600 focus:outline-none disabled:bg-slate-50 disabled:text-slate-500 aria-invalid:ring-rose-500';

export function Label({
    className,
    ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
    return (
        <label
            className={cn(
                'block text-sm font-medium text-slate-700',
                className,
            )}
            {...props}
        />
    );
}

export function Input({
    className,
    ...props
}: InputHTMLAttributes<HTMLInputElement>) {
    return <input className={cn(controlClasses, 'h-10', className)} {...props} />;
}

export function Textarea({
    className,
    ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return (
        <textarea
            rows={3}
            className={cn(controlClasses, className)}
            {...props}
        />
    );
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
    options: Option[];
    placeholder?: string;
};

export function Select({
    options,
    placeholder,
    className,
    ...props
}: SelectProps) {
    return (
        <select className={cn(controlClasses, 'h-10 pr-8', className)} {...props}>
            {placeholder !== undefined && <option value="">{placeholder}</option>}
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
}

export function Checkbox({
    label,
    className,
    ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: ReactNode }) {
    return (
        <label
            className={cn(
                'flex cursor-pointer items-start gap-2.5 text-sm text-slate-700',
                className,
            )}
        >
            <input
                type="checkbox"
                className="mt-0.5 size-4 rounded border-slate-300 accent-brand-700"
                {...props}
            />
            <span>{label}</span>
        </label>
    );
}

export function InputError({ message }: { message?: string }) {
    if (!message) {
        return null;
    }

    return <p className="mt-1.5 text-sm text-rose-600">{message}</p>;
}

type FieldProps = {
    label: string;
    htmlFor: string;
    error?: string;
    hint?: string;
    className?: string;
    children: ReactNode;
};

export function Field({
    label,
    htmlFor,
    error,
    hint,
    className,
    children,
}: FieldProps) {
    return (
        <div className={className}>
            <Label htmlFor={htmlFor} className="mb-1.5">
                {label}
            </Label>
            {children}
            {hint && !error && (
                <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
            )}
            <InputError message={error} />
        </div>
    );
}

export function toOptions<T extends { id: number }>(
    records: T[],
    label: (record: T) => string,
): Option[] {
    return records.map((record) => ({
        value: String(record.id),
        label: label(record),
    }));
}
