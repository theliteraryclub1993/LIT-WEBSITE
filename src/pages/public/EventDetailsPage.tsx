import { useState, useMemo, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Calendar, MapPin, Clock, Users, ArrowLeft, CheckCircle } from 'lucide-react'
import { usePublicEvent } from '@/hooks/useEvents'
import { supabase } from '@/lib/supabase'
import { Button, Input, Textarea, Select, Card, Badge, PageLoader } from '@/components/ui'
import { formatDate, formatTime } from '@/utils/formatDate'
import toast from 'react-hot-toast'
import type { EventCustomField } from '@/types'

export function EventDetailsPage() {
    const { slug } = useParams<{ slug: string }>()
    const { data: event, isLoading, error } = usePublicEvent(slug || '')
    const [isRegistered, setIsRegistered] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [winners, setWinners] = useState<any[]>([])
    const [coordinators, setCoordinators] = useState<any[]>([])

    // Load coordinators
    useEffect(() => {
        supabase
            .from('team_members')
            .select('name, role, avatar_url')
            .eq('is_active', true)
            .limit(2)
            .then(({ data, error }) => {
                if (!error && data) {
                    setCoordinators(data)
                }
            })
    }, [])

    // Load winners if completed
    useEffect(() => {
        if (event?.status === 'completed') {
            supabase
                .from('certificates')
                .select('certificate_number, participant_id, participants(name, college)')
                .eq('event_id', event.id)
                .eq('template_type', 'winner')
                .then(({ data, error }) => {
                    if (!error && data) {
                        setWinners(data)
                    }
                })
        }
    }, [event])

    // Dynamic Form Schema based on custom fields
    const dynamicSchema = useMemo(() => {
        if (!event?.custom_fields) return z.object({})

        const shape: Record<string, z.ZodTypeAny> = {}
        shape.name = z.string().min(1, 'Name is required')
        shape.email = z.string().email('Invalid email')
        shape.phone = z.string().optional()
        shape.college = z.string().optional()

        event.custom_fields.forEach((field: EventCustomField) => {
            if (field.type === 'select' || field.type === 'multiselect') {
                shape[field.name] = field.required ? z.string().min(1, `${field.label} is required`) : z.string().optional()
            } else if (field.type === 'number') {
                shape[field.name] = field.required ? z.coerce.number().min(1, `${field.label} is required`) : z.coerce.number().optional()
            } else {
                shape[field.name] = field.required ? z.string().min(1, `${field.label} is required`) : z.string().optional()
            }
        })

        return z.object(shape)
    }, [event?.custom_fields])

    const { register, handleSubmit, formState: { errors }, reset } = useForm<Record<string, any>>({
        resolver: zodResolver(dynamicSchema) as any,
    })

    const onRegister = async (data: Record<string, unknown>) => {
        if (!event) return
        setIsSubmitting(true)

        // Separate base fields from custom data
        const { name, email, phone, college, ...customData } = data

        const { error } = await supabase.from('participants').insert({
            event_id: event.id,
            name,
            email,
            phone: phone || null,
            college: college || null,
            custom_data: customData,
        })

        setIsSubmitting(false)

        if (error) {
            if (error.code === '23505') {
                toast.error('This email is already registered for this event.')
            } else {
                toast.error(error.message)
            }
        } else {
            toast.success('Registration successful!')
            setIsRegistered(true)
            reset()
        }
    }

    if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center"><PageLoader /></div>
    if (error || !event) return <div className="min-h-screen bg-black flex items-center justify-center text-dark-400">Event not found.</div>

    return (
        <div className="bg-black min-h-screen">
            {/* Hero */}
            <div className="relative h-[50vh] min-h-[400px]">
                {event.cover_image ? (
                    <img src={event.cover_image} alt={event.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-dark-800 to-black" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
                    <div className="container-editorial">
                        <Link to="/events" className="inline-flex items-center gap-2 text-body-sm text-dark-300 hover:text-white transition-colors mb-6">
                            <ArrowLeft size={16} /> Back to Events
                        </Link>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {event.is_featured && <Badge variant="silver">Featured</Badge>}
                            {event.registration_fee === 0 ? <Badge variant="success" dot>Free Entry</Badge> : <Badge variant="orange">₹{event.registration_fee}</Badge>}
                        </div>
                        <h1 className="text-hero text-white max-w-3xl">{event.title}</h1>
                    </div>
                </div>
            </div>

            <div className="container-editorial py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex flex-wrap gap-6 text-dark-300">
                            {event.date && (
                                <div className="flex items-center gap-2"><Calendar size={18} className="text-orange-primary" /> {formatDate(event.date, 'EEEE, MMMM d, yyyy')}</div>
                            )}
                            {event.time && (
                                <div className="flex items-center gap-2"><Clock size={18} className="text-orange-primary" /> {formatTime(event.time)}</div>
                            )}
                            {event.venue && (
                                <div className="flex items-center gap-2"><MapPin size={18} className="text-orange-primary" /> {event.venue}</div>
                            )}
                            {event.max_participants && (
                                <div className="flex items-center gap-2"><Users size={18} className="text-orange-primary" /> Max {event.max_participants} participants</div>
                            )}
                        </div>

                        <div className="h-px bg-dark-800" />

                        {event.description && (
                            <div className="prose-editorial" dangerouslySetInnerHTML={{ __html: event.description }} />
                        )}

                        {/* Winners Section */}
                        {event.status === 'completed' && (
                            <div className="mt-8 p-6 bg-dark-900 border border-dark-800 rounded-2xl relative overflow-hidden">
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-primary to-yellow-500" />
                                <h3 className="text-h4 text-white mb-4 flex items-center gap-2">🏆 Event Winners</h3>
                                {winners.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {winners.map((winner: any, i) => (
                                            <div key={i} className="p-4 rounded-xl bg-black border border-dark-800 flex items-center justify-between">
                                                <div>
                                                    <p className="text-body font-semibold text-white">{winner.participants?.name}</p>
                                                    <p className="text-caption text-dark-400">{winner.participants?.college || 'Malnad College of Engineering'}</p>
                                                </div>
                                                <Badge variant="orange">Winner</Badge>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-body-sm text-dark-400">Results are being compiled and certificates are being issued. Check back shortly!</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sidebar - Registration */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            <Card variant="bordered" padding="lg" className="space-y-6">
                                {isRegistered ? (
                                    <div className="text-center py-8">
                                        <CheckCircle size={48} className="text-success mx-auto mb-4" />
                                        <h3 className="text-h4 text-white mb-2">You're Registered!</h3>
                                        <p className="text-body-sm text-dark-400">A confirmation has been sent to your email.</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit(onRegister)} className="space-y-4">
                                        <h3 className="text-h5 text-white">Register Now</h3>

                                        <Input label="Full Name *" placeholder="John Doe" error={errors.name?.message as string} {...register('name')} />
                                        <Input label="Email *" type="email" placeholder="john@example.com" error={errors.email?.message as string} {...register('email')} />
                                        <Input label="Phone" type="tel" placeholder="+91 98765 43210" {...register('phone')} />
                                        <Input label="College" placeholder="Your college name" {...register('college')} />

                                        {/* Dynamic Custom Fields */}
                                        {event.custom_fields?.map((field) => (
                                            <div key={field.name}>
                                                {field.type === 'textarea' ? (
                                                    <Textarea label={`${field.label}${field.required ? ' *' : ''}`} placeholder={field.placeholder} {...register(field.name)} />
                                                ) : field.type === 'select' ? (
                                                    <Select
                                                        label={`${field.label}${field.required ? ' *' : ''}`}
                                                        options={(field.options || []).map(opt => ({ label: opt, value: opt }))}
                                                        error={errors[field.name]?.message as string}
                                                        {...register(field.name)}
                                                    />
                                                ) : (
                                                    <Input
                                                        label={`${field.label}${field.required ? ' *' : ''}`}
                                                        type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : 'text'}
                                                        placeholder={field.placeholder}
                                                        error={errors[field.name]?.message as string}
                                                        {...register(field.name)}
                                                    />
                                                )}
                                            </div>
                                        ))}

                                        <Button type="submit" variant="primary" fullWidth size="lg" isLoading={isSubmitting}>
                                            {event.registration_fee > 0 ? `Pay ₹${event.registration_fee} & Register` : 'Register for Free'}
                                        </Button>
                                        <p className="text-caption text-dark-500 text-center">By registering, you agree to our terms.</p>
                                    </form>
                                )}
                            </Card>

                            {/* Downloads */}
                            {(event.rulebook_pdf || event.brochure_pdf) && (
                                <Card variant="bordered" padding="md" className="mt-6 space-y-4 bg-dark-900">
                                    <h4 className="text-body-sm font-semibold text-white tracking-widest uppercase">Event Resources</h4>
                                    <div className="space-y-2">
                                        {event.rulebook_pdf && (
                                            <a 
                                                href={event.rulebook_pdf} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-between p-3 rounded-lg border border-dark-750 hover:border-orange-primary/50 bg-dark-950 transition-colors text-body-sm text-dark-200 hover:text-white"
                                            >
                                                <span>Rulebook PDF</span>
                                                <span className="text-orange-primary text-xs uppercase font-semibold">Download</span>
                                            </a>
                                        )}
                                        {event.brochure_pdf && (
                                            <a 
                                                href={event.brochure_pdf} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-between p-3 rounded-lg border border-dark-750 hover:border-orange-primary/50 bg-dark-950 transition-colors text-body-sm text-dark-200 hover:text-white"
                                            >
                                                <span>Brochure PDF</span>
                                                <span className="text-orange-primary text-xs uppercase font-semibold">Download</span>
                                            </a>
                                        )}
                                    </div>
                                </Card>
                            )}

                            {/* Coordinators */}
                            {coordinators.length > 0 && (
                                <Card variant="bordered" padding="md" className="mt-6 space-y-4 bg-dark-900">
                                    <h4 className="text-body-sm font-semibold text-white tracking-widest uppercase">Event Contacts</h4>
                                    <div className="space-y-3">
                                        {coordinators.map((c: any, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                {c.avatar_url ? (
                                                    <img src={c.avatar_url} alt={c.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center text-white text-body-sm font-bold uppercase shrink-0">{c.name[0]}</div>
                                                )}
                                                <div>
                                                    <p className="text-body-sm font-medium text-white">{c.name}</p>
                                                    <p className="text-caption text-dark-400">{c.role}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}