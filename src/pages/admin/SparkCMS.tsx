import { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, Mic, Play } from 'lucide-react'
import { sparkService } from '@/services/sparkService'
import { useUIStore } from '@/store'
import { Modal, Input, Button, PageLoader, Card } from '@/components/ui'
import toast from 'react-hot-toast'
import type { SparkSpeaker } from '@/types'
import { formatDate } from '@/utils/formatDate'

export function SparkCMS() {
    const showConfirmDialog = useUIStore(s => s.showConfirmDialog)
    const hideConfirmDialog = useUIStore(s => s.hideConfirmDialog)

    const [speakers, setSpeakers] = useState<SparkSpeaker[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [search, setSearch] = useState('')
    
    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingSpeaker, setEditingSpeaker] = useState<SparkSpeaker | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    // Form fields state
    const [name, setName] = useState('')
    const [designation, setDesignation] = useState('')
    const [topic, setTopic] = useState('')
    const [description, setDescription] = useState('')
    const [imageUrl, setImageUrl] = useState('')
    const [videoUrl, setVideoUrl] = useState('')
    const [talkDate, setTalkDate] = useState('')
    const [orderIndex, setOrderIndex] = useState('0')

    const fetchSpeakers = async () => {
        setIsLoading(true)
        try {
            const { data, error } = await sparkService.getSpeakers({ search })
            if (error) throw new Error(error)
            setSpeakers(data)
        } catch (err: any) {
            toast.error(err.message || 'Failed to fetch speakers')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchSpeakers()
        }, 300)
        return () => clearTimeout(handler)
    }, [search])

    const openCreateModal = () => {
        setEditingSpeaker(null)
        setName('')
        setDesignation('')
        setTopic('')
        setDescription('')
        setImageUrl('')
        setVideoUrl('')
        setTalkDate(new Date().toISOString().split('T')[0]!)
        setOrderIndex('0')
        setIsModalOpen(true)
    }

    const openEditModal = (speaker: SparkSpeaker) => {
        setEditingSpeaker(speaker)
        setName(speaker.name)
        setDesignation(speaker.designation)
        setTopic(speaker.topic)
        setDescription(speaker.description || '')
        setImageUrl(speaker.image_url || '')
        setVideoUrl(speaker.video_url || '')
        setTalkDate(speaker.talk_date)
        setOrderIndex(String(speaker.order_index))
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setEditingSpeaker(null)
    }

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim() || !designation.trim() || !topic.trim() || !talkDate) {
            toast.error('Name, Designation, Topic, and Talk Date are required.')
            return
        }

        setIsSaving(true)
        const payload = {
            name,
            designation,
            topic,
            description: description || null,
            image_url: imageUrl || null,
            video_url: videoUrl || null,
            talk_date: talkDate,
            order_index: parseInt(orderIndex) || 0,
        }

        try {
            if (editingSpeaker) {
                const { error } = await sparkService.update(editingSpeaker.id, payload)
                if (error) throw new Error(error)
                toast.success('Speaker updated successfully!')
            } else {
                const { error } = await sparkService.create(payload)
                if (error) throw new Error(error)
                toast.success('Speaker created successfully!')
            }
            closeModal()
            fetchSpeakers()
        } catch (err: any) {
            toast.error(err.message || 'Failed to save speaker')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = (speaker: SparkSpeaker) => {
        showConfirmDialog({
            isOpen: true,
            title: 'Delete Spark Speaker',
            message: `Are you sure you want to delete speaker "${speaker.name}"? This action cannot be undone.`,
            variant: 'danger',
            confirmLabel: 'Delete',
            onConfirm: async () => {
                hideConfirmDialog()
                try {
                    const { error } = await sparkService.delete(speaker.id)
                    if (error) throw new Error(error)
                    toast.success('Speaker deleted successfully!')
                    fetchSpeakers()
                } catch (err: any) {
                    toast.error(err.message || 'Failed to delete speaker')
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
                    <h1 className="text-h2 text-white font-bold">Spark Speaker Platform</h1>
                    <p className="text-body-sm text-dark-400 mt-1">Manage speakers who share their experiences on the Spark platform.</p>
                </div>
                <Button variant="primary" leftIcon={<Plus size={16} />} onClick={openCreateModal} className="cursor-pointer">
                    Add Speaker
                </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="w-full md:max-w-xs">
                    <Input
                        placeholder="Search by name, topic, or role..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        leftIcon={<Search size={16} />}
                    />
                </div>
            </div>

            {/* List Table */}
            {isLoading ? (
                <PageLoader label="Loading speakers..." />
            ) : speakers.length === 0 ? (
                <Card variant="bordered" className="flex items-center justify-center p-12 text-center">
                    <div className="space-y-3">
                        <Mic size={48} className="text-dark-600 mx-auto" />
                        <h3 className="text-h4 text-white">No speakers found</h3>
                        <p className="text-body-sm text-dark-400">Add a new speaker talk to display it on the website.</p>
                    </div>
                </Card>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-dark-800 bg-dark-950/20">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-dark-800 bg-dark-900/50 text-caption text-dark-400 font-mono uppercase">
                                <th className="p-4">Speaker</th>
                                <th className="p-4">Topic / Talk Title</th>
                                <th className="p-4">Talk Date</th>
                                <th className="p-4">Display Order</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-850">
                            {speakers.map((speaker) => (
                                <tr key={speaker.id} className="hover:bg-dark-900/25 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full overflow-hidden bg-dark-850 border border-dark-700 shrink-0">
                                                {speaker.image_url ? (
                                                    <img src={speaker.image_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-dark-600"><Mic size={18} /></div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-body-sm font-semibold text-white">{speaker.name}</p>
                                                <p className="text-[10px] text-dark-500 font-mono">{speaker.designation}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-body-sm text-dark-200 font-medium">
                                        {speaker.topic}
                                    </td>
                                    <td className="p-4 text-body-sm text-dark-400">
                                        {formatDate(speaker.talk_date, 'MMM d, yyyy')}
                                    </td>
                                    <td className="p-4 text-body-sm text-dark-400 font-mono">
                                        {speaker.order_index}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {speaker.video_url && (
                                                <a
                                                    href={speaker.video_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1.5 rounded-md hover:bg-dark-800 text-dark-400 hover:text-white transition-colors"
                                                    title="Watch Video"
                                                >
                                                    <Play size={16} />
                                                </a>
                                            )}
                                            <button
                                                onClick={() => openEditModal(speaker)}
                                                className="p-1.5 rounded-md hover:bg-dark-800 text-dark-400 hover:text-white transition-colors cursor-pointer"
                                                title="Edit Speaker"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(speaker)}
                                                className="p-1.5 rounded-md hover:bg-red-950/20 text-dark-400 hover:text-red-500 transition-colors cursor-pointer"
                                                title="Delete Speaker"
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
                title={editingSpeaker ? 'Edit Speaker' : 'Add Speaker'}
                size="md"
            >
                <form onSubmit={handleFormSubmit} className="space-y-4 pt-2">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Speaker Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Aravind Swamy"
                            required
                        />
                        <Input
                            label="Designation / Role"
                            value={designation}
                            onChange={(e) => setDesignation(e.target.value)}
                            placeholder="e.g. Alumnus (Batch of 2018)"
                            required
                        />
                    </div>

                    <Input
                        label="Talk Topic / Title"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g. Navigating Careers through Effective Expression"
                        required
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Talk Date"
                            type="date"
                            value={talkDate}
                            onChange={(e) => setTalkDate(e.target.value)}
                            required
                        />
                        <Input
                            label="Display Order (Index)"
                            type="number"
                            value={orderIndex}
                            onChange={(e) => setOrderIndex(e.target.value)}
                            placeholder="0"
                        />
                    </div>

                    <Input
                        label="Speaker Image URL"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://example.com/speaker.jpg"
                    />

                    <Input
                        label="Talk Video Link (e.g. YouTube)"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="https://youtube.com/watch?v=..."
                    />

                    <div>
                        <label className="block text-body-sm font-medium text-dark-200 mb-1">Speaker Experience / Talk Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-dark-900 border border-dark-750 focus:border-orange-primary focus:ring-1 focus:ring-orange-primary rounded-lg p-3 text-body-sm text-white placeholder-dark-600 focus:outline-none min-h-[100px]"
                            placeholder="Describe what the speaker shared or their experience..."
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-dark-800">
                        <Button variant="ghost" onClick={closeModal} disabled={isSaving} className="cursor-pointer">
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" disabled={isSaving} className="cursor-pointer">
                            {isSaving ? 'Saving...' : 'Save Speaker'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
