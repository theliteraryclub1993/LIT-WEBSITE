import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Download, CheckCircle, XCircle, Award, Search } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { queryKeyFactory } from '@/lib/queryClient'
import { Button, Input, PageLoader, EmptyState, Card } from '@/components/ui'
import { formatDate } from '@/utils/formatDate'
import toast from 'react-hot-toast'
import type { Participant } from '@/types'
import Papa from 'papaparse'

export function EventParticipantsPage() {
    const { eventId } = useParams<{ eventId: string }>()
    const queryClient = useQueryClient()

    const [search, setSearch] = useState('')

    // Fetch Event Details
    const { data: event, isLoading: eventLoading } = useQuery({
        queryKey: queryKeyFactory.events.detail(eventId || ''),
        queryFn: async () => {
            const { data, error } = await supabase.from('events').select('*').eq('id', eventId).single()
            if (error) throw error
            return data
        },
        enabled: !!eventId,
    })

    // Fetch Participants
    const { data: participants, isLoading: pLoading } = useQuery({
        queryKey: ['participants', 'event', eventId, search],
        queryFn: async () => {
            let query = supabase
                .from('participants')
                .select('*')
                .eq('event_id', eventId)
                .order('registered_at', { ascending: false })

            if (search) {
                query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,college.ilike.%${search}%`)
            }

            const { data, error } = await query
            if (error) throw error
            return data as Participant[]
        },
        enabled: !!eventId,
    })

    // Toggle Attendance Mutation
    const toggleAttendance = useMutation({
        mutationFn: async ({ id, attended }: { id: string; attended: boolean }) => {
            const { error } = await supabase.from('participants').update({ attended }).eq('id', id)
            if (error) throw error
        },
        onSuccess: () => {
            toast.success('Attendance updated.')
            queryClient.invalidateQueries({ queryKey: ['participants', 'event', eventId] })
        },
        onError: (err) => toast.error(err.message),
    })

    // Export to CSV
    const handleExport = () => {
        if (!participants || !participants.length) return

        const exportData = participants.map(p => ({
            Name: p.name,
            Email: p.email,
            Phone: p.phone || '',
            College: p.college || '',
            Attended: p.attended ? 'Yes' : 'No',
            'Registered At': formatDate(p.registered_at),
            ...p.custom_data as Record<string, unknown>,
        }))

        const csv = Papa.unparse(exportData)
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${event?.title || 'event'}-participants.csv`
        link.click()
        URL.revokeObjectURL(url)
        toast.success('CSV downloaded.')
    }

    const isLoading = eventLoading || pLoading

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                    <Link to="/admin/events" className="inline-flex items-center gap-2 text-body-sm text-dark-400 hover:text-white transition-colors mb-2">
                        <ArrowLeft size={16} /> Back to Events
                    </Link>
                    <h1 className="text-h2 text-white">{event?.title || 'Loading...'}</h1>
                    <p className="text-body-sm text-dark-400 mt-1">
                        {participants?.length || 0} registered
                        {event?.max_participants ? ` / ${event.max_participants} max` : ''}
                    </p>
                </div>
                <Button variant="outline" leftIcon={<Download size={16} />} onClick={handleExport} disabled={!participants?.length}>
                    Export CSV
                </Button>
            </div>

            {/* Search */}
            <div className="max-w-xs">
                <Input placeholder="Search participants..." value={search} onChange={(e) => setSearch(e.target.value)} leftIcon={<Search size={16} />} />
            </div>

            {/* List */}
            {isLoading ? <PageLoader /> : !participants?.length ? (
                <EmptyState title="No participants yet" description="Registrations will appear here once people sign up." />
            ) : (
                <div className="space-y-2">
                    {participants.map(p => (
                        <Card key={p.id} variant="bordered" padding="none">
                            <div className="flex items-center gap-4 p-4">
                                <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4 items-center">
                                    <div>
                                        <p className="text-body-sm text-white font-medium truncate">{p.name}</p>
                                        <p className="text-caption text-dark-500 truncate">{p.email}</p>
                                    </div>
                                    <p className="text-body-sm text-dark-400 truncate hidden md:block">{p.phone || '—'}</p>
                                    <p className="text-body-sm text-dark-400 truncate hidden md:block">{p.college || '—'}</p>
                                    <div className="flex items-center gap-3">
                                        <span className="text-caption text-dark-500">{formatDate(p.registered_at, 'MMM d')}</span>
                                        {p.certificate_id && <Award size={14} className="text-silver-primary" />}
                                    </div>
                                </div>

                                <button
                                    onClick={() => toggleAttendance.mutate({ id: p.id, attended: !p.attended })}
                                    className={`p-2 rounded-lg transition-colors shrink-0 ${p.attended
                                            ? 'bg-success-subtle text-success-light hover:bg-success/20'
                                            : 'bg-dark-800 text-dark-500 hover:text-white hover:bg-dark-700'
                                        }`}
                                    title={p.attended ? 'Mark as absent' : 'Mark as present'}
                                >
                                    {p.attended ? <CheckCircle size={20} /> : <XCircle size={20} />}
                                </button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}