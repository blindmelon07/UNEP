import { Link, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { FlashMessages } from '@/components/flash-messages';
import { home, login } from '@/routes';
import { dashboard } from '@/routes/admin';
import { index as bookingIndex } from '@/routes/booking';

export default function PublicLayout({ children }: { children: ReactNode }) {
    const { auth, name } = usePage().props;

    return (
        <div className="flex min-h-screen flex-col bg-stone-50 text-slate-900">
            <header className="border-b border-stone-200 bg-white">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
                    <Link
                        href={home.url()}
                        className="flex items-center gap-2.5"
                    >
                        <span className="flex size-8 items-center justify-center rounded-lg bg-brand-800 text-sm font-bold text-gold-400">
                            H
                        </span>
                        <span className="font-semibold tracking-tight">
                            {name}
                        </span>
                    </Link>
                    <nav className="flex items-center gap-1 text-sm sm:gap-4">
                        <Link
                            href={bookingIndex.url()}
                            className="rounded-lg bg-brand-800 px-3.5 py-2 font-medium text-white hover:bg-brand-900"
                        >
                            Book a stay
                        </Link>
                        <Link
                            href={auth.user ? dashboard.url() : login.url()}
                            className="px-2 py-2 text-slate-600 hover:text-slate-900"
                        >
                            {auth.user ? 'Staff portal' : 'Staff login'}
                        </Link>
                    </nav>
                </div>
            </header>
            <main className="flex-1">{children}</main>
            <footer className="border-t border-stone-200 bg-white py-8 text-center text-sm text-slate-500">
                © {new Date().getFullYear()} {name}. All rates in Philippine
                pesos, inclusive of taxes.
            </footer>
            <FlashMessages />
        </div>
    );
}
