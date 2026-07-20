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
 * La lógica de cobertura vive en raw-cobertura.js (compartida con raw-check.js, el
 * gate de CI del Nivel 2). Este archivo es solo la CÁSCARA de hook: stdin → veredicto.
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
const { revisarCobertura } = require('./raw-cobertura');

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

function main() {
  let data = {};
  try { data = JSON.parse(readStdin() || '{}'); } catch (_) { data = {}; }

  const command = (data.tool_input && data.tool_input.command) || '';
  const dir = data.cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd();

  // Solo nos importan los commits (regex barato antes de tocar disco).
  if (!/\bgit\s+commit\b/.test(command)) return allow();

  const { esMetodo, cerradas, problemas } = revisarCobertura(dir);
  if (!esMetodo) return allow(); // fuera de un proyecto Raw Method, no nos metemos

  // Regla 1 (CANDADO COBERTURA): ninguna ficha cerrada deja una clave muda.
  if (problemas.length) {
    return block('Cobertura incompleta en bloque(s) cerrado(s):\n' + problemas.map((p) => '  · ' + p).join('\n'));
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
