import { useQuery } from '@tanstack/react-query'
import { Calendar, Users, BookOpen, Mic, RefreshCw, Image as ImageIcon, Award, CheckSquare, Settings, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store'
import { StatCard, PageLoader, Button } from '@/components/ui'
import { formatDistanceToNow } from 'date-fns'

interface ActivityLog {
    id: string
    created_at: string
    action: string
    entity_type: string
    details: {
        title?: string
        name?: string
        [key: string]: any
    } | null
    profiles: {
        full_name: string | null
    } | null
}

export function DashboardPage() {
    const user = useAuthStore(s => s.user)

    // Fetch metrics
    const { data: metrics, isLoading: isMetricsLoading, refetch: refetchMetrics } = useQuery({
        queryKey: ['admin-dashboard-metrics'],
        queryFn: async () => {
            const [eventsRes, participantsRes, teamRes, applicationsRes] = await Promise.all([
                supabase.from('events').select('id', { count: 'exact', head: true }),
                supabase.from('participants').select('id', { count: 'exact', head: true }),
                supabase.from('team_members').select('id', { count: 'exact', head: true }),
                supabase.from('audition_applications').select('id', { count: 'exact', head: true }),
            ])

            return {
                events: eventsRes.count ?? 0,
                participants: participantsRes.count ?? 0,
                team: teamRes.count ?? 0,
                applications: applicationsRes.count ?? 0,
            }
        },
    })

    // Fetch recent activity logs
    const { data: activities, isLoading: isLogsLoading, refetch: refetchLogs } = useQuery<ActivityLog[]>({
        queryKey: ['admin-dashboard-logs'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('activity_logs')
                .select('id, created_at, action, entity_type, details, profiles(full_name)')
                .order('created_at', { ascending: false })
                .limit(8)

            if (error) throw error
            return data as unknown as ActivityLog[]
        },
    })

    const handleRefresh = () => {
        refetchMetrics()
        refetchLogs()
    }

    if (isMetricsLoading || isLogsLoading) {
        return <PageLoader label="Loading dashboard metrics..." />
    }

    // Helper to format log action descriptions
    const formatLogAction = (log: ActivityLog) => {
        const userName = log.profiles?.full_name || 'System'
        const entityName = log.details?.title || log.details?.name || 'an item'
        
        switch (log.action) {
            case 'auth.login': return `${userName} logged in`
            case 'event.create': return `${userName} created event "${entityName}"`
            case 'event.update': return `${userName} updated event "${entityName}"`
            case 'event.delete': return `${userName} deleted event "${entityName}"`
            case 'event.publish': return `${userName} published event "${entityName}"`
            case 'participant.register': return `New registration for "${entityName}"`
            case 'participant.check_in': return `Checked in participant for "${entityName}"`
            case 'audition.create': return `${userName} created audition cycle`
            case 'audition.apply': return `New audition application received from "${entityName}"`
            case 'audition.review': return `${userName} reviewed audition application for "${entityName}"`
            case 'team.create': return `${userName} added team member "${entityName}"`
            case 'team.update': return `${userName} updated team member "${entityName}"`
            case 'team.delete': return `${userName} removed team member "${entityName}"`
            case 'post.create': return `${userName} created draft post "${entityName}"`
            case 'post.publish': return `${userName} published post "${entityName}"`
            default: return `${userName} performed ${log.action} on ${log.entity_type}`
        }
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-h2 text-white">Dashboard Overview</h1>
                    <p className="text-body-sm text-dark-400 mt-1">Welcome back, {user?.full_name || 'Admin'}. Here is your site overview.</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleRefresh} leftIcon={<RefreshCw size={14} />}>
                    Refresh Data
                </Button>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    label="Active Events"
                    value={metrics?.events ?? 0}
                    icon={<Calendar size={20} />}
                    variant="orange"
                />
                <StatCard
                    label="Event Registrations"
                    value={metrics?.participants ?? 0}
                    icon={<Users size={20} />}
                    variant="default"
                />
                <StatCard
                    label="Audition Applicants"
                    value={metrics?.applications ?? 0}
                    icon={<Mic size={20} />}
                    variant="orange"
                />
                <StatCard
                    label="Team Members"
                    value={metrics?.team ?? 0}
                    icon={<Users size={20} />}
                    variant="default"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Activity Feed */}
                <div className="lg:col-span-2 bg-dark-900 border border-dark-800 rounded-xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-dark-800 flex items-center justify-between">
                        <h3 className="text-h5 text-white">Recent Activity Log</h3>
                        <span className="text-caption text-dark-500">Real-time audit log</span>
                    </div>
                    <div className="divide-y divide-dark-800">
                        {activities && activities.length > 0 ? (
                            activities.map((log) => (
                                <div key={log.id} className="p-5 flex items-start justify-between gap-4 hover:bg-dark-850/50 transition-colors">
                                    <div className="space-y-1">
                                        <p className="text-body-sm text-white">{formatLogAction(log)}</p>
                                        <p className="text-caption text-dark-500 uppercase tracking-wider">{log.entity_type}</p>
                                    </div>
                                    <span className="text-caption text-dark-455 shrink-0 whitespace-nowrap">
                                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-dark-550 italic">No recent activity logged.</div>
                        )}
                    </div>
                </div>

                {/* Quick Actions Panel */}
                <div className="space-y-6">
                    <div className="bg-dark-900 border border-dark-800 rounded-xl p-5 space-y-4">
                        <h3 className="text-h5 text-white">Quick Management</h3>
                        <div className="grid grid-cols-1 gap-2">
                            <Link to="/admin/events" className="flex items-center justify-between p-3 rounded-lg border border-dark-800 bg-dark-950 hover:bg-dark-800 hover:border-dark-600 transition-all group">
                                <div className="flex items-center gap-3">
                                    <Calendar className="text-orange-primary" size={18} />
                                    <span className="text-body-sm text-white">Manage Events</span>
                                </div>
                                <ArrowRight className="text-dark-500 group-hover:text-white transition-colors" size={14} />
                            </Link>

                            <Link to="/admin/auditions" className="flex items-center justify-between p-3 rounded-lg border border-dark-800 bg-dark-950 hover:bg-dark-800 hover:border-dark-600 transition-all group">
                                <div className="flex items-center gap-3">
                                    <Mic className="text-orange-primary" size={18} />
                                    <span className="text-body-sm text-white">Auditions Cycles</span>
                                </div>
                                <ArrowRight className="text-dark-500 group-hover:text-white transition-colors" size={14} />
                            </Link>

                            <Link to="/admin/team" className="flex items-center justify-between p-3 rounded-lg border border-dark-800 bg-dark-950 hover:bg-dark-800 hover:border-dark-600 transition-all group">
                                <div className="flex items-center gap-3">
                                    <Users className="text-orange-primary" size={18} />
                                    <span className="text-body-sm text-white">Team Members</span>
                                </div>
                                <ArrowRight className="text-dark-500 group-hover:text-white transition-colors" size={14} />
                            </Link>

                            <Link to="/admin/noesis" className="flex items-center justify-between p-3 rounded-lg border border-dark-800 bg-dark-950 hover:bg-dark-800 hover:border-dark-600 transition-all group">
                                <div className="flex items-center gap-3">
                                    <BookOpen className="text-orange-primary" size={18} />
                                    <span className="text-body-sm text-white">Noesis E-Magazine</span>
                                </div>
                                <ArrowRight className="text-dark-500 group-hover:text-white transition-colors" size={14} />
                            </Link>
                        </div>
                    </div>

                    {/* Operational Actions */}
                    <div className="bg-dark-900 border border-dark-800 rounded-xl p-5 space-y-4">
                        <h3 className="text-h5 text-white font-semibold">Club Operations</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <Link to="/admin/attendance" className="flex flex-col items-center justify-center p-4 rounded-lg bg-dark-950 hover:bg-dark-800 border border-dark-800 transition-colors text-center gap-2">
                                <CheckSquare className="text-orange-primary" size={20} />
                                <span className="text-caption text-white font-semibold">Attendance</span>
                            </Link>
                            <Link to="/admin/certificates" className="flex flex-col items-center justify-center p-4 rounded-lg bg-dark-950 hover:bg-dark-800 border border-dark-800 transition-colors text-center gap-2">
                                <Award className="text-orange-primary" size={20} />
                                <span className="text-caption text-white font-semibold">Certificates</span>
                            </Link>
                            <Link to="/admin/gallery" className="flex flex-col items-center justify-center p-4 rounded-lg bg-dark-950 hover:bg-dark-800 border border-dark-800 transition-colors text-center gap-2">
                                <ImageIcon className="text-orange-primary" size={20} />
                                <span className="text-caption text-white font-semibold">Gallery CMS</span>
                            </Link>
                            <Link to="/admin/settings" className="flex flex-col items-center justify-center p-4 rounded-lg bg-dark-950 hover:bg-dark-800 border border-dark-800 transition-colors text-center gap-2">
                                <Settings className="text-orange-primary" size={20} />
                                <span className="text-caption text-white font-semibold">Settings</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
