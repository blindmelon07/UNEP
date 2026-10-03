import { Form, Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Field, Input, Textarea } from '@/components/ui/form';
import { formatCurrency, formatDate } from '@/lib/format';
import { index as bookingIndex, store } from '@/routes/booking';
import type { RoomType } from '@/types';

type Stay = {
    check_in: string;
    check_out: string;
    guests: string;
    nights: number;
    total: number;
    available_rooms: number;
};

export default function BookingCreate({
    roomType,
    stay,
}: {
    roomType: RoomType;
    stay: Stay;
}) {
    const backUrl = bookingIndex.url({
        query: {
            check_in: stay.check_in,
            check_out: stay.check_out,
            guests: stay.guests,
        },
    });

    return (
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
            <Head title={`Book ${roomType.name}`} />
            <Link
                href={backUrl}
                className="text-sm text-slate-500 hover:text-slate-800"
            >
                ← Change room or dates
            </Link>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                Your details
            </h1>

            <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem]">
                {stay.available_rooms < 1 ? (
                    <p className="rounded-xl bg-amber-50 p-5 text-sm text-amber-900 ring-1 ring-amber-200">
                        Sorry, the {roomType.name} was just booked out for these
                        dates.{' '}
                        <Link href={backUrl} className="font-medium underline">
                            See other rooms
                        </Link>
                        .
                    </p>
                ) : (
                    <Form
                        {...store.form(roomType.slug)}
                        className="grid gap-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200 sm:grid-cols-2"
                    >
                        {({ errors, processing }) => (
                            <>
                                <input
                                    type="hidden"
                                    name="check_in"
                                    value={stay.check_in}
                                />
                                <input
                                    type="hidden"
                                    name="check_out"
                                    value={stay.check_out}
                                />
                                <Field
                                    label="First name"
                                    htmlFor="first_name"
                                    error={errors.first_name}
                                >
                                    <Input
                                        id="first_name"
                                        name="first_name"
                                        autoComplete="given-name"
                                        required
                                    />
                                </Field>
                                <Field
                                    label="Last name"
                                    htmlFor="last_name"
                                    error={errors.last_name}
                                >
                                    <Input
                                        id="last_name"
                                        name="last_name"
                                        autoComplete="family-name"
                                        required
                                    />
                                </Field>
                                <Field
                                    label="Email"
                                    htmlFor="email"
                                    error={errors.email}
                                >
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                    />
                                </Field>
                                <Field
                                    label="Mobile number"
                                    htmlFor="phone"
                                    error={errors.phone}
                                >
                                    <Input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        autoComplete="tel"
                                        placeholder="09XX XXX XXXX"
                                        required
                                    />
                                </Field>
                                <Field
                                    label="Adults"
                                    htmlFor="adults"
                                    error={errors.adults}
                                >
                                    <Input
                                        id="adults"
                                        name="adults"
                                        type="number"
                                        min={1}
                                        max={roomType.capacity}
                                        defaultValue={Math.min(
                                            Number(stay.guests),
                                            roomType.capacity,
                                        )}
                                        required
                                    />
                                </Field>
                                <Field
                                    label="Children"
                                    htmlFor="children"
                                    error={errors.children}
                                >
                                    <Input
                                        id="children"
                                        name="children"
                                        type="number"
                                        min={0}
                                        max={roomType.capacity - 1}
                                        defaultValue={0}
                                    />
                                </Field>
                                <Field
                                    label="Special requests (optional)"
                                    htmlFor="special_requests"
                                    error={errors.special_requests}
                                    className="sm:col-span-2"
                                >
                                    <Textarea
                                        id="special_requests"
                                        name="special_requests"
                                        placeholder="Early check-in, extra pillows, celebrating an occasion…"
                                    />
                                </Field>
                                {(errors.room_type_id ||
                                    errors.check_in ||
                                    errors.check_out) && (
                                    <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700 sm:col-span-2">
                                        {errors.room_type_id ??
                                            errors.check_in ??
                                            errors.check_out}
                                    </p>
                                )}
                                <div className="sm:col-span-2">
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full bg-brand-800 sm:w-auto"
                                    >
                                        {processing
                                            ? 'Reserving…'
                                            : 'Reserve now'}
                                    </Button>
                                    <p className="mt-2 text-xs text-slate-500">
                                        Your booking is held as pending until
                                        our front desk confirms it. Payment is
                                        collected at the hotel.
                                    </p>
                                </div>
                            </>
                        )}
                    </Form>
                )}

                <aside className="h-fit rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
                    <h2 className="font-semibold">{roomType.name}</h2>
                    <dl className="mt-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <dt className="text-slate-500">Check-in</dt>
                            <dd>{formatDate(stay.check_in)}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-slate-500">Check-out</dt>
                            <dd>{formatDate(stay.check_out)}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-slate-500">
                                {formatCurrency(roomType.base_rate)} ×{' '}
                                {stay.nights} night
                                {stay.nights === 1 ? '' : 's'}
                            </dt>
                            <dd>{formatCurrency(stay.total)}</dd>
                        </div>
                        <div className="flex justify-between border-t border-stone-200 pt-3 text-base font-semibold">
                            <dt>Total</dt>
                            <dd className="text-brand-800">
                                {formatCurrency(stay.total)}
                            </dd>
                        </div>
                    </dl>
                </aside>
            </div>
        </div>
    );
}
