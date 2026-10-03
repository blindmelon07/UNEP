import { Form } from '@inertiajs/react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field, Input, Select, toOptions } from '@/components/ui/form';
import { index, show, store, update } from '@/routes/admin/inventory-items';
import type { InventoryItem } from '@/types';

type Props = {
    item: InventoryItem | null;
    categories: { id: number; name: string }[];
};

export default function InventoryItemForm({ item, categories }: Props) {
    return (
        <>
            <PageHeader
                title={item ? `Edit ${item.name}` : 'New stock item'}
                back={
                    item
                        ? { href: show.url(item.id), label: item.name }
                        : { href: index.url(), label: 'Stock items' }
                }
            />
            <Card className="max-w-3xl p-6">
                <Form
                    {...(item ? update.form(item.id) : store.form())}
                    className="grid gap-5 sm:grid-cols-2"
                >
                    {({ errors, processing }) => (
                        <>
                            <Field
                                label="Name"
                                htmlFor="name"
                                error={errors.name}
                            >
                                <Input
                                    id="name"
                                    name="name"
                                    defaultValue={item?.name}
                                    required
                                />
                            </Field>
                            <Field label="SKU" htmlFor="sku" error={errors.sku}>
                                <Input
                                    id="sku"
                                    name="sku"
                                    defaultValue={item?.sku}
                                    required
                                />
                            </Field>
                            <Field
                                label="Category"
                                htmlFor="inventory_category_id"
                                error={errors.inventory_category_id}
                            >
                                <Select
                                    id="inventory_category_id"
                                    name="inventory_category_id"
                                    options={toOptions(
                                        categories,
                                        (category) => category.name,
                                    )}
                                    placeholder="Choose a category"
                                    defaultValue={
                                        item?.inventory_category_id ?? ''
                                    }
                                    required
                                />
                            </Field>
                            <Field
                                label="Unit"
                                htmlFor="unit"
                                error={errors.unit}
                                hint="pcs, box, bottle, roll, kg…"
                            >
                                <Input
                                    id="unit"
                                    name="unit"
                                    defaultValue={item?.unit ?? 'pcs'}
                                    required
                                />
                            </Field>
                            <Field
                                label="Reorder level"
                                htmlFor="reorder_level"
                                error={errors.reorder_level}
                                hint="You'll be alerted at or below this quantity."
                            >
                                <Input
                                    id="reorder_level"
                                    name="reorder_level"
                                    type="number"
                                    min={0}
                                    defaultValue={item?.reorder_level ?? 10}
                                    required
                                />
                            </Field>
                            <Field
                                label="Unit cost (₱)"
                                htmlFor="unit_cost"
                                error={errors.unit_cost}
                            >
                                <Input
                                    id="unit_cost"
                                    name="unit_cost"
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    defaultValue={item?.unit_cost ?? 0}
                                    required
                                />
                            </Field>
                            <Field
                                label="Storage location"
                                htmlFor="location"
                                error={errors.location}
                            >
                                <Input
                                    id="location"
                                    name="location"
                                    defaultValue={item?.location ?? ''}
                                    placeholder="Main storeroom"
                                />
                            </Field>
                            {!item && (
                                <Field
                                    label="Opening quantity"
                                    htmlFor="opening_quantity"
                                    error={errors.opening_quantity}
                                    hint="Recorded as the first stock-in movement."
                                >
                                    <Input
                                        id="opening_quantity"
                                        name="opening_quantity"
                                        type="number"
                                        min={0}
                                        defaultValue={0}
                                    />
                                </Field>
                            )}
                            <div className="sm:col-span-2">
                                <Button type="submit" disabled={processing}>
                                    {item ? 'Save changes' : 'Create item'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </Card>
        </>
    );
}
