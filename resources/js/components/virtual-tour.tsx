import '@photo-sphere-viewer/core/index.css';
import '@photo-sphere-viewer/markers-plugin/index.css';
import '@photo-sphere-viewer/virtual-tour-plugin/index.css';
import type { PanoDataProvider, Viewer } from '@photo-sphere-viewer/core';
import type {
    VirtualTourLink,
    VirtualTourNode,
    VirtualTourPlugin,
} from '@photo-sphere-viewer/virtual-tour-plugin';
import { useEffect, useRef, useState } from 'react';
import type { TourGroup, TourStop } from '@/lib/hotel-tour';
import {
    PHOTO_FIELD_OF_VIEW,
    findTourStop,
    toViewerPosition,
    tourStops,
} from '@/lib/hotel-tour';
import { cn } from '@/lib/utils';

const groups: TourGroup[] = ['Hotel', 'Rooms', 'Training facilities'];

/**
 * Place a regular photo on the middle of a sphere so it can be looked around like a partial panorama.
 */
const photoPanoData: PanoDataProvider = (image) => {
    const fullWidth =
        Math.round((image.width * 360) / PHOTO_FIELD_OF_VIEW / 2) * 2;
    const fullHeight = fullWidth / 2;

    return {
        isEquirectangular: true,
        fullWidth,
        fullHeight,
        croppedWidth: image.width,
        croppedHeight: image.height,
        croppedX: Math.round((fullWidth - image.width) / 2),
        croppedY: Math.round((fullHeight - image.height) / 2),
    };
};

function toNode(stop: TourStop): VirtualTourNode {
    return {
        id: stop.id,
        name: stop.name,
        caption: `${stop.name} — ${stop.caption}`,
        panorama: stop.panorama360 ?? stop.photo,
        panoData: stop.panorama360 ? undefined : photoPanoData,
        links: stop.links.map((link) => ({
            nodeId: link.to,
            position: toViewerPosition(link.at),
            data: { label: link.label },
        })),
        markers: stop.hotspots.map((hotspot, index) => ({
            id: `${stop.id}-hotspot-${index}`,
            position: toViewerPosition(hotspot.at),
            html: '<span class="tour-hotspot" aria-hidden="true"></span>',
            size: { width: 26, height: 26 },
            anchor: 'center center',
            tooltip: { content: hotspot.label, position: 'top center' },
        })),
    };
}

function linkElement(link: VirtualTourLink): HTMLElement {
    const wrapper = document.createElement('span');
    wrapper.className = 'tour-link-wrapper';

    const pill = document.createElement('span');
    pill.className = 'tour-link';
    pill.textContent =
        (link.data as { label?: string } | undefined)?.label ?? 'Go';
    wrapper.append(pill);

    return wrapper;
}

/**
 * A walk-through of the hotel: drag to look around, click the labelled doors to move between rooms.
 */
export function VirtualTour({ startStopId }: { startStopId?: string | null }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const tourRef = useRef<VirtualTourPlugin | null>(null);
    const [currentStop, setCurrentStop] = useState(() =>
        findTourStop(startStopId),
    );
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let viewer: Viewer | null = null;
        let resizeObserver: ResizeObserver | null = null;
        let isCancelled = false;

        void (async () => {
            const [core, markers, tour, visibleRange] = await Promise.all([
                import('@photo-sphere-viewer/core'),
                import('@photo-sphere-viewer/markers-plugin'),
                import('@photo-sphere-viewer/virtual-tour-plugin'),
                import('@photo-sphere-viewer/visible-range-plugin'),
            ]);

            if (isCancelled || !containerRef.current) {
                return;
            }

            viewer = new core.Viewer({
                container: containerRef.current,
                maxFov: 50,
                minFov: 25,
                defaultZoomLvl: 0,
                defaultPitch: '-8deg',
                canvasBackground: '#072316',
                loadingTxt: 'Walking you over…',
                navbar: ['zoom', 'move', 'caption', 'fullscreen'],
                mousewheelCtrlKey: true,
                touchmoveTwoFingers: false,
                plugins: [
                    markers.MarkersPlugin,
                    [visibleRange.VisibleRangePlugin, { usePanoData: true }],
                    [
                        tour.VirtualTourPlugin,
                        {
                            renderMode: '2d',
                            nodes: tourStops.map(toNode),
                            startNodeId: findTourStop(startStopId).id,
                            preload: true,
                            arrowStyle: {
                                element: linkElement,
                                size: { width: 220, height: 44 },
                            },
                            transitionOptions: {
                                showLoader: false,
                                rotation: true,
                                effect: 'fade',
                                speed: 1500,
                            },
                        },
                    ],
                ],
            });

            const tourPlugin = viewer.getPlugin<VirtualTourPlugin>(
                tour.VirtualTourPlugin,
            );
            tourRef.current = tourPlugin;

            tourPlugin.addEventListener('node-changed', ({ node }) => {
                setCurrentStop(findTourStop(node.id));
                setIsLoading(false);
            });

            // Keep the canvas matched to its box when the layout or styles settle after start-up.
            resizeObserver = new ResizeObserver(() => viewer?.autoSize());
            resizeObserver.observe(containerRef.current);
        })();

        return () => {
            isCancelled = true;
            tourRef.current = null;
            resizeObserver?.disconnect();
            viewer?.destroy();
        };
        // The viewer is created once; later stop changes go through the plugin.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const goTo = (stopId: string) => {
        void tourRef.current?.setCurrentNode(stopId, {
            rotation: false,
            effect: 'fade',
            speed: 1200,
        });
    };

    return (
        <div className="grid gap-6 lg:grid-cols-[1fr_17rem]">
            <div>
                <div className="hotel-tour relative overflow-hidden rounded-2xl bg-brand-950 shadow-xl ring-1 ring-brand-900/20">
                    <div
                        ref={containerRef}
                        className="h-[65vh] min-h-[420px] w-full"
                    />
                    {isLoading && (
                        <div className="pointer-events-none absolute inset-0 flex animate-pulse items-center justify-center text-sm text-brand-200">
                            Loading the tour…
                        </div>
                    )}
                </div>
                <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            {currentStop.name}
                        </h2>
                        <p className="text-sm text-slate-600">
                            {currentStop.caption}
                        </p>
                    </div>
                    <p className="max-w-xs text-xs text-slate-500">
                        Drag to look around · click a labelled door to walk
                        through · tap the gold dots for details.
                    </p>
                </div>
            </div>

            <nav aria-label="Tour stops" className="flex flex-col gap-5">
                {groups.map((group) => (
                    <div key={group}>
                        <p className="mb-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                            {group}
                        </p>
                        <ul className="flex flex-col gap-1">
                            {tourStops
                                .filter((stop) => stop.group === group)
                                .map((stop) => (
                                    <li key={stop.id}>
                                        <button
                                            type="button"
                                            onClick={() => goTo(stop.id)}
                                            aria-current={
                                                stop.id === currentStop.id
                                                    ? 'location'
                                                    : undefined
                                            }
                                            className={cn(
                                                'flex w-full cursor-pointer items-center gap-3 rounded-xl p-1.5 pr-3 text-left text-sm transition-colors',
                                                stop.id === currentStop.id
                                                    ? 'bg-brand-800 text-white'
                                                    : 'text-slate-700 hover:bg-stone-200/70',
                                            )}
                                        >
                                            <img
                                                src={stop.photo}
                                                alt=""
                                                loading="lazy"
                                                className="size-10 shrink-0 rounded-lg object-cover"
                                            />
                                            <span className="font-medium">
                                                {stop.name}
                                            </span>
                                        </button>
                                    </li>
                                ))}
                        </ul>
                    </div>
                ))}
            </nav>
        </div>
    );
}
