# Diccionario de datos — qué significa cada tabla y campo

> **Plantilla de The Raw Method. Bórrala y hazla tuya.**
>
> Este documento traduce la base de datos a **castellano llano**: qué guarda cada tabla, qué significa cada
> campo, y —lo más importante— **qué se deriva de qué**. Se escribe **antes de la primera línea** del bloque
> (junto con la arquitectura) y se mantiene al día en cada cierre.
>
> **La regla que este doc hace visible:** un saldo, un total, un estado que se **calcula** a partir de otros
> datos **NO se guarda como número suelto** — se deriva con un único helper. Guardar un derivado es pedir que
> algún día no cuadre. Marca cada campo como **dato de base** (se escribe) o **derivado** (se calcula), para que
> nadie lo guarde por accidente.

---

## Cómo se anota cada tabla

Para cada tabla: qué representa en el negocio (una frase), y luego sus campos. Para cada campo: qué significa,
y si es **dato** (se guarda tal cual) o **derivado** (se calcula — anota de qué). Marca también lo que es
identidad, lo que es config y lo que **nunca se borra** (se anula).

### Tabla: `nombre_tabla`
*Qué representa: (una frase de negocio).*

| Campo | Qué significa | Dato o derivado |
|---|---|---|
| `id` | identificador único | dato |
| `…` | | |

---

## Mini-ejemplo (bórralo cuando tengas el tuyo)

### Tabla: `factura`
*Qué representa: un documento por cobrar emitido a un cliente.*

| Campo | Qué significa | Dato o derivado |
|---|---|---|
| `id` | identificador único de la factura | dato |
| `cliente_id` | a quién se le facturó | dato |
| `total` | monto original del documento | dato (se sella al emitir) |
| `tasa` | tasa de cambio del día de emisión | dato (se sella, NO se recalcula) |
| `saldo` | cuánto falta por cobrar | **derivado** = total − suma de pagos aplicados. NO se guarda: lo calcula `lib/saldos.ts` |
| `estado` | vigente / anulada | dato (anular NO borra la fila) |
| `anulada_por` / `anulada_el` / `motivo` | rastro de la anulación | dato (auditabilidad) |

> Nota: `saldo` aparece en la pantalla pero **no existe como columna**. Si alguna vez lo ves guardado como
> número, es un bug — se deriva siempre.
