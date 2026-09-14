const canvas = document.getElementById("hyperspeed-bg");
if (!canvas || !canvas.getContext) {
  console.warn("Canvas not supported or element not found.");
} else {
  const ctx = canvas.getContext("2d");

  let stars = [];
  let numStars = window.innerWidth < 768 ? 100 : 180;
  let speed = window.innerWidth < 768 ? 0.0015 : 0.002;
  let animationFrameId;
  let contrast = 1;
  let theme = 'dark';
  const darkBase = [11,19,43];
  const lightBase = [250,250,250];

  // Restore saved display preferences (persist across pages)
  try {
    const savedSpeed = localStorage.getItem('display_speed');
    const savedContrast = localStorage.getItem('display_contrast');
    if (savedSpeed !== null) speed = parseFloat(savedSpeed);
    if (savedContrast !== null) contrast = parseFloat(savedContrast);
  } catch (e) {
    // localStorage may be unavailable in some contexts; silently ignore
  }

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    numStars = window.innerWidth < 768 ? 100 : 180;
    createStars();
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  // "Planckian Night": maps each star's existing depth/proximity value onto a
  // stylized blackbody color-temperature curve (deep ember-violet -> ember-orange
  // -> white-hot) -- the same color logic behind thermal-contour CFD plots -- so
  // near stars run hot and far stars run cool, instead of a single flat gold tint.
  function planckianColor(p) {
    const stops = [
      [74, 16, 48],    // deep ember-violet (far / just spawned)
      [255, 106, 61],  // ember-orange (mid-depth)
      [255, 246, 230], // white-hot (about to pass the viewer)
    ];
    const t = Math.max(0, Math.min(1, p)) * 2;
    const seg = t >= 1 ? 1 : 0;
    const localT = seg === 0 ? t : t - 1;
    const a = stops[seg], b = stops[seg + 1];
    return [
      Math.round(a[0] + (b[0] - a[0]) * localT),
      Math.round(a[1] + (b[1] - a[1]) * localT),
      Math.round(a[2] + (b[2] - a[2]) * localT),
    ];
  }

  function createStars() {
    stars = [];
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * canvas.width - canvas.width / 2,
        y: Math.random() * canvas.height - canvas.height / 2,
        z: Math.random() * canvas.width
      });
    }
  }

  function drawStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // compute background based on theme and contrast
    const base = theme === 'dark' ? darkBase : lightBase;
    const br = (v) => Math.min(255, Math.round(v * contrast));
    const [rBg, gBg, bBg] = base.map(br);
    ctx.fillStyle = `rgb(${rBg},${gBg},${bBg})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < numStars; i++) {
      const star = stars[i];
      star.z -= speed * canvas.width;
      if (star.z <= 0) {
        star.z = canvas.width;
        star.x = Math.random() * canvas.width - canvas.width / 2;
        star.y = Math.random() * canvas.height - canvas.height / 2;
      }

      const k = 128.0 / star.z;
      const px = star.x * k + canvas.width / 2;
      const py = star.y * k + canvas.height / 2;
      if (px >= 0 && px <= canvas.width && py >= 0 && py <= canvas.height) {
        const size = (1 - star.z / canvas.width) * 3;
        const alpha = 1 - star.z / canvas.width;

        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(Math.PI / 4);
        // choose star color based on theme and contrast (depth-as-temperature in dark mode)
        const starRGB = theme === 'dark' ? planckianColor(alpha) : [40,40,40];
        const starColor = `rgba(${starRGB[0]},${starRGB[1]},${starRGB[2]},${alpha * Math.min(1,contrast)})`;
        ctx.fillStyle = starColor;
        ctx.shadowBlur = 10;
        ctx.shadowColor = `rgba(${starRGB[0]},${starRGB[1]},${starRGB[2]},${0.8 * Math.min(1,contrast)})`;
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(size, 0);
        ctx.lineTo(0, size);
        ctx.lineTo(-size, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }
    animationFrameId = requestAnimationFrame(drawStars);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(animationFrameId);
    } else {
      drawStars();
    }
  });

  createStars();
  drawStars();

  /* Small display controls panel: Speed, Contrast, Theme */
  const controls = document.createElement('div');
  controls.className = 'display-controls';
  const GEAR_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/></svg>';
  const SPEED_SVG = '<svg class="dc-icon" viewBox="0 0 16 16" aria-hidden="true"><polygon points="8,0 14,8 8,16 2,8" fill="currentColor"/></svg>';
  const CONTRAST_SVG = '<svg class="dc-icon" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.8" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M8 1.2a6.8 6.8 0 0 1 0 13.6Z" fill="currentColor"/></svg>';

  controls.innerHTML = `
    <div class="dc-container">
      <button class="dc-toggle" aria-expanded="false" title="Display settings">
        <span style="display:inline-block">${GEAR_SVG}</span>
        <small class="dc-always-visible"> Customize view</small>
      </button>
      <div class="dc-panel" hidden>
        <div class="dc-row">
          <div class="dc-control">
            <label for="dc-speed">${SPEED_SVG}Speed</label>
            <small class="dc-tooltip">Animation speed</small>
          </div>
          <input id="dc-speed" class="dc-speed" type="range"
            min="0.0005" max="0.01" step="0.0005" value="${speed}">
        </div>
        <div class="dc-row">
          <div class="dc-control">
            <label for="dc-contrast">${CONTRAST_SVG}Look</label>
            <small class="dc-tooltip">Background brightness</small>
          </div>
          <input id="dc-contrast" class="dc-contrast" type="range"
            min="0.5" max="1.6" step="0.05" value="${contrast}">
        </div>
        <div class="dc-row">
          <button class="dc-reset" type="button">Reset to defaults</button>
        </div>
        <!-- Theme toggle removed (fixed dark mode) -->
      </div>
    </div>
  `;
  document.body.appendChild(controls);

  const toggleBtn = controls.querySelector('.dc-toggle');
  const panel = controls.querySelector('.dc-panel');
  const speedInput = controls.querySelector('.dc-speed');
  const contrastInput = controls.querySelector('.dc-contrast');

  // Ensure sliders reflect restored values
  if (speedInput) speedInput.value = speed;
  if (contrastInput) contrastInput.value = contrast;

  const resetBtn = controls.querySelector('.dc-reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      // compute default speed based on viewport
      const defaultSpeed = window.innerWidth < 768 ? 0.0015 : 0.002;
      speed = defaultSpeed;
      contrast = 1;
      if (speedInput) speedInput.value = speed;
      if (contrastInput) contrastInput.value = contrast;
      try {
        localStorage.setItem('display_speed', String(speed));
        localStorage.setItem('display_contrast', String(contrast));
      } catch (e) {}
      // brief visual cue: open panel briefly if closed
      if (panel.hidden) {
        panel.hidden = false;
        toggleBtn.setAttribute('aria-expanded', 'true');
        const gear = toggleBtn.querySelector('span');
        gear.style.animation = 'spin 1s linear 1';
        setTimeout(() => { gear.style.animation = ''; }, 1100);
      }
    });
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const open = panel ? panel.hidden : true;
      if (panel) panel.hidden = !open;
      toggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');

      // Start continuous rotation when panel is open
      const gear = toggleBtn.querySelector('span');
      if (gear) {
        if (open) {
          gear.style.animation = 'spin 4s linear infinite';
        } else {
          gear.style.animation = '';
        }
      }
    });
  }

  if (speedInput) {
    speedInput.addEventListener('input', () => {
      speed = parseFloat(speedInput.value);
      try { localStorage.setItem('display_speed', String(speed)); } catch (e) {}
    });
  }

  if (contrastInput) {
    contrastInput.addEventListener('input', () => {
      contrast = parseFloat(contrastInput.value);
      try { localStorage.setItem('display_contrast', String(contrast)); } catch (e) {}
    });
  }
}

/* On mobile, .resume-gold-box now flows normally after .hero-buttons (see
   style.css), but the fixed bottom-right .display-controls gear widget can
   still land on top of it depending on exact viewport height and hero copy
   length. Rather than guess a fixed CSS offset (which only holds for one
   viewport height), measure the real rendered overlap and nudge the box down
   by exactly as much as needed. */
function avoidGearWidgetOverlap() {
  const box = document.querySelector('.resume-gold-box');
  const dc = document.querySelector('.display-controls');
  if (!box || !dc) return;
  if (window.innerWidth > 768) { box.style.marginTop = ''; return; }
  box.style.marginTop = '';
  const boxRect = box.getBoundingClientRect();
  const dcRect = dc.getBoundingClientRect();
  const overlapsVertically = boxRect.top < dcRect.bottom && boxRect.bottom > dcRect.top;
  const overlapsHorizontally = boxRect.left < dcRect.right && boxRect.right > dcRect.left;
  if (overlapsVertically && overlapsHorizontally) {
    const baseMargin = parseFloat(getComputedStyle(box).marginTop) || 0;
    const extra = dcRect.bottom + 12 - boxRect.top;
    box.style.marginTop = (baseMargin + extra) + 'px';
  }
}
window.addEventListener('load', avoidGearWidgetOverlap);
window.addEventListener('resize', avoidGearWidgetOverlap);

function toggleMenu() {
  const navLinks = document.querySelector(".nav-links");
  const body = document.body;
  const hamburger = document.querySelector(".hamburger");
  navLinks.classList.toggle("active");
  body.style.overflow = navLinks.classList.contains("active") ? "hidden" : "auto";
  hamburger.setAttribute("aria-expanded", navLinks.classList.contains("active"));
}

const hamb = document.querySelector(".hamburger");
if (hamb) {
  hamb.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleMenu();
    }
  });
}

/* Shared focus trap: while a modal is open, Tab/Shift+Tab cycles only among
   its own focusable elements instead of escaping into the page behind it. */
function trapModalTabKey(modalEl, e) {
  if (e.key !== 'Tab') return;
  const focusables = Array.from(modalEl.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])'))
    .filter(el => el.offsetParent !== null);
  if (!focusables.length) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

/* Image lightbox: open project detail images in a modal with a close button */
(() => {
  // create modal DOM
  const modal = document.createElement('div');
  modal.className = 'img-modal';
  modal.setAttribute('hidden', '');
  modal.innerHTML = `
    <div class="img-modal-content" role="dialog" aria-modal="true">
      <button class="img-modal-close" aria-label="Close image">×</button>
      <img src="" alt="Expanded project image">
      <div class="img-modal-caption" aria-hidden="true"></div>
    </div>
  `;
  document.body.appendChild(modal);

  const modalImg = modal.querySelector('img');
  const modalClose = modal.querySelector('.img-modal-close');
  const modalCaption = modal.querySelector('.img-modal-caption');

  function openModal(src, alt) {
    if (!modal) return;
    // never show both modals at once
    const picker = document.querySelector('.doc-picker-modal');
    if (picker && !picker.hasAttribute('hidden')) {
      picker.setAttribute('hidden', '');
    }
    modalImg.src = src;
    modalImg.alt = alt || 'Project image';
    modalCaption.textContent = alt || '';
    modal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    // focus close button for accessibility
    if (modalClose) modalClose.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.setAttribute('hidden', '');
    modalImg.src = '';
    modalCaption.textContent = '';
    document.body.style.overflow = '';
  }

  if (modalClose) modalClose.addEventListener('click', closeModal);

  // close on backdrop click (but not when clicking the image or close button)
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // close on Escape (stop the keypress from also reaching a page's own
  // project-details Escape handler), and trap Tab focus while open
  document.addEventListener('keydown', (e) => {
    if (modal.hasAttribute('hidden')) return;
    if (e.key === 'Escape') { e.stopImmediatePropagation(); closeModal(); return; }
    trapModalTabKey(modal, e);
  });

  // Detach any previously attached handlers on project-card thumbnails by replacing nodes
  document.querySelectorAll('.project-card img').forEach(img => {
    if (img.dataset && img.dataset.lightboxAttached) {
      const clone = img.cloneNode(true); // removes event listeners
      img.parentNode.replaceChild(clone, img);
    }
  });

  // attach click handlers to project-detail & gallery images, and the about headshot (.intro-image)
  const selectors = ['.project-details img', '.project-gallery img', '.intro-image'];
  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(img => {
      // avoid attaching multiple handlers
      if (img.dataset.lightboxAttached) return;
      img.dataset.lightboxAttached = '1';
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', (e) => {
        e.stopPropagation();
        openModal(img.currentSrc || img.src, img.alt || 'Project image');
      });
    });
  });

  // In case project details are toggled later, observe DOM for added images
  const obs = new MutationObserver((mutations) => {
    mutations.forEach(m => {
      m.addedNodes.forEach(node => {
        if (node.nodeType === 1) {
          selectors.forEach(sel => {
            node.querySelectorAll && node.querySelectorAll(sel).forEach(img => {
              if (img.dataset.lightboxAttached) return;
              img.dataset.lightboxAttached = '1';
              img.style.cursor = 'zoom-in';
              img.addEventListener('click', (e) => {
                e.stopPropagation();
                openModal(img.currentSrc || img.src, img.alt || 'Project image');
              });
            });
          });
        }
      });
    });
  });
  obs.observe(document.body, { childList: true, subtree: true });
})();

/* Contact form: no backend is configured, so build a mailto: link from the
   filled-in fields instead of silently failing a POST to a placeholder endpoint. */
(() => {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = (id) => (form.querySelector('#' + id) || {}).value || '';
    const subject = val('subject') || `Message from ${val('name')}`;
    const body = `From: ${val('name')} (${val('email')})\n\n${val('message')}`;
    window.location.href = `mailto:b.navin@wustl.edu?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
})();

/* Resume / CV picker: any .resume-cv-trigger opens a friendly "which one?" modal */
(() => {
  const triggers = document.querySelectorAll('.resume-cv-trigger');
  if (!triggers.length) return;

  const RESUME_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" d="M6 2h9l5 5v15H6Z"/><path fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" d="M15 2v6h6"/><path fill="none" stroke="currentColor" stroke-width="1.4" d="M9 13h6M9 17h6"/></svg>';
  const CV_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3 2 8l10 5 10-5Z"/><path fill="none" stroke="currentColor" stroke-width="1.4" d="M6 11v4c0 1.66 2.69 3 6 3s6-1.34 6-3v-4"/><path fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" d="M22 8v6"/></svg>';

  const modal = document.createElement('div');
  modal.className = 'img-modal doc-picker-modal';
  modal.setAttribute('hidden', '');
  modal.innerHTML = `
    <div class="img-modal-content doc-picker-content" role="dialog" aria-modal="true" aria-label="Choose a document to view">
      <button class="img-modal-close" aria-label="Close">×</button>
      <h3 class="doc-picker-title gradient-text">Which one would you like?</h3>
      <div class="doc-picker-options">
        <a class="doc-picker-card" data-doc="resume" target="_blank" rel="noopener">
          <span class="doc-picker-icon">${RESUME_SVG}</span>
          <span class="doc-picker-name">Resume</span>
          <span class="doc-picker-desc">Great for internships &amp; industry roles</span>
        </a>
        <a class="doc-picker-card" data-doc="cv" target="_blank" rel="noopener">
          <span class="doc-picker-icon">${CV_SVG}</span>
          <span class="doc-picker-name">Academic CV</span>
          <span class="doc-picker-desc">Full research, teaching &amp; publication record</span>
        </a>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const closeBtn = modal.querySelector('.img-modal-close');
  const resumeCard = modal.querySelector('[data-doc="resume"]');
  const cvCard = modal.querySelector('[data-doc="cv"]');

  function closeDocPicker() {
    modal.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }

  function openDocPicker(trigger) {
    // never show both modals at once
    const lightbox = document.querySelector('.img-modal:not(.doc-picker-modal)');
    if (lightbox && !lightbox.hasAttribute('hidden')) {
      lightbox.setAttribute('hidden', '');
    }
    const resumeHref = trigger.dataset.resumeHref;
    const cvHref = trigger.dataset.cvHref;
    if (resumeHref) resumeCard.href = resumeHref;
    if (cvHref) cvCard.href = cvHref;

    const emphasize = trigger.dataset.emphasize;
    resumeCard.classList.toggle('recommended', emphasize === 'resume');
    cvCard.classList.toggle('recommended', emphasize === 'cv');

    modal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    if (closeBtn) closeBtn.focus();
  }

  triggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      openDocPicker(trigger);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeDocPicker);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeDocPicker();
  });
  document.addEventListener('keydown', (e) => {
    if (modal.hasAttribute('hidden')) return;
    if (e.key === 'Escape') { e.stopImmediatePropagation(); closeDocPicker(); return; }
    trapModalTabKey(modal, e);
  });
})();