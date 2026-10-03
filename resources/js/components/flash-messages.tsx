import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type Toast = { id: number; kind: 'success' | 'error'; message: string };

/**
 * Show one-time flash messages sent with `Inertia::flash('success' | 'error', ...)` as toasts.
 */
export function FlashMessages() {
    const [toasts, setToasts] = useState<Toast[]>([]);

    useEffect(() => {
        return router.on('flash', (event) => {
            const flash = event.detail.flash;
            const incoming: Toast[] = [];

            if (flash.success) {
                incoming.push({
                    id: Date.now(),
                    kind: 'success',
                    message: flash.success,
                });
            }

            if (flash.error) {
                incoming.push({
                    id: Date.now() + 1,
                    kind: 'error',
                    message: flash.error,
                });
            }

            if (incoming.length === 0) {
                return;
            }

            setToasts((current) => [...current, ...incoming]);

            for (const toast of incoming) {
                window.setTimeout(() => {
                    setToasts((current) =>
                        current.filter((item) => item.id !== toast.id),
                    );
                }, 5000);
            }
        });
    }, []);

    return (
        <div
            aria-live="polite"
            className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-end gap-2 sm:right-6 sm:left-auto"
        >
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    role={toast.kind === 'error' ? 'alert' : 'status'}
                    className={cn(
                        'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg px-4 py-3 text-sm shadow-lg ring-1',
                        toast.kind === 'success'
                            ? 'bg-emerald-50 text-emerald-900 ring-emerald-200'
                            : 'bg-rose-50 text-rose-900 ring-rose-200',
                    )}
                >
                    <span aria-hidden className="font-semibold">
                        {toast.kind === 'success' ? '✓' : '!'}
                    </span>
                    <p className="flex-1">{toast.message}</p>
                    <button
                        type="button"
                        aria-label="Dismiss"
                        className="cursor-pointer opacity-60 hover:opacity-100"
                        onClick={() =>
                            setToasts((current) =>
                                current.filter((item) => item.id !== toast.id),
                            )
                        }
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
}
