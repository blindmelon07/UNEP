import { Form, Link } from '@inertiajs/react';
import { useState } from 'react';
import { DeleteButton } from '@/components/delete-button';
import { PageHeader } from '@/components/page-header';
import { Pagination } from '@/components/pagination';
import { StatusBadge } from '@/components/ui/badge';
import { Button, buttonClasses } from '@/components/ui/button';
import { Card, CardHeader, StatCard } from '@/components/ui/card';
import { Field, Input, Select } from '@/components/ui/form';
import { EmptyRow, Table, TBody, Td, Th } from '@/components/ui/table';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { destroy, edit, index } from '@/routes/admin/inventory-items';
import { store as storeMovement } from '@/routes/admin/inventory-items/movements';
import { show as maintenanceShow } from '@/routes/admin/maintenance-requests';
import type { InventoryItem, Option, Paginated, StockMovement } from '@/types';

type Props = {
    item: InventoryItem;
    movements: Paginated<StockMovement>;
    movementTypes: Option[];
};

const quantityLabels: Record<string, string> = {
    in: 'Quantity received',
    out: 'Quantity issued',
    adjustment: 'Counted quantity on hand',
};

export default function InventoryItemShow({
    item,
    movements,
    movementTypes,
}: Props) {
    const [type, setType] = useState('in');
    const isLow = item.quantity <= item.reorder_level;

    return (
        <>
            <PageHeader
                title={item.name}
                description={`${item.sku} · ${item.category?.name ?? ''}${item.location ? ` · ${item.location}` : ''}`}
                back={{ href: index.url(), label: 'Stock items' }}
                actions={
                    <>
                        <Link
                            href={edit.url(item.id)}
                            className={buttonClasses({ variant: 'secondary' })}
                        >
                            Edit
                        </Link>
                        <DeleteButton
                            href={destroy.url(item.id)}
                            confirmMessage={`Delete ${item.name} and its movement history?`}
                            size="md"
                        />
                    </>
                }
            />
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
                <StatCard
                    label="On hand"
                    value={`${item.quantity} ${item.unit}`}
                    tone={isLow ? 'warning' : 'default'}
                    hint={
                        isLow
                            ? 'At or below reorder level'
                            : `Reorder at ${item.reorder_level}`
                    }
                />
                <StatCard
                    label="Unit cost"
                    value={formatCurrency(item.unit_cost)}
                />
                <StatCard
                    label="Stock value"
                    value={formatCurrency(
                        item.quantity * Number(item.unit_cost),
                    )}
                />
            </div>
            <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
                <Card className="h-fit">
                    <CardHeader title="Update stock" />
                    <Form
                        {...storeMovement.form(item.id)}
                        resetOnSuccess={['quantity', 'notes']}
                        options={{ preserveScroll: true }}
                        className="flex flex-col gap-4 p-5"
                    >
                        {({ errors, processing }) => (
                            <>
                                <Field
                                    label="Movement"
                                    htmlFor="type"
                                    error={errors.type}
                                >
                                    <Select
                                        id="type"
                                        name="type"
                                        options={movementTypes}
                                        value={type}
                                        onChange={(event) =>
                                            setType(event.target.value)
                                        }
                                    />
                                </Field>
                                <Field
                                    label={quantityLabels[type]}
                                    htmlFor="quantity"
                                    error={errors.quantity}
                                >
                                    <Input
                                        id="quantity"
                                        name="quantity"
                                        type="number"
                                        min={type === 'adjustment' ? 0 : 1}
                                        required
                                    />
                                </Field>
                                <Field
                                    label="Notes"
                                    htmlFor="notes"
                                    error={errors.notes}
                                >
                                    <Input
                                        id="notes"
                                        name="notes"
                                        placeholder={
                                            type === 'in'
                                                ? 'Supplier / PO number'
                                                : 'Issued to / reason'
                                        }
                                    />
                                </Field>
                                <Button type="submit" disabled={processing}>
                                    Save movement
                                </Button>
                            </>
                        )}
                    </Form>
                </Card>
                <Card>
                    <CardHeader title="Movement history" />
                    <Table>
                        <thead>
                            <tr>
                                <Th>Date</Th>
                                <Th>Type</Th>
                                <Th className="text-right">Change</Th>
                                <Th className="text-right">Balance</Th>
                                <Th>Notes</Th>
                            </tr>
                        </thead>
                        <TBody>
                            {movements.data.length === 0 && (
                                <EmptyRow
                                    colSpan={5}
                                    message="No movements recorded."
                                />
                            )}
                            {movements.data.map((movement) => (
                                <tr key={movement.id}>
                                    <Td className="whitespace-nowrap">
                                        {formatDateTime(movement.created_at)}
                                        {movement.user && (
                                            <span className="block text-xs text-slate-500">
                                                {movement.user.name}
                                            </span>
                                        )}
                                    </Td>
                                    <Td>
                                        <StatusBadge status={movement.type} />
                                    </Td>
                                    <Td
                                        className={`text-right font-medium tabular-nums ${movement.quantity < 0 ? 'text-rose-600' : 'text-emerald-600'}`}
                                    >
                                        {movement.quantity > 0
                                            ? `+${movement.quantity}`
                                            : movement.quantity}
                                    </Td>
                                    <Td className="text-right tabular-nums">
                                        {movement.balance_after}
                                    </Td>
                                    <Td className="text-slate-600">
                                        {movement.maintenance_request ? (
                                            <Link
                                                href={maintenanceShow.url(
                                                    movement.maintenance_request
                                                        .id,
                                                )}
                                                className="text-brand-700 hover:underline"
                                            >
                                                {movement.notes}
                                            </Link>
                                        ) : (
                                            movement.notes
                                        )}
                                    </Td>
                                </tr>
                            ))}
                        </TBody>
                    </Table>
                    <Pagination page={movements} />
                </Card>
            </div>
        </>
    );
}
