import { Link, router } from '@inertiajs/react';
import { PageHeader } from '@/components/page-header';
import { Pagination } from '@/components/pagination';
import { StatusBadge } from '@/components/ui/badge';
import { buttonClasses } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/form';
import { EmptyRow, Table, TBody, Td, Th } from '@/components/ui/table';
import { formatDate } from '@/lib/format';
import { create, index, show } from '@/routes/admin/maintenance-requests';
import type { MaintenanceRequest, Option, Paginated } from '@/types';

type Filters = { status?: string; priority?: string };

type Props = {
    requests: Paginated<MaintenanceRequest>;
    filters: Filters;
    statuses: Option[];
    priorities: Option[];
};

export default function MaintenanceIndex({
    requests,
    filters,
    statuses,
    priorities,
}: Props) {
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
                title="Work orders"
                description="Open requests are listed first, most urgent at the top."
                actions={
                    <Link href={create.url()} className={buttonClasses()}>
                        Report an issue
                    </Link>
                }
            />
            <div className="mb-4 flex flex-wrap gap-3">
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
                <Select
                    aria-label="Priority"
                    className="w-44"
                    options={priorities}
                    placeholder="All priorities"
                    value={filters.priority ?? ''}
                    onChange={(event) =>
                        applyFilter('priority', event.target.value)
                    }
                />
            </div>
            <Card>
                <Table>
                    <thead>
                        <tr>
                            <Th>#</Th>
                            <Th>Issue</Th>
                            <Th>Location</Th>
                            <Th>Assigned to</Th>
                            <Th>Reported</Th>
                            <Th>Priority</Th>
                            <Th>Status</Th>
                        </tr>
                    </thead>
                    <TBody>
                        {requests.data.length === 0 && (
                            <EmptyRow
                                colSpan={7}
                                message="No work orders match these filters."
                            />
                        )}
                        {requests.data.map((request) => (
                            <tr key={request.id} className="hover:bg-slate-50">
                                <Td className="text-slate-500 tabular-nums">
                                    {request.id}
                                </Td>
                                <Td>
                                    <Link
                                        href={show.url(request.id)}
                                        className="font-medium text-brand-700 hover:underline"
                                    >
                                        {request.title}
                                    </Link>
                                    {request.blocks_room && (
                                        <span className="block text-xs text-rose-600">
                                            Room out of order
                                        </span>
                                    )}
                                </Td>
                                <Td>
                                    {request.room
                                        ? `Room ${request.room.number}`
                                        : request.location}
                                </Td>
                                <Td>
                                    {request.assignee ? (
                                        `${request.assignee.first_name} ${request.assignee.last_name}`
                                    ) : (
                                        <span className="text-slate-400">
                                            Unassigned
                                        </span>
                                    )}
                                </Td>
                                <Td className="whitespace-nowrap">
                                    {formatDate(request.created_at)}
                                </Td>
                                <Td>
                                    <StatusBadge status={request.priority} />
                                </Td>
                                <Td>
                                    <StatusBadge status={request.status} />
                                </Td>
                            </tr>
                        ))}
                    </TBody>
                </Table>
                <Pagination page={requests} />
            </Card>
        </>
    );
}
