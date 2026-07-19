import { useState } from 'react'
import { MoreHorizontal, Pencil, Trash2, Users } from 'lucide-react'
import { Badge } from '@/components/ui'
import { statusColor } from '@/config/tailwindPlugin'
import { formatDate } from '@/utils/formatDate'
import type { AuditionCycleWithStats } from '@/types'

interface AuditionCycleTableProps {
    cycles: AuditionCycleWithStats[]
    onEdit: (cycle: AuditionCycleWithStats) => void
    onDelete: (cycle: AuditionCycleWithStats) => void
    onViewApplications: (cycle: AuditionCycleWithStats) => void
}

/**
 * Admin table for audition cycles with inline stats and actions.
 */
export function AuditionCycleTable({ cycles, onEdit, onDelete, onViewApplications }: AuditionCycleTableProps) {
    const [openMenuId, setOpenMenuId] = useState<string | null>(null)

    return (
        <div className="overflow-x-auto border border-dark-800 rounded-xl">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-dark-800 bg-dark-950">
                        <th className="px-4 py-3 text-label text-dark-500 uppercase tracking-widest">Cycle</th>
                        <th className="px-4 py-3 text-label text-dark-500 uppercase tracking-widest hidden md:table-cell">Position</th>
                        <th className="px-4 py-3 text-label text-dark-500 uppercase tracking-widest hidden lg:table-cell">Applications</th>
                        <th className="px-4 py-3 text-label text-dark-500 uppercase tracking-widest hidden lg:table-cell">Dates</th>
                        <th className="px-4 py-3 text-label text-dark-500 uppercase tracking-widest">Status</th>
                        <th className="px-4 py-3 text-label text-dark-500 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-dark-800">
                    {cycles.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-4 py-12 text-center text-dark-500 text-body-sm">
                                No audition cycles found.
                            </td>
                        </tr>
                    ) : (
                        cycles.map((cycle) => {
                            const colors = statusColor(cycle.status)
                            return (
                                <tr key={cycle.id} className="hover:bg-dark-900/50 transition-colors group">
                                    <td className="px-4 py-3">
                                        <p className="text-body-sm text-white font-medium">{cycle.title}</p>
                                        <p className="text-caption text-dark-500">ID: {cycle.id.slice(0, 8)}</p>
                                    </td>
                                    <td className="px-4 py-3 text-body-sm text-dark-300 hidden md:table-cell">
                                        {cycle.position}
                                    </td>
                                    <td className="px-4 py-3 hidden lg:table-cell">
                                        <div className="flex items-center gap-3">
                                            <span className="text-body-sm text-white tabular-nums">{cycle.application_count}</span>
                                            <div className="flex gap-1">
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-warning-subtle text-warning-light" title="Pending">
                                                    {cycle.pending_count}
                                                </span>
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-success-subtle text-success-light" title="Selected">
                                                    {cycle.selected_count}
                                                </span>
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-error-subtle text-error-light" title="Rejected">
                                                    {cycle.rejected_count}
                                                </span>
                                            </div>
                                        </div>
                                        {cycle.max_applicants && (
                                            <div className="mt-1.5 w-24 h-1.5 bg-dark-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-orange-primary rounded-full transition-all"
                                                    style={{ width: `${Math.min((cycle.application_count / cycle.max_applicants) * 100, 100)}%` }}
                                                />
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 hidden lg:table-cell">
                                        <p className="text-caption text-dark-400">{formatDate(cycle.open_date, 'MMM d')} – {formatDate(cycle.close_date, 'MMM d')}</p>
                                        {cycle.max_applicants && (
                                            <p className="text-caption text-dark-600">Max: {cycle.max_applicants}</p>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge variant="default" size="sm" dot className={`${colors.bg} ${colors.text} ${colors.border}`}>
                                            {cycle.status === 'in_review' ? 'Under Review' : cycle.status === 'results_out' ? 'Results Out' : cycle.status}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="relative inline-block">
                                            <button
                                                onClick={() => setOpenMenuId(openMenuId === cycle.id ? null : cycle.id)}
                                                className="p-1.5 rounded-md text-dark-400 hover:text-white hover:bg-dark-800 transition-colors"
                                            >
                                                <MoreHorizontal size={16} />
                                            </button>
                                            {openMenuId === cycle.id && (
                                                <>
                                                    <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                                                    <div className="absolute right-0 top-full mt-1 w-48 bg-dark-800 border border-dark-700 rounded-lg shadow-xl z-20 py-1 overflow-hidden">
                                                        <button
                                                            onClick={() => { onViewApplications(cycle); setOpenMenuId(null) }}
                                                            className="flex items-center gap-2 px-3 py-2 text-body-sm text-dark-300 hover:text-white hover:bg-dark-700 transition-colors w-full text-left"
                                                        >
                                                            <Users size={14} /> Applications
                                                        </button>
                                                        <button
                                                            onClick={() => { onEdit(cycle); setOpenMenuId(null) }}
                                                            className="flex items-center gap-2 px-3 py-2 text-body-sm text-dark-300 hover:text-white hover:bg-dark-700 transition-colors w-full text-left"
                                                        >
                                                            <Pencil size={14} /> Edit
                                                        </button>
                                                        <div className="h-px bg-dark-700 my-1" />
                                                        <button
                                                            onClick={() => { onDelete(cycle); setOpenMenuId(null) }}
                                                            className="flex items-center gap-2 px-3 py-2 text-body-sm text-error hover:bg-error/10 transition-colors w-full text-left"
                                                        >
                                                            <Trash2 size={14} /> Delete
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )
                        })
                    )}
                </tbody>
            </table>
        </div>
    )
}