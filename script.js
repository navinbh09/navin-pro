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
        // choose star color based on theme and contrast
        const starRGB = theme === 'dark' ? [255,215,0] : [40,40,40];
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
  controls.innerHTML = `
    <div class="dc-container">
      <button class="dc-toggle" aria-expanded="false" title="Display settings">
        <span style="display:inline-block">⚙</span>
        <small class="dc-always-visible"> Customize view</small>
      </button>
      <div class="dc-panel" hidden>
        <div class="dc-row">
          <div class="dc-control">
            <label for="dc-speed">✨ Speed</label>
            <small class="dc-tooltip">Animation speed</small>
          </div>
          <input id="dc-speed" class="dc-speed" type="range" 
            min="0.0005" max="0.01" step="0.0005" value="${speed}">
        </div>
        <div class="dc-row">
          <div class="dc-control">
            <label for="dc-contrast">🌟 Look</label>
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

  // close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hasAttribute('hidden')) closeModal();
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