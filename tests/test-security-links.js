/**
 * Test: Verificación de Seguridad de Enlaces Externos
 * - Protocolo seguro obligatorio (HTTPS)
 * - Protección contra Reverse Tabnabbing (target="_blank" -> rel="noopener noreferrer")
 * - Prohibición de esquemas peligrosos (javascript:, data:)
 * - Validación de sintaxis de URLs
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔒 [1/4] Ejecutando pruebas de Seguridad de Enlaces Externos...\n');

const htmlPath = path.resolve(__dirname, '../index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

// Extraer todas las etiquetas <a> con sus atributos
const linkRegex = /<a\b([^>]*)>(.*?)<\/a>/gis;
const links = [];
let match;

while ((match = linkRegex.exec(html)) !== null) {
  const attrs = match[1];
  const innerText = match[2].trim().replace(/<[^>]+>/g, '');
  
  const hrefMatch = attrs.match(/href=[\"']([^\"']+)[\"']/i);
  const targetMatch = attrs.match(/target=[\"']([^\"']+)[\"']/i);
  const relMatch = attrs.match(/rel=[\"']([^\"']+)[\"']/i);

  if (hrefMatch) {
    links.push({
      fullTag: match[0],
      href: hrefMatch[1],
      target: targetMatch ? targetMatch[1] : null,
      rel: relMatch ? relMatch[1] : null,
      text: innerText
    });
  }
}

console.log(`Total de enlaces encontrados en index.html: ${links.length}`);

let failed = false;
let externalCount = 0;

links.forEach((link) => {
  const { href, target, rel, text } = link;

  // 1. Prohibir esquemas peligrosos
  if (/^(javascript|vbscript|data):/i.test(href)) {
    console.error(`❌ ERROR: Esquema inseguro o peligroso detectado: "${href}" (enlace "${text}")`);
    failed = true;
  }

  // 2. Verificar enlaces externos
  if (/^https?:\/\//i.test(href)) {
    externalCount++;

    // Verificar protocolo HTTPS
    if (!href.startsWith('https://')) {
      console.error(`❌ ERROR: Enlace externo no utiliza protocolo seguro HTTPS: "${href}"`);
      failed = true;
    } else {
      console.log(`  ✓ Enlace seguro HTTPS: ${href}`);
    }

    // Si abre en pestaña nueva, verificar rel="noopener noreferrer"
    if (target === '_blank') {
      const relTokens = (rel || '').toLowerCase().split(/\s+/);
      const hasNoOpener = relTokens.includes('noopener');
      const hasNoReferrer = relTokens.includes('noreferrer');

      if (!hasNoOpener || !hasNoReferrer) {
        console.error(`❌ ERROR de Seguridad: Enlace con target="_blank" debe tener rel="noopener noreferrer". Actual: rel="${rel}" en ${href}`);
        failed = true;
      } else {
        console.log(`    ✓ Protección anti-tabnabbing verificada (rel="noopener noreferrer")`);
      }
    }

    // Validar formato URL
    try {
      new URL(href);
    } catch (e) {
      console.error(`❌ ERROR: URL mal formada: "${href}"`);
      failed = true;
    }
  }
});

console.log(`\nEnlaces externos verificados: ${externalCount}`);

if (failed) {
  console.error('\n❌ Fallaron las pruebas de seguridad en enlaces externos.\n');
  process.exit(1);
} else {
  console.log('✅ Todos los enlaces externos son seguros y cumplen con los estándares.\n');
}
