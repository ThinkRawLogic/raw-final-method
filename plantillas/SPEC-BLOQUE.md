# Spec del bloque [Nº / nombre]

> **Plantilla de The Raw Method. Bórrala y hazla tuya.**
>
> Esta es la **spec de un bloque ANTES de construirlo**. Es lectura **obligatoria** al arrancar el bloque: el
> desarrollo nace pegado a lo que dice esta hoja (*spec-first*). Los cambios en vivo **pulen**; no descubren lo
> que ya debería estar escrito acá. Si construyes sin spec, la auditoría del cierre no tiene contra qué medir.
>
> Una spec por bloque. Se escribe antes de la primera línea de código y se apoya en la referencia real (lo que
> ya funciona, el sistema que se imita, el dominio del negocio) — no en la intuición.

**Bloque:** ___________  **Fecha:** ___________  **Referencia base:** ___________

---

## 1. Qué se espera (el alcance)

*Qué tiene que hacer este bloque cuando esté terminado, en llano. El resultado observable, no el cómo. Si no
se puede describir en pocas frases claras, todavía no está listo para construirse.*

## 2. Qué imitar (de lo que ya funciona)

*El punto dulce es familiaridad + robustez. ¿Qué patrón, pantalla o flujo que YA existe y funciona bien copia
este bloque? Reusar el primitivo que ya está antes de inventar uno nuevo. Nombra la pieza concreta a imitar.*

## 3. Qué descartar

*Qué NO va en este bloque — a propósito. Lo que se deja afuera, lo que se difiere para después, lo que un
sistema de referencia hace pero acá no queremos. Escribirlo evita el gold-plating y las discusiones de "¿y
por qué no está X?". Si algo se difiere pero se va a integrar después, deja el enchufe listo, no un callejón
sin salida.*

## 4. Qué ángulos (pilares) toca

*Corré el router: según lo que este bloque toca (dinero, stock, pantallas, migración, dependencia nueva…),
¿qué pilares se prenden? Esto define dos cosas: el* **briefing** *que hay que leer ANTES de construir, y los
ángulos que la auditoría va a correr al cerrar. Lístalos ahora para no "descubrirlos" al final.*

- [ ] Pilar: __________ → briefing leído
- [ ] Pilar: __________ → briefing leído
- [ ] Transversales (siempre): Tests + Documentar

---

## Mini-ejemplo (bórralo cuando tengas el tuyo)

> **Qué se espera.** Pantalla para registrar un pago a proveedor: elegir proveedor, ver su saldo, cargar monto
> y forma de pago, y que el saldo baje.
>
> **Qué imitar.** El flujo de "Cobro a cliente" que ya existe: misma estructura de acción validada + selector
> con búsqueda + doble cifra (total y saldo). Reusar el motor de saldos, no escribir uno nuevo.
>
> **Qué descartar.** NO va conciliación bancaria en este bloque (bloque aparte). El comprobante en PDF se
> difiere, pero dejamos el punto de enganche listo con un stub honesto.
>
> **Ángulos que toca.** Toca dinero → Seguridad + Concurrencia + Rastro. Agrega pantalla → Experiencia + Errores.
> Transversales siempre.
