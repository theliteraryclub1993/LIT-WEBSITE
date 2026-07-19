export const ROLE_ORDER = [
    'Student President',
    'Student Vice President',
    'Joint Secretaries',
    'Creative Director',
    'Event Director',
    'Designer in Chief',
    'Treasurer',
    'Co-treasurer and Social media manager',
    'Creative Heads',
    'Editorial Heads',
    'Event Manager',
    'Event Manager and Co-editorial Head',
    'Digital Head',
    'Database Manager',
    'Photography Head',
    'Assistant Coordinators',
    'Junior Wing',
    'Alumni'
]

export const isAlumniMember = <T extends { department?: string | null; role?: string | null }>(member: T): boolean => {
    if (!member) return false
    const dept = (member.department || '').toLowerCase().trim()
    const role = (member.role || '').toLowerCase().trim()
    return dept === 'alumni' || dept.startsWith('alumni -') || dept.startsWith('alumni-') || role.includes('alumn') || role.includes('former')
}

/**
 * Extract the passed-out year from an alumni member's department field.
 * e.g. "Alumni - 2024" → 2024, "Alumni" → null
 */
export const getAlumniBatchYear = (department: string | null | undefined): number | null => {
    if (!department) return null
    const match = department.match(/alumni\s*[-–]\s*(\d{4})/i)
    return (match && match[1]) ? parseInt(match[1], 10) : null
}

export const normalizeRole = (role: string): string => {
    const r = role.toLowerCase().trim()
    if (r.includes('alumn') || r.includes('former')) return 'alumni'
    if (r.includes('president') && !r.includes('vice')) return 'student president'
    if (r.includes('vice president') || r.includes('vice-president')) return 'student vice president'
    if (r.includes('joint') || r.includes('secretar') || r.includes('secretor')) return 'joint secretaries'
    if (r.includes('creative director')) return 'creative director'
    if (r.includes('event director')) return 'event director'
    if (r.includes('designer in chief')) return 'designer in chief'
    if (r.includes('co-treasurer') || r.includes('co treasurer')) return 'co-treasurer and social media manager'
    if (r === 'treasurer' || (r.includes('treasurer') && !r.includes('co'))) return 'treasurer'
    if (r.includes('creative head')) return 'creative heads'
    if (r.includes('editorial head') && !r.includes('event manager')) return 'editorial heads'
    if (r.includes('event manager') && r.includes('co-editorial')) return 'event manager and co-editorial head'
    if (r.includes('event manager')) return 'event manager'
    if (r.includes('digital head')) return 'digital head'
    if (r.includes('database manager')) return 'database manager'
    if (r.includes('photography head')) return 'photography head'
    if (r.includes('assistant coordinator')) return 'assistant coordinators'
    if (r.includes('junior')) return 'junior wing'
    return r
}

export const getRolePriority = (role: string | null | undefined): number => {
    if (!role) return 999
    const normalized = normalizeRole(role)
    const idx = ROLE_ORDER.findIndex(r => r.toLowerCase() === normalized)
    return idx === -1 ? 998 : idx
}

export const sortMembersByRole = <T extends { role?: string | null; name?: string | null }>(a: T, b: T): number => {
    const priorityA = getRolePriority(a.role)
    const priorityB = getRolePriority(b.role)
    if (priorityA !== priorityB) {
        return priorityA - priorityB
    }
    return (a.name || '').localeCompare(b.name || '')
}
