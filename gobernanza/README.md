# gobernanza/ — el candado del PROCESO (Niveles 1 y 2)

> **Parte de The Raw Method.** Los `candados/` cierran clases de bug en el código. Esto cierra
> el hueco de más arriba: **que la IA (o vos, un viernes cansado) simplemente no corra el método.**

Nace de una pregunta honesta: *"se supone que las reglas son candados; la IA no debería poder
obviarlas."* La respuesta (ver `referencias/candados-y-capas.md §5`) es que **no toda regla puede
ser candado** — el juicio no se automatiza. Pero **sí** se pueden encerrar cosas que antes vivían
en prosa 👁, y eso es lo que hace este kit, en dos niveles.

---

## Nivel 1 — que la IA no pueda saltarse el método (hooks del harness)

| Pieza | Evento | Qué hace |
|---|---|---|
| `raw-session.js` | **SessionStart** | Si el proyecto usa The Raw Method, inyecta el **reflejo del método** en cada sesión, para que la IA no pueda "olvidar" que opera bajo él. Fuera de un proyecto Raw Method, calla. |
| `raw-gate.js` | **PreToolUse** (Bash/PowerShell) | Intercepta `git commit` y lo **RECHAZA** (exit 2) si una ficha de cobertura marcada como *cerrada* deja una clave sin resolver. También frena un commit que declara `[cierre]` sin ninguna ficha cerrada. |

Lo corre el **harness**, no la IA → la IA no puede decidir no correrlo. **No se evade con
`--no-verify`** (interceptamos el comando *antes* de git). No necesita vitest ni Node-en-el-proyecto:
usa el Node de tu máquina. Corre en tu Windows hoy, sobre un proyecto FoxPro/Supabase sin Node.

---

## Nivel 2 — que muerda sí o sí, aun sin la IA (CLI + CI)

El hook solo ve los commits que hace la IA vía Claude Code. El Nivel 2 cubre el resto:

| Pieza | Qué hace |
|---|---|
| `raw-check.js` | El **mismo** chequeo de cobertura, como **comando**: `node gobernanza/raw-check.js [dir]`. exit 1 si una ficha cerrada quedó sin resolver. Lo corre el CI y lo podés correr vos a mano. |
| `.github/workflows/raw-method.yml` | El candado a nivel **servidor**. Corre `raw-check` en cada **push y PR**, así cubre el **commit humano**, la **edición por la web de GitHub** y el **`git commit --no-verify`** (imposibles de frenar en local — el CI corre después, sobre lo ya guardado). |

**Para que el CI sea un candado de verdad** (no solo un aviso), activá *branch protection* en
`main` exigiendo el check **"The Raw Method — candado de cobertura"** como obligatorio: así un PR
con una ficha cerrada sin resolver **no se puede mergear**. (Ajustes → Branches → Add rule →
Require status checks to pass.)

> `raw-cobertura.js` es la lógica compartida por el hook y el CLI — una sola verdad del parser de
> fichas. Derivar, no duplicar (el propio pilar de datos del método).

---

## Instalar

Necesitás `node` en el PATH (Claude Code ya lo trae). Dos modos para los hooks:

**A) Global** — copiá esta carpeta a `~/.claude/raw-method/gobernanza/` y mergeá el bloque `hooks`
de `hooks.json` en `~/.claude/settings.json`, reemplazando `__GOBERNANZA__` por esa ruta absoluta.

**B) Por proyecto** — copiá esta carpeta dentro del proyecto y mergeá `hooks.json` en
`<proyecto>/.claude/settings.json`. Para el CI, copiá `.github/workflows/raw-method.yml` a la raíz
del proyecto (ajustando la ruta a `raw-check.js` si moviste la carpeta).

En ambos casos, marcá el proyecto como Raw Method con **cualquiera** de estos (basta uno): un
archivo `.the-raw-method` en la raíz, una carpeta `docs/_cobertura/`, un `INVARIABLES.md`, o el
`candados/conformance.test.ts`. Sin marcador, ni los hooks ni el CI se meten.

> Los hooks se leen al **arrancar** la sesión. Después de instalar, iniciá una sesión nueva
> (o `/resume`) para que el reflejo cargue.

---

## Probar que muerde

```bash
node gobernanza/test-gobernanza.js
```

Arma proyectos de mentira y verifica el veredicto del hook Y del CLI. Si sale en verde, el candado
del proceso funciona. Es la misma disciplina del método: **enforcement sin su prueba es prosa.**

---

## Lo que esto NO cierra (el techo honesto)

Fiel a `§5` del método, no fingimos que esto encierra todo:

- **Encierra la FORMA, no la SUSTANCIA.** El candado verifica que la ficha esté *resuelta*, no que
  la auditoría detrás de cada clave *haya ocurrido de verdad*. La IA sigue llenando su propia ficha;
  exigimos que no la deje muda, pero no le leemos la mente. Subir eso de "la IA dijo que auditó" a
  "hay un pase independiente en el expediente" es **Nivel 3** (registrar la corrida de un agente
  fresco), y sigue siendo 👁 con mejor rastro.
- **El CI cubre el servidor; el hook cubre a la IA; el `pre-commit` de `candados/` cubre tu commit
  local.** Los tres se complementan — ninguno solo alcanza. El CI es la red que atrapa lo que se
  escapó de las otras dos (incluido `--no-verify` local).
- **Node debe existir donde corre.** En tu máquina y en los runners de GitHub, sí. Si faltara, el
  hook falla-abierto (deja pasar) para no brickear commits — límite declarado, no candado silencioso.

*The Raw Method · Raw Logic · No fluff. No licenses. No surprises.*
