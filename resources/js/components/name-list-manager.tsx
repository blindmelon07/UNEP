import { Form } from '@inertiajs/react';
import { useState } from 'react';
import { DeleteButton } from '@/components/delete-button';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, InputError } from '@/components/ui/form';
import type { RouteFormDefinition } from '@/wayfinder';

type NamedRecord = { id: number; name: string; count?: number };

type NameListManagerProps = {
    records: NamedRecord[];
    countLabel: string;
    placeholder: string;
    storeForm: RouteFormDefinition<'post'>;
    updateForm: (id: number) => RouteFormDefinition<'post'>;
    destroyUrl: (id: number) => string;
};

/**
 * Inline create / rename / delete for simple name-only lookups such as categories and departments.
 */
export function NameListManager({
    records,
    countLabel,
    placeholder,
    storeForm,
    updateForm,
    destroyUrl,
}: NameListManagerProps) {
    const [editingId, setEditingId] = useState<number | null>(null);

    return (
        <Card className="max-w-2xl">
            <Form
                {...storeForm}
                resetOnSuccess
                options={{ preserveScroll: true }}
                className="flex gap-2 border-b border-slate-200 p-4"
            >
                {({ errors, processing }) => (
                    <div className="flex-1">
                        <div className="flex gap-2">
                            <Input
                                name="name"
                                placeholder={placeholder}
                                aria-label={placeholder}
                                required
                            />
                            <Button type="submit" disabled={processing}>
                                Add
                            </Button>
                        </div>
                        <InputError message={errors.name} />
                    </div>
                )}
            </Form>
            <ul className="divide-y divide-slate-100">
                {records.length === 0 && (
                    <li className="px-5 py-8 text-center text-sm text-slate-500">
                        Nothing here yet.
                    </li>
                )}
                {records.map((record) =>
                    editingId === record.id ? (
                        <li key={record.id} className="p-4">
                            <Form
                                {...updateForm(record.id)}
                                options={{ preserveScroll: true }}
                                onSuccess={() => setEditingId(null)}
                                className="flex flex-col gap-1"
                            >
                                {({ errors, processing }) => (
                                    <>
                                        <div className="flex gap-2">
                                            <Input
                                                name="name"
                                                defaultValue={record.name}
                                                aria-label="Name"
                                                autoFocus
                                                required
                                            />
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                            >
                                                Save
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                onClick={() =>
                                                    setEditingId(null)
                                                }
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                        <InputError message={errors.name} />
                                    </>
                                )}
                            </Form>
                        </li>
                    ) : (
                        <li
                            key={record.id}
                            className="flex items-center justify-between gap-3 px-5 py-3"
                        >
                            <div>
                                <p className="font-medium text-slate-900">
                                    {record.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {record.count ?? 0} {countLabel}
                                </p>
                            </div>
                            <div className="flex gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingId(record.id)}
                                >
                                    Rename
                                </Button>
                                <DeleteButton
                                    href={destroyUrl(record.id)}
                                    confirmMessage={`Delete ${record.name}?`}
                                />
                            </div>
                        </li>
                    ),
                )}
            </ul>
        </Card>
    );
}
