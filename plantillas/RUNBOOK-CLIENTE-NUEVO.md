# Runbook — instanciar el motor para un cliente nuevo

> **Plantilla de The Raw Method. Bórrala y hazla tuya.**
>
> Este es el entregable natural del pilar **motor vs config**: el paso a paso para poner en marcha el mismo
> producto para **otro cliente (tenant)** cambiando **solo datos y configuración** — sin tocar una línea del
> motor. Si para dar de alta un cliente hay que editar código, el motor tiene algo del cliente clavado adentro:
> eso es un hallazgo, no un paso del runbook.
>
> **La prueba de fuego:** un cliente nuevo debería quedar operativo llenando config y sembrando datos. Cada vez
> que este runbook te obliga a tocar el motor, anota esa fuga para sacarla a config.

---

## Antes de empezar (precondiciones)

- [ ] El motor está en verde (compila, linter, build, suite de pruebas).
- [ ] Tengo los datos del cliente nuevo: marca, sucursales, productos, tasas, usuarios iniciales.
- [ ] Ninguno de esos datos va a ir al código — todos a config o a datos sembrados.

## Los pasos

*Enumera el paso a paso real, "para dummies", con la trampa de cada uno. Cada paso debe ser SOLO config o datos,
nunca código del motor.*

1. **Identidad / marca** — dónde se setea (ej. un archivo de marca o una tabla de settings). *Trampa: …*
2. **Estructura del cliente** — sucursales, depósitos, usuarios y permisos iniciales. *Trampa: …*
3. **Catálogo y datos base** — productos, categorías, plan de cuentas, tasas. *Trampa: …*
4. **Parámetros configurables** — umbrales, límites, aprobaciones (recordá: `0 = apagado`, default sin fricción). *Trampa: …*
5. **Verificación** — recorre los flujos críticos con datos del cliente nuevo; confirma que NO se filtró nada de otro cliente (aislamiento).

## Al terminar

- [ ] Los flujos críticos funcionan con los datos del cliente nuevo.
- [ ] Aislamiento verificado: este cliente no ve datos de ningún otro.
- [ ] **No se tocó el motor.** Si hubo que tocarlo, quedó anotado como fuga a mover a config.

---

## Mini-ejemplo (bórralo cuando tengas el tuyo)

> **Paso 1 — Marca.** Setear nombre, logo y colores en la tabla `settings` del tenant. *Trampa: el logo NO va
> en el código; si aparece un `import logo` en el motor, es una fuga.*
>
> **Paso 3 — Catálogo.** Sembrar productos y tasas con el script de seed apuntando al tenant nuevo. *Trampa:
> las tasas cambian; nunca hardcodear una — se cargan como dato y se administran desde Settings.*
>
> **Verificación.** Entrar como usuario del cliente nuevo y confirmar que la lista de productos es la suya y no
> la del cliente anterior. Si ve productos ajenos, el aislamiento está roto → parar y reportar.
