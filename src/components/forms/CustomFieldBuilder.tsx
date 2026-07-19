import { useState } from 'react'
import { X, Plus, GripVertical, Trash2 } from 'lucide-react'
import { Button, Input, Select, Switch, Card } from '@/components/ui'
import type { EventCustomField } from '@/types'

interface CustomFieldBuilderProps {
    fields: EventCustomField[]
    onChange: (fields: EventCustomField[]) => void
}

const fieldTypes = [
    { label: 'Short Text', value: 'text' },
    { label: 'Email', value: 'email' },
    { label: 'Number', value: 'number' },
    { label: 'Phone', value: 'tel' },
    { label: 'Long Text', value: 'textarea' },
    { label: 'Dropdown', value: 'select' },
    { label: 'Multi-Select', value: 'multiselect' },
    { label: 'Checkbox', value: 'checkbox' },
    { label: 'URL', value: 'url' },
]

/**
 * Dynamic schema builder for event registration custom fields.
 * Admins use this to define what extra information to collect during registration.
 */
export function CustomFieldBuilder({ fields, onChange }: CustomFieldBuilderProps) {
    const [newOptionText, setNewOptionText] = useState<Record<string, string>>({})

    const addField = () => {
        const newField: EventCustomField = {
            label: '',
            name: `field_${Date.now()}`,
            type: 'text',
            required: false,
            options: [],
        }
        onChange([...fields, newField])
    }

    const updateField = (index: number, updates: Partial<EventCustomField>) => {
        const updated = fields.map((f, i) => (i === index ? { ...f, ...updates } : f))
        onChange(updated)
    }

    const removeField = (index: number) => {
        onChange(fields.filter((_, i) => i !== index))
    }

    const addOption = (fieldIndex: string) => {
        const optionText = newOptionText[fieldIndex]?.trim()
        if (!optionText) return

        const idx = fields.findIndex(f => f.name === fieldIndex)
        if (idx === -1) return

        const field = fields[idx]
        if (!field || !field.options) return

        updateField(idx, { options: [...field.options, optionText] })
        setNewOptionText(prev => ({ ...prev, [fieldIndex]: '' }))
    }

    const removeOption = (fieldIndex: number, optionIndex: number) => {
        const field = fields[fieldIndex]
        if (!field || !field.options) return

        updateField(fieldIndex, {
            options: field.options.filter((_, i) => i !== optionIndex),
        })
    }

    // Auto-generate name from label
    const handleLabelChange = (index: number, label: string) => {
        const name = label
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '_')
            .replace(/_+/g, '_')
            .trim()

        updateField(index, { label, name: name || `field_${index}` })
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="text-body-sm text-white font-medium">Custom Registration Fields</h4>
                    <p className="text-caption text-dark-500">Define additional data to collect during registration.</p>
                </div>
                <Button variant="outline" size="sm" leftIcon={<Plus size={14} />} onClick={addField}>
                    Add Field
                </Button>
            </div>

            {!fields.length && (
                <div className="border border-dashed border-dark-700 rounded-lg p-6 text-center">
                    <p className="text-body-sm text-dark-500">No custom fields added. Only Name and Email will be collected.</p>
                </div>
            )}

            <div className="space-y-3">
                {fields.map((field, index) => (
                    <Card key={field.name} variant="bordered" padding="md" className="relative group">
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab text-dark-600">
                            <GripVertical size={16} />
                        </div>

                        <button
                            onClick={() => removeField(index)}
                            className="absolute top-3 right-3 p-1 rounded text-dark-600 hover:text-error transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 size={14} />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4">
                            <Input
                                placeholder="Field Label (e.g., College Name)"
                                value={field.label}
                                onChange={(e) => handleLabelChange(index, e.target.value)}
                                size="sm"
                            />

                            <div className="flex gap-2">
                                <Select
                                    options={fieldTypes}
                                    value={field.type}
                                    onChange={(e) => updateField(index, { type: e.target.value as EventCustomField['type'], options: field.type.includes('select') ? field.options : undefined })}
                                    size="sm"
                                    className="flex-1"
                                />
                                <div className="flex items-center gap-2 px-2">
                                    <Switch
                                        checked={field.required}
                                        onChange={(checked) => updateField(index, { required: checked })}
                                        size="sm"
                                    />
                                    <span className="text-caption text-dark-400 whitespace-nowrap">Req</span>
                                </div>
                            </div>

                            {/* Options for Select/Multiselect */}
                            {(field.type === 'select' || field.type === 'multiselect') && (
                                <div className="md:col-span-2 mt-2 pl-0">
                                    <p className="text-caption text-dark-500 mb-2">Options:</p>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {field.options?.map((opt, optIdx) => (
                                            <span key={optIdx} className="inline-flex items-center gap-1 bg-dark-800 text-dark-200 text-caption px-2.5 py-1 rounded-md border border-dark-700">
                                                {opt}
                                                <button onClick={() => removeOption(index, optIdx)} className="text-dark-500 hover:text-error">
                                                    <X size={12} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Add option..."
                                            value={newOptionText[field.name] || ''}
                                            onChange={(e) => setNewOptionText(prev => ({ ...prev, [field.name]: e.target.value }))}
                                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addOption(field.name) } }}
                                            className="flex-1 bg-dark-800 border border-dark-700 text-sm rounded-md px-3 py-1.5 text-white placeholder-dark-500 focus:outline-none focus:border-orange-primary"
                                        />
                                        <Button variant="ghost" size="xs" onClick={() => addOption(field.name)}>
                                            <Plus size={14} />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}