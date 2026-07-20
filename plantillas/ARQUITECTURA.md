# Arquitectura — cómo está pensado el sistema

> **Plantilla de The Raw Method. Bórrala y hazla tuya.**
>
> Este documento explica **cómo está armado el sistema por dentro**: sobre qué está construido, cuáles son sus
> piezas y cómo se hablan entre sí. Es lo segundo que lee una sesión nueva (después de la ley) y se escribe
> **antes de la primera línea de código** de cada bloque nuevo. No describe features: describe la **estructura**.
>
> **Por qué importa tanto:** casi todo hallazgo de la auditoría es en el fondo una violación de arquitectura —
> una pieza que le habla a otra saltándose la lógica, algo del cliente clavado en el motor, una capa que nadie
> pidió. Si la estructura está escrita, se ve la violación. Si vive en la cabeza de alguien, no.

---

## 1. El stack (con sus trampas)

*Qué tecnología usa cada capa. Y la parte que de verdad importa:* **la trampa de cada una** *— "este no es el
X que conoces de memoria". Las versiones nuevas cambian formas; la API que recuerdas de un tutorial viejo puede
estar deprecada o ser un anti-patrón. Anota acá la versión concreta y en qué se diferencia de lo esperado, para
que nadie programe "de memoria".*

| Capa | Qué se usa (versión) | La trampa — en qué NO es lo que crees |
|---|---|---|
| *(ej. base de datos)* | | |
| *(ej. framework de pantallas)* | | |
| *(ej. lenguaje / runtime)* | | |

## 2. Las piezas y cómo se hablan

*El mapa: cuáles son los grandes bloques del sistema y quién le habla a quién. La regla de oro es la dirección
del tráfico: lo de "arriba" (pantallas) NUNCA le habla directo a lo de "abajo" (base de datos) saltándose la
capa de lógica del medio. Dibuja el flujo, aunque sea con flechas de texto.*

```
(ej.)  Pantalla  →  Acción/Lógica  →  Base de datos
                         ↑
                  aquí viven permisos,
                  validaciones y reglas
```

## 3. Qué es MOTOR y qué es CONFIG del cliente

*La línea más importante del método para vender el mismo producto a otro cliente. El* **motor** *es genérico y
reutilizable (lógica, estructura, reglas); la* **config del cliente** *es todo lo específico de ESTE cliente
(marca, sucursales, productos, tasas, ejemplos). Lo específico NUNCA se clava en el motor: va a datos o a
configuración. Anota dónde vive cada cosa.*

| Cosa | ¿Motor o config? | Dónde vive |
|---|---|---|
| *(ej. la lógica de cobros)* | Motor | `lib/…` |
| *(ej. el nombre de la marca)* | Config | `lib/brand.ts` |
| *(ej. las sucursales, las tasas)* | Config | tabla + Settings |

---

## Mini-ejemplo (bórralo cuando tengas el tuyo)

> **Stack.** Base de datos: Postgres 16 vía un ORM. *Trampa:* el ORM es la versión nueva — la forma de escribir
> relaciones cambió respecto de la v4 que sale en la mayoría de los tutoriales; leer SU doc antes de tocar
> consultas.
>
> **Piezas.** La pantalla nunca consulta la base: llama a una "acción" del servidor, y esa acción es la única
> que valida permiso, revisa aislamiento entre clientes y recién ahí toca la base.
>
> **Motor vs config.** El cálculo de saldos es motor (`lib/saldos.ts`, idéntico para todo cliente). El logo, las
> dos sucursales y la tasa del día son config de ESTE cliente (tabla `settings`), no están en el código.
