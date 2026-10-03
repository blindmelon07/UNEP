import { Form } from '@inertiajs/react';
import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Checkbox,
    Field,
    Input,
    Select,
    Textarea,
    toOptions,
} from '@/components/ui/form';
import {
    index,
    show,
    store,
    update,
} from '@/routes/admin/maintenance-requests';
import type { Employee, MaintenanceRequest, Option } from '@/types';

type Props = {
    request: MaintenanceRequest | null;
    defaultRoomId: number | null;
    rooms: { id: number; number: string }[];
    employees: Pick<Employee, 'id' | 'first_name' | 'last_name' | 'position'>[];
    statuses: Option[];
    priorities: Option[];
};

export default function MaintenanceForm({
    request,
    defaultRoomId,
    rooms,
    employees,
    statuses,
    priorities,
}: Props) {
    const [roomId, setRoomId] = useState(
        String(request?.room_id ?? defaultRoomId ?? ''),
    );
    const [status, setStatus] = useState<string>(request?.status ?? 'open');
    const [blocksRoom, setBlocksRoom] = useState(request?.blocks_room ?? false);
    const isClosing = status === 'resolved' || status === 'cancelled';

    return (
        <>
            <PageHeader
                title={
                    request
                        ? `Update work order #${request.id}`
                        : 'Report an issue'
                }
                back={
                    request
                        ? { href: show.url(request.id), label: request.title }
                        : { href: index.url(), label: 'Work orders' }
                }
            />
            <Card className="max-w-3xl p-6">
                <Form
                    {...(request ? update.form(request.id) : store.form())}
                    className="grid gap-5 sm:grid-cols-2"
                >
                    {({ errors, processing }) => (
                        <>
                            <Field
                                label="What's wrong?"
                                htmlFor="title"
                                error={errors.title}
                                className="sm:col-span-2"
                            >
                                <Input
                                    id="title"
                                    name="title"
                                    defaultValue={request?.title}
                                    placeholder="e.g. Aircon not cooling"
                                    required
                                />
                            </Field>
                            <Field
                                label="Room"
                                htmlFor="room_id"
                                error={errors.room_id}
                            >
                                <Select
                                    id="room_id"
                                    name="room_id"
                                    value={roomId}
                                    onChange={(event) =>
                                        setRoomId(event.target.value)
                                    }
                                    options={toOptions(
                                        rooms,
                                        (room) => `Room ${room.number}`,
                                    )}
                                    placeholder="Not a guest room"
                                />
                            </Field>
                            <Field
                                label="Other location"
                                htmlFor="location"
                                error={errors.location}
                                hint="Lobby, pool, kitchen… (if not a room)"
                            >
                                <Input
                                    id="location"
                                    name="location"
                                    defaultValue={request?.location ?? ''}
                                />
                            </Field>
                            <Field
                                label="Priority"
                                htmlFor="priority"
                                error={errors.priority}
                            >
                                <Select
                                    id="priority"
                                    name="priority"
                                    options={priorities}
                                    defaultValue={request?.priority ?? 'medium'}
                                />
                            </Field>
                            <Field
                                label="Assign to"
                                htmlFor="assigned_to"
                                error={errors.assigned_to}
                            >
                                <Select
                                    id="assigned_to"
                                    name="assigned_to"
                                    options={toOptions(
                                        employees,
                                        (employee) =>
                                            `${employee.first_name} ${employee.last_name} · ${employee.position}`,
                                    )}
                                    placeholder="Unassigned"
                                    defaultValue={request?.assigned_to ?? ''}
                                />
                            </Field>
                            <Field
                                label="Details"
                                htmlFor="description"
                                error={errors.description}
                                className="sm:col-span-2"
                            >
                                <Textarea
                                    id="description"
                                    name="description"
                                    defaultValue={request?.description ?? ''}
                                />
                            </Field>
                            <input
                                type="hidden"
                                name="blocks_room"
                                value={roomId !== '' && blocksRoom ? '1' : '0'}
                            />
                            {roomId !== '' && (
                                <div className="sm:col-span-2">
                                    <Checkbox
                                        checked={blocksRoom}
                                        onChange={(event) =>
                                            setBlocksRoom(event.target.checked)
                                        }
                                        label="Take the room out of order until this is resolved (sets the room status to Maintenance)"
                                    />
                                </div>
                            )}
                            {request && (
                                <>
                                    <Field
                                        label="Status"
                                        htmlFor="status"
                                        error={errors.status}
                                    >
                                        <Select
                                            id="status"
                                            name="status"
                                            options={statuses}
                                            value={status}
                                            onChange={(event) =>
                                                setStatus(event.target.value)
                                            }
                                        />
                                    </Field>
                                    <div />
                                    {isClosing && (
                                        <Field
                                            label="Resolution notes"
                                            htmlFor="resolution_notes"
                                            error={errors.resolution_notes}
                                            className="sm:col-span-2"
                                        >
                                            <Textarea
                                                id="resolution_notes"
                                                name="resolution_notes"
                                                defaultValue={
                                                    request.resolution_notes ??
                                                    ''
                                                }
                                                placeholder="What was done to fix it?"
                                            />
                                        </Field>
                                    )}
                                </>
                            )}
                            <div className="sm:col-span-2">
                                <Button type="submit" disabled={processing}>
                                    {request
                                        ? 'Save changes'
                                        : 'Submit work order'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </Card>
        </>
    );
}
