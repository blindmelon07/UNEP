import { Link, usePage } from '@inertiajs/react';
import { DeleteButton } from '@/components/delete-button';
import { PageHeader } from '@/components/page-header';
import { Badge, humanize } from '@/components/ui/badge';
import { buttonClasses } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TBody, Td, Th } from '@/components/ui/table';
import { create, destroy, edit } from '@/routes/admin/users';
import type { StaffUser } from '@/types';

export default function UsersIndex({ users }: { users: StaffUser[] }) {
    const { auth } = usePage().props;

    return (
        <>
            <PageHeader
                title="Staff accounts"
                description="Logins for the staff portal. A role decides which modules each person can open."
                actions={
                    <Link href={create.url()} className={buttonClasses()}>
                        Add account
                    </Link>
                }
            />
            <Card>
                <Table>
                    <thead>
                        <tr>
                            <Th>Name</Th>
                            <Th>Email</Th>
                            <Th>Role</Th>
                            <Th>Status</Th>
                            <Th className="text-right">Actions</Th>
                        </tr>
                    </thead>
                    <TBody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <Td className="font-medium text-slate-900">
                                    {user.name}
                                    {user.id === auth.user?.id && (
                                        <span className="ml-2 text-xs text-slate-500">
                                            (you)
                                        </span>
                                    )}
                                </Td>
                                <Td>{user.email}</Td>
                                <Td>
                                    <Badge
                                        tone={
                                            user.role === 'admin'
                                                ? 'purple'
                                                : 'blue'
                                        }
                                    >
                                        {humanize(user.role)}
                                    </Badge>
                                </Td>
                                <Td>
                                    {user.is_active ? (
                                        <Badge tone="green">Active</Badge>
                                    ) : (
                                        <Badge>Disabled</Badge>
                                    )}
                                </Td>
                                <Td className="text-right whitespace-nowrap">
                                    <Link
                                        href={edit.url(user.id)}
                                        className={buttonClasses({
                                            variant: 'ghost',
                                            size: 'sm',
                                        })}
                                    >
                                        Edit
                                    </Link>
                                    {user.id !== auth.user?.id && (
                                        <DeleteButton
                                            href={destroy.url(user.id)}
                                            confirmMessage={`Delete ${user.name}'s account?`}
                                        />
                                    )}
                                </Td>
                            </tr>
                        ))}
                    </TBody>
                </Table>
            </Card>
        </>
    );
}
