import { Link, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { BrandCrest } from '@/components/brand-crest';
import { FlashMessages } from '@/components/flash-messages';
import { humanize } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { home, logout } from '@/routes';
import { dashboard } from '@/routes/admin';
import { index as departmentsIndex } from '@/routes/admin/departments';
import { index as employeesIndex } from '@/routes/admin/employees';
import { index as guestsIndex } from '@/routes/admin/guests';
import { index as categoriesIndex } from '@/routes/admin/inventory-categories';
import { index as itemsIndex } from '@/routes/admin/inventory-items';
import { index as maintenanceIndex } from '@/routes/admin/maintenance-requests';
import { index as reservationsIndex } from '@/routes/admin/reservations';
import { index as roomTypesIndex } from '@/routes/admin/room-types';
import { index as roomsIndex } from '@/routes/admin/rooms';
import { index as shiftsIndex } from '@/routes/admin/shifts';
import { index as usersIndex } from '@/routes/admin/users';
import type { Module } from '@/types';

type NavItem = { label: string; href: string; modules: Module[] };
type NavSection = { title: string; items: NavItem[] };

const navigation: NavSection[] = [
    {
        title: 'Front Office',
        items: [
            {
                label: 'Reservations',
                href: reservationsIndex.url(),
                modules: ['reservations'],
            },
            {
                label: 'Guests',
                href: guestsIndex.url(),
                modules: ['reservations'],
            },
            {
                label: 'Rooms',
                href: roomsIndex.url(),
                modules: ['reservations', 'maintenance'],
            },
            {
                label: 'Room Types',
                href: roomTypesIndex.url(),
                modules: ['reservations'],
            },
        ],
    },
    {
        title: 'Inventory',
        items: [
            {
                label: 'Stock Items',
                href: itemsIndex.url(),
                modules: ['inventory'],
            },
            {
                label: 'Categories',
                href: categoriesIndex.url(),
                modules: ['inventory'],
            },
        ],
    },
    {
        title: 'Maintenance',
        items: [
            {
                label: 'Work Orders',
                href: maintenanceIndex.url(),
                modules: ['maintenance'],
            },
        ],
    },
    {
        title: 'Human Resources',
        items: [
            {
                label: 'Employees',
                href: employeesIndex.url(),
                modules: ['employees'],
            },
            {
                label: 'Departments',
                href: departmentsIndex.url(),
                modules: ['employees'],
            },
            {
                label: 'Shift Roster',
                href: shiftsIndex.url(),
                modules: ['employees'],
            },
        ],
    },
    {
        title: 'Administration',
        items: [
            {
                label: 'Staff Accounts',
                href: usersIndex.url(),
                modules: ['users'],
            },
        ],
    },
];

function isActive(currentUrl: string, href: string) {
    const path = currentUrl.split('?')[0];

    return path === href || path.startsWith(`${href}/`);
}

export default function AdminLayout({ children }: { children: ReactNode }) {
    const page = usePage();
    const { auth, name } = page.props;
    const currentUrl = page.url;
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const sections = navigation
        .map((section) => ({
            ...section,
            items: section.items.filter((item) =>
                item.modules.some((module) => auth.modules.includes(module)),
            ),
        }))
        .filter((section) => section.items.length > 0);

    const sidebar = (
        <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-5">
            <Link
                href={dashboard.url()}
                className={cn(
                    'rounded-lg px-3 py-2 text-sm font-medium',
                    currentUrl.split('?')[0] === dashboard.url()
                        ? 'bg-white/10 text-white'
                        : 'text-brand-100 hover:bg-white/5 hover:text-white',
                )}
            >
                Dashboard
            </Link>
            {sections.map((section) => (
                <div key={section.title}>
                    <p className="px-3 pb-1.5 text-[11px] font-semibold tracking-wider text-brand-300 uppercase">
                        {section.title}
                    </p>
                    <ul className="flex flex-col gap-0.5">
                        {section.items.map((item) => (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    prefetch
                                    className={cn(
                                        'block rounded-lg px-3 py-2 text-sm font-medium',
                                        isActive(currentUrl, item.href)
                                            ? 'bg-white/10 text-white'
                                            : 'text-brand-100 hover:bg-white/5 hover:text-white',
                                    )}
                                >
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </nav>
    );

    return (
        <div className="min-h-screen bg-slate-50">
            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-brand-900 transition-transform lg:translate-x-0',
                    isMenuOpen ? 'translate-x-0' : '-translate-x-full',
                )}
            >
                <div className="flex h-18 items-center gap-3 border-b border-white/10 px-5">
                    <BrandCrest className="size-10" />
                    <div className="min-w-0 leading-tight">
                        <p className="text-sm font-semibold text-white">
                            {name}
                        </p>
                        <p className="text-xs text-brand-300">Staff portal</p>
                    </div>
                </div>
                {sidebar}
                <div className="border-t border-white/10 p-4">
                    <p className="truncate text-sm font-medium text-white">
                        {auth.user?.name}
                    </p>
                    <p className="text-xs text-brand-300">
                        {auth.user ? humanize(auth.user.role) : ''}
                    </p>
                    <div className="mt-3 flex gap-3 text-xs">
                        <Link
                            href={home.url()}
                            className="text-brand-200 hover:text-white"
                        >
                            Public site
                        </Link>
                        <Link
                            href={logout.url()}
                            method="post"
                            as="button"
                            className="cursor-pointer text-brand-200 hover:text-white"
                        >
                            Log out
                        </Link>
                    </div>
                </div>
            </aside>

            {isMenuOpen && (
                <button
                    type="button"
                    aria-label="Close menu"
                    className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}

            <div className="lg:pl-64">
                <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur lg:hidden">
                    <button
                        type="button"
                        className="cursor-pointer rounded-md p-2 text-slate-600 hover:bg-slate-100"
                        aria-label="Open menu"
                        onClick={() => setIsMenuOpen(true)}
                    >
                        <svg
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="size-5"
                        >
                            <path d="M3 5h14v1.5H3zM3 9.25h14v1.5H3zM3 13.5h14V15H3z" />
                        </svg>
                    </button>
                    <span className="text-sm font-semibold text-slate-900">
                        {name}
                    </span>
                </header>
                <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                    {children}
                </main>
            </div>
            <FlashMessages />
        </div>
    );
}
