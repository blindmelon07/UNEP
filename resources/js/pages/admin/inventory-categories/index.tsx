import { NameListManager } from '@/components/name-list-manager';
import { PageHeader } from '@/components/page-header';
import { destroy, store, update } from '@/routes/admin/inventory-categories';
import type { InventoryCategory } from '@/types';

export default function InventoryCategoriesIndex({
    categories,
}: {
    categories: InventoryCategory[];
}) {
    return (
        <>
            <PageHeader
                title="Inventory categories"
                description="Group stock items for easier browsing and reporting."
            />
            <NameListManager
                records={categories.map((category) => ({
                    id: category.id,
                    name: category.name,
                    count: category.items_count,
                }))}
                countLabel="items"
                placeholder="New category name"
                storeForm={store.form()}
                updateForm={(id) => update.form(id)}
                destroyUrl={(id) => destroy.url(id)}
            />
        </>
    );
}
