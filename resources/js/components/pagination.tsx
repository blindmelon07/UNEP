import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import type { Paginated } from '@/types';

export function Pagination<T>({ page }: { page: Paginated<T> }) {
    if (page.last_page <= 1) {
        return null;
    }

    return (
        <nav className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-3 text-sm">
            <p className="text-slate-500">
                Showing {page.from}–{page.to} of {page.total}
            </p>
            <div className="flex flex-wrap gap-1">
                {page.links.map((link, index) => {
                    const label = link.label
                        .replace('&laquo;', '‹')
                        .replace('&raquo;', '›');

                    return link.url ? (
                        <Link
                            key={`${link.label}-${index}`}
                            href={link.url}
                            preserveScroll
                            className={cn(
                                'rounded-md px-3 py-1.5',
                                link.active
                                    ? 'bg-brand-700 text-white'
                                    : 'text-slate-600 hover:bg-slate-100',
                            )}
                        >
                            {label}
                        </Link>
                    ) : (
                        <span
                            key={`${link.label}-${index}`}
                            className="rounded-md px-3 py-1.5 text-slate-300"
                        >
                            {label}
                        </span>
                    );
                })}
            </div>
        </nav>
    );
}
