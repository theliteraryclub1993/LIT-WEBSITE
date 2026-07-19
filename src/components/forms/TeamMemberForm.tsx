import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input, Textarea, Select, Switch, Button, Divider, BrandIcons, ImageCropper } from '@/components/ui'
import { uploadFile, supabase } from '@/lib/supabase'
import { STORAGE_BUCKETS, ALLOWED_IMAGE_TYPES, formatFileSize, MAX_FILE_SIZES } from '@/utils/constants'
import type { TeamMember, SocialLinks } from '@/types'
import { Loader2, Upload, X, Globe } from 'lucide-react'

const schema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Max 100 characters'),
    role: z.string().min(1, 'Role/Title is required'),
    department: z.string().optional(),
    bio: z.string().max(500, 'Max 500 characters').optional(),
    order_index: z.coerce.number(),
    is_active: z.boolean(),
    instagram: z.string().optional(),
    twitter: z.string().url('Invalid URL').optional().or(z.literal('')),
    linkedin: z.string().url('Invalid URL').optional().or(z.literal('')),
    youtube: z.string().url('Invalid URL').optional().or(z.literal('')),
    website: z.string().url('Invalid URL').optional().or(z.literal('')),
    github: z.string().url('Invalid URL').optional().or(z.literal('')),
})

type FormValues = z.infer<typeof schema>

interface TeamMemberFormProps {
    initialData?: TeamMember | null
    departments: string[]
    onSubmit: (data: FormValues & { avatar_url: string }) => Promise<void>
    isLoading?: boolean
}

const socialFields: Array<{ key: 'instagram' | 'twitter' | 'linkedin' | 'youtube' | 'website' | 'github'; label: string; icon: React.ReactNode; placeholder: string }> = [
    { key: 'instagram', label: 'Instagram', icon: <BrandIcons.Instagram size={14} />, placeholder: 'https://instagram.com/username' },
    { key: 'twitter', label: 'Twitter / X', icon: <BrandIcons.Twitter size={14} />, placeholder: 'https://twitter.com/username' },
    { key: 'linkedin', label: 'LinkedIn', icon: <BrandIcons.Linkedin size={14} />, placeholder: 'https://linkedin.com/in/username' },
    { key: 'youtube', label: 'YouTube', icon: <BrandIcons.Youtube size={14} />, placeholder: 'https://youtube.com/@channel' },
    { key: 'github', label: 'GitHub', icon: <BrandIcons.Github size={14} />, placeholder: 'https://github.com/username' },
    { key: 'website', label: 'Website', icon: <Globe size={14} />, placeholder: 'https://yourwebsite.com' },
]

/**
 * Form for creating or editing a team member.
 * Includes avatar upload and social links builder.
 */
export function TeamMemberForm({ initialData, departments, onSubmit, isLoading }: TeamMemberFormProps) {
    const [avatarUrl, setAvatarUrl] = useState(initialData?.avatar_url || '')
    const [isUploading, setIsUploading] = useState(false)
    const [showSocials, setShowSocials] = useState(
        initialData?.social_links ? Object.values(initialData.social_links).some(Boolean) : false
    )
    const [cropperOpen, setCropperOpen] = useState(false)
    const [cropperImageSrc, setCropperImageSrc] = useState('')
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<any>({
        resolver: zodResolver(schema) as any,
        defaultValues: {
            name: initialData?.name || '',
            role: initialData?.role || '',
            department: initialData?.department || '',
            bio: initialData?.bio || '',
            order_index: initialData?.order_index ?? 0,
            is_active: initialData?.is_active ?? true,
            instagram: initialData?.social_links?.instagram || '',
            twitter: initialData?.social_links?.twitter || '',
            linkedin: initialData?.social_links?.linkedin || '',
            youtube: initialData?.social_links?.youtube || '',
            website: initialData?.social_links?.website || '',
            github: initialData?.social_links?.github || '',
        },
    })

    const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!ALLOWED_IMAGE_TYPES.includes(file.type as typeof ALLOWED_IMAGE_TYPES[number])) {
            alert('Invalid file type. Use JPG, PNG, WebP, or GIF.')
            return
        }

        if (file.size > MAX_FILE_SIZES.avatars) {
            alert(`File too large (${formatFileSize(file.size)}). Maximum ${formatFileSize(MAX_FILE_SIZES.avatars)}.`);
            return
        }

        setSelectedFile(file)
        const reader = new FileReader()
        reader.onload = () => {
            if (reader.result) {
                setCropperImageSrc(String(reader.result))
                setCropperOpen(true)
            }
        }
        reader.readAsDataURL(file)
        e.target.value = ''
    }

    const handleCropComplete = async (croppedBlob: Blob) => {
        if (!selectedFile) return
        setCropperOpen(false)
        setIsUploading(true)

        try {
            const fileName = `${Date.now()}_${selectedFile.name.replace(/\.[^/.]+$/, '')}.jpg`
            const croppedFile = new File([croppedBlob], fileName, { type: 'image/jpeg' })

            const { data: { user } } = await supabase.auth.getUser()
            const userPrefix = user?.id ? `${user.id}/` : ''
            const path = `${userPrefix}${fileName}`
            const url = await uploadFile(STORAGE_BUCKETS.AVATARS, path, croppedFile, { upsert: true })

            if (url) {
                setAvatarUrl(url)
            } else {
                alert('Failed to upload cropped avatar.')
            }
        } catch (err) {
            console.error('Error during cropped avatar upload:', err)
            alert('An error occurred during avatar upload.')
        } finally {
            setIsUploading(false)
            setSelectedFile(null)
            setCropperImageSrc('')
        }
    }

    const handleFormSubmit = async (data: FormValues) => {
        const socialLinks: SocialLinks = {
            instagram: data.instagram || undefined,
            twitter: data.twitter || undefined,
            linkedin: data.linkedin || undefined,
            youtube: data.youtube || undefined,
            website: data.website || undefined,
            github: data.github || undefined,
        }

        // Remove undefined values from social links
        Object.keys(socialLinks).forEach(key => {
            if (socialLinks[key as keyof SocialLinks] === undefined) {
                delete socialLinks[key as keyof SocialLinks]
            }
        })

        // Exclude social field keys from the top-level payload
        const { instagram, twitter, linkedin, youtube, website, github, ...rest } = data

        await onSubmit({
            ...rest,
            avatar_url: avatarUrl,
            social_links: socialLinks,
        } as any)
    }

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
                <h4 className="text-label text-dark-200 uppercase tracking-widest">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Full Name *" placeholder="Arjun Mehta" error={errors.name?.message as any} {...register('name')} />
                    <Input label="Role / Title *" placeholder="President, Content Head..." error={errors.role?.message as any} {...register('role')} />
                </div>
            </div>

            <Divider variant="dashed" />

            {/* Avatar */}
            <div className="space-y-4">
                <h4 className="text-label text-dark-200 uppercase tracking-widest">Avatar</h4>
                <div className="flex items-center gap-6">
                    <div className="relative">
                        {avatarUrl ? (
                            <div className="w-24 aspect-[3/4] rounded-xl overflow-hidden border-2 border-dark-700 bg-dark-800 shadow-md">
                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className="w-24 aspect-[3/4] rounded-xl border-2 border-dashed border-dark-700 bg-dark-950 flex flex-col items-center justify-center gap-1 text-center p-2">
                                <span className="text-h4 text-dark-600">3:4</span>
                                <span className="text-[10px] text-dark-500 uppercase tracking-wider font-mono">No Image</span>
                            </div>
                        )}
                        {isUploading && (
                            <div className="absolute inset-0 rounded-xl bg-black/60 flex items-center justify-center">
                                <Loader2 className="animate-spin text-orange-primary" size={24} />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarFileSelect}
                                className="hidden"
                                id="avatar-upload"
                            />
                            <label
                                htmlFor="avatar-upload"
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dark-700 text-body-sm text-dark-300 hover:text-white hover:border-dark-500 hover:bg-dark-800 transition-all cursor-pointer"
                            >
                                <Upload size={16} />
                                {avatarUrl ? 'Crop & Change Avatar' : 'Upload & Crop Avatar'}
                            </label>
                            <p className="text-caption text-dark-400">3:4 Portrait Ratio · Interactive Cropper · Max 2MB</p>
                        </label>

                        {avatarUrl && (
                            <button
                                type="button"
                                onClick={() => setAvatarUrl('')}
                                className="inline-flex items-center gap-1.5 text-caption text-dark-500 hover:text-error transition-colors"
                            >
                                <X size={12} /> Remove
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <Divider variant="dashed" />

            {/* Details */}
            <div className="space-y-4">
                <h4 className="text-label text-dark-200 uppercase tracking-widest">Details</h4>
                <Select
                    label="Department"
                    placeholder="Select or type a department"
                    options={[
                        { label: 'Alumni (Past Member / Graduated)', value: 'Alumni' },
                        ...Array.from(new Set(departments)).filter(d => d !== 'Alumni').map(d => ({ label: d, value: d })),
                        { label: '— Add New Department —', value: '__new__' },
                    ]}
                    value={watch('department')}
                    onChange={(e) => {
                        if (e.target.value === '__new__') {
                            const name = prompt('Enter new department name:')
                            if (name) setValue('department', name)
                            else setValue('department', '')
                        } else {
                            setValue('department', e.target.value)
                        }
                    }}
                />
                {watch('department') === 'Alumni' && (
                    <p className="text-caption text-amber-400/90 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                        🎓 <strong>Alumni Tip:</strong> Set Role/Title to their former role or batch year (e.g., <em>"President (2022-23)"</em>, <em>"Batch of 2021"</em>, or <em>"Founding Member"</em>).
                    </p>
                )}
                <Textarea
                    label="Bio"
                    placeholder="A brief bio about the member (max 500 chars)..."
                    className="min-h-[100px]"
                    showCount
                    maxLength={500}
                    currentLength={watch('bio')?.length || 0}
                    {...register('bio')}
                />
            </div>

            <Divider variant="dashed" />

            {/* Social Links */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-label text-dark-200 uppercase tracking-widest">Social Links</h4>
                    <button
                        type="button"
                        onClick={() => setShowSocials(!showSocials)}
                        className="text-caption text-orange-primary hover:text-orange-light transition-colors"
                    >
                        {showSocials ? 'Hide' : 'Add Social Links'}
                    </button>
                </div>

                {showSocials && (
                    <div className="space-y-3 pl-0">
                        {socialFields.map(field => (
                            <div key={field.key} className="flex items-center gap-3">
                                <span className="text-dark-500 shrink-0 w-5 flex justify-center">{field.icon}</span>
                                <input
                                    type="url"
                                    placeholder={field.placeholder}
                                    className="flex-1 bg-dark-800 border border-dark-700 text-sm rounded-lg px-3 py-2 text-white placeholder-dark-500 focus:outline-none focus:border-orange-primary focus:ring-1 focus:ring-orange-primary/30 transition-colors"
                                    {...register(field.key)}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {!showSocials && initialData?.social_links && Object.values(initialData.social_links).some(Boolean) && (
                    <p className="text-caption text-dark-500 italic">
                        Social links configured. Click "Add Social Links" to edit.
                    </p>
                )}
            </div>

            <Divider variant="dashed" />

            {/* Publishing */}
            <div className="space-y-4">
                <h4 className="text-label text-dark-200 uppercase tracking-widest">Publishing</h4>
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Display Order"
                        type="number"
                        placeholder="0 = First"
                        hint="Lower numbers appear first on the page"
                        {...register('order_index')}
                    />
                    <div className="pt-6">
                        <Switch
                            label="Active Member"
                            description="Inactive members are hidden from the public team page"
                            checked={watch('is_active')}
                            onChange={(checked) => setValue('is_active', checked)}
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
                    {initialData ? 'Update Member' : 'Add Member'}
                </Button>
            </div>

            {cropperOpen && (
                <ImageCropper
                    isOpen={cropperOpen}
                    onClose={() => {
                        setCropperOpen(false)
                        setSelectedFile(null)
                        setCropperImageSrc('')
                    }}
                    imageSrc={cropperImageSrc}
                    onCropComplete={handleCropComplete}
                />
            )}
        </form>
    )
}