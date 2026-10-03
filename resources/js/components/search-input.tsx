import { router } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { Input } from '@/components/ui/form';

type SearchInputProps = {
    url: string;
    value: string | undefined;
    filters: Record<string, unknown>;
    placeholder: string;
};

/**
 * A debounced search box that reloads the current listing with a `search` query parameter.
 */
export function SearchInput({
    url,
    value,
    filters,
    placeholder,
}: SearchInputProps) {
    const [search, setSearch] = useState(value ?? '');
    const timeout = useRef<number | undefined>(undefined);

    return (
        <Input
            type="search"
            aria-label="Search"
            className="w-full sm:w-72"
            placeholder={placeholder}
            value={search}
            onChange={(event) => {
                const next = event.target.value;
                setSearch(next);
                window.clearTimeout(timeout.current);
                timeout.current = window.setTimeout(() => {
                    router.get(
                        url,
                        { ...filters, search: next || undefined },
                        { preserveState: true, replace: true },
                    );
                }, 300);
            }}
        />
    );
}
