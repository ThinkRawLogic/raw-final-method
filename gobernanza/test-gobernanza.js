#!/usr/bin/env node
/**
 * test-gobernanza.js — la prueba de que el candado del proceso MUERDE de verdad.
 * ============================================================================
 * Cubre Niveles 1 (hook), 2 (CLI/CI), 3.1 (honestidad), 3.2 (auditoría) y las
 * REGRESIONES del red-team adversario (bypasses y falsos positivos cazados).
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
const SECRETS = path.join(HERE, 'raw-secrets.js');
const DEPS = path.join(HERE, 'raw-deps.js');
const DEUDA = path.join(HERE, 'raw-deuda.js');

let fallos = 0;
function check(nombre, cond) {
  process.stdout.write(`${cond ? '✓' : '✗ FALLA:'} ${nombre}\n`);
  if (!cond) fallos++;
}

function tmpProyecto(sufijo) { return fs.mkdtempSync(path.join(os.tmpdir(), `raw-test-${sufijo}-`)); }
function ponerFicha(dir, nombre, texto) {
  const d = path.join(dir, 'docs', '_cobertura');
  fs.mkdirSync(d, { recursive: true });
  fs.writeFileSync(path.join(d, nombre), texto);
}
function marcarMetodo(dir) { fs.writeFileSync(path.join(dir, '.the-raw-method'), 'v1\n'); }

const CLAVES = ['spec-leída','orden','seguridad','experiencia','concurrencia','errores',
  'rastro','config','aguante','stack','dato','tests','auditoría','docs','OK'];
const KEYS_OK = () => CLAVES.map((c) => `- [x] **(${c})** algo. → hecho tal cosa`);

const HONESTO = '\n\n## Reporte honesto (50/50)\n\n### Fortalezas\nquedó sólido el flujo X.\n' +
  '\n### Debilidades / qué quedó corto o frágil\nfalta pulir Y.\n\n### Qué NO se alcanzó a probar (lo más importante)\ncarga real.\n';
// Encabezados CON sufijo (como la plantilla real) y cuerpos vacíos → deben marcarse vacíos.
const HONESTO_VACIO = '\n\n## Reporte honesto (50/50)\n\n### Fortalezas\n___\n' +
  '\n### Debilidades / qué quedó corto o frágil\n___\n\n### Qué NO se alcanzó a probar (lo más importante)\n___\n';

function base(cerrada, lineas, opts) {
  opts = opts || {};
  const fecha = cerrada ? '2026-07-20' : '___________';
  const constructor = opts.constructor !== undefined ? opts.constructor : 'agente-constructor';
  const auditor = opts.auditor !== undefined ? opts.auditor : 'agente-auditor';
  const rastro = opts.rastro ? `**Rastro de auditoría:** ${opts.rastro}\n` : '';
  return `# Ficha\n\n**Bloque:** demo  **Fecha de cierre:** ${fecha}\n\n` +
    `**Construyó:** ${constructor}  **Auditó (agente fresco):** ${auditor}\n${rastro}\n` +
    `## Claves\n\n${lineas.join('\n')}\n`;
}
function fichaResuelta(cerrada) { return base(cerrada, KEYS_OK()) + HONESTO; }
function fichaConClaveMuda(cerrada) {
  const l = CLAVES.map((c, i) => i === 2 ? `- [ ] **(${c})** algo. → ___` : `- [x] **(${c})** algo. → hecho tal cosa`);
  return base(cerrada, l) + HONESTO;
}
function fichaSinHonestidad(cerrada) { return base(cerrada, KEYS_OK()); }
function fichaHonestidadVacia(cerrada) { return base(cerrada, KEYS_OK()) + HONESTO_VACIO; }
function fichaAutoAuditada(cerrada) { return base(cerrada, KEYS_OK(), { constructor: 'mismo agente', auditor: 'Mismo   Agente' }) + HONESTO; }
function fichaSinAuditor(cerrada) { return base(cerrada, KEYS_OK(), { auditor: '' }) + HONESTO; }
function fichaRastroRoto(cerrada) { return base(cerrada, KEYS_OK(), { rastro: 'docs/_auditorias/no-existe.md' }) + HONESTO; }
// Regresiones del red-team:
function fichaClaveSinNota(cerrada) { // clave [x] SIN nota (nota borrada) → debe ser muda
  const l = CLAVES.map((c, i) => i === 2 ? `- [x] **(${c})** desc → ___` : `- [x] **(${c})** algo. → hecho tal cosa`);
  return base(cerrada, l) + HONESTO;
}
function fichaNotaConGuionBajo(cerrada) { // nota real que CONTIENE ___ → NO debe ser muda
  const l = CLAVES.map((c, i) => i === 2 ? `- [x] **(${c})** ok. → validado contra doc_x___y interno` : `- [x] **(${c})** algo. → hecho`);
  return base(cerrada, l) + HONESTO;
}
function fichaAuditorConPunto(cerrada) { return base(cerrada, KEYS_OK(), { constructor: 'Claude', auditor: 'Claude.' }) + HONESTO; }
function fichaLegacy(cerrada) { // sin campos de auditor ni honestidad → solo cobertura (grandfather)
  const fecha = cerrada ? '2026-07-20' : '___________';
  return `# Ficha vieja\n\n**Fecha de cierre:** ${fecha}\n\n## Claves\n\n${KEYS_OK().join('\n')}\n`;
}

function correrGate(command, dir) {
  const r = spawnSync('node', [GATE], { input: JSON.stringify({ tool_name: 'Bash', tool_input: { command }, cwd: dir }), encoding: 'utf8' });
  return { code: r.status, err: r.stderr || '' };
}
function correrSession(dir) { return spawnSync('node', [SESSION], { input: JSON.stringify({ cwd: dir }), encoding: 'utf8' }).stdout || ''; }
function correrCheck(dir) { const r = spawnSync('node', [CHECK, dir], { encoding: 'utf8' }); return { code: r.status, out: (r.stdout || '') + (r.stderr || '') }; }

const con = (sufijo, ficha) => { const d = tmpProyecto(sufijo); marcarMetodo(d); if (ficha) ponerFicha(d, 'b.md', ficha); return d; };

// ============================ Nivel 1 — raw-gate (hook) ======================
{ const d = con('muda', fichaConClaveMuda(true)); const r = correrGate('git commit -m "x"', d);
  check('gate: ficha cerrada con clave [ ] → BLOQUEADO (exit 2)', r.code === 2);
  check('gate:   · nombra la clave', /seguridad/.test(r.err)); }
{ check('gate: ficha resuelta completa → PERMITIDO (exit 0)', correrGate('git commit -m "x"', con('ok', fichaResuelta(true))).code === 0); }
{ check('gate: ficha abierta con clave muda → PERMITIDO', correrGate('git commit -m "wip"', con('abierta', fichaConClaveMuda(false))).code === 0); }
{ check('gate: comando que no es commit (git status) → PERMITIDO', correrGate('git status', con('nocommit', fichaConClaveMuda(true))).code === 0); }
{ check('gate: proyecto sin The Raw Method → PERMITIDO', correrGate('git commit -m "x"', tmpProyecto('nometodo')).code === 0); }
{ check('gate: [cierre] sin ficha cerrada → BLOQUEADO', correrGate('git commit -m "[cierre] b3"', con('cierre-sin-ficha')).code === 2); }
{ check('gate: --no-verify NO evade (exit 2)', correrGate('git commit --no-verify -m "x"', con('nv', fichaConClaveMuda(true))).code === 2); }
{ const d = con('ses'); check('session: inyecta el reflejo en proyecto Raw Method', /THE RAW METHOD/.test(correrSession(d)));
  check('session: calla fuera del método', correrSession(tmpProyecto('ses2')).trim() === ''); }
{ const d = con('bom', fichaConClaveMuda(true));
  const payload = "\uFEFF" + JSON.stringify({ tool_name: 'Bash', tool_input: { command: 'git commit -m x' }, cwd: d });
  check('gate: payload con BOM (Windows) → BLOQUEA', spawnSync('node', [GATE], { input: payload, encoding: 'utf8' }).status === 2); }

// ======================= Nivel 2 — raw-check (CLI / CI) ======================
{ const r = correrCheck(con('cm', fichaConClaveMuda(true)));
  check('check: clave [ ] → FALLA (exit 1)', r.code === 1); check('check:   · nombra la clave', /seguridad/.test(r.out)); }
{ check('check: ficha resuelta → OK (exit 0)', correrCheck(con('cok', fichaResuelta(true))).code === 0); }
{ check('check: proyecto no-método → OK (exit 0)', correrCheck(tmpProyecto('cnm')).code === 0); }

// =================== Nivel 3.1 — honestidad 50/50 ===========================
{ const r = correrGate('git commit -m x', con('sh', fichaSinHonestidad(true)));
  check('gate: ficha cerrada SIN reporte honesto → BLOQUEADO', r.code === 2); check('gate:   · pide las secciones', /honesta|Fortalezas/.test(r.err)); }
{ check('gate: reporte honesto con secciones VACÍAS (encabezado con sufijo) → BLOQUEADO', correrGate('git commit -m x', con('hv', fichaHonestidadVacia(true))).code === 2); }
{ check('gate: ficha abierta sin honesto → PERMITIDO (solo al cerrar)', correrGate('git commit -m wip', con('ash', fichaSinHonestidad(false))).code === 0); }

// ================= Nivel 3.2 — independencia del auditor =====================
{ const r = correrGate('git commit -m x', con('aa', fichaAutoAuditada(true)));
  check('gate: auditor == constructor → BLOQUEADO', r.code === 2); check('gate:   · exige agente fresco', /fresco|distinto|mismo que construyó/i.test(r.err)); }
{ check('gate: sin auditor → BLOQUEADO', correrGate('git commit -m x', con('sa', fichaSinAuditor(true))).code === 2); }
{ const r = correrGate('git commit -m x', con('rr', fichaRastroRoto(true)));
  check('gate: rastro inexistente → BLOQUEADO', r.code === 2); check('gate:   · nombra el rastro', /rastro/i.test(r.err)); }
{ const d = con('rok'); fs.mkdirSync(path.join(d, 'docs', '_auditorias'), { recursive: true });
  fs.writeFileSync(path.join(d, 'docs', '_auditorias', 'a.md'), 'reporte del auditor con contenido');
  ponerFicha(d, 'b.md', base(true, KEYS_OK(), { rastro: 'docs/_auditorias/a.md' }) + HONESTO);
  check('gate: rastro que existe y no vacío → PERMITIDO', correrGate('git commit -m x', d).code === 0); }
{ check('check: auto-auditada → FALLA (exit 1)', correrCheck(con('caa', fichaAutoAuditada(true))).code === 1); }

// ============== Nivel 4 — REGRESIONES del red-team adversario ================

// R1: clave [x] con la NOTA borrada (o placeholder tras →) → muda → BLOQUEA
{ const r = correrGate('git commit -m x', con('sinnota', fichaClaveSinNota(true)));
  check('R1 gate: clave [x] con nota borrada/placeholder → BLOQUEADO', r.code === 2); check('R1   · nombra la clave', /seguridad/.test(r.err)); }
// R1b: nota LEGÍTIMA que contiene "___" → NO debe bloquear (falso positivo cazado)
{ check('R1b gate: nota real que contiene "___" → PERMITIDO (no es falso positivo)', correrGate('git commit -m x', con('notaub', fichaNotaConGuionBajo(true))).code === 0); }

// R2: variantes de git que antes esquivaban el hook → ahora BLOQUEAN
{ const d = con('gv', fichaConClaveMuda(true));
  check('R2 gate: `git -c k=v commit` → BLOQUEADO', correrGate('git -c user.email=a@b.c commit -m x', d).code === 2);
  check('R2 gate: `git --no-pager commit` → BLOQUEADO', correrGate('git --no-pager commit -m x', d).code === 2);
  check('R2 gate: `git merge --no-ff x` → BLOQUEADO', correrGate('git merge --no-ff rama', d).code === 2);
  check('R2 gate: `git revert HEAD` → BLOQUEADO', correrGate('git revert --no-edit HEAD', d).code === 2);
  check('R2 gate: `git log --grep=commit` → PERMITIDO (no persiste)', correrGate('git log --grep=commit', d).code === 0); }

// R3: independencia burlada con puntuación ("Claude" vs "Claude.") → BLOQUEA
{ check('R3 gate: auditor "Claude." vs constructor "Claude" → BLOQUEADO', correrGate('git commit -m x', con('punto', fichaAuditorConPunto(true))).code === 2); }

// R4: un .md que NO es ficha (README con "Fecha de cierre:") → NO se trata como ficha
{ const d = con('readme'); ponerFicha(d, 'INDICE.md', '# Índice\n\nUltima Fecha de cierre: 2026-07-20 (informativo)\n\nsin claves.\n');
  check('R4 gate: README con "Fecha de cierre:" pero sin claves → PERMITIDO', correrGate('git commit -m x', d).code === 0); }

// R5: ficha LEGACY (15 claves, sin honestidad ni auditor) → grandfathered (solo cobertura)
{ check('R5 gate: ficha legacy resuelta (sin campos v2) → PERMITIDO (no brickea repos viejos)', correrGate('git commit -m x', con('legacy', fichaLegacy(true))).code === 0); }

// R6: fichas con marcador de lista `*` (Markdown válido) → se parsean las claves
{ const l = CLAVES.map((c) => `* [x] **(${c})** algo. → hecho`); const d = con('star', base(true, l) + HONESTO);
  check('R6 gate: claves con marcador `*` → PERMITIDO (parseadas OK)', correrGate('git commit -m x', d).code === 0); }

// ============== Herramientas de pilar (secrets / deps / deuda) ===============
function correr(script, dir) { const r = spawnSync('node', [script, dir], { encoding: 'utf8' }); return { code: r.status, out: (r.stdout || '') + (r.stderr || '') }; }

{ const d = tmpProyecto('sec-clean'); fs.writeFileSync(path.join(d, 'app.js'), 'const x = 1;\n');
  check('secrets: repo limpio → OK (exit 0)', correr(SECRETS, d).code === 0); }
{ const d = tmpProyecto('sec-leak'); fs.writeFileSync(path.join(d, 'app.js'), 'const k = "' + ('AKIA' + '1234567890ABCDEF') + '";\n');
  const r = correr(SECRETS, d);
  check('secrets: AWS key filtrada → BLOQUEA (exit 1)', r.code === 1); check('secrets:   · nombra el hallazgo', /AWS/.test(r.out)); }
{ const d = tmpProyecto('sec-ph'); fs.writeFileSync(path.join(d, 'app.js'), 'const api_key = "your_placeholder_value_here";\n');
  check('secrets: placeholder (your_...) → OK (allowlist, no falso positivo)', correr(SECRETS, d).code === 0); }
{ const d = tmpProyecto('deps'); fs.writeFileSync(path.join(d, 'package.json'), '{}');
  const r = correr(DEPS, d); check('deps: package.json sin lockfile → lo reporta (exit 0, advisory)', r.code === 0 && /package\.json/.test(r.out)); }
{ const d = tmpProyecto('deuda'); fs.writeFileSync(path.join(d, 'x.js'), '// raw-deuda: cablear el candado de X antes de prod\n');
  const r = correr(DEUDA, d); check('deuda: cosecha el marcador raw-deuda: (exit 0)', r.code === 0 && /cablear el candado/.test(r.out)); }

process.stdout.write(`\n${fallos === 0 ? '✅ TODO EN VERDE' : `❌ ${fallos} fallo(s)`}\n`);
process.exit(fallos === 0 ? 0 : 1);
