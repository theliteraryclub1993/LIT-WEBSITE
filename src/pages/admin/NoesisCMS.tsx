import { useState, useEffect } from 'react'
import { uploadFile } from '@/lib/supabase'
import { Plus, Search, Edit2, Trash2, BookOpen, ExternalLink } from 'lucide-react'
import { noesisService } from '@/services/noesisService'
import { useUIStore } from '@/store'
import { Modal, Input, Button, PageLoader, Badge, Card } from '@/components/ui'
import toast from 'react-hot-toast'
import type { NoesisEdition } from '@/types'
import { formatDate } from '@/utils/formatDate'

export function NoesisCMS() {
    const showConfirmDialog = useUIStore(s => s.showConfirmDialog)
    const hideConfirmDialog = useUIStore(s => s.hideConfirmDialog)

    const [editions, setEditions] = useState<NoesisEdition[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [search, setSearch] = useState('')
    
    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingEdition, setEditingEdition] = useState<NoesisEdition | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    // Form fields state
    const [title, setTitle] = useState('')
    const [editionNumber, setEditionNumber] = useState('')
    const [description, setDescription] = useState('')
    const [coverImage, setCoverImage] = useState('')
    const [pdfFile, setPdfFile] = useState('')
    const [publishDate, setPublishDate] = useState('')
    const [isCurrent, setIsCurrent] = useState(false)

    const fetchEditions = async () => {
        setIsLoading(true)
        try {
            const { data, error } = await noesisService.getEditions({ search })
            if (error) throw new Error(error)
            setEditions(data)
        } catch (err: any) {
            toast.error(err.message || 'Failed to fetch editions')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchEditions()
        }, 300)
        return () => clearTimeout(handler)
    }, [search])

    const openCreateModal = () => {
        setEditingEdition(null)
        setTitle('')
        setEditionNumber('')
        setDescription('')
        setCoverImage('')
        setPdfFile('')
        setPublishDate(new Date().toISOString().split('T')[0]!)
        setIsCurrent(false)
        setIsModalOpen(true)
    }

    const openEditModal = (edition: NoesisEdition) => {
        setEditingEdition(edition)
        setTitle(edition.title)
        setEditionNumber(edition.edition_number)
        setDescription(edition.description || '')
        setCoverImage(edition.cover_image || '')
        setPdfFile(edition.pdf_file || '')
        setPublishDate(edition.publish_date)
        setIsCurrent(edition.is_current)
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setEditingEdition(null)
    }

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim() || !editionNumber.trim() || !publishDate) {
            toast.error('Title, Edition Number, and Publish Date are required.')
            return
        }

        setIsSaving(true)
        const payload = {
            title,
            edition_number: editionNumber,
            description: description || null,
            cover_image: coverImage || null,
            pdf_file: pdfFile || null,
            publish_date: publishDate,
            is_current: isCurrent,
        }

        try {
            if (editingEdition) {
                const { error } = await noesisService.update(editingEdition.id, payload as any)
                if (error) throw new Error(error)
                toast.success('Edition updated successfully!')
            } else {
                const { error } = await noesisService.create(payload as any)
                if (error) throw new Error(error)
                toast.success('Edition created successfully!')
            }
            closeModal()
            fetchEditions()
        } catch (err: any) {
            toast.error(err.message || 'Failed to save edition')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = (edition: NoesisEdition) => {
        showConfirmDialog({
            isOpen: true,
            title: 'Delete Noesis Edition',
            message: `Are you sure you want to delete "${edition.title}"? This will archive it and remove it from the public view.`,
            variant: 'danger',
            confirmLabel: 'Delete',
            onConfirm: async () => {
                hideConfirmDialog()
                try {
                    const { error } = await noesisService.deleteEdition(edition.id)
                    if (error) throw new Error(error)
                    toast.success('Edition deleted successfully!')
                    fetchEditions()
                } catch (err: any) {
                    toast.error(err.message || 'Failed to delete edition')
                }
            },
            onCancel: hideConfirmDialog,
        })
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-h2 text-white font-bold">Noesis E-Magazine</h1>
                    <p className="text-body-sm text-dark-400 mt-1">Manage current and archived magazine issues.</p>
                </div>
                <Button variant="primary" leftIcon={<Plus size={16} />} onClick={openCreateModal} className="cursor-pointer">
                    Add Edition
                </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="w-full md:max-w-xs">
                    <Input
                        placeholder="Search by title or issue number..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        leftIcon={<Search size={16} />}
                    />
                </div>
            </div>

            {/* List Table */}
            {isLoading ? (
                <PageLoader label="Loading magazine editions..." />
            ) : editions.length === 0 ? (
                <Card variant="bordered" className="flex items-center justify-center p-12 text-center">
                    <div className="space-y-3">
                        <BookOpen size={48} className="text-dark-600 mx-auto" />
                        <h3 className="text-h4 text-white">No editions found</h3>
                        <p className="text-body-sm text-dark-400">Add a new Noesis issue to display it on the website.</p>
                    </div>
                </Card>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-dark-800 bg-dark-950/20">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-dark-800 bg-dark-900/50 text-caption text-dark-400 font-mono uppercase">
                                <th className="p-4">Cover</th>
                                <th className="p-4">Edition</th>
                                <th className="p-4">Publish Date</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-850">
                            {editions.map((edition) => (
                                <tr key={edition.id} className="hover:bg-dark-900/25 transition-colors">
                                    <td className="p-4">
                                        <div className="w-12 h-16 rounded overflow-hidden bg-dark-850 border border-dark-700">
                                            {edition.cover_image ? (
                                                <img src={edition.cover_image} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-dark-600"><BookOpen size={20} /></div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="space-y-1">
                                            <p className="text-body font-semibold text-white">{edition.title}</p>
                                            <p className="text-caption text-dark-500 font-mono">{edition.edition_number}</p>
                                        </div>
                                    </td>
                                    <td className="p-4 text-body-sm text-dark-300">
                                        {formatDate(edition.publish_date, 'MMM d, yyyy')}
                                    </td>
                                    <td className="p-4">
                                        {edition.is_current ? (
                                            <Badge variant="success" size="sm" dot>Current Edition</Badge>
                                        ) : (
                                            <Badge variant="outline" size="sm">Archived</Badge>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {edition.pdf_file && (
                                                <a
                                                    href={edition.pdf_file}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1.5 rounded-md hover:bg-dark-800 text-dark-400 hover:text-white transition-colors"
                                                    title="View PDF"
                                                >
                                                    <ExternalLink size={16} />
                                                </a>
                                            )}
                                            <button
                                                onClick={() => openEditModal(edition)}
                                                className="p-1.5 rounded-md hover:bg-dark-800 text-dark-400 hover:text-white transition-colors cursor-pointer"
                                                title="Edit Edition"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(edition)}
                                                className="p-1.5 rounded-md hover:bg-red-950/20 text-dark-400 hover:text-red-500 transition-colors cursor-pointer"
                                                title="Delete Edition"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingEdition ? 'Edit Noesis Edition' : 'Create Noesis Edition'}
                size="md"
            >
                <form onSubmit={handleFormSubmit} className="space-y-4 pt-2">
                    <Input
                        label="Edition Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Noesis Issue 30 — The Genesis of Voices"
                        required
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Issue / Edition Number"
                            value={editionNumber}
                            onChange={(e) => setEditionNumber(e.target.value)}
                            placeholder="e.g. Issue 30"
                            required
                        />
                        <Input
                            label="Publish Date"
                            type="date"
                            value={publishDate}
                            onChange={(e) => setPublishDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
  <label className="block text-body-sm font-medium text-dark-200">Cover Image</label>
  {coverImage && (
    <img src={coverImage} alt="Cover preview" className="w-24 h-32 object-cover rounded mb-2" />
  )}
  <input
    type="file"
    accept="image/*"
    onChange={async (e) => {
      const file = e.target.files?.[0];
      if (file) {
        const url = await uploadFile('noesis', `covers/${file.name}`, file);
        if (url) setCoverImage(url);
      }
    }}
  />
</div>

                    <Input
                        label="PDF File URL"
                        value={pdfFile}
                        onChange={(e) => setPdfFile(e.target.value)}
                        placeholder="https://example.com/issue.pdf"
                    />

                    <div>
                        <label className="block text-body-sm font-medium text-dark-200 mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-dark-900 border border-dark-750 focus:border-orange-primary focus:ring-1 focus:ring-orange-primary rounded-lg p-3 text-body-sm text-white placeholder-dark-600 focus:outline-none min-h-[100px]"
                            placeholder="Briefly describe this issue..."
                        />
                    </div>

                    <div className="flex items-center gap-3 bg-dark-900 p-4 rounded-xl border border-dark-800">
                        <input
                            type="checkbox"
                            id="is_current"
                            checked={isCurrent}
                            onChange={(e) => setIsCurrent(e.target.checked)}
                            className="w-4 h-4 accent-orange-primary rounded border-dark-700 bg-dark-900"
                        />
                        <label htmlFor="is_current" className="text-body-sm text-white font-medium cursor-pointer">
                            Mark as Current Edition
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-dark-800">
                        <Button variant="ghost" onClick={closeModal} disabled={isSaving} className="cursor-pointer">
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" disabled={isSaving} className="cursor-pointer">
                            {isSaving ? 'Saving...' : 'Save Edition'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
