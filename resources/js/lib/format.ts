const currencyFormatter = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
});

const dateFormatter = new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
});

export function formatCurrency(amount: number | string | null | undefined) {
    return currencyFormatter.format(Number(amount ?? 0));
}

/**
 * Format a `Y-m-d` date (parsed as a local calendar date) or an ISO timestamp.
 */
export function formatDate(value: string | null | undefined) {
    if (!value) {
        return '—';
    }

    return dateFormatter.format(parseDate(value));
}

export function formatDateTime(value: string | null | undefined) {
    if (!value) {
        return '—';
    }

    return dateTimeFormatter.format(new Date(value));
}

export function formatTime(value: string) {
    const [hours, minutes] = value.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes);

    return date.toLocaleTimeString('en-PH', {
        hour: 'numeric',
        minute: '2-digit',
    });
}

export function parseDate(value: string) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [year, month, day] = value.split('-').map(Number);

        return new Date(year, month - 1, day);
    }

    return new Date(value);
}

export function toDateInput(date: Date) {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${date.getFullYear()}-${month}-${day}`;
}

export function addDays(value: string, days: number) {
    const date = parseDate(value);
    date.setDate(date.getDate() + days);

    return toDateInput(date);
}

export function nightsBetween(checkIn: string, checkOut: string) {
    const milliseconds =
        parseDate(checkOut).getTime() - parseDate(checkIn).getTime();

    return Math.max(0, Math.round(milliseconds / 86_400_000));
}
