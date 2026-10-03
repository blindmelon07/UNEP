import { Link, router } from '@inertiajs/react';
import { PageHeader } from '@/components/page-header';
import { Pagination } from '@/components/pagination';
import { SearchInput } from '@/components/search-input';
import { Badge } from '@/components/ui/badge';
import { buttonClasses } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox, Select, toOptions } from '@/components/ui/form';
import { EmptyRow, Table, TBody, Td, Th } from '@/components/ui/table';
import { formatCurrency } from '@/lib/format';
import { create, index, show } from '@/routes/admin/inventory-items';
import type { InventoryItem, Paginated } from '@/types';

type Filters = { search?: string; category?: string; low_stock?: string };

type Props = {
    items: Paginated<InventoryItem>;
    filters: Filters;
    categories: { id: number; name: string }[];
    lowStockCount: number;
};

export default function InventoryItemsIndex({
    items,
    filters,
    categories,
    lowStockCount,
}: Props) {
    const applyFilter = (key: keyof Filters, value: string | undefined) => {
        router.get(
            index.url(),
            { ...filters, [key]: value || undefined },
            { preserveState: true, replace: true },
        );
    };

    return (
        <>
            <PageHeader
                title="Stock items"
                description={
                    lowStockCount > 0 ? (
                        <span className="text-amber-700">
                            {lowStockCount} item
                            {lowStockCount === 1 ? ' is' : 's are'} at or below
                            the reorder level.
                        </span>
                    ) : (
                        'All items are above their reorder levels.'
                    )
                }
                actions={
                    <Link href={create.url()} className={buttonClasses()}>
                        Add item
                    </Link>
                }
            />
            <div className="mb-4 flex flex-wrap items-center gap-3">
                <SearchInput
                    url={index.url()}
                    value={filters.search}
                    filters={{
                        category: filters.category,
                        low_stock: filters.low_stock,
                    }}
                    placeholder="Search name or SKU…"
                />
                <Select
                    aria-label="Category"
                    className="w-48"
                    options={toOptions(categories, (category) => category.name)}
                    placeholder="All categories"
                    value={filters.category ?? ''}
                    onChange={(event) =>
                        applyFilter('category', event.target.value)
                    }
                />
                <Checkbox
                    label="Low stock only"
                    checked={
                        filters.low_stock === '1' ||
                        filters.low_stock === 'true'
                    }
                    onChange={(event) =>
                        applyFilter(
                            'low_stock',
                            event.target.checked ? '1' : undefined,
                        )
                    }
                />
            </div>
            <Card>
                <Table>
                    <thead>
                        <tr>
                            <Th>Item</Th>
                            <Th>Category</Th>
                            <Th className="text-right">On hand</Th>
                            <Th className="text-right">Reorder at</Th>
                            <Th className="text-right">Unit cost</Th>
                            <Th className="text-right">Stock value</Th>
                        </tr>
                    </thead>
                    <TBody>
                        {items.data.length === 0 && (
                            <EmptyRow
                                colSpan={6}
                                message="No items match these filters."
                            />
                        )}
                        {items.data.map((item) => {
                            const isLow = item.quantity <= item.reorder_level;

                            return (
                                <tr key={item.id} className="hover:bg-slate-50">
                                    <Td>
                                        <Link
                                            href={show.url(item.id)}
                                            className="font-medium text-brand-700 hover:underline"
                                        >
                                            {item.name}
                                        </Link>
                                        <span className="block font-mono text-xs text-slate-500">
                                            {item.sku}
                                        </span>
                                    </Td>
                                    <Td>{item.category?.name}</Td>
                                    <Td className="text-right tabular-nums">
                                        <span
                                            className={
                                                isLow
                                                    ? 'font-semibold text-amber-600'
                                                    : ''
                                            }
                                        >
                                            {item.quantity} {item.unit}
                                        </span>
                                        {isLow && (
                                            <Badge
                                                tone="amber"
                                                className="ml-2"
                                            >
                                                Low
                                            </Badge>
                                        )}
                                    </Td>
                                    <Td className="text-right tabular-nums">
                                        {item.reorder_level}
                                    </Td>
                                    <Td className="text-right tabular-nums">
                                        {formatCurrency(item.unit_cost)}
                                    </Td>
                                    <Td className="text-right tabular-nums">
                                        {formatCurrency(
                                            item.quantity *
                                                Number(item.unit_cost),
                                        )}
                                    </Td>
                                </tr>
                            );
                        })}
                    </TBody>
                </Table>
                <Pagination page={items} />
            </Card>
        </>
    );
}
