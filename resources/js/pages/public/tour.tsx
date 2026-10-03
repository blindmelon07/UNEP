import { Head, Link } from '@inertiajs/react';
import { buttonClasses } from '@/components/ui/button';
import { VirtualTour } from '@/components/virtual-tour';
import { index as bookingIndex } from '@/routes/booking';

export default function Tour({ start }: { start: string | null }) {
    return (
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
            <Head title="Virtual tour" />
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-sm font-medium tracking-widest text-gold-600 uppercase">
                        Virtual tour
                    </p>
                    <h1 className="mt-1 text-3xl font-semibold tracking-tight">
                        Walk through our hotel
                    </h1>
                    <p className="mt-1 max-w-2xl text-slate-600">
                        Start at the lobby, step into each room, and visit the
                        training facilities where our HTM students learn the
                        trade.
                    </p>
                </div>
                <Link
                    href={bookingIndex.url()}
                    className={buttonClasses({ className: 'bg-brand-800' })}
                >
                    Book a stay
                </Link>
            </div>
            <VirtualTour startStopId={start} />
        </div>
    );
}
