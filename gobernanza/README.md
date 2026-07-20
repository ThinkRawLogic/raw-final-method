# gobernanza/ — el candado del PROCESO (Nivel 1)

> **Parte de The Raw Method.** Los `candados/` cierran clases de bug en el código. Esto cierra
> el hueco de más arriba: **que la IA (o vos, un viernes cansado) simplemente no corra el método.**
> Lo hace con dos hooks a nivel del harness de Claude Code — los corre el harness, no la IA, así
> que la IA **no los puede saltar.**

Nace de una pregunta honesta: *"se supone que las reglas son candados; la IA no debería poder
obviarlas."* La respuesta (ver `referencias/candados-y-capas.md §5`) es que **no toda regla puede
ser candado** — el juicio no se automatiza. Pero **sí** se pueden encerrar dos cosas que antes
vivían en prosa 👁, y eso es lo que hace este kit.

---

## Qué instala

| Hook | Evento | Qué hace |
|---|---|---|
| `raw-session.js` | **SessionStart** | Si el proyecto usa The Raw Method, inyecta el **reflejo del método** en cada sesión, para que la IA no pueda "olvidar" que opera bajo él. Fuera de un proyecto Raw Method, calla. |
| `raw-gate.js` | **PreToolUse** (Bash/PowerShell) | Intercepta `git commit` y lo **RECHAZA** si una ficha de cobertura marcada como *cerrada* deja una clave sin resolver. |

Lo que hace fuerte al `raw-gate` frente al `pre-commit` de `candados/`:

- Corre a nivel del **harness** → la IA no puede decidir no correrlo.
- **No se evade con `git commit --no-verify`** (interceptamos el comando *antes* de git).
- **No necesita vitest ni Node-en-el-proyecto** — usa el Node de tu máquina (el mismo que ya
  tiene Claude Code). Corre en tu Windows hoy, sobre un proyecto FoxPro/Supabase sin Node.
- Es el port de **CANDADO 1 (COBERTURA)** de `candados/conformance.test.ts` al punto de control real.

---

## Instalar

Necesitás `node` en el PATH (Claude Code ya lo trae). Dos modos:

**A) Global (siempre presente, en todos tus proyectos Raw Method).**
Copiá esta carpeta a un lugar estable (p.ej. `~/.claude/raw-method/gobernanza/`) y mergeá el
bloque `hooks` de `hooks.json` en `~/.claude/settings.json`, reemplazando `__GOBERNANZA__` por esa
ruta absoluta. Silencioso y sin costo fuera de proyectos Raw Method (sale al instante).

**B) Por proyecto (viaja con el proyecto, cero huella global).**
Copiá esta carpeta dentro del proyecto (junto a `candados/`) y mergeá `hooks.json` en
`<proyecto>/.claude/settings.json`. Igual que se copia el arnés, se copia la gobernanza.

En ambos casos, marcá el proyecto como Raw Method con **cualquiera** de estos (basta uno):
un archivo `.the-raw-method` en la raíz, una carpeta `docs/_cobertura/`, un `INVARIABLES.md`,
o el `candados/conformance.test.ts`. Sin marcador, los hooks no se activan.

> Los hooks se leen al **arrancar** la sesión. Después de instalar, iniciá una sesión nueva
> (o `/resume`) para que el reflejo cargue. El gate empieza a morder en el próximo `git commit`.

---

## Probar que muerde

```bash
node gobernanza/test-gobernanza.js
```

Arma proyectos de mentira y verifica el veredicto: bloquea la ficha cerrada con clave muda,
permite la resuelta, no se deja evadir con `--no-verify`, y calla fuera del método. Si sale en
verde, el candado del proceso funciona. Es la misma disciplina del método: **enforcement sin su
prueba es prosa.**

---

## Lo que este Nivel 1 NO cierra (el techo honesto)

Fiel a `§5` del método, no fingimos que esto encierra todo:

- **Encierra la FORMA, no la SUSTANCIA.** El gate verifica que la ficha esté *resuelta*, no que
  la auditoría detrás de cada clave *haya ocurrido de verdad*. La IA sigue llenando su propia
  ficha; el candado exige que no la deje muda, pero no puede leerle la mente. Subir eso de "la IA
  dijo que auditó" a "hay un pase independiente en el expediente" es **Nivel 3** (registrar la
  corrida de un agente fresco), y sigue siendo 👁 con mejor rastro.
- **Solo vigila los commits de la IA vía Claude Code.** Si vos commiteás a mano en tu terminal,
  ese camino lo cubre el `pre-commit` de `candados/` (otra capa). Los dos se complementan.
- **Node debe existir en la máquina.** Si falta, el gate falla-abierto (deja pasar) para no
  brickear tus commits. Es un límite declarado, no un candado silencioso.

*The Raw Method · Raw Logic · No fluff. No licenses. No surprises.*
