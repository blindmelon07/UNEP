import { Form, Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Checkbox, Field, Input } from '@/components/ui/form';
import { home } from '@/routes';
import { store } from '@/routes/login';

export default function Login() {
    const { name } = usePage().props;

    return (
        <div className="flex min-h-screen items-center justify-center bg-brand-950 px-4 py-12">
            <Head title="Staff login" />
            <div className="w-full max-w-sm">
                <div className="mb-8 text-center">
                    <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-gold-500 text-lg font-bold text-brand-950">
                        H
                    </span>
                    <h1 className="mt-4 text-xl font-semibold text-white">
                        {name}
                    </h1>
                    <p className="mt-1 text-sm text-brand-300">
                        Sign in to the staff portal
                    </p>
                </div>
                <div className="rounded-2xl bg-white p-6 shadow-xl">
                    <Form
                        {...store.form()}
                        resetOnError={['password']}
                        className="flex flex-col gap-4"
                    >
                        {({ errors, processing }) => (
                            <>
                                <Field
                                    label="Email"
                                    htmlFor="email"
                                    error={errors.email}
                                >
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="username"
                                        autoFocus
                                        required
                                        aria-invalid={!!errors.email}
                                    />
                                </Field>
                                <Field
                                    label="Password"
                                    htmlFor="password"
                                    error={errors.password}
                                >
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                    />
                                </Field>
                                <Checkbox
                                    name="remember"
                                    value="1"
                                    label="Keep me signed in"
                                />
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full"
                                >
                                    {processing ? 'Signing in…' : 'Sign in'}
                                </Button>
                            </>
                        )}
                    </Form>
                </div>
                <p className="mt-6 text-center text-sm">
                    <Link
                        href={home.url()}
                        className="text-brand-300 hover:text-white"
                    >
                        ← Back to the hotel website
                    </Link>
                </p>
            </div>
        </div>
    );
}
