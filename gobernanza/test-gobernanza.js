#!/usr/bin/env node
/**
 * test-gobernanza.js — la prueba de que el candado del proceso MUERDE de verdad.
 * ============================================================================
 * Corre los hooks y el CLI contra proyectos de mentira y verifica el veredicto:
 *   Nivel 1 (raw-gate, hook):
 *     - ficha cerrada con clave muda  → git commit BLOQUEADO (exit 2)
 *     - ficha cerrada y resuelta       → git commit PERMITIDO (exit 0)
 *     - commit [cierre] sin ficha       → BLOQUEADO
 *     - --no-verify NO evade; payload con BOM (Windows) sigue bloqueando
 *     - raw-session inyecta el reflejo dentro del método, y calla fuera
 *   Nivel 2 (raw-check, CLI/CI):
 *     - ficha cerrada con clave muda  → exit 1  ·  resuelta → exit 0  ·  no-método → exit 0
 *
 * Sin frameworks. `node test-gobernanza.js` → sale != 0 si algo falla.
 */
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const HERE = __dirname;
const GATE = path.join(HERE, 'raw-gate.js');
const SESSION = path.join(HERE, 'raw-session.js');
const CHECK = path.join(HERE, 'raw-check.js');

let fallos = 0;
function check(nombre, cond) {
  process.stdout.write(`${cond ? '✓' : '✗ FALLA:'} ${nombre}\n`);
  if (!cond) fallos++;
}

// --- utilidades para armar proyectos de mentira -----------------------------
function tmpProyecto(sufijo) {
  return fs.mkdtempSync(path.join(os.tmpdir(), `raw-test-${sufijo}-`));
}
function ponerFicha(dir, nombre, texto) {
  const d = path.join(dir, 'docs', '_cobertura');
  fs.mkdirSync(d, { recursive: true });
  fs.writeFileSync(path.join(d, nombre), texto);
}
function marcarMetodo(dir) { fs.writeFileSync(path.join(dir, '.the-raw-method'), 'v1\n'); }

const CLAVES = ['spec-leída','orden','seguridad','experiencia','concurrencia','errores',
  'rastro','config','aguante','stack','dato','tests','auditoría','docs','OK'];

function fichaResuelta(cerrada) {
  const fecha = cerrada ? '2026-07-20' : '___________';
  const lineas = CLAVES.map((c) => `- [x] **(${c})** algo. → hecho tal cosa`);
  return `# Ficha\n\n**Bloque:** demo  **Fecha de cierre:** ${fecha}\n\n## Claves\n\n${lineas.join('\n')}\n`;
}
function fichaConClaveMuda(cerrada) {
  const fecha = cerrada ? '2026-07-20' : '___________';
  const lineas = CLAVES.map((c, i) =>
    i === 2 ? `- [ ] **(${c})** algo. → ___`            // una clave sin resolver
            : `- [x] **(${c})** algo. → hecho tal cosa`);
  return `# Ficha\n\n**Bloque:** demo  **Fecha de cierre:** ${fecha}\n\n## Claves\n\n${lineas.join('\n')}\n`;
}

// runners
function correrGate(command, dir) {
  const payload = JSON.stringify({ tool_name: 'Bash', tool_input: { command }, cwd: dir });
  const r = spawnSync('node', [GATE], { input: payload, encoding: 'utf8' });
  return { code: r.status, err: r.stderr || '' };
}
function correrSession(dir) {
  const r = spawnSync('node', [SESSION], { input: JSON.stringify({ cwd: dir }), encoding: 'utf8' });
  return r.stdout || '';
}
function correrCheck(dir) {
  const r = spawnSync('node', [CHECK, dir], { encoding: 'utf8' });
  return { code: r.status, out: (r.stdout || '') + (r.stderr || '') };
}

// ============================ Nivel 1 — raw-gate (hook) ======================

// 1. ficha cerrada con clave muda → BLOQUEA
{
  const dir = tmpProyecto('muda'); marcarMetodo(dir);
  ponerFicha(dir, 'bloque-1.md', fichaConClaveMuda(true));
  const r = correrGate('git commit -m "cambio"', dir);
  check('gate: ficha cerrada con clave muda → BLOQUEADO (exit 2)', r.code === 2);
  check('gate:   · el mensaje nombra la clave sin resolver', /seguridad/.test(r.err));
}

// 2. ficha cerrada y resuelta → PERMITE
{
  const dir = tmpProyecto('ok'); marcarMetodo(dir);
  ponerFicha(dir, 'bloque-1.md', fichaResuelta(true));
  check('gate: ficha cerrada y resuelta → PERMITIDO (exit 0)', correrGate('git commit -m "x"', dir).code === 0);
}

// 3. ficha con clave muda pero AÚN ABIERTA → PERMITE
{
  const dir = tmpProyecto('abierta'); marcarMetodo(dir);
  ponerFicha(dir, 'bloque-1.md', fichaConClaveMuda(false));
  check('gate: ficha abierta (en curso) con clave muda → PERMITIDO', correrGate('git commit -m "wip"', dir).code === 0);
}

// 4. comando que no es git commit → PERMITE
{
  const dir = tmpProyecto('nocommit'); marcarMetodo(dir);
  ponerFicha(dir, 'bloque-1.md', fichaConClaveMuda(true));
  check('gate: comando que no es `git commit` → PERMITIDO', correrGate('git status', dir).code === 0);
}

// 5. proyecto que NO usa el método → PERMITE
{
  const dir = tmpProyecto('nometodo');
  check('gate: proyecto sin The Raw Method → PERMITIDO', correrGate('git commit -m "x"', dir).code === 0);
}

// 6. commit [cierre] sin ninguna ficha cerrada → BLOQUEA
{
  const dir = tmpProyecto('cierre-sin-ficha'); marcarMetodo(dir);
  check('gate: commit [cierre] sin ficha cerrada → BLOQUEADO (exit 2)', correrGate('git commit -m "[cierre] bloque 3"', dir).code === 2);
}

// 7. --no-verify NO evade el gate
{
  const dir = tmpProyecto('noverify'); marcarMetodo(dir);
  ponerFicha(dir, 'bloque-1.md', fichaConClaveMuda(true));
  check('gate: `git commit --no-verify` NO evade el candado (exit 2)', correrGate('git commit --no-verify -m "x"', dir).code === 2);
}

// 8-9. raw-session
{
  const dir = tmpProyecto('sesion'); marcarMetodo(dir);
  check('session: inyecta el reflejo en proyecto Raw Method', /THE RAW METHOD/.test(correrSession(dir)));
  const dir2 = tmpProyecto('sesion-muda');
  check('session: calla fuera de un proyecto Raw Method', correrSession(dir2).trim() === '');
}

// 10. payload con BOM UTF-8 (Windows/PowerShell) → sigue BLOQUEANDO
{
  const dir = tmpProyecto('bom'); marcarMetodo(dir);
  ponerFicha(dir, 'bloque-1.md', fichaConClaveMuda(true));
  const payload = "\uFEFF" + JSON.stringify({ tool_name: 'Bash', tool_input: { command: 'git commit -m x' }, cwd: dir });
  const r = spawnSync('node', [GATE], { input: payload, encoding: 'utf8' });
  check('gate: payload con BOM (caso Windows/PowerShell) → BLOQUEA (exit 2)', r.status === 2);
}

// ======================= Nivel 2 — raw-check (CLI / CI) ======================

// 11. raw-check: ficha cerrada con clave muda → FALLA (exit 1)
{
  const dir = tmpProyecto('check-muda'); marcarMetodo(dir);
  ponerFicha(dir, 'bloque-1.md', fichaConClaveMuda(true));
  const r = correrCheck(dir);
  check('check: ficha cerrada con clave muda → FALLA (exit 1)', r.code === 1);
  check('check:   · nombra la clave sin resolver', /seguridad/.test(r.out));
}

// 12. raw-check: ficha resuelta → OK (exit 0)
{
  const dir = tmpProyecto('check-ok'); marcarMetodo(dir);
  ponerFicha(dir, 'bloque-1.md', fichaResuelta(true));
  check('check: ficha cerrada y resuelta → OK (exit 0)', correrCheck(dir).code === 0);
}

// 13. raw-check: proyecto no-método → OK (exit 0)
{
  const dir = tmpProyecto('check-nometodo');
  check('check: proyecto sin The Raw Method → OK (exit 0)', correrCheck(dir).code === 0);
}

process.stdout.write(`\n${fallos === 0 ? '✅ TODO EN VERDE' : `❌ ${fallos} fallo(s)`}\n`);
process.exit(fallos === 0 ? 0 : 1);
