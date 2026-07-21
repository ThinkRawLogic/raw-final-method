#!/usr/bin/env node
/**
 * raw-deuda.js — cosecha la deuda declarada en el código (análogo a ponytail-debt).
 * ===============================================================================
 * The Raw Method admite que un candado que "espera en 👁" por falta de tooling es
 * deuda que se pudre si nadie la relee. Este harvester la hace visible: grep de
 * marcadores `raw-deuda:` en el código → un ledger. Informativo (exit 0).
 *
 * Convención del marcador:  // raw-deuda: <qué falta> — <techo/upgrade> [antes: <fecha>]
 *
 *   node gobernanza/raw-deuda.js [dir]
 */
'use strict';
const fs = require('fs');
const path = require('path');

const SKIP = new Set(['.git', 'node_modules', 'dist', 'build', '.next', 'nuxt', 'vendor', 'coverage', 'target']);
const EXT = /\.(js|ts|tsx|jsx|py|go|rb|php|sql|sh|prg|md|yml|yaml)$/i;
// Exige un prefijo de comentario, para no matchear el marcador dentro de un string o regex.
const RE = /(?:\/\/|#|--|;|\*|<!--)\s*raw-deuda:\s*(.+?)\s*$/i;

function walk(dir, out) {
  let es;
  try { es = fs.readdirSync(dir, { withFileTypes: true }); } catch (_) { return; }
  for (const e of es) {
    if (e.isDirectory()) { if (SKIP.has(e.name) || e.name.startsWith('.')) continue; walk(path.join(dir, e.name), out); }
    else if (e.isFile() && EXT.test(e.name) && e.name !== 'raw-deuda.js') out.push(path.join(dir, e.name)); // el propio harvester nombra el marcador en su doc
  }
}

function cosechar(dir) {
  const root = path.resolve(dir);
  const archivos = [];
  walk(root, archivos);
  const items = [];
  for (const f of archivos) {
    let t;
    try { t = fs.readFileSync(f, 'utf8'); } catch (_) { continue; }
    t.split('\n').forEach((l, i) => { const m = l.match(RE); if (m) items.push({ file: path.relative(root, f), line: i + 1, nota: m[1] }); });
  }
  return items;
}

module.exports = { cosechar };

if (require.main === module) {
  const items = cosechar(process.argv[2] || process.cwd());
  if (!items.length) { console.log('✓ raw-deuda — sin marcadores `raw-deuda:` pendientes.'); process.exit(0); }
  console.log(`📋 raw-deuda — ${items.length} deuda(s) declarada(s) en el código:`);
  for (const x of items) console.log(`  · ${x.file}:${x.line} — ${x.nota}`);
  console.log('\nCada una es un candado/atajo diferido. Llevalas a PENDIENTES.md con dueño y fecha tope.');
  process.exit(0);
}
