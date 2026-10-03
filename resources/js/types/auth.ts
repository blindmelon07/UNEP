import type { Module, Role } from './models';

export type User = {
    id: number;
    name: string;
    email: string;
    role: Role;
};

export type Auth = {
    user: User | null;
    modules: Module[];
};
