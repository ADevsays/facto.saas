<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'nuxt/app'
import { useFounderSession } from '~/composables/useFounderSession'
import { ROUTES } from '~/utils/routes'
import CountrySelect from '~/ui/components/CountrySelect.vue'
import CategorySelect from '~/ui/components/CategorySelect.vue'

const route = useRoute()
const router = useRouter()
const localePath = useLocalePath()
const slug = route.params.slug as string

const { isAuthenticated, founder, isChecking, checkSession, logout } = useFounderSession()

const startup = ref<any>(null)
const loading = ref(true)
const saving = ref(false)
const savedSuccess = ref(false)
const errorMessage = ref('')

// Tabs
type Tab = 'general' | 'bento' | 'founder'
const activeTab = ref<Tab>('general')

// Form fields
const name = ref('')
const logoUrl = ref('')
const websiteUrl = ref('')
const startupType = ref('')
const countrySlug = ref('')
const categorySlugs = ref<string[]>([])

// Bento fields
const valueProposition = ref('')
const problemSolved = ref('')
const techStackInput = ref('')
const techStack = ref<string[]>([])
const acquisitionChannelsInput = ref('')
const acquisitionChannels = ref<string[]>([])
const factoMessage = ref('')
const githubRepo = ref('')
const faq = ref<{ question: string; answer: string }[]>([])

// Founder profile fields
const founderName = ref('')
const founderAvatar = ref('')
const founderBio = ref('')
const twitterUrl = ref('')
const linkedinUrl = ref('')
const instagramUrl = ref('')

onMounted(async () => {
  await checkSession()
  if (!isAuthenticated.value) {
    router.push(localePath(`/saas/${slug}`))
    return
  }

  try {
    const data = await $fetch<any>(`/api/saas/${slug}`)
    startup.value = data

    // Cargar datos en el formulario
    name.value = data.name || ''
    logoUrl.value = data.logoUrl || ''
    websiteUrl.value = data.websiteUrl || ''
    startupType.value = data.description || ''
    countrySlug.value = data.countrySlug || ''
    categorySlugs.value = Array.isArray(data.categories) ? data.categories.map((c: any) => c.slug) : []

    valueProposition.value = data.valueProposition || ''
    problemSolved.value = data.problemSolved || ''
    techStack.value = Array.isArray(data.techStack) ? [...data.techStack] : []
    acquisitionChannels.value = Array.isArray(data.acquisitionChannels) ? [...data.acquisitionChannels] : []
    factoMessage.value = data.factoMessage || ''
    githubRepo.value = data.githubRepo || ''
    faq.value = Array.isArray(data.faq) ? JSON.parse(JSON.stringify(data.faq)) : []

    if (founder.value) {
      founderName.value = founder.value.name || data.founderName || ''
      founderAvatar.value = founder.value.avatar_url || data.founderAvatar || ''
      founderBio.value = founder.value.bio || data.founderBio || ''
      twitterUrl.value = founder.value.twitter_url || data.founderSocials?.twitterUrl || ''
      linkedinUrl.value = founder.value.linkedin_url || data.founderSocials?.linkedinUrl || ''
      instagramUrl.value = founder.value.instagram_url || data.founderSocials?.instagramUrl || ''
    }
  } catch (e: any) {
    errorMessage.value = 'No se pudo cargar la información de la startup.'
  } finally {
    loading.value = false
  }
})

function addTech() {
  const val = techStackInput.value.trim()
  if (val && !techStack.value.includes(val)) {
    techStack.value.push(val)
    techStackInput.value = ''
  }
}

function removeTech(index: number) {
  techStack.value.splice(index, 1)
}

function addChannel() {
  const val = acquisitionChannelsInput.value.trim()
  if (val && !acquisitionChannels.value.includes(val)) {
    acquisitionChannels.value.push(val)
    acquisitionChannelsInput.value = ''
  }
}

function removeChannel(index: number) {
  acquisitionChannels.value.splice(index, 1)
}

function addFaq() {
  faq.value.push({ question: '', answer: '' })
}

function removeFaq(index: number) {
  faq.value.splice(index, 1)
}

async function saveAll() {
  if (!startup.value?.id) return
  saving.value = true
  errorMessage.value = ''
  savedSuccess.value = false

  try {
    // 1. Guardar datos de Startup y Bento
    await $fetch('/api/founder/update-startup', {
      method: 'PATCH',
      body: {
        saasId: startup.value.id,
        name: name.value,
        logoUrl: logoUrl.value,
        websiteUrl: websiteUrl.value,
        startupType: startupType.value,
        countrySlug: countrySlug.value,
        categorySlug: categorySlugs.value[0] || null,
        categorySlugs: categorySlugs.value,
        valueProposition: valueProposition.value,
        problemSolved: problemSolved.value,
        techStack: techStack.value,
        acquisitionChannels: acquisitionChannels.value,
        factoMessage: factoMessage.value,
        faq: faq.value.filter(f => f.question.trim() && f.answer.trim()),
        githubRepo: githubRepo.value
      }
    })

    // 2. Guardar perfil de Founder
    await $fetch('/api/founder/update-profile', {
      method: 'PATCH',
      body: {
        name: founderName.value,
        avatarUrl: founderAvatar.value,
        bio: founderBio.value,
        twitterUrl: twitterUrl.value,
        linkedinUrl: linkedinUrl.value,
        instagramUrl: instagramUrl.value
      }
    })

    savedSuccess.value = true
    setTimeout(() => {
      savedSuccess.value = false
    }, 4000)
  } catch (e: any) {
    errorMessage.value = e?.data?.message || 'Error al guardar los cambios.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#030305] text-white pt-12 pb-24 px-6 relative">
    <div class="max-w-4xl mx-auto">
      
      <!-- Top Navigation -->
      <div class="flex items-center justify-between gap-4 mb-8">
        <NuxtLink 
          :to="localePath(`/saas/${slug}`)"
          class="inline-flex items-center gap-2 text-xs font-sans text-neutral-400 hover:text-white transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Volver a {{ startup?.name || 'la startup' }}
        </NuxtLink>

        <div class="flex items-center gap-3">
          <span class="text-xs font-sans text-neutral-500 hidden sm:inline">{{ founder?.email }}</span>
          <button 
            @click="logout(); router.push(localePath(`/saas/${slug}`))"
            class="text-xs font-sans text-rose-400/80 hover:text-rose-300 transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      <!-- Dashboard Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-white/10">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest bg-cyan-500/10 text-[#00D4FF] border border-cyan-500/20">
              Panel de Gestión
            </span>
          </div>
          <h1 class="text-2xl md:text-3xl font-serif text-white font-medium">
            Editar {{ startup?.name || 'Startup' }}
          </h1>
        </div>

        <button
          :disabled="saving"
          @click="saveAll"
          class="shrink-0 bg-white text-black font-bold uppercase tracking-widest text-xs rounded-full px-6 py-3.5 transition-all duration-700 hover:scale-[1.03] disabled:opacity-40"
          style="box-shadow: 0 0 15px rgba(255, 255, 255, 0.4), 0 0 30px rgba(0, 212, 255, 0.25)"
        >
          <span v-if="saving">Guardando...</span>
          <span v-else>Guardar Cambios</span>
        </button>
      </div>

      <!-- Notifications -->
      <div v-if="savedSuccess" class="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-sans">
        ✓ Cambios guardados correctamente en la base de datos.
      </div>
      <div v-if="errorMessage" class="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-sans">
        {{ errorMessage }}
      </div>

      <!-- Tabs Navigation -->
      <div class="flex items-center gap-2 mb-8 border-b border-white/5 pb-2 overflow-x-auto no-scrollbar">
        <button
          @click="activeTab = 'general'"
          class="px-4 py-2 rounded-xl text-xs font-sans transition-all duration-300"
          :class="activeTab === 'general' ? 'bg-white/[0.08] text-white font-medium border border-white/10' : 'text-neutral-500 hover:text-neutral-300'"
        >
          General & SaaS
        </button>
        <button
          @click="activeTab = 'bento'"
          class="px-4 py-2 rounded-xl text-xs font-sans transition-all duration-300 flex items-center gap-1.5"
          :class="activeTab === 'bento' ? 'bg-white/[0.08] text-white font-medium border border-white/10' : 'text-neutral-500 hover:text-neutral-300'"
        >
          <span>Showcase Bento</span>
          <span class="w-1.5 h-1.5 rounded-full bg-[#00D4FF]"></span>
        </button>
        <button
          @click="activeTab = 'founder'"
          class="px-4 py-2 rounded-xl text-xs font-sans transition-all duration-300"
          :class="activeTab === 'founder' ? 'bg-white/[0.08] text-white font-medium border border-white/10' : 'text-neutral-500 hover:text-neutral-300'"
        >
          Perfil de Fundador
        </button>
      </div>

      <!-- Tab 1: General & SaaS -->
      <div v-if="activeTab === 'general'" class="space-y-6">
        <div class="bg-white/[0.02] border border-white/10 rounded-3xl p-6 md:p-8 space-y-5">
          <div>
            <label class="block text-[11px] font-sans font-medium uppercase tracking-[0.2em] text-neutral-400 mb-2">Nombre del SaaS</label>
            <input v-model="name" type="text" class="w-full bg-white/[0.04] border border-white/15 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-[#00D4FF]/60" />
          </div>

          <div>
            <label class="block text-[11px] font-sans font-medium uppercase tracking-[0.2em] text-neutral-400 mb-2">URL del Logo (Imagen)</label>
            <input v-model="logoUrl" type="url" placeholder="https://..." class="w-full bg-white/[0.04] border border-white/15 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-[#00D4FF]/60" />
          </div>

          <div>
            <label class="block text-[11px] font-sans font-medium uppercase tracking-[0.2em] text-neutral-400 mb-2">Sitio Web Oficial</label>
            <input v-model="websiteUrl" type="url" placeholder="https://..." class="w-full bg-white/[0.04] border border-white/15 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-[#00D4FF]/60" />
          </div>

          <div>
            <label class="block text-[11px] font-sans font-medium uppercase tracking-[0.2em] text-neutral-400 mb-2">Descripción Corta / Tipo</label>
            <textarea v-model="startupType" rows="3" class="w-full bg-white/[0.04] border border-white/15 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00D4FF]/60"></textarea>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            <div>
              <label class="block text-[11px] font-sans font-medium uppercase tracking-[0.2em] text-neutral-400 mb-2">Categorías</label>
              <CategorySelect v-model="categorySlugs" />
            </div>

            <div>
              <label class="block text-[11px] font-sans font-medium uppercase tracking-[0.2em] text-neutral-400 mb-2">País de Origen</label>
              <CountrySelect v-model="countrySlug" />
            </div>
          </div>
        </div>
      </div>

      <!-- Tab 2: Showcase Bento (Nuevas Features) -->
      <div v-if="activeTab === 'bento'" class="space-y-6">
        <div class="bg-white/[0.02] border border-white/10 rounded-3xl p-6 md:p-8 space-y-6">
          
          <!-- Value Proposition -->
          <div>
            <label class="block text-[11px] font-sans font-medium uppercase tracking-[0.2em] text-[#00D4FF] mb-2">Propuesta de Valor</label>
            <input v-model="valueProposition" type="text" placeholder="Ej: Automatiza tus facturas recurrentes en 1 minuto..." class="w-full bg-white/[0.04] border border-white/15 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-[#00D4FF]/60" />
          </div>

          <!-- Problem Solved -->
          <div>
            <label class="block text-[11px] font-sans font-medium uppercase tracking-[0.2em] text-rose-400 mb-2">El Problema que Resuelve</label>
            <textarea v-model="problemSolved" rows="3" placeholder="Describe qué dolor específico elimina tu producto a los usuarios..." class="w-full bg-white/[0.04] border border-white/15 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00D4FF]/60"></textarea>
          </div>

          <!-- GitHub Repo -->
          <div>
            <label class="block text-[11px] font-sans font-medium uppercase tracking-[0.2em] text-neutral-400 mb-2">Repositorio de GitHub (Commits en vivo)</label>
            <div class="relative">
              <input v-model="githubRepo" type="text" placeholder="owner/repo (ej: facebook/react)" class="w-full bg-white/[0.04] border border-white/15 rounded-xl px-4 py-3.5 text-white text-sm font-mono focus:outline-none focus:border-[#00D4FF]/60" />
            </div>
            <p class="text-[11px] font-sans text-neutral-500 mt-1">Si el repo es público, mostrará la tarjeta de commits dinámicos en tu perfil.</p>
          </div>

          <!-- Tech Stack -->
          <div>
            <label class="block text-[11px] font-sans font-medium uppercase tracking-[0.2em] text-neutral-400 mb-2">Stack Tecnológico / Herramientas</label>
            <div class="flex gap-2 mb-3">
              <input 
                v-model="techStackInput" 
                @keydown.enter.prevent="addTech" 
                type="text" 
                placeholder="Ej: Nuxt 3, Supabase, Tailwind, Stripe..." 
                class="flex-1 bg-white/[0.04] border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00D4FF]/60" 
              />
              <button @click="addTech" class="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-sans">Agregar</button>
            </div>
            <div class="flex flex-wrap gap-2">
              <span v-for="(t, i) in techStack" :key="i" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-white/[0.05] border border-white/10 text-neutral-200">
                {{ t }}
                <button @click="removeTech(i)" class="text-neutral-500 hover:text-white">×</button>
              </span>
            </div>
          </div>

          <!-- Acquisition Channels -->
          <div>
            <label class="block text-[11px] font-sans font-medium uppercase tracking-[0.2em] text-neutral-400 mb-2">Canales de Adquisición</label>
            <div class="flex gap-2 mb-3">
              <input 
                v-model="acquisitionChannelsInput" 
                @keydown.enter.prevent="addChannel" 
                type="text" 
                placeholder="Ej: SEO, X Organic, Cold Email, Product Hunt..." 
                class="flex-1 bg-white/[0.04] border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00D4FF]/60" 
              />
              <button @click="addChannel" class="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-sans">Agregar</button>
            </div>
            <div class="flex flex-wrap gap-2">
              <span v-for="(ch, i) in acquisitionChannels" :key="i" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
                {{ ch }}
                <button @click="removeChannel(i)" class="text-cyan-500 hover:text-white">×</button>
              </span>
            </div>
          </div>

          <!-- Facto Message -->
          <div>
            <label class="block text-[11px] font-sans font-medium uppercase tracking-[0.2em] text-[#00D4FF] mb-2">Mensaje para la Comunidad de Facto</label>
            <textarea v-model="factoMessage" rows="3" placeholder="Un mensaje personal o consejo para los founders que visitan tu perfil..." class="w-full bg-white/[0.04] border border-white/15 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00D4FF]/60"></textarea>
          </div>

          <!-- FAQ Builder -->
          <div>
            <div class="flex items-center justify-between gap-4 mb-3">
              <label class="block text-[11px] font-sans font-medium uppercase tracking-[0.2em] text-neutral-400">Preguntas Frecuentes (FAQ)</label>
              <button @click="addFaq" class="text-xs text-[#00D4FF] hover:underline">+ Agregar Pregunta</button>
            </div>
            
            <div class="space-y-4">
              <div v-for="(item, i) in faq" :key="i" class="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3 relative">
                <button @click="removeFaq(i)" class="absolute top-3 right-3 text-neutral-500 hover:text-rose-400 text-xs">Eliminar</button>
                <input v-model="item.question" type="text" placeholder="Pregunta (ej: ¿Tienen prueba gratuita?)" class="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-[#00D4FF]/50" />
                <textarea v-model="item.answer" rows="2" placeholder="Respuesta..." class="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-[#00D4FF]/50"></textarea>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Tab 3: Perfil de Fundador -->
      <div v-if="activeTab === 'founder'" class="space-y-6">
        <div class="bg-white/[0.02] border border-white/10 rounded-3xl p-6 md:p-8 space-y-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="block text-[11px] font-sans font-medium uppercase tracking-[0.2em] text-neutral-400 mb-2">Nombre del Fundador</label>
              <input v-model="founderName" type="text" class="w-full bg-white/[0.04] border border-white/15 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-[#00D4FF]/60" />
            </div>

            <div>
              <label class="block text-[11px] font-sans font-medium uppercase tracking-[0.2em] text-neutral-400 mb-2">Foto de Perfil / Avatar (URL)</label>
              <input v-model="founderAvatar" type="url" placeholder="https://..." class="w-full bg-white/[0.04] border border-white/15 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-[#00D4FF]/60" />
            </div>
          </div>

          <div>
            <label class="block text-[11px] font-sans font-medium uppercase tracking-[0.2em] text-neutral-400 mb-2">Bio / Resumen del Fundador</label>
            <textarea v-model="founderBio" rows="2" placeholder="Breve descripción personal..." class="w-full bg-white/[0.04] border border-white/15 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00D4FF]/60"></textarea>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div>
              <label class="block text-[11px] font-sans font-medium uppercase tracking-[0.2em] text-neutral-400 mb-2">X (Twitter)</label>
              <input v-model="twitterUrl" type="url" placeholder="https://x.com/..." class="w-full bg-white/[0.04] border border-white/15 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-[#00D4FF]/60" />
            </div>
            <div>
              <label class="block text-[11px] font-sans font-medium uppercase tracking-[0.2em] text-neutral-400 mb-2">LinkedIn</label>
              <input v-model="linkedinUrl" type="url" placeholder="https://linkedin.com/in/..." class="w-full bg-white/[0.04] border border-white/15 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-[#00D4FF]/60" />
            </div>
            <div>
              <label class="block text-[11px] font-sans font-medium uppercase tracking-[0.2em] text-neutral-400 mb-2">Instagram</label>
              <input v-model="instagramUrl" type="url" placeholder="https://instagram.com/..." class="w-full bg-white/[0.04] border border-white/15 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-[#00D4FF]/60" />
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
