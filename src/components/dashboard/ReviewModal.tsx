import { useState } from 'react'
import { Modal, Textarea, Select, Button } from '@/components/ui'
import type { AuditionApplication, ApplicationStatus } from '@/types'
import { APPLICATION_STATUS_LABELS } from '@/utils/constants'
import { User, Mail, Phone, GraduationCap, Briefcase, ExternalLink } from 'lucide-react'

interface ReviewModalProps {
    application: AuditionApplication | null
    isOpen: boolean
    onClose: () => void
    onReview: (id: string, status: ApplicationStatus, notes: string) => Promise<void>
    isLoading?: boolean
}

/**
 * Modal for reviewing a single audition application.
 * Shows applicant info and provides status + notes form.
 */
export function ReviewModal({ application, isOpen, onClose, onReview, isLoading }: ReviewModalProps) {
    const [status, setStatus] = useState<ApplicationStatus>('pending')
    const [notes, setNotes] = useState('')

    // Reset form when application changes
    useState(() => {
        if (application) {
            setStatus(application.status)
            setNotes(application.notes || '')
        }
    })

    if (!application) return null

    const handleSubmit = async () => {
        await onReview(application.id, status, notes)
    }

    const statusOptions = [
        { label: APPLICATION_STATUS_LABELS.pending || '', value: 'pending' },
        { label: APPLICATION_STATUS_LABELS.shortlisted || '', value: 'shortlisted' },
        { label: APPLICATION_STATUS_LABELS.selected || '', value: 'selected' },
        { label: APPLICATION_STATUS_LABELS.rejected || '', value: 'rejected' },
    ]

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Review Application"
            subtitle={application.name}
            size="md"
        >
            {/* Applicant Info */}
            <div className="bg-dark-950 border border-dark-800 rounded-lg p-4 mb-6 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    <InfoItem icon={<User size={14} />} label="Name" value={application.name} />
                    <InfoItem icon={<Mail size={14} />} label="Email" value={application.email} />
                    <InfoItem icon={<Phone size={14} />} label="Phone" value={application.phone || '—'} />
                    <InfoItem icon={<GraduationCap size={14} />} label="College" value={application.college || '—'} />
                    <InfoItem icon={<Briefcase size={14} />} label="Year" value={application.year_of_study || '—'} />
                    {application.portfolio_url && (
                        <div className="col-span-2">
                            <a
                                href={application.portfolio_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-body-sm text-orange-primary hover:text-orange-light transition-colors"
                            >
                                <ExternalLink size={14} /> {application.portfolio_url}
                            </a>
                        </div>
                    )}
                </div>

                {application.experience && (
                    <div className="pt-2 border-t border-dark-800">
                        <p className="text-caption text-dark-500 mb-1">Experience</p>
                        <p className="text-body-sm text-dark-300 whitespace-pre-wrap">{application.experience}</p>
                    </div>
                )}

                <div className="flex items-center gap-3 pt-2 border-t border-dark-800">
                    <span className="text-caption text-dark-500">Applied:</span>
                    <span className="text-caption text-dark-300">{new Date(application.created_at).toLocaleString()}</span>
                    {application.reviewed_at && (
                        <>
                            <span className="text-caption text-dark-600">|</span>
                            <span className="text-caption text-dark-500">Reviewed: {new Date(application.reviewed_at).toLocaleString()}</span>
                        </>
                    )}
                </div>
            </div>

            {/* Review Form */}
            <div className="space-y-4">
                <Select
                    label="Decision *"
                    options={statusOptions}
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                />

                <Textarea
                    label="Internal Notes"
                    placeholder="Add evaluation notes (only visible to admins)..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    showCount
                    maxLength={500}
                    currentLength={notes.length}
                />

                <div className="flex justify-end gap-3 pt-4 border-t border-dark-800">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button
                        variant={status === 'rejected' ? 'danger' : status === 'selected' ? 'success' : 'primary'}
                        onClick={handleSubmit}
                        isLoading={isLoading}
                    >
                        {status === 'pending' ? 'Save Notes' : `Mark as ${APPLICATION_STATUS_LABELS[status]}`}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-start gap-2">
            <span className="text-dark-500 mt-0.5 shrink-0">{icon}</span>
            <div className="min-w-0">
                <p className="text-[10px] text-dark-600 uppercase tracking-widest">{label}</p>
                <p className="text-body-sm text-dark-200 truncate">{value}</p>
            </div>
        </div>
    )
}