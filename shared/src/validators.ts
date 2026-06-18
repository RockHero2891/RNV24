import type { ValidationResult } from './types.js';

function checksToFeedback(checks: string[]): string {
  return checks.join('\n');
}

export function validateHtmlDivs(response: string): ValidationResult {
  const r = response.toLowerCase();
  const checks: string[] = [];
  let score = 0;
  const total = 5;

  if (r.includes('display:flex') || r.includes('display: flex')) {
    score++;
    checks.push('display:flex presente');
  } else checks.push('Falta display:flex');

  if (r.includes('gap:10px') || r.includes('gap: 10px')) {
    score++;
    checks.push('gap:10px presente');
  } else checks.push('Falta gap:10px');

  if (r.includes('width:100px') || r.includes('width: 100px')) {
    score++;
    checks.push('width:100px presente');
  } else checks.push('Falta width:100px');

  if (r.includes('height:100px') || r.includes('height: 100px')) {
    score++;
    checks.push('height:100px presente');
  } else checks.push('Falta height:100px');

  const hasColor = ['#ff5733', '#33ff57', '#3357ff', 'red', 'green', 'blue', 'rgb', 'background'].some(
    (c) => r.includes(c)
  );
  if (hasColor) {
    score++;
    checks.push('Colores de fondo definidos');
  } else checks.push('Faltan colores de fondo');

  return { valid: score >= 4, feedback: checksToFeedback(checks), score, total };
}

export function validateAnalizarTemperaturas(response: string): ValidationResult {
  const r = response.toLowerCase();
  const checks: string[] = [];
  let score = 0;
  const total = 4;

  if (r.includes('mínima') || r.includes('minima')) {
    score++;
    checks.push('Actualiza mínima');
  } else checks.push('Falta actualizar mínima');

  if (r.includes('máxima') || r.includes('maxima')) {
    score++;
    checks.push('Actualiza máxima');
  } else checks.push('Falta actualizar máxima');

  if (r.includes('promedio') || r.includes('suma /')) {
    score++;
    checks.push('Calcula promedio');
  } else checks.push('Falta calcular promedio');

  if (r.includes('temperaturas.length')) {
    score++;
    checks.push('Usa temperaturas.length');
  } else checks.push('Usa temperaturas.length para el promedio');

  return { valid: score >= 3, feedback: checksToFeedback(checks), score, total };
}

export function validateProcesarPedidos(response: string): ValidationResult {
  const r = response.toLowerCase();
  const checks: string[] = [];
  let score = 0;
  const total = 4;

  if (r.includes('totalventas')) {
    score++;
    checks.push('Actualiza totalVentas');
  } else checks.push('Falta totalVentas');

  if (r.includes('producto.precio') && r.includes('producto.cantidad')) {
    score++;
    checks.push('Multiplica precio por cantidad');
  } else checks.push('Falta producto.precio * producto.cantidad');

  if (r.includes('conteoproductos')) {
    score++;
    checks.push('Usa conteoProductos');
  } else checks.push('Falta conteoProductos');

  if (r.includes('producto.nombre')) {
    score++;
    checks.push('Usa producto.nombre');
  } else checks.push('Falta producto.nombre');

  return { valid: score >= 3, feedback: checksToFeedback(checks), score, total };
}

export function validateSqlCategorySales(response: string): ValidationResult {
  const r = response.toLowerCase();
  const checks: string[] = [];
  let score = 0;
  const total = 5;

  if (r.includes('select')) { score++; checks.push('SELECT'); } else checks.push('Falta SELECT');
  if (r.includes('sum')) { score++; checks.push('SUM()'); } else checks.push('Falta SUM()');
  if (r.includes('join')) { score++; checks.push('JOIN'); } else checks.push('Falta JOIN');
  if (r.includes('group by')) { score++; checks.push('GROUP BY'); } else checks.push('Falta GROUP BY');
  if (r.includes('order by') && r.includes('desc')) {
    score++;
    checks.push('ORDER BY DESC');
  } else checks.push('Falta ORDER BY DESC');

  return { valid: score >= 4, feedback: checksToFeedback(checks), score, total };
}

export function validateSqlCte(response: string): ValidationResult {
  const r = response.toLowerCase();
  const checks: string[] = [];
  let score = 0;
  const total = 5;

  if (r.includes('with')) { score++; checks.push('WITH (CTE)'); } else checks.push('Falta WITH');
  if (r.includes('select') && r.includes('sum')) {
    score++;
    checks.push('SELECT + SUM');
  } else checks.push('Falta SELECT + SUM');
  if (r.includes('join')) { score++; checks.push('JOIN'); } else checks.push('Falta JOIN');
  if (r.includes('group by')) { score++; checks.push('GROUP BY'); } else checks.push('Falta GROUP BY');
  if (r.includes('where') && r.includes('> 500')) {
    score++;
    checks.push('WHERE > 500');
  } else checks.push('Falta WHERE > 500');

  return { valid: score >= 4, feedback: checksToFeedback(checks), score, total };
}

export function validateSqlInsert(response: string): ValidationResult {
  const r = response.toLowerCase();
  const checks: string[] = [];
  let score = 0;
  const total = 4;

  if (r.includes('insert into')) { score++; checks.push('INSERT INTO'); } else checks.push('Falta INSERT INTO');
  if (r.includes('values')) { score++; checks.push('VALUES'); } else checks.push('Falta VALUES');
  if (r.includes('laptop') && r.includes('mouse')) {
    score++;
    checks.push('Productos Laptop y Mouse');
  } else checks.push('Faltan Laptop o Mouse');
  if (r.includes('1200') && r.includes('25')) {
    score++;
    checks.push('Precios correctos');
  } else checks.push('Precios incorrectos');

  return { valid: score >= 3, feedback: checksToFeedback(checks), score, total };
}

const validators: Record<string, (code: string) => ValidationResult> = {
  html_divs: validateHtmlDivs,
  js_analizar_temperaturas: validateAnalizarTemperaturas,
  js_procesar_pedidos: validateProcesarPedidos,
  sql_category_sales: validateSqlCategorySales,
  sql_cte_products: validateSqlCte,
  sql_insert_products: validateSqlInsert,
};

export function validateByKey(key: string, code: string): ValidationResult | null {
  const fn = validators[key];
  return fn ? fn(code) : null;
}
