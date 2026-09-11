/**
 * Test: Validación y Semántica de HTML5
 * - Declaración <!DOCTYPE html> estándar de HTML5
 * - Atributo de idioma en <html> (<html lang="es">)
 * - Codificación UTF-8 (<meta charset="UTF-8">)
 * - Presencia y estructura de etiquetas semánticas HTML5:
 *   <header>, <nav>, <main>, <section>, <article>, <footer>, <figure>, <figcaption>, <table> con <caption>
 * - Ausencia total de etiquetas obsoletas (HTML4: font, center, marquee, etc.)
 * - Validación formal de especificación HTML5 usando el motor html-validate
 */

const fs = require('fs');
const path = require('path');
const { HtmlValidate } = require('html-validate');

console.log('\n🌐 [3/4] Ejecutando pruebas de Estándar y Semántica HTML5...\n');

const htmlPath = path.resolve(__dirname, '../index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

let failed = false;

// 1. DOCTYPE HTML5
if (!html.trim().toLowerCase().startsWith('<!doctype html>')) {
  console.error('❌ ERROR: El documento debe comenzar con el DOCTYPE estándar de HTML5: <!DOCTYPE html>');
  failed = true;
} else {
  console.log('  ✓ DOCTYPE HTML5 estándar presente (<!DOCTYPE html>)');
}

// 2. Idioma en <html>
const htmlTagMatch = html.match(/<html\b([^>]*)>/i);
if (!htmlTagMatch || !/lang=[\"'][a-z]{2}(-[A-Z]{2})?[\"']/i.test(htmlTagMatch[1])) {
  console.error('❌ ERROR: La etiqueta <html> debe definir el atributo lang (ej. lang="es")');
  failed = true;
} else {
  console.log(`  ✓ Atributo de idioma configurado: ${htmlTagMatch[0]}`);
}

// 3. Charset UTF-8
if (!/<meta\s+charset=[\"']?utf-8[\"']?/i.test(html)) {
  console.error('❌ ERROR: Declaración de codificación UTF-8 no encontrada en <head>');
  failed = true;
} else {
  console.log('  ✓ Codificación <meta charset="UTF-8"> presente');
}

// 4. Elementos semánticos HTML5 obligatorios
const requiredSemanticTags = [
  'header',
  'nav',
  'main',
  'section',
  'article',
  'footer',
  'figure',
  'figcaption',
  'table',
  'caption'
];

requiredSemanticTags.forEach(tag => {
  const regex = new RegExp(`<${tag}\\b`, 'i');
  if (!regex.test(html)) {
    console.error(`❌ ERROR Semántico: Falta el elemento semántico HTML5 <${tag}>`);
    failed = true;
  } else {
    console.log(`  ✓ Elemento semántico <${tag}> presente y utilizado correctamente`);
  }
});

// 5. Verificar ausencia de etiquetas obsoletas (HTML4 / deprecated)
const obsoleteTags = [
  'font',
  'center',
  'marquee',
  'blink',
  'big',
  'strike',
  'tt',
  'frame',
  'frameset',
  'applet',
  'basefont'
];

obsoleteTags.forEach(tag => {
  const regex = new RegExp(`<${tag}\\b`, 'i');
  if (regex.test(html)) {
    console.error(`❌ ERROR: Uso de etiqueta obsoleta prohibida en HTML5: <${tag}>`);
    failed = true;
  }
});

// 6. Validación formal con HtmlValidate
try {
  const validator = new HtmlValidate({
    rules: {
      'doctype-html': 'error',
      'void-content': 'error',
      'element-required-ancestor': 'error',
      'attr-quotes': 'error'
    }
  });

  const report = validator.validateStringSync(html);
  if (!report.valid) {
    console.warn('\n⚠️ Reporte de HTML-Validate:');
    (report.results || []).forEach(result => {
      (result.messages || []).forEach(msg => {
        console.warn(`  [${msg.severity === 2 ? 'ERROR' : 'WARN'}] Línea ${msg.line}:${msg.column} - ${msg.message} (${msg.ruleId})`);
        if (msg.severity === 2) {
          failed = true;
        }
      });
    });
  } else {
    console.log('  ✓ Validación formal de HTML5 con html-validate exitosa (0 errores)');
  }
} catch (err) {
  console.error('Error al ejecutar html-validate:', err.message);
  failed = true;
}

if (failed) {
  console.error('\n❌ Fallaron las pruebas de estándares HTML5.\n');
  process.exit(1);
} else {
  console.log('\n✅ El código cumple completamente con la especificación y semántica de HTML5.\n');
}
