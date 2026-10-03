import { Link, usePage } from '@inertiajs/react';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/ui/badge';
import { buttonClasses } from '@/components/ui/button';
import { Card, CardHeader, StatCard } from '@/components/ui/card';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
    index as itemsIndex,
    show as itemShow,
} from '@/routes/admin/inventory-items';
import {
    show as maintenanceShow,
    index as maintenanceIndex,
} from '@/routes/admin/maintenance-requests';
import {
    create as reservationCreate,
    index as reservationsIndex,
    show as reservationShow,
} from '@/routes/admin/reservations';
import { index as roomsIndex } from '@/routes/admin/rooms';
import { index as shiftsIndex } from '@/routes/admin/shifts';
import type {
    InventoryItem,
    MaintenanceRequest,
    Reservation,
    RoomStatus,
} from '@/types';

type Props = {
    frontDesk: {
        arrivals: Reservation[];
        departures: Reservation[];
        pendingOnline: number;
        roomStatus: { status: RoomStatus; label: string; count: number }[];
        occupancyRate: number;
        revenueThisMonth: number;
    } | null;
    inventory: {
        itemCount: number;
        lowStockCount: number;
        lowStockItems: InventoryItem[];
    } | null;
    maintenance: {
        openCount: number;
        urgentCount: number;
        recent: MaintenanceRequest[];
    } | null;
    staff: {
        activeEmployees: number;
        onShiftToday: number;
    } | null;
};

const roomStatusColors: Record<RoomStatus, string> = {
    available: 'bg-emerald-500',
    occupied: 'bg-sky-500',
    cleaning: 'bg-amber-400',
    maintenance: 'bg-rose-500',
    out_of_service: 'bg-slate-400',
};

function ReservationList({
    reservations,
    empty,
}: {
    reservations: Reservation[];
    empty: string;
}) {
    if (reservations.length === 0) {
        return (
            <p className="px-5 py-8 text-center text-sm text-slate-500">
                {empty}
            </p>
        );
    }

    return (
        <ul className="divide-y divide-slate-100">
            {reservations.map((reservation) => (
                <li key={reservation.id}>
                    <Link
                        href={reservationShow.url(reservation.id)}
                        className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50"
                    >
                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-900">
                                {reservation.guest?.first_name}{' '}
                                {reservation.guest?.last_name}
                            </p>
                            <p className="text-xs text-slate-500">
                                {reservation.code}
                                {reservation.room_type &&
                                    ` · ${reservation.room_type.name}`}
                            </p>
                        </div>
                        <span className="text-sm font-medium text-slate-700">
                            {reservation.room
                                ? `Room ${reservation.room.number}`
                                : 'Unassigned'}
                        </span>
                    </Link>
                </li>
            ))}
        </ul>
    );
}

export default function Dashboard({
    frontDesk,
    inventory,
    maintenance,
    staff,
}: Props) {
    const { auth } = usePage().props;
    const totalRooms =
        frontDesk?.roomStatus.reduce((sum, item) => sum + item.count, 0) ?? 0;

    return (
        <>
            <PageHeader
                title={`Good day, ${auth.user?.name.split(' ')[0] ?? ''}`}
                description={new Date().toLocaleDateString('en-PH', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                })}
                actions={
                    frontDesk && (
                        <Link
                            href={reservationCreate.url()}
                            className={buttonClasses()}
                        >
                            New reservation
                        </Link>
                    )
                }
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {frontDesk && (
                    <>
                        <StatCard
                            label="Occupancy"
                            value={`${frontDesk.occupancyRate}%`}
                            hint={`${totalRooms} rooms in total`}
                        />
                        <StatCard
                            label="Arrivals · Departures today"
                            value={`${frontDesk.arrivals.length} · ${frontDesk.departures.length}`}
                            hint={
                                frontDesk.pendingOnline > 0 ? (
                                    <Link
                                        href={reservationsIndex.url({
                                            query: { status: 'pending' },
                                        })}
                                        className="text-amber-700 underline"
                                    >
                                        {frontDesk.pendingOnline} pending
                                        booking
                                        {frontDesk.pendingOnline === 1
                                            ? ''
                                            : 's'}{' '}
                                        to confirm
                                    </Link>
                                ) : (
                                    'No pending bookings'
                                )
                            }
                        />
                        <StatCard
                            label="Payments this month"
                            value={formatCurrency(frontDesk.revenueThisMonth)}
                            tone="success"
                        />
                    </>
                )}
                {maintenance && (
                    <StatCard
                        label="Open work orders"
                        value={maintenance.openCount}
                        hint={`${maintenance.urgentCount} high or urgent`}
                        tone={
                            maintenance.urgentCount > 0 ? 'danger' : 'default'
                        }
                    />
                )}
                {inventory && (
                    <StatCard
                        label="Low-stock items"
                        value={inventory.lowStockCount}
                        hint={`of ${inventory.itemCount} stock items`}
                        tone={
                            inventory.lowStockCount > 0 ? 'warning' : 'default'
                        }
                    />
                )}
                {staff && (
                    <StatCard
                        label="Staff on shift today"
                        value={staff.onShiftToday}
                        hint={`${staff.activeEmployees} active employees`}
                    />
                )}
            </div>

            {frontDesk && (
                <>
                    <Card className="mt-6">
                        <CardHeader
                            title="Room status"
                            actions={
                                <Link
                                    href={roomsIndex.url()}
                                    className={buttonClasses({
                                        variant: 'secondary',
                                        size: 'sm',
                                    })}
                                >
                                    Room board
                                </Link>
                            }
                        />
                        <div className="p-5">
                            <div className="flex h-3 overflow-hidden rounded-full bg-slate-100">
                                {frontDesk.roomStatus.map((item) =>
                                    item.count > 0 ? (
                                        <div
                                            key={item.status}
                                            className={
                                                roomStatusColors[item.status]
                                            }
                                            style={{
                                                width: `${(item.count / Math.max(totalRooms, 1)) * 100}%`,
                                            }}
                                        />
                                    ) : null,
                                )}
                            </div>
                            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                                {frontDesk.roomStatus.map((item) => (
                                    <Link
                                        key={item.status}
                                        href={roomsIndex.url({
                                            query: { status: item.status },
                                        })}
                                        className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
                                    >
                                        <span
                                            className={cn(
                                                'size-2.5 rounded-full',
                                                roomStatusColors[item.status],
                                            )}
                                        />
                                        {item.label}
                                        <span className="font-semibold text-slate-900 tabular-nums">
                                            {item.count}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </Card>

                    <div className="mt-6 grid gap-6 lg:grid-cols-2">
                        <Card>
                            <CardHeader
                                title="Arriving today"
                                description="Pending and confirmed check-ins"
                            />
                            <ReservationList
                                reservations={frontDesk.arrivals}
                                empty="No arrivals expected today."
                            />
                        </Card>
                        <Card>
                            <CardHeader
                                title="Departing today"
                                description="In-house guests due to check out"
                            />
                            <ReservationList
                                reservations={frontDesk.departures}
                                empty="No departures today."
                            />
                        </Card>
                    </div>
                </>
            )}

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                {maintenance && (
                    <Card>
                        <CardHeader
                            title="Active work orders"
                            actions={
                                <Link
                                    href={maintenanceIndex.url()}
                                    className={buttonClasses({
                                        variant: 'secondary',
                                        size: 'sm',
                                    })}
                                >
                                    View all
                                </Link>
                            }
                        />
                        {maintenance.recent.length === 0 ? (
                            <p className="px-5 py-8 text-center text-sm text-slate-500">
                                Nothing needs fixing. 🎉
                            </p>
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {maintenance.recent.map((request) => (
                                    <li key={request.id}>
                                        <Link
                                            href={maintenanceShow.url(
                                                request.id,
                                            )}
                                            className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50"
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium text-slate-900">
                                                    {request.title}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {request.room
                                                        ? `Room ${request.room.number}`
                                                        : request.location}
                                                </p>
                                            </div>
                                            <div className="flex gap-1.5">
                                                <StatusBadge
                                                    status={request.priority}
                                                />
                                                <StatusBadge
                                                    status={request.status}
                                                />
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Card>
                )}
                {inventory && (
                    <Card>
                        <CardHeader
                            title="Needs reordering"
                            actions={
                                <Link
                                    href={itemsIndex.url({
                                        query: { low_stock: 1 },
                                    })}
                                    className={buttonClasses({
                                        variant: 'secondary',
                                        size: 'sm',
                                    })}
                                >
                                    View all
                                </Link>
                            }
                        />
                        {inventory.lowStockItems.length === 0 ? (
                            <p className="px-5 py-8 text-center text-sm text-slate-500">
                                All items are above their reorder level.
                            </p>
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {inventory.lowStockItems.map((item) => (
                                    <li key={item.id}>
                                        <Link
                                            href={itemShow.url(item.id)}
                                            className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50"
                                        >
                                            <p className="text-sm font-medium text-slate-900">
                                                {item.name}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                <span className="font-semibold text-amber-600">
                                                    {item.quantity}
                                                </span>{' '}
                                                / reorder at{' '}
                                                {item.reorder_level} {item.unit}
                                            </p>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Card>
                )}
                {staff && !frontDesk && (
                    <Card>
                        <CardHeader title="This week's roster" />
                        <div className="p-5">
                            <Link
                                href={shiftsIndex.url()}
                                className={buttonClasses({
                                    variant: 'secondary',
                                })}
                            >
                                Open shift roster
                            </Link>
                        </div>
                    </Card>
                )}
            </div>
        </>
    );
}
