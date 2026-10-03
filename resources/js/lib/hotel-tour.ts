/**
 * The virtual tour of the UNEP training hotel.
 *
 * Each stop is shown from a regular photo wrapped onto part of a sphere so guests can look around it.
 * When a real 360° photo is available, save it (2:1 equirectangular) in public/images/tour/360/
 * and set `panorama360` on the stop. Positions for links and hotspots then use `yaw`/`pitch`
 * in degrees instead of photo coordinates.
 */

/** Horizontal angle (in degrees) a regular photo is stretched across when shown in the viewer. */
export const PHOTO_FIELD_OF_VIEW = 80;

/** A spot in a regular photo, as fractions of its width (x) and height (y) from the top-left corner. */
export type PhotoSpot = { x: number; y: number };

/** A spot in a 360° photo, in degrees from the centre of the image. */
export type SphereSpot = { yaw: number; pitch: number };

export type TourLink = {
    to: string;
    label: string;
    at: PhotoSpot | SphereSpot;
};

export type TourHotspot = {
    label: string;
    at: PhotoSpot | SphereSpot;
};

export type TourGroup = 'Hotel' | 'Rooms' | 'Training facilities';

export type TourStop = {
    id: string;
    name: string;
    group: TourGroup;
    caption: string;
    photo: string;
    panorama360?: string;
    links: TourLink[];
    hotspots: TourHotspot[];
};

const back = (to: string, label: string, x = 0.2): TourLink => ({
    to,
    label,
    at: { x, y: 0.66 },
});

export const tourStops: TourStop[] = [
    {
        id: 'lobby-entrance',
        name: 'Lobby entrance',
        group: 'Hotel',
        caption: 'Step through the wooden arches into our lobby.',
        photo: '/images/tour/lobby-entrance.jpg',
        links: [
            {
                to: 'lobby',
                label: 'Walk into the lobby',
                at: { x: 0.5, y: 0.62 },
            },
            {
                to: 'deluxe-entrance',
                label: 'Deluxe Room',
                at: { x: 0.69, y: 0.47 },
            },
        ],
        hotspots: [
            { label: 'Front desk', at: { x: 0.33, y: 0.56 } },
            { label: 'Lounge seating', at: { x: 0.58, y: 0.57 } },
        ],
    },
    {
        id: 'lobby',
        name: 'Lobby & front desk',
        group: 'Hotel',
        caption: 'Check-in, world clocks and a comfortable waiting area.',
        photo: '/images/tour/lobby.jpg',
        links: [
            {
                to: 'economy-entrance',
                label: 'Economy Room',
                at: { x: 0.15, y: 0.5 },
            },
            back('lobby-entrance', 'Back to the entrance'),
            {
                to: 'standard-room',
                label: 'Standard Room',
                at: { x: 0.5, y: 0.66 },
            },
            {
                to: 'guest-lounge',
                label: 'Guest lounge',
                at: { x: 0.84, y: 0.66 },
            },
        ],
        hotspots: [
            { label: 'Front desk', at: { x: 0.9, y: 0.66 } },
            { label: 'World time-zone clocks', at: { x: 0.29, y: 0.51 } },
            { label: 'Waiting area', at: { x: 0.6, y: 0.6 } },
        ],
    },
    {
        id: 'guest-lounge',
        name: 'Guest lounge',
        group: 'Hotel',
        caption: 'A quiet living area with a sectional sofa and TV.',
        photo: '/images/tour/guest-lounge.jpg',
        links: [back('lobby', 'Back to the lobby')],
        hotspots: [
            { label: 'Sectional sofa', at: { x: 0.5, y: 0.57 } },
            { label: 'Smart TV', at: { x: 0.88, y: 0.53 } },
        ],
    },
    {
        id: 'deluxe-entrance',
        name: 'Deluxe Room — doorway',
        group: 'Rooms',
        caption: 'The Deluxe Room opens straight off the lobby.',
        photo: '/images/tour/deluxe-entrance.jpg',
        links: [
            {
                to: 'deluxe-room',
                label: 'Enter the Deluxe Room',
                at: { x: 0.5, y: 0.5 },
            },
            back('lobby-entrance', 'Back to the lobby'),
        ],
        hotspots: [{ label: 'Sofa lounge', at: { x: 0.45, y: 0.58 } }],
    },
    {
        id: 'deluxe-room',
        name: 'Deluxe Room',
        group: 'Rooms',
        caption: 'Queen bed, dining table, smart TV and en-suite shower.',
        photo: '/images/tour/deluxe-room.jpg',
        links: [back('deluxe-entrance', 'Back to the doorway', 0.5)],
        hotspots: [
            { label: 'Queen bed', at: { x: 0.7, y: 0.7 } },
            { label: 'Dining table for two', at: { x: 0.25, y: 0.68 } },
            { label: 'Smart TV', at: { x: 0.06, y: 0.66 } },
            { label: 'En-suite shower', at: { x: 0.44, y: 0.57 } },
            { label: 'Vanity table', at: { x: 0.56, y: 0.58 } },
            { label: 'Split-type air conditioning', at: { x: 0.69, y: 0.49 } },
        ],
    },
    {
        id: 'standard-room',
        name: 'Standard Room',
        group: 'Rooms',
        caption: 'A neat double room with blackout curtains.',
        photo: '/images/tour/standard-room.jpg',
        links: [back('lobby', 'Back to the lobby', 0.5)],
        hotspots: [
            { label: 'Double bed', at: { x: 0.43, y: 0.72 } },
            { label: 'Dresser', at: { x: 0.9, y: 0.66 } },
            { label: 'Mirror', at: { x: 0.7, y: 0.53 } },
            { label: 'Blackout curtains', at: { x: 0.28, y: 0.5 } },
        ],
    },
    {
        id: 'economy-entrance',
        name: 'Economy Room — doorway',
        group: 'Rooms',
        caption: 'Just across the lobby from the front desk.',
        photo: '/images/tour/economy-entrance.jpg',
        links: [
            {
                to: 'economy-room',
                label: 'Enter the Economy Room',
                at: { x: 0.52, y: 0.6 },
            },
            back('lobby', 'Back to the lobby'),
        ],
        hotspots: [],
    },
    {
        id: 'economy-room',
        name: 'Economy Room',
        group: 'Rooms',
        caption:
            'A double and a single bed — perfect for friends or a small family.',
        photo: '/images/tour/economy-room.jpg',
        links: [back('economy-entrance', 'Back to the doorway', 0.5)],
        hotspots: [
            { label: 'Double bed', at: { x: 0.62, y: 0.69 } },
            { label: 'Single bed', at: { x: 0.38, y: 0.62 } },
            { label: 'Window-type air conditioning', at: { x: 0.48, y: 0.5 } },
            { label: 'Bedside lamp', at: { x: 0.6, y: 0.5 } },
        ],
    },
    {
        id: 'hostel',
        name: 'Hostel wing',
        group: 'Rooms',
        caption:
            'Budget rooms for student groups, teams and seminar participants.',
        photo: '/images/tour/hostel.jpg',
        links: [back('lobby', 'Back to the lobby', 0.5)],
        hotspots: [{ label: 'Hostel room', at: { x: 0.27, y: 0.52 } }],
    },
    {
        id: 'bar-supplies',
        name: 'Bar & F&B laboratory',
        group: 'Training facilities',
        caption:
            'Glassware, tableware and bar tools for food & beverage service training.',
        photo: '/images/tour/bar-supplies.jpg',
        links: [
            back('travel-desk', 'DHTM Travel desk'),
            {
                to: 'resource-room',
                label: 'Resource room',
                at: { x: 0.84, y: 0.66 },
            },
        ],
        hotspots: [
            { label: 'Glassware cabinet', at: { x: 0.65, y: 0.53 } },
            { label: 'Service counter', at: { x: 0.3, y: 0.68 } },
            { label: 'Plates & tableware', at: { x: 0.75, y: 0.75 } },
        ],
    },
    {
        id: 'travel-desk',
        name: 'DHTM Travel desk',
        group: 'Training facilities',
        caption: 'Hands-on ticketing and tour operations practice.',
        photo: '/images/tour/travel-desk.jpg',
        links: [
            back('bar-supplies', 'Bar & F&B laboratory'),
            {
                to: 'resource-room',
                label: 'Resource room',
                at: { x: 0.84, y: 0.66 },
            },
        ],
        hotspots: [
            { label: 'World time-zone clocks', at: { x: 0.73, y: 0.43 } },
            { label: 'Booking workstations', at: { x: 0.37, y: 0.53 } },
        ],
    },
    {
        id: 'resource-room',
        name: 'Resource room',
        group: 'Training facilities',
        caption: 'References, portfolios and study space for HTM students.',
        photo: '/images/tour/resource-room.jpg',
        links: [
            back('bar-supplies', 'Bar & F&B laboratory'),
            {
                to: 'travel-desk',
                label: 'DHTM Travel desk',
                at: { x: 0.84, y: 0.66 },
            },
        ],
        hotspots: [
            { label: 'HTM references & portfolios', at: { x: 0.72, y: 0.53 } },
            { label: 'Study tables', at: { x: 0.72, y: 0.75 } },
        ],
    },
];

/** The tour stop that best shows each room type, keyed by room type slug. */
export const roomTypeTourStops: Record<string, string> = {
    'deluxe-room': 'deluxe-entrance',
    'standard-room': 'standard-room',
    'economy-room': 'economy-entrance',
    'hostel-room': 'hostel',
};

export function findTourStop(id: string | null | undefined): TourStop {
    return tourStops.find((stop) => stop.id === id) ?? tourStops[0];
}

/**
 * Convert a spot to a viewer position. Photo spots assume the photo spans PHOTO_FIELD_OF_VIEW degrees
 * horizontally, with the same angle per pixel vertically.
 */
export function toViewerPosition(
    at: PhotoSpot | SphereSpot,
    photoAspect = 2048 / 1536,
): { yaw: string; pitch: string } {
    if ('yaw' in at) {
        return { yaw: `${at.yaw}deg`, pitch: `${at.pitch}deg` };
    }

    return {
        yaw: `${(at.x - 0.5) * PHOTO_FIELD_OF_VIEW}deg`,
        pitch: `${(0.5 - at.y) * PHOTO_FIELD_OF_VIEW * photoAspect}deg`,
    };
}
