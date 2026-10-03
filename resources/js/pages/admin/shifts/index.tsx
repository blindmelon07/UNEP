import { Form, Link } from '@inertiajs/react';
import { DeleteButton } from '@/components/delete-button';
import { PageHeader } from '@/components/page-header';
import { Button, buttonClasses } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { Field, Input, Select, toOptions } from '@/components/ui/form';
import {
    addDays,
    formatDate,
    formatTime,
    parseDate,
    toDateInput,
} from '@/lib/format';
import { cn } from '@/lib/utils';
import { destroy, index, store } from '@/routes/admin/shifts';
import type { Employee, Shift } from '@/types';

type Props = {
    weekStart: string;
    days: string[];
    shifts: Shift[];
    employees: Pick<Employee, 'id' | 'first_name' | 'last_name' | 'position'>[];
};

export default function ShiftsIndex({
    weekStart,
    days,
    shifts,
    employees,
}: Props) {
    const today = toDateInput(new Date());

    return (
        <>
            <PageHeader
                title="Shift roster"
                description={`Week of ${formatDate(weekStart)}`}
                actions={
                    <>
                        <Link
                            href={index.url({
                                query: { week: addDays(weekStart, -7) },
                            })}
                            className={buttonClasses({ variant: 'secondary' })}
                        >
                            ← Previous
                        </Link>
                        <Link
                            href={index.url()}
                            className={buttonClasses({ variant: 'secondary' })}
                        >
                            This week
                        </Link>
                        <Link
                            href={index.url({
                                query: { week: addDays(weekStart, 7) },
                            })}
                            className={buttonClasses({ variant: 'secondary' })}
                        >
                            Next →
                        </Link>
                    </>
                }
            />

            <div className="grid gap-6 xl:grid-cols-[1fr_18rem]">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
                    {days.map((day) => {
                        const dayShifts = shifts.filter(
                            (shift) => shift.date === day,
                        );

                        return (
                            <Card
                                key={day}
                                className={cn(
                                    'flex flex-col',
                                    day === today && 'ring-2 ring-brand-600',
                                )}
                            >
                                <div className="border-b border-slate-100 px-3 py-2">
                                    <p className="text-xs font-semibold text-slate-500 uppercase">
                                        {parseDate(day).toLocaleDateString(
                                            'en-PH',
                                            { weekday: 'short' },
                                        )}
                                    </p>
                                    <p className="text-sm font-medium text-slate-900">
                                        {parseDate(day).toLocaleDateString(
                                            'en-PH',
                                            { month: 'short', day: 'numeric' },
                                        )}
                                    </p>
                                </div>
                                <ul className="flex flex-1 flex-col gap-2 p-2">
                                    {dayShifts.length === 0 && (
                                        <li className="p-2 text-center text-xs text-slate-400">
                                            No shifts
                                        </li>
                                    )}
                                    {dayShifts.map((shift) => (
                                        <li
                                            key={shift.id}
                                            className="group rounded-lg bg-brand-50 p-2 text-xs"
                                        >
                                            <p className="font-medium text-brand-900">
                                                {shift.employee?.first_name}{' '}
                                                {shift.employee?.last_name}
                                            </p>
                                            <p className="text-brand-700">
                                                {formatTime(shift.starts_at)} –{' '}
                                                {formatTime(shift.ends_at)}
                                            </p>
                                            <p className="truncate text-slate-500">
                                                {shift.employee?.position}
                                            </p>
                                            <div className="mt-1 hidden group-hover:block">
                                                <DeleteButton
                                                    href={destroy.url(shift.id)}
                                                    confirmMessage="Remove this shift?"
                                                >
                                                    Remove
                                                </DeleteButton>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        );
                    })}
                </div>

                <Card className="h-fit">
                    <CardHeader title="Schedule a shift" />
                    <Form
                        {...store.form()}
                        resetOnSuccess={['notes']}
                        options={{ preserveScroll: true }}
                        className="flex flex-col gap-4 p-5"
                    >
                        {({ errors, processing }) => (
                            <>
                                <Field
                                    label="Employee"
                                    htmlFor="employee_id"
                                    error={errors.employee_id}
                                >
                                    <Select
                                        id="employee_id"
                                        name="employee_id"
                                        placeholder="Choose an employee"
                                        options={toOptions(
                                            employees,
                                            (employee) =>
                                                `${employee.first_name} ${employee.last_name}`,
                                        )}
                                        required
                                    />
                                </Field>
                                <Field
                                    label="Date"
                                    htmlFor="date"
                                    error={errors.date}
                                >
                                    <Input
                                        id="date"
                                        name="date"
                                        type="date"
                                        defaultValue={
                                            days.includes(today)
                                                ? today
                                                : weekStart
                                        }
                                        required
                                    />
                                </Field>
                                <div className="grid grid-cols-2 gap-3">
                                    <Field
                                        label="Starts"
                                        htmlFor="starts_at"
                                        error={errors.starts_at}
                                    >
                                        <Input
                                            id="starts_at"
                                            name="starts_at"
                                            type="time"
                                            defaultValue="06:00"
                                            required
                                        />
                                    </Field>
                                    <Field
                                        label="Ends"
                                        htmlFor="ends_at"
                                        error={errors.ends_at}
                                    >
                                        <Input
                                            id="ends_at"
                                            name="ends_at"
                                            type="time"
                                            defaultValue="14:00"
                                            required
                                        />
                                    </Field>
                                </div>
                                <Field
                                    label="Notes"
                                    htmlFor="notes"
                                    error={errors.notes}
                                >
                                    <Input id="notes" name="notes" />
                                </Field>
                                <Button type="submit" disabled={processing}>
                                    Add shift
                                </Button>
                            </>
                        )}
                    </Form>
                </Card>
            </div>
        </>
    );
}
