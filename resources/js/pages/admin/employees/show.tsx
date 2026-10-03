import { Link } from '@inertiajs/react';
import { DeleteButton } from '@/components/delete-button';
import { PageHeader } from '@/components/page-header';
import { StatusBadge, humanize } from '@/components/ui/badge';
import { buttonClasses } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { formatCurrency, formatDate, formatTime } from '@/lib/format';
import { destroy, edit, index } from '@/routes/admin/employees';
import { show as maintenanceShow } from '@/routes/admin/maintenance-requests';
import type { Employee, MaintenanceRequest, Shift } from '@/types';

type Props = {
    employee: Employee;
    upcomingShifts: Shift[];
    openAssignments: MaintenanceRequest[];
};

export default function EmployeeShow({
    employee,
    upcomingShifts,
    openAssignments,
}: Props) {
    const details: [string, string][] = [
        ['Employee no.', employee.employee_number],
        ['Department', employee.department?.name ?? '—'],
        ['Hired', formatDate(employee.hire_date)],
        ['Email', employee.email ?? '—'],
        ['Phone', employee.phone ?? '—'],
        [
            'Monthly salary',
            employee.monthly_salary
                ? formatCurrency(employee.monthly_salary)
                : '—',
        ],
        [
            'Staff login',
            employee.user
                ? `${employee.user.email} (${humanize(employee.user.role)})`
                : 'None',
        ],
    ];

    return (
        <>
            <PageHeader
                title={employee.full_name}
                back={{ href: index.url(), label: 'Employees' }}
                description={
                    <span className="flex items-center gap-2">
                        {employee.position}{' '}
                        <StatusBadge status={employee.status} />
                    </span>
                }
                actions={
                    <>
                        <Link
                            href={edit.url(employee.id)}
                            className={buttonClasses({ variant: 'secondary' })}
                        >
                            Edit
                        </Link>
                        <DeleteButton
                            href={destroy.url(employee.id)}
                            confirmMessage={`Delete ${employee.full_name}? Their shifts will also be removed.`}
                            size="md"
                        />
                    </>
                }
            />
            <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
                <Card className="h-fit p-5">
                    <dl className="space-y-3 text-sm">
                        {details.map(([label, value]) => (
                            <div key={label}>
                                <dt className="text-slate-500">{label}</dt>
                                <dd className="font-medium text-slate-900">
                                    {value}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </Card>
                <div className="flex flex-col gap-6">
                    <Card>
                        <CardHeader title="Upcoming shifts" />
                        {upcomingShifts.length === 0 ? (
                            <p className="px-5 py-8 text-center text-sm text-slate-500">
                                No upcoming shifts scheduled.
                            </p>
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {upcomingShifts.map((shift) => (
                                    <li
                                        key={shift.id}
                                        className="flex justify-between px-5 py-3 text-sm"
                                    >
                                        <span className="font-medium">
                                            {formatDate(shift.date)}
                                        </span>
                                        <span className="text-slate-600">
                                            {formatTime(shift.starts_at)} –{' '}
                                            {formatTime(shift.ends_at)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Card>
                    <Card>
                        <CardHeader title="Open work orders" />
                        {openAssignments.length === 0 ? (
                            <p className="px-5 py-8 text-center text-sm text-slate-500">
                                No work orders assigned.
                            </p>
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {openAssignments.map((request) => (
                                    <li key={request.id}>
                                        <Link
                                            href={maintenanceShow.url(
                                                request.id,
                                            )}
                                            className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50"
                                        >
                                            <span className="text-sm font-medium text-slate-900">
                                                {request.title}
                                                <span className="block text-xs font-normal text-slate-500">
                                                    {request.room
                                                        ? `Room ${request.room.number}`
                                                        : request.location}
                                                </span>
                                            </span>
                                            <StatusBadge
                                                status={request.status}
                                            />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Card>
                </div>
            </div>
        </>
    );
}
