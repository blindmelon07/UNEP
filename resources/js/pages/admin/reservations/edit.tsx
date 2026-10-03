import { Form } from '@inertiajs/react';
import { PageHeader } from '@/components/page-header';
import { StayFields } from '@/components/stay-fields';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { show, update } from '@/routes/admin/reservations';
import type { Reservation, RoomType } from '@/types';

type Props = {
    reservation: Reservation;
    roomTypes: Pick<RoomType, 'id' | 'name' | 'base_rate' | 'capacity'>[];
    assignableRooms: { id: number; number: string; room_type_id: number }[];
};

export default function ReservationEdit({
    reservation,
    roomTypes,
    assignableRooms,
}: Props) {
    return (
        <>
            <PageHeader
                title={`Edit ${reservation.code}`}
                description={`${reservation.guest?.first_name} ${reservation.guest?.last_name}`}
                back={{
                    href: show.url(reservation.id),
                    label: 'Back to reservation',
                }}
            />
            <Card className="max-w-4xl p-5">
                <Form
                    {...update.form(reservation.id)}
                    className="grid gap-5 sm:grid-cols-2"
                >
                    {({ errors, processing }) => (
                        <>
                            <StayFields
                                roomTypes={roomTypes}
                                errors={errors}
                                rooms={assignableRooms}
                                defaultRoomId={reservation.room_id}
                                defaults={{
                                    room_type_id: reservation.room_type_id,
                                    check_in: reservation.check_in,
                                    check_out: reservation.check_out,
                                    adults: reservation.adults,
                                    children: reservation.children,
                                    special_requests:
                                        reservation.special_requests,
                                    nightly_rate: reservation.nightly_rate,
                                }}
                            />
                            <div className="sm:col-span-2">
                                <Button type="submit" disabled={processing}>
                                    Save changes
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </Card>
        </>
    );
}
