# Glosario — el idioma técnico en llano

> **Plantilla de The Raw Method. Bórrala y hazla tuya.**
>
> Este glosario traduce a **castellano llano** las palabras técnicas que van a aparecer en la bitácora, los
> reportes y las conversaciones con los agentes. Está pensado para el **dueño no-ingeniero**: cada término en
> **una línea**, sin jerga que explique jerga.
>
> **Se va llenando solo:** arranca con los términos de abajo ya sembrados, y **cada vez que aparece una palabra
> nueva que el dueño no tiene por qué saber, se agrega acá** — en el mismo momento, no "después".

---

## Términos (orden alfabético)

- **backpressure** — cuando algo recibe más trabajo del que aguanta y, en vez de reventar, frena la entrada para no ahogarse.
- **build** — el paso que arma el programa final listo para usar, a partir del código escrito.
- **canary** — soltar un cambio primero a una parte chiquita de los usuarios para ver si rompe algo, antes de dárselo a todos.
- **commit** — una foto guardada de un cambio en el código, con su fecha, su autor y el porqué. La unidad de "guardar" del historial.
- **concurrencia** — dos o más cosas pasando al mismo tiempo (dos clics, dos pestañas) que pueden pisarse si no se coordinan.
- **downside** — lo que pasa si algo sale mal. Cuanto más grave e irreversible, más cuidado (y más caro el modelo que lo hace).
- **endpoint** — una "puerta" del servidor a la que se le pide algo o se le manda algo; una dirección donde el sistema atiende.
- **feature flag** — un interruptor para prender o apagar una función sin tener que volver a publicar el programa.
- **idempotencia** — que repetir la misma operación no cambie el resultado: apretar "pagar" dos veces cobra una sola vez.
- **linter** — un corrector de estilo automático del código; marca errores y descuidos antes de que molesten.
- **merge** — juntar dos líneas de trabajo del código en una sola.
- **migración** — un cambio en la estructura de la base de datos (agregar una columna, cambiar un tipo). Lo más delicado: puede no verse y no deshacerse.
- **modal** — esa ventanita que se abre encima de la pantalla y te obliga a atenderla antes de seguir.
- **N+1** — el error de hacer una consulta a la base por cada fila de una lista, en vez de una sola para todas; se arrastra y frena todo cuando hay volumen.
- **pull request** — el pedido formal de "revisa e incorpora este cambio"; es donde se mira y se aprueba antes de que entre.
- **RLS / aislamiento** — la barrera que garantiza que un cliente jamás vea los datos de otro cliente, aunque compartan la misma base.
- **runbook** — el paso a paso "para dummies" de una operación delicada, con todas sus trampas anotadas.
- **stub** — una pieza puesta a propósito como "de mentira" que respeta el lugar de la real, para enganchar después sin dejar un callejón sin salida.
- **suite (de pruebas)** — el conjunto completo de tests del proyecto; corre entero para avisar si algo se rompió.
- **tenant / cliente** — cada empresa que usa el mismo sistema con sus datos separados; el mismo motor sirve a muchos tenants cambiando solo config.

---

*(Agrega acá todo término nuevo apenas aparezca. Un glosario que se queda viejo deja al dueño ciego.)*
