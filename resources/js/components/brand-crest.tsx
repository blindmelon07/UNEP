import { cn } from '@/lib/utils';

/**
 * The UNEP Hospitality & Tourism Management crest, cropped for small badges.
 */
export function BrandCrest({ className }: { className?: string }) {
    return (
        <img
            src="/images/unep-htm-crest.jpg"
            alt="UNEP Department of Hospitality & Tourism Management crest"
            className={cn(
                'shrink-0 rounded-lg object-cover ring-1 ring-gold-500/60',
                className,
            )}
        />
    );
}
