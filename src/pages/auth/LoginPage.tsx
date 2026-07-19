import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAuthStore } from '@/store'
import { Button, Input, Divider } from '@/components/ui'
import toast from 'react-hot-toast'

const loginSchema = z.object({
    email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
    password: z.string().min(1, 'Password is required').min(6, 'Password must be at least 6 characters'),
})

type LoginFormValues = z.infer<typeof loginSchema>

/**
 * Premium editorial login page.
 * Split layout: Left branding panel, Right form panel.
 */
export function LoginPage() {
    const navigate = useNavigate()
    const login = useAuthStore((s) => s.login)
    const isLoading = useAuthStore((s) => s.isLoading)
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

    const [showPassword, setShowPassword] = useState(false)

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/admin', { replace: true })
        }
    }, [isAuthenticated, navigate])

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    })

    const onSubmit = async (data: LoginFormValues) => {
        const { error } = await login(data.email, data.password)

        if (error) {
            toast.error(error)
        } else {
            toast.success('Welcome back!')
            navigate('/admin', { replace: true })
        }
    }

    return (
        <div className="min-h-screen flex">
            {/* Left Panel — Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-dark-950 overflow-hidden">
                {/* Background Elements */}
                <div className="absolute inset-0 bg-grid-orange opacity-30" />
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-orange-radial" />

                <div className="relative z-10 flex flex-col justify-between p-12 w-full">
                    {/* Logo */}
                    <div>
                        <Link to="/" className="inline-block group">
                            <span className="text-display text-white group-hover:text-gradient-orange transition-all duration-300">
                                THE LITERARY CLUB
                            </span>
                        </Link>
                    </div>

                    {/* Center Content */}
                    <div className="space-y-8 max-w-md">
                        <div className="space-y-4">
                            <div className="editorial-rule" />
                            <h2 className="text-h2 text-white">
                                CRAFTING LITERARY<br />
                                EXPERIENCES SINCE<br />
                                <span className="text-gradient-orange">1993</span>
                            </h2>
                        </div>

                        <p className="text-body text-dark-300 leading-relaxed">
                            Access the admin portal to manage events, publications, team members, and the entire literary ecosystem.
                        </p>

                        <div className="flex items-center gap-8 pt-4">
                            <div>
                                <p className="text-h3 text-white tabular-nums">500+</p>
                                <p className="text-caption text-dark-500 uppercase tracking-widest mt-1">Events</p>
                            </div>
                            <div className="w-px h-10 bg-dark-700" />
                            <div>
                                <p className="text-h3 text-white tabular-nums">2000+</p>
                                <p className="text-caption text-dark-500 uppercase tracking-widest mt-1">Members</p>
                            </div>
                            <div className="w-px h-10 bg-dark-700" />
                            <div>
                                <p className="text-h3 text-white tabular-nums">30+</p>
                                <p className="text-caption text-dark-500 uppercase tracking-widest mt-1">Years</p>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Tagline */}
                    <div>
                        <p className="text-overline text-dark-600 tracking-mega">
                            WHERE WORDS COME ALIVE
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Panel — Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-black">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md space-y-8"
                >
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-8">
                        <Link to="/" className="inline-block">
                            <span className="text-h2 text-white">THE LITERARY CLUB</span>
                        </Link>
                        <p className="text-caption text-dark-500 tracking-mega mt-2">ADMIN PORTAL</p>
                    </div>

                    {/* Header */}
                    <div className="space-y-2">
                        <h1 className="text-h3 text-white">Sign In</h1>
                        <p className="text-body-sm text-dark-400">
                            Enter your credentials to access the dashboard
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="admin@literaryclub.in"
                            error={errors.email?.message}
                            fullWidth
                            {...register('email')}
                        />

                        <div className="relative">
                            <Input
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                error={errors.password?.message}
                                fullWidth
                                {...register('password')}
                                rightIcon={
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-dark-400 hover:text-white transition-colors"
                                        tabIndex={-1}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                }
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-dark-600 bg-dark-800 text-orange-primary focus:ring-orange-primary/50 focus:ring-offset-0"
                                />
                                <span className="text-body-sm text-dark-400 group-hover:text-dark-200 transition-colors">
                                    Remember me
                                </span>
                            </label>

                            <button
                                type="button"
                                className="text-body-sm text-orange-primary hover:text-orange-light transition-colors"
                            >
                                Forgot password?
                            </button>
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            fullWidth
                            isLoading={isLoading}
                            rightIcon={!isLoading ? <ArrowRight size={18} /> : undefined}
                        >
                            Sign In
                        </Button>
                    </form>

                    <Divider label="OR" variant="dashed" />

                    {/* Back to site */}
                    <div className="text-center">
                        <Link
                            to="/"
                            className="text-body-sm text-dark-400 hover:text-white transition-colors inline-flex items-center gap-2"
                        >
                            <ArrowRight size={14} className="rotate-180" />
                            Back to main website
                        </Link>
                    </div>

                    <p className="text-center text-caption text-dark-600">
                        Authorized personnel only. All access is logged.
                    </p>
                </motion.div>
            </div>
        </div>
    )
}