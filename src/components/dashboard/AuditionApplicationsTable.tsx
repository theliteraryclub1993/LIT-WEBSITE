import { useState } from 'react'
import { Eye, CheckCircle, Star, Ban } from 'lucide-react'
import { Badge, Button, EmptyState, Input } from '@/components/ui'
import { APPLICATION_STATUS_LABELS } from '@/utils/constants'
import { statusColor } from '@/config/tailwindPlugin'
import { formatDate } from '@/utils/formatDate'
import type { AuditionApplication, ApplicationStatus } from '@/types'
import toast from 'react-hot-toast'

interface AuditionApplicationsTableProps {
    applications: AuditionApplication[]
    isLoading?: boolean
    onReview: (application: AuditionApplication) => void
    onBulkAction?: (ids: string[], status: ApplicationStatus) => Promise<void>
}

/**
 * Table for viewing and bulk-managing audition applications.
 */
export function AuditionApplicationsTable({
    applications,
    isLoading,
    onReview,
    onBulkAction,
}: AuditionApplicationsTableProps) {
    const [search, setSearch] = useState('')
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

    const filtered = applications.filter(app =>
        !search ||
        app.name.toLowerCase().includes(search.toLowerCase()) ||
        app.email.toLowerCase().includes(search.toLowerCase()) ||
        (app.college || '').toLowerCase().includes(search.toLowerCase())
    )

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const toggleSelectAll = () => {
        if (selectedIds.size === filtered.length) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(filtered.map(a => a.id)))
        }
    }

    const handleBulkAction = async (status: ApplicationStatus) => {
        if (!onBulkAction || selectedIds.size === 0) return
        await onBulkAction(Array.from(selectedIds), status)
        setSelectedIds(new Set())
        toast.success(`${selectedIds.size} applications marked as ${APPLICATION_STATUS_LABELS[status]}.`)
    }

    // Status summary counts
    const counts = applications.reduce<Record<string, number>>((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1
        return acc
    }, {})

    if (isLoading) return null

    return (
        <div className="space-y-4">
            {/* Stats Summary */}
            <div className="flex flex-wrap gap-4">
                <StatBadge count={applications.length} label="Total" color="dark" />
                <StatBadge count={counts['pending'] || 0} label="Pending" color="warning" />
                <StatBadge count={counts['shortlisted'] || 0} label="Shortlisted" color="info" />
                <StatBadge count={counts['selected'] || 0} label="Selected" color="success" />
                <StatBadge count={counts['rejected'] || 0} label="Rejected" color="error" />
            </div>

            {/* Search + Bulk Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 max-w-xs">
                    <Input
                        placeholder="Search applicants..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        leftIcon={<Eye size={14} />}
                        size="sm"
                    />
                </div>

                {selectedIds.size > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-caption text-dark-400">{selectedIds.size} selected</span>
                        <Button variant="outline" size="xs" leftIcon={<Star size={12} />} onClick={() => handleBulkAction('shortlisted')}>
                            Shortlist
                        </Button>
                        <Button variant="outline" size="xs" leftIcon={<CheckCircle size={12} />} onClick={() => handleBulkAction('selected')} className="text-success-light border-success-border hover:bg-success-subtle">
                            Select
                        </Button>
                        <Button variant="outline" size="xs" leftIcon={<Ban size={12} />} onClick={() => handleBulkAction('rejected')} className="text-error-light border-error-border hover:bg-error-subtle">
                            Reject
                        </Button>
                    </div>
                )}
            </div>

            {/* Table */}
            {!filtered.length ? (
                <EmptyState title="No applications found" />
            ) : (
                <div className="overflow-x-auto border border-dark-800 rounded-xl">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-dark-800 bg-dark-950">
                                <th className="px-4 py-3 w-10">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.size === filtered.length && filtered.length > 0}
                                        onChange={toggleSelectAll}
                                        className="w-4 h-4 rounded border-dark-600 bg-dark-800 text-orange-primary focus:ring-orange-primary/50 focus:ring-offset-0"
                                    />
                                </th>
                                <th className="px-4 py-3 text-label text-dark-500 uppercase tracking-widest">Applicant</th>
                                <th className="px-4 py-3 text-label text-dark-500 uppercase tracking-widest hidden md:table-cell">College</th>
                                <th className="px-4 py-3 text-label text-dark-500 uppercase tracking-widest hidden lg:table-cell">Applied</th>
                                <th className="px-4 py-3 text-label text-dark-500 uppercase tracking-widest">Status</th>
                                <th className="px-4 py-3 text-label text-dark-500 uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-800">
                            {filtered.map(app => {
                                const colors = statusColor(app.status)
                                const isSelected = selectedIds.has(app.id)
                                return (
                                    <tr key={app.id} className={`transition-colors ${isSelected ? 'bg-orange-subtle' : 'hover:bg-dark-900/50'}`}>
                                        <td className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggleSelect(app.id)}
                                                className="w-4 h-4 rounded border-dark-600 bg-dark-800 text-orange-primary focus:ring-orange-primary/50 focus:ring-offset-0"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-body-sm text-white font-medium">{app.name}</p>
                                            <p className="text-caption text-dark-500">{app.email}</p>
                                        </td>
                                        <td className="px-4 py-3 text-body-sm text-dark-400 hidden md:table-cell truncate max-w-[150px]">
                                            {app.college || '—'}
                                        </td>
                                        <td className="px-4 py-3 text-body-sm text-dark-500 hidden lg:table-cell whitespace-nowrap">
                                            {formatDate(app.created_at, 'MMM d, yyyy')}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant="default" size="sm" dot className={`${colors.bg} ${colors.text} ${colors.border}`}>
                                                {APPLICATION_STATUS_LABELS[app.status]}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Button variant="ghost" size="xs" onClick={() => onReview(app)}>
                                                Review
                                            </Button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

function StatBadge({ count, label, color }: { count: number; label: string; color: string }) {
    const colorMap: Record<string, string> = {
        dark: 'bg-dark-800 text-dark-300 border-dark-700',
        warning: 'bg-warning-subtle text-warning-light border-warning-border',
        info: 'bg-info-subtle text-info-light border-info-border',
        success: 'bg-success-subtle text-success-light border-success-border',
        error: 'bg-error-subtle text-error-light border-error-border',
    }

    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-body-sm ${colorMap[color] || colorMap.dark}`}>
            <span className="font-semibold tabular-nums">{count}</span>
            <span className="text-dark-400">{label}</span>
        </div>
    )
}