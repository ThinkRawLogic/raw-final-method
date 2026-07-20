#!/usr/bin/env node
/**
 * raw-cobertura.js — la lógica compartida del candado de cobertura.
 * ================================================================
 * The Raw Method · lo usan TANTO el hook (raw-gate.js, Nivel 1) COMO el CLI/CI
 * (raw-check.js, Nivel 2). Una sola verdad del parser de fichas — derivar, no
 * duplicar (es el propio pilar de datos del método: la misma verdad copiada en
 * dos lugares que pueden contradecirse es un bug).
 *
 * No hace I/O de proceso (ni exit ni print): solo lee archivos y devuelve datos.
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
    const clave = m[2].trim();
    claves.set(clave, m[1].toLowerCase() === 'x');
    if (linea.includes('___')) notaFaltante.add(clave);
  }
  return { archivo, cerrada, claves, notaFaltante, texto };
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

// Las 3 secciones del reporte honesto (50/50), obligatorias al CERRAR — el candado
// que SKILL.md promete (L99): ninguna entrega/cierre está completo sin Fortalezas +
// Debilidades + Qué NO se probó. Es la mitad honesta que la cobertura no cubre.
const SECCIONES_HONESTIDAD = [
  { nombre: 'Fortalezas', re: /(^|\n)\s*#{1,6}\s*Fortalezas/i },
  { nombre: 'Debilidades', re: /(^|\n)\s*#{1,6}\s*Debilidades/i },
  { nombre: 'Qué NO se probó', re: /(^|\n)\s*#{1,6}\s*Qu[eé]\s+NO\s+se\b/i },
];

/** Problemas del reporte honesto: sección ausente, o presente pero con su "___" sin llenar. */
function problemasDeHonestidad(texto) {
  const out = [];
  const t = texto || '';
  for (const s of SECCIONES_HONESTIDAD) {
    const m = t.match(s.re);
    if (!m) {
      out.push(`falta la sección honesta "${s.nombre}" (Fortalezas / Debilidades / Qué NO se probó son obligatorias al cerrar)`);
      continue;
    }
    const rest = t.slice(m.index + m[0].length);
    const corte = rest.search(/\n\s*#{1,6}\s/); // hasta el próximo encabezado o EOF
    const cuerpo = (corte === -1 ? rest : rest.slice(0, corte)).replace(/[_*\s>-]/g, '');
    if (cuerpo.length === 0) out.push(`la sección honesta "${s.nombre}" está vacía (reemplazá el "___")`);
  }
  return out;
}

/** Junta las fichas de cobertura del proyecto. */
function leerFichas(dir) {
  const dirs = [path.join(dir, 'docs', '_cobertura'), path.join(dir, '_cobertura')];
  const fichas = [];
  for (const d of dirs) {
    let entradas = [];
    try { entradas = fs.readdirSync(d); } catch (_) { continue; }
    for (const f of entradas) {
      if (!f.endsWith('.md')) continue;
      try { fichas.push(parseFicha(fs.readFileSync(path.join(d, f), 'utf8'), f)); } catch (_) {}
    }
  }
  return fichas;
}

/**
 * Revisa la cobertura. Devuelve { esMetodo, fichas, cerradas, problemas }.
 * `problemas` = ["archivo: motivo", ...] de toda ficha CERRADA que dejó una clave muda.
 */
function revisarCobertura(dir) {
  if (!isMethodProject(dir)) return { esMetodo: false, fichas: [], cerradas: [], problemas: [] };
  const fichas = leerFichas(dir);
  const cerradas = fichas.filter((f) => f.cerrada);
  const problemas = [];
  for (const f of cerradas) {
    for (const p of problemasDeFicha(f)) problemas.push(`${f.archivo}: ${p}`);
    for (const p of problemasDeHonestidad(f.texto)) problemas.push(`${f.archivo}: ${p}`);
  }
  return { esMetodo: true, fichas, cerradas, problemas };
}

module.exports = {
  CLAVES_CANONICAS, isMethodProject, parseFicha, problemasDeFicha, problemasDeHonestidad, leerFichas, revisarCobertura,
};
