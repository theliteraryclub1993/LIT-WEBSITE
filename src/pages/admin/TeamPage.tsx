import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Users, ToggleLeft, ToggleRight } from 'lucide-react'
import { teamService } from '@/services/teamService'
import { useAuthStore, useUIStore } from '@/store'
import { TeamMemberCard } from '@/components/dashboard/TeamMemberCard'
import { TeamMemberForm } from '@/components/forms/TeamMemberForm'
import { Modal, Input, Button, Badge, PageLoader, EmptyState } from '@/components/ui'
import toast from 'react-hot-toast'
import type { TeamMember } from '@/types'
import { sortMembersByRole, isAlumniMember } from '@/utils/teamSorter'

export function TeamPage() {
    const queryClient = useQueryClient()
    const user = useAuthStore(s => s.user)
    const { showConfirmDialog, hideConfirmDialog } = useUIStore()

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
    const [search, setSearch] = useState('')
    const [departmentFilter, setDepartmentFilter] = useState('')
    const [showInactive, setShowInactive] = useState(false)
    const [page, setPage] = useState(1)
    const pageSize = 12

    // Fetch members (excluding Alumni)
    const { data: membersData, isLoading: membersLoading } = useQuery({
        queryKey: ['team', 'admin', search, departmentFilter, showInactive, page],
        queryFn: () => teamService.listAdmin({
            search: search || undefined,
            department: departmentFilter || undefined,
            is_active: showInactive ? undefined : true,
            excludeAlumni: true,
            page,
            pageSize,
        }),
    })

    // Fetch total inactive count for team members (excluding Alumni)
    const { data: inactiveCount = 0 } = useQuery({
        queryKey: ['team', 'inactive-count'],
        queryFn: async () => {
            const res = await teamService.count(q =>
                q.eq('is_active', false)
                 .or('department.is.null,department.not.ilike.Alumni%')
                 .not('role', 'ilike', '%alumn%')
                 .not('role', 'ilike', '%former%')
            )
            return res.count || 0
        },
    })

    // Fetch departments (excluding Alumni)
    const { data: departments } = useQuery({
        queryKey: ['team-departments', 'exclude-alumni'],
        queryFn: () => teamService.getDepartments({ excludeAlumni: true }),
        staleTime: 1000 * 60 * 10,
    })

    // Create/Update mutation
    const upsertMutation = useMutation({
        mutationFn: async (values: any) => {
            let result
            if (values.id) {
                const { id, ...updates } = values
                result = await teamService.updateWithLog(id, updates, user?.id || '')
            } else {
                const { id, ...payload } = values
                result = await teamService.createWithLog(payload as any, user?.id || '')
            }
            if (result.error) {
                throw new Error(result.error)
            }
            return result.data
        },
        onSuccess: () => {
            toast.success(editingMember ? 'Member updated!' : 'Member added!')
            closeModal()
            queryClient.invalidateQueries({ queryKey: ['team'] })
            queryClient.invalidateQueries({ queryKey: ['team-departments'] })
        },
        onError: (err) => toast.error(err.message || 'Failed to save member'),
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
            toast.success('Member removed.')
            queryClient.invalidateQueries({ queryKey: ['team'] })
            queryClient.invalidateQueries({ queryKey: ['team-departments'] })
        },
        onError: (err) => toast.error(err.message || 'Failed to delete member'),
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
            title: 'Remove Team Member',
            message: `Remove "${member.name}" from the team? Their avatar image will also be deleted.`,
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

    // Stats & Role-Sorted Members
    const activeCount = useMemo(() => {
        return (membersData?.data || []).filter(m => m.is_active && !isAlumniMember(m)).length
    }, [membersData?.data])

    const totalPages = membersData?.count ? Math.ceil(membersData.count / pageSize) : 0

    const sortedMembers = useMemo(() => {
        const teamOnly = (membersData?.data || []).filter(m => !isAlumniMember(m))
        return [...teamOnly].sort(sortMembersByRole)
    }, [membersData?.data])

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-h2 text-white">Team</h1>
                    <p className="text-body-sm text-dark-400 mt-1">Manage team members and their public profiles.</p>
                </div>
                <Button variant="primary" leftIcon={<Plus size={16} />} onClick={openCreateModal}>
                    Add Member
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
                                    ? 'text-white border-orange-primary bg-orange-subtle'
                                    : 'text-dark-500 border-dark-700 hover:border-dark-500 hover:text-dark-300'
                                }`}
                        >
                            {showInactive ? <ToggleRight size={14} className="inline mr-1" /> : <ToggleLeft size={14} className="inline mr-1" />}
                            {inactiveCount} Inactive
                        </button>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 flex-1">
                    <div className="w-full sm:max-w-xs">
                        <Input
                            placeholder="Search members..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                            leftIcon={<Search size={16} />}
                            size="sm"
                        />
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                        <Button
                            variant={!departmentFilter ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => { setDepartmentFilter(''); setPage(1) }}
                        >
                            All
                        </Button>
                        {departments?.map(dept => (
                            <Button
                                key={dept}
                                variant={departmentFilter === dept ? 'primary' : 'outline'}
                                size="sm"
                                onClick={() => { setDepartmentFilter(departmentFilter === dept ? '' : dept); setPage(1) }}
                            >
                                {dept}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid / Empty */}
            {membersLoading ? (
                <PageLoader />
            ) : !membersData?.data?.length ? (
                <EmptyState
                    icon={<Users size={48} strokeWidth={1.5} />}
                    title="No team members found"
                    description={showInactive ? 'No members in this category.' : 'Add your first team member to get started.'}
                    action={!showInactive ? (
                        <Button variant="primary" leftIcon={<Plus size={16} />} onClick={openCreateModal}>
                            Add Member
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
                title={editingMember ? 'Edit Team Member' : 'Add Team Member'}
                subtitle={editingMember ? `Editing: ${editingMember.name}` : 'Fill in the details to add to the team'}
                size="lg"
            >
                <TeamMemberForm
                    initialData={editingMember}
                    departments={departments || []}
                    onSubmit={handleFormSubmit}
                    isLoading={upsertMutation.isPending}
                />
            </Modal>
        </div>
    )
}