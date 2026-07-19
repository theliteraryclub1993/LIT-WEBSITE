import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mic, Send } from 'lucide-react'
import { usePublicAuditions } from '@/hooks/useAuditionCycles'
import { supabase } from '@/lib/supabase'
import { Button, Input, Textarea, Select, Card, Badge, Modal, PageLoader, EmptyState } from '@/components/ui'
import { formatDate } from '@/utils/formatDate'
import toast from 'react-hot-toast'

const schema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Valid email required'),
    phone: z.string().min(1, 'Phone number is required'),
    year_of_study: z.enum(['1st Year', '2nd Year'], {
        message: 'Please select your year of study',
    }),
    experience: z.string().optional(),
})
type FormData = z.infer<typeof schema>

const getQuestionsList = (reqs: string | null | undefined): string[] => {
    if (!reqs) return []
    try {
        const parsed = JSON.parse(reqs)
        if (Array.isArray(parsed)) return parsed
    } catch (e) {}
    return [reqs]
}

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'open':
            return <Badge variant="success" size="sm" dot>Open</Badge>
        case 'closed':
            return <Badge variant="error" size="sm" dot>Closed</Badge>
        case 'in_review':
            return <Badge variant="warning" size="sm" dot>Under Review</Badge>
        case 'results_out':
            return <Badge variant="info" size="sm" dot>Results Out</Badge>
        default:
            return <Badge variant="default" size="sm" dot>{status}</Badge>
    }
}

export function AuditionsPage() {
    const { data: auditions, isLoading } = usePublicAuditions()
    const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [answers, setAnswers] = useState<Record<number, string>>({})

    const selectedCycle = auditions?.find(c => c.id === selectedCycleId)
    const questionsList = getQuestionsList(selectedCycle?.requirements)

    useEffect(() => {
        setAnswers({})
    }, [selectedCycleId])

    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({ resolver: zodResolver(schema) })

    const onSubmit = async (data: FormData) => {
        if (!selectedCycleId) return
        setIsSubmitting(true)

        let experienceValue = data.experience || ''
        if (questionsList.length > 0) {
            experienceValue = questionsList
                .map((q, idx) => `${q}\nAnswer: ${answers[idx] || ''}`)
                .join('\n\n')
        }

        const { error } = await supabase.from('audition_applications').insert({
            cycle_id: selectedCycleId,
            ...data,
            experience: experienceValue,
        })
        setIsSubmitting(false)
        if (error) {
            toast.error(error.message)
        } else {
            toast.success('Application submitted successfully!')
            setSelectedCycleId(null)
            reset()
            setAnswers({})
        }
    }

    return (
        <div className="bg-black min-h-screen">
            <section className="relative pt-40 pb-12 overflow-hidden">
                {/* Cinematic background logo */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8, rotate: -8 }}
                    animate={{ 
                        opacity: 0.08, 
                        scale: 1,
                        rotate: 0,
                        y: [0, -12, 0]
                    }}
                    transition={{ 
                        opacity: { duration: 1.2 },
                        scale: { duration: 1.5, ease: "easeOut" },
                        y: {
                            repeat: Infinity,
                            duration: 7.5,
                            ease: "easeInOut"
                        }
                    }}
                    className="absolute right-[2%] top-[10%] w-[30%] max-w-[300px] aspect-square pointer-events-none select-none z-0 hidden sm:block"
                    style={{
                        maskImage: 'linear-gradient(to left, black 30%, transparent 95%)',
                        WebkitMaskImage: 'linear-gradient(to left, black 30%, transparent 95%)'
                    }}
                >
                    <img 
                        src="/favicon.svg" 
                        alt="" 
                        className="w-full h-full object-contain filter drop-shadow-[0_0_80px_rgba(255,107,0,0.2)]"
                    />
                </motion.div>

                <div className="container-editorial relative z-10 text-center max-w-3xl mx-auto">
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-overline text-orange-primary tracking-mega block mb-4">Join the Team</motion.span>
                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-display text-white mb-6">AUDITIONS</motion.h1>
                    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-body text-dark-400">
                        We are always looking for passionate individuals. Apply for an open position below.
                    </motion.p>
                </div>
            </section>

            <section className="pb-24">
                <div className="container-editorial">
                    {isLoading ? <PageLoader /> : !auditions?.length ? (
                        <EmptyState icon={<Mic size={48} strokeWidth={1.5} />} title="No active auditions right now" description="Check back later for new opportunities." />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                            {auditions.map((cycle, i) => (
                                <motion.div
                                    key={cycle.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <Card variant="bordered" padding="lg" className="flex flex-col h-full">
                                        <div className="flex items-start justify-between mb-4">
                                            {getStatusBadge(cycle.status)}
                                            <span className="text-caption text-dark-500">Closes {formatDate(cycle.close_date, 'MMM d')}</span>
                                        </div>
                                        <h3 className="text-h4 text-white mb-2">{cycle.title}</h3>
                                        <p className="text-label text-orange-primary mb-4">Position: {cycle.position}</p>
                                        <p className="text-body-sm text-dark-400 line-clamp-3 mb-6 flex-1">{cycle.description}</p>

                                        {cycle.max_applicants && (
                                            <p className="text-caption text-dark-500 mb-4">Max Applicants: {cycle.max_applicants}</p>
                                        )}

                                        {cycle.status === 'open' ? (
                                            <Button variant="primary" fullWidth onClick={() => setSelectedCycleId(cycle.id)}>
                                                Apply Now
                                            </Button>
                                        ) : (
                                            <Button variant="outline" fullWidth disabled>
                                                {cycle.status === 'closed' && 'Applications Closed'}
                                                {cycle.status === 'in_review' && 'Under Review'}
                                                {cycle.status === 'results_out' && 'Results Out'}
                                            </Button>
                                        )}
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Application Modal */}
            <Modal
                isOpen={!!selectedCycleId}
                onClose={() => setSelectedCycleId(null)}
                title={`Apply: ${selectedCycle?.position || ''}`}
                subtitle={selectedCycle?.title}
                size="md"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input label="Full Name *" error={errors.name?.message} {...register('name')} />
                    <Input label="Email *" type="email" error={errors.email?.message} {...register('email')} />
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Phone *" type="tel" error={errors.phone?.message} {...register('phone')} />
                        <Select
                            label="Year of Study *"
                            options={[
                                { label: '1st Year', value: '1st Year' },
                                { label: '2nd Year', value: '2nd Year' },
                            ]}
                            placeholder="Select year"
                            error={errors.year_of_study?.message}
                            {...register('year_of_study')}
                        />
                    </div>
                    {questionsList.length > 0 ? (
                        questionsList.map((question, idx) => (
                            <Textarea
                                key={idx}
                                label={question}
                                placeholder="Type your answer here..."
                                value={answers[idx] || ''}
                                onChange={(e) => setAnswers(prev => ({ ...prev, [idx]: e.target.value }))}
                                required
                            />
                        ))
                    ) : (
                        <Textarea
                            label="Relevant Experience"
                            placeholder="Tell us about your background..."
                            {...register('experience')}
                        />
                    )}

                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="outline" fullWidth onClick={() => setSelectedCycleId(null)}>Cancel</Button>
                        <Button type="submit" variant="primary" fullWidth isLoading={isSubmitting} rightIcon={<Send size={16} />}>Submit Application</Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}