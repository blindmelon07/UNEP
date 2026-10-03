import { Link, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { BrandCrest } from '@/components/brand-crest';
import { FlashMessages } from '@/components/flash-messages';
import { home, login } from '@/routes';
import { dashboard } from '@/routes/admin';
import { index as bookingIndex } from '@/routes/booking';

export default function PublicLayout({ children }: { children: ReactNode }) {
    const { auth, name, hotel } = usePage().props;

    return (
        <div className="flex min-h-screen flex-col bg-stone-50 text-slate-900">
            <div className="h-1 bg-gradient-to-r from-brand-800 via-gold-500 to-ember-500" />
            <header className="border-b border-stone-200 bg-white">
                <div className="mx-auto flex h-18 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
                    <Link
                        href={home.url()}
                        className="flex min-w-0 items-center gap-3"
                    >
                        <BrandCrest className="size-11" />
                        <span className="min-w-0 leading-tight">
                            <span className="block font-semibold tracking-tight text-brand-900">
                                {name}
                            </span>
                            <span className="hidden truncate text-xs text-slate-500 sm:block">
                                {hotel.department}
                            </span>
                        </span>
                    </Link>
                    <nav className="flex shrink-0 items-center gap-1 text-sm sm:gap-4">
                        <Link
                            href={bookingIndex.url()}
                            className="rounded-lg bg-brand-800 px-3.5 py-2 font-medium text-white hover:bg-brand-900"
                        >
                            Book a stay
                        </Link>
                        <Link
                            href={auth.user ? dashboard.url() : login.url()}
                            className="px-2 py-2 text-slate-600 hover:text-brand-800"
                        >
                            {auth.user ? 'Staff portal' : 'Staff login'}
                        </Link>
                    </nav>
                </div>
            </header>
            <main className="flex-1">{children}</main>
            <footer className="bg-brand-950 text-brand-100">
                <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
                    <div className="flex gap-4">
                        <BrandCrest className="size-16" />
                        <div>
                            <p className="font-semibold text-white">{name}</p>
                            <p className="mt-1 text-sm">{hotel.department}</p>
                            <p className="text-sm">{hotel.school}</p>
                        </div>
                    </div>
                    <div className="text-sm">
                        <p className="font-semibold text-gold-400">Visit us</p>
                        <p className="mt-2">{hotel.address}</p>
                        <a
                            href={hotel.website}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 inline-block hover:text-white"
                        >
                            {hotel.website.replace(/^https?:\/\//, '')}
                        </a>
                    </div>
                    <div className="text-sm">
                        <p className="font-semibold text-gold-400">Contact</p>
                        <p className="mt-2">{hotel.phone}</p>
                        <a
                            href={`mailto:${hotel.email}`}
                            className="hover:text-white"
                        >
                            {hotel.email}
                        </a>
                    </div>
                </div>
                <div className="border-t border-white/10 py-5 text-center text-xs text-brand-300">
                    <p className="font-medium tracking-[0.2em] text-gold-400 uppercase">
                        {hotel.motto.join(' · ')}
                    </p>
                    <p className="mt-2">
                        © {new Date().getFullYear()} {hotel.school}. All rates
                        in Philippine pesos, inclusive of taxes.
                    </p>
                </div>
            </footer>
            <FlashMessages />
        </div>
    );
}
