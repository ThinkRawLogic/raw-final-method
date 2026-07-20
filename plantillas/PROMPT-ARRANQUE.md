# Arranque de la próxima sesión

> **Plantilla de The Raw Method.** Este es el texto que se le pasa a una sesión nueva para retomar el proyecto
> sin perder el hilo. Se **actualiza al cerrar cada bloque** y se **deriva de los documentos base** — así la
> sesión nueva arranca parada sobre todo el contexto, no sobre la memoria de la anterior.
>
> **Candado 🤖 recomendado:** un test que hace fallar el guardado si este arranque **no menciona los documentos
> base**. Suena exagerado, pero el olvido de referenciar el contexto completo es un error que se repite.

---

## LEER PRIMERO (antes de la primera línea de código)

1. **Los documentos base del proyecto**, en este orden:
   - La **ley** (invariantes) — las reglas que no se violan.
   - La **arquitectura** — cómo está pensado el sistema, el stack y sus trampas.
   - El **backlog** — qué falta, y la sección "NO re-proponer".
   - El **diccionario de datos** — qué significa cada tabla y campo.
   - La **bitácora** — qué se hizo y por qué.
2. **La referencia del bloque** que se va a construir (qué se espera, qué imitar, qué descartar).
3. **El checklist de pantalla / la ficha de cobertura** del bloque.

## ESTADO ACTUAL
*(Qué quedó hecho, qué está a medias, dónde retomar. Se reescribe al cerrar cada bloque.)*

## EL BLOQUE QUE SIGUE
*(Alcance, de la referencia. Qué ángulos toca — así se sabe qué auditar al cerrar.)*

## ENTORNO
*(Cómo se levanta el proyecto localmente. Puertos. Qué NO correr mientras el dueño usa el entorno.)*

## DEFINICIÓN DE HECHO
*(El checklist de "terminado" — ver SKILL.md. Nada se cierra sin el OK del dueño.)*
