import { NameListManager } from '@/components/name-list-manager';
import { PageHeader } from '@/components/page-header';
import { destroy, store, update } from '@/routes/admin/departments';
import type { Department } from '@/types';

export default function DepartmentsIndex({
    departments,
}: {
    departments: Department[];
}) {
    return (
        <>
            <PageHeader
                title="Departments"
                description="Organise employees by hotel department."
            />
            <NameListManager
                records={departments.map((department) => ({
                    id: department.id,
                    name: department.name,
                    count: department.employees_count,
                }))}
                countLabel="employees"
                placeholder="New department name"
                storeForm={store.form()}
                updateForm={(id) => update.form(id)}
                destroyUrl={(id) => destroy.url(id)}
            />
        </>
    );
}
