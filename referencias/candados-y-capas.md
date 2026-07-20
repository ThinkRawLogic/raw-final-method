# Candados y capas

Cómo The Raw Method hace que sus reglas **se cumplan solas** en vez de depender de que alguien se acuerde. Este es el corazón del método: no basta con tener buenas reglas, hay que amarrarlas para que la computadora las exija.

---

## 1. Las tres capas de enforcement

Cada regla del método declara **cómo se hace cumplir**. No está terminada hasta que lo dice. Hay tres niveles, y saber en cuál está cada regla es lo más importante de todo esto.

### 🤖 Automático — el candado

La computadora revisa la regla sola. Es un test, un chequeo de estilo (*linter*) o una verificación de cobertura que **no deja guardar** el código si algo rompe la regla.

Piénsalo como el sensor de una puerta de garaje: no importa si estás distraído o apurado, si hay algo debajo, la puerta **no baja**. No depende de tu memoria ni de tu buena voluntad ese día.

Es el **único nivel perfecto**, porque no depende de que nadie se acuerde de nada. La regla se aplica igual a las 3 de la mañana, un viernes, con el equipo cansado. (Con una condición: que esté **bien construido** para sonar solo ante una ruptura real — un candado que salta en falso se vuelve ruido y la gente lo apaga; ver §3, "cuándo un candado no vale la pena".)

> El nombre técnico de esto es un *check de CI* (integración continua), un *pre-commit hook* o un *test de conformidad*. Todos son lo mismo en el fondo: un guardián que se para en la puerta y no la abre si la regla se rompió.

### 👁 Revisión — el ojo puesto a propósito

Alguien —una persona o una IA— controla la regla **a propósito** y la firma antes de cerrar. Hay un checklist, hay una postura adversaria (se asume que algo está mal y se busca), hay una firma.

Es más débil que el candado porque depende de disciplina. Pero es **explícita**: sabes que ese ángulo se revisó, quién lo revisó, y qué encontró. No es "confío en que alguien lo miró".

Aquí vive todo lo que **todavía no se puede automatizar** (lo veremos al final): los agujeros de lógica sutiles, si algo "se siente" bien o mal, si el flujo tiene sentido para el negocio.

### 📖 Memoria — la regla que solo está escrita

La regla existe únicamente como texto: un comentario en el código, una línea en un documento, algo que "todos sabemos". Nadie la revisa a propósito y ninguna máquina la exige.

**Esto no es enforcement. Es deuda.**

La memoria falla. La gente rota, se olvida, entra alguien nuevo que nunca leyó ese documento, o simplemente es lunes y nadie se acordó. Una regla que vive solo en la memoria **no se aplica: se olvida.** Un comentario que dice "ojo, no hagas tal cosa aquí" no *evita* que la hagas — solo te lo reprocha después.

### Por qué la memoria es deuda (y no un nivel más)

Las otras dos capas te protegen. La memoria solo te da la **ilusión** de estar protegido. Tienes la regla escrita, entonces crees que está cubierta — y no lo está. El día que falle, vas a decir "pero si eso estaba documentado". Estaba documentado y aun así pasó. Eso es exactamente lo que significa "deuda": un préstamo de tranquilidad hoy que vas a pagar con un bug mañana.

**La meta permanente del método es vaciar la capa 📖.** Cada vez que puedas, conviertes una regla de memoria en un candado o al menos en una revisión firmada.

### La regla de oro del ascenso

> Una regla 📖 que **ya causó un problema** DEBE subir de capa **en el mismo arreglo**.

No basta con arreglar el caso que se rompió. Si la regla estaba solo en la memoria y falló, la lección no es "hay que acordarse mejor" — la memoria ya demostró que no funciona. La lección es "esta regla necesitaba un candado y no lo tenía".

Entonces el arreglo es doble: **corriges el caso + le pones el candado**. Fix + candado, nunca fix + más texto. Si respondes a un bug de memoria escribiendo *otro* comentario, acabas de tomar más deuda.

En la práctica, cuando se audita un proyecto maduro, la enorme mayoría de los hallazgos no son reglas nuevas: son reglas que el proyecto **ya tenía**, pero exigidas por memoria. Estaban escritas y aun así se violaron. Eso es la deuda 📖 cobrándose.

---

## 2. El motor: de cada problema, una regla que mata la clase entera

Este es el mecanismo que hace que el método **mejore solo con el tiempo** en vez de correr en la misma rueda para siempre.

### Parche vs. principio

Cuando encuentras un problema, hay dos formas de responder:

- **El parche** cierra *el caso*. Arregla exactamente lo que se rompió, en el lugar donde se rompió. Mañana el mismo tipo de error aparece en otra pantalla y estás igual de expuesto.
- **El principio** mata *la clase entera*. Te preguntas: "¿cuál es la **forma** de este error, y qué regla lo mata para siempre, aquí y en todos los lugares parecidos?" Y escribes esa regla donde corresponde, con su capa de enforcement.

La forma de un error es su patrón, independiente de los datos concretos. "Este documento no revisó si ya estaba anulado antes de operar" no es un problema de *este* documento — es una clase: *ningún* flujo debería operar contra algo anulado. El parche revisa este documento. El principio prohíbe la clase.

### La regla del método

> **De cada problema encontrado, una regla — no solo un parche.**

Cada hallazgo se destila a una regla que ataja la clase entera (mismas formas, otras variables) y, cuando se puede, a un candado 🤖.

### Por qué esto hace que la auditoría encuentre cada vez MENOS

Esta es la parte bonita. Si solo parchearas, cada auditoría encontraría la misma cantidad de problemas para siempre — porque nunca cierras las *clases*, solo los casos.

Pero cuando destilas cada hallazgo a un principio con candado, esa clase entera de error **queda prevenida**. La próxima vez que alguien escriba código de esa forma, el candado se lo impide antes de que llegue a la auditoría. Lo mecánico deja de ser trabajo del auditor porque ya no llega roto.

Entonces la auditoría, con el tiempo, encuentra **cada vez menos cosas mecánicas** y puede dedicar su energía a lo verdaderamente difícil: los agujeros nuevos, sutiles, de lógica. La curva baja. Un proyecto que aplica el motor se vuelve más difícil de romper mes a mes, sin que nadie tenga que recordar las reglas — porque las reglas ya se recuerdan solas.

Un proyecto nuevo empieza **sin reglas propias**: hereda la máquina, no la lista. Y cada auditoría le va tejiendo su propia ley, hecha a su medida, a partir de sus propios errores.

---

## 3. Cómo se construye un candado

Un candado no es magia: es un pedazo de código que corre automáticamente y **falla a propósito** cuando la regla se rompe. Fallar detiene el guardado, el commit o el despliegue. Aquí van los tres tipos más útiles, en llano.

### Tipo A — El escáner: "si este error reaparece, no guardas"

El más simple. Ya arreglaste un tipo de error. Escribes un test que **revisa el código en busca de esa forma** y hace fallar el guardado si la vuelve a encontrar.

**Ejemplo en llano.** Digamos que arreglaste un lugar donde se comparaba dinero usando decimales sueltos (una forma conocida de que se cuelen errores de centavos). El candado es un test que barre todo el código buscando esa forma de comparar dinero. Si alguien la vuelve a escribir en cualquier archivo, el test **falla y no lo deja guardar**. La clase entera queda cerrada: no solo el lugar que arreglaste, sino cualquier lugar futuro.

Es como un detector de humo entrenado con *el humo específico* que ya te quemó una vez. Vuelve a aparecer ese humo en cualquier cuarto de la casa → suena la alarma.

### Tipo B — El auto-descubridor: "enumérate solo y falla si aparece uno nuevo sin protección"

Más poderoso y más astuto. Sirve para las protecciones que **deben estar en muchos lugares a la vez** (por ejemplo, un aislamiento de datos que tiene que aplicarse a *toda* tabla que guarde datos de un cliente).

El problema con estas protecciones es que es fácil poner una tabla nueva y **olvidar** ponerle el candado. Un escáner normal no ayuda porque no sabe cuáles tablas *deberían* tenerlo.

La solución: el test **enumera solo** todos los puntos donde la protección debería estar (por ejemplo, "busca todas las tablas que tienen columna de cliente") y luego verifica que **cada uno** la tenga. Si mañana alguien agrega una tabla nueva con datos de cliente **y se olvida de la protección**, el test la descubre —porque el propio test la encontró al enumerar— y **falla**.

Lo clave: no tienes que mantener una lista de "estos son los lugares protegidos". El test **descubre la lista solo** cada vez que corre. No se puede quedar desactualizado, porque no depende de que alguien acuerde de agregar el lugar nuevo a ninguna lista. El lugar nuevo se auto-delata.

Piénsalo como un inspector que no trabaja con un plano viejo: cada vez recorre el edificio entero, cuenta las puertas que **deberían** tener cerradura, y si encuentra una sin ella, reprueba la inspección. Aunque la puerta la hayan puesto ayer.

### Tipo C — La ficha de cobertura: "no cierras si quedó una casilla sin responder"

Para cuando un bloque de trabajo tiene una **lista de cosas que debía resolver** (una especificación, un checklist de pantalla). El candado es una ficha con una casilla por cada requisito, y **bloquea el cierre** si alguna casilla quedó sin responder.

**Ejemplo en llano.** El plan del bloque decía que la pantalla debía tener: búsqueda por nombre, búsqueda por código, manejo del caso "sin resultados", y estado de carga. La ficha de cobertura tiene esas cuatro casillas. Cuando intentas cerrar el bloque, el candado revisa la ficha: si la casilla "sin resultados" quedó vacía, **el cierre falla**. No te deja declarar terminado algo que dejó un requisito sin tocar.

La gracia es que convierte "¿terminamos todo?" —una pregunta blanda que se responde con optimismo— en un chequeo duro que se responde con hechos. La casilla está marcada o no lo está.

### El patrón común de los tres

Todos hacen lo mismo: **convierten un "acuérdate de..." en un "no puedes guardar si...".** Toman una regla que vivía en la cabeza de alguien y la ponen en la puerta, donde no se puede saltar. Esa es la operación central del método: mover reglas de 📖 hacia 🤖.

### Cuándo un candado NO vale la pena (costo-beneficio)

Un candado no es gratis, y no siempre conviene ponerlo. Dos frenos de criterio:

- **Un candado con falsos positivos es peor que ninguno.** Si salta cuando NO hay problema, la gente aprende a ignorarlo —o a apagarlo—, y el día que salte de verdad nadie lo mira. Un candado que grita en falso se desarma solo. Antes de instalar uno, asegurate de que solo suene cuando la regla se rompió de verdad.
- **No pelees el harness por un fix marginal.** Si poner un candado (o un fix de higiene menor) rompe el andamiaje de tooling —el build, los tests, los datos de ejemplo, los scripts—, no se fuerza: se difiere o se descarta con criterio costo-beneficio. Se prefiere una **convención firmada** (revisión 👁) + un build que anda, sobre una defensa marginal que deja todo roto. **Pero el candado diferido no desaparece:** queda como un **hueco declarado y vigilado** (ver §5), no como deuda 📖 silenciosa.

---

## 4. Shift-left: detectar temprano es más barato

*Shift-left* significa, en llano, **mover la detección de problemas hacia el inicio** — hacia el momento en que escribes el código, no hacia producción cuando ya explotó.

La razón es puro dinero. Un problema cuesta distinto según cuándo lo encuentres:

- Mientras **escribes** → lo arreglas en segundos, nadie se enteró.
- En la **auditoría** → cuesta una revisión, pero todavía es barato.
- En **producción**, con clientes usándolo → cuesta el susto, la corrida a arreglarlo, quizás datos dañados y confianza perdida.

El mismo error, tres precios muy distintos. Por eso los candados 🤖 se ponen lo más cerca posible del teclado: para que el problema se caze cuando es gratis, no cuando es caro. La seguridad, los tests y la calidad se corren al principio, no se dejan para "cuando terminemos".

### Por qué el código que produce una IA se revisa MÁS, no menos

Aquí hay una trampa peligrosa y específica de trabajar con IA.

El código que escribe una IA **se ve prolijo**. Está bien indentado, tiene nombres razonables, comentarios, una estructura que parece pensada. Se *ve* plausible. Y justamente por eso baja la guardia: como se ve bien, uno tiende a revisarlo menos.

Es exactamente al revés. Un código que se ve desprolijo levanta sospechas solo; uno que se ve prolijo **pero está mal por dentro** pasa colado. La apariencia de calidad no es calidad. Una IA puede escribir con total seguridad algo que revisa el saldo en el lugar equivocado, o que se olvidó de un caso, con la misma prolijidad con la que escribe algo correcto.

Por eso la regla del método es dura: **ningún cambio hecho por IA se cierra sin revisión adversaria por un agente fresco (o persona), refutando por defecto.** Ojo con la distinción: la revisión adversaria **no exige un humano** —la puede correr una flota de agentes, y el dueño no necesita ser ingeniero para pedirla—; lo que sí se exige siempre es el **OK final del dueño** (el go/no-go), que es otra cosa. Se lo mira con ojo de "esto está mal hasta que me demuestre lo contrario", *más* fuerte, no menos, precisamente porque la prolijidad engaña. La lente adversaria (asumir que algo está roto y buscarlo) se aplica **mientras se construye** el código sensible —dinero, inventario— no solo al final.

---

## 5. El límite honesto: lo que NO se puede automatizar

The Raw Method **no finge** que todo se puede meter en un candado. Fingirlo sería su propia forma de deuda: creer que estás cubierto cuando no lo estás.

Hay cosas que una máquina no puede juzgar:

- **Los agujeros de lógica sutiles.** Que dos reglas correctas por separado se contradigan al combinarse. Que un flujo tenga un hueco que solo aparece en una secuencia rara de pasos. Un test verifica lo que le enseñaste a verificar; no razona sobre lo que no se le ocurrió a nadie.
- **Si algo "se siente" bien o mal.** Si una pantalla es confusa. Si el flujo tiene sentido para cómo trabaja realmente el negocio. Si una decisión, aunque técnicamente correcta, es la incorrecta para el producto. Eso es juicio, y el juicio no se automatiza.

Todo eso vive —honestamente— en la capa 👁 **revisión adversaria**: una persona o una IA fresca que ataca el código asumiendo que está roto, con checklist y firma. No se pretende que hay un candado donde no lo hay.

La disciplina del método es doble y hay que sostener las dos mitades a la vez:

1. **Todo lo que se PUEDE automatizar, se automatiza.** Dejar en memoria algo que podía ser un candado es deuda pura y evitable.
2. **Todo lo que NO se puede, se declara como revisión — no se disfraza de candado.** Un reporte de auditoría honesto dice qué se probó, qué sobrevivió, y **qué no se alcanzó a probar**. El hueco que reconoces lo puedes vigilar; el que finges haber cubierto te agarra desprevenido.

Esa honestidad —candado donde se puede, ojo declarado donde no, y nunca memoria disfrazada de protección— es lo que hace que las tres capas signifiquen algo.

---

*The Raw Method · Raw Logic · No fluff. No licenses. No surprises.*
