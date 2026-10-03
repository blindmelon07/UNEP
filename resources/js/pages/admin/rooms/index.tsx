import { Link, router, usePage } from '@inertiajs/react';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/ui/badge';
import { buttonClasses } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, toOptions } from '@/components/ui/form';
import { create as maintenanceCreate } from '@/routes/admin/maintenance-requests';
import { create, edit, index } from '@/routes/admin/rooms';
import { update as updateStatus } from '@/routes/admin/rooms/status';
import type { Option, Room, RoomStatus } from '@/types';

type Props = {
    rooms: Room[];
    filters: { status?: RoomStatus; room_type_id?: string };
    roomTypes: { id: number; name: string }[];
    statuses: Option[];
};

const quickActions: Partial<
    Record<RoomStatus, { label: string; to: RoomStatus }[]>
> = {
    cleaning: [{ label: 'Mark clean', to: 'available' }],
    available: [{ label: 'Needs cleaning', to: 'cleaning' }],
    out_of_service: [{ label: 'Return to service', to: 'available' }],
};

export default function RoomsIndex({
    rooms,
    filters,
    roomTypes,
    statuses,
}: Props) {
    const { auth } = usePage().props;
    const canManageRooms = auth.modules.includes('reservations');
    const canReportIssues = auth.modules.includes('maintenance');

    const floors = [...new Set(rooms.map((room) => room.floor))];

    const applyFilter = (key: string, value: string) => {
        router.get(
            index.url(),
            { ...filters, [key]: value || undefined },
            { preserveState: true, replace: true },
        );
    };

    const changeStatus = (room: Room, status: RoomStatus) => {
        router.patch(
            updateStatus.url(room.id),
            { status },
            { preserveScroll: true },
        );
    };

    return (
        <>
            <PageHeader
                title="Room board"
                description="Live housekeeping status of every room. Occupancy changes through check-in and check-out."
                actions={
                    canManageRooms && (
                        <Link href={create.url()} className={buttonClasses()}>
                            Add room
                        </Link>
                    )
                }
            />

            <div className="mb-6 flex flex-wrap gap-3">
                <Select
                    aria-label="Filter by status"
                    className="w-48"
                    options={statuses}
                    placeholder="All statuses"
                    value={filters.status ?? ''}
                    onChange={(event) =>
                        applyFilter('status', event.target.value)
                    }
                />
                <Select
                    aria-label="Filter by room type"
                    className="w-48"
                    options={toOptions(roomTypes, (roomType) => roomType.name)}
                    placeholder="All room types"
                    value={filters.room_type_id ?? ''}
                    onChange={(event) =>
                        applyFilter('room_type_id', event.target.value)
                    }
                />
            </div>

            {rooms.length === 0 && (
                <Card className="p-10 text-center text-sm text-slate-500">
                    No rooms match these filters.
                </Card>
            )}

            {floors.map((floor) => (
                <section key={floor} className="mb-8">
                    <h2 className="mb-3 text-sm font-semibold tracking-wide text-slate-500 uppercase">
                        Floor {floor}
                    </h2>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {rooms
                            .filter((room) => room.floor === floor)
                            .map((room) => (
                                <Card
                                    key={room.id}
                                    className="flex flex-col gap-3 p-4"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className="text-lg font-semibold text-slate-900">
                                                {room.number}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {room.room_type?.name}
                                            </p>
                                        </div>
                                        <StatusBadge status={room.status} />
                                    </div>
                                    {room.notes && (
                                        <p className="text-xs text-slate-500">
                                            {room.notes}
                                        </p>
                                    )}
                                    <div className="mt-auto flex flex-wrap gap-1.5">
                                        {(quickActions[room.status] ?? []).map(
                                            (action) => (
                                                <button
                                                    key={action.to}
                                                    type="button"
                                                    onClick={() =>
                                                        changeStatus(
                                                            room,
                                                            action.to,
                                                        )
                                                    }
                                                    className={buttonClasses({
                                                        variant: 'secondary',
                                                        size: 'sm',
                                                    })}
                                                >
                                                    {action.label}
                                                </button>
                                            ),
                                        )}
                                        {canReportIssues && (
                                            <Link
                                                href={maintenanceCreate.url({
                                                    query: { room_id: room.id },
                                                })}
                                                className={buttonClasses({
                                                    variant: 'ghost',
                                                    size: 'sm',
                                                })}
                                            >
                                                Report issue
                                            </Link>
                                        )}
                                        {canManageRooms && (
                                            <Link
                                                href={edit.url(room.id)}
                                                className={buttonClasses({
                                                    variant: 'ghost',
                                                    size: 'sm',
                                                })}
                                            >
                                                Edit
                                            </Link>
                                        )}
                                    </div>
                                </Card>
                            ))}
                    </div>
                </section>
            ))}
        </>
    );
}
