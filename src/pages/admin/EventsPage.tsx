import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search } from 'lucide-react'
import { eventService } from '@/services/eventService'
import { useAuthStore, useUIStore } from '@/store'
import { queryKeyFactory } from '@/lib/queryClient'
import { EventTable } from '@/components/dashboard/EventTable'
import { EventForm } from '@/components/forms/EventForm'
import { Modal, Input, Button, PageLoader, Tabs } from '@/components/ui'
import toast from 'react-hot-toast'
import type { Event } from '@/types'

export function EventsPage() {
    const queryClient = useQueryClient()
    const user = useAuthStore(s => s.user)
    const showConfirmDialog = useUIStore(s => s.showConfirmDialog)
    const hideConfirmDialog = useUIStore(s => s.hideConfirmDialog)

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingEvent, setEditingEvent] = useState<Event | null>(null)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('')
    const [page, setPage] = useState(1)
    const pageSize = 15

    // Fetch Events
    const { data, isLoading } = useQuery({
        queryKey: queryKeyFactory.events.list({ search, status: statusFilter, page, pageSize }),
        queryFn: () => eventService.listAdmin({ search, status: statusFilter || undefined, page, pageSize }),
    })

    // Create/Update Mutation
    const upsertMutation = useMutation({
        mutationFn: async (values: any) => {
            let result
            if (values.id) {
                const { id, ...updates } = values
                result = await eventService.updateWithLog(id, updates, user?.id || '')
            } else {
                const { id, ...payload } = values
                result = await eventService.createWithLog(payload as any, user?.id || '')
            }
            if (result.error) {
                throw new Error(result.error)
            }
            return result.data
        },
        onSuccess: () => {
            toast.success(editingEvent ? 'Event updated!' : 'Event created!')
            closeModal()
            queryClient.invalidateQueries({ queryKey: queryKeyFactory.events.all })
        },
        onError: (err) => toast.error(err.message || 'Failed to save event'),
    })

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const result = await eventService.deleteWithLog(id, user?.id || '')
            if (result.error) {
                throw new Error(result.error)
            }
            return result
        },
        onSuccess: () => {
            toast.success('Event deleted.')
            queryClient.invalidateQueries({ queryKey: queryKeyFactory.events.all })
        },
        onError: (err) => toast.error(err.message || 'Failed to delete event'),
    })

    const openCreateModal = () => {
        setEditingEvent(null)
        setIsModalOpen(true)
    }

    const openEditModal = (event: Event) => {
        setEditingEvent(event)
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setEditingEvent(null)
    }

    const handleDelete = (event: Event) => {
        showConfirmDialog({
            isOpen: true,
            title: 'Delete Event',
            message: `Are you sure you want to delete "${event.title}"? This will also delete all associated participants and attendance records. This action cannot be undone.`,
            variant: 'danger',
            confirmLabel: 'Delete Event',
            onConfirm: () => deleteMutation.mutate(event.id),
            onCancel: hideConfirmDialog,
        })
    }

    const handleViewParticipants = (event: Event) => {
        // Will be fully wired when ParticipantsPage is done in admin routing
        toast('Navigate to participants: ' + event.title)
    }

    const handleFormSubmit = async (data: any) => {
        await upsertMutation.mutateAsync({
            ...(editingEvent ? { id: editingEvent.id } : {}),
            ...data,
        })
    }

    const totalPages = data?.count ? Math.ceil(data.count / pageSize) : 0

    const tabs = [
        { id: 'all', label: 'All', count: data?.count },
        { id: 'published', label: 'Published' },
        { id: 'draft', label: 'Draft' },
        { id: 'ongoing', label: 'Ongoing' },
        { id: 'completed', label: 'Completed' },
        { id: 'cancelled', label: 'Cancelled' },
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-h2 text-white">Events</h1>
                    <p className="text-body-sm text-dark-400 mt-1">Manage all literary events and workshops.</p>
                </div>
                <Button variant="primary" leftIcon={<Plus size={16} />} onClick={openCreateModal}>
                    Create Event
                </Button>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:max-w-xs">
                    <Input
                        placeholder="Search events..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                        leftIcon={<Search size={16} />}
                    />
                </div>
                <div className="flex-1">
                    <Tabs
                        items={tabs}
                        defaultTab="all"
                        onChange={(tabId) => { setStatusFilter(tabId === 'all' ? '' : tabId); setPage(1) }}
                        variant="pill"
                        size="sm"
                    />
                </div>
            </div>

            {/* Table */}
            {isLoading ? (
                <PageLoader />
            ) : (
                <>
                    <EventTable
                        events={data?.data || []}
                        onEdit={openEditModal}
                        onDelete={handleDelete}
                        onViewParticipants={handleViewParticipants}
                    />

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-4">
                            <p className="text-caption text-dark-500">
                                Showing {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, data?.count || 0)} of {data?.count}
                            </p>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
                                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingEvent ? 'Edit Event' : 'Create New Event'}
                subtitle={editingEvent ? `Editing: ${editingEvent.title}` : 'Fill in the details below'}
                size="xl"
            >
                <EventForm
                    initialData={editingEvent}
                    onSubmit={handleFormSubmit}
                    isLoading={upsertMutation.isPending}
                />
            </Modal>
        </div>
    )
}