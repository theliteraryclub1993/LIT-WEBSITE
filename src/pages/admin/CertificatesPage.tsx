import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Download, Plus, Award as AwardIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button, Select, PageLoader, EmptyState, Badge } from '@/components/ui'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store'
import { jsPDF } from 'jspdf'
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
    certificates: {
        id: string
        certificate_number: string
        template_type: string
        pdf_url: string | null
    }[] | null
}

export function CertificatesPage() {
    const queryClient = useQueryClient()
    const user = useAuthStore(s => s.user)
    const [selectedEventId, setSelectedEventId] = useState<string>('')
    const [templateType, setTemplateType] = useState<'participation' | 'winner' | 'special' | 'volunteer'>('participation')

    // Fetch active events
    const { data: events } = useQuery<EventItem[]>({
        queryKey: ['admin-certificates-events'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('events')
                .select('id, title, date')
                .eq('status', 'completed') // Only events that are completed

            if (error) {
                // Fallback to all published events if no completed events exist
                const { data: fallbackData, error: fallbackError } = await supabase
                    .from('events')
                    .select('id, title, date')
                    .eq('status', 'published')
                
                if (fallbackError) throw fallbackError
                return fallbackData as EventItem[]
            }
            return data as EventItem[]
        },
    })

    // Fetch participants who attended the selected event
    const { data: attendees, isLoading: isAttendeesLoading } = useQuery<ParticipantItem[]>({
        queryKey: ['admin-certificates-attendees', selectedEventId],
        queryFn: async () => {
            if (!selectedEventId) return []
            const { data, error } = await supabase
                .from('participants')
                .select('id, name, email, college, attended, certificates(id, certificate_number, template_type, pdf_url)')
                .eq('event_id', selectedEventId)
                .eq('attended', true)

            if (error) throw error
            return data as unknown as ParticipantItem[]
        },
        enabled: !!selectedEventId,
    })

    // Helper: Generate PDF on client using jsPDF
    const generatePDF = (participantName: string, eventTitle: string, certificateNumber: string, _type: string) => {
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [800, 560]
        })

        // Draw Premium Theme Background (Black, Metallic Silver border, Neon Orange accent)
        doc.setFillColor(10, 10, 10) // Near black
        doc.rect(0, 0, 800, 560, 'F')

        // Outer Metallic Silver border
        doc.setDrawColor(180, 180, 180)
        doc.setLineWidth(6)
        doc.rect(20, 20, 760, 520, 'D')

        // Inner Orange Accent border
        doc.setDrawColor(255, 90, 0) // Neon Orange
        doc.setLineWidth(2)
        doc.rect(28, 28, 744, 504, 'D')

        // Header Title
        doc.setTextColor(255, 90, 0)
        doc.setFont('Helvetica', 'bold')
        doc.setFontSize(28)
        doc.text('THE LITERARY CLUB', 400, 90, { align: 'center' })

        doc.setTextColor(200, 200, 200)
        doc.setFont('Helvetica', 'normal')
        doc.setFontSize(14)
        doc.text('WHERE WORDS COME ALIVE', 400, 115, { align: 'center' })

        // Main Award Text
        doc.setTextColor(255, 255, 255)
        doc.setFont('Helvetica', 'bold')
        doc.setFontSize(36)
        doc.text('CERTIFICATE OF ACCOMPLISHMENT', 400, 190, { align: 'center' })

        doc.setTextColor(180, 180, 180)
        doc.setFont('Helvetica', 'italic')
        doc.setFontSize(16)
        doc.text('This is proudly presented to', 400, 240, { align: 'center' })

        // Participant Name
        doc.setTextColor(255, 255, 255)
        doc.setFont('Helvetica', 'bold')
        doc.setFontSize(32)
        doc.text(participantName.toUpperCase(), 400, 290, { align: 'center' })

        // Event text
        doc.setTextColor(180, 180, 180)
        doc.setFont('Helvetica', 'normal')
        doc.setFontSize(16)
        doc.text(`for active participation in the event`, 400, 340, { align: 'center' })

        doc.setTextColor(255, 90, 0)
        doc.setFont('Helvetica', 'bold')
        doc.setFontSize(20)
        doc.text(`"${eventTitle.toUpperCase()}"`, 400, 375, { align: 'center' })

        // Footer lines / Certificate Meta
        doc.setTextColor(130, 130, 130)
        doc.setFont('Helvetica', 'normal')
        doc.setFontSize(11)
        doc.text(`Certificate Number: ${certificateNumber}`, 60, 480)
        doc.text(`Issued Date: ${new Date().toLocaleDateString()}`, 60, 495)

        // Signatures
        doc.setDrawColor(100, 100, 100)
        doc.setLineWidth(1)
        doc.line(560, 470, 720, 470)
        doc.setTextColor(180, 180, 180)
        doc.text('Club President', 640, 485, { align: 'center' })

        return doc
    }

    // Generate certificate mutation
    const generateCertificateMutation = useMutation({
        mutationFn: async ({ participant, event }: { participant: ParticipantItem; event: EventItem }) => {
            // Check if already has a certificate
            if (participant.certificates && participant.certificates.length > 0) {
                throw new Error('Certificate already issued for this participant.')
            }

            // Call database function or generate locally
            const year = new Date(event.date).getFullYear() || new Date().getFullYear()
            const { count: currentCount } = await supabase
                .from('certificates')
                .select('id', { count: 'exact', head: true })
                .eq('event_id', event.id)
            
            const count = (currentCount ?? 0) + 1
            const certNo = `LC-${year}-${String(count).padStart(5, '0')}`

            // Generate locally and simulate upload (save local link for demo consistency)
            const pdfDoc = generatePDF(participant.name, event.title, certNo, templateType)
            const pdfDataUri = pdfDoc.output('datauristring')

            // Save to database
            const { data, error } = await supabase
                .from('certificates')
                .insert({
                    participant_id: participant.id,
                    event_id: event.id,
                    template_type: templateType,
                    certificate_number: certNo,
                    pdf_url: pdfDataUri, // Embed Data URI directly in DB for seamless local downloads
                })
                .select()
                .single()

            if (error) throw error

            // Update participant table to link certificate
            await supabase
                .from('participants')
                .update({ certificate_id: data.id })
                .eq('id', participant.id)

            // Log activity
            await logActivity({
                userId: user?.id,
                action: LOG_ACTIONS.CERTIFICATE_GENERATE,
                entityType: ENTITY_TYPES.CERTIFICATE,
                entityId: data.id,
                details: { title: `Certificate issued for ${participant.name}` },
            })

            return data
        },
        onSuccess: () => {
            toast.success('Certificate generated successfully!')
            queryClient.invalidateQueries({ queryKey: ['admin-certificates-attendees', selectedEventId] })
        },
        onError: (err) => {
            toast.error(err.message || 'Failed to generate certificate')
        }
    })

    const handleDownload = (participantName: string, eventTitle: string, certificateNo: string, pdfUrl: string | null) => {
        if (pdfUrl && pdfUrl.startsWith('data:application/pdf')) {
            const link = document.createElement('a')
            link.href = pdfUrl
            link.download = `${participantName.replace(/\s+/g, '_')}_Certificate.pdf`
            link.click()
            
            // Log download activity
            logActivity({
                userId: user?.id,
                action: LOG_ACTIONS.CERTIFICATE_DOWNLOAD,
                entityType: ENTITY_TYPES.CERTIFICATE,
                details: { title: `Downloaded certificate ${certificateNo}` },
            })
        } else {
            // Re-generate client-side on-the-fly if empty
            const doc = generatePDF(participantName, eventTitle, certificateNo, templateType)
            doc.save(`${participantName.replace(/\s+/g, '_')}_Certificate.pdf`)
        }
    }

    const currentEvent = events?.find(e => e.id === selectedEventId)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-h2 text-white font-semibold">Certificate System</h1>
                <p className="text-body-sm text-dark-400 mt-1">Issue achievement and participation credentials to attendees.</p>
            </div>

            {/* Config & Select */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-dark-900 border border-dark-800 p-5 rounded-xl">
                <div className="md:col-span-2">
                    <Select
                        label="Select Completed Event"
                        placeholder="Choose a completed event..."
                        value={selectedEventId}
                        onChange={(e) => setSelectedEventId(e.target.value)}
                        options={events?.map(e => ({ label: `${e.title} (${e.date})`, value: e.id })) || []}
                    />
                </div>

                <div>
                    <Select
                        label="Certificate Template"
                        value={templateType}
                        onChange={(e) => setTemplateType(e.target.value as any)}
                        options={[
                            { label: 'Participation Certificate', value: 'participation' },
                            { label: 'Winner Certificate', value: 'winner' },
                            { label: 'Volunteer Certificate', value: 'volunteer' },
                            { label: 'Special Mention Certificate', value: 'special' },
                        ]}
                    />
                </div>
            </div>

            {/* List Attendees */}
            {selectedEventId ? (
                isAttendeesLoading ? (
                    <PageLoader label="Fetching attendees list..." />
                ) : !attendees?.length ? (
                    <EmptyState
                        icon={<AwardIcon size={48} strokeWidth={1.5} />}
                        title="No verified attendees"
                        description="There are no participants marked as 'Attended' for this event. Verify attendance first."
                    />
                ) : (
                    <div className="bg-dark-900 border border-dark-800 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-dark-800 bg-dark-950/50">
                                        <th className="px-5 py-3.5 text-label text-dark-400">Attendee</th>
                                        <th className="px-5 py-3.5 text-label text-dark-400">Email</th>
                                        <th className="px-5 py-3.5 text-label text-dark-400">Issued Certificate</th>
                                        <th className="px-5 py-3.5 text-label text-dark-400 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-dark-800">
                                    {attendees.map((att) => {
                                        const cert = att.certificates?.[0]
                                        return (
                                            <tr key={att.id} className="hover:bg-dark-850/50 transition-colors">
                                                <td className="px-5 py-4 font-semibold text-white">
                                                    {att.name}
                                                </td>
                                                <td className="px-5 py-4 text-body-sm text-dark-300">
                                                    {att.email}
                                                </td>
                                                <td className="px-5 py-4">
                                                    {cert ? (
                                                        <div className="flex flex-col">
                                                            <Badge variant="success" size="sm" className="w-fit">Issued</Badge>
                                                            <span className="text-caption font-mono text-dark-500 mt-1">{cert.certificate_number}</span>
                                                        </div>
                                                    ) : (
                                                        <Badge variant="default" size="sm" className="bg-dark-800 text-dark-550 border-dark-700 w-fit">Not Issued</Badge>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    {cert ? (
                                                        <Button
                                                            variant="outline"
                                                            size="xs"
                                                            leftIcon={<Download size={12} />}
                                                            onClick={() => handleDownload(att.name, currentEvent?.title || 'Event', cert.certificate_number, cert.pdf_url)}
                                                        >
                                                            Download PDF
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            variant="primary"
                                                            size="xs"
                                                            leftIcon={<Plus size={12} />}
                                                            onClick={() => generateCertificateMutation.mutate({ participant: att, event: currentEvent! })}
                                                            isLoading={generateCertificateMutation.isPending && generateCertificateMutation.variables?.participant.id === att.id}
                                                        >
                                                            Generate
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            ) : (
                <EmptyState
                    icon={<AwardIcon size={48} strokeWidth={1.5} />}
                    title="Select a completed event"
                    description="Choose an event from the dropdown to list verified attendees and issue certificates."
                />
            )}
        </div>
    )
}
