import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, GraduationCap, ToggleLeft, ToggleRight } from 'lucide-react'
import { teamService } from '@/services/teamService'
import { useAuthStore, useUIStore } from '@/store'
import { TeamMemberCard } from '@/components/dashboard/TeamMemberCard'
import { TeamMemberForm } from '@/components/forms/TeamMemberForm'
import { Modal, Input, Button, Badge, PageLoader, EmptyState } from '@/components/ui'
import toast from 'react-hot-toast'
import type { TeamMember } from '@/types'

export function AlumniAdminPage() {
    const queryClient = useQueryClient()
    const user = useAuthStore(s => s.user)
    const { showConfirmDialog, hideConfirmDialog } = useUIStore()

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
    const [search, setSearch] = useState('')
    const [showInactive, setShowInactive] = useState(false)
    const [page, setPage] = useState(1)
    const pageSize = 12

    // Fetch alumni members only (department = Alumni)
    const { data: membersData, isLoading: membersLoading } = useQuery({
        queryKey: ['team', 'admin-alumni', search, showInactive, page],
        queryFn: () => teamService.listAdmin({
            search: search || undefined,
            department: 'Alumni',
            is_active: showInactive ? undefined : true,
            page,
            pageSize,
        }),
    })

    // Fetch inactive alumni count
    const { data: inactiveCount = 0 } = useQuery({
        queryKey: ['team', 'alumni-inactive-count'],
        queryFn: async () => {
            const res = await teamService.count(q => q.eq('is_active', false).ilike('department', 'Alumni%'))
            return res.count || 0
        },
    })

    // Create/Update mutation
    const upsertMutation = useMutation({
        mutationFn: async (values: any) => {
            // Respect the department coming from the form (e.g., 'Alumni - 2024'), default to Alumni
            const payload = { ...values, department: values.department || 'Alumni' }
            let result
            if (payload.id) {
                const { id, ...updates } = payload
                result = await teamService.updateWithLog(id, updates, user?.id || '')
            } else {
                const { id, ...createPayload } = payload
                result = await teamService.createWithLog(createPayload as any, user?.id || '')
            }
            if (result.error) {
                throw new Error(result.error)
            }
            return result.data
        },
        onSuccess: () => {
            toast.success(editingMember ? 'Alumni updated!' : 'Alumni added!')
            closeModal()
            queryClient.invalidateQueries({ queryKey: ['team'] })
            queryClient.invalidateQueries({ queryKey: ['team-departments'] })
        },
        onError: (err) => toast.error(err.message || 'Failed to save alumni member'),
    })

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const result = await teamService.deleteWithLog(id, user?.id || '')
            if (result.error) {
                throw new Error(result.error)
            }
            return result
        },
        onSuccess: () => {
            toast.success('Alumni member removed.')
            queryClient.invalidateQueries({ queryKey: ['team'] })
            queryClient.invalidateQueries({ queryKey: ['team-departments'] })
        },
        onError: (err) => toast.error(err.message || 'Failed to delete alumni member'),
    })

    // Handlers
    const openCreateModal = () => {
        setEditingMember(null)
        setIsModalOpen(true)
    }

    const openEditModal = (member: TeamMember) => {
        setEditingMember(member)
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setEditingMember(null)
    }

    const handleDelete = (member: TeamMember) => {
        showConfirmDialog({
            isOpen: true,
            title: 'Remove Alumni Member',
            message: `Remove "${member.name}" from the alumni network? Their avatar image will also be deleted.`,
            variant: 'danger',
            confirmLabel: 'Remove',
            onConfirm: () => deleteMutation.mutate(member.id),
            onCancel: hideConfirmDialog,
        })
    }

    const handleFormSubmit = async (data: any) => {
        await upsertMutation.mutateAsync({
            ...(editingMember ? { id: editingMember.id } : {}),
            ...data,
        })
    }

    // Stats
    const activeCount = membersData?.data?.filter(m => m.is_active).length || 0
    const totalPages = membersData?.count ? Math.ceil(membersData.count / pageSize) : 0

    const sortedMembers = useMemo(() => {
        return [...(membersData?.data || [])].sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    }, [membersData?.data])

    // Create a fake initialData with department pre-set to Alumni for new members
    const formInitialData = editingMember || { department: 'Alumni' } as TeamMember

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                            <GraduationCap size={20} />
                        </div>
                        <div>
                            <h1 className="text-h2 text-white">Alumni Network</h1>
                            <p className="text-body-sm text-dark-400 mt-0.5">Manage alumni members and their public profiles.</p>
                        </div>
                    </div>
                </div>
                <Button variant="primary" leftIcon={<Plus size={16} />} onClick={openCreateModal}>
                    Add Alumni
                </Button>
            </div>

            {/* Stats + Filters */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Badge variant="success" size="md" dot>{activeCount} Active</Badge>
                    {inactiveCount > 0 && (
                        <button
                            onClick={() => { setShowInactive(!showInactive); setPage(1) }}
                            className={`text-caption px-3 py-1.5 rounded-lg border transition-colors ${showInactive
                                    ? 'text-white border-amber-500 bg-amber-500/20'
                                    : 'text-dark-500 border-dark-700 hover:border-dark-500 hover:text-dark-300'
                                }`}
                        >
                            {showInactive ? <ToggleRight size={14} className="inline mr-1" /> : <ToggleLeft size={14} className="inline mr-1" />}
                            {inactiveCount} Inactive
                        </button>
                    )}
                </div>

                <div className="w-full sm:max-w-xs">
                    <Input
                        placeholder="Search alumni..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                        leftIcon={<Search size={16} />}
                        size="sm"
                    />
                </div>
            </div>

            {/* Grid / Empty */}
            {membersLoading ? (
                <PageLoader />
            ) : !membersData?.data?.length ? (
                <EmptyState
                    icon={<GraduationCap size={48} strokeWidth={1.5} className="text-amber-500/50" />}
                    title="No alumni members found"
                    description={search ? 'No alumni matching your search.' : 'Add your first alumni member to build the network.'}
                    action={!search ? (
                        <Button variant="primary" leftIcon={<Plus size={16} />} onClick={openCreateModal}>
                            Add Alumni
                        </Button>
                    ) : undefined}
                />
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sortedMembers.map((member, i) => (
                            <TeamMemberCard
                                key={member.id}
                                member={member}
                                index={i}
                                onEdit={openEditModal}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-6">
                            <p className="text-caption text-dark-500">
                                Showing {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, membersData.count || 0)} of {membersData.count}
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
                title={editingMember ? 'Edit Alumni Member' : 'Add Alumni Member'}
                subtitle={editingMember ? `Editing: ${editingMember.name}` : 'Fill in the details to add to the alumni network'}
                size="lg"
            >
                <TeamMemberForm
                    initialData={formInitialData}
                    departments={['Alumni']}
                    onSubmit={handleFormSubmit}
                    isLoading={upsertMutation.isPending}
                />
            </Modal>
        </div>
    )
}
