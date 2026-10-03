import { Form } from '@inertiajs/react';
import { PageHeader } from '@/components/page-header';
import { StayFields } from '@/components/stay-fields';
import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { Field, Input, Select } from '@/components/ui/form';
import { index, store } from '@/routes/admin/reservations';
import type { Guest, Option, RoomType } from '@/types';

type Props = {
    guest: Guest | null;
    roomTypes: Pick<RoomType, 'id' | 'name' | 'base_rate' | 'capacity'>[];
    sources: Option[];
};

export default function ReservationCreate({
    guest,
    roomTypes,
    sources,
}: Props) {
    return (
        <>
            <PageHeader
                title="New reservation"
                description="Walk-in and phone bookings are confirmed immediately. Assign a room from the reservation page."
                back={{ href: index.url(), label: 'Reservations' }}
            />
            <Form {...store.form()} className="grid max-w-4xl gap-6">
                {({ errors, processing }) => (
                    <>
                        <Card>
                            <CardHeader title="Guest" />
                            {guest ? (
                                <div className="p-5 text-sm">
                                    <input
                                        type="hidden"
                                        name="guest_id"
                                        value={guest.id}
                                    />
                                    <p className="font-medium text-slate-900">
                                        {guest.full_name}
                                    </p>
                                    <p className="text-slate-500">
                                        {guest.email} · {guest.phone}
                                    </p>
                                </div>
                            ) : (
                                <div className="grid gap-5 p-5 sm:grid-cols-2">
                                    <Field
                                        label="First name"
                                        htmlFor="guest_first_name"
                                        error={errors['guest.first_name']}
                                    >
                                        <Input
                                            id="guest_first_name"
                                            name="guest[first_name]"
                                            required
                                        />
                                    </Field>
                                    <Field
                                        label="Last name"
                                        htmlFor="guest_last_name"
                                        error={errors['guest.last_name']}
                                    >
                                        <Input
                                            id="guest_last_name"
                                            name="guest[last_name]"
                                            required
                                        />
                                    </Field>
                                    <Field
                                        label="Email"
                                        htmlFor="guest_email"
                                        error={errors['guest.email']}
                                    >
                                        <Input
                                            id="guest_email"
                                            name="guest[email]"
                                            type="email"
                                            required
                                        />
                                    </Field>
                                    <Field
                                        label="Phone"
                                        htmlFor="guest_phone"
                                        error={errors['guest.phone']}
                                    >
                                        <Input
                                            id="guest_phone"
                                            name="guest[phone]"
                                            type="tel"
                                            required
                                        />
                                    </Field>
                                </div>
                            )}
                        </Card>
                        <Card>
                            <CardHeader title="Stay" />
                            <div className="grid gap-5 p-5 sm:grid-cols-2">
                                <StayFields
                                    roomTypes={roomTypes}
                                    errors={errors}
                                />
                                <Field
                                    label="Booking source"
                                    htmlFor="source"
                                    error={errors.source}
                                >
                                    <Select
                                        id="source"
                                        name="source"
                                        options={sources.filter(
                                            (source) =>
                                                source.value !== 'online',
                                        )}
                                        defaultValue="walk_in"
                                    />
                                </Field>
                            </div>
                        </Card>
                        <div>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Saving…' : 'Create reservation'}
                            </Button>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}
