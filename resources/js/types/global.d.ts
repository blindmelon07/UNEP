import type { Auth } from '@/types/auth';
import type { Hotel } from '@/types/models';

declare module 'react' {
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            hotel: Hotel;
            [key: string]: unknown;
        };
        flashDataType: {
            success?: string;
            error?: string;
        };
    }
}
