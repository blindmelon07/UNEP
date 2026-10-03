import { createInertiaApp } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import PublicLayout from '@/layouts/public-layout';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

void createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        if (name.startsWith('admin/')) {
            return AdminLayout;
        }

        if (name.startsWith('public/')) {
            return PublicLayout;
        }

        return null;
    },
    progress: {
        color: '#c79a3d',
    },
});
