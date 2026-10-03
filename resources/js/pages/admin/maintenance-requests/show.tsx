import { Form, Link } from '@inertiajs/react';
import { DeleteButton } from '@/components/delete-button';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/ui/badge';
import { Button, buttonClasses } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { Field, Input, Select, toOptions } from '@/components/ui/form';
import { EmptyRow, Table, TBody, Td, Th } from '@/components/ui/table';
import { formatDateTime } from '@/lib/format';
import { show as itemShow } from '@/routes/admin/inventory-items';
import { destroy, edit, index } from '@/routes/admin/maintenance-requests';
import { store as storePart } from '@/routes/admin/maintenance-requests/parts';
import type { InventoryItem, MaintenanceRequest } from '@/types';

type Props = {
    request: MaintenanceRequest;
    inventoryItems: Pick<InventoryItem, 'id' | 'name' | 'unit' | 'quantity'>[];
};

export default function MaintenanceShow({ request, inventoryItems }: Props) {
    const isClosed =
        request.status === 'resolved' || request.status === 'cancelled';

    return (
        <>
            <PageHeader
                title={request.title}
                back={{ href: index.url(), label: 'Work orders' }}
                description={
                    <span className="flex flex-wrap items-center gap-2">
                        <span>#{request.id}</span>
                        <StatusBadge status={request.priority} />
                        <StatusBadge status={request.status} />
                    </span>
                }
                actions={
                    <>
                        <Link
                            href={edit.url(request.id)}
                            className={buttonClasses()}
                        >
                            {isClosed ? 'Edit' : 'Update status'}
                        </Link>
                        <DeleteButton
                            href={destroy.url(request.id)}
                            confirmMessage="Delete this work order?"
                            size="md"
                        />
                    </>
                }
            />
            <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
                <div className="flex flex-col gap-6">
                    <Card className="p-5">
                        <h2 className="text-sm font-semibold text-slate-500">
                            Details
                        </h2>
                        <p className="mt-2 whitespace-pre-line text-slate-800">
                            {request.description || 'No details provided.'}
                        </p>
                        {request.resolution_notes && (
                            <div className="mt-4 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-900">
                                <p className="font-medium">Resolution</p>
                                <p className="mt-1 whitespace-pre-line">
                                    {request.resolution_notes}
                                </p>
                            </div>
                        )}
                    </Card>
                    <Card>
                        <CardHeader
                            title="Parts used"
                            description="Issued from inventory and deducted from stock"
                        />
                        <Table>
                            <thead>
                                <tr>
                                    <Th>Item</Th>
                                    <Th className="text-right">Quantity</Th>
                                    <Th>Issued</Th>
                                </tr>
                            </thead>
                            <TBody>
                                {(request.parts_used ?? []).length === 0 && (
                                    <EmptyRow
                                        colSpan={3}
                                        message="No parts used yet."
                                    />
                                )}
                                {request.parts_used?.map((part) => (
                                    <tr key={part.id}>
                                        <Td>
                                            {part.item && (
                                                <Link
                                                    href={itemShow.url(
                                                        part.item.id,
                                                    )}
                                                    className="font-medium text-brand-700 hover:underline"
                                                >
                                                    {part.item.name}
                                                </Link>
                                            )}
                                        </Td>
                                        <Td className="text-right tabular-nums">
                                            {Math.abs(part.quantity)}{' '}
                                            {part.item?.unit}
                                        </Td>
                                        <Td>
                                            {formatDateTime(part.created_at)}
                                        </Td>
                                    </tr>
                                ))}
                            </TBody>
                        </Table>
                        {!isClosed && (
                            <Form
                                {...storePart.form(request.id)}
                                resetOnSuccess
                                options={{ preserveScroll: true }}
                                className="grid gap-3 border-t border-slate-200 p-5 sm:grid-cols-[1fr_8rem_auto] sm:items-end"
                            >
                                {({ errors, processing }) => (
                                    <>
                                        <Field
                                            label="Part"
                                            htmlFor="inventory_item_id"
                                            error={errors.inventory_item_id}
                                        >
                                            <Select
                                                id="inventory_item_id"
                                                name="inventory_item_id"
                                                placeholder="Choose an item in stock"
                                                options={toOptions(
                                                    inventoryItems,
                                                    (item) =>
                                                        `${item.name} (${item.quantity} ${item.unit} left)`,
                                                )}
                                                required
                                            />
                                        </Field>
                                        <Field
                                            label="Qty"
                                            htmlFor="part_quantity"
                                            error={errors.quantity}
                                        >
                                            <Input
                                                id="part_quantity"
                                                name="quantity"
                                                type="number"
                                                min={1}
                                                defaultValue={1}
                                                required
                                            />
                                        </Field>
                                        <Button
                                            type="submit"
                                            variant="secondary"
                                            disabled={processing}
                                        >
                                            Issue part
                                        </Button>
                                    </>
                                )}
                            </Form>
                        )}
                    </Card>
                </div>
                <Card className="h-fit p-5">
                    <dl className="space-y-4 text-sm">
                        <div>
                            <dt className="text-slate-500">Location</dt>
                            <dd className="flex items-center gap-2 font-medium text-slate-900">
                                {request.room
                                    ? `Room ${request.room.number}`
                                    : request.location}
                                {request.room?.status && (
                                    <StatusBadge status={request.room.status} />
                                )}
                            </dd>
                            {request.blocks_room && !isClosed && (
                                <dd className="mt-1 text-xs text-rose-600">
                                    Room is out of order until resolved
                                </dd>
                            )}
                        </div>
                        <div>
                            <dt className="text-slate-500">Assigned to</dt>
                            <dd className="font-medium text-slate-900">
                                {request.assignee
                                    ? `${request.assignee.first_name} ${request.assignee.last_name}`
                                    : 'Unassigned'}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-slate-500">Reported</dt>
                            <dd className="font-medium text-slate-900">
                                {formatDateTime(request.created_at)}
                                {request.reporter && (
                                    <span className="block font-normal text-slate-500">
                                        by {request.reporter.name}
                                    </span>
                                )}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-slate-500">Resolved</dt>
                            <dd className="font-medium text-slate-900">
                                {formatDateTime(request.resolved_at)}
                            </dd>
                        </div>
                    </dl>
                </Card>
            </div>
        </>
    );
}
