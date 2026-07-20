#!/usr/bin/env node
/**
 * test-gobernanza.js — la prueba de que el candado del proceso MUERDE de verdad.
 * ============================================================================
 * Corre los hooks contra proyectos de mentira y verifica el veredicto:
 *   - ficha cerrada con clave muda  → git commit BLOQUEADO (exit 2)
 *   - ficha cerrada y resuelta       → git commit PERMITIDO (exit 0)
 *   - commit que NO es `git commit`  → PERMITIDO
 *   - proyecto que no usa el método  → PERMITIDO (no nos metemos)
 *   - commit que declara [cierre] sin ninguna ficha → BLOQUEADO
 *   - raw-session imprime el reflejo en proyecto-método, y calla fuera de él
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

let fallos = 0;
function check(nombre, cond) {
  process.stdout.write(`${cond ? '✓' : '✗ FALLA:'} ${nombre}\n`);
  if (!cond) fallos++;
}

// --- utilidades para armar proyectos de mentira -----------------------------
function tmpProyecto(sufijo) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `raw-test-${sufijo}-`));
  return dir;
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

// Corre el gate con un tool_input.command dado, en cwd = dir. Devuelve exit code.
function correrGate(command, dir) {
  const payload = JSON.stringify({ tool_name: 'Bash', tool_input: { command }, cwd: dir });
  const r = spawnSync('node', [GATE], { input: payload, encoding: 'utf8' });
  return { code: r.status, err: r.stderr || '' };
}
function correrSession(dir) {
  const payload = JSON.stringify({ cwd: dir });
  const r = spawnSync('node', [SESSION], { input: payload, encoding: 'utf8' });
  return r.stdout || '';
}

// --- casos ------------------------------------------------------------------

// 1. ficha cerrada con clave muda → BLOQUEA
{
  const dir = tmpProyecto('muda'); marcarMetodo(dir);
  ponerFicha(dir, 'bloque-1.md', fichaConClaveMuda(true));
  const r = correrGate('git commit -m "cambio"', dir);
  check('ficha cerrada con clave muda → commit BLOQUEADO (exit 2)', r.code === 2);
  check('  · el mensaje nombra la clave sin resolver', /seguridad/.test(r.err));
}

// 2. ficha cerrada y resuelta → PERMITE
{
  const dir = tmpProyecto('ok'); marcarMetodo(dir);
  ponerFicha(dir, 'bloque-1.md', fichaResuelta(true));
  const r = correrGate('git commit -m "cambio"', dir);
  check('ficha cerrada y resuelta → commit PERMITIDO (exit 0)', r.code === 0);
}

// 3. la MISMA ficha con clave muda pero AÚN ABIERTA (sin fecha de cierre) → PERMITE
{
  const dir = tmpProyecto('abierta'); marcarMetodo(dir);
  ponerFicha(dir, 'bloque-1.md', fichaConClaveMuda(false));
  const r = correrGate('git commit -m "wip"', dir);
  check('ficha abierta (en curso) con clave muda → PERMITIDO (no molesta hasta cerrar)', r.code === 0);
}

// 4. comando que no es git commit → PERMITE aunque haya ficha mala
{
  const dir = tmpProyecto('nocommit'); marcarMetodo(dir);
  ponerFicha(dir, 'bloque-1.md', fichaConClaveMuda(true));
  const r = correrGate('git status', dir);
  check('comando que no es `git commit` → PERMITIDO', r.code === 0);
}

// 5. proyecto que NO usa el método → PERMITE (no nos metemos)
{
  const dir = tmpProyecto('nometodo'); // sin marcador ni fichas
  const r = correrGate('git commit -m "cambio"', dir);
  check('proyecto sin The Raw Method → PERMITIDO', r.code === 0);
}

// 6. commit que declara [cierre] sin ninguna ficha cerrada → BLOQUEA
{
  const dir = tmpProyecto('cierre-sin-ficha'); marcarMetodo(dir);
  const r = correrGate('git commit -m "[cierre] bloque 3"', dir);
  check('commit [cierre] sin ficha cerrada → BLOQUEADO (exit 2)', r.code === 2);
}

// 7. --no-verify NO evade el gate (interceptamos antes de git)
{
  const dir = tmpProyecto('noverify'); marcarMetodo(dir);
  ponerFicha(dir, 'bloque-1.md', fichaConClaveMuda(true));
  const r = correrGate('git commit --no-verify -m "cambio"', dir);
  check('`git commit --no-verify` NO evade el candado (exit 2)', r.code === 2);
}

// 8. raw-session imprime el reflejo dentro de un proyecto-método
{
  const dir = tmpProyecto('sesion'); marcarMetodo(dir);
  const out = correrSession(dir);
  check('raw-session inyecta el reflejo en proyecto Raw Method', /THE RAW METHOD/.test(out));
}

// 9. raw-session calla fuera de un proyecto-método
{
  const dir = tmpProyecto('sesion-muda'); // sin marcador
  const out = correrSession(dir);
  check('raw-session calla fuera de un proyecto Raw Method', out.trim() === '');
}

// 10. payload con BOM UTF-8 (lo que antepone PowerShell al pipe) → sigue BLOQUEANDO
{
  const dir = tmpProyecto('bom'); marcarMetodo(dir);
  ponerFicha(dir, 'bloque-1.md', fichaConClaveMuda(true));
  const payload = "\uFEFF" + JSON.stringify({ tool_name: 'Bash', tool_input: { command: 'git commit -m x' }, cwd: dir });
  const r = spawnSync('node', [GATE], { input: payload, encoding: 'utf8' });
  check('payload con BOM (caso Windows/PowerShell) → sigue BLOQUEANDO (exit 2)', r.status === 2);
}

process.stdout.write(`\n${fallos === 0 ? '✅ TODO EN VERDE' : `❌ ${fallos} fallo(s)`}\n`);
process.exit(fallos === 0 ? 0 : 1);
