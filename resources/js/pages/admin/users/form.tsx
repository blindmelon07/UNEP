import { Form } from '@inertiajs/react';
import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox, Field, Input, Select } from '@/components/ui/form';
import { index, store, update } from '@/routes/admin/users';
import type { Option, StaffUser } from '@/types';

const roleDescriptions: Record<string, string> = {
    admin: 'Full access to every module and staff accounts.',
    front_desk:
        'Reservations, guests, check-in/out, billing and the room board.',
    maintenance:
        'Work orders, issuing parts, and housekeeping status on the room board.',
    inventory: 'Stock items, categories and stock movements.',
    human_resources: 'Employees, departments and the shift roster.',
};

export default function UserForm({
    user,
    roles,
}: {
    user: StaffUser | null;
    roles: Option[];
}) {
    const [role, setRole] = useState<string>(user?.role ?? 'front_desk');
    const [isActive, setIsActive] = useState(user?.is_active ?? true);

    return (
        <>
            <PageHeader
                title={user ? `Edit ${user.name}` : 'New staff account'}
                back={{ href: index.url(), label: 'Staff accounts' }}
            />
            <Card className="max-w-2xl p-6">
                <Form
                    {...(user ? update.form(user.id) : store.form())}
                    resetOnError={['password', 'password_confirmation']}
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
                                    defaultValue={user?.name}
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
                                    defaultValue={user?.email}
                                    autoComplete="off"
                                    required
                                />
                            </Field>
                            <Field
                                label="Role"
                                htmlFor="role"
                                error={errors.role}
                                hint={roleDescriptions[role]}
                                className="sm:col-span-2"
                            >
                                <Select
                                    id="role"
                                    name="role"
                                    options={roles}
                                    value={role}
                                    onChange={(event) =>
                                        setRole(event.target.value)
                                    }
                                />
                            </Field>
                            <Field
                                label={user ? 'New password' : 'Password'}
                                htmlFor="password"
                                error={errors.password}
                                hint={
                                    user
                                        ? 'Leave blank to keep the current password.'
                                        : undefined
                                }
                            >
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required={!user}
                                />
                            </Field>
                            <Field
                                label="Confirm password"
                                htmlFor="password_confirmation"
                                error={errors.password_confirmation}
                            >
                                <Input
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    type="password"
                                    autoComplete="new-password"
                                    required={!user}
                                />
                            </Field>
                            <div className="sm:col-span-2">
                                <input
                                    type="hidden"
                                    name="is_active"
                                    value={isActive ? '1' : '0'}
                                />
                                <Checkbox
                                    checked={isActive}
                                    onChange={(event) =>
                                        setIsActive(event.target.checked)
                                    }
                                    label="Account is active (inactive accounts cannot sign in)"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <Button type="submit" disabled={processing}>
                                    {user ? 'Save changes' : 'Create account'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </Card>
        </>
    );
}
