import type { FaqItem } from '../types'

export const INVOICE_SEO_FAQS: FaqItem[] = [
  {
    question: '¿El emisor de facturas de Facto es gratuito?',
    answer: 'Sí. Sin límites, sin tarjeta, sin cuenta.'
  },
  {
    question: '¿Dónde se guardan mis datos?',
    answer: 'En tu navegador. Nada sale de tu dispositivo. Si limpias los datos del navegador, las facturas desaparecen. Si no los limpias, permanecen.'
  },
  {
    question: '¿Puedo personalizar el número de factura, los impuestos y la divisa?',
    answer: 'Sí. Numeración correlativa personalizable, IVA/IGV/VAT configurable y múltiples divisas: USD, EUR, MXN, COP, ARS, CLP, PEN y BRL.'
  },
  {
    question: '¿Cómo exporto la factura a PDF?',
    answer: 'Rellena los datos, pulsa "Exportar PDF". El archivo se descarga en segundos, listo para enviar.'
  },
  {
    question: '¿Esta herramienta tiene validez fiscal o conexión con el SAT, AFIP, IRS, etc?',
    answer: 'No. El generador crea y maqueta documentos comerciales en PDF. No está conectado ni envía datos a ninguna entidad gubernamental de impuestos o hacienda.'
  },
  {
    question: '¿Qué es Facto?',
    answer: 'Facto es el ranking donde los fundadores de SaaS publican su MRR verificado. Si ya cobras de forma recurrente, puedes listarte.'
  }
]

export const INVOICE_SEO_ARTICLES = [
  {
    title: 'Documentos comerciales sin complicación',
    highlightWord: 'comerciales',
    content: `Plataformas como Stripe, Gumroad o LemonSqueezy suelen emitir un recibo básico. Pero cuando un cliente internacional o B2B te pide un "invoice" o comprobante con tu membrete, identificador comercial, impuestos desglosados y datos bancarios, necesitas maquetarlo correctamente.

La alternativa habitual es pelear con una plantilla de Word que termina desordenándose.

Este generador existe para ese hueco: plantillas comerciales limpias, numeradas y exportables a PDF para enviar a tus clientes, sin cuentas ni suscripciones.`
  },
  {
    title: 'Sin conexión fiscal automática',
    highlightWord: 'conexión',
    content: `Es importante aclarar que este software es estrictamente un maquetador de documentos comerciales en PDF. No realiza timbrado electrónico ni reporta información a entidades como el SAT (México), AFIP (Argentina), IRS (EE.UU) o la Agencia Tributaria (España). 

Toda la gestión y declaración de impuestos derivada de estos comprobantes debe realizarse mediante los canales oficiales o contables de tu país.`
  },
  {
    title: 'Todo queda en tu navegador',
    highlightWord: 'queda',
    content: `No hay servidor al que se envíe nada. Los datos del emisor, los clientes y el historial de documentos se guardan en el localStorage de tu propio navegador — el mismo mecanismo que usa cualquier web para recordar tus preferencias.

Si limpias los datos del navegador, el historial desaparece. Si no los limpias, permanece. El control es tuyo, no de una base de datos en la nube.`
  }
]
