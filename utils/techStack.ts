export interface TechItem {
  id: string
  name: string
  category: 'frontend' | 'backend' | 'database' | 'devops' | 'ai' | 'payments' | 'other'
  iconSvg?: string
  color?: string
}

export const TECH_CATALOG: TechItem[] = [
  // Frontend
  { id: 'vue', name: 'Vue.js', category: 'frontend', color: '#42b883' },
  { id: 'nuxt', name: 'Nuxt', category: 'frontend', color: '#00DC82' },
  { id: 'react', name: 'React', category: 'frontend', color: '#61DAFB' },
  { id: 'nextjs', name: 'Next.js', category: 'frontend', color: '#FFFFFF' },
  { id: 'svelte', name: 'Svelte', category: 'frontend', color: '#FF3E00' },
  { id: 'astro', name: 'Astro', category: 'frontend', color: '#BC52EE' },
  { id: 'tailwindcss', name: 'Tailwind CSS', category: 'frontend', color: '#38BDF8' },
  { id: 'typescript', name: 'TypeScript', category: 'frontend', color: '#3178C6' },
  { id: 'javascript', name: 'JavaScript', category: 'frontend', color: '#F7DF1E' },
  
  // Backend & Languages
  { id: 'nodejs', name: 'Node.js', category: 'backend', color: '#5FA04E' },
  { id: 'python', name: 'Python', category: 'backend', color: '#3776AB' },
  { id: 'fastapi', name: 'FastAPI', category: 'backend', color: '#059669' },
  { id: 'django', name: 'Django', category: 'backend', color: '#092E20' },
  { id: 'flask', name: 'Flask', category: 'backend', color: '#FFFFFF' },
  { id: 'golang', name: 'Go', category: 'backend', color: '#00ADD8' },
  { id: 'rust', name: 'Rust', category: 'backend', color: '#DEA584' },
  { id: 'php', name: 'PHP', category: 'backend', color: '#777BB4' },
  { id: 'laravel', name: 'Laravel', category: 'backend', color: '#FF2D20' },
  { id: 'ruby', name: 'Ruby on Rails', category: 'backend', color: '#CC0000' },
  { id: 'nestjs', name: 'NestJS', category: 'backend', color: '#E0234E' },
  { id: 'express', name: 'Express', category: 'backend', color: '#FFFFFF' },

  // Database & BaaS
  { id: 'supabase', name: 'Supabase', category: 'database', color: '#3ECF8E' },
  { id: 'postgresql', name: 'PostgreSQL', category: 'database', color: '#4169E1' },
  { id: 'mysql', name: 'MySQL', category: 'database', color: '#4479A1' },
  { id: 'mongodb', name: 'MongoDB', category: 'database', color: '#47A248' },
  { id: 'redis', name: 'Redis', category: 'database', color: '#DC382D' },
  { id: 'sqlite', name: 'SQLite', category: 'database', color: '#003B57' },
  { id: 'firebase', name: 'Firebase', category: 'database', color: '#FFCA28' },
  { id: 'prisma', name: 'Prisma', category: 'database', color: '#2D3748' },
  { id: 'drizzle', name: 'Drizzle ORM', category: 'database', color: '#C5F74F' },

  // Cloud & DevOps
  { id: 'docker', name: 'Docker', category: 'devops', color: '#2496ED' },
  { id: 'aws', name: 'AWS', category: 'devops', color: '#FF9900' },
  { id: 'gcp', name: 'Google Cloud', category: 'devops', color: '#4285F4' },
  { id: 'cloudflare', name: 'Cloudflare', category: 'devops', color: '#F38020' },
  { id: 'vercel', name: 'Vercel', category: 'devops', color: '#FFFFFF' },
  { id: 'github', name: 'GitHub', category: 'devops', color: '#FFFFFF' },

  // AI & Payments
  { id: 'openai', name: 'OpenAI', category: 'ai', color: '#10A37F' },
  { id: 'anthropic', name: 'Anthropic', category: 'ai', color: '#D97706' },
  { id: 'stripe', name: 'Stripe', category: 'payments', color: '#635BFF' },
  { id: 'lemonsqueezy', name: 'Lemon Squeezy', category: 'payments', color: '#FFC233' },
  { id: 'mercadopago', name: 'Mercado Pago', category: 'payments', color: '#009EE3' },
  { id: 'whop', name: 'Whop', category: 'payments', color: '#FF6243' },
  { id: 'resend', name: 'Resend', category: 'other', color: '#FFFFFF' },
  { id: 'posthog', name: 'PostHog', category: 'other', color: '#F54E00' }
]

export const TECH_STACK_CATALOG = TECH_CATALOG

export function getTechItem(identifier: string): TechItem {
  const normalized = identifier.toLowerCase().trim()
  const found = TECH_CATALOG.find(t => 
    t.id === normalized || 
    t.name.toLowerCase() === normalized ||
    normalized.includes(t.id) ||
    t.name.toLowerCase().includes(normalized)
  )
  if (found) return found
  return {
    id: normalized.replace(/\s+/g, '-'),
    name: identifier.trim(),
    category: 'other',
    color: '#00D4FF'
  }
}
