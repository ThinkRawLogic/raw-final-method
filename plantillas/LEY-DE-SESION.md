# Ley de sesión — el manual de la casa

> **Plantilla de The Raw Method. Bórrala y hazla tuya.**
>
> Este es el documento que se lee **al inicio de CADA sesión**, sin excepción. Es el "manual de la casa": el
> orden en que se leen los documentos base, el ritmo de trabajo, y —al frente de todo— el checklist que más
> caro sale olvidar. Está pensado para que una sesión nueva arranque parada sobre el contexto, no sobre la
> memoria de la anterior.
>
> **Por qué el checklist va ARRIBA (salience):** lo que está al final no se lee. Las cosas que de verdad no se
> pueden saltar van primero, donde saltan a la vista. Si algo se olvida seguido, súbelo de posición.

---

## 🔴 LO QUE NO SE SALTA (lee esto aunque no leas nada más)

- [ ] Leí la **ley** (invariantes) y la voy a aplicar — no alcanza con leerla.
- [ ] Antes de tocar código: leí la **spec del bloque** (spec-first) y sé qué **ángulos (pilares)** toca.
- [ ] Nada que toque **dinero, datos irreversibles o producción** se cierra solo → **freno y traigo la decisión al dueño** (FONDO).
- [ ] Al cerrar: **auditoría por un revisor independiente**, **ficha de cobertura** completa, **docs al día en el mismo cambio**, y **OK del dueño**.
- [ ] Ante la duda FORMA vs FONDO → es **FONDO**.

---

## 1. Orden de lectura de los documentos base

*Se leen en este orden, antes de la primera línea de código:*

1. **La ley** (invariantes) — las reglas que no se violan.
2. **La arquitectura** — el stack y sus trampas, las piezas y cómo se hablan, motor vs config.
3. **El diccionario de datos** — qué significa cada tabla y campo, qué se deriva de qué.
4. **El backlog** (pendientes) — qué falta, y la sección "NO re-proponer".
5. **La bitácora** — qué se hizo y por qué.
6. **La spec del bloque** que sigue — qué se espera, qué imitar, qué descartar, qué ángulos toca.

## 2. El ritmo de trabajo

*Cómo se trabaja un bloque, de principio a fin:*

- **Antes:** lee la spec + el briefing de los pilares que prende el router. Construir nace pegado a la spec.
- **Durante:** reusa el primitivo que ya existe; lo del cliente va a config, no al motor; si reemplazas un flujo viejo, bórralo en el mismo cambio.
- **Al cerrar:** auditar (revisor independiente) → destilar cada hallazgo a regla + candado → documentar → OK del dueño.

## 3. Entorno

*(Cómo se levanta el proyecto localmente. Puertos. Qué NO correr mientras el dueño usa el entorno. Cómo cerrar
todo al terminar la sesión.)*

---

## Mini-ejemplo (bórralo cuando tengas el tuyo)

> **Lo que no se salta.** Antes de tocar Pagos, leer la ley (regla 14: saldo derivado) y la spec del bloque.
> Pagos toca dinero → freno antes de cualquier cierre y traigo el OK.
>
> **Entorno.** Levantar con `npm run db:local` + servidor en el puerto 3002. NO correr migraciones mientras el
> dueño está en el entorno. Al cerrar la sesión, apago el server y la base local yo, sin que me lo pidan.
