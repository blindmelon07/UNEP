import { Head, Link } from '@inertiajs/react';
import { buttonClasses } from '@/components/ui/button';
import { formatCurrency, formatDate, nightsBetween } from '@/lib/format';
import { home } from '@/routes';
import type { Reservation } from '@/types';

export default function BookingConfirmation({
    reservation,
}: {
    reservation: Reservation;
}) {
    const nights = nightsBetween(reservation.check_in, reservation.check_out);

    return (
        <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
            <Head title="Booking received" />
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-stone-200">
                <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 text-xl text-emerald-700">
                    ✓
                </span>
                <h1 className="mt-4 text-2xl font-semibold tracking-tight">
                    Thank you, {reservation.guest?.first_name}!
                </h1>
                <p className="mt-2 text-slate-600">
                    We have received your booking. Our front desk will confirm
                    it shortly at{' '}
                    <span className="font-medium text-slate-900">
                        {reservation.guest?.email}
                    </span>
                    .
                </p>
                <p className="mt-6 text-sm text-slate-500">Booking reference</p>
                <p className="font-mono text-2xl font-semibold tracking-wider text-brand-800">
                    {reservation.code}
                </p>
                <dl className="mt-6 grid grid-cols-2 gap-4 rounded-xl bg-stone-50 p-4 text-left text-sm">
                    <div>
                        <dt className="text-slate-500">Room</dt>
                        <dd className="font-medium">
                            {reservation.room_type?.name}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-slate-500">Guests</dt>
                        <dd className="font-medium">
                            {reservation.adults} adult
                            {reservation.adults === 1 ? '' : 's'}
                            {reservation.children > 0 &&
                                `, ${reservation.children} child${reservation.children === 1 ? '' : 'ren'}`}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-slate-500">Check-in</dt>
                        <dd className="font-medium">
                            {formatDate(reservation.check_in)}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-slate-500">Check-out</dt>
                        <dd className="font-medium">
                            {formatDate(reservation.check_out)}
                        </dd>
                    </div>
                    <div className="col-span-2 flex justify-between border-t border-stone-200 pt-3">
                        <dt className="text-slate-500">
                            Total for {nights} night{nights === 1 ? '' : 's'}
                        </dt>
                        <dd className="font-semibold">
                            {formatCurrency(reservation.room_total)}
                        </dd>
                    </div>
                </dl>
                <Link
                    href={home.url()}
                    className={buttonClasses({
                        variant: 'secondary',
                        className: 'mt-8',
                    })}
                >
                    Back to home
                </Link>
            </div>
        </div>
    );
}
