import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, ArrowLeft } from 'lucide-react'
import { auditionCycleService, auditionApplicationService } from '@/services/auditionService'
import { useAuthStore, useUIStore } from '@/store'
import { AuditionCycleTable } from '@/components/dashboard/AuditionCycleTable'
import { AuditionApplicationsTable } from '@/components/dashboard/AuditionApplicationsTable'
import { AuditionCycleForm } from '@/components/forms/AuditionCycleForm'
import { ReviewModal } from '@/components/dashboard/ReviewModal'
import { Modal, Input, Button, PageLoader, Tabs, Card, Badge } from '@/components/ui'
import { statusColor } from '@/config/tailwindPlugin'
import toast from 'react-hot-toast'
import type { AuditionCycleWithStats, AuditionApplication, ApplicationStatus } from '@/types'

type ViewMode = 'cycles' | 'applications'

export function AuditionsPage() {
    const queryClient = useQueryClient()
    const user = useAuthStore(s => s.user)
    const { showConfirmDialog, hideConfirmDialog } = useUIStore()

    const [viewMode, setViewMode] = useState<ViewMode>('cycles')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingCycle, setEditingCycle] = useState<AuditionCycleWithStats | null>(null)
    const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null)
    const [reviewApplication, setReviewApplication] = useState<AuditionApplication | null>(null)
    const [isReviewOpen, setIsReviewOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [page, setPage] = useState(1)
    const pageSize = 15

    // Reset filters when switching view
    useEffect(() => {
        setSearch('')
        setStatusFilter('')
        setPage(1)
    }, [viewMode])

    // === CYCLES ===
    const { data: cyclesData, isLoading: cyclesLoading } = useQuery({
        queryKey: ['audition-cycles', 'admin', search, statusFilter, page],
        queryFn: () => auditionCycleService.listAdmin({
            search: search || undefined,
            status: statusFilter || undefined,
            page,
            pageSize,
        }),
        enabled: viewMode === 'cycles',
    })

    // === APPLICATIONS ===
    const { data: selectedCycleData } = useQuery({
        queryKey: ['audition-cycle-detail', selectedCycleId],
        queryFn: () => auditionCycleService.getWithStats(selectedCycleId!),
        enabled: !!selectedCycleId && viewMode === 'applications',
    })

    const selectedCycle = selectedCycleData?.data

    const { data: applicationsData, isLoading: appsLoading } = useQuery({
        queryKey: ['audition-applications', selectedCycleId, search],
        queryFn: () => auditionApplicationService.listByCycle(selectedCycleId!, { search: search || undefined }),
        enabled: !!selectedCycleId && viewMode === 'applications',
    })

    const applications = applicationsData?.data || []

    // === MUTATIONS ===

    // Create/Update Cycle
    const upsertCycleMutation = useMutation({
        mutationFn: async (values: Parameters<typeof auditionCycleService.createWithLog>[0] & { id?: string }) => {
            if (values.id) {
                const { id, ...updates } = values
                return auditionCycleService.updateWithLog(id, updates, user?.id || '')
            }
            const { id, ...payload } = values
            return auditionCycleService.createWithLog(payload as any, user?.id || '')
        },
        onSuccess: () => {
            toast.success(editingCycle ? 'Cycle updated!' : 'Cycle created!')
            closeCycleModal()
            queryClient.invalidateQueries({ queryKey: ['audition-cycles'] })
        },
        onError: (err) => toast.error(err.message || 'Failed to save cycle'),
    })

    // Delete Cycle
    const deleteCycleMutation = useMutation({
        mutationFn: (id: string) => auditionCycleService.deleteWithLog(id, user?.id || ''),
        onSuccess: () => {
            toast.success('Cycle deleted.')
            queryClient.invalidateQueries({ queryKey: ['audition-cycles'] })
        },
        onError: (err) => toast.error(err.message || 'Failed to delete cycle'),
    })

    // Review Application
    const reviewMutation = useMutation({
        mutationFn: async ({ id, status, notes }: { id: string; status: ApplicationStatus; notes: string }): Promise<any> => {
            return auditionApplicationService.review(id, status, notes, user?.id || '')
        },
        onSuccess: () => {
            toast.success('Application reviewed.')
            setIsReviewOpen(false)
            setReviewApplication(null)
            queryClient.invalidateQueries({ queryKey: ['audition-applications'] })
            queryClient.invalidateQueries({ queryKey: ['audition-cycle-detail'] })
        },
        onError: (err) => toast.error(err.message || 'Failed to review application'),
    })

    // Bulk Review
    const bulkReviewMutation = useMutation({
        mutationFn: async ({ ids, status }: { ids: string[]; status: ApplicationStatus }): Promise<any> => {
            return auditionApplicationService.bulkReview(ids, status, user?.id || '')
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['audition-applications'] })
            queryClient.invalidateQueries({ queryKey: ['audition-cycle-detail'] })
        },
        onError: (err) => toast.error(err.message || 'Bulk action failed'),
    })

    // === HANDLERS ===

    const openCreateModal = () => {
        setEditingCycle(null)
        setIsModalOpen(true)
    }

    const openEditModal = (cycle: AuditionCycleWithStats) => {
        setEditingCycle(cycle)
        setIsModalOpen(true)
    }

    const closeCycleModal = () => {
        setIsModalOpen(false)
        setEditingCycle(null)
    }

    const handleDelete = (cycle: AuditionCycleWithStats) => {
        showConfirmDialog({
            isOpen: true,
            title: 'Delete Audition Cycle',
            message: `Delete "${cycle.title}" for ${cycle.position}? This will also delete all ${cycle.application_count} associated applications.`,
            variant: 'danger',
            confirmLabel: 'Delete Cycle',
            onConfirm: () => deleteCycleMutation.mutate(cycle.id),
            onCancel: hideConfirmDialog,
        })
    }

    const handleViewApplications = (cycle: AuditionCycleWithStats) => {
        setSelectedCycleId(cycle.id)
        setViewMode('applications')
    }

    const handleReviewApp = (app: AuditionApplication) => {
        setReviewApplication(app)
        setIsReviewOpen(true)
    }

    const handleCycleFormSubmit = async (data: any) => {
        await upsertCycleMutation.mutateAsync({
            ...(editingCycle ? { id: editingCycle.id } : {}),
            ...data,
            open_date: new Date(data.open_date).toISOString(),
            close_date: new Date(data.close_date).toISOString(),
            max_applicants: data.max_applicants ? Number(data.max_applicants) : null,
        })
    }

    const totalPages = cyclesData?.count ? Math.ceil(cyclesData.count / pageSize) : 0

    const cycleTabs = [
        { id: 'all', label: 'All', count: cyclesData?.count },
        { id: 'open', label: 'Open' },
        { id: 'closed', label: 'Closed' },
        { id: 'in_review', label: 'Under Review' },
        { id: 'results_out', label: 'Results Out' },
    ]

    const exportToCSV = () => {
        if (!cyclesData?.data) {
            toast.error('No data to export')
            return
        }
        const header = ['Title', 'Position', 'Status', 'Applications', 'Close Date', 'Max Applicants']
        const rows = (cyclesData.data as any[]).map(c => [
            c.title,
            c.position,
            c.status,
            c.application_count?.toString() ?? '0',
            c.close_date ? new Date(c.close_date).toLocaleDateString() : '',
            c.max_applicants?.toString() ?? ''
        ])
        const csvContent = [header, ...rows]
            .map(e => e.map(v => `"${v.replace(/"/g, '""')}"`).join(','))
            .join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'auditions.csv')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    // === RENDER ===

    if (viewMode === 'applications') {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => { setViewMode('cycles'); setSelectedCycleId(null) }}
                        className="flex items-center gap-2 text-body-sm text-dark-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={16} /> Back to Cycles
                    </button>
                </div>

                {selectedCycle && (
                    <Card variant="bordered" padding="md">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                                <h1 className="text-h3 text-white">{selectedCycle.title}</h1>
                                <p className="text-body-sm text-dark-400">Position: {selectedCycle.position} · {selectedCycle.application_count} applications</p>
                            </div>
                            <Badge
                                variant="default"
                                size="md"
                                dot
                                className={statusColor(selectedCycle.status).bg + ' ' + statusColor(selectedCycle.status).text + ' ' + statusColor(selectedCycle.status).border}
                            >
                                {selectedCycle.status === 'in_review' ? 'Under Review' : selectedCycle.status === 'results_out' ? 'Results Out' : selectedCycle.status}
                            </Badge>
                        </div>
                    </Card>
                )}

                <AuditionApplicationsTable
                    applications={applications}
                    isLoading={appsLoading}
                    onReview={handleReviewApp}
                    onBulkAction={(ids, status) => bulkReviewMutation.mutateAsync({ ids, status })}
                />

                {reviewApplication && (
                    <ReviewModal
                        application={reviewApplication}
                        isOpen={isReviewOpen}
                        onClose={() => { setIsReviewOpen(false); setReviewApplication(null) }}
                        onReview={async (id, status, notes) => { await reviewMutation.mutateAsync({ id, status, notes }) }}
                        isLoading={reviewMutation.isPending}
                    />
                )}
            </div>
        )
    }

    // Cycles View (default)
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-h2 text-white">Auditions</h1>
                    <p className="text-body-sm text-dark-400 mt-1">Manage audition cycles and review applications.</p>
                </div>
                <div className="flex gap-2">
                    <Button 
                        variant="secondary" 
                        leftIcon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M4 12l4 4m0 0l4-4m-4 4V8" /></svg>} 
                        onClick={exportToCSV}
                    >
                        Export CSV
                    </Button>
                    <Button variant="primary" leftIcon={<Plus size={16} />} onClick={openCreateModal}>
                        New Cycle
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:max-w-xs">
                    <Input
                        placeholder="Search cycles..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                        leftIcon={<Search size={16} />}
                    />
                </div>
                <div className="flex-1">
                    <Tabs
                        items={cycleTabs}
                        defaultTab="all"
                        onChange={(tabId) => { setStatusFilter(tabId === 'all' ? '' : tabId); setPage(1) }}
                        variant="pill"
                        size="sm"
                    />
                </div>
            </div>

            {/* Table */}
            {cyclesLoading ? (
                <PageLoader />
            ) : (
                <>
                    <AuditionCycleTable
                        cycles={(cyclesData?.data as AuditionCycleWithStats[]) || []}
                        onEdit={openEditModal}
                        onDelete={handleDelete}
                        onViewApplications={handleViewApplications}
                    />

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-4">
                            <p className="text-caption text-dark-500">
                                Showing {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, cyclesData?.count || 0)} of {cyclesData?.count}
                            </p>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
                                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Create/Edit Cycle Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeCycleModal}
                title={editingCycle ? 'Edit Audition Cycle' : 'New Audition Cycle'}
                subtitle={editingCycle ? `Editing: ${editingCycle.title}` : 'Define the role, requirements, and timeline'}
                size="lg"
            >
                <AuditionCycleForm
                    initialData={editingCycle}
                    onSubmit={handleCycleFormSubmit}
                    isLoading={upsertCycleMutation.isPending}
                />
            </Modal>
        </div>
    )
}