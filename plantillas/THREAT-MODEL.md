# Modelo de amenazas — bloque [Nº / nombre]

> **Plantilla de The Raw Method. Bórrala y hazla tuya.**
>
> Este documento piensa la **seguridad ANTES de construir**, no después (*shift-left*: mover el pensar en
> seguridad al arranque, cuando arreglar es barato). Se llena junto con la spec del bloque. Responde cuatro
> preguntas simples: **qué se protege**, **quién es el atacante**, **por dónde entraría** y **qué lo frena**.
>
> **Por qué por bloque:** la seguridad no es una revisión final genérica; cada bloque tiene su superficie. Un
> bloque de pagos y uno de reportes se atacan distinto. Pensarlo acá es lo que después la auditoría verifica.

**Bloque:** ___________  **Fecha:** ___________

---

## 1. Qué se protege (el activo)

*Lo valioso que este bloque toca: dinero, datos personales, la separación entre clientes, la integridad de un
saldo, un documento que no se puede falsificar. Si no hay nada valioso, dilo — igual sirve dejarlo escrito.*

## 2. Quién es el atacante

*Contra quién se defiende. No siempre es un hacker: puede ser un usuario común buscando ver lo que no le toca,
un cliente hostil, un empleado interno, un bot, o un cliente probando "a ver qué pasa" con un dato raro.*

## 3. Por dónde entraría (la superficie)

*Los puntos por donde se intentaría romper. Ej.: un ID fabricado para ver datos de otro cliente, un dato
malicioso en un formulario, dos operaciones simultáneas, un parámetro omitido a propósito, un mensaje diseñado
para engañar a una IA de producto.*

## 4. Qué lo frena (la defensa)

*El candado concreto que para cada entrada de arriba, y con qué capa se hace cumplir (🤖 automático / 👁
revisión / 📖 memoria = deuda). Idealmente cada amenaza real termina en un candado 🤖 y en una regla nueva
de la ley.*

| Por dónde entra | Qué lo frena | Enforcement |
|---|---|---|
| *(ej. ID fabricado de otro cliente)* | *(la acción revalida el dueño del dato en el servidor)* | 🤖 |
| | | |

---

## Mini-ejemplo (bórralo cuando tengas el tuyo)

> **Qué se protege.** Los saldos por cobrar de cada cliente y la separación entre clientes (que uno no vea al
> otro).
>
> **Quién es el atacante.** Un usuario logueado del cliente A que cambia el número en la URL para intentar ver
> la factura del cliente B.
>
> **Por dónde entraría.** El endpoint que trae una factura por su ID: si confía en el ID sin revisar dueño,
> filtra datos.
>
> **Qué lo frena.** La acción del servidor revalida que la factura pertenezca al cliente logueado (sale del
> login, nunca del navegador). Candado 🤖: test que intenta el ID cruzado y espera rechazo. Regla nueva en la
> ley: "todo acceso por ID revalida propiedad en el servidor".
