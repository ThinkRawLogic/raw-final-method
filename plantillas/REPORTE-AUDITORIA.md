# Reporte de auditoría — bloque [Nº / nombre]

> **Plantilla de The Raw Method. Bórrala y hazla tuya.**
>
> Este es el **entregable del Red Team**: qué se atacó, qué sobrevivió y —lo que separa un reporte honesto de
> uno que da falsa tranquilidad— **qué NO se alcanzó a probar**. Lo escribe un **revisor independiente** (agente
> fresco, distinto del que construyó): refutar por defecto necesita ojos frescos.
>
> **Dos cosas que no hay que confundir:**
> - **Los ángulos de ataque** son las dimensiones que se auditan (concurrencia, seguridad, dinero…): el "**cómo
>   atacarlo**" de cada pilar.
> - **Las 3 lentes (3 jueces independientes)** son el filtro que **confirma** cada hallazgo: un hallazgo solo
>   sobrevive si 2 de las 3 lentes no logran refutarlo. No son lo mismo que los ángulos.

**Bloque:** ___________  **Fecha:** ___________  **Auditó (independiente):** ___________
**Modo:** *(pase regular / flota adversaria — según el downside)*

---

## 1. Ángulos corridos (y cuáles no)

*Qué pilares se atacaron de verdad. El router dice cuáles debían prenderse; anota los que se cubrieron y
declara los que quedaron fuera.*

| Ángulo | ¿Se atacó? | Nota (0–10 o estado) |
|---|---|---|
| *(ej. Concurrencia)* | sí | |
| *(ej. Seguridad)* | sí | |

## 2. Hallazgos (en clusters)

*Agrupados por clase de problema, no en lista suelta. Un problema de fondo con cinco síntomas es UN hallazgo
con cinco síntomas, no cinco hallazgos. Cada uno ya pasó por las 3 lentes.*

### RM-001 · Cluster A — [clase de problema]
- **Síntoma(s):**
- **Confirmación (las 3 lentes):** ¿existe la defensa? / ¿hay un test que lo cubra? / ¿puede pasar de verdad? → **2 de 3 no lo refutan** ⇒ real.
- **Regla que nace (motor §):** *(el principio que mata la clase entera + su candado 🤖, no solo el parche)*

## 2b. Risk Score (reproducible)

Vara simple y repetible = **peso por severidad**, sumado sobre hallazgos confirmados:
**crítico ×10 · alto ×5 · medio ×2 · bajo ×1**. No es ciencia — es un número consistente entre auditorías,
para ver si el bloque mejora o empeora. Cada hallazgo lleva su **ID estable (RM-00N)**: si `RM-003` reaparece
en la próxima auditoría, el parche no mató la clase — faltó el candado.

| Severidad | # confirmados | ×peso | subtotal |
|---|---|---|---|
| crítico | | 10 | |
| alto | | 5 | |
| medio | | 2 | |
| bajo | | 1 | |
| **Risk Score** | | | |

## 3. QUÉ NO SE ALCANZÓ A PROBAR (lo más importante)

> **La ausencia de hallazgos NO es prueba de ausencia de bugs.** Un reporte que no dice dónde quedó ciego,
> miente por omisión. Sé explícito.

- **Clases barridas de verdad (lista exhaustiva para estas):** __________
- **Fuera de alcance / a medio cubrir:** *(rondas capadas antes de secar, áreas sin sondeo en vivo, tipos de prueba que faltan — carga real, resistencia, accesibilidad automatizada de punta a punta…)*
- **Residuos para un humano u otra herramienta:** __________

---

## Mini-ejemplo (bórralo cuando tengas el tuyo)

> **Ángulos corridos.** Concurrencia (8/10), Seguridad (9/10), Rastro (10/10). Aguante: N/A (no toca tablas
> que crecen).
>
> **Cluster A — doble-tap en el pago.** Síntoma: dos clics rápidos aplicaban el pago dos veces. Las 3 lentes:
> no había guard (lente 1 no refuta), no había test (lente 2 no refuta), es alcanzable con doble-tap real
> (lente 3 no refuta) -> **real**. Regla nueva: "toda operación de dinero traba la fila y lleva huella de
> idempotencia" + candado 🤖 (test de dos operaciones en paralelo).
>
> **Qué NO se probó.** No hubo sondeo en vivo con carga real; la accesibilidad se revisó a ojo, no con
> herramienta automatizada de punta a punta. Queda pendiente para un humano probar el rollback de la migración.
