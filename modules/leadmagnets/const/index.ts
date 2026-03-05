import type { MarketSegment } from '../types';

export const MARKET_SEGMENTS: MarketSegment[] = [
    { 
        id: 'micro',
        label: 'MicroSaaS', 
        buyerProfile: 'Compradores individuales y marketplaces ', 
        metric: 'profit', 
        baseMultiple: 1.5 
    },
    { 
        id: 'small',
        label: 'SaaS Pequeño', 
        buyerProfile: 'Fondos de inversión pequeños y operadores', 
        metric: 'profit', 
        baseMultiple: 2.2 
    },
    { 
        id: 'medium',
        label: 'SaaS Mediano', 
        buyerProfile: 'M&A privado y fondos middle-market', 
        metric: 'arr', 
        baseMultiple: 2.5 
    },
    { 
        id: 'established',
        label: 'SaaS Establecido', 
        buyerProfile: 'Compradores institucionales y estratégicos', 
        metric: 'arr', 
        baseMultiple: 3.5 
    }
];

export const THRESHOLDS = {
    SMALL: 120000,   // $10k MRR
    MEDIUM: 600000,  // $50k MRR
    LARGE: 2400000   // $200k MRR
};
