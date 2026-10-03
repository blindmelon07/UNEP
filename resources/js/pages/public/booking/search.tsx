import { Head, Link } from '@inertiajs/react';
import { RoomTypeCard } from '@/components/room-type-card';
import { StaySearchForm } from '@/components/stay-search-form';
import { buttonClasses } from '@/components/ui/button';
import { formatCurrency, formatDate, nightsBetween } from '@/lib/format';
import { create } from '@/routes/booking';
import type { RoomType } from '@/types';

type Filters = { check_in: string; check_out: string; guests: string };

export default function BookingSearch({
    filters,
    roomTypes,
}: {
    filters: Filters | null;
    roomTypes: RoomType[];
}) {
    const nights = filters
        ? nightsBetween(filters.check_in, filters.check_out)
        : 0;

    return (
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
            <Head title="Book a stay" />
            <h1 className="mb-6 text-3xl font-semibold tracking-tight">
                Book a stay
            </h1>
            <StaySearchForm defaults={filters} />

            {filters && (
                <section className="mt-10">
                    <h2 className="text-lg font-semibold">
                        {roomTypes.length > 0
                            ? `${roomTypes.length} room type${roomTypes.length === 1 ? '' : 's'} available`
                            : 'No rooms available'}
                    </h2>
                    <p className="text-sm text-slate-600">
                        {formatDate(filters.check_in)} →{' '}
                        {formatDate(filters.check_out)} · {nights} night
                        {nights === 1 ? '' : 's'} · {filters.guests} guest
                        {Number(filters.guests) === 1 ? '' : 's'}
                    </p>

                    {roomTypes.length === 0 ? (
                        <p className="mt-6 rounded-xl bg-amber-50 p-5 text-sm text-amber-900 ring-1 ring-amber-200">
                            We are fully booked for those dates or party size.
                            Try different dates or fewer guests per room.
                        </p>
                    ) : (
                        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {roomTypes.map((roomType, index) => (
                                <RoomTypeCard
                                    key={roomType.id}
                                    roomType={roomType}
                                    index={index}
                                    footer={
                                        <div className="flex items-center justify-between gap-3 border-t border-stone-100 pt-4">
                                            <div>
                                                <p className="font-semibold">
                                                    {formatCurrency(
                                                        Number(
                                                            roomType.base_rate,
                                                        ) * nights,
                                                    )}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {roomType.available_rooms !==
                                                        undefined &&
                                                    roomType.available_rooms <=
                                                        3
                                                        ? `Only ${roomType.available_rooms} left`
                                                        : `Total for ${nights} night${nights === 1 ? '' : 's'}`}
                                                </p>
                                            </div>
                                            <Link
                                                href={create.url(
                                                    roomType.slug,
                                                    {
                                                        query: { ...filters },
                                                    },
                                                )}
                                                className={buttonClasses({
                                                    className: 'bg-brand-800',
                                                })}
                                            >
                                                Select
                                            </Link>
                                        </div>
                                    }
                                />
                            ))}
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}
