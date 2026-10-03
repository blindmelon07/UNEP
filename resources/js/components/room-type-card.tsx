import type { ReactNode } from 'react';
import { formatCurrency } from '@/lib/format';
import type { RoomType } from '@/types';

const fallbackGradients = [
    'from-brand-700 to-brand-900',
    'from-amber-700 to-brand-900',
    'from-sky-800 to-brand-900',
    'from-stone-600 to-brand-900',
];

export function RoomTypeCard({
    roomType,
    index = 0,
    footer,
}: {
    roomType: RoomType;
    index?: number;
    footer?: ReactNode;
}) {
    return (
        <article className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200">
            {roomType.image_url ? (
                <img
                    src={roomType.image_url}
                    alt={roomType.name}
                    className="aspect-[16/10] w-full object-cover"
                />
            ) : (
                <div
                    className={`flex aspect-[16/10] items-end bg-gradient-to-br p-5 ${fallbackGradients[index % fallbackGradients.length]}`}
                >
                    <span className="text-lg font-semibold text-white/90">
                        {roomType.name}
                    </span>
                </div>
            )}
            <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold text-slate-900">
                        {roomType.name}
                    </h3>
                    <p className="text-right">
                        <span className="text-lg font-semibold text-brand-800">
                            {formatCurrency(roomType.base_rate)}
                        </span>
                        <span className="block text-xs text-slate-500">
                            per night
                        </span>
                    </p>
                </div>
                {roomType.description && (
                    <p className="text-sm text-slate-600">
                        {roomType.description}
                    </p>
                )}
                <p className="text-sm text-slate-500">
                    Sleeps up to {roomType.capacity}
                </p>
                {roomType.amenities && roomType.amenities.length > 0 && (
                    <ul className="flex flex-wrap gap-1.5">
                        {roomType.amenities.map((amenity) => (
                            <li
                                key={amenity}
                                className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs text-stone-700"
                            >
                                {amenity}
                            </li>
                        ))}
                    </ul>
                )}
                {footer && <div className="mt-auto pt-2">{footer}</div>}
            </div>
        </article>
    );
}
