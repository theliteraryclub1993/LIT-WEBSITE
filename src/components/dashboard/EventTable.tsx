import { Link } from 'react-router-dom'
import { MoreHorizontal, Eye, Pencil, Trash2, Users, Globe } from 'lucide-react'
import { Badge } from '@/components/ui'
import { statusColor } from '@/config/tailwindPlugin'
import { formatDate } from '@/utils/formatDate'
import type { Event } from '@/types'
import { useState } from 'react'

interface EventTableProps {
  events: Event[]
  onEdit: (event: Event) => void
  onDelete: (event: Event) => void
  onViewParticipants: (event: Event) => void
}

/**
 * Admin data table for events with inline actions.
 */
export function EventTable({ events, onEdit, onDelete, onViewParticipants }: EventTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  return (
    <div className="overflow-x-auto border border-dark-800 rounded-xl">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-dark-800 bg-dark-950">
            <th className="px-4 py-3 text-label text-dark-500 uppercase tracking-widest">Event</th>
            <th className="px-4 py-3 text-label text-dark-500 uppercase tracking-widest hidden md:table-cell">Date</th>
            <th className="px-4 py-3 text-label text-dark-500 uppercase tracking-widest hidden lg:table-cell">Venue</th>
            <th className="px-4 py-3 text-label text-dark-500 uppercase tracking-widest">Status</th>
            <th className="px-4 py-3 text-label text-dark-500 uppercase tracking-widest text-center">Featured</th>
            <th className="px-4 py-3 text-label text-dark-500 uppercase tracking-widest text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-dark-800">
          {events.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-12 text-center text-dark-500 text-body-sm">
                No events found.
              </td>
            </tr>
          ) : (
            events.map((event) => {
              const colors = statusColor(event.status)
              return (
                <tr key={event.id} className="hover:bg-dark-900/50 transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 shrink-0 rounded-md bg-dark-800 overflow-hidden">
                        {event.cover_image ? (
                          <img src={event.cover_image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-dark-600">
                            <Globe size={16} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-body-sm text-white font-medium truncate max-w-xs">{event.title}</p>
                        <p className="text-caption text-dark-500 truncate max-w-xs">{event.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-body-sm text-dark-300 hidden md:table-cell whitespace-nowrap">
                    {formatDate(event.date, 'MMM d, yyyy')}
                  </td>
                  <td className="px-4 py-3 text-body-sm text-dark-400 hidden lg:table-cell truncate max-w-[150px]">
                    {event.venue || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="default" size="sm" dot className={`${colors.bg} ${colors.text} ${colors.border}`}>
                      {event.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {event.is_featured ? (
                      <span className="inline-block w-2 h-2 rounded-full bg-orange-primary" />
                    ) : (
                      <span className="inline-block w-2 h-2 rounded-full bg-dark-700" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="relative inline-block">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === event.id ? null : event.id)}
                        className="p-1.5 rounded-md text-dark-400 hover:text-white hover:bg-dark-800 transition-colors"
                      >
                        <MoreHorizontal size={16} />
                      </button>

                      {openMenuId === event.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                          <div className="absolute right-0 top-full mt-1 w-48 bg-dark-800 border border-dark-700 rounded-lg shadow-xl z-20 py-1 overflow-hidden">
                            <Link
                              to={`/events/${event.slug}`}
                              className="flex items-center gap-2 px-3 py-2 text-body-sm text-dark-300 hover:text-white hover:bg-dark-700 transition-colors w-full text-left"
                            >
                              <Eye size={14} /> View Public Page
                            </Link>
                            <button
                              onClick={() => { onViewParticipants(event); setOpenMenuId(null) }}
                              className="flex items-center gap-2 px-3 py-2 text-body-sm text-dark-300 hover:text-white hover:bg-dark-700 transition-colors w-full text-left"
                            >
                              <Users size={14} /> View Participants
                            </button>
                            <button
                              onClick={() => { onEdit(event); setOpenMenuId(null) }}
                              className="flex items-center gap-2 px-3 py-2 text-body-sm text-dark-300 hover:text-white hover:bg-dark-700 transition-colors w-full text-left"
                            >
                              <Pencil size={14} /> Edit
                            </button>
                            <div className="h-px bg-dark-700 my-1" />
                            <button
                              onClick={() => { onDelete(event); setOpenMenuId(null) }}
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
