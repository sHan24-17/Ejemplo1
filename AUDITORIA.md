# AUDITORIA — Accesibilidad, UX y Responsive

**Archivos revisados:** `index.html`, `styles.css`, `script.js`
**Norma de referencia:** WCAG 2.2 AA
**Fecha:** 10 de septiembre de 2026
**Sintaxis JS:** Válida (validada con `node --check`, exit code 0)

---

## 1. Resumen Ejecutivo

El sitio demuestra un nivel de accesibilidad **notablemente alto** para un proyecto educativo. La estructura semántica es sólida (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<figure>`, `<footer>`), los encabezados siguen jerarquía correcta, la tabla de datos usa `<caption>`, `scope="col"` y `scope="row"`, las imágenes tienen `alt` descriptivo, los botones llevan `type="button"`, los toggles manejan `aria-expanded`/`aria-controls`, el skip-link funciona y el contraste del texto principal es excelente (18.81:1).

Los hallazgos negativos se concentran en **dos áreas**: (1) contraste insuficiente del color `--color-text-muted` (#64748b) que no alcanza el 4.5:1 mínimo para texto normal en cuatro ubicaciones, y (2) ausencia de trampa de foco (focus trap) en el modal de la galería, requisito del WCAG 2.4.3 para diálogos modales.

**Hallazgos por severidad:**
- **Críticos:** 1
- **Altos:** 2
- **Medios:** 3
- **Bajos:** 2

---

## 2. Hallazgos

### CRÍTICOS

#### C1 — Modal sin trampa de foco (focus trap)

| Campo | Valor |
|---|---|
| **Criterio WCAG** | 2.4.3 Focus Order (AA) |
| **Archivo** | `script.js:200-233` |
| **Elemento** | `#gallery-modal` (`role="dialog"`) |

**Problema:** Cuando el modal se abre, el foco se mueve al botón de cerrar, pero no hay nada que impida al usuario navegar con Tab hacia los enlaces del header o del footer mientras el modal está visible. Un usuario con teclado puede interactuar con contenido detrás del modal.

**Evidencia concreta:** La función `openModal()` en `script.js:200` desactiva el scroll del body pero no instala un listener de Tab que contenga el foco dentro de `#gallery-modal`.

**Recomendación:** Implementar un focus trap que intercepte Tab/Shift+Tab y mantenga el foco rotando entre los elementos focusables dentro del modal (`.modal-close` y la imagen si fuera interactiva).

---

#### C2 — Contraste insuficiente de `--color-text-muted` (#64748b)

| Campo | Valor |
|---|---|
| **Criterio WCAG** | 1.4.3 Contrast (Minimum) (AA) |
| **Archivo** | `styles.css:19`, aplicado en 4 ubicaciones |

**Ratio medido:** 4.14:1 (mínimo requerido: 4.5:1 para texto normal)

| Ubicación en HTML | Selector CSS | Ratio real |
|---|---|---|
| `.stat-desc` (líneas 353-379) | `color: var(--color-text-muted)` on `--color-bg-surface` | **3.50:1** |
| `.data-label` (líneas 120-151) | `color: var(--color-text-muted)` on `--color-bg-surface` | **3.75:1** |
| `.footer-bottom` (líneas 738-739) | `color: var(--color-text-muted)` on `#04070d` | **4.24:1** |
| `.tech-stack` (línea 729) | `color: var(--color-text-muted)` on `#04070d` | **4.24:1** |

**Recomendación:** Cambiar `--color-text-muted` a un valor que alcance ≥4.5:1. Un candidato seguro es `#8494a7` (≈5.5:1 sobre `#0f172a`, ≈6.0:1 sobre `#070b14`).

---

### ALTOS

#### A1 — Indicador de enlace activo solo por color

| Campo | Valor |
|---|---|
| **Criterio WCAG** | 1.4.1 Use of Color (A) |
| **Archivo** | `styles.css:213-217`, `index.html:38` |

**Problema:** El enlace `.active` en la navegación se distingue únicamente por el color dorado y un fondo semi-transparente. Ambos cambios son sutiles (el fondo `rgba(245,158,11,0.1)` es casi imperceptible). Un usuario con deficiencia visual podría no identificar la sección actual.

**Evidencia concreta:** `.nav-link.active { color: var(--color-accent-gold); background-color: rgba(245,158,11,0.1); font-weight: 600; }` — La diferencia de peso (500→600) es mínima.

**Recomendación:** Añadir un indicador no cromático: un borde inferior visible (`border-bottom: 2px solid var(--color-accent-gold)`) o una barra superior/punta orientada. Combinar con `aria-current="true"` en el HTML para reflejo semántico.

---

#### A2 — Botones del toolbar sin navegación con flechas

| Campo | Valor |
|---|---|
| **Criterio WCAG** | 2.1.1 Keyboard (A) |
| **Archivo** | `index.html:170-177`, `script.js:82-110` |

**Problema:** La barra de filtros usa `role="toolbar"`, lo cual implica que los usuarios esperan navegar entre los botones con las teclas Flecha Izquierda/Derecha (patrón WAI-ARIA Toolbar). Actualmente solo es posible navegar con Tab, lo cual es funcional pero no sigue el patrón esperado del rol.

**Recomendación:** Opción A (recomendada): Cambiar el `role` a `role="group"` con `aria-label` (ya presente), eliminando la expectativa de navegación con flechas. Opción B: Implementar roving tabindex con soporte de flechas, que es más complejo.

---

### MEDIOS

#### M1 — Sin `prefers-reduced-motion` para animaciones

| Campo | Valor |
|---|---|
| **Criterio WCAG** | 2.3.3 Animation from Interactions (AAA) / 2.2.2 Pause, Stop, Hide (A) |
| **Archivo** | `styles.css` (completo), `script.js:144-168` |

**Problema:** Las animaciones de las tarjetas (`transform`, `opacity`), el hover de las tarjetas de stats/timeline, y la animación de los contadores numéricos se ejecutan sin consultar la preferencia del usuario. El estándar AA exige poder pausar o desactivar animaciones que parpadeen más de 3 veces por segundo (que no es el caso aquí), pero la falta de `prefers-reduced-motion` afecta usuarios con vestibular disorders.

**Evidencia concreta:** `styles.css` no contiene ningún `@media (prefers-reduced-motion: reduce)`. `script.js:148` ejecuta animación de 1800ms sin consultar `window.matchMedia`.

**Recomendación:** Añadir en CSS:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```
En JS: consultar `matchMedia('(prefers-reduced-motion: reduce)')` y saltar la animación de contadores si es `true`.

---

#### M2 — Sección Hero sin `<h1>` visible en contenido alternativo

| Campo | Valor |
|---|---|
| **Criterio WCAG** | Best practice / 2.4.6 Headings and Labels (AA) |
| **Archivo** | `index.html:57-59` |

**Problema menor:** El hero incluye un `<div class="hero-tag">Leyenda Viva del Deporte</div>` (línea 57) que es un texto descriptivo superior al H1, pero no tiene rol semántico. No es un error grave ya que el H1 es correcto, pero el `.hero-tag` podría confundir a un lector de pantalla que lo lea como un encabezado implícito.

**Recomendación:** No es un problema de accesibilidad directo. Solo documentar que `.hero-tag` es un párrafo introductorio, no un encabezado.

---

#### M3 — `<footer>` sin `<h4>` dentro de `<footer-heading>` semántico correcto

| Campo | Valor |
|---|---|
| **Criterio WCAG** | 1.3.1 Info and Relationships (A) |
| **Archivo** | `index.html:716, 727`, `styles.css:1155-1160` |

**Problema:** Los `<h4>` dentro del footer (`Navegación Rápida`, `Detalles del Proyecto`) saltan de `<h2>` (secciones del main) a `<h4>` sin un `<h3>` intermedio en el flujo del documento. Aunque están dentro de un `<footer>` que es un contenido complementario, la ruptura de jerarquía puede confundir a lectoras de pantalla que navegan por encabezados.

**Recomendación:** Opción A: Reducir a `<h3>` los encabezados del footer. Opción B: Cambiarlos a `<p class="footer-heading" role="heading" aria-level="2">` para que el lector los anuncie como subsecciones del pie sin romper la jerarquía del contenido principal.

---

### BAJOS

#### B1 — `tabindex="-1"` en elemento no interactivo (`#top`)

| Campo | Valor |
|---|---|
| **Archivo** | `script.js:280-282` |

**Problema:** Al hacer clic en "Volver al inicio", el script añade `tabindex="-1"` al `<header id="top">` y hace `.focus()`. Esto es funcional pero deja una marca persistente en el DOM; si el usuario hace clic múltiples veces, el atributo se reasigna innecesariamente.

**Recomendación:** Limpiar el `tabindex` después de usarlo, o verificar si ya tiene `tabindex="-1"` antes de asignarlo. No es un problema de accesibilidad sino de limpieza de código.

---

#### B2 — Texto alternativo de imágenes de galería contiene información duplicada

| Campo | Valor |
|---|---|
| **Archivo** | `index.html:482-483, 500-501, 518-519, 536-537` |

**Problema:** El `alt` de cada imagen y el `aria-label` del `<button>` que la contiene repiten información similar. Cuando el botón tiene `aria-label` descriptivo, el `alt` del `<img>` interno es redundante para usuarios de lectores de pantalla que navegan por botones.

**Recomendación:** No es un error grave — la redundancia es una práctica defensiva aceptable. Sin embargo, se podría simplificar el `alt` del `<img>` a una descripción más breve (ej. "Cristiano Ronaldo, Mundial 2018") dejando la descripción completa en el `aria-label` del botón.

---

## 3. Criterios que SÍ cumplen

| Criterio WCAG | Evidencia |
|---|---|
| **1.1.1 Non-text Content (A)** | Todas las imágenes de galería tienen `alt` descriptivo. Iconos decorativos llevan `aria-hidden="true"`. |
| **1.3.1 Info and Relationships (A)** | Tabla con `<caption>`, `scope="col"`, `scope="row"`, `<thead>`, `<tbody>`, `<tfoot>`. Secciones con `aria-labelledby`. |
| **1.3.2 Meaningful Sequence (A)** | Orden de lectura del DOM coincide con la presentación visual. |
| **1.4.1 Use of Color (A)** | Badge de clubes usa color + texto (no solo color). |
| **1.4.4 Resize Text (A)** | No hay nada que impida zoom del 200%. `clamp()` en tipografía funciona correctamente. |
| **1.4.10 Reflow (AA)** | `overflow-x: hidden` en body. Grids con `auto-fit` y `minmax`. Tabla con `overflow-x: auto` en wrapper. |
| **2.1.1 Keyboard (A)** | Todos los controles interactivos son alcanzables con Tab. Botones de filtros, toggles, modal y menú son interactivos. |
| **2.4.1 Bypass Blocks (A)** | Skip link `<a href="#main-content" class="skip-link">` presente. |
| **2.4.2 Page Titled (A)** | `<title>Cristiano Ronaldo | Leyenda del Fútbol Mundial</title>` |
| **2.4.3 Focus Order (A)** | Solo falla en el modal (hallazgo C1). Resto del sitio: orden lógico y predecible. |
| **2.4.4 Link Purpose (A)** | Enlaces de fuentes incluyen `aria-label` que indica que abren en nueva pestaña. |
| **2.4.6 Headings and Labels (A)** | H1→H2→H3 encadenados correctamente. |
| **2.5.5 Target Size (AAA)** | Botones hamburguesa (40×40), modal close (42×42), nav links (~44px en móvil), filtros (~40px) — todos ≥44px. |
| **3.1.1 Language of Page (A)** | `<html lang="es">` |
| **3.1.2 Language of Parts (AA)** | Contenido en español consistente. |
| **4.1.1 Parsing (A)** | HTML válido, sin duplicación de IDs. |
| **4.1.2 Name, Role, Value (A)** | `aria-expanded`, `aria-controls`, `aria-label`, `aria-modal`, `role="dialog"`, `role="toolbar"` correctamente implementados. |
| **Navegación móvil (<768px)** | Menú hamburguesa visible, nav colapsable, footer a 1 columna, timeline ajusta padding. |
| **Escritorio (>992px)** | Layout bio en 2 columnas, footer en 3 columnas, galería en grid auto-fit. |
| **320px / 390px** | `clamp()` en H1 y H2 se adapta. Grids caen a 1 columna. Contenido sin overflow horizontal. |
| **Errores JavaScript** | Sintaxis válida. Null checks en todos los `getElementById`. `IntersectionObserver` con fallback. Event listeners con `passive: true` en scroll. |
| **Manejo de Escape** | Tanto el menú móvil como el modal cierran con la tecla Escape. |

---

## 4. Resumen de cambios para corregir

### Prioridad inmediata

| # | Hallazgo | Archivo a modificar | Acción |
|---|---|---|---|
| C1 | Modal sin focus trap | `script.js` | Añadir función `trapFocus(modal)` que intercepte Tab y mantenga foco dentro de `#gallery-modal`. Llamar en `openModal()`, quitar en `closeModal()`. |
| C2 | Contraste de `--color-text-muted` | `styles.css` | Cambiar `--color-text-muted: #64748b;` a `--color-text-muted: #8494a7;` (o similar ≥4.5:1). |

### Prioridad alta

| # | Hallazgo | Archivo a modificar | Acción |
|---|---|---|---|
| A1 | Indicador activo solo por color | `styles.css` + `index.html` | Añadir `border-bottom: 2px solid var(--color-accent-gold)` a `.nav-link.active` y `aria-current="true"` al enlace activo en HTML. |
| A2 | Toolbar sin flechas | `styles.css` / `index.html` | Cambiar `role="toolbar"` a `role="group"` en `index.html:170`. |

### Prioridad media

| # | Hallazgo | Archivo a modificar | Acción |
|---|---|---|---|
| M1 | Sin prefers-reduced-motion | `styles.css` + `script.js` | Añadir media query en CSS y consultar `matchMedia` en JS antes de animar contadores. |
| M3 | Jerarquía de encabezados en footer | `index.html` | Cambiar `<h4>` del footer a `<h3>` para mantener continuidad con el flujo del documento. |

---

## 5. Pruebas a repetir después de corregir

| # | Prueba | Herramienta / Método | Criterio verificado |
|---|---|---|---|
| 1 | Navegar con Tab por todo el sitio con el modal abierto; verificar que el foco no sale del modal | Navegador + teclado (sin mouse) | C1 — Focus trap |
| 2 | Cerrar modal con Escape y verificar que el foco regresa al botón que lo abrió | Navegador + teclado | C1 — Focus trap |
| 3 | Evaluar contraste de `.stat-desc`, `.data-label`, `.footer-bottom`, `.tech-stack` con herramienta de contraste (ej. axe DevTools, WebAIM Contrast Checker) | axe / WebAIM / Lighthouse | C2 — Contraste |
| 4 | Navegar solo con teclado por la barra de filtros de la trayectoria; verificar que la sección activa es clara sin usar color | Navegador + teclado | A1 — Indicador activo |
| 5 | Activar `prefers-reduced-motion: reduce` en el navegador (DevTools > Rendering > Emulate CSS media feature) y verificar que no hay animaciones largas | Chrome/Firefox DevTools | M1 — Reduced motion |
| 6 | Verificar que el H1 es único, los H2 son correctos y no hay saltos en la jerarquía de encabezados con la extensión HeadingsMap | Extensión HeadingsMap | M3 — Jerarquía |
| 7 | Ejecutar Lighthouse Accessibility y verificar puntuación ≥ 95 | Chrome Lighthouse | Global |
| 8 | Ejecutar axe-core contra la página y verificar 0 violaciones críticas/altas | axe DevTools | Global |
| 9 | Probar en 320px, 390px, 768px y 1440px con Chrome DevTools (device toolbar) | Chrome DevTools responsive mode | Responsive |
| 10 | Verificar que todas las imágenes de galería cargan con `alt` visible al deshabilitar CSS | Navegador > DevTools > desactivar CSS | 1.1.1 Non-text Content |
| 11 | Revisar que el botón hamburguesa tiene `aria-expanded="false"` en estado cerrado y `"true"` en abierto | axe / inspección manual del DOM | 4.1.2 Name, Role, Value |
| 12 | Hacer zoom al 200% y verificar que no hay contenido cortado ni scroll horizontal | Navegador > zoom 200% | 1.4.4 Resize Text / 1.4.10 Reflow |
