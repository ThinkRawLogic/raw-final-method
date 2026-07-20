# Qué modelo de IA usar para cada tarea

El método lo ejecutan agentes de IA, y no todos los modelos cuestan ni rinden lo mismo. La regla que gobierna esta página es una sola:

> **El esfuerzo (y el costo) va proporcional al downside.** Lo que pasa si sale mal decide qué modelo lo hace. Un error al renombrar 40 archivos se ve al instante y se deshace; un error moviendo dinero o borrando datos puede ser invisible y permanente. No pagas por el modelo más caro cuando el downside es barato, y no ahorras con el más barato cuando el downside es grave.

Piensa en cada modelo como un profesional distinto que contratas por hora. Al obrero veloz le das la tarea repetitiva; al consultor caro solo lo llamas para la decisión que no quieres errar. La gracia no es tener al mejor en todo — es poner a cada uno donde su costo se justifica.

> **Ojo: acá hablamos por ROL, no por marca.** A cada modelo lo llamamos por el papel que cumple — "el obrero veloz", "el caballo de batalla" —, no por su nombre de catálogo. ¿Por qué? Porque los nombres de catálogo cambian cada pocos meses cuando Anthropic saca modelos nuevos, y no queremos que el método quede mintiendo cuando eso pase. El rol es estable; el modelo concreto que lo ocupa hoy vive en **una sola tabla al pie de esta página**, y esa tablita se actualiza sola sin tocar el resto.

---

## Los modelos (quién es quién)

Antes de la tabla, conoce al equipo. Cada uno tiene un lugar natural:

- **El obrero veloz** — *rápido y económico.* Hace la tarea mecánica, repetitiva y clara: pintar 40 puertas iguales. No razona de más porque no hace falta.
- **El caballo de batalla** — *el arquitecto-constructor de confianza.* Le encargas la obra completa del día a día: rápido, sólido, sin cobrarte de más. Razona lo suficiente para código correcto sin llamar al consultor a levantar una pared.
- **El ingeniero estructural** — *el del plano.* Te dice si el edificio se cae cuando entran mil personas a la vez, no solo si la puerta abre. Es la lente de "funciona no es lo mismo que aguanta producción". Se lo consultas ANTES de construir.
- **El consultor eminente** — *el diagnosticador estrella (tipo Dr. House).* El más capaz, razonamiento profundo. Le pagas la hora cara para la decisión que no quieres errar, o para el síntoma que nadie logra explicar. Lo caro es pensar bien una vez, no ejecutar.
- **La flota adversaria** — *el equipo de peritos forenses.* Es el consultor eminente corriendo en **modo Ultracode**: una flota del mismo modelo atacando el mismo código en paralelo, cada uno por una dimensión distinta, refutando por defecto — como varios investigadores que intentan ROBARTE para probar que la bóveda aguanta. Caro; se contrata solo cuando el downside es grave. *("Flota adversaria" y "Ultracode" son apodos del MODO en que trabaja, no un modelo aparte.)*

---

## Tabla: tarea → rol

| Tarea | Rol | Por qué ese y no otro |
|---|---|---|
| **Construir una pantalla o módulo nuevo** (el día a día) | **El caballo de batalla** | Razona lo justo para código correcto con validaciones, permisos y convenciones, a una fracción del costo del consultor. No llamas al consultor a levantar una pared. |
| **Explorar / entender código que ya existe** (mapear un módulo, "¿cómo funciona X?", onboarding) | **El caballo de batalla** | El baquiano que conoce el terreno y te lo explica sin drama, rápido y barato. Solo escalas al consultor si la exploración destapa una madeja lógica sutil. |
| **Barridos amplios de auditoría** (muchos módulos buscando incumplimientos de convención, consultas lentas, accesibilidad, código muerto) | **El caballo de batalla** | El equipo de inspectores que recorre todos los pisos marcando lo que se ve mal; los casos serios se los pasa al perito especializado. Cubre mucha superficie a costo razonable — es el filtro de primer nivel que abarata la auditoría. |
| **Refactor mecánico y repetitivo** (renombrar, mover, cambiar una firma en 40 archivos, migrar imports) | **El obrero veloz** | Para la tarea determinista y clara. Si ya sabes exactamente qué hacer, poner al consultor a eso es tirar plata y tiempo. |
| **Redactar documentación, runbooks, changelogs, comentarios y commits** | **El obrero veloz** *(sube al caballo de batalla si el doc exige entender lógica compleja)* | El redactor ágil que pasa en limpio lo que ya está resuelto. Solo subes de nivel cuando el texto requiere entender a fondo una decisión de arquitectura para explicarla bien. |
| **Diseñar arquitectura, concurrencia y escalabilidad** (transacciones, locks, "¿cómo aguanta cuando crece?") | **El ingeniero estructural** | El del plano. Se lo consultas ANTES de construir el rascacielos. Si la decisión es de altísimo impacto, emparéjalo con el consultor eminente. |
| **Decisión de producto o lógica de alto impacto o ambigua** (trade-off de negocio, modelo de datos delicado, plan de un bloque nuevo) | **El consultor eminente** | Para la decisión que no quieres errar. Después la ejecuta tu equipo de siempre (el caballo de batalla). Lo caro es pensar bien una vez. |
| **Buscar bugs / debugging difícil** (comportamiento raro, cálculo que no cuadra, condición de carrera intermitente) | **El consultor eminente** *(escala a la flota adversaria si es dinero o seguridad y se resiste)* | El diagnosticador tipo Dr. House. Para el resfrío común alcanza el médico de cabecera (el caballo de batalla); traes al especialista caro cuando el caso se pone feo. Empieza barato, escala solo si se resiste. |
| **Escribir tests** (regresión, concurrencia, punta a punta / e2e) | **El ingeniero estructural** para lo de concurrencia y sistema; **el caballo de batalla** para el resto | 👁 Los tests son tu backbone: son el candado 🤖 que después va a atrapar los errores solo. Un test de concurrencia mal escrito da falsa tranquilidad — por eso ese lo piensa el ingeniero estructural, que entiende cómo dos cosas se pisan. El test de camino feliz o de regresión simple lo escribe el caballo de batalla. |
| **Escribir migraciones y scripts de corrección de datos** (tocar la base de datos, reparar registros) | **El consultor eminente** *(el ingeniero estructural si además hay concurrencia)* — y **SIEMPRE con freno humano** 📖 | 🤖👁 Es lo más destructivo del sistema: un error acá no se ve y no se deshace. Lo diseña el modelo más capaz, pasa por la guarda automática anti-producción, y **nunca se ejecuta contra datos reales sin el OK explícito del dueño.** Ver la regla dura abajo. |

---

## La regla dura (la que no se negocia)

Todo lo anterior son recomendaciones de eficiencia. Esta no:

> **Lo que toca dinero, o algo irreversible, lo cierra el modelo más capaz — y nunca sin OK humano.**

Dos mitades, las dos obligatorias:

1. **El modelo más capaz cierra.** Un rol liviano puede *preparar* el terreno (explorar, redactar el borrador, dejar todo listo hasta el punto de decisión), pero el paso final sobre dinero, seguridad o datos irreversibles lo firma el consultor eminente o la flota adversaria. No se cierra "por su cuenta" con un modelo barato para ahorrar.
2. **Nunca sin freno humano.** Migrar la base de datos, mover plata, publicar, borrar — eso frena y trae la decisión al dueño, sin importar qué tan seguro esté el agente. Es la [regla de autonomía](../SKILL.md) aplicada al routing: ante la duda entre FORMA y FONDO, es FONDO; lo irreversible **siempre** frena.

Por qué las dos juntas: el modelo más capaz baja la probabilidad de que el paso esté mal *pensado*; el freno humano ataja lo que ningún modelo puede saber — que ese registro sí importaba, que esa cuenta era la equivocada. Uno cubre el criterio, el otro cubre el contexto. Lo delicado necesita los dos.

---

## Mapeo rol → modelo concreto (vigente a 2026-07)

Este es el **único** lugar de todo el método donde aparecen los nombres de catálogo. El resto habla por rol a propósito.

| Rol (estable) | Modelo concreto hoy |
|---|---|
| El obrero veloz | Haiku 4.5 |
| El caballo de batalla | Sonnet 5 |
| El ingeniero estructural | Fable 5 |
| El consultor eminente | Opus 4.8 |
| La flota adversaria | Opus en modo Ultracode |

> **Nota.** Esta tabla se actualiza cuando Anthropic saca modelos nuevos; el resto del método habla por rol para no mentir cuando eso pase. "Flota adversaria" y "Ultracode" no son un modelo distinto: son el apodo del MODO/rol en que se pone al consultor eminente (una flota del mismo modelo, en paralelo y refutando por defecto).

---

*The Raw Method · Raw Logic · No fluff. No licenses. No surprises.*
