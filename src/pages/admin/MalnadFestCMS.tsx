import { useState, useEffect } from 'react'
import { Trash2, Edit2, Globe, PlusCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { uploadFile } from '@/lib/supabase'
import { uploadBatchImages } from '@/lib/imageUploader'
import { malnadFestService } from '@/services/malnadFestService'
import { sponsorService } from '@/services/sponsorService'
import { Modal, Input, Button, PageLoader, Card } from '@/components/ui'
import toast from 'react-hot-toast'
import type { MalnadFest, Sponsor, MalnadFestContact } from '@/types'

export function MalnadFestCMS() {
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [festInfo, setFestInfo] = useState<MalnadFest | null>(null)

    // Form fields for Fest Details
    const [festName, setFestName] = useState('')
    const [theme, setTheme] = useState('')
    const [tagline, setTagline] = useState('')
    const [description, setDescription] = useState('')
    const [bannerUrls, setBannerUrls] = useState<string[]>([])
    const [logo, setLogo] = useState('')
    const [rulebookPdf, setRulebookPdf] = useState('')
    const [rulebookDocx, setRulebookDocx] = useState('')
    const [date, setDate] = useState('')
    const [venue, setVenue] = useState('')
    const [contacts, setContacts] = useState<MalnadFestContact[]>([])

    // Contact form inputs
    const [newContactName, setNewContactName] = useState('')
    const [newContactPhone, setNewContactPhone] = useState('')

    // Sponsors state
    const [sponsors, setSponsors] = useState<Sponsor[]>([])
    const [isSponsorModalOpen, setIsSponsorModalOpen] = useState(false)
    const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null)
    const [isSponsorSaving, setIsSponsorSaving] = useState(false)
    
    // Sponsor fields
    const [sponsorName, setSponsorName] = useState('')
    const [sponsorLogo, setSponsorLogo] = useState('')
    const [sponsorWebsite, setSponsorWebsite] = useState('')
    const [sponsorOrder, setSponsorOrder] = useState('0')

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const [festRes, sponsorRes] = await Promise.all([
                malnadFestService.getFestInfo(),
                sponsorService.getSponsors()
            ])

            console.log('[MalnadFestCMS] Fetch result:', festRes)

            if (festRes.data) {
                const info = festRes.data
                setFestInfo(info)
                setFestName(info.fest_name)
                setTheme(info.theme || '')
                setTagline(info.tagline || '')
                setDescription(info.description || '')
                console.log('[MalnadFestCMS] Raw banner from DB:', info.banner)
                console.log('[MalnadFestCMS] Banner type:', typeof info.banner)
                if (info.banner) {
                    try {
                        const parsed = JSON.parse(info.banner)
                        console.log('[MalnadFestCMS] Parsed banner:', parsed)
                        if (Array.isArray(parsed)) {
                            setBannerUrls(parsed)
                        } else {
                            setBannerUrls([info.banner])
                        }
                    } catch (e) {
                        console.log('[MalnadFestCMS] Banner parse failed, using raw:', info.banner)
                        setBannerUrls([info.banner])
                    }
                } else {
                    console.log('[MalnadFestCMS] No banner data in DB')
                    setBannerUrls([])
                }
                setLogo(info.logo || '')
                setRulebookPdf(info.rulebook_pdf || '')
                setRulebookDocx(info.rulebook_docx || '')
                setDate(info.date || '')
                setVenue(info.venue || '')
                setContacts(info.contacts || [])
            }
            setSponsors(sponsorRes.data || [])
        } catch (err: any) {
            console.error('[MalnadFestCMS] Fetch error:', err)
            toast.error('Error fetching CMS data')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleSaveFestInfo = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!festName.trim()) {
            toast.error('Fest Name is required')
            return
        }

        setIsSaving(true)
        const payload = {
            fest_name: festName,
            theme: theme || null,
            tagline: tagline || null,
            description: description || null,
            banner: bannerUrls.length > 0 ? JSON.stringify(bannerUrls) : null,
            logo: logo || null,
            rulebook_pdf: rulebookPdf || null,
            rulebook_docx: rulebookDocx || null,
            date: date || null,
            venue: venue || null,
            contacts: contacts,
        }

        console.log('[MalnadFestCMS] Saving payload:', payload)
        console.log('[MalnadFestCMS] Banner URLs state:', bannerUrls)
        console.log('[MalnadFestCMS] Banner field being saved:', payload.banner)

        try {
            if (festInfo) {
                const { data, error } = await malnadFestService.update(festInfo.id, payload)
                console.log('[MalnadFestCMS] Update result:', { data, error })
                if (error) throw new Error(error)
                toast.success('Fest details updated successfully!')
            } else {
                const { data, error } = await malnadFestService.create(payload)
                console.log('[MalnadFestCMS] Create result:', { data, error })
                if (error) throw new Error(error)
                toast.success('Fest details created successfully!')
            }
            fetchData()
        } catch (err: any) {
            console.error('[MalnadFestCMS] Save error:', err)
            toast.error(err.message || 'Failed to update details')
        } finally {
            setIsSaving(false)
        }
    }

    // Contacts helpers
    const addContact = () => {
        if (!newContactName.trim() || !newContactPhone.trim()) {
            toast.error('Both contact name and number/email are required')
            return
        }
        setContacts([...contacts, { name: newContactName.trim(), contact: newContactPhone.trim() }])
        setNewContactName('')
        setNewContactPhone('')
    }

    const removeContact = (idx: number) => {
        setContacts(contacts.filter((_, i) => i !== idx))
    }

    // Sponsors helpers
    const openAddSponsorModal = () => {
        setEditingSponsor(null)
        setSponsorName('')
        setSponsorLogo('')
        setSponsorWebsite('')
        setSponsorOrder('0')
        setIsSponsorModalOpen(true)
    }

    const openEditSponsorModal = (sponsor: Sponsor) => {
        setEditingSponsor(sponsor)
        setSponsorName(sponsor.name)
        setSponsorLogo(sponsor.logo || '')
        setSponsorWebsite(sponsor.website || '')
        setSponsorOrder(String(sponsor.order_index))
        setIsSponsorModalOpen(true)
    }

    const handleSponsorSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!sponsorName.trim()) {
            toast.error('Sponsor name is required')
            return
        }

        setIsSponsorSaving(true)
        const payload = {
            name: sponsorName,
            logo: sponsorLogo || null,
            website: sponsorWebsite || null,
            order_index: parseInt(sponsorOrder) || 0,
        }

        try {
            if (editingSponsor) {
                const { error } = await sponsorService.update(editingSponsor.id, payload)
                if (error) throw new Error(error)
                toast.success('Sponsor updated!')
            } else {
                const { error } = await sponsorService.create(payload)
                if (error) throw new Error(error)
                toast.success('Sponsor added!')
            }
            setIsSponsorModalOpen(false)
            fetchData()
        } catch (err: any) {
            toast.error(err.message || 'Failed to save sponsor')
        } finally {
            setIsSponsorSaving(false)
        }
    }

    const handleDeleteSponsor = async (sponsor: Sponsor) => {
        if (confirm(`Are you sure you want to remove sponsor "${sponsor.name}"?`)) {
            try {
                const { error } = await sponsorService.delete(sponsor.id)
                if (error) throw new Error(error)
                toast.success('Sponsor removed.')
                fetchData()
            } catch (err: any) {
                toast.error(err.message || 'Failed to remove sponsor')
            }
        }
    }

    if (isLoading) {
        return <PageLoader label="Loading Fest CMS..." />
    }

    return (
        <div className="space-y-12">
            <div>
                <h1 className="text-h2 text-white font-bold">Malnad Fest & Sponsors CMS</h1>
                <p className="text-body-sm text-dark-400 mt-1">Manage the theme, rulebooks, contacts, highlights, and sponsors for Malnad Fest.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Malnad Fest Editor Form */}
                <div className="lg:col-span-2 space-y-6">
                    <Card variant="bordered" className="p-6 bg-dark-950/20">
                        <h2 className="text-h4 text-white font-semibold mb-6 pb-2 border-b border-dark-850">Fest Configuration</h2>
                        <form onSubmit={handleSaveFestInfo} className="space-y-6">
                            <Input
                                label="Fest Name"
                                value={festName}
                                onChange={(e) => setFestName(e.target.value)}
                                placeholder="e.g. THE MALNAD FEST"
                                required
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Fest Theme"
                                    value={theme}
                                    onChange={(e) => setTheme(e.target.value)}
                                    placeholder="e.g. Uplifting Culture & Heritage"
                                />
                                <Input
                                    label="Fest Tagline / Subtitle"
                                    value={tagline}
                                    onChange={(e) => setTagline(e.target.value)}
                                    placeholder="e.g. The biggest fest in the college"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Fest Dates"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    placeholder="e.g. Even Semester (Annually) / April 24-26"
                                />
                                <Input
                                    label="Fest Venue"
                                    value={venue}
                                    onChange={(e) => setVenue(e.target.value)}
                                    placeholder="e.g. Malnad College of Engineering Campus"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  {/* Banner Upload */}
                                  <div className="flex flex-col space-y-4 md:col-span-2 border-t border-dark-800 pt-6 mt-4">
                                      <div>
                                          <h4 className="text-body-md font-semibold text-white uppercase tracking-wider mb-1">
                                              Fest Banner Slideshow Images
                                          </h4>
                                          <p className="text-caption text-dark-400 mb-3">
                                              Upload and manage images displayed in the Malnad Fest hero slideshow banner.
                                          </p>
                                      </div>

                                      <div className="bg-dark-900 border border-dark-800 rounded-xl p-4 space-y-2">
                                          <label className="block text-body-sm font-semibold text-white mb-1">Upload Banner Images (Multiple Selection Supported)</label>
                                          <input
                                              type="file"
                                              accept="image/*"
                                              multiple
                                              onChange={async (e) => {
                                                  const files = Array.from(e.target.files || [])
                                                  e.target.value = ''
                                                  if (files.length === 0) return

                                                  const tid = toast.loading(`Preparing ${files.length} banner image(s)...`)

                                                  try {
                                                      const urls = await uploadBatchImages('settings', 'fest_banners', files, (completed, total, name) => {
                                                          toast.loading(`Uploaded ${completed} of ${total}: ${name}`, { id: tid })
                                                      })

                                                      if (urls && urls.length > 0) {
                                                          setBannerUrls(prev => [...prev, ...urls])
                                                          toast.success(`${urls.length} banner image(s) processed & added!`, { id: tid })
                                                      } else {
                                                          toast.error('No valid images were uploaded', { id: tid })
                                                      }
                                                  } catch (err: any) {
                                                      console.error('[MalnadFestCMS] Banner upload exception:', err)
                                                      toast.error(`Upload error: ${err?.message || 'Failed'}`, { id: tid })
                                                  }
                                              }}
                                              className="block w-full text-body-sm text-dark-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-body-sm file:font-semibold file:bg-orange-primary file:text-black hover:file:bg-orange-dark cursor-pointer bg-dark-950 border border-dark-700 rounded-lg p-2"
                                          />
                                          <p className="text-[11px] text-dark-400">Hold Ctrl or Shift to select multiple images at once (JPG, PNG, WebP, GIF).</p>
                                      </div>

                                      {/* Preview grid */}
                                      {bannerUrls.length > 0 ? (
                                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-dark-900/40 rounded-xl border border-dark-850">
                                              {bannerUrls.map((url, idx) => (
                                                  <div key={`${url}-${idx}`} className="relative aspect-[21/9] rounded-lg overflow-hidden border border-dark-800 bg-dark-900 group">
                                                      <img src={url} alt={`Banner ${idx + 1}`} className="w-full h-full object-cover" />
                                                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-1.5 p-2">
                                                          {idx > 0 && (
                                                              <button
                                                                  type="button"
                                                                  onClick={() => setBannerUrls(prev => {
                                                                      if (idx <= 0) return prev
                                                                      const next = [...prev]
                                                                      const item = next[idx]
                                                                      const prevItem = next[idx - 1]
                                                                      if (item !== undefined && prevItem !== undefined) {
                                                                          next[idx] = prevItem
                                                                          next[idx - 1] = item
                                                                      }
                                                                      return next
                                                                  })}
                                                                  className="p-1.5 bg-dark-800 hover:bg-dark-700 text-white rounded-full transition-colors cursor-pointer"
                                                                  title="Move Left"
                                                              >
                                                                  <ChevronLeft size={14} />
                                                              </button>
                                                          )}

                                                          <label className="p-1.5 bg-dark-800 hover:bg-dark-700 text-white rounded-full transition-colors cursor-pointer" title="Replace Image">
                                                              <Edit2 size={14} />
                                                              <input
                                                                  type="file"
                                                                  accept="image/*"
                                                                  className="hidden"
                                                                  onChange={async (e) => {
                                                                      const file = e.target.files?.[0]
                                                                      if (file) {
                                                                          const tid = toast.loading('Replacing image...')
                                                                          try {
                                                                              const urls = await uploadBatchImages('settings', 'fest_banners', [file])
                                                                              if (urls && urls.length > 0 && urls[0]) {
                                                                                  const replacementUrl = urls[0]
                                                                                  setBannerUrls(prev => {
                                                                                      const next = [...prev]
                                                                                      next[idx] = replacementUrl
                                                                                      return next
                                                                                  })
                                                                                  toast.success('Image replaced!', { id: tid })
                                                                              } else {
                                                                                  toast.error('Failed to replace image', { id: tid })
                                                                              }
                                                                          } catch (err) {
                                                                              toast.error('Error replacing image', { id: tid })
                                                                          }
                                                                      }
                                                                  }}
                                                              />
                                                          </label>

                                                          {idx < bannerUrls.length - 1 && (
                                                              <button
                                                                  type="button"
                                                                  onClick={() => setBannerUrls(prev => {
                                                                      if (idx >= prev.length - 1) return prev
                                                                      const next = [...prev]
                                                                      const item = next[idx]
                                                                      const nextItem = next[idx + 1]
                                                                      if (item !== undefined && nextItem !== undefined) {
                                                                          next[idx] = nextItem
                                                                          next[idx + 1] = item
                                                                      }
                                                                      return next
                                                                  })}
                                                                  className="p-1.5 bg-dark-800 hover:bg-dark-700 text-white rounded-full transition-colors cursor-pointer"
                                                                  title="Move Right"
                                                              >
                                                                  <ChevronRight size={14} />
                                                              </button>
                                                          )}

                                                          <button
                                                              type="button"
                                                              onClick={() => setBannerUrls(prev => prev.filter((_, i) => i !== idx))}
                                                              className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors cursor-pointer"
                                                              title="Remove Image"
                                                          >
                                                              <Trash2 size={14} />
                                                          </button>
                                                      </div>
                                                      <div className="absolute bottom-1.5 left-2 px-2 py-0.5 bg-black/70 rounded text-[10px] text-white font-mono">
                                                          Slide {idx + 1}
                                                      </div>
                                                  </div>
                                              ))}
                                          </div>
                                      ) : (
                                          <div className="text-center py-8 rounded-lg border border-dashed border-dark-800 bg-dark-950 text-body-sm text-dark-500">
                                              No banner images uploaded yet. Use the file selector above to add banner images.
                                          </div>
                                      )}
                                  </div>

                                {/* Logo Upload */}
                                <div className="flex flex-col space-y-2">
                                    <label className="block text-body-sm font-medium text-dark-200">Fest Logo</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0]
                                            if (file) {
                                                const url = await uploadFile('settings', `fest/logo_${Date.now()}_${file.name}`, file, { upsert: true })
                                                if (url) setLogo(url)
                                            }
                                        }}
                                        className="text-dark-400 text-sm"
                                    />
                                    {logo && <img src={logo} alt="Preview" className="h-16 object-contain rounded mt-2" />}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Rulebook PDF Upload */}
                                <div className="flex flex-col space-y-2">
                                    <label className="block text-body-sm font-medium text-dark-200">Rulebook PDF</label>
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0]
                                            if (file) {
                                                const url = await uploadFile('documents', `fest/pdf_${Date.now()}_${file.name}`, file, { upsert: true })
                                                if (url) setRulebookPdf(url)
                                            }
                                        }}
                                        className="text-dark-400 text-sm"
                                    />
                                    {rulebookPdf && <p className="text-[11px] text-orange-primary truncate">{rulebookPdf}</p>}
                                </div>

                                {/* Rulebook DOCX Upload */}
                                <div className="flex flex-col space-y-2">
                                    <label className="block text-body-sm font-medium text-dark-200">Rulebook DOCX / Other Details</label>
                                    <input
                                        type="file"
                                        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0]
                                            if (file) {
                                                const url = await uploadFile('documents', `fest/docx_${Date.now()}_${file.name}`, file, { upsert: true })
                                                if (url) setRulebookDocx(url)
                                            }
                                        }}
                                        className="text-dark-400 text-sm"
                                    />
                                    {rulebookDocx && <p className="text-[11px] text-orange-primary truncate">{rulebookDocx}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-body-sm font-medium text-dark-200 mb-1">Fest Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full bg-dark-900 border border-dark-750 focus:border-orange-primary focus:ring-1 focus:ring-orange-primary rounded-lg p-3 text-body-sm text-white placeholder-dark-600 focus:outline-none min-h-[120px]"
                                    placeholder="Enter full description..."
                                />
                            </div>

                            {/* Contacts Builder */}
                            <div className="space-y-4 pt-4 border-t border-dark-850">
                                <h3 className="text-body-lg font-semibold text-white">Contacts Management</h3>
                                
                                <div className="space-y-2">
                                    {contacts.map((c, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-dark-900 p-3 rounded-lg border border-dark-800">
                                            <div className="text-body-sm text-white">
                                                <span className="font-semibold text-orange-primary">{c.name}:</span> {c.contact}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeContact(idx)}
                                                className="p-1 rounded hover:bg-dark-800 text-dark-400 hover:text-red-500 cursor-pointer"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newContactName}
                                        onChange={(e) => setNewContactName(e.target.value)}
                                        placeholder="Role (e.g. Coordinator)"
                                        className="flex-1 bg-dark-900 border border-dark-750 rounded-lg p-2.5 text-body-sm text-white"
                                    />
                                    <input
                                        type="text"
                                        value={newContactPhone}
                                        onChange={(e) => setNewContactPhone(e.target.value)}
                                        placeholder="Phone/Email"
                                        className="flex-1 bg-dark-900 border border-dark-750 rounded-lg p-2.5 text-body-sm text-white"
                                    />
                                    <Button type="button" variant="outline" onClick={addContact} className="cursor-pointer">
                                        Add
                                    </Button>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-dark-850">
                                <Button type="submit" variant="primary" disabled={isSaving} className="cursor-pointer">
                                    {isSaving ? 'Saving Changes...' : 'Save Fest Details'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>

                {/* Sponsors Sidebar Manager */}
                <div className="space-y-6">
                    <Card variant="bordered" className="p-6 bg-dark-950/20 h-full">
                        <div className="flex justify-between items-center mb-6 pb-2 border-b border-dark-850">
                            <h2 className="text-h4 text-white font-semibold">Fest Sponsors</h2>
                            <Button 
                                type="button" 
                                variant="outline" 
                                size="sm" 
                                leftIcon={<PlusCircle size={16} />} 
                                onClick={openAddSponsorModal}
                                className="cursor-pointer"
                            >
                                Add Sponsor
                            </Button>
                        </div>

                        {sponsors.length === 0 ? (
                            <div className="text-center py-12 text-dark-500 space-y-2">
                                <Globe size={32} className="mx-auto text-dark-700" />
                                <p className="text-body-sm">No sponsors added yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                                {sponsors.map((sp) => (
                                    <div key={sp.id} className="flex items-center justify-between bg-dark-900 p-4 rounded-xl border border-dark-800">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded bg-white flex items-center justify-center overflow-hidden shrink-0 border border-dark-750">
                                                {sp.logo ? (
                                                    <img src={sp.logo} alt="" className="max-w-[80%] max-h-[80%] object-contain" />
                                                ) : (
                                                    <Globe size={18} className="text-dark-500" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-body-sm font-semibold text-white">{sp.name}</p>
                                                {sp.website && (
                                                    <a href={sp.website} target="_blank" rel="noreferrer" className="text-[10px] text-orange-primary flex items-center gap-0.5 truncate max-w-[150px]">
                                                        {sp.website}
                                                    </a>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex gap-1 shrink-0">
                                            <button
                                                onClick={() => openEditSponsorModal(sp)}
                                                className="p-1.5 rounded hover:bg-dark-800 text-dark-400 hover:text-white cursor-pointer"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteSponsor(sp)}
                                                className="p-1.5 rounded hover:bg-red-950/20 text-dark-400 hover:text-red-500 cursor-pointer"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            {/* Sponsor Modal */}
            <Modal
                isOpen={isSponsorModalOpen}
                onClose={() => setIsSponsorModalOpen(false)}
                title={editingSponsor ? 'Edit Sponsor' : 'Add Sponsor'}
                size="sm"
            >
                <form onSubmit={handleSponsorSubmit} className="space-y-4 pt-2">
                    <Input
                        label="Sponsor Name"
                        value={sponsorName}
                        onChange={(e) => setSponsorName(e.target.value)}
                        placeholder="e.g. Coca Cola"
                        required
                    />
                    <Input
                        label="Logo URL"
                        value={sponsorLogo}
                        onChange={(e) => setSponsorLogo(e.target.value)}
                        placeholder="https://example.com/logo.png"
                    />
                    <Input
                        label="Website"
                        value={sponsorWebsite}
                        onChange={(e) => setSponsorWebsite(e.target.value)}
                        placeholder="https://sponsor.com"
                    />
                    <Input
                        label="Display Order (Index)"
                        type="number"
                        value={sponsorOrder}
                        onChange={(e) => setSponsorOrder(e.target.value)}
                        placeholder="0"
                    />

                    <div className="flex justify-end gap-3 pt-4 border-t border-dark-800">
                        <Button variant="ghost" onClick={() => setIsSponsorModalOpen(false)} disabled={isSponsorSaving} className="cursor-pointer">
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" disabled={isSponsorSaving} className="cursor-pointer">
                            {isSponsorSaving ? 'Saving...' : 'Save Sponsor'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
