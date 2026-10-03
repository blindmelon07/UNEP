import { Form } from '@inertiajs/react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field, Input } from '@/components/ui/form';
import { index, show, store, update } from '@/routes/admin/guests';
import type { Guest } from '@/types';

export default function GuestForm({ guest }: { guest: Guest | null }) {
    return (
        <>
            <PageHeader
                title={guest ? `Edit ${guest.full_name}` : 'New guest'}
                back={
                    guest
                        ? { href: show.url(guest.id), label: guest.full_name }
                        : { href: index.url(), label: 'Guests' }
                }
            />
            <Card className="max-w-3xl p-6">
                <Form
                    {...(guest ? update.form(guest.id) : store.form())}
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
                                    defaultValue={guest?.first_name}
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
                                    defaultValue={guest?.last_name}
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
                                    defaultValue={guest?.email}
                                    required
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
                                    defaultValue={guest?.phone}
                                    required
                                />
                            </Field>
                            <Field
                                label="Address"
                                htmlFor="address"
                                error={errors.address}
                                className="sm:col-span-2"
                            >
                                <Input
                                    id="address"
                                    name="address"
                                    defaultValue={guest?.address ?? ''}
                                />
                            </Field>
                            <Field
                                label="ID type"
                                htmlFor="id_type"
                                error={errors.id_type}
                            >
                                <Input
                                    id="id_type"
                                    name="id_type"
                                    defaultValue={guest?.id_type ?? ''}
                                    placeholder="Passport, Driver's license…"
                                />
                            </Field>
                            <Field
                                label="ID number"
                                htmlFor="id_number"
                                error={errors.id_number}
                            >
                                <Input
                                    id="id_number"
                                    name="id_number"
                                    defaultValue={guest?.id_number ?? ''}
                                />
                            </Field>
                            <div className="sm:col-span-2">
                                <Button type="submit" disabled={processing}>
                                    {guest ? 'Save changes' : 'Create guest'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </Card>
        </>
    );
}
