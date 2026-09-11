/**
 * Cristiano Ronaldo - Sitio Web Temático (Fútbol)
 * Lógica en JavaScript Vanilla (Sin librerías externas)
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ==========================================================================
     1. Menú Móvil Accesible
     ========================================================================== */
  const menuToggle = document.getElementById('menu-toggle');
  const mainNav = document.getElementById('main-nav');
  const navLinks = document.querySelectorAll('.nav-link');

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!isExpanded));
      mainNav.classList.toggle('is-open');

      if (!isExpanded) {
        menuToggle.setAttribute('aria-label', 'Cerrar menú de navegación');
      } else {
        menuToggle.setAttribute('aria-label', 'Abrir menú de navegación');
      }
    });

    // Cerrar menú móvil al seleccionar cualquier enlace
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (mainNav.classList.contains('is-open')) {
          mainNav.classList.remove('is-open');
          menuToggle.setAttribute('aria-expanded', 'false');
          menuToggle.setAttribute('aria-label', 'Abrir menú de navegación');
        }
      });
    });

    // Cerrar menú con la tecla Escape si está abierto
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mainNav.classList.contains('is-open')) {
        mainNav.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Abrir menú de navegación');
        menuToggle.focus();
      }
    });
  }

  /* ==========================================================================
     2. Resaltado de Enlace Activo al Hacer Scroll
     ========================================================================== */
  const sections = document.querySelectorAll('main > section[id]');

  function updateActiveNavLink() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    
    sections.forEach(currentSection => {
      const sectionHeight = currentSection.offsetHeight;
      const sectionTop = currentSection.offsetTop - 120;
      const sectionId = currentSection.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
          } else {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveNavLink, { passive: true });
  updateActiveNavLink();

  /* ==========================================================================
     3. Filtrado Interactivo de la Trayectoria Deportiva
     ========================================================================== */
  const filterButtons = document.querySelectorAll('.filter-btn');
  const timelineCards = document.querySelectorAll('.timeline-card');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Actualizar estado del botón activo y accesibilidad aria-pressed
      filterButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      const filterValue = btn.getAttribute('data-filter');
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      timelineCards.forEach(card => {
        const category = card.getAttribute('data-category');

        if (filterValue === 'all' || category === filterValue) {
          card.classList.remove('hidden');
          if (prefersReducedMotion) {
            card.style.opacity = '1';
            card.style.transform = 'none';
          } else {
            // Pequeña animación de entrada suave
            card.style.opacity = '0';
            card.style.transform = 'translateY(8px)';
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, 40);
          }
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  /* ==========================================================================
     4. Botones Expansibles de Detalles en la Línea de Tiempo
     ========================================================================== */
  const toggleDetailButtons = document.querySelectorAll('.toggle-details-btn');

  toggleDetailButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('aria-controls');
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        const isHidden = targetElement.hasAttribute('hidden');
        
        if (isHidden) {
          targetElement.removeAttribute('hidden');
          button.setAttribute('aria-expanded', 'true');
          button.textContent = 'Ocultar detalles ▲';
        } else {
          targetElement.setAttribute('hidden', '');
          button.setAttribute('aria-expanded', 'false');
          button.textContent = 'Ver más detalles ▼';
        }
      }
    });
  });

  /* ==========================================================================
     5. Animación de Contadores Numéricos (Estadísticas)
     ========================================================================== */
  const counters = document.querySelectorAll('.stat-number');
  let countersAnimated = false;

  function animateCounters() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'), 10);
        counter.textContent = target.toLocaleString('es-ES') + (target >= 100 ? '+' : '');
      });
      return;
    }

    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-target'), 10);
      const duration = 1800; // Duración en milisegundos
      const startTime = performance.now();

      function updateNumber(currentTime) {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        
        // Función de aceleración y frenado suave (easeOutQuad)
        const easeProgress = 1 - (1 - progress) * (1 - progress);
        const currentValue = Math.floor(easeProgress * target);

        counter.textContent = currentValue.toLocaleString('es-ES') + (target >= 100 ? '+' : '');

        if (progress < 1) {
          requestAnimationFrame(updateNumber);
        } else {
          counter.textContent = target.toLocaleString('es-ES') + (target >= 100 ? '+' : '');
        }
      }

      requestAnimationFrame(updateNumber);
    });
  }

  // Observador de intersección para iniciar animación al ver la sección
  const statsSection = document.getElementById('estadisticas');
  if (statsSection && 'IntersectionObserver' in window) {
    const statsObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !countersAnimated) {
          countersAnimated = true;
          animateCounters();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25 });

    statsObserver.observe(statsSection);
  } else {
    // Respaldo inmediato si IntersectionObserver no está soportado
    animateCounters();
  }

  /* ==========================================================================
     6. Galería Accesible con Visor Modal (Lightbox)
     ========================================================================== */
  const galleryTriggers = document.querySelectorAll('.gallery-trigger');
  const modal = document.getElementById('gallery-modal');
  const modalImage = document.getElementById('modal-image');
  const modalCaption = document.getElementById('modal-caption');
  const modalClose = document.getElementById('modal-close');
  let previousActiveElement = null;

  function handleModalKeydown(e) {
    if (!modal || !modal.classList.contains('is-open')) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      closeModal();
      return;
    }

    if (e.key === 'Tab') {
      const focusableElements = modal.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) {
        e.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement || !modal.contains(document.activeElement)) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement || !modal.contains(document.activeElement)) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  }

  function openModal(imgSrc, imgAlt, captionText) {
    if (!modal || !modalImage || !modalCaption) return;

    previousActiveElement = document.activeElement;
    
    modalImage.src = imgSrc;
    modalImage.alt = imgAlt;
    modalCaption.textContent = captionText;

    modal.removeAttribute('hidden');
    document.addEventListener('keydown', handleModalKeydown);

    // Esperar al siguiente cuadro de render para la transición de opacidad
    setTimeout(() => {
      modal.classList.add('is-open');
      if (modalClose) modalClose.focus();
    }, 20);

    // Evitar scroll de fondo mientras la ventana modal está abierta
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal) return;

    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', handleModalKeydown);

    setTimeout(() => {
      modal.setAttribute('hidden', '');
      if (modalImage) {
        modalImage.src = '';
        modalImage.alt = '';
      }
      if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
        previousActiveElement.focus();
      }
    }, 250);
  }

  galleryTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const img = trigger.querySelector('.gallery-img');
      const figcaption = trigger.closest('.gallery-item')?.querySelector('.gallery-caption');
      
      if (img) {
        const captionText = figcaption ? figcaption.textContent.trim() : img.alt;
        openModal(img.src, img.alt, captionText);
      }
    });
  });

  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  if (modal) {
    // Cerrar al hacer clic en el fondo oscuro
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  /* ==========================================================================
     7. Botón "Volver Arriba" con Desplazamiento Suave
     ========================================================================== */
  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
      // Devolver foco al encabezado para accesibilidad y limpiar tabindex al desenfocar
      const topTarget = document.getElementById('top');
      if (topTarget) {
        topTarget.setAttribute('tabindex', '-1');
        topTarget.focus({ preventScroll: true });
        topTarget.addEventListener('blur', () => {
          topTarget.removeAttribute('tabindex');
        }, { once: true });
      }
    });
  }
});
