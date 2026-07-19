import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input, Textarea, Select, Button, Divider } from '@/components/ui'
import type { AuditionCycle } from '@/types'

const schema = z.object({
    title: z.string().min(1, 'Title is required'),
    position: z.string().min(1, 'Position/Role is required'),
    description: z.string().optional(),
    requirements: z.string().optional(),
    status: z.enum(['open', 'closed', 'in_review', 'results_out']),
    open_date: z.string().min(1, 'Open date is required'),
    close_date: z.string().min(1, 'Close date is required'),
    max_applicants: z.union([z.number(), z.string(), z.null(), z.undefined()]).transform(val => {
        if (val === '' || val === null || val === undefined) return null
        const num = Number(val)
        return isNaN(num) ? null : num
    }).optional().nullable(),
})

type FormValues = z.infer<typeof schema>

interface AuditionCycleFormProps {
    initialData?: AuditionCycle | null
    onSubmit: (data: FormValues) => Promise<void>
    isLoading?: boolean
}

/**
 * Form for creating or editing an audition cycle.
 */
export function AuditionCycleForm({ initialData, onSubmit, isLoading }: AuditionCycleFormProps) {
    const [questions, setQuestions] = useState<string[]>(() => {
        if (initialData?.requirements) {
            try {
                const parsed = JSON.parse(initialData.requirements)
                if (Array.isArray(parsed)) {
                    return parsed.length > 0 ? parsed : ['']
                }
            } catch (e) {}
            return [initialData.requirements]
        }
        return ['']
    })

    useEffect(() => {
        if (initialData?.requirements) {
            try {
                const parsed = JSON.parse(initialData.requirements)
                if (Array.isArray(parsed)) {
                    setQuestions(parsed.length > 0 ? parsed : [''])
                    return
                }
            } catch (e) {}
            setQuestions([initialData.requirements])
        } else {
            setQuestions([''])
        }
    }, [initialData])

    const { register, handleSubmit, formState: { errors } } = useForm<any>({
        resolver: zodResolver(schema) as any,
        defaultValues: {
            title: initialData?.title || '',
            position: initialData?.position || '',
            description: initialData?.description || '',
            status: initialData?.status || 'open',
            open_date: initialData?.open_date ? initialData.open_date.split('T')[0] : '',
            close_date: initialData?.close_date ? initialData.close_date.split('T')[0] : '',
            max_applicants: initialData?.max_applicants ?? '',
        },
    })

    const onFormSubmit = async (values: any) => {
        const filtered = questions.map(q => q.trim()).filter(Boolean)
        await onSubmit({
            ...values,
            requirements: filtered.length > 0 ? JSON.stringify(filtered) : null,
        })
    }

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            <div className="space-y-4">
                <h4 className="text-label text-dark-200 uppercase tracking-widest">Basic Information</h4>
                <Input
                    label="Cycle Title *"
                    placeholder="Content Team Recruitment 2025"
                    error={errors.title?.message as any}
                    {...register('title')}
                />
                <Input
                    label="Position / Role *"
                    placeholder="Content Writer, Debater, Event Manager..."
                    error={errors.position?.message as any}
                    {...register('position')}
                />
            </div>

            <Divider variant="dashed" />

            {/* Details */}
            <div className="space-y-4">
                <h4 className="text-label text-dark-200 uppercase tracking-widest">Details</h4>
                <Textarea
                    label="Description"
                    placeholder="What is this audition for? What will the selected members do?"
                    className="min-h-[120px]"
                    {...register('description')}
                />
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-label text-dark-200 block">Custom Audition Questions</label>
                        <Button 
                            type="button" 
                            variant="outline" 
                            size="xs" 
                            onClick={() => setQuestions(prev => [...prev, ''])}
                        >
                            + Add Question
                        </Button>
                    </div>
                    {questions.map((q, idx) => (
                        <div key={idx} className="flex gap-2 items-start">
                            <Input
                                placeholder={`Question ${idx + 1} (e.g. Why do you want to join?)`}
                                value={q}
                                onChange={(e) => {
                                    const updated = [...questions]
                                    updated[idx] = e.target.value
                                    setQuestions(updated)
                                }}
                                fullWidth
                            />
                            {questions.length > 1 && (
                                <Button 
                                    type="button" 
                                    variant="danger" 
                                    size="sm" 
                                    onClick={() => setQuestions(prev => prev.filter((_, i) => i !== idx))}
                                    className="mt-1"
                                >
                                    Remove
                                </Button>
                            )}
                        </div>
                    ))}
                    <p className="text-caption text-dark-400">These questions will be displayed to applicants as separate input fields instead of the default 'Relevant Experience' prompt.</p>
                </div>
            </div>

            <Divider variant="dashed" />

            {/* Schedule */}
            <div className="space-y-4">
                <h4 className="text-label text-dark-200 uppercase tracking-widest">Schedule</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Open Date *"
                        type="date"
                        error={errors.open_date?.message as any}
                        {...register('open_date')}
                    />
                    <Input
                        label="Close Date *"
                        type="date"
                        error={errors.close_date?.message as any}
                        {...register('close_date')}
                    />
                </div>
                <Input
                    label="Max Applicants"
                    type="number"
                    placeholder="Leave empty for unlimited"
                    {...register('max_applicants')}
                />
            </div>

            <Divider variant="dashed" />

            {/* Status */}
            <div className="space-y-4">
                <h4 className="text-label text-dark-200 uppercase tracking-widest">Status</h4>
                <Select
                    label="Current Status"
                    options={[
                        { label: 'Open — Accepting Applications', value: 'open' },
                        { label: 'Closed — No Longer Accepting', value: 'closed' },
                        { label: 'Under Review — Evaluating Applications', value: 'in_review' },
                        { label: 'Results Out — Decisions Published', value: 'results_out' },
                    ]}
                    {...register('status')}
                />
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-4 border-t border-dark-800">
                <Button type="button" variant="outline" onClick={() => window.history.back()}>
                    Cancel
                </Button>
                <Button type="submit" variant="primary" size="lg" isLoading={isLoading}>
                    {initialData ? 'Update Cycle' : 'Create Cycle'}
                </Button>
            </div>
        </form>
    )
}