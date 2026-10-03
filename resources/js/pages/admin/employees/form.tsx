import { Form } from '@inertiajs/react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field, Input, Select, toOptions } from '@/components/ui/form';
import { toDateInput } from '@/lib/format';
import { index, show, store, update } from '@/routes/admin/employees';
import type { Employee, Option } from '@/types';

type Props = {
    employee: Employee | null;
    departments: { id: number; name: string }[];
    statuses: Option[];
    users: { id: number; name: string; email: string }[];
};

export default function EmployeeForm({
    employee,
    departments,
    statuses,
    users,
}: Props) {
    return (
        <>
            <PageHeader
                title={employee ? `Edit ${employee.full_name}` : 'New employee'}
                back={
                    employee
                        ? {
                              href: show.url(employee.id),
                              label: employee.full_name,
                          }
                        : { href: index.url(), label: 'Employees' }
                }
            />
            <Card className="max-w-3xl p-6">
                <Form
                    {...(employee ? update.form(employee.id) : store.form())}
                    className="grid gap-5 sm:grid-cols-2"
                >
                    {({ errors, processing }) => (
                        <>
                            <Field
                                label="First name"
                                htmlFor="first_name"
                                error={errors.first_name}
                            >
                                <Input
                                    id="first_name"
                                    name="first_name"
                                    defaultValue={employee?.first_name}
                                    required
                                />
                            </Field>
                            <Field
                                label="Last name"
                                htmlFor="last_name"
                                error={errors.last_name}
                            >
                                <Input
                                    id="last_name"
                                    name="last_name"
                                    defaultValue={employee?.last_name}
                                    required
                                />
                            </Field>
                            <Field
                                label="Employee number"
                                htmlFor="employee_number"
                                error={errors.employee_number}
                            >
                                <Input
                                    id="employee_number"
                                    name="employee_number"
                                    defaultValue={employee?.employee_number}
                                    placeholder="EMP-00001"
                                    required
                                />
                            </Field>
                            <Field
                                label="Department"
                                htmlFor="department_id"
                                error={errors.department_id}
                            >
                                <Select
                                    id="department_id"
                                    name="department_id"
                                    options={toOptions(
                                        departments,
                                        (department) => department.name,
                                    )}
                                    placeholder="Choose a department"
                                    defaultValue={employee?.department_id ?? ''}
                                    required
                                />
                            </Field>
                            <Field
                                label="Position"
                                htmlFor="position"
                                error={errors.position}
                            >
                                <Input
                                    id="position"
                                    name="position"
                                    defaultValue={employee?.position}
                                    required
                                />
                            </Field>
                            <Field
                                label="Hire date"
                                htmlFor="hire_date"
                                error={errors.hire_date}
                            >
                                <Input
                                    id="hire_date"
                                    name="hire_date"
                                    type="date"
                                    defaultValue={
                                        employee?.hire_date ??
                                        toDateInput(new Date())
                                    }
                                    required
                                />
                            </Field>
                            <Field
                                label="Email"
                                htmlFor="email"
                                error={errors.email}
                            >
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    defaultValue={employee?.email ?? ''}
                                />
                            </Field>
                            <Field
                                label="Phone"
                                htmlFor="phone"
                                error={errors.phone}
                            >
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    defaultValue={employee?.phone ?? ''}
                                />
                            </Field>
                            <Field
                                label="Monthly salary (₱)"
                                htmlFor="monthly_salary"
                                error={errors.monthly_salary}
                            >
                                <Input
                                    id="monthly_salary"
                                    name="monthly_salary"
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    defaultValue={
                                        employee?.monthly_salary ?? ''
                                    }
                                />
                            </Field>
                            <Field
                                label="Status"
                                htmlFor="status"
                                error={errors.status}
                            >
                                <Select
                                    id="status"
                                    name="status"
                                    options={statuses}
                                    defaultValue={employee?.status ?? 'active'}
                                />
                            </Field>
                            <Field
                                label="Linked staff login"
                                htmlFor="user_id"
                                error={errors.user_id}
                                hint="Optional. Connects this employee to a staff portal account."
                                className="sm:col-span-2"
                            >
                                <Select
                                    id="user_id"
                                    name="user_id"
                                    options={toOptions(
                                        users,
                                        (user) =>
                                            `${user.name} (${user.email})`,
                                    )}
                                    placeholder="No login"
                                    defaultValue={employee?.user_id ?? ''}
                                />
                            </Field>
                            <div className="sm:col-span-2">
                                <Button type="submit" disabled={processing}>
                                    {employee ? 'Save changes' : 'Add employee'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </Card>
        </>
    );
}
