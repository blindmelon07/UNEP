import { Head, Link, usePage } from '@inertiajs/react';
import type { Photo } from '@/components/photo-gallery';
import { PhotoGallery } from '@/components/photo-gallery';
import { RoomTypeCard } from '@/components/room-type-card';
import { StaySearchForm } from '@/components/stay-search-form';
import { buttonClasses } from '@/components/ui/button';
import { roomTypeTourStops } from '@/lib/hotel-tour';
import { tour } from '@/routes';
import type { RoomType } from '@/types';

const hotelPhotos: Photo[] = [
    {
        src: '/images/facility/lobby.jpg',
        title: 'Lobby & front desk',
        caption: 'Where every stay begins',
    },
    {
        src: '/images/facility/lobby-entrance.jpg',
        title: 'Lobby entrance',
        caption: 'Warm wood arches and tropical greenery',
    },
    {
        src: '/images/facility/deluxe-room.jpg',
        title: 'Deluxe Room',
        caption: 'Queen bed, dining table and en-suite shower',
    },
    {
        src: '/images/facility/deluxe-lounge.jpg',
        title: 'Guest lounge',
        caption: 'Relax with family and friends',
    },
    {
        src: '/images/facility/economy-room.jpg',
        title: 'Economy Room',
        caption: 'A double and a single bed',
    },
    {
        src: '/images/facility/hostel.jpg',
        title: 'Hostel wing',
        caption: 'Budget rooms for groups and teams',
    },
];

const trainingPhotos: Photo[] = [
    {
        src: '/images/facility/bar-supplies.jpg',
        title: 'Bar & F&B laboratory',
        caption: 'Glassware, tableware and bar tools for service training',
    },
    {
        src: '/images/facility/travel-desk.jpg',
        title: 'DHTM Travel desk',
        caption: 'Hands-on ticketing and tour operations',
    },
    {
        src: '/images/facility/resource-room.jpg',
        title: 'Resource room',
        caption: 'References, portfolios and study space',
    },
];

export default function Home({ roomTypes }: { roomTypes: RoomType[] }) {
    const { name, hotel } = usePage().props;

    return (
        <>
            <Head title="Welcome" />
            <section className="relative overflow-hidden bg-brand-950 pt-14 pb-28 text-white">
                <img
                    src="/images/facility/lobby.jpg"
                    alt=""
                    aria-hidden
                    className="absolute inset-0 size-full object-cover opacity-35"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-brand-950 via-brand-950/85 to-brand-900/40" />
                <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 md:grid-cols-[1fr_auto]">
                    <div>
                        <p className="text-sm font-medium tracking-widest text-gold-400 uppercase">
                            Welcome to {name}
                        </p>
                        <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
                            Warm Bicolano hospitality, served by tomorrow&apos;s
                            hoteliers.
                        </h1>
                        <p className="mt-4 max-w-xl text-brand-100">
                            Stay at the training hotel of the {hotel.school}{' '}
                            {hotel.department}. Check live availability and
                            reserve in a minute — no payment is needed online;
                            settle at the front desk on arrival.
                        </p>
                        <p className="mt-6 text-xs font-medium tracking-[0.2em] text-gold-300 uppercase">
                            {hotel.motto.join(' · ')}
                        </p>
                    </div>
                    <img
                        src="/images/unep-htm-logo.jpg"
                        alt={`${hotel.school} ${hotel.department} logo`}
                        className="mx-auto hidden w-64 rounded-3xl shadow-2xl ring-1 shadow-black/40 ring-gold-500/40 md:block lg:w-72"
                    />
                </div>
            </section>
            <div className="relative mx-auto -mt-16 max-w-6xl px-4 sm:px-6">
                <StaySearchForm />
            </div>

            <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6">
                <h2 className="text-2xl font-semibold tracking-tight">
                    Our rooms
                </h2>
                <p className="mt-1 text-slate-600">
                    Rates per night, inclusive of taxes.
                </p>
                <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                    {roomTypes.map((roomType, index) => (
                        <RoomTypeCard
                            key={roomType.id}
                            roomType={roomType}
                            index={index}
                            footer={
                                roomTypeTourStops[roomType.slug] && (
                                    <Link
                                        href={tour.url({
                                            query: {
                                                start: roomTypeTourStops[
                                                    roomType.slug
                                                ],
                                            },
                                        })}
                                        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-900"
                                    >
                                        Walk through this room
                                        <span aria-hidden>→</span>
                                    </Link>
                                )
                            }
                        />
                    ))}
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-4 pt-20 sm:px-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-semibold tracking-tight">
                            Take a look around
                        </h2>
                        <p className="mt-1 text-slate-600">
                            Tap a photo to see it full size, or walk through the
                            hotel room by room.
                        </p>
                    </div>
                    <Link
                        href={tour.url()}
                        className={buttonClasses({ className: 'bg-brand-800' })}
                    >
                        Start the virtual tour
                    </Link>
                </div>
                <PhotoGallery photos={hotelPhotos} className="mt-8" />
            </section>

            <section className="mt-20 bg-brand-900 py-16 text-white">
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <p className="text-sm font-medium tracking-widest text-gold-400 uppercase">
                        {hotel.department}
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                        Where tomorrow&apos;s hoteliers train
                    </h2>
                    <p className="mt-2 max-w-2xl text-brand-100">
                        Every stay supports hands-on learning. Our students run
                        the front desk, housekeeping and food &amp; beverage
                        service under the guidance of industry-trained faculty.
                    </p>
                    <PhotoGallery photos={trainingPhotos} className="mt-8" />
                </div>
            </section>
        </>
    );
}
