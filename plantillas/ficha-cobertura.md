# Ficha de cobertura — bloque [Nº / nombre]

> **Plantilla de The Raw Method.** Al CERRAR un bloque de trabajo, copia esta ficha y **resuelve cada clave**:
> márcala `[x]` y **reemplaza el `___` de esa clave** con tu nota de CÓMO se cumplió (o `N/A — <por qué no aplica>`).
> Una clave en `[ ]`, o con su `___` **sin llenar**, no cuenta como cerrada — y el candado la caza.
>
> **Por qué existe (candado 🤖):** la lista de claves la impone ESTA plantilla, **no quien programa** — así no
> se puede "olvidar" un ángulo. Idealmente, un test hace **fallar el cierre** si un bloque no tiene su ficha
> o deja una clave muda. Es la forma de que la auditoría no dependa de la memoria.
>
> No todas las claves aplican a todo bloque: un bloque de pura pantalla puede marcar `N/A` en concurrencia.
> Pero **N/A es una respuesta que hay que escribir**, no una clave que se saltea.

**Bloque:** ___________  **Fecha de cierre:** ___________

**Construyó:** ___________  **Auditó (agente fresco / distinto del que construyó):** ___________

> **Por qué separadas:** el auditor **tiene que ser otro** — no el mismo que construyó. Refutar por defecto
> necesita ojos frescos: quien escribió el código arrastra los mismos supuestos con los que lo escribió, así
> que si se audita a sí mismo mira desde el mismo ángulo y se auto-aprueba. Si es una sola persona dirigiendo,
> igual: el pase de auditoría lo corre un **agente distinto** del que construyó, sin arrastrar su contexto.

---

## Claves (no borres ninguna)

- [ ] **(spec-leída)** Leí la referencia del bloque + el checklist ANTES de la primera línea. → ___
- [ ] **(orden)** Código limpio, sin duplicar, sin código muerto tras reemplazos; lo del cliente en config, no en el motor. → ___
- [ ] **(seguridad)** Identidad del servidor, entradas validadas, sin secretos en el código, aislamiento entre clientes. → ___
- [ ] **(experiencia)** Móvil primero, estados cargando/vacío/error, accesibilidad, sin urgencia falsa. → ___
- [ ] **(concurrencia)** Si toca dinero/stock: se traba la fila, huella de idempotencia, reversa segura. (o N/A) → ___
- [ ] **(errores)** Si algo falla, avisa claro y se aísla; nada de cero silencioso; log con identificador y sin secretos. → ___
- [ ] **(rastro)** Toda mutación deja quién/cuándo/qué; nada se borra de verdad; el saldo se deriva, no se guarda. → ___
- [ ] **(config)** Umbrales ajustables y apagables; se hacen cumplir en el motor, no solo en la vista. (o N/A) → ___
- [ ] **(aguante)** Índice junto a la consulta; sin N+1; proyectado a mucho volumen. (o N/A) → ___
- [ ] **(stack)** Usé la versión nueva leyendo su doc, no la API de memoria; el paquete existe y es el oficial. → ___
- [ ] **(dato)** Si toca migraciones/datos: es reversible, hay respaldo probado. (o N/A) → ___
- [ ] **(tests)** Hay un test que reproduce el escenario; si es un bug, su test de regresión. → ___
- [ ] **(auditoría)** La corrió un **revisor independiente** (agente fresco, distinto del que construyó): auditoría adversaria de los ángulos tocados, hallazgos pasados por las 3 lentes, cerrados o anotados. → ___
- [ ] **(docs)** Ley, backlog, bitácora y todo doc desfasado quedaron al día en este mismo cambio. → ___
- [ ] **(OK)** El dueño dio el visto bueno para cerrar. → ___
