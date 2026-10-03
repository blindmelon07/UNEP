import { Form, Link } from '@inertiajs/react';
import { ActionButton, DeleteButton } from '@/components/delete-button';
import { PageHeader } from '@/components/page-header';
import { StatusBadge, humanize } from '@/components/ui/badge';
import { Button, buttonClasses } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { Field, Input, Select, toOptions } from '@/components/ui/form';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/format';
import { show as guestShow } from '@/routes/admin/guests';
import { destroy as destroyCharge } from '@/routes/admin/charges';
import { destroy as destroyPayment } from '@/routes/admin/payments';
import { edit, index } from '@/routes/admin/reservations';
import { store as cancel } from '@/routes/admin/reservations/cancellation';
import { store as storeCharge } from '@/routes/admin/reservations/charges';
import { store as checkIn } from '@/routes/admin/reservations/check-in';
import { store as checkOut } from '@/routes/admin/reservations/check-out';
import { store as storePayment } from '@/routes/admin/reservations/payments';
import { update as assignRoom } from '@/routes/admin/reservations/room';
import type { Option, Reservation, RoomStatus } from '@/types';

type Props = {
    reservation: Reservation;
    folio: {
        nights: number;
        charges_total: number;
        grand_total: number;
        paid: number;
        balance: number;
    };
    assignableRooms: {
        id: number;
        number: string;
        floor: number;
        status: RoomStatus;
    }[];
    paymentMethods: Option[];
};

export default function ReservationShow({
    reservation,
    folio,
    assignableRooms,
    paymentMethods,
}: Props) {
    const isEditable =
        reservation.status === 'pending' || reservation.status === 'confirmed';
    const isCheckedIn = reservation.status === 'checked_in';
    const isClosed =
        reservation.status === 'checked_out' ||
        reservation.status === 'cancelled';
    const guest = reservation.guest!;

    return (
        <>
            <PageHeader
                title={reservation.code}
                back={{ href: index.url(), label: 'Reservations' }}
                description={
                    <span className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={reservation.status} />
                        <span>
                            {humanize(reservation.source)} booking ·{' '}
                            {formatDate(reservation.check_in)} –{' '}
                            {formatDate(reservation.check_out)}
                        </span>
                    </span>
                }
                actions={
                    <>
                        {isEditable && (
                            <>
                                <ActionButton
                                    href={checkIn.url(reservation.id)}
                                >
                                    Check in
                                </ActionButton>
                                <Link
                                    href={edit.url(reservation.id)}
                                    className={buttonClasses({
                                        variant: 'secondary',
                                    })}
                                >
                                    Edit
                                </Link>
                                <ActionButton
                                    href={cancel.url(reservation.id)}
                                    variant="secondary"
                                    confirmMessage={`Cancel reservation ${reservation.code}?`}
                                >
                                    Cancel booking
                                </ActionButton>
                            </>
                        )}
                        {isCheckedIn && (
                            <ActionButton
                                href={checkOut.url(reservation.id)}
                                confirmMessage="Check this guest out?"
                            >
                                Check out
                            </ActionButton>
                        )}
                    </>
                }
            />

            <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
                <div className="flex flex-col gap-6">
                    <Card>
                        <CardHeader
                            title="Folio"
                            description="Room charges, extras and payments"
                        />
                        <table className="w-full text-sm">
                            <tbody className="divide-y divide-slate-100">
                                <tr>
                                    <td className="px-5 py-3">
                                        {reservation.room_type?.name} ·{' '}
                                        {folio.nights} night
                                        {folio.nights === 1 ? '' : 's'} ×{' '}
                                        {formatCurrency(
                                            reservation.nightly_rate,
                                        )}
                                    </td>
                                    <td className="px-5 py-3 text-right tabular-nums">
                                        {formatCurrency(reservation.room_total)}
                                    </td>
                                    <td className="w-20" />
                                </tr>
                                {reservation.charges?.map((charge) => (
                                    <tr key={charge.id}>
                                        <td className="px-5 py-3">
                                            {charge.description}
                                            <span className="block text-xs text-slate-500">
                                                {formatDateTime(
                                                    charge.created_at,
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-right tabular-nums">
                                            {formatCurrency(charge.amount)}
                                        </td>
                                        <td className="pr-3 text-right">
                                            {!isClosed && (
                                                <DeleteButton
                                                    href={destroyCharge.url(
                                                        charge.id,
                                                    )}
                                                    confirmMessage="Remove this charge?"
                                                >
                                                    Remove
                                                </DeleteButton>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                <tr className="bg-slate-50 font-medium">
                                    <td className="px-5 py-3">Total charges</td>
                                    <td className="px-5 py-3 text-right tabular-nums">
                                        {formatCurrency(folio.grand_total)}
                                    </td>
                                    <td />
                                </tr>
                                {reservation.payments?.map((payment) => (
                                    <tr key={payment.id}>
                                        <td className="px-5 py-3 text-emerald-700">
                                            Payment · {humanize(payment.method)}
                                            {payment.reference &&
                                                ` · ${payment.reference}`}
                                            <span className="block text-xs text-slate-500">
                                                {formatDateTime(
                                                    payment.paid_at,
                                                )}
                                                {payment.received_by &&
                                                    ` · received by ${payment.received_by.name}`}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-right text-emerald-700 tabular-nums">
                                            −{formatCurrency(payment.amount)}
                                        </td>
                                        <td className="pr-3 text-right">
                                            {!isClosed && (
                                                <DeleteButton
                                                    href={destroyPayment.url(
                                                        payment.id,
                                                    )}
                                                    confirmMessage="Void this payment?"
                                                >
                                                    Void
                                                </DeleteButton>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                <tr className="text-base font-semibold">
                                    <td className="px-5 py-4">Balance due</td>
                                    <td
                                        className={`px-5 py-4 text-right tabular-nums ${folio.balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}
                                    >
                                        {formatCurrency(folio.balance)}
                                    </td>
                                    <td />
                                </tr>
                            </tbody>
                        </table>
                    </Card>

                    {!isClosed && (
                        <div className="grid gap-6 md:grid-cols-2">
                            <Card>
                                <CardHeader title="Record payment" />
                                <Form
                                    {...storePayment.form(reservation.id)}
                                    resetOnSuccess
                                    options={{ preserveScroll: true }}
                                    className="flex flex-col gap-4 p-5"
                                >
                                    {({ errors, processing }) => (
                                        <>
                                            <Field
                                                label="Amount (₱)"
                                                htmlFor="payment_amount"
                                                error={errors.amount}
                                            >
                                                <Input
                                                    id="payment_amount"
                                                    name="amount"
                                                    type="number"
                                                    min="0.01"
                                                    step="0.01"
                                                    defaultValue={
                                                        folio.balance > 0
                                                            ? folio.balance.toFixed(
                                                                  2,
                                                              )
                                                            : ''
                                                    }
                                                    required
                                                />
                                            </Field>
                                            <Field
                                                label="Method"
                                                htmlFor="payment_method"
                                                error={errors.method}
                                            >
                                                <Select
                                                    id="payment_method"
                                                    name="method"
                                                    options={paymentMethods}
                                                    defaultValue="cash"
                                                />
                                            </Field>
                                            <Field
                                                label="Reference (optional)"
                                                htmlFor="payment_reference"
                                                error={errors.reference}
                                            >
                                                <Input
                                                    id="payment_reference"
                                                    name="reference"
                                                    placeholder="OR no., GCash ref…"
                                                />
                                            </Field>
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                            >
                                                Record payment
                                            </Button>
                                        </>
                                    )}
                                </Form>
                            </Card>
                            <Card>
                                <CardHeader title="Add charge" />
                                <Form
                                    {...storeCharge.form(reservation.id)}
                                    resetOnSuccess
                                    options={{ preserveScroll: true }}
                                    className="flex flex-col gap-4 p-5"
                                >
                                    {({ errors, processing }) => (
                                        <>
                                            <Field
                                                label="Description"
                                                htmlFor="charge_description"
                                                error={errors.description}
                                            >
                                                <Input
                                                    id="charge_description"
                                                    name="description"
                                                    placeholder="Minibar, laundry, room service…"
                                                    required
                                                />
                                            </Field>
                                            <Field
                                                label="Amount (₱)"
                                                htmlFor="charge_amount"
                                                error={errors.amount}
                                            >
                                                <Input
                                                    id="charge_amount"
                                                    name="amount"
                                                    type="number"
                                                    min="0.01"
                                                    step="0.01"
                                                    required
                                                />
                                            </Field>
                                            <Button
                                                type="submit"
                                                variant="secondary"
                                                disabled={processing}
                                            >
                                                Add charge
                                            </Button>
                                        </>
                                    )}
                                </Form>
                            </Card>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-6">
                    <Card className="p-5">
                        <h2 className="text-sm font-semibold text-slate-500">
                            Guest
                        </h2>
                        <Link
                            href={guestShow.url(guest.id)}
                            className="mt-1 block text-lg font-semibold text-brand-700 hover:underline"
                        >
                            {guest.full_name}
                        </Link>
                        <p className="text-sm text-slate-600">{guest.email}</p>
                        <p className="text-sm text-slate-600">{guest.phone}</p>
                        <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-sm">
                            <div>
                                <dt className="text-slate-500">Adults</dt>
                                <dd className="font-medium">
                                    {reservation.adults}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">Children</dt>
                                <dd className="font-medium">
                                    {reservation.children}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">Checked in</dt>
                                <dd className="font-medium">
                                    {formatDateTime(reservation.checked_in_at)}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">Checked out</dt>
                                <dd className="font-medium">
                                    {formatDateTime(reservation.checked_out_at)}
                                </dd>
                            </div>
                        </dl>
                        {reservation.special_requests && (
                            <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
                                {reservation.special_requests}
                            </p>
                        )}
                    </Card>

                    <Card className="p-5">
                        <h2 className="text-sm font-semibold text-slate-500">
                            Room
                        </h2>
                        {reservation.room ? (
                            <p className="mt-1 flex items-center gap-2 text-lg font-semibold text-slate-900">
                                Room {reservation.room.number}
                                {reservation.room.status && (
                                    <StatusBadge
                                        status={reservation.room.status}
                                    />
                                )}
                            </p>
                        ) : (
                            <p className="mt-1 text-sm text-amber-700">
                                No room assigned yet.
                            </p>
                        )}
                        <p className="text-sm text-slate-500">
                            {reservation.room_type?.name}
                        </p>
                        {isEditable && (
                            <Form
                                {...assignRoom.form(reservation.id)}
                                options={{ preserveScroll: true }}
                                className="mt-4 flex flex-col gap-3"
                            >
                                {({ errors, processing }) => (
                                    <>
                                        <Field
                                            label={
                                                reservation.room
                                                    ? 'Move to room'
                                                    : 'Assign room'
                                            }
                                            htmlFor="room_id"
                                            error={errors.room_id}
                                        >
                                            <Select
                                                id="room_id"
                                                name="room_id"
                                                placeholder={
                                                    assignableRooms.length
                                                        ? 'Choose a room'
                                                        : 'No free rooms of this type'
                                                }
                                                options={toOptions(
                                                    assignableRooms.filter(
                                                        (room) =>
                                                            room.id !==
                                                            reservation.room_id,
                                                    ),
                                                    (room) =>
                                                        `Room ${room.number} · floor ${room.floor} · ${humanize(room.status)}`,
                                                )}
                                                required
                                            />
                                        </Field>
                                        <Button
                                            type="submit"
                                            variant="secondary"
                                            disabled={
                                                processing ||
                                                assignableRooms.length === 0
                                            }
                                        >
                                            {reservation.status === 'pending'
                                                ? 'Assign & confirm'
                                                : 'Assign room'}
                                        </Button>
                                    </>
                                )}
                            </Form>
                        )}
                    </Card>
                </div>
            </div>
        </>
    );
}
