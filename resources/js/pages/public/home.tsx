import { Head, usePage } from '@inertiajs/react';
import { RoomTypeCard } from '@/components/room-type-card';
import { StaySearchForm } from '@/components/stay-search-form';
import type { RoomType } from '@/types';

export default function Home({ roomTypes }: { roomTypes: RoomType[] }) {
    const { name } = usePage().props;

    return (
        <>
            <Head title="Welcome" />
            <section className="bg-gradient-to-b from-brand-900 to-brand-800 pt-16 pb-28 text-white">
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <p className="text-sm font-medium tracking-widest text-gold-400 uppercase">
                        Welcome to {name}
                    </p>
                    <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
                        Rest easy. Your room is ready when you are.
                    </h1>
                    <p className="mt-4 max-w-xl text-brand-100">
                        Check live availability and reserve your stay in a
                        minute. No payment is needed online — settle at the
                        front desk on arrival.
                    </p>
                </div>
            </section>
            <div className="mx-auto -mt-16 max-w-6xl px-4 sm:px-6">
                <StaySearchForm />
            </div>
            <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
                <h2 className="text-2xl font-semibold tracking-tight">
                    Our rooms
                </h2>
                <p className="mt-1 text-slate-600">
                    Rates per night, inclusive of taxes.
                </p>
                <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {roomTypes.map((roomType, index) => (
                        <RoomTypeCard
                            key={roomType.id}
                            roomType={roomType}
                            index={index}
                        />
                    ))}
                </div>
            </section>
        </>
    );
}
