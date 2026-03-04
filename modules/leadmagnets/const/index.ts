import type { MarketSegment } from '../types';

export const MARKET_SEGMENTS: MarketSegment[] = [
    { 
        label: 'MicroSaaS', 
        buyerProfile: 'Compradores individuales y marketplaces ', 
        metric: 'profit', 
        baseMultiple: 1.5 // Bajado a 1.5x profit (realista para micro-saas)
    },
    { 
        label: 'SaaS Pequeño', 
        buyerProfile: 'Fondos de inversión pequeños y operadores', 
        metric: 'profit', 
        baseMultiple: 2.2 // Bajado a 2.2x profit
    },
    { 
        label: 'SaaS Mediano', 
        buyerProfile: 'M&A privado y fondos middle-market', 
        metric: 'arr', 
        baseMultiple: 2.5 // Bajado a 2.5x ARR
    },
    { 
        label: 'SaaS Establecido', 
        buyerProfile: 'Compradores institucionales y estratégicos', 
        metric: 'arr', 
        baseMultiple: 3.5 // Bajado a 3.5x ARR (realista 2025/2026)
    }
];

export const THRESHOLDS = {
    SMALL: 120000,   // $10k MRR
    MEDIUM: 600000,  // $50k MRR
    LARGE: 2400000   // $200k MRR
};
