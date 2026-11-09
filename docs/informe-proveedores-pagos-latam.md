# Informe de proveedores de pago para Facto

Actualizado: 8 de noviembre de 2026.

## Integraciones revisadas

| Proveedor | Cobertura implementada | Acceso solicitado |
|---|---|---|
| Conekta | Órdenes/cargos netos de devoluciones y suscripciones con planes, paginados por recurso | Llave privada con `orders:read`, `charges:read`, `customers:read`, `subscriptions:read` y `plans:read`; sin scopes de escritura |
| Polar | Órdenes y suscripciones paginadas, normalización de ciclos | Token con `orders:read` y `subscriptions:read` |
| Paddle | Transacciones, ajustes/refunds y suscripciones paginados | API key con `transaction.read`, `subscription.read` y `adjustment.read` |
| RevenueCat | MRR actual e ingreso agregado del proyecto por los endpoints oficiales de métricas | Clave V2 con `charts_metrics:overview:read`; no hay listado global de transacciones, por eso se muestran solo métricas agregadas |
| ePayco | Historial completo de transacciones paginadas y revenue de transacciones aceptadas; MRR queda sin dato hasta validar el esquema completo de planes/suscripciones | Requiere `PUBLIC_KEY` y `PRIVATE_KEY`; ePayco no documenta un scope de solo lectura y la autenticación abre una API que también permite operaciones de cobro/reverso |
| Dodo Payments | Pagos aceptados, devoluciones y suscripciones con consulta paginada | API key configurada con permisos Read en Payments, Refunds y Subscriptions; dejar apagado Write access |

Stripe, Mercado Pago y Whop conservan sus conectores previos.

Los logos proporcionados de RevenueCat, Polar, Paddle y Dodo se procesaron a WebP de 256 × 256 y se usan en el selector y las fichas de proveedor.

## Referencias oficiales consultadas

- Polar: [List Orders](https://polar.sh/docs/api-reference/orders/list), [List Subscriptions](https://polar.sh/docs/api-reference/subscriptions/list). Los endpoints aceptan scopes de lectura y exponen paginación por página.
- Paddle: [API key permissions](https://developer.paddle.com/api-reference/about/permissions/), [List transactions](https://developer.paddle.com/api-reference/transactions/list-transactions/), [List adjustments](https://developer.paddle.com/api-reference/adjustments/list-adjustments/). Los endpoints se paginan con cursores; ajustes requieren `adjustment.read`.
- RevenueCat: [API v2 y permisos](https://www.revenuecat.com/docs/api-v2), [Charts & Metrics](https://www.revenuecat.com/docs/api-v2/charts-and-metrics). El endpoint de overview necesita `charts_metrics:overview:read`; revenue agregado tiene rango inclusivo, pero no sustituye una lista de transacciones con fechas.
- Dodo Payments: [documentación oficial](https://docs.dodopayments.com/), [SDK oficial de TypeScript](https://github.com/dodopayments/dodopayments-typescript). El SDK lista pagos y suscripciones con paginación por `page_number`/`page_size`; el panel permite crear API keys y limitar acceso de lectura por recurso.
- Conekta: [scopes de API keys](https://developers.conekta.com/reference/createapikey), [API de órdenes](https://developers.conekta.com/reference/getorders), [suscripciones](https://developers.conekta.com/reference/subscriptionlist).
- ePayco: [autenticación de Apify](https://epayco.com/desarrolladores/), [referencia de transacciones](https://api.epayco.co/), [consulta de respuesta/transacción](https://docs.epayco.com/docs/checkout-respuesta-y-confirmacion), [SDK oficial de Node](https://github.com/epayco/epayco-node). Apify autentica con `PUBLIC_KEY:PRIVATE_KEY`; la referencia del API y el SDK incluyen operaciones que crean/reversan pagos, mientras que el endpoint de listado `/transaction` pagina el historial por `page` y `limit`.

## Cambios de seguridad y datos

- Se retiraron del catálogo y factory dos conectores anteriores y se agregó una migración que limpia la asociación y credencial cifrada de startups conectadas a ellos antes de eliminar las filas de catálogo.
- Las nuevas credenciales se guardan cifradas por el mecanismo existente; los formularios explican el permiso/tipo exacto que deben crear.
- La sincronización de historial falla de forma cerrada ante páginas incompletas o cursores repetidos.
- ePayco informa con tono neutral que el proveedor no documenta un perfil de solo lectura; el conector únicamente consulta historial. Su logo oficial local se optimizó a WebP de 256 × 256.
- Las claves productivas y los sandboxes reales no están disponibles en este entorno, por lo que no se afirma una verificación remota.
