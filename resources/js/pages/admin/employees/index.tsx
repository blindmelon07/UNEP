import { Link, router } from '@inertiajs/react';
import { PageHeader } from '@/components/page-header';
import { Pagination } from '@/components/pagination';
import { SearchInput } from '@/components/search-input';
import { StatusBadge } from '@/components/ui/badge';
import { buttonClasses } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, toOptions } from '@/components/ui/form';
import { EmptyRow, Table, TBody, Td, Th } from '@/components/ui/table';
import { formatDate } from '@/lib/format';
import { create, index, show } from '@/routes/admin/employees';
import type { Employee, Option, Paginated } from '@/types';

type Filters = { search?: string; department?: string; status?: string };

type Props = {
    employees: Paginated<Employee>;
    filters: Filters;
    departments: { id: number; name: string }[];
    statuses: Option[];
};

export default function EmployeesIndex({
    employees,
    filters,
    departments,
    statuses,
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
                title="Employees"
                description={`${employees.total} employees`}
                actions={
                    <Link href={create.url()} className={buttonClasses()}>
                        Add employee
                    </Link>
                }
            />
            <div className="mb-4 flex flex-wrap gap-3">
                <SearchInput
                    url={index.url()}
                    value={filters.search}
                    filters={{
                        department: filters.department,
                        status: filters.status,
                    }}
                    placeholder="Search name, ID or position…"
                />
                <Select
                    aria-label="Department"
                    className="w-48"
                    options={toOptions(
                        departments,
                        (department) => department.name,
                    )}
                    placeholder="All departments"
                    value={filters.department ?? ''}
                    onChange={(event) =>
                        applyFilter('department', event.target.value)
                    }
                />
                <Select
                    aria-label="Status"
                    className="w-40"
                    options={statuses}
                    placeholder="All statuses"
                    value={filters.status ?? ''}
                    onChange={(event) =>
                        applyFilter('status', event.target.value)
                    }
                />
            </div>
            <Card>
                <Table>
                    <thead>
                        <tr>
                            <Th>Employee</Th>
                            <Th>Position</Th>
                            <Th>Department</Th>
                            <Th>Hired</Th>
                            <Th>Status</Th>
                        </tr>
                    </thead>
                    <TBody>
                        {employees.data.length === 0 && (
                            <EmptyRow
                                colSpan={5}
                                message="No employees found."
                            />
                        )}
                        {employees.data.map((employee) => (
                            <tr key={employee.id} className="hover:bg-slate-50">
                                <Td>
                                    <Link
                                        href={show.url(employee.id)}
                                        className="font-medium text-brand-700 hover:underline"
                                    >
                                        {employee.full_name}
                                    </Link>
                                    <span className="block font-mono text-xs text-slate-500">
                                        {employee.employee_number}
                                    </span>
                                </Td>
                                <Td>{employee.position}</Td>
                                <Td>{employee.department?.name}</Td>
                                <Td className="whitespace-nowrap">
                                    {formatDate(employee.hire_date)}
                                </Td>
                                <Td>
                                    <StatusBadge status={employee.status} />
                                </Td>
                            </tr>
                        ))}
                    </TBody>
                </Table>
                <Pagination page={employees} />
            </Card>
        </>
    );
}
