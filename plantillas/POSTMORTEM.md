# Postmortem — incidente [fecha / título corto]

> **Plantilla de The Raw Method. Bórrala y hazla tuya.**
>
> Cuando algo se rompe en producción, esto es lo que se escribe **después de apagar el fuego**. No es para
> buscar culpables — es para que **la misma clase de incidente no vuelva NUNCA**. Un postmortem sin culpa mira
> el sistema, no a la persona: si un humano pudo equivocarse, es que faltaba un candado.
>
> **La sección que le da sentido a todo** es la última: **qué regla o candado lo evita para siempre** (el motor
> del método: de cada problema, una regla — no solo un parche). Un incidente que se arregla sin regla vuelve
> con otras variables.

**Incidente:** ___________  **Fecha:** ___________  **Severidad:** ___________

---

## 1. Qué pasó

*El hecho, en llano. Qué dejó de funcionar o qué salió mal, contado como se lo contarías a alguien que no
estaba.*

## 2. Cómo se detectó

*Quién o qué avisó. La pregunta incómoda:* **¿lo cazó una alerta del sistema, o lo cazó un cliente reclamando?**
*Si lo cazó un cliente, es también un hallazgo — faltaba la alerta. Anótalo.*

## 3. Impacto

*A quién y cuánto afectó: cuántos clientes, cuánto tiempo, si tocó dinero o datos, si algo quedó en un estado
inconsistente que hubo que reparar a mano.*

## 4. Línea de tiempo

*(Los hitos con hora: cuándo empezó, cuándo se detectó, cuándo se contuvo, cuándo se resolvió del todo.)*

## 5. Causa raíz

*El porqué de fondo, no el síntoma. Sigue preguntando "¿y por qué pasó eso?" hasta llegar a la causa que, si
hubiera estado cubierta, nada de esto ocurría. Casi siempre es una regla que vivía solo en la memoria (📖).*

## 6. La regla que lo evita para siempre (motor §)

> **La parte más importante.** ¿Qué candado 🤖 o regla nueva mata la CLASE ENTERA de este incidente? Entra a la
> ley en el mismo arreglo. Si no se puede automatizar, queda 👁 revisión explícita — pero nunca solo 📖 memoria,
> porque la memoria ya falló una vez acá.

- **Regla nueva:** __________
- **Candado / enforcement:** 🤖 / 👁 __________
- **Alerta que faltaba (si aplica):** __________

---

## Mini-ejemplo (bórralo cuando tengas el tuyo)

> **Qué pasó.** Durante 40 minutos, algunos cobros se registraron dos veces.
>
> **Cómo se detectó.** Lo reportó un cliente al ver su saldo raro. *No saltó ninguna alerta → ese es un
> hallazgo aparte: faltaba la alerta.*
>
> **Impacto.** 7 clientes, saldos inflados, se corrigieron desde el documento origen.
>
> **Causa raíz.** El botón de pago no tenía huella de idempotencia; un doble-tap en conexión lenta lo disparaba
> dos veces. La regla existía en la cabeza de todos pero no había candado.
>
> **Regla que lo evita.** "Toda operación de dinero lleva huella de idempotencia y traba la fila." Candado 🤖:
> test de doble operación en paralelo. Alerta nueva: aviso si un mismo pago entra dos veces en X segundos.
