import { Link, router } from '@inertiajs/react';
import { PageHeader } from '@/components/page-header';
import { Pagination } from '@/components/pagination';
import { SearchInput } from '@/components/search-input';
import { StatusBadge, humanize } from '@/components/ui/badge';
import { buttonClasses } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, Select } from '@/components/ui/form';
import { EmptyRow, Table, TBody, Td, Th } from '@/components/ui/table';
import { formatCurrency, formatDate } from '@/lib/format';
import { create, index, show } from '@/routes/admin/reservations';
import type { Option, Paginated, Reservation } from '@/types';

type Filters = { status?: string; date?: string; search?: string };

export default function ReservationsIndex({
    reservations,
    filters,
    statuses,
}: {
    reservations: Paginated<Reservation>;
    filters: Filters;
    statuses: Option[];
}) {
    const applyFilter = (key: keyof Filters, value: string) => {
        router.get(
            index.url(),
            { ...filters, [key]: value || undefined },
            { preserveState: true, replace: true },
        );
    };

    return (
        <>
            <PageHeader
                title="Reservations"
                description={`${reservations.total} matching reservations`}
                actions={
                    <Link href={create.url()} className={buttonClasses()}>
                        New reservation
                    </Link>
                }
            />
            <div className="mb-4 flex flex-wrap gap-3">
                <SearchInput
                    url={index.url()}
                    value={filters.search}
                    filters={{ status: filters.status, date: filters.date }}
                    placeholder="Search code or guest…"
                />
                <Select
                    aria-label="Status"
                    className="w-44"
                    options={statuses}
                    placeholder="All statuses"
                    value={filters.status ?? ''}
                    onChange={(event) =>
                        applyFilter('status', event.target.value)
                    }
                />
                <Input
                    aria-label="In house on date"
                    type="date"
                    className="w-44"
                    value={filters.date ?? ''}
                    onChange={(event) =>
                        applyFilter('date', event.target.value)
                    }
                />
            </div>
            <Card>
                <Table>
                    <thead>
                        <tr>
                            <Th>Code</Th>
                            <Th>Guest</Th>
                            <Th>Stay</Th>
                            <Th>Room</Th>
                            <Th>Source</Th>
                            <Th className="text-right">Total</Th>
                            <Th>Status</Th>
                        </tr>
                    </thead>
                    <TBody>
                        {reservations.data.length === 0 && (
                            <EmptyRow
                                colSpan={7}
                                message="No reservations match these filters."
                            />
                        )}
                        {reservations.data.map((reservation) => (
                            <tr
                                key={reservation.id}
                                className="hover:bg-slate-50"
                            >
                                <Td>
                                    <Link
                                        href={show.url(reservation.id)}
                                        className="font-mono font-medium text-brand-700 hover:underline"
                                    >
                                        {reservation.code}
                                    </Link>
                                </Td>
                                <Td className="font-medium text-slate-900">
                                    {reservation.guest?.first_name}{' '}
                                    {reservation.guest?.last_name}
                                </Td>
                                <Td className="whitespace-nowrap">
                                    {formatDate(reservation.check_in)} –{' '}
                                    {formatDate(reservation.check_out)}
                                </Td>
                                <Td>
                                    {reservation.room_type?.name}
                                    <span className="block text-xs text-slate-500">
                                        {reservation.room
                                            ? `Room ${reservation.room.number}`
                                            : 'No room assigned'}
                                    </span>
                                </Td>
                                <Td>{humanize(reservation.source)}</Td>
                                <Td className="text-right tabular-nums">
                                    {formatCurrency(reservation.room_total)}
                                </Td>
                                <Td>
                                    <StatusBadge status={reservation.status} />
                                </Td>
                            </tr>
                        ))}
                    </TBody>
                </Table>
                <Pagination page={reservations} />
            </Card>
        </>
    );
}
