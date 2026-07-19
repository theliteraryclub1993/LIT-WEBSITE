import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Search, QrCode, ShieldCheck, UserCheck } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button, Input, Select, PageLoader, EmptyState, Badge } from '@/components/ui'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store'
import QRCode from 'qrcode'
import { logActivity, LOG_ACTIONS, ENTITY_TYPES } from '@/services/activityLogService'

interface EventItem {
    id: string
    title: string
    date: string
}

interface ParticipantItem {
    id: string
    name: string
    email: string
    college: string | null
    attended: boolean
}

export function AttendancePage() {
    const queryClient = useQueryClient()
    const user = useAuthStore(s => s.user)

    const [selectedEventId, setSelectedEventId] = useState<string>('')
    const [searchQuery, setSearchQuery] = useState('')
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
    const [isQrModalOpen, setIsQrModalOpen] = useState(false)
    const [scanInput, setScanInput] = useState('')

    // Fetch active events
    const { data: events } = useQuery<EventItem[]>({
        queryKey: ['admin-attendance-events'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('events')
                .select('id, title, date')
                .order('date', { ascending: false })

            if (error) throw error
            return data as EventItem[]
        },
    })

    // Fetch participants for selected event
    const { data: participants, isLoading: isParticipantsLoading } = useQuery<ParticipantItem[]>({
        queryKey: ['admin-attendance-participants', selectedEventId],
        queryFn: async () => {
            if (!selectedEventId) return []
            const { data, error } = await supabase
                .from('participants')
                .select('id, name, email, college, attended')
                .eq('event_id', selectedEventId)
                .order('name', { ascending: true })

            if (error) throw error
            return data as ParticipantItem[]
        },
        enabled: !!selectedEventId,
    })

    // Manual toggle attendance mutation
    const toggleAttendanceMutation = useMutation({
        mutationFn: async ({ participantId, attended }: { participantId: string; attended: boolean }) => {
            // Update participant table
            const { error: partError } = await supabase
                .from('participants')
                .update({ attended })
                .eq('id', participantId)

            if (partError) throw partError

            if (attended) {
                // Insert into attendance_records
                const { error: attError } = await supabase
                    .from('attendance_records')
                    .insert({
                        event_id: selectedEventId,
                        participant_id: participantId,
                        method: 'manual',
                        verified_by: user?.id || null,
                    })

                if (attError && attError.code !== '23505') throw attError // Ignore duplicate key errors
            } else {
                // Delete from attendance_records
                const { error: attError } = await supabase
                    .from('attendance_records')
                    .delete()
                    .eq('event_id', selectedEventId)
                    .eq('participant_id', participantId)

                if (attError) throw attError
            }

            // Log activity
            await logActivity({
                userId: user?.id,
                action: LOG_ACTIONS.PARTICIPANT_CHECK_IN,
                entityType: ENTITY_TYPES.ATTENDANCE,
                entityId: participantId,
                details: { title: `Participant ${attended ? 'Checked In' : 'Checked Out'}` },
            })
        },
        onSuccess: () => {
            toast.success('Attendance updated successfully!')
            queryClient.invalidateQueries({ queryKey: ['admin-attendance-participants', selectedEventId] })
        },
        onError: (err) => {
            toast.error(err.message || 'Failed to update attendance')
        }
    })

    // QR Code Generation
    const generateEventQr = async (eventId: string) => {
        try {
            const checkInUrl = `${window.location.origin}/checkin?event_id=${eventId}`
            const qrUrl = await QRCode.toDataURL(checkInUrl, {
                width: 300,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF',
                }
            })
            setQrCodeUrl(qrUrl)
            setIsQrModalOpen(true)
        } catch (err) {
            console.error(err)
            toast.error('Failed to generate QR Code')
        }
    }

    // Handle scan check-in
    const handleScanCheckIn = async (e: React.FormEvent) => {
        e.preventDefault()
        const scannedId = scanInput.trim()
        if (!scannedId) return

        // Find participant in the list
        const match = participants?.find(p => p.id === scannedId || p.email.toLowerCase() === scannedId.toLowerCase())
        if (!match) {
            toast.error('No matching participant found for this ID or email.')
            return
        }

        if (match.attended) {
            toast.error(`${match.name} is already checked in.`)
            setScanInput('')
            return
        }

        await toggleAttendanceMutation.mutateAsync({ participantId: match.id, attended: true })
        toast.success(`Checked in ${match.name}!`)
        setScanInput('')
    }

    const filteredParticipants = participants?.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.college && p.college.toLowerCase().includes(searchQuery.toLowerCase()))
    ) || []

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-h2 text-white font-semibold">Attendance Manager</h1>
                    <p className="text-body-sm text-dark-400 mt-1">Track event registrations and check in attendees in real-time.</p>
                </div>
                {selectedEventId && (
                    <Button variant="outline" size="sm" onClick={() => generateEventQr(selectedEventId)} leftIcon={<QrCode size={16} />}>
                        Generate Event QR Code
                    </Button>
                )}
            </div>

            {/* Select Event */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-dark-900 border border-dark-800 p-5 rounded-xl">
                <div className="md:col-span-2">
                    <Select
                        label="Select Event"
                        placeholder="Choose an event to manage attendance"
                        value={selectedEventId}
                        onChange={(e) => {
                            setSelectedEventId(e.target.value)
                            setSearchQuery('')
                        }}
                        options={events?.map(e => ({ label: `${e.title} (${e.date})`, value: e.id })) || []}
                    />
                </div>

                {selectedEventId && (
                    <form onSubmit={handleScanCheckIn} className="flex flex-col justify-end">
                        <Input
                            label="Check-In Scanner Simulator"
                            placeholder="Paste Participant ID or Email..."
                            value={scanInput}
                            onChange={(e) => setScanInput(e.target.value)}
                        />
                    </form>
                )}
            </div>

            {/* Selected Event Details & Attendance Sheet */}
            {selectedEventId ? (
                isParticipantsLoading ? (
                    <PageLoader label="Loading participants sheet..." />
                ) : (
                    <div className="space-y-4">
                        {/* Summary & Filters */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-dark-900 border border-dark-800 px-5 py-3 rounded-xl">
                            <div className="flex items-center gap-4">
                                <div className="text-caption text-dark-400">
                                    Total Registrants: <span className="text-white font-semibold">{participants?.length ?? 0}</span>
                                </div>
                                <div className="text-caption text-dark-400">
                                    Checked In: <span className="text-success-light font-semibold">{participants?.filter(p => p.attended).length ?? 0}</span>
                                </div>
                            </div>
                            <div className="w-full sm:max-w-xs">
                                <Input
                                    placeholder="Search by name or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    leftIcon={<Search size={14} />}
                                    size="sm"
                                />
                            </div>
                        </div>

                        {/* Attendance Table */}
                        {!filteredParticipants.length ? (
                            <EmptyState
                                icon={<UserCheck size={48} strokeWidth={1.5} />}
                                title="No participants found"
                                description="No registrations match your filter query."
                            />
                        ) : (
                            <div className="bg-dark-900 border border-dark-800 rounded-xl overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-dark-800 bg-dark-950/50">
                                                <th className="px-5 py-3.5 text-label text-dark-400">Participant Info</th>
                                                <th className="px-5 py-3.5 text-label text-dark-400">College / Inst.</th>
                                                <th className="px-5 py-3.5 text-label text-dark-400">Unique Code</th>
                                                <th className="px-5 py-3.5 text-label text-dark-400">Status</th>
                                                <th className="px-5 py-3.5 text-label text-dark-400 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-dark-800">
                                            {filteredParticipants.map((p) => (
                                                <tr key={p.id} className="hover:bg-dark-850/50 transition-colors">
                                                    <td className="px-5 py-4">
                                                        <div className="font-semibold text-white">{p.name}</div>
                                                        <div className="text-caption text-dark-500">{p.email}</div>
                                                    </td>
                                                    <td className="px-5 py-4 text-body-sm text-dark-300">
                                                        {p.college || '—'}
                                                    </td>
                                                    <td className="px-5 py-4 text-caption font-mono text-dark-400">
                                                        {p.id}
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        {p.attended ? (
                                                            <Badge variant="success" size="sm">Checked In</Badge>
                                                        ) : (
                                                            <Badge variant="default" size="sm" className="bg-dark-800 text-dark-500 border-dark-700">Absent</Badge>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-4 text-right">
                                                        <Button
                                                            variant={p.attended ? 'outline' : 'primary'}
                                                            size="xs"
                                                            onClick={() => toggleAttendanceMutation.mutate({ participantId: p.id, attended: !p.attended })}
                                                            isLoading={toggleAttendanceMutation.isPending && toggleAttendanceMutation.variables?.participantId === p.id}
                                                        >
                                                            {p.attended ? 'Mark Absent' : 'Check In'}
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )
            ) : (
                <EmptyState
                    icon={<ShieldCheck size={48} strokeWidth={1.5} />}
                    title="No event selected"
                    description="Choose an event from the dropdown filter above to manage check-ins."
                />
            )}

            {/* QR Code Presentation Modal */}
            {isQrModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
                    <div className="bg-dark-900 border border-dark-800 rounded-2xl max-w-sm w-full p-6 text-center space-y-4">
                        <div className="flex items-center justify-between border-b border-dark-800 pb-3">
                            <h3 className="text-h5 text-white font-semibold">Event Check-In QR</h3>
                            <button onClick={() => setIsQrModalOpen(false)} className="text-dark-500 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="flex justify-center p-4 bg-white rounded-xl">
                            <img src={qrCodeUrl} alt="Check-in QR Code" className="max-w-[240px] w-full" />
                        </div>

                        <p className="text-caption text-dark-400">
                            Display this QR code at the registration desk. Members can scan it with their phone camera to open the check-in portal.
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
