export interface Lead {
    id: string
    email: string
    startup_url: string
    gateway: string
    motivation: string
    submitted_at: string
}

export interface LeadStats {
    total: number
    byGateway: Record<string, number>
    byMotivation: Record<string, number>
    byDay: Record<string, number>
}
