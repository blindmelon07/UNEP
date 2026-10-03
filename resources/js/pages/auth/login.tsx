import { Form, Head, Link, usePage } from '@inertiajs/react';
import { BrandCrest } from '@/components/brand-crest';
import { Button } from '@/components/ui/button';
import { Checkbox, Field, Input } from '@/components/ui/form';
import { home } from '@/routes';
import { store } from '@/routes/login';

export default function Login() {
    const { name, hotel } = usePage().props;

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-brand-950 px-4 py-12">
            <Head title="Staff login" />
            <img
                src="/images/facility/lobby-entrance.jpg"
                alt=""
                aria-hidden
                className="absolute inset-0 size-full object-cover opacity-25"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-brand-950/80 to-brand-950" />
            <div className="relative w-full max-w-sm">
                <div className="mb-8 text-center">
                    <BrandCrest className="mx-auto size-24 rounded-2xl shadow-xl shadow-black/40" />
                    <h1 className="mt-4 text-xl font-semibold text-white">
                        {name}
                    </h1>
                    <p className="mt-1 text-sm text-brand-300">
                        {hotel.department}
                    </p>
                    <p className="mt-3 text-sm text-gold-300">
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
