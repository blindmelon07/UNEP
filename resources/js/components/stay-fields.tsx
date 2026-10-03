import { useState } from 'react';
import {
    Field,
    Input,
    Select,
    Textarea,
    toOptions,
} from '@/components/ui/form';
import {
    addDays,
    formatCurrency,
    nightsBetween,
    toDateInput,
} from '@/lib/format';
import type { RoomType } from '@/types';

type Errors = Partial<Record<string, string>>;

type StayFieldsProps = {
    roomTypes: Pick<RoomType, 'id' | 'name' | 'base_rate' | 'capacity'>[];
    errors: Errors;
    defaults?: {
        room_type_id?: number;
        check_in?: string;
        check_out?: string;
        adults?: number;
        children?: number;
        special_requests?: string | null;
        nightly_rate?: string;
    };
    rooms?: { id: number; number: string }[];
    defaultRoomId?: number | null;
};

/**
 * Room type, dates and party size inputs with a live price estimate, shared by the create and edit forms.
 */
export function StayFields({
    roomTypes,
    errors,
    defaults = {},
    rooms,
    defaultRoomId,
}: StayFieldsProps) {
    const today = toDateInput(new Date());
    const [roomTypeId, setRoomTypeId] = useState(
        String(defaults.room_type_id ?? roomTypes[0]?.id ?? ''),
    );
    const [checkIn, setCheckIn] = useState(defaults.check_in ?? today);
    const [checkOut, setCheckOut] = useState(
        defaults.check_out ?? addDays(today, 1),
    );

    const roomType = roomTypes.find((type) => String(type.id) === roomTypeId);
    const nights = nightsBetween(checkIn, checkOut);
    const rate =
        defaults.nightly_rate && String(defaults.room_type_id) === roomTypeId
            ? Number(defaults.nightly_rate)
            : Number(roomType?.base_rate ?? 0);

    return (
        <>
            <Field
                label="Room type"
                htmlFor="room_type_id"
                error={errors.room_type_id}
            >
                <Select
                    id="room_type_id"
                    name="room_type_id"
                    value={roomTypeId}
                    onChange={(event) => setRoomTypeId(event.target.value)}
                    options={toOptions(
                        roomTypes,
                        (type) =>
                            `${type.name} · ${formatCurrency(type.base_rate)} · sleeps ${type.capacity}`,
                    )}
                    required
                />
            </Field>
            {rooms ? (
                <Field
                    label="Room"
                    htmlFor="room_id"
                    error={errors.room_id}
                    hint="Rooms free for the original dates. Change dates first if you need a different room."
                >
                    <Select
                        id="room_id"
                        name="room_id"
                        defaultValue={defaultRoomId ?? ''}
                        placeholder="Assign later"
                        options={toOptions(
                            rooms,
                            (room) => `Room ${room.number}`,
                        )}
                    />
                </Field>
            ) : (
                <div />
            )}
            <Field label="Check-in" htmlFor="check_in" error={errors.check_in}>
                <Input
                    id="check_in"
                    name="check_in"
                    type="date"
                    value={checkIn}
                    onChange={(event) => {
                        setCheckIn(event.target.value);

                        if (event.target.value >= checkOut) {
                            setCheckOut(addDays(event.target.value, 1));
                        }
                    }}
                    required
                />
            </Field>
            <Field
                label="Check-out"
                htmlFor="check_out"
                error={errors.check_out}
            >
                <Input
                    id="check_out"
                    name="check_out"
                    type="date"
                    min={addDays(checkIn, 1)}
                    value={checkOut}
                    onChange={(event) => setCheckOut(event.target.value)}
                    required
                />
            </Field>
            <Field label="Adults" htmlFor="adults" error={errors.adults}>
                <Input
                    id="adults"
                    name="adults"
                    type="number"
                    min={1}
                    max={roomType?.capacity}
                    defaultValue={defaults.adults ?? 2}
                    required
                />
            </Field>
            <Field label="Children" htmlFor="children" error={errors.children}>
                <Input
                    id="children"
                    name="children"
                    type="number"
                    min={0}
                    defaultValue={defaults.children ?? 0}
                />
            </Field>
            <Field
                label="Special requests"
                htmlFor="special_requests"
                error={errors.special_requests}
                className="sm:col-span-2"
            >
                <Textarea
                    id="special_requests"
                    name="special_requests"
                    defaultValue={defaults.special_requests ?? ''}
                />
            </Field>
            <div className="rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-900 sm:col-span-2">
                {nights} night{nights === 1 ? '' : 's'} × {formatCurrency(rate)}{' '}
                ={' '}
                <span className="font-semibold">
                    {formatCurrency(rate * nights)}
                </span>
            </div>
        </>
    );
}
