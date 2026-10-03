import { Form } from '@inertiajs/react';
import { DeleteButton } from '@/components/delete-button';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Field,
    Input,
    Select,
    Textarea,
    toOptions,
} from '@/components/ui/form';
import { destroy, index, store, update } from '@/routes/admin/rooms';
import type { Option, Room } from '@/types';

type Props = {
    room: Room | null;
    roomTypes: { id: number; name: string }[];
    statuses: Option[];
};

export default function RoomForm({ room, roomTypes, statuses }: Props) {
    return (
        <>
            <PageHeader
                title={room ? `Edit room ${room.number}` : 'New room'}
                back={{ href: index.url(), label: 'Room board' }}
                actions={
                    room && (
                        <DeleteButton
                            href={destroy.url(room.id)}
                            confirmMessage={`Delete room ${room.number}?`}
                            variant="secondary"
                            size="md"
                        />
                    )
                }
            />
            <Card className="max-w-3xl p-6">
                <Form
                    {...(room ? update.form(room.id) : store.form())}
                    className="grid gap-5 sm:grid-cols-2"
                >
                    {({ errors, processing }) => (
                        <>
                            <Field
                                label="Room number"
                                htmlFor="number"
                                error={errors.number}
                            >
                                <Input
                                    id="number"
                                    name="number"
                                    defaultValue={room?.number}
                                    required
                                />
                            </Field>
                            <Field
                                label="Floor"
                                htmlFor="floor"
                                error={errors.floor}
                            >
                                <Input
                                    id="floor"
                                    name="floor"
                                    type="number"
                                    min={0}
                                    defaultValue={room?.floor ?? 1}
                                    required
                                />
                            </Field>
                            <Field
                                label="Room type"
                                htmlFor="room_type_id"
                                error={errors.room_type_id}
                            >
                                <Select
                                    id="room_type_id"
                                    name="room_type_id"
                                    options={toOptions(
                                        roomTypes,
                                        (roomType) => roomType.name,
                                    )}
                                    placeholder="Choose a room type"
                                    defaultValue={room?.room_type_id ?? ''}
                                    required
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
                                    defaultValue={room?.status ?? 'available'}
                                />
                            </Field>
                            <Field
                                label="Notes"
                                htmlFor="notes"
                                error={errors.notes}
                                className="sm:col-span-2"
                            >
                                <Textarea
                                    id="notes"
                                    name="notes"
                                    defaultValue={room?.notes ?? ''}
                                    placeholder="Connecting room, sea view, accessible…"
                                />
                            </Field>
                            <div className="sm:col-span-2">
                                <Button type="submit" disabled={processing}>
                                    {room ? 'Save changes' : 'Create room'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </Card>
        </>
    );
}
