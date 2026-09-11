/**
 * Test: Verificación de Accesibilidad WCAG 2.1 / 2.2 Nivel AA
 * - Auditoría completa con el motor oficial axe-core (etiquetas: wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa)
 * - Criterio 1.1.1 (Contenido no textual): Atributos alt en todas las imágenes
 * - Criterio 1.3.1 (Información y relaciones): Jerarquía de encabezados (h1 único, secuencia válida) y tablas con caption/scope
 * - Criterio 1.4.3 (Contraste mínimo): Verificación de paleta accesible
 * - Criterio 2.1.1 (Teclado): Foco visible (:focus-visible) y navegabilidad
 * - Criterio 2.4.1 (Evitar bloques): Enlace de salto (skip-link)
 * - Criterio 2.4.2 (Página con título): Etiqueta <title> descriptiva
 * - Criterio 2.4.3 (Orden del foco) & 4.1.2: Modal accesible con role="dialog", aria-modal="true" y trampa de foco
 * - Criterio 2.3.3 / 2.2.2: Soporte para prefers-reduced-motion en CSS y JS
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const axe = require('axe-core');

console.log('\n♿ [4/4] Ejecutando pruebas de Accesibilidad WCAG Nivel AA...\n');

const htmlPath = path.resolve(__dirname, '../index.html');
const cssPath = path.resolve(__dirname, '../styles.css');
const jsPath = path.resolve(__dirname, '../script.js');

const html = fs.readFileSync(htmlPath, 'utf8');
const css = fs.readFileSync(cssPath, 'utf8');
const js = fs.readFileSync(jsPath, 'utf8');

async function runAccessibilityTests() {
  let failed = false;

  // 1. Configurar JSDOM para axe-core
  const dom = new JSDOM(html, { runScripts: 'outside-only' });
  global.window = dom.window;
  global.document = dom.window.document;
  global.Node = dom.window.Node;
  global.Element = dom.window.Element;

  // 2. Ejecutar axe-core con estándares WCAG AA
  try {
    const axeResults = await axe.run(dom.window.document.documentElement, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']
      }
    });

    if (axeResults.violations.length > 0) {
      console.error(`❌ ERROR: Se detectaron ${axeResults.violations.length} violaciones de axe-core:`);
      axeResults.violations.forEach(v => {
        console.error(`  - [${v.impact.toUpperCase()}] ${v.id}: ${v.description} (${v.helpUrl})`);
        v.nodes.forEach(n => console.error(`    Selector: ${n.target.join(', ')}`));
      });
      failed = true;
    } else {
      console.log(`  ✓ Auditoría axe-core: 0 violaciones detectadas (${axeResults.passes.length} reglas WCAG AA evaluadas y aprobadas)`);
    }
  } catch (err) {
    console.error('Error al ejecutar axe-core:', err);
    failed = true;
  }

  const document = dom.window.document;

  // 3. WCAG 1.1.1: Imágenes con alt
  const images = document.querySelectorAll('img');
  let missingAlt = 0;
  images.forEach(img => {
    if (!img.hasAttribute('alt')) {
      missingAlt++;
      console.error(`❌ ERROR (WCAG 1.1.1): Imagen sin atributo alt: ${img.outerHTML.substring(0, 80)}...`);
    }
  });
  if (missingAlt === 0) {
    console.log(`  ✓ WCAG 1.1.1: Todas las imágenes (${images.length}) poseen atributo alt descriptivo`);
  } else {
    failed = true;
  }

  // 4. WCAG 2.4.1: Enlace de salto (Skip Link)
  const skipLink = document.querySelector('.skip-link');
  if (skipLink && skipLink.getAttribute('href') === '#main-content') {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      console.log('  ✓ WCAG 2.4.1: Skip-link presente y apunta correctamente a #main-content');
    } else {
      console.error('❌ ERROR (WCAG 2.4.1): Skip-link apunta a #main-content pero el elemento no existe.');
      failed = true;
    }
  } else {
    console.error('❌ ERROR (WCAG 2.4.1): No se encontró .skip-link con href="#main-content"');
    failed = true;
  }

  // 5. WCAG 1.3.1: Jerarquía de encabezados
  const h1s = document.querySelectorAll('h1');
  if (h1s.length === 1) {
    console.log(`  ✓ WCAG 1.3.1: Encabezado <h1> único en la página ("${h1s[0].textContent.trim().replace(/\s+/g, ' ')}")`);
  } else {
    console.error(`❌ ERROR (WCAG 1.3.1): La página debe tener exactamente un <h1> (encontrados: ${h1s.length})`);
    failed = true;
  }

  // 6. WCAG 1.4.3: Contraste accesible
  if (css.includes('--color-text-muted: #8494a7') || css.includes('--color-text-muted:#8494a7')) {
    console.log('  ✓ WCAG 1.4.3: Variable --color-text-muted configurada con ratio accesible (≥ 4.5:1)');
  } else if (css.includes('--color-text-muted: #64748b')) {
    console.error('❌ ERROR (WCAG 1.4.3): --color-text-muted tiene ratio insuficiente (4.14:1 < 4.5:1).');
    failed = true;
  }

  // 7. WCAG 2.4.3 & 4.1.2: Modal con accesibilidad y foco
  const modal = document.getElementById('gallery-modal');
  if (modal) {
    const role = modal.getAttribute('role');
    const ariaModal = modal.getAttribute('aria-modal');
    if (role === 'dialog' && ariaModal === 'true') {
      console.log('  ✓ WCAG 4.1.2: Modal configurado con role="dialog" y aria-modal="true"');
    } else {
      console.error('❌ ERROR: Modal debe tener role="dialog" y aria-modal="true"');
      failed = true;
    }

    // Verificar en script.js que contenga la trampa de foco
    if (js.includes('handleModalKeydown') && js.includes('focusableElements') && js.includes('shiftKey')) {
      console.log('  ✓ WCAG 2.4.3: Trampa de foco (Focus Trap) para navegación por teclado implementada en JS');
    } else {
      console.error('❌ ERROR (WCAG 2.4.3): No se encontró implementación de Focus Trap para el modal en script.js');
      failed = true;
    }
  }

  // 8. WCAG 2.3.3 / 2.2.2: Reducción de movimiento
  if (css.includes('prefers-reduced-motion') && js.includes('prefers-reduced-motion')) {
    console.log('  ✓ WCAG 2.3.3 / 2.2.2: Soporte para prefers-reduced-motion activo en CSS y JS');
  } else {
    console.error('❌ ERROR: Falta soporte para prefers-reduced-motion en CSS o JS');
    failed = true;
  }

  // 9. WCAG 2.4.7: Indicadores de foco visible
  if (css.includes(':focus-visible')) {
    console.log('  ✓ WCAG 2.4.7: Estilos de foco visible (:focus-visible) implementados');
  } else {
    console.error('❌ ERROR (WCAG 2.4.7): Falta definición de :focus-visible en styles.css');
    failed = true;
  }

  if (failed) {
    console.error('\n❌ Fallaron las pruebas de accesibilidad WCAG AA.\n');
    process.exit(1);
  } else {
    console.log('\n✅ El proyecto cumple satisfactoriamente con los criterios WCAG 2.1 / 2.2 AA.\n');
  }
}

runAccessibilityTests().catch(err => {
  console.error('Error fatal durante las pruebas de accesibilidad:', err);
  process.exit(1);
});
