import { Head, Link } from '@inertiajs/react';
import type { ReactNode } from 'react';

type PageHeaderProps = {
    title: string;
    description?: ReactNode;
    actions?: ReactNode;
    back?: { href: string; label: string };
};

export function PageHeader({
    title,
    description,
    actions,
    back,
}: PageHeaderProps) {
    return (
        <>
            <Head title={title} />
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div className="min-w-0">
                    {back && (
                        <Link
                            href={back.href}
                            className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
                        >
                            <span aria-hidden>←</span> {back.label}
                        </Link>
                    )}
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                        {title}
                    </h1>
                    {description && (
                        <div className="mt-1 text-sm text-slate-500">
                            {description}
                        </div>
                    )}
                </div>
                {actions && (
                    <div className="flex flex-wrap items-center gap-2">
                        {actions}
                    </div>
                )}
            </div>
        </>
    );
}
