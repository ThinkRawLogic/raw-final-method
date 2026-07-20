/**
 * candado-plantilla.ts — plantilla para un candado propio del proyecto
 * =====================================================================
 *
 * Parte de The Raw Method. Copia este archivo (o pega su patrón dentro de
 * conformance.test.ts, en la sección "AGREGA TUS CANDADOS DEL PROYECTO ACÁ")
 * cada vez que una auditoría encuentre una clase de bug y quieras cerrarla para
 * siempre.
 *
 * QUÉ HACE UN CANDADO DE ESTE TIPO
 * --------------------------------
 * Es un "escáner": ya arreglaste un tipo de error una vez; este test barre el
 * código fuente y HACE FALLAR EL COMMIT si esa forma de error VUELVE A APARECER
 * en cualquier archivo — no solo en el lugar que arreglaste, sino en cualquiera
 * futuro. Cierra la CLASE entera, no el caso.
 *
 * Es un detector de humo entrenado con el humo específico que ya te quemó: vuelve
 * a aparecer ese humo en cualquier cuarto de la casa → suena la alarma.
 *
 * EL PATRÓN CLAVE: EL TEST SE AUTO-DESCUBRE SUS PUNTOS DE APLICACIÓN
 * -----------------------------------------------------------------
 * No mantengas una lista de "estos son los archivos a vigilar" — esa lista se
 * queda vieja el día que alguien agrega un archivo nuevo y se olvida de anotarlo.
 * En vez de eso, el test RECORRE el árbol de fuente entero cada vez que corre y
 * descubre solo dónde aplicar la regla. Un archivo nuevo que rompe la regla se
 * AUTO-DELATA, aunque lo hayan creado ayer y nadie lo haya agregado a ninguna lista.
 *
 * Es un inspector que no trabaja con un plano viejo: cada vez recorre el edificio
 * entero y reprueba la puerta sin cerradura, aunque la hayan puesto ayer.
 */

import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join, resolve, relative } from "node:path";

const REPO_ROOT = resolve(process.cwd());

// Carpetas de código fuente a vigilar. Ajusta a tu layout.
const DIRS_FUENTE = ["src", "app", "lib"];
// Extensiones de archivo que son "código" para este proyecto.
const EXT_FUENTE = [".ts", ".tsx", ".js", ".jsx"];
// Carpetas que NUNCA se escanean (ni tienen tu código, ni quieres falsos positivos).
const IGNORAR = new Set(["node_modules", ".git", "dist", "build", ".next", "candados"]);

/**
 * Recorre las carpetas de fuente y devuelve la lista de archivos de código.
 * ESTE es el auto-descubrimiento: la lista se arma sola en cada corrida, no se
 * mantiene a mano. Un archivo nuevo entra en la vigilancia sin que nadie lo agregue.
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
 * Escanea toda la fuente buscando una forma de bug (un patrón de texto o regex)
 * y devuelve los lugares donde reaparece: "archivo:línea".
 *
 * @param patron   La forma del bug ya arreglado, como expresión regular.
 * @param esInfractor  (opcional) filtro extra por si el regex solo no alcanza para
 *                     decidir — por ejemplo, ignorar líneas que son comentarios.
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
// EJEMPLO — copia este bloque, cambia el patrón, y renómbralo a tu clase de bug.
// ---------------------------------------------------------------------------
// Escenario ilustrativo: un bug real fue comparar dinero con decimales sueltos
// (una forma conocida de que se cuelen errores de centavos). Se arregló y ahora
// se cierra la clase: ningún archivo debe volver a hacerlo.
//
// Cambia el nombre del describe/it a lo que arreglaste (así el mensaje de fallo
// le dice al dueño QUÉ clase de bug reapareció), el `patron` a la forma del bug,
// y el mensaje a algo legible cuando el commit se frene.
// ===========================================================================

describe("candado de ejemplo: no comparar dinero con decimales sueltos", () => {
  it("ningún archivo de fuente reintroduce la comparación frágil de montos", () => {
    // Patrón de ejemplo: comparar una variable *monto* / *precio* con ===.
    // (En tu proyecto real, el patrón sale de la forma EXACTA del bug que arreglaste.)
    const patron = /\b(monto|precio|saldo)\w*\s*===/i;

    // Ignoramos líneas comentadas: no son código que corra.
    const noEsComentario = (l: string) => !l.trimStart().startsWith("//");

    const infractores = escanearFuente(patron, noEsComentario);

    expect(
      infractores,
      `\nReapareció una clase de bug ya cerrada (comparación frágil de dinero) en:\n` +
        `  - ${infractores.join("\n  - ")}\n` +
        `Compara montos con el helper del proyecto, no con === sobre decimales.\n`,
    ).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// RECORDATORIO DEL MÉTODO
// Cuando un bug 📖 (una regla que solo estaba escrita) ya causó un problema, el
// arreglo es DOBLE: corriges el caso + le pones ESTE candado en el mismo cambio.
// Fix + candado, nunca fix + más texto. Escribir otro comentario es tomar más deuda.
// ---------------------------------------------------------------------------
