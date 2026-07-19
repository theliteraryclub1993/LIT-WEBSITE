export interface NoesisEdition {
  id: string
  title: string
  edition_number: string
  description: string | null
  cover_image: string | null
  pdf_file: string | null
  publish_date: string
  is_current: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export type NoesisEditionCreateInput = Omit<NoesisEdition, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>
export type NoesisEditionUpdateInput = Partial<NoesisEditionCreateInput>

export interface MalnadFestContact {
  name: string
  contact: string
}

export interface MalnadFest {
  id: string
  fest_name: string
  theme: string | null
  tagline: string | null
  description: string | null
  banner: string | null
  logo: string | null
  rulebook_pdf: string | null
  rulebook_docx: string | null
  date: string | null
  venue: string | null
  contacts: MalnadFestContact[]
  created_at: string
  updated_at: string
}

export type MalnadFestUpdateInput = Partial<Omit<MalnadFest, 'id' | 'created_at' | 'updated_at'>>

export interface Sponsor {
  id: string
  name: string
  logo: string | null
  website: string | null
  order_index: number
  created_at: string
  updated_at: string
}

export type SponsorCreateInput = Omit<Sponsor, 'id' | 'created_at' | 'updated_at'>
export type SponsorUpdateInput = Partial<SponsorCreateInput>

export interface SparkSpeaker {
  id: string
  name: string
  designation: string
  topic: string
  description: string | null
  image_url: string | null
  video_url: string | null
  talk_date: string
  order_index: number
  created_at: string
  updated_at: string
}

export type SparkSpeakerCreateInput = Omit<SparkSpeaker, 'id' | 'created_at' | 'updated_at'>
export type SparkSpeakerUpdateInput = Partial<SparkSpeakerCreateInput>
