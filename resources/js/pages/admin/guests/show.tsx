import { Link } from '@inertiajs/react';
import { DeleteButton } from '@/components/delete-button';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/ui/badge';
import { buttonClasses } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { EmptyRow, Table, TBody, Td, Th } from '@/components/ui/table';
import { formatCurrency, formatDate } from '@/lib/format';
import { destroy, edit, index } from '@/routes/admin/guests';
import {
    create as reservationCreate,
    show as reservationShow,
} from '@/routes/admin/reservations';
import type { Guest, Reservation } from '@/types';

export default function GuestShow({
    guest,
    reservations,
}: {
    guest: Guest;
    reservations: Reservation[];
}) {
    const details: [string, string | null][] = [
        ['Email', guest.email],
        ['Phone', guest.phone],
        ['Address', guest.address],
        [
            'ID',
            guest.id_type ? `${guest.id_type} ${guest.id_number ?? ''}` : null,
        ],
    ];

    return (
        <>
            <PageHeader
                title={guest.full_name}
                back={{ href: index.url(), label: 'Guests' }}
                actions={
                    <>
                        <Link
                            href={reservationCreate.url({
                                query: { guest_id: guest.id },
                            })}
                            className={buttonClasses()}
                        >
                            New reservation
                        </Link>
                        <Link
                            href={edit.url(guest.id)}
                            className={buttonClasses({ variant: 'secondary' })}
                        >
                            Edit
                        </Link>
                        {reservations.length === 0 && (
                            <DeleteButton
                                href={destroy.url(guest.id)}
                                confirmMessage={`Delete ${guest.full_name}?`}
                                size="md"
                            />
                        )}
                    </>
                }
            />
            <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
                <Card className="h-fit p-5">
                    <dl className="space-y-3 text-sm">
                        {details.map(([label, value]) => (
                            <div key={label}>
                                <dt className="text-slate-500">{label}</dt>
                                <dd className="font-medium text-slate-900">
                                    {value || '—'}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </Card>
                <Card>
                    <CardHeader title="Stay history" />
                    <Table>
                        <thead>
                            <tr>
                                <Th>Code</Th>
                                <Th>Dates</Th>
                                <Th>Room</Th>
                                <Th>Total</Th>
                                <Th>Status</Th>
                            </tr>
                        </thead>
                        <TBody>
                            {reservations.length === 0 && (
                                <EmptyRow
                                    colSpan={5}
                                    message="No reservations yet."
                                />
                            )}
                            {reservations.map((reservation) => (
                                <tr key={reservation.id}>
                                    <Td>
                                        <Link
                                            href={reservationShow.url(
                                                reservation.id,
                                            )}
                                            className="font-mono font-medium whitespace-nowrap text-brand-700 hover:underline"
                                        >
                                            {reservation.code}
                                        </Link>
                                    </Td>
                                    <Td className="whitespace-nowrap">
                                        {formatDate(reservation.check_in)} –{' '}
                                        {formatDate(reservation.check_out)}
                                    </Td>
                                    <Td>
                                        {reservation.room_type?.name}
                                        {reservation.room && (
                                            <span className="text-slate-500">
                                                {' '}
                                                · {reservation.room.number}
                                            </span>
                                        )}
                                    </Td>
                                    <Td className="tabular-nums">
                                        {formatCurrency(reservation.room_total)}
                                    </Td>
                                    <Td>
                                        <StatusBadge
                                            status={reservation.status}
                                        />
                                    </Td>
                                </tr>
                            ))}
                        </TBody>
                    </Table>
                </Card>
            </div>
        </>
    );
}
