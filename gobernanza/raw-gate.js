#!/usr/bin/env node
/**
 * raw-gate.js — EL CANDADO DEL PROCESO (The Raw Method · Nivel 1)
 * ================================================================
 * Hook PreToolUse. Se dispara ANTES de que la IA corra un comando (Bash/PowerShell)
 * y RECHAZA el `git commit` si una ficha de cobertura marcada como CERRADA deja
 * una clave sin resolver. A diferencia del pre-commit de git, esto:
 *   - corre a nivel del harness (la IA no lo puede saltar),
 *   - NO se puede evadir con `git commit --no-verify` (interceptamos el comando antes de git),
 *   - no depende de vitest/Node-en-el-proyecto (corre con el Node de tu máquina).
 *
 * Es el port de CANDADO 1 (COBERTURA) de candados/conformance.test.ts al punto
 * de control real: el momento en que la IA intenta guardar.
 *
 * Contrato PreToolUse: lee JSON por stdin { tool_name, tool_input:{command}, cwd }.
 * Para BLOQUEAR: exit 2 + mensaje por stderr (el harness se lo muestra a la IA).
 * Para PERMITIR: exit 0 sin ruido.
 *
 * Filosofía de fallo: ante un error interno, FALLA-ABIERTO (exit 0) para no brickear
 * tus commits — pero lo avisa por stderr. Un candado que rompe el flujo se apaga solo.
 */

'use strict';
const fs = require('fs');
const path = require('path');

// Las 15 claves canónicas de la ficha (deben coincidir con plantillas/ficha-cobertura.md
// y con candados/conformance.test.ts).
const CLAVES_CANONICAS = [
  'spec-leída', 'orden', 'seguridad', 'experiencia', 'concurrencia', 'errores',
  'rastro', 'config', 'aguante', 'stack', 'dato', 'tests', 'auditoría', 'docs', 'OK',
];

function allow() { process.exit(0); }
function block(msg) {
  process.stderr.write(
    '\n⛔ THE RAW METHOD — commit bloqueado por el candado de cobertura.\n\n' +
    msg +
    '\n\nResolvé cada clave ([x] con nota de CÓMO, o [x] N/A — <por qué>) antes de cerrar.\n' +
    'Esto no es castigo: es el freno que evita declarar "hecho" algo con un ángulo sin revisar.\n'
  );
  process.exit(2); // exit 2 = PreToolUse bloquea la llamada
}

function readStdin() {
  // Windows/PowerShell antepone un BOM UTF-8 al pipe; sin quitarlo, JSON.parse
  // revienta y el candado fallaría-abierto (nunca bloquearía). Ver ponytail.
  try { return fs.readFileSync(0, "utf8").replace(/^\uFEFF/, "").trim(); } catch (_) { return ''; }
}

function isMethodProject(dir) {
  const marcadores = [
    path.join(dir, '.the-raw-method'),
    path.join(dir, 'docs', '_cobertura'),
    path.join(dir, '_cobertura'),
    path.join(dir, 'candados', 'conformance.test.ts'),
    path.join(dir, 'INVARIABLES.md'),
  ];
  return marcadores.some((p) => { try { return fs.existsSync(p); } catch (_) { return false; } });
}

/** Junta las fichas de cobertura del proyecto (excluye la plantilla vacía). */
function leerFichas(dir) {
  const dirs = [path.join(dir, 'docs', '_cobertura'), path.join(dir, '_cobertura')];
  const fichas = [];
  for (const d of dirs) {
    let entradas = [];
    try { entradas = fs.readdirSync(d); } catch (_) { continue; }
    for (const f of entradas) {
      if (!f.endsWith('.md')) continue;
      const ruta = path.join(d, f);
      try { fichas.push(parseFicha(fs.readFileSync(ruta, 'utf8'), f)); } catch (_) {}
    }
  }
  return fichas;
}

/** Port de parseFicha() de conformance.test.ts. */
function parseFicha(texto, archivo) {
  const mFecha = texto.match(/Fecha de cierre:\**\s*([^\n]*)/i);
  const valorFecha = (mFecha && mFecha[1] ? mFecha[1] : '').replace(/[_*\s]/g, '');
  const cerrada = valorFecha.length > 0;

  const claves = new Map();       // clave -> marcada (bool)
  const notaFaltante = new Set(); // claves cuyo "___" sigue sin llenar
  const re = /-\s*\[( |x|X)\]\s*\*\*\(([^)]+)\)\*\*/;
  for (const linea of texto.split('\n')) {
    const m = re.exec(linea);
    if (!m) continue;
    const marcada = m[1].toLowerCase() === 'x';
    const clave = m[2].trim();
    claves.set(clave, marcada);
    if (linea.includes('___')) notaFaltante.add(clave);
  }
  return { archivo, cerrada, claves, notaFaltante };
}

function problemasDeFicha(f) {
  const out = [];
  for (const clave of CLAVES_CANONICAS) {
    if (!f.claves.has(clave)) out.push(`falta la clave (${clave})`);
    else if (f.claves.get(clave) === false) out.push(`(${clave}) quedó en [ ] pero el bloque se declaró cerrado`);
    else if (f.notaFaltante.has(clave)) out.push(`(${clave}) está marcada [x] pero su nota sigue vacía (el "___" sin llenar)`);
  }
  return out;
}

function main() {
  let data = {};
  try { data = JSON.parse(readStdin() || '{}'); } catch (_) { data = {}; }

  const command = (data.tool_input && data.tool_input.command) || '';
  const dir = data.cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd();

  // Solo nos importan los commits.
  if (!/\bgit\s+commit\b/.test(command)) return allow();

  // Fuera de un proyecto Raw Method, no nos metemos.
  if (!isMethodProject(dir)) return allow();

  const fichas = leerFichas(dir);
  const cerradas = fichas.filter((f) => f.cerrada);

  // Regla 1 (CANDADO COBERTURA): ninguna ficha cerrada deja una clave muda.
  const problemas = [];
  for (const f of cerradas) {
    for (const p of problemasDeFicha(f)) problemas.push(`  · ${f.archivo}: ${p}`);
  }
  if (problemas.length) {
    return block('Cobertura incompleta en bloque(s) cerrado(s):\n' + problemas.join('\n'));
  }

  // Regla 2 (opt-in, sin falsos positivos): si el commit DECLARA un cierre
  // ([cierre] / "cerrar bloque" / "close block") pero no hay ninguna ficha
  // cerrada, no dejamos declarar "hecho" sin su ficha.
  const declaraCierre = /\[cierre\]|cerrar\s+bloque|close\s+block/i.test(command);
  if (declaraCierre && cerradas.length === 0) {
    return block(
      'El commit declara un CIERRE de bloque pero no hay ninguna ficha de cobertura cerrada.\n' +
      '  · Copiá plantillas/ficha-cobertura.md, resolvé sus 15 claves y llená "Fecha de cierre".'
    );
  }

  return allow();
}

try {
  main();
} catch (e) {
  // Falla-abierto: nunca brickeamos un commit por un error del propio candado.
  try { process.stderr.write(`[raw-gate] aviso: el candado no pudo evaluar (${e && e.message}); se deja pasar.\n`); } catch (_) {}
  process.exit(0);
}
