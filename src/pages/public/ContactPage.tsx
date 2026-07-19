import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, MapPin, Send, CheckCircle } from 'lucide-react'
import { getSettingsByCategory } from '@/services/settingsService'
import { brand } from '@/config/brandConfig'
import { Button, Input, Textarea, Card, BrandIcons } from '@/components/ui'
import toast from 'react-hot-toast'

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as any },
    }),
}

export function ContactPage() {
    const [contactEmail, setContactEmail] = useState<string>(brand.contact.email)
    const [instagramUrl, setInstagramUrl] = useState<string>('https://linktr.ee/lit1993?utm_source=qr_code')
    const [youtubeUrl, setYoutubeUrl] = useState<string>('https://www.youtube.com/@theliteraryclub1971')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    })
    const [errors, setErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        // Fetch contact details from settings
        getSettingsByCategory('general')
            .then(data => {
                if (data?.contactEmail) setContactEmail(String(data.contactEmail))
            })
            .catch(err => console.error('Failed to load contact email setting:', err))

        getSettingsByCategory('social')
            .then(data => {
                if (data?.instagram) setInstagramUrl(String(data.instagram))
                if (data?.youtube) setYoutubeUrl(String(data.youtube))
            })
            .catch(err => console.error('Failed to load socials for contact page:', err))
    }, [])

    const validateForm = () => {
        const tempErrors: Record<string, string> = {}
        if (!formData.name.trim()) tempErrors.name = 'Name is required'
        if (!formData.email.trim()) {
            tempErrors.email = 'Email is required'
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            tempErrors.email = 'Please enter a valid email address'
        }
        if (!formData.subject.trim()) tempErrors.subject = 'Subject is required'
        if (!formData.message.trim()) {
            tempErrors.message = 'Message is required'
        } else if (formData.message.trim().length < 10) {
            tempErrors.message = 'Message must be at least 10 characters'
        }
        setErrors(tempErrors)
        return Object.keys(tempErrors).length === 0
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateForm()) return

        setIsSubmitting(true)
        try {
            const targetMail = contactEmail || 'theliteraryclubmce@gmail.com'
            const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(targetMail)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    _subject: `[LIT Website] ${formData.subject}`,
                    message: formData.message,
                    _template: 'table'
                })
            })

            const data = await response.json().catch(() => ({}))

            if (response.ok) {
                setIsSubmitted(true)
                if (data?.message?.toLowerCase().includes('activation') || data?.message?.toLowerCase().includes('confirm')) {
                    toast('First submission detected! FormSubmit sent an activation link to ' + targetMail + '. Please check your inbox/spam folder to click Activate.', { icon: '📩', duration: 9000 })
                } else {
                    toast.success('Your message has been sent successfully!')
                }
            } else {
                console.warn('[ContactForm] FormSubmit response:', data)
                toast.error(`Form submission issue: ${data?.message || 'Please check your email client.'}`)
            }
        } catch (err) {
            console.error('Contact form submission error:', err)
            toast.error('Network error. Opening email client fallback...')
            const mailtoUrl = `mailto:${contactEmail || 'theliteraryclubmce@gmail.com'}?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`)}`
            window.open(mailtoUrl, '_blank')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleReset = () => {
        setFormData({
            name: '',
            email: '',
            subject: '',
            message: '',
        })
        setIsSubmitted(false)
    }

    return (
        <div className="bg-black min-h-screen text-white">
            {/* Background elements */}
            <div className="absolute inset-0 bg-gradient-to-b from-dark-950 via-black to-black pointer-events-none" />

            <section className="relative pt-40 pb-24 overflow-hidden z-10">
                {/* Cinematic glow */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-orange-primary/5 rounded-full filter blur-[120px] pointer-events-none" />

                <div className="container-editorial max-w-6xl mx-auto px-4">
                    {/* Header */}
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <motion.span
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                            custom={0}
                            className="text-overline text-orange-primary tracking-mega block mb-4"
                        >
                            Get In Touch
                        </motion.span>
                        <motion.h1
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                            custom={1}
                            className="text-display text-white mb-6 uppercase"
                        >
                            Contact Us
                        </motion.h1>
                        <motion.p
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                            custom={2}
                            className="text-body-lg text-dark-300 leading-relaxed"
                        >
                            Have a question, feedback, or want to collaborate with the Literary Club? Write to us or connect through our social handles.
                        </motion.p>
                    </div>

                    {/* Columns grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                        {/* Direct Contact info (4 cols) */}
                        <motion.div
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                            custom={3}
                            className="lg:col-span-5 space-y-6"
                        >
                            <h3 className="text-h4 font-subheading text-white uppercase tracking-wider mb-6">
                                Connection Hub
                            </h3>

                            {/* Email Card */}
                            <div className="p-6 rounded-xl bg-dark-900/60 border border-dark-800 backdrop-blur-sm hover:border-dark-700 transition-all group">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-orange-subtle border border-orange-border flex items-center justify-center text-orange-primary shrink-0 group-hover:scale-110 transition-transform">
                                        <Mail size={22} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <h4 className="text-overline text-dark-500 uppercase tracking-widest">
                                            Email Address
                                        </h4>
                                        <a
                                            href={`mailto:${contactEmail}`}
                                            className="block text-body-md text-white hover:text-orange-primary transition-colors"
                                        >
                                            {contactEmail}
                                        </a>
                                        <p className="text-caption text-dark-500">
                                            Send us an email anytime; we usually respond within 24 hours.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Location Card */}
                            <div className="p-6 rounded-xl bg-dark-900/60 border border-dark-800 backdrop-blur-sm hover:border-dark-700 transition-all group">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-orange-subtle border border-orange-border flex items-center justify-center text-orange-primary shrink-0 group-hover:scale-110 transition-transform">
                                        <MapPin size={22} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <h4 className="text-overline text-dark-500 uppercase tracking-widest">
                                            Our Base
                                        </h4>
                                        <p className="text-body-md text-white">
                                            Malnad College of Engineering
                                        </p>
                                        <p className="text-caption text-dark-400">
                                            MCE campus, Hassan, Karnataka - 573202
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Socials Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <a
                                    href={instagramUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-6 rounded-xl bg-dark-900/40 border border-dark-800 hover:border-orange-border hover:bg-orange-subtle/10 flex flex-col items-center justify-center text-center gap-3 transition-all duration-300 group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-dark-850 flex items-center justify-center border border-dark-700 text-dark-400 group-hover:text-orange-primary group-hover:border-orange-border transition-colors">
                                        <BrandIcons.Instagram size={24} />
                                    </div>
                                    <span className="text-body-sm font-medium text-dark-300 group-hover:text-white">
                                        Instagram
                                    </span>
                                    <span className="text-caption text-dark-500">
                                        @lit1993
                                    </span>
                                </a>

                                <a
                                    href={youtubeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-6 rounded-xl bg-dark-900/40 border border-dark-800 hover:border-orange-border hover:bg-orange-subtle/10 flex flex-col items-center justify-center text-center gap-3 transition-all duration-300 group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-dark-850 flex items-center justify-center border border-dark-700 text-dark-400 group-hover:text-orange-primary group-hover:border-orange-border transition-colors">
                                        <BrandIcons.Youtube size={24} />
                                    </div>
                                    <span className="text-body-sm font-medium text-dark-300 group-hover:text-white">
                                        YouTube
                                    </span>
                                    <span className="text-caption text-dark-500">
                                        @theliteraryclub1971
                                    </span>
                                </a>
                            </div>
                        </motion.div>

                        {/* Interactive Form Card (7 cols) */}
                        <motion.div
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                            custom={4}
                            className="lg:col-span-7"
                        >
                            <Card className="p-8 bg-dark-900/40 border-dark-800 backdrop-blur-md relative overflow-hidden">
                                <AnimatePresence mode="wait">
                                    {!isSubmitted ? (
                                        <motion.form
                                            key="contact-form"
                                            onSubmit={handleSubmit}
                                            className="space-y-6"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className="space-y-1">
                                                <h3 className="text-h4 font-subheading uppercase tracking-wider text-white">
                                                    Send Message
                                                </h3>
                                                <p className="text-caption text-dark-400">
                                                    Fill out the form below and our team will get in touch with you.
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <Input
                                                    label="Name *"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    placeholder="Your name"
                                                    error={errors.name}
                                                />
                                                <Input
                                                    label="Email *"
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    placeholder="Your email address"
                                                    error={errors.email}
                                                />
                                            </div>

                                            <Input
                                                label="Subject *"
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleChange}
                                                placeholder="What is this regarding?"
                                                error={errors.subject}
                                            />

                                            <Textarea
                                                label="Message *"
                                                name="message"
                                                value={formData.message}
                                                onChange={handleChange}
                                                placeholder="Write your message here..."
                                                className="min-h-[150px]"
                                                error={errors.message}
                                                showCount
                                                maxLength={1000}
                                                currentLength={formData.message.length}
                                            />

                                            <Button
                                                type="submit"
                                                variant="primary"
                                                size="lg"
                                                fullWidth
                                                isLoading={isSubmitting}
                                                rightIcon={<Send size={16} />}
                                            >
                                                Send Message
                                            </Button>
                                        </motion.form>
                                    ) : (
                                        <motion.div
                                            key="success-card"
                                            className="text-center py-10 space-y-6 flex flex-col items-center justify-center"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                                        >
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                                                className="w-20 h-20 rounded-full bg-success-subtle border border-success-border flex items-center justify-center text-success"
                                            >
                                                <CheckCircle size={40} />
                                            </motion.div>

                                            <div className="space-y-2">
                                                <h3 className="text-h3 font-subheading text-white uppercase tracking-wider">
                                                    Message Sent!
                                                </h3>
                                                <p className="text-body-md text-dark-300 max-w-md mx-auto leading-relaxed">
                                                    Thank you for reaching out to us. We have received your message and our team will get back to you shortly.
                                                </p>
                                            </div>

                                            <Button
                                                variant="outline"
                                                onClick={handleReset}
                                                className="mt-4"
                                            >
                                                Send Another Message
                                            </Button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </section>
        </div>
    )
}
