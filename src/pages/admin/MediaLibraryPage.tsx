import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { STORAGE_BUCKETS } from '@/utils/constants'
import { Button, PageLoader, Card, EmptyState } from '@/components/ui'
import { Copy, Trash2, Search, Link as LinkIcon, FolderOpen } from 'lucide-react'
import toast from 'react-hot-toast'

interface FileItem {
    name: string
    id?: string | null
    updated_at?: string | null
    created_at?: string | null
    last_modified?: string | null
    metadata?: any
    url: string
    bucket: string
}

export function MediaLibraryPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [files, setFiles] = useState<FileItem[]>([])
    const [search, setSearch] = useState('')
    const [selectedBucket, setSelectedBucket] = useState<string>(STORAGE_BUCKETS.GALLERY)

    const fetchFiles = async () => {
        setIsLoading(true)
        try {
            const { data, error } = await supabase.storage.from(selectedBucket).list('', {
                limit: 100,
                sortBy: { column: 'name', order: 'desc' }
            })

            if (error) throw error

            const mapped = (data || []).map(f => {
                const { data: urlData } = supabase.storage.from(selectedBucket).getPublicUrl(f.name)
                return {
                    ...f,
                    url: urlData?.publicUrl || '',
                    bucket: selectedBucket
                }
            })

            setFiles(mapped)
        } catch (err: any) {
            console.error('Error fetching media:', err)
            toast.error(err.message || 'Failed to fetch media files.')
            setFiles([])
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchFiles()
    }, [selectedBucket])

    const handleCopyUrl = (url: string) => {
        navigator.clipboard.writeText(url)
        toast.success('Public URL copied to clipboard!')
    }

    const handleDelete = async (fileName: string) => {
        if (!confirm(`Are you sure you want to delete ${fileName}? This action is irreversible.`)) return

        try {
            const { error } = await supabase.storage.from(selectedBucket).remove([fileName])
            if (error) throw error

            toast.success('File deleted successfully.')
            fetchFiles()
        } catch (err: any) {
            toast.error(err.message || 'Failed to delete file.')
        }
    }

    const filteredFiles = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-h2 text-white font-bold">Media Library</h1>
                <p className="text-body-sm text-dark-400 mt-1">Browse, fetch, copy URLs, and manage all uploaded files in Supabase storage buckets.</p>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
                    {Object.entries(STORAGE_BUCKETS).map(([key, val]) => (
                        <Button
                            key={val}
                            variant={selectedBucket === val ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedBucket(val)}
                        >
                            {key.replace('_', ' ')}
                        </Button>
                    ))}
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={16} />
                    <input
                        type="text"
                        placeholder="Search files..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-dark-900 border border-dark-750 rounded-lg pl-10 pr-4 py-2 text-body-sm text-white focus:outline-none focus:border-orange-primary"
                    />
                </div>
            </div>

            {/* File List Grid */}
            {isLoading ? (
                <PageLoader label="Fetching files..." />
            ) : filteredFiles.length === 0 ? (
                <EmptyState
                    icon={<FolderOpen size={48} className="text-dark-700" />}
                    title="No files found"
                    description={`No files uploaded yet in the "${selectedBucket}" bucket.`}
                />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredFiles.map((file) => {
                        const isImage = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(file.name)
                        return (
                            <Card key={file.name} variant="bordered" className="p-4 flex flex-col bg-dark-950/20 group relative">
                                <div className="aspect-video w-full rounded-lg bg-dark-900 border border-dark-800 overflow-hidden flex items-center justify-center relative mb-3">
                                    {isImage ? (
                                        <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <LinkIcon className="text-dark-500" size={32} />
                                    )}
                                </div>

                                <div className="space-y-1 flex-1 flex flex-col justify-between">
                                    <div>
                                        <p className="text-body-sm font-semibold text-white truncate" title={file.name}>
                                            {file.name.includes('_') ? file.name.substring(file.name.indexOf('_') + 1) : file.name}
                                        </p>
                                        <p className="text-[10px] text-dark-500 font-mono truncate">{file.name}</p>
                                    </div>

                                    <div className="flex gap-2 pt-3">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleCopyUrl(file.url)}
                                            className="flex-1 text-xs py-1"
                                            leftIcon={<Copy size={12} />}
                                        >
                                            Copy Link
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(file.name)}
                                            className="text-error hover:bg-red-950/20 hover:text-red-400 py-1"
                                        >
                                            <Trash2 size={12} />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
