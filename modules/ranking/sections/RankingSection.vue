<script setup lang="ts">
import RankingRow from '../components/RankingRow.vue'

const items = [
  { position: 1,  name: 'GitHub',       category: 'Dev Tools',     mrr: '$9.2M',  founder: 'Tom Preston-Werner' },
  { position: 2,  name: 'Stripe',       category: 'Payments',      mrr: '$4.5M',  founder: 'Patrick Collison'  },
  { position: 3,  name: 'Figma',        category: 'Design',        mrr: '$1.2M',  founder: 'Dylan Field'       },
  { position: 4,  name: 'Vercel',       category: 'Infrastructure', mrr: '$890K', founder: 'Guillermo Rauch'  },
  { position: 5,  name: 'Loom',         category: 'Video',         mrr: '$310K',  founder: 'Shahed Khan'       },
  { position: 6,  name: 'Notion',       category: 'Productivity',  mrr: '$180K',  founder: 'Ivan Zhao'         },
  { position: 7,  name: 'Linear',       category: 'Project Mgmt',  mrr: '$92K',   founder: 'Karri Saarinen'    },
  { position: 8,  name: 'Raycast',      category: 'Productivity',  mrr: '$67K',   founder: 'Thomas Paul Mann'  },
  { position: 9,  name: 'Screen Studio',category: 'Video',         mrr: '$51K',   founder: 'Adam Pietrasiak'   },
  { position: 10, name: 'Cron',         category: 'Calendar',      mrr: '$45K',   founder: 'Raphael Schaad'    },
]
</script>

<template>
  <section class="w-full py-8 pb-20">
    <div class="flex items-center justify-between mb-5">
      <p class="text-[10px] font-sans font-extralight tracking-[0.15em] text-neutral-600 uppercase">Ranking</p>
    </div>

    <div class="rounded-2xl border border-white/10 overflow-hidden">
      <div class="grid grid-cols-[2rem_1fr_1fr_auto] items-center py-2.5 px-5 border-b border-white/10 bg-white/[0.03] gap-3">
        <span class="text-[10px] text-neutral-600 uppercase tracking-widest text-center">#</span>
        <span class="text-[10px] text-neutral-600 uppercase tracking-widest font-sans font-extralight">Startup</span>
        <span class="text-[10px] text-neutral-600 uppercase tracking-widest font-sans font-extralight">Founder</span>
        <span class="text-[10px] text-neutral-600 uppercase tracking-widest font-sans font-extralight text-right">MRR</span>
      </div>

      <RankingRow
        v-for="item in items"
        :key="item.position"
        v-bind="item"
      />
    </div>
  </section>
</template>
