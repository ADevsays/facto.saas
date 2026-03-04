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
        title: 'Tu Churn está frenando tu valoración',
        concept: 'El Churn Rate es el porcentaje de usuarios que cancelan su suscripción cada mes.',
        explanation: 'Un churn superior al 5% indica que estás perdiendo clientes casi tan rápido como los ganas. Para un comprador, esto es una "fuga de capital" que destruye el multiplicador de tu valoración.',
        actionable: 'Implementa hoy mismo un flujo de "cancelación asistida" con descuentos automáticos para retener al menos un 15% de esas salidas.'
    },
    medium: {
        id: 'churn_medium',
        title: 'Retención Estándar: hay margen de mejora',
        concept: 'El Churn Rate es el porcentaje de usuarios que cancelan su suscripción cada mes.',
        explanation: 'Un churn entre el 2% y el 5% es aceptable para la mayoría de SaaS, pero aún hay espacio para subir. Bajar del 2% puede aumentar tu múltiplo de valoración de forma significativa.',
        actionable: 'Lanza una encuesta de cancelación y clasifica las razones. El patrón más frecuente es tu próximo roadmap de retención.'
    },
    low: {
        id: 'churn_low',
        title: 'Retención de Clase Mundial',
        concept: 'El Churn Rate es el porcentaje de usuarios que cancelan su suscripción cada mes.',
        explanation: 'Mantener un churn por debajo del 2% es una señal de "Product-Market Fit" excepcional. Los inversores pagan primas altísimas por negocios donde el cliente se queda a largo plazo.',
        actionable: 'Es el momento de introducir planes anuales o "add-ons" para aumentar el valor de vida de estos clientes tan fieles.'
    }
}

export const TIPS_GROWTH = {
    low: {
        id: 'growth_low',
        title: 'El Límite del Múltiplo de Venta',
        concept: 'El Growth Rate es el ritmo al que crecen tus ingresos mes a mes (MoM).',
        explanation: 'Un crecimiento inferior al 15% anual te sitúa en la categoría de "Lifestyle Business". Para saltar a múltiplos de 4x o 5x, necesitas demostrar tracción acelerada.',
        actionable: 'Enfócate en un solo canal de adquisición que ya te funcione y duplica tu inversión ahí durante los próximos 90 días.'
    },
    medium: {
        id: 'growth_medium',
        title: 'Crecimiento Saludable, Pero Ampliable',
        concept: 'El Growth Rate es el ritmo al que crecen tus ingresos mes a mes (MoM).',
        explanation: 'Crecer entre 15% y 40% anual es un territorio sólido: eres rentable y escalable. Sin embargo, los compradores premium exigen más del 40% para pagar los mejores múltiplos.',
        actionable: 'Identifica tu canal de adquisición #1 y calcula el CAC payback. Si es menor a 6 meses, aumentar el presupuesto ahí es dinámita pura para el crecimiento.'
    },
    high: {
        id: 'growth_high',
        title: 'Crecimiento Exponencial Detectado',
        concept: 'El Growth Rate es el ritmo al que crecen tus ingresos mes a mes (MoM).',
        explanation: 'Crecer por encima del 40% anual te pone en el radar de los grandes agregadores y fondos. Eres un activo escaso y codiciado.',
        actionable: 'Asegúrate de documentar todos tus procesos de venta. Un crecimiento tan alto sin procesos asusta; con ellos, dispara el precio.'
    }
}

export const TIPS_MARGIN = {
    low: {
        id: 'margin_low',
        title: 'Optimización de Caja Crítica',
        concept: 'El Margen Operativo es el porcentaje de ingresos que te queda tras pagar servidores, herramientas y equipo.',
        explanation: 'Un margen inferior al 60% es inusual en SaaS. Indica que tu infraestructura o tus procesos manuales son demasiado caros para el volumen de ingresos que tienes.',
        actionable: 'Audita tus suscripciones de software y automatiza tareas repetitivas. Cada dólar que ahorres en costes operativos se multiplica por 4 en tu valoración.'
    },
    medium: {
        id: 'margin_medium',
        title: 'Margen Sólido con Potencial de Mejora',
        concept: 'El Margen Operativo es el porcentaje de ingresos que te queda tras pagar servidores, herramientas y equipo.',
        explanation: 'Un margen entre 60% y 80% es compentitivo para SaaS, pero los compradores con mayor disposición a pagar buscan más del 80%. Estás cerca del umbral élite.',
        actionable: 'Revisa qué procesos aún son manuales en tu operación (soporte, onboarding, reporting). Automatizar uno solo de ellos puede empujarte por encima del 80%.'
    },
    high: {
        id: 'margin_high',
        title: 'Máquina de Eficiencia Operativa',
        concept: 'El Margen Operativo es el porcentaje de ingresos que te queda tras pagar servidores, herramientas y equipo.',
        explanation: 'Un margen por encima del 80% indica una estructura muy ligera y rentable. Es la métrica que más envidian los compradores porque significa beneficio puro.',
        actionable: 'Mantén esta estructura limpia. En una negociación de Exit, este margen es tu mejor carta para exigir un precio superior a la media.'
    }
}
