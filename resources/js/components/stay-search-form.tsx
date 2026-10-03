import { Form } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/form';
import { addDays, toDateInput } from '@/lib/format';
import { index as bookingIndex } from '@/routes/booking';

type StaySearchFormProps = {
    defaults?: {
        check_in: string;
        check_out: string;
        guests: number | string;
    } | null;
};

export function StaySearchForm({ defaults }: StaySearchFormProps) {
    const today = toDateInput(new Date());
    const [checkIn, setCheckIn] = useState(defaults?.check_in ?? today);
    const [checkOut, setCheckOut] = useState(
        defaults?.check_out ?? addDays(today, 1),
    );

    return (
        <Form
            {...bookingIndex.form()}
            className="grid gap-4 rounded-2xl bg-white p-5 shadow-lg ring-1 ring-stone-200 sm:grid-cols-[1fr_1fr_8rem_auto] sm:items-end"
        >
            {({ errors, processing }) => (
                <>
                    <Field
                        label="Check-in"
                        htmlFor="check_in"
                        error={errors.check_in}
                    >
                        <Input
                            id="check_in"
                            name="check_in"
                            type="date"
                            min={today}
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
                            onChange={(event) =>
                                setCheckOut(event.target.value)
                            }
                            required
                        />
                    </Field>
                    <Field
                        label="Guests"
                        htmlFor="guests"
                        error={errors.guests}
                    >
                        <Input
                            id="guests"
                            name="guests"
                            type="number"
                            min={1}
                            max={10}
                            defaultValue={defaults?.guests ?? 2}
                            required
                        />
                    </Field>
                    <Button
                        type="submit"
                        disabled={processing}
                        className="h-10 bg-brand-800"
                    >
                        Check availability
                    </Button>
                </>
            )}
        </Form>
    );
}
