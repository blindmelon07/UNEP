import { Link } from '@inertiajs/react';
import { DeleteButton } from '@/components/delete-button';
import { PageHeader } from '@/components/page-header';
import { buttonClasses } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyRow, Table, TBody, Td, Th } from '@/components/ui/table';
import { formatCurrency } from '@/lib/format';
import { create, destroy, edit } from '@/routes/admin/room-types';
import type { RoomType } from '@/types';

export default function RoomTypesIndex({
    roomTypes,
}: {
    roomTypes: RoomType[];
}) {
    return (
        <>
            <PageHeader
                title="Room types"
                description="Rates, capacity and amenities shown on the public booking site."
                actions={
                    <Link href={create.url()} className={buttonClasses()}>
                        Add room type
                    </Link>
                }
            />
            <Card>
                <Table>
                    <thead>
                        <tr>
                            <Th>Name</Th>
                            <Th>Nightly rate</Th>
                            <Th>Sleeps</Th>
                            <Th>Rooms</Th>
                            <Th className="text-right">Actions</Th>
                        </tr>
                    </thead>
                    <TBody>
                        {roomTypes.length === 0 && (
                            <EmptyRow
                                colSpan={5}
                                message="No room types yet."
                            />
                        )}
                        {roomTypes.map((roomType) => (
                            <tr key={roomType.id}>
                                <Td>
                                    <p className="font-medium text-slate-900">
                                        {roomType.name}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        /{roomType.slug}
                                    </p>
                                </Td>
                                <Td className="tabular-nums">
                                    {formatCurrency(roomType.base_rate)}
                                </Td>
                                <Td>{roomType.capacity}</Td>
                                <Td>{roomType.rooms_count}</Td>
                                <Td className="text-right whitespace-nowrap">
                                    <Link
                                        href={edit.url(roomType.id)}
                                        className={buttonClasses({
                                            variant: 'ghost',
                                            size: 'sm',
                                        })}
                                    >
                                        Edit
                                    </Link>
                                    <DeleteButton
                                        href={destroy.url(roomType.id)}
                                        confirmMessage={`Delete ${roomType.name}?`}
                                    />
                                </Td>
                            </tr>
                        ))}
                    </TBody>
                </Table>
            </Card>
        </>
    );
}
