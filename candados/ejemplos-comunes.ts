/**
 * ejemplos-comunes.ts — un MENÚ de candados que sirven a casi cualquier proyecto
 * ==============================================================================
 *
 * Parte de The Raw Method.
 *
 * ⚠️ ESTO NO SE CORRE TAL CUAL. Es un RECETARIO para copiar y adaptar.
 * ----------------------------------------------------------------------------
 * `conformance.test.ts` arranca con dos candados genéricos (cobertura y arranque)
 * y crece con los candados propios de TU proyecto. Pero el arnés recién nacido es
 * flaco: dos candados solos no atajan mucho. Este archivo es el empujón — cuatro
 * candados comunes, que le sirven a casi cualquier proyecto, listos para que los
 * COPIES a `conformance.test.ts` (a la sección "AGREGA TUS CANDADOS DEL PROYECTO
 * ACÁ") y los AJUSTES a tu layout.
 *
 * Están puestos como PLANTILLAS a propósito: cada bloque de test va dentro de un
 * `describe.skip(...)`. Así este archivo puede vivir en el repo sin frenarte un
 * commit antes de que decidas activarlos. Para prender un candado:
 *   1. Copia su bloque a `conformance.test.ts`.
 *   2. Cambia `describe.skip` por `describe`.
 *   3. Ajusta las rutas y los patrones a tu proyecto (los comentarios te dicen dónde).
 *
 * Elige los que apliquen. Un proyecto sin frontend no necesita el de las pantallas
 * de error; uno que sí, lo quiere desde el día uno. El menú es para escoger, no para
 * tragárselo entero.
 *
 * HONESTIDAD, DE FRENTE
 * ----------------------------------------------------------------------------
 * El candado de secretos de acá (ejemplo A) es un PISO, no un techo. Caza los
 * descuidos obvios — una clave pegada en texto plano — pero NO reemplaza un escáner
 * de secretos serio como **gitleaks** o **trufflehog**, que conocen cientos de
 * formas de credencial y revisan también el historial de git. Si manejas secretos
 * de verdad, corre gitleaks además de este candado, no en su lugar. Este te tapa el
 * agujero grande mientras montas el bueno.
 *
 * NOTA DE STACK: TypeScript + vitest, igual que el resto del kit. El patrón —leer
 * archivos del repo y fallar a propósito— transfiere a cualquier lenguaje.
 */

import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, resolve, relative } from "node:path";

const REPO_ROOT = resolve(process.cwd());

// Carpetas de código fuente a vigilar. Ajusta a tu layout.
const DIRS_FUENTE = ["src", "app", "lib"];
// Extensiones que cuentan como "código" para estos escáneres.
const EXT_FUENTE = [".ts", ".tsx", ".js", ".jsx"];
// Carpetas que NUNCA se escanean (ni tienen tu código, ni quieres falsos positivos).
const IGNORAR = new Set(["node_modules", ".git", "dist", "build", ".next", "candados"]);

/**
 * Recorre las carpetas de fuente y devuelve la lista de archivos de código.
 * La lista se arma sola en cada corrida: un archivo nuevo entra en la vigilancia
 * sin que nadie lo agregue a mano. (El mismo helper que usa candado-plantilla.ts.)
 */
function archivosFuente(): string[] {
  const out: string[] = [];
  const visitar = (dir: string) => {
    let entradas;
    try {
      entradas = readdirSync(dir, { withFileTypes: true });
    } catch {
      return; // la carpeta no existe en este proyecto → se ignora
    }
    for (const e of entradas) {
      if (IGNORAR.has(e.name)) continue;
      const ruta = join(dir, e.name);
      if (e.isDirectory()) visitar(ruta);
      else if (EXT_FUENTE.some((ext) => e.name.endsWith(ext))) out.push(ruta);
    }
  };
  for (const d of DIRS_FUENTE) visitar(join(REPO_ROOT, d));
  return out;
}

/**
 * Escanea toda la fuente buscando un patrón (texto o regex) y devuelve los lugares
 * donde aparece: "archivo:línea". `esInfractor` es un filtro extra opcional por si
 * el regex solo no alcanza (por ejemplo, para ignorar comentarios).
 */
function escanearFuente(
  patron: RegExp,
  esInfractor: (linea: string) => boolean = () => true,
): string[] {
  const hallazgos: string[] = [];
  for (const archivo of archivosFuente()) {
    const lineas = readFileSync(archivo, "utf8").split("\n");
    lineas.forEach((linea, i) => {
      if (patron.test(linea) && esInfractor(linea)) {
        hallazgos.push(`${relative(REPO_ROOT, archivo)}:${i + 1}`);
      }
    });
  }
  return hallazgos;
}

// ===========================================================================
// EJEMPLO A — NINGÚN SECRETO SUBIDO AL REPO
// ---------------------------------------------------------------------------
// Qué caza: una clave, token o contraseña pegada en texto plano dentro del código
// —API_KEY=sk-live-..., una clave privada, un token largo asignado a una variable—.
// Por qué importa: un secreto en el repo es un secreto REGALADO. Cualquiera que
// clone el proyecto (o vea el historial) lo tiene. Es la fuga más común y la más
// cara: se arregla rotando la clave, no borrando la línea.
//
// PISO, NO TECHO: esto atrapa el descuido obvio. Para secretos de verdad, corre
// gitleaks además de este candado. Ver la nota de honestidad arriba.
//
// Al copiar: revisa que no te dé falsos positivos con claves de EJEMPLO en tus
// docs o seeds (por eso ignoramos valores tipo "your-key-here" / "changeme").
// ===========================================================================

describe.skip("candado: ningún secreto subido al repo", () => {
  it("no hay claves, tokens ni contraseñas en texto plano en el código", () => {
    // Patrones de secreto comunes. Agrega los formatos que use tu stack.
    const patronesSecreto: RegExp[] = [
      /\b(api[_-]?key|secret|password|passwd|token|access[_-]?key)\s*[:=]\s*['"][^'"]{8,}['"]/i,
      /-----BEGIN\s+(RSA|EC|OPENSSH|DSA|PGP)?\s*PRIVATE KEY-----/,
      /\bsk-[A-Za-z0-9]{20,}\b/,        // claves estilo OpenAI/Stripe
      /\bAKIA[0-9A-Z]{16}\b/,           // access key de AWS
      /\bgh[pousr]_[A-Za-z0-9]{20,}\b/, // tokens de GitHub
    ];

    // Valores de RELLENO que NO son secretos reales: los ignoramos para no gritar
    // por un ejemplo en la documentación o una plantilla de .env.
    const esRelleno = (l: string) =>
      /(your[_-]?|example|placeholder|changeme|xxxx|<[^>]+>|\.\.\.)/i.test(l);

    const infractores = archivosFuente().flatMap((archivo) => {
      const lineas = readFileSync(archivo, "utf8").split("\n");
      const hits: string[] = [];
      lineas.forEach((linea, i) => {
        if (esRelleno(linea)) return;
        if (patronesSecreto.some((p) => p.test(linea))) {
          hits.push(`${relative(REPO_ROOT, archivo)}:${i + 1}`);
        }
      });
      return hits;
    });

    expect(
      infractores,
      `\nParece haber un secreto en texto plano en:\n  - ${infractores.join("\n  - ")}\n` +
        `Sácalo del código y ROTA la clave (ya se considera comprometida). ` +
        `Guárdalo en variables de entorno, no en el repo.\n`,
    ).toEqual([]);
  });
});

// ===========================================================================
// EJEMPLO B — TODA RUTA DE LA APP WEB TIENE SU PANTALLA DE ERROR
// ---------------------------------------------------------------------------
// Qué caza: una sección de la app (una carpeta de ruta) que no tiene su archivo
// de pantalla de error. Cuando algo revienta ahí adentro, en vez de un mensaje
// digno el usuario ve una página en blanco o el error crudo del framework.
// Por qué importa: los errores VAN a pasar. La diferencia entre un producto serio
// y uno frágil es que el serio los recibe con una pantalla que dice "algo salió
// mal, reintentá", no con un volcado técnico que asusta y no ayuda.
//
// Este ejemplo está calibrado para el App Router de Next.js, donde cada carpeta de
// ruta puede tener su `error.tsx`. Si usas otro framework, cambia:
//   - DIR_RUTAS: dónde viven tus rutas.
//   - ES_SEGMENTO_DE_RUTA / ARCHIVO_ERROR: cómo se llama una ruta y su pantalla de
//     error en tu stack (React Router, SvelteKit, etc.).
// ===========================================================================

describe.skip("candado: toda ruta tiene su pantalla de error", () => {
  it("cada carpeta de página expone una pantalla de error", () => {
    // Ajusta a dónde viven tus rutas. En Next App Router suele ser app/ o src/app/.
    const DIR_RUTAS = ["app", join("src", "app")]
      .map((d) => join(REPO_ROOT, d))
      .find((d) => existsSync(d));

    // Si el proyecto no tiene esa carpeta, este candado no aplica: no molesta.
    if (!DIR_RUTAS) return;

    // Una carpeta ES una ruta con página si contiene un page.tsx/jsx.
    const ES_PAGINA = (nombre: string) => /^page\.(tsx|jsx|ts|js)$/.test(nombre);
    // La pantalla de error de esa ruta (o de una ruta padre que la cubra).
    const ES_ERROR = (nombre: string) => /^error\.(tsx|jsx|ts|js)$/.test(nombre);

    // Recorremos el árbol de rutas y anotamos qué carpetas tienen página y cuáles
    // tienen (o heredan) una pantalla de error. Una ruta sin cobertura de error
    // —ni propia ni de un ancestro— es la que delatamos.
    const sinPantallaError: string[] = [];

    const visitar = (dir: string, hayErrorArriba: boolean) => {
      const entradas = readdirSync(dir, { withFileTypes: true });
      const archivos = entradas.filter((e) => e.isFile()).map((e) => e.name);
      const cubierta = hayErrorArriba || archivos.some(ES_ERROR);

      if (archivos.some(ES_PAGINA) && !cubierta) {
        sinPantallaError.push(relative(REPO_ROOT, dir) || ".");
      }
      for (const e of entradas) {
        if (e.isDirectory() && !IGNORAR.has(e.name)) {
          visitar(join(dir, e.name), cubierta);
        }
      }
    };
    visitar(DIR_RUTAS, false);

    expect(
      sinPantallaError,
      `\nEstas rutas no tienen pantalla de error (ni propia ni heredada):\n` +
        `  - ${sinPantallaError.join("\n  - ")}\n` +
        `Agrega un error.tsx en la carpeta (o en una ruta padre que la cubra) ` +
        `para que un fallo no deje al usuario en blanco.\n`,
    ).toEqual([]);
  });
});

// ===========================================================================
// EJEMPLO C — NO QUEDA DEPURACIÓN OLVIDADA EN EL CÓDIGO
// ---------------------------------------------------------------------------
// Qué caza: un console.log (o debugger, o alert) que quedó pegado de cuando
// estabas depurando y se te olvidó sacar.
// Por qué importa: la depuración olvidada es ruido en el mejor caso y una FUGA en
// el peor —un console.log puede terminar imprimiendo datos del usuario o un token
// en los logs de producción—. Además ensucia la consola y esconde los avisos que
// SÍ importan. El código que se guarda es código limpio, no un borrador.
//
// Al copiar: si tu proyecto usa un logger de verdad (console.warn/error a propósito,
// o pino/winston), afina el patrón para cazar solo lo que es depuración de paso.
// Este ejemplo pega sobre console.log/console.debug, debugger y alert.
// ===========================================================================

describe.skip("candado: no queda depuración olvidada", () => {
  it("ningún archivo de fuente deja console.log, debugger ni alert de paso", () => {
    // console.log / console.debug, la sentencia debugger, y alert(...) del navegador.
    const patron = /\b(console\.(log|debug)|debugger|alert)\b/;

    // Ignoramos comentarios y las líneas marcadas a propósito con un permiso explícito.
    // (Si de verdad necesitas un log, déjalo con un // candado:ok al lado y documenta por qué.)
    const noEsPermitido = (l: string) => {
      const t = l.trimStart();
      if (t.startsWith("//") || t.startsWith("*")) return false;
      if (/candado:ok/i.test(l)) return false;
      return true;
    };

    const infractores = escanearFuente(patron, noEsPermitido);

    expect(
      infractores,
      `\nQuedó depuración olvidada en:\n  - ${infractores.join("\n  - ")}\n` +
        `Sácala antes de guardar. Si un log tiene que quedarse, márcalo con ` +
        `// candado:ok y di por qué.\n`,
    ).toEqual([]);
  });
});

// ===========================================================================
// EJEMPLO D — UN BLOQUE CERRADO NO DEJA UN TODO/FIXME ADENTRO
// ---------------------------------------------------------------------------
// Qué caza: un TODO, FIXME, HACK o XXX que quedó vivo en el código de un bloque
// que ya se declaró CERRADO. "Cerrado" tiene que querer decir cerrado.
// Por qué importa: un TODO dentro de un bloque cerrado es una mentira sobre el
// estado del proyecto —dice "listo" cuando hay trabajo pendiente adentro—. El
// método exige que el estado sea honesto: o lo resuelves antes de cerrar, o lo
// mueves al backlog (que es donde vive el trabajo pendiente de verdad), pero no
// lo dejas escondido haciéndose pasar por terminado.
//
// Este candado se apoya en las fichas de cobertura (docs/_cobertura) para saber qué
// bloques están cerrados, y cruza eso con las carpetas que ese bloque tocó. La forma
// EXACTA de mapear "bloque → carpetas" depende de cómo tu proyecto organiza el
// código; abajo va la versión simple: si CUALQUIER bloque está cerrado, el árbol de
// fuente no debería tener TODO/FIXME sueltos. Aprieta el mapeo cuando lo copies.
// ===========================================================================

describe.skip("candado: un bloque cerrado no deja TODO/FIXME adentro", () => {
  it("no quedan marcas de trabajo pendiente una vez que se cerró un bloque", () => {
    const DIR_COBERTURA = join(REPO_ROOT, "docs", "_cobertura");

    // ¿Hay al menos un bloque declarado cerrado? (Ficha con "Fecha de cierre" llena.)
    const hayBloqueCerrado =
      existsSync(DIR_COBERTURA) &&
      readdirSync(DIR_COBERTURA)
        .filter((f) => f.endsWith(".md"))
        .some((f) => {
          const texto = readFileSync(join(DIR_COBERTURA, f), "utf8");
          const m = texto.match(/Fecha de cierre:\**\s*([^\n]*)/i);
          return (m?.[1] ?? "").replace(/[_*\s]/g, "").length > 0;
        });

    // Si todavía no cerraste nada, un TODO es legítimo: el trabajo está en curso.
    if (!hayBloqueCerrado) return;

    // TODO / FIXME / HACK / XXX en código que corre (no en comentarios de licencia
    // ni en este propio archivo de ejemplos).
    const patron = /\b(TODO|FIXME|HACK|XXX)\b/;
    const infractores = escanearFuente(patron);

    expect(
      infractores,
      `\nHay marcas de trabajo pendiente y ya se cerró un bloque:\n` +
        `  - ${infractores.join("\n  - ")}\n` +
        `Resuélvelas antes de cerrar, o mándalas al backlog (docs de pendientes). ` +
        `"Cerrado" con un TODO adentro es un estado que miente.\n`,
    ).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// RECORDATORIO DEL MÉTODO
// Estos cuatro son el PUNTO DE PARTIDA, no la meta. El arnés que de verdad protege
// tu proyecto es el que crece con TUS bugs: cada clase de error que la auditoría 👁
// encuentra se destila a un candado 🤖 en el mismo cambio (fix + candado, nunca fix
// + más texto en un documento 📖). Copia de acá lo que aplique, préndelo, y sigue
// sumando los tuyos.
// ---------------------------------------------------------------------------
