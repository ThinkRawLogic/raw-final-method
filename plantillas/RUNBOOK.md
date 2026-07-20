# Runbook — [nombre de la operación]

> **Plantilla de The Raw Method. Bórrala y hazla tuya.**
>
> Un runbook es el **paso a paso "para dummies"** de una operación delicada: la que sale bien nueve de diez
> veces y la décima te arruina el día si te salteas un detalle. Sirve para que **cualquiera la ejecute igual**,
> aunque no sea quien la diseñó, sin depender de la memoria de nadie.
>
> **La regla de oro del runbook:** documenta **TODAS las trampas**. El paso obvio no necesita runbook; el
> runbook existe justamente por lo que NO es obvio — el orden que importa, el respaldo que hay que tener antes,
> el punto de no retorno. Y toda operación irreversible (tocar producción, mover dinero, migrar, borrar)
> **frena y pide OK del dueño**: no se ejecuta sola.

**Operación:** ___________  **Cuándo se usa:** ___________  **Reversible:** sí / no

---

## Antes de empezar (precondiciones y respaldo)

- [ ] *(Qué tiene que estar cierto antes de tocar nada.)*
- [ ] **Si es irreversible:** hay un respaldo **fresco y probado** (probado = se restauró alguna vez, no es fe).
- [ ] **Si toca producción/dinero:** tengo el **OK explícito del dueño** para este paso.

## Los pasos

*Numerados, en orden estricto. Para cada paso: qué hacer, qué esperar ver si salió bien, y* **la trampa** *(lo
que sale mal si te lo saltas o lo haces fuera de orden). Marca el* **punto de no retorno** *— a partir de ahí ya
no se puede deshacer sin el respaldo.*

1. **[paso]** — qué hacer · qué se ve si salió bien · *trampa: …*
2. **[paso]** — … *trampa: …*
3. **⛔ PUNTO DE NO RETORNO** — antes de cruzarlo, confirma respaldo + OK.
4. **[paso]** — …

## Cómo saber si salió bien

*(La verificación final: qué mirar para confirmar que la operación quedó completa y correcta.)*

## Si algo sale mal (vuelta atrás)

*(El plan de rollback: cómo se deshace, o —si ya se cruzó el punto de no retorno— cómo se restaura del respaldo.
Si no hay forma de volver, dilo con todas las letras: es la información más importante de la hoja.)*

---

## Mini-ejemplo (bórralo cuando tengas el tuyo)

> **Operación.** Correr una migración de base de datos en producción. Reversible: no (por eso este runbook).
>
> **Antes.** Respaldo fresco tomado y restaurado en un entorno de prueba (probado, no asumido). OK del dueño
> por escrito. Correr primero la guarda anti-producción.
>
> **Pasos.** 1) Poner el sistema en modo lectura. 2) Tomar el respaldo. *Trampa: sin respaldo probado, no se
> avanza — se para.* 3) ⛔ Punto de no retorno: aplicar la migración. 4) Verificar que las tablas quedaron como
> se esperaba.
>
> **Si algo sale mal.** Antes del paso 3 se cancela sin consecuencias. Después del paso 3, la única salida es
> restaurar del respaldo del paso 2 — por eso el paso 2 no es opcional.
