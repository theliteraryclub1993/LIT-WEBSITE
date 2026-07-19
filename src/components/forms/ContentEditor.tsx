import { useState, useRef, useCallback } from 'react'
import { cn } from '@/utils/cn'
import {
    Bold,
    Italic,
    Underline,
    List,
    ListOrdered,
    Quote,
    Code,
    Link2,
    Image,
    Heading1,
    Heading2,
    Heading3,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Undo,
    Redo,
    Minus,
    Type,
    Pilcrow,
} from 'lucide-react'

interface ToolbarAction {
    label: string
    icon: React.ReactNode
    action: () => void
    separator?: boolean
    group?: string
}

/**
 * Simple HTML content editor with a formatting toolbar.
 * Inserts HTML tags into a textarea. Provides both "Visual" (WYSIWYG-style toolbar) and "Code" (raw HTML) modes.
 * Production-ready for editorial blog content.
 */
export function ContentEditor({
    value,
    onChange,
    placeholder,
    className,
    minHeight = 300,
}: {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
    minHeight?: number
}) {
    const editorRef = useRef<HTMLTextAreaElement>(null)
    const [mode, setMode] = useState<'visual' | 'code'>('visual')
    const [history, setHistory] = useState<string[]>([value])
    const [historyIndex, setHistoryIndex] = useState(0)

    const insertAtCursor = useCallback((insertFn: (text: string) => string) => {
        const textarea = editorRef.current
        if (!textarea) return

        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const before = value.substring(0, start)
        const after = value.substring(end)

        const updated = insertFn(before) + after
        const newCursorPos = before.length

        onChange(updated)

        // Restore cursor position
        requestAnimationFrame(() => {
            textarea.selectionStart = newCursorPos
            textarea.selectionEnd = newCursorPos
        })

        textarea.focus()
    }, [value, onChange])

    const pushHistory = useCallback(() => {
        setHistory(prev => [...prev, value])
        setHistoryIndex(prev => Math.min(prev + 1, history.length))
    }, [value, history.length])

    const undo = useCallback(() => {
        if (historyIndex > 0) {
            const prevValue = history[historyIndex - 1]
            if (prevValue !== undefined) {
                onChange(prevValue)
                setHistoryIndex(prev => prev - 1)
            }
        }
    }, [history, historyIndex, onChange])

    const redo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            const nextValue = history[historyIndex + 1]
            if (nextValue !== undefined) {
                onChange(nextValue)
                setHistoryIndex(prev => prev + 1)
            }
        }
    }, [history, historyIndex, onChange])

    // Keyboard shortcuts
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
            e.preventDefault()
            undo()
        }
        if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'z') {
            e.preventDefault()
            redo()
        }
        if ((e.metaKey || e.ctrlKey) && e.key === 's') {
            e.preventDefault()
            pushHistory()
        }
    }

    const wrapSelection = (tag: string) => {
        insertAtCursor(before => {
            return `${before}<${tag}>`
        })
    }

    const insertBlock = (tag: string) => {
        insertAtCursor(before => {
            return `${before}\n<${tag}>\n`
        })
    }

    const insertInline = (tag: string) => {
        insertAtCursor(before => {
            return `${before}<${tag}>`
        })
    }

    const insertLine = () => {
        insertAtCursor(before => `${before}\n`)
    }

    const insertDivider = () => {
        insertAtCursor(before => `${before}\n<hr />\n`)
    }

    const toolbarGroups: ToolbarAction[][] = [
        // Block elements
        [
            { label: 'H1', icon: <Heading1 size={16} />, action: () => insertBlock('h1'), group: 'Blocks' },
            { label: 'H2', icon: <Heading2 size={16} />, action: () => insertBlock('h2'), group: 'Blocks' },
            { label: 'H3', icon: <Heading3 size={16} />, action: () => insertBlock('h3'), group: 'Blocks' },
            { label: 'Paragraph', icon: <Pilcrow size={16} />, action: () => insertBlock('p'), group: 'Blocks' },
            { label: 'Divider', icon: <Minus size={16} />, action: insertDivider, separator: true, group: 'Blocks' },
        ],
        // Inline formatting
        [
            { label: 'Bold', icon: <Bold size={16} />, action: () => wrapSelection('strong') },
            { label: 'Italic', icon: <Italic size={16} />, action: () => wrapSelection('em') },
            { label: 'Underline', icon: <Underline size={16} />, action: () => wrapSelection('u') },
            { label: 'Strikethrough', icon: <Type size={16} />, action: () => wrapSelection('s') },
            { label: 'Link', icon: <Link2 size={16} />, action: () => wrapSelection('a href=""'), separator: true, group: 'Inline' },
        ],
        // Lists
        [
            { label: 'Bullet List', icon: <List size={16} />, action: () => insertBlock('ul'), group: 'Lists' },
            { label: 'Numbered List', icon: <ListOrdered size={16} />, action: () => insertBlock('ol'), group: 'Lists' },
            { label: 'Blockquote', icon: <Quote size={16} />, action: () => insertBlock('blockquote'), group: 'Lists' },
            { label: 'Code Block', icon: <Code size={16} />, action: () => insertBlock('pre'), separator: true, group: 'Blocks' },
        ],
        // Insert
        [
            { label: 'Image', icon: <Image size={16} />, action: () => insertInline('img src="" alt="" /'), group: 'Insert' },
            { label: 'Line Break', icon: <Minus size={16} />, action: insertLine, separator: true, group: 'Insert' },
        ],
        // Alignment
        [
            { label: 'Left', icon: <AlignLeft size={16} />, action: () => insertInline('<p style="text-align: left">') },
            { label: 'Center', icon: <AlignCenter size={16} />, action: () => insertInline('<p style="text-align: center">') },
            { label: 'Right', icon: <AlignRight size={16} />, action: () => insertInline('<p style="text-align: right">') },
        ],
        // History
        [
            { label: 'Undo', icon: <Undo size={16} />, action: undo },
            { label: 'Redo', icon: <Redo size={16} />, action: redo },
        ],
    ]

return (
    <div className={cn('border border-dark-700 rounded-xl overflow-hidden bg-dark-900 focus-within focus-within-ring-2 focus-within-ring-orange-primary focus-within-ring-offset-0 focus-within-ring-offset-2', className)}>
        {/* Toolbar */}
        {mode === 'visual' && (
            <div className="flex flex-wrap items-center gap-0.5 p-1.5 border-b border-dark-700 bg-dark-950 overflow-x-auto scrollbar-hide">
                {toolbarGroups.map((group, groupIdx) => (
                    <div key={groupIdx || Math.random()} className="flex items-center">
                        {group.map((item, itemIdx) => (
                            <button
                                key={item.label}
                                type="button"
                                title={item.label}
                                onClick={item.action}
                                className={cn(
                                    'p-2 rounded-md text-dark-400 hover:text-white hover:bg-dark-800 transition-all duration-150 text-sm shrink-0',
                                    item.group && groupIdx > 0 && itemIdx === 0 && 'ml-2 pl-2 border-l border-dark-700'
                                )}
                            >
                                {item.icon}
                            </button>
                        ))}
                    </div>
                ))}
            </div>
        )}

        {/* Mode Toggle + History Bar */}
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-dark-800 bg-dark-950">
            <div className="flex items-center gap-1">
                <button
                    type="button"
                    onClick={() => { setMode(mode => mode === 'visual' ? 'code' : 'visual'); pushHistory() }}
                    className={cn(
                        'text-caption uppercase tracking-widest px-2.5 py-1 rounded transition-colors',
                        mode === 'visual'
                            ? 'text-orange-primary bg-orange-subtle'
                            : 'text-dark-500 hover:text-dark-300 hover:bg-dark-800'
                    )}
                >
                    {mode === 'visual' ? 'Visual' : 'HTML'}
                </button>
                <span className="text-caption text-dark-600 ml-2">
                    {mode === 'visual' ? 'Formatting toolbar active — use HTML mode for advanced control' : 'Writing raw HTML — use Visual mode for formatting'}
                </span>
            </div>

            {mode === 'code' && (
                <div className="flex items-center gap-1">
                    <span className="text-caption text-dark-600 tabular-nums">
                        {value.length} chars
                    </span>
                    <span className="text-caption text-dark-700">|</span>
                    <span className="text-caption text-dark-600">Lines: {value.split('\n').length}</span>
                </div>
            )}
        </div>

        {/* Editor Area */}
        {mode === 'visual' ? (
            <div
                className="prose-editorial p-6 focus:outline-none min-h-[300px]"
                dangerouslySetInnerHTML={{ __html: value || '<p class="text-dark-400 italic">Start writing...</p>' }}
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => {
                    onChange(e.currentTarget.innerHTML)
                }}
                onBlur={() => pushHistory()}
            />
        ) : (
            <textarea
                ref={editorRef}
                value={value}
                onChange={(e) => { onChange(e.target.value); pushHistory() }}
                onKeyDown={handleKeyDown}
                placeholder={placeholder || 'Write HTML content here...'}
                className={cn(
                    'w-full bg-dark-900 text-white placeholder-dark-500 font-mono text-sm p-6 resize-y focus:outline-none',
                    className
                )}
                style={{ minHeight: Math.max(minHeight, 300) }}
            />
        )}

        {/* Word count bar (Visual mode only) */}
        {mode === 'visual' && (
            <div className="flex items-center justify-between px-4 py-2 border-t border-dark-800 bg-dark-950 text-caption text-dark-500">
                <span>Tip: Select text and use toolbar to format. Switch to HTML for advanced control.</span>
                <span className="tabular-nums">
                    {value.length} chars · {value.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length} words
                </span>
            </div>
        )}
    </div>
    )
}
