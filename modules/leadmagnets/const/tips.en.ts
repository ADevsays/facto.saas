export interface Tip {
    id: string
    title: string
    concept: string
    explanation: string
    actionable: string
}

export const TIPS_CHURN = {
    high: {
        id: 'churn_high',
        title: 'Your Churn is holding back your valuation',
        concept: 'Churn Rate is the percentage of users who cancel their subscription each month.',
        explanation: 'A churn rate above 5% indicates you are losing customers almost as fast as you gain them. For a buyer, this is a "capital leak" that destroys your valuation multiple.',
        actionable: 'Implement a "assisted cancellation" flow today with automatic discounts to retain at least 15% of those departures.'
    },
    medium: {
        id: 'churn_medium',
        title: 'Standard Retention: there is room for improvement',
        concept: 'Churn Rate is the percentage of users who cancel their subscription each month.',
        explanation: 'A churn rate between 2% and 5% is acceptable for most SaaS, but there is still room to grow. Dropping below 2% can significantly increase your valuation multiple.',
        actionable: 'Launch a cancellation survey and classify the reasons. The most frequent pattern is your next retention roadmap.'
    },
    low: {
        id: 'churn_low',
        title: 'World-Class Retention',
        concept: 'Churn Rate is the percentage of users who cancel their subscription each month.',
        explanation: 'Maintaining a churn rate below 2% is a sign of exceptional "Product-Market Fit". Investors pay very high premiums for businesses where customers stay for the long term.',
        actionable: 'Now is the time to introduce annual plans or "add-ons" to increase the lifetime value of these loyal customers.'
    }
}

export const TIPS_GROWTH = {
    low: {
        id: 'growth_low',
        title: 'The Sales Multiple Limit',
        concept: 'Growth Rate is the pace at which your revenue grows month over month (MoM).',
        explanation: 'A growth rate below 15% per year puts you in the "Lifestyle Business" category. To jump to 4x or 5x multiples, you need to demonstrate accelerated traction.',
        actionable: 'Focus on a single acquisition channel that already works for you and double your investment there for the next 90 days.'
    },
    medium: {
        id: 'growth_medium',
        title: 'Healthy Growth, but Expandable',
        concept: 'Growth Rate is the pace at which your revenue grows month over month (MoM).',
        explanation: 'Growing between 15% and 40% annually is solid territory: you are profitable and scalable. However, premium buyers demand more than 40% to pay the best multiples.',
        actionable: 'Identify your #1 acquisition channel and calculate the CAC payback. If it is less than 6 months, increasing the budget there is pure dynamite for growth.'
    },
    high: {
        id: 'growth_high',
        title: 'Exponential Growth Detected',
        concept: 'Growth Rate is the pace at which your revenue grows month over month (MoM).',
        explanation: 'Growing above 40% annually puts you on the radar of large aggregators and funds. You are a scarce and coveted asset.',
        actionable: 'Make sure to document all your sales processes. Such high growth without processes is scary; with them, it skyrockets the price.'
    }
}

export const TIPS_MARGIN = {
    low: {
        id: 'margin_low',
        title: 'Critical Cash Optimization',
        concept: 'Operating Margin is the percentage of revenue you have left after paying for servers, tools, and team.',
        explanation: 'A margin below 60% is unusual in SaaS. It indicates that your infrastructure or manual processes are too expensive for the volume of revenue you have.',
        actionable: 'Audit your software subscriptions and automate repetitive tasks. Every dollar you save on operating costs is multiplied by 4 in your valuation.'
    },
    medium: {
        id: 'margin_medium',
        title: 'Solid Margin with Improvement Potential',
        concept: 'Operating Margin is the percentage of revenue you have left after paying for servers, tools, and team.',
        explanation: 'A margin between 60% and 80% is competitive for SaaS, but buyers with higher willingness to pay look for more than 80%. You are near the elite threshold.',
        actionable: 'Check which processes are still manual in your operation (support, onboarding, reporting). Automating just one can push you above 80%.'
    },
    high: {
        id: 'margin_high',
        title: 'Operational Efficiency Machine',
        concept: 'Operating Margin is the percentage of revenue you have left after paying for servers, tools, and team.',
        explanation: 'A margin above 80% indicates a very lean and profitable structure. It is the metric buyers envy most because it means pure profit.',
        actionable: 'Keep this structure clean. In an Exit negotiation, this margin is your best card to demand a higher-than-average price.'
    }
}
