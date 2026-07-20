# Invariantes — la LEY de este proyecto

> **Plantilla de The Raw Method. Bórrala y hazla tuya.**
>
> Este es el documento más importante del proyecto: las reglas que **no se violan**. Arranca casi vacío
> y **crece solo**. Cada vez que la auditoría encuentra un problema, esa lección entra acá como una regla
> nueva — no como un parche suelto (motor **§ cada parche → un principio**).
>
> **Regla de oro:** ninguna regla está terminada hasta que declara **cómo se hace cumplir**. Marca cada una:
> - **🤖 Automático** — un test/candado que no deja guardar si se rompe. *(el único nivel perfecto)*
> - **👁 Revisión** — alguien o una IA lo controla a propósito antes de cerrar.
> - **📖 Memoria** — solo está escrito. **Es deuda.** Si una regla 📖 ya causó un problema, súbela de nivel.
>
> **La meta permanente es vaciar la capa 📖.** Lee este archivo al inicio de CADA sesión y aplícalo — no
> alcanza con leerlo.

---

## Cómo numerar
Cada regla lleva un número corre­lativo (1, 2, 3…) que no cambia nunca, así el resto de los documentos
puede citarla ("ver regla 14"). Agrúpalas por pilar (los ángulos de `referencias/pilares.md`).

---

## Ejemplo (bórralo cuando tengas los tuyos)

**Seguridad**
1. **La identidad del usuario sale siempre del login en el servidor, nunca de algo que mande el navegador.**
   Un dato de identidad enviado por el cliente es hostil hasta que se verifica. **Enforcement:** 🤖 (test que
   revisa que ninguna acción confíe en un id de usuario del request).

**Que dos cosas a la vez no se pisen**
2. **Antes de decidir sobre stock o dinero, se traba la fila de la que depende la decisión** — no solo antes
   de escribir. Si no, dos operaciones simultáneas pueden pasar el control las dos. **Enforcement:** 🤖 (test
   de dos operaciones en paralelo con reversa).

---

## Reglas del proyecto

*(Vacío. Se llena a medida que el proyecto aprende.)*
