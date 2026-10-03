import { Link } from '@inertiajs/react';
import { PageHeader } from '@/components/page-header';
import { Pagination } from '@/components/pagination';
import { SearchInput } from '@/components/search-input';
import { buttonClasses } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyRow, Table, TBody, Td, Th } from '@/components/ui/table';
import { create, index, show } from '@/routes/admin/guests';
import type { Guest, Paginated } from '@/types';

export default function GuestsIndex({
    guests,
    filters,
}: {
    guests: Paginated<Guest>;
    filters: { search: string };
}) {
    return (
        <>
            <PageHeader
                title="Guests"
                description={`${guests.total} guest profiles`}
                actions={
                    <Link href={create.url()} className={buttonClasses()}>
                        Add guest
                    </Link>
                }
            />
            <div className="mb-4">
                <SearchInput
                    url={index.url()}
                    value={filters.search}
                    filters={{}}
                    placeholder="Search name, email or phone…"
                />
            </div>
            <Card>
                <Table>
                    <thead>
                        <tr>
                            <Th>Name</Th>
                            <Th>Email</Th>
                            <Th>Phone</Th>
                            <Th className="text-right">Stays</Th>
                        </tr>
                    </thead>
                    <TBody>
                        {guests.data.length === 0 && (
                            <EmptyRow colSpan={4} message="No guests found." />
                        )}
                        {guests.data.map((guest) => (
                            <tr key={guest.id} className="hover:bg-slate-50">
                                <Td>
                                    <Link
                                        href={show.url(guest.id)}
                                        className="font-medium text-brand-700 hover:underline"
                                    >
                                        {guest.full_name}
                                    </Link>
                                </Td>
                                <Td>{guest.email}</Td>
                                <Td>{guest.phone}</Td>
                                <Td className="text-right tabular-nums">
                                    {guest.reservations_count}
                                </Td>
                            </tr>
                        ))}
                    </TBody>
                </Table>
                <Pagination page={guests} />
            </Card>
        </>
    );
}
