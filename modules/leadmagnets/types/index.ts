export type RevenueType = 'mrr' | 'arr';

export interface CalculatorInputs {
    revenueType: RevenueType;
    revenue: number;
    growthRate: number;
    churnRate: number;
    marginPercent: number;
}

export interface MarketSegment {
    id: string;
    label: string;
    buyerProfile: string;
    metric: 'profit' | 'arr';
    baseMultiple: number;
}
