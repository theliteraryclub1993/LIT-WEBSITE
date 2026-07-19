import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input, Textarea, Select, Switch, Button, Divider } from '@/components/ui'
import { CustomFieldBuilder } from './CustomFieldBuilder'
import { uploadFile } from '@/lib/supabase'
import { STORAGE_BUCKETS, ALLOWED_IMAGE_TYPES } from '@/utils/constants'
import type { Event, EventCustomField } from '@/types'
import { Loader2, Upload, X } from 'lucide-react'

const eventSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format'),
    description: z.string().optional(),
    short_description: z.string().max(200, 'Max 200 characters').optional(),
    cover_image: z.string().optional(),
    venue: z.string().optional(),
    date: z.string().optional(),
    end_date: z.string().optional(),
    time: z.string().optional(),
    max_participants: z.union([z.number(), z.string(), z.null(), z.undefined()]).transform(val => {
        if (val === '' || val === null || val === undefined) return null
        const num = Number(val)
        return isNaN(num) ? null : num
    }).optional().nullable(),
    registration_fee: z.coerce.number().min(0),
    status: z.enum(['draft', 'published', 'ongoing', 'completed', 'cancelled']),
    is_featured: z.boolean(),
    rulebook_pdf: z.string().optional().nullable(),
    brochure_pdf: z.string().optional().nullable(),
})

type EventFormValues = z.infer<typeof eventSchema>

interface EventFormProps {
    initialData?: Event | null
    onSubmit: (data: EventFormValues & { custom_fields: EventCustomField[] }) => Promise<void>
    isLoading?: boolean
}

/**
 * Complete event creation/editing form.
 * Handles base fields, image upload, and delegates to CustomFieldBuilder.
 */
export function EventForm({ initialData, onSubmit, isLoading }: EventFormProps) {
    const [customFields, setCustomFields] = useState<EventCustomField[]>(
        initialData?.custom_fields || []
    )
    const [isUploading, setIsUploading] = useState(false)

    const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<any>({
        resolver: zodResolver(eventSchema) as any,
        defaultValues: {
            title: initialData?.title || '',
            slug: initialData?.slug || '',
            description: initialData?.description || '',
            short_description: initialData?.short_description || '',
            cover_image: initialData?.cover_image || '',
            venue: initialData?.venue || '',
            date: initialData?.date ? initialData.date.split('T')[0] : '',
            end_date: initialData?.end_date ? initialData.end_date.split('T')[0] : '',
            time: initialData?.time || '',
            max_participants: initialData?.max_participants ?? '',
            registration_fee: initialData?.registration_fee ?? 0,
            status: initialData?.status || 'draft',
            is_featured: initialData?.is_featured ?? false,
            rulebook_pdf: initialData?.rulebook_pdf || '',
            brochure_pdf: initialData?.brochure_pdf || '',
        },
    })

    // Auto-generate slug from title
    const titleValue = watch('title')
    const slugValue = watch('slug')

    useEffect(() => {
        if (!initialData && titleValue && !slugValue) {
            const generated = titleValue
                .toLowerCase()
                .replace(/[^a-z0-9\s]/g, '')
                .replace(/\s+/g, '-')
                .trim()
            setValue('slug', generated)
        }
    }, [titleValue, initialData, slugValue, setValue])

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!ALLOWED_IMAGE_TYPES.includes(file.type as typeof ALLOWED_IMAGE_TYPES[number])) {
            alert('Invalid file type. Use JPG, PNG, WebP, or GIF.')
            return
        }

        setIsUploading(true)
        const path = `${Date.now()}_${file.name}`
        const url = await uploadFile(STORAGE_BUCKETS.EVENT_IMAGES, path, file, { upsert: true })

        if (url) {
            setValue('cover_image', url)
        } else {
            alert('Failed to upload image.')
        }
        setIsUploading(false)
    }

    const [isUploadingDoc, setIsUploadingDoc] = useState<'rulebook' | 'brochure' | null>(null)

    const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'rulebook_pdf' | 'brochure_pdf') => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploadingDoc(fieldName === 'rulebook_pdf' ? 'rulebook' : 'brochure')
        const path = `events/${fieldName}/${Date.now()}_${file.name}`
        const url = await uploadFile(STORAGE_BUCKETS.DOCUMENTS, path, file, { upsert: true })

        if (url) {
            setValue(fieldName, url)
        } else {
            alert('Failed to upload document.')
        }
        setIsUploadingDoc(null)
    }

    const handleFormSubmit = async (data: EventFormValues) => {
        await onSubmit({
            ...data,
            custom_fields: customFields,
        } as any)
    }

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
                <h4 className="text-label text-dark-200 uppercase tracking-widest">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <Input label="Event Title *" placeholder="LitFest 2024" error={errors.title?.message as any} {...register('title')} />
                    </div>
                    <Input label="URL Slug *" placeholder="litfest-2024" error={errors.slug?.message as any} {...register('slug')} />
                </div>
                <Input
                    label="Short Description"
                    placeholder="A brief one-liner for event cards (max 200 chars)"
                    error={errors.short_description?.message as any}
                    {...register('short_description')}
                />
            </div>

            <Divider variant="dashed" />

            {/* Cover Image */}
            <div className="space-y-4">
                <h4 className="text-label text-dark-200 uppercase tracking-widest">Cover Image</h4>
                <Controller
                    name="cover_image"
                    control={control}
                    render={({ field }) => (
                        <div>
                            {field.value ? (
                                <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-dark-700 bg-dark-800">
                                    <img src={field.value} alt="Cover" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => field.onChange('')}
                                        className="absolute top-2 right-2 p-1.5 rounded-md bg-black/60 text-white hover:bg-black/80 transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full h-40 rounded-lg border-2 border-dashed border-dark-700 hover:border-dark-500 cursor-pointer transition-colors bg-dark-950">
                                    {isUploading ? <Loader2 className="animate-spin text-orange-primary mb-2" size={24} /> : <Upload size={24} className="text-dark-500 mb-2" />}
                                    <span className="text-body-sm text-dark-400">
                                        {isUploading ? 'Uploading...' : 'Click to upload cover image'}
                                    </span>
                                    <span className="text-caption text-dark-600">JPG, PNG, WebP (Max 5MB)</span>
                                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                </label>
                            )}
                            <input type="hidden" {...field} />
                        </div>
                    )}
                />
            </div>

            <Divider variant="dashed" />

            {/* Date, Time, Location */}
            <div className="space-y-4">
                <h4 className="text-label text-dark-200 uppercase tracking-widest">When & Where</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Start Date" type="date" {...register('date')} />
                    <Input label="End Date" type="date" {...register('end_date')} />
                    <Input label="Time" type="time" {...register('time')} />
                    <Input label="Venue" placeholder="Main Auditorium" {...register('venue')} />
                </div>
            </div>

            <Divider variant="dashed" />

            {/* Registration Settings */}
            <div className="space-y-4">
                <h4 className="text-label text-dark-200 uppercase tracking-widest">Registration & Documents</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Max Participants"
                        type="number"
                        placeholder="Leave empty for unlimited"
                        {...register('max_participants')}
                    />
                    <Input
                        label="Registration Fee (₹)"
                        type="number"
                        step="0.01"
                        placeholder="0 for free"
                        {...register('registration_fee')}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    {/* Rulebook PDF Upload */}
                    <div className="flex flex-col space-y-2">
                        <label className="block text-body-sm font-medium text-dark-200">Rulebook PDF</label>
                        {watch('rulebook_pdf') ? (
                            <div className="flex items-center justify-between p-3 rounded-lg border border-dark-700 bg-dark-900">
                                <span className="text-body-sm text-dark-300 truncate max-w-[200px]">{watch('rulebook_pdf')}</span>
                                <button type="button" onClick={() => setValue('rulebook_pdf', '')} className="text-dark-500 hover:text-red-500">
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <label className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dark-700 text-body-sm text-dark-300 hover:text-white hover:border-dark-500 hover:bg-dark-800 transition-all cursor-pointer">
                                <Upload size={16} />
                                {isUploadingDoc === 'rulebook' ? 'Uploading...' : 'Upload Rulebook PDF'}
                                <input type="file" accept="application/pdf" onChange={(e) => handlePdfUpload(e, 'rulebook_pdf')} className="hidden" />
                            </label>
                        )}
                    </div>

                    {/* Brochure PDF Upload */}
                    <div className="flex flex-col space-y-2">
                        <label className="block text-body-sm font-medium text-dark-200">Brochure PDF</label>
                        {watch('brochure_pdf') ? (
                            <div className="flex items-center justify-between p-3 rounded-lg border border-dark-700 bg-dark-900">
                                <span className="text-body-sm text-dark-300 truncate max-w-[200px]">{watch('brochure_pdf')}</span>
                                <button type="button" onClick={() => setValue('brochure_pdf', '')} className="text-dark-500 hover:text-red-500">
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <label className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dark-700 text-body-sm text-dark-300 hover:text-white hover:border-dark-500 hover:bg-dark-800 transition-all cursor-pointer">
                                <Upload size={16} />
                                {isUploadingDoc === 'brochure' ? 'Uploading...' : 'Upload Brochure PDF'}
                                <input type="file" accept="application/pdf" onChange={(e) => handlePdfUpload(e, 'brochure_pdf')} className="hidden" />
                            </label>
                        )}
                    </div>
                </div>
            </div>

            <Divider variant="dashed" />

            {/* Content */}
            <div className="space-y-4">
                <h4 className="text-label text-dark-200 uppercase tracking-widest">Content</h4>
                <Textarea
                    label="Full Description (HTML)"
                    placeholder="<p>Event details here...</p>"
                    className="min-h-[200px]"
                    {...register('description')}
                />
            </div>

            <Divider variant="dashed" />

            {/* Custom Fields */}
            <CustomFieldBuilder fields={customFields} onChange={setCustomFields} />

            <Divider variant="dashed" />

            {/* Publishing */}
            <div className="space-y-4">
                <h4 className="text-label text-dark-200 uppercase tracking-widest">Publishing</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                        label="Status"
                        options={[
                            { label: 'Draft', value: 'draft' },
                            { label: 'Published', value: 'published' },
                            { label: 'Ongoing', value: 'ongoing' },
                            { label: 'Completed', value: 'completed' },
                            { label: 'Cancelled', value: 'cancelled' },
                        ]}
                        {...register('status')}
                    />
                    <div className="pt-6">
                        <Switch
                            label="Featured Event"
                            description="Show in featured sections on the homepage"
                            checked={watch('is_featured')}
                            onChange={(checked) => setValue('is_featured', checked)}
                        />
                    </div>
                </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-4 border-t border-dark-800">
                <Button type="button" variant="outline" onClick={() => window.history.back()}>
                    Cancel
                </Button>
                <Button type="submit" variant="primary" size="lg" isLoading={isLoading}>
                    {initialData ? 'Update Event' : 'Create Event'}
                </Button>
            </div>
        </form>
    )
}