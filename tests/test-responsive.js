/**
 * Test: Verificación de Diseño Adaptativo y Responsivo
 * - Presencia y configuración correcta de la etiqueta <meta name="viewport">
 * - Prohibición de restricciones de zoom (WCAG 1.4.4 - no user-scalable=no)
 * - Verificación de Media Queries en CSS (móvil, tablet, escritorio)
 * - Reglas responsivas para imágenes y multimedia (max-width: 100%)
 * - Prevención de desbordamiento horizontal (overflow-x)
 * - Uso de unidades flexibles (clamp, rem, grid, flexbox)
 */

const fs = require('fs');
const path = require('path');

console.log('\n📱 [2/4] Ejecutando pruebas de Diseño Adaptativo y Responsivo...\n');

const htmlPath = path.resolve(__dirname, '../index.html');
const cssPath = path.resolve(__dirname, '../styles.css');

const html = fs.readFileSync(htmlPath, 'utf8');
const css = fs.readFileSync(cssPath, 'utf8');

let failed = false;

// 1. Meta Viewport en HTML
const viewportMatch = html.match(/<meta\s+name=[\"']viewport[\"']\s+content=[\"']([^\"']+)[\"']/i) ||
                      html.match(/<meta\s+content=[\"']([^\"']+)[\"']\s+name=[\"']viewport[\"']/i);

if (!viewportMatch) {
  console.error('❌ ERROR: No se encontró la etiqueta <meta name="viewport"> en index.html');
  failed = true;
} else {
  const content = viewportMatch[1];
  console.log(`  ✓ Meta viewport presente: "${content}"`);

  if (!content.includes('width=device-width')) {
    console.error('❌ ERROR: El viewport debe incluir "width=device-width".');
    failed = true;
  } else {
    console.log('  ✓ Viewport define width=device-width');
  }

  if (!content.includes('initial-scale=1')) {
    console.error('❌ ERROR: El viewport debe incluir "initial-scale=1.0".');
    failed = true;
  } else {
    console.log('  ✓ Viewport define initial-scale=1.0');
  }

  // Verificar que no bloquee el zoom (WCAG 1.4.4 Resize Text)
  if (/user-scalable\s*=\s*no/i.test(content) || /maximum-scale\s*=\s*1(\.0)?\b/i.test(content)) {
    console.error('❌ ERROR Accesibilidad (WCAG 1.4.4): El viewport bloquea el zoom del usuario (user-scalable=no o maximum-scale=1).');
    failed = true;
  } else {
    console.log('  ✓ No hay bloqueo de zoom (cumple WCAG 1.4.4)');
  }
}

// 2. Media Queries en CSS
const mediaQueries = css.match(/@media\s*\([^\)]+\)/gi) || [];
console.log(`\nMedia queries encontradas en styles.css: ${mediaQueries.length}`);

const hasMobileQuery = /@media[^{]*max-width\s*:\s*(480|576|640|768)px/i.test(css);
const hasDesktopQuery = /@media[^{]*(min-width\s*:\s*(768|992|1024|1200)px|max-width\s*:\s*(992|1024|1200)px)/i.test(css);

if (!hasMobileQuery) {
  console.error('❌ ERROR: No se detectaron media queries para dispositivos móviles (ej. <= 768px).');
  failed = true;
} else {
  console.log('  ✓ Breakpoint móvil implementado (<= 768px)');
}

if (!hasDesktopQuery) {
  console.error('❌ ERROR: No se detectaron media queries para tablet/escritorio.');
  failed = true;
} else {
  console.log('  ✓ Breakpoint tablet/escritorio implementado');
}

// 3. Reglas responsivas de imágenes (max-width: 100%)
if (/img\s*\{[^}]*max-width\s*:\s*100%/i.test(css) || /max-width\s*:\s*100%/i.test(css)) {
  console.log('  ✓ Regla de imágenes responsivas (max-width: 100%) detectada');
} else {
  console.error('❌ ERROR: No se encontró regla para imágenes fluidas (max-width: 100%).');
  failed = true;
}

// 4. Prevención de desbordamiento horizontal
if (/overflow-x\s*:\s*hidden/i.test(css)) {
  console.log('  ✓ Manejo defensivo de desbordamiento horizontal (overflow-x: hidden)');
} else {
  console.warn('⚠️ ADVERTENCIA: Recomendado overflow-x: hidden en body/html para evitar desbordes accidentales.');
}

// 5. Layout fluido moderno (Grid / Flexbox / clamp)
const hasGrid = /display\s*:\s*grid/i.test(css);
const hasFlex = /display\s*:\s*flex/i.test(css);
const hasClamp = /clamp\s*\(/i.test(css);

if (hasGrid && hasFlex) {
  console.log('  ✓ Uso de sistemas modernos de layout (CSS Grid + Flexbox)');
} else {
  console.error('❌ ERROR: Se requieren layouts modernos responsivos (Grid y Flexbox).');
  failed = true;
}

if (hasClamp) {
  console.log('  ✓ Tipografía fluida con CSS clamp() detectada');
}

if (failed) {
  console.error('\n❌ Fallaron las pruebas de diseño responsivo.\n');
  process.exit(1);
} else {
  console.log('\n✅ El sitio cumple con los estándares de diseño adaptativo y responsivo.\n');
}
