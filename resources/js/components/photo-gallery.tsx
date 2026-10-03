import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export type Photo = {
    src: string;
    title: string;
    caption?: string;
};

/**
 * A responsive photo grid; clicking a photo opens it full-screen with keyboard navigation.
 */
export function PhotoGallery({
    photos,
    className,
}: {
    photos: Photo[];
    className?: string;
}) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const openPhoto = openIndex === null ? null : photos[openIndex];

    useEffect(() => {
        if (openIndex === null) {
            return;
        }

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpenIndex(null);
            } else if (event.key === 'ArrowRight') {
                setOpenIndex((openIndex + 1) % photos.length);
            } else if (event.key === 'ArrowLeft') {
                setOpenIndex((openIndex - 1 + photos.length) % photos.length);
            }
        };

        window.addEventListener('keydown', onKeyDown);

        return () => window.removeEventListener('keydown', onKeyDown);
    }, [openIndex, photos.length]);

    return (
        <>
            <div
                className={cn(
                    'grid gap-4 sm:grid-cols-2 lg:grid-cols-3',
                    className,
                )}
            >
                {photos.map((photo, index) => (
                    <button
                        key={photo.src}
                        type="button"
                        onClick={() => setOpenIndex(index)}
                        className="group relative cursor-zoom-in overflow-hidden rounded-2xl bg-stone-200 text-left shadow-sm ring-1 ring-stone-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                    >
                        <img
                            src={photo.src}
                            alt={photo.title}
                            loading="lazy"
                            className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-4 pt-10 text-white">
                            <span className="block font-semibold">
                                {photo.title}
                            </span>
                            {photo.caption && (
                                <span className="mt-0.5 block text-sm text-white/80">
                                    {photo.caption}
                                </span>
                            )}
                        </span>
                    </button>
                ))}
            </div>

            {openPhoto && openIndex !== null && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label={openPhoto.title}
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4"
                    onClick={() => setOpenIndex(null)}
                >
                    <img
                        src={openPhoto.src}
                        alt={openPhoto.title}
                        className="max-h-[80vh] max-w-full rounded-lg object-contain shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    />
                    <div className="mt-4 text-center text-white">
                        <p className="font-semibold">{openPhoto.title}</p>
                        {openPhoto.caption && (
                            <p className="text-sm text-white/70">
                                {openPhoto.caption}
                            </p>
                        )}
                        <p className="mt-1 text-xs text-white/50">
                            {openIndex + 1} / {photos.length} · Use ← → to
                            browse, Esc to close
                        </p>
                    </div>
                    <button
                        type="button"
                        aria-label="Close"
                        className="absolute top-4 right-4 cursor-pointer rounded-full bg-white/10 px-3 py-1.5 text-xl text-white hover:bg-white/20"
                        onClick={() => setOpenIndex(null)}
                    >
                        ×
                    </button>
                    <button
                        type="button"
                        aria-label="Previous photo"
                        className="absolute top-1/2 left-3 -translate-y-1/2 cursor-pointer rounded-full bg-white/10 px-3 py-2 text-2xl text-white hover:bg-white/20"
                        onClick={(event) => {
                            event.stopPropagation();
                            setOpenIndex(
                                (openIndex - 1 + photos.length) % photos.length,
                            );
                        }}
                    >
                        ‹
                    </button>
                    <button
                        type="button"
                        aria-label="Next photo"
                        className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer rounded-full bg-white/10 px-3 py-2 text-2xl text-white hover:bg-white/20"
                        onClick={(event) => {
                            event.stopPropagation();
                            setOpenIndex((openIndex + 1) % photos.length);
                        }}
                    >
                        ›
                    </button>
                </div>
            )}
        </>
    );
}
