import { Form } from '@inertiajs/react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field, Input, Textarea } from '@/components/ui/form';
import { index, store, update } from '@/routes/admin/room-types';
import type { RoomType } from '@/types';

export default function RoomTypeForm({
    roomType,
}: {
    roomType: RoomType | null;
}) {
    return (
        <>
            <PageHeader
                title={roomType ? `Edit ${roomType.name}` : 'New room type'}
                back={{ href: index.url(), label: 'Room types' }}
            />
            <Card className="max-w-3xl p-6">
                <Form
                    {...(roomType ? update.form(roomType.id) : store.form())}
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
                                    defaultValue={roomType?.name}
                                    required
                                />
                            </Field>
                            <Field
                                label="URL slug"
                                htmlFor="slug"
                                error={errors.slug}
                                hint="Leave blank to generate from the name."
                            >
                                <Input
                                    id="slug"
                                    name="slug"
                                    defaultValue={roomType?.slug}
                                />
                            </Field>
                            <Field
                                label="Nightly rate (₱)"
                                htmlFor="base_rate"
                                error={errors.base_rate}
                            >
                                <Input
                                    id="base_rate"
                                    name="base_rate"
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    defaultValue={roomType?.base_rate}
                                    required
                                />
                            </Field>
                            <Field
                                label="Maximum guests"
                                htmlFor="capacity"
                                error={errors.capacity}
                            >
                                <Input
                                    id="capacity"
                                    name="capacity"
                                    type="number"
                                    min={1}
                                    max={20}
                                    defaultValue={roomType?.capacity ?? 2}
                                    required
                                />
                            </Field>
                            <Field
                                label="Description"
                                htmlFor="description"
                                error={errors.description}
                                className="sm:col-span-2"
                            >
                                <Textarea
                                    id="description"
                                    name="description"
                                    defaultValue={roomType?.description ?? ''}
                                />
                            </Field>
                            <Field
                                label="Amenities"
                                htmlFor="amenities"
                                error={errors.amenities}
                                hint="Separate with commas, e.g. Wi-Fi, Smart TV, Minibar"
                                className="sm:col-span-2"
                            >
                                <Input
                                    id="amenities"
                                    name="amenities"
                                    defaultValue={
                                        roomType?.amenities?.join(', ') ?? ''
                                    }
                                />
                            </Field>
                            <Field
                                label="Photo URL (optional)"
                                htmlFor="image_url"
                                error={errors.image_url}
                                className="sm:col-span-2"
                            >
                                <Input
                                    id="image_url"
                                    name="image_url"
                                    type="url"
                                    defaultValue={roomType?.image_url ?? ''}
                                    placeholder="https://…"
                                />
                            </Field>
                            <div className="sm:col-span-2">
                                <Button type="submit" disabled={processing}>
                                    {roomType
                                        ? 'Save changes'
                                        : 'Create room type'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </Card>
        </>
    );
}
