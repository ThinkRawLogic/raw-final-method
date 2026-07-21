#!/usr/bin/env node
/**
 * raw-deps.js — chequeo liviano de lockfiles (pilar Stack, ejecutable).
 * ====================================================================
 * Inspirado en check_lockfiles de cyber-neo. Un manifest sin su lockfile = build
 * NO reproducible (una dependencia puede cambiar sola entre instalaciones). Lo
 * REPORTA (advisory, exit 0) — no bloquea, para no frenar proyectos chicos.
 *
 *   node gobernanza/raw-deps.js [dir]
 */
'use strict';
const fs = require('fs');
const path = require('path');

const PARES = [
  ['package.json', ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml']],
  ['Pipfile', ['Pipfile.lock']],
  ['pyproject.toml', ['poetry.lock', 'pdm.lock', 'uv.lock']],
  ['Gemfile', ['Gemfile.lock']],
  ['go.mod', ['go.sum']],
  ['Cargo.toml', ['Cargo.lock']],
  ['composer.json', ['composer.lock']],
];

function faltantes(dir) {
  const out = [];
  for (const [manifest, locks] of PARES) {
    const hayManifest = fs.existsSync(path.join(dir, manifest));
    const hayLock = locks.some((l) => fs.existsSync(path.join(dir, l)));
    if (hayManifest && !hayLock) out.push({ manifest, esperados: locks });
  }
  return out;
}

module.exports = { faltantes };

if (require.main === module) {
  const dir = process.argv[2] || process.cwd();
  const f = faltantes(dir);
  if (!f.length) { console.log('✓ raw-deps OK — cada manifest tiene su lockfile (o no hay manifests).'); process.exit(0); }
  console.log(`⚠ raw-deps — ${f.length} manifest(s) sin lockfile (build no reproducible):`);
  for (const x of f) console.log(`  · ${x.manifest} → falta uno de: ${x.esperados.join(', ')}`);
  console.log('\nCommiteá el lockfile para fijar versiones exactas — así una dep no cambia sola.');
  process.exit(0); // advisory
}
