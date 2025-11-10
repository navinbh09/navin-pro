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

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    numStars = window.innerWidth < 768 ? 100 : 180;
    speed = window.innerWidth < 768 ? 0.0015 : 0.002;
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
        <small class="dc-always-visible">✨ Customize view</small>
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
          <div class="dc-control">
            <label>🎨 Mode</label>
            <small class="dc-tooltip">Dark/Light theme</small>
          </div>
          <button class="dc-theme" type="button">Light</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(controls);

  const toggleBtn = controls.querySelector('.dc-toggle');
  const panel = controls.querySelector('.dc-panel');
  const speedInput = controls.querySelector('.dc-speed');
  const contrastInput = controls.querySelector('.dc-contrast');
  const themeBtn = controls.querySelector('.dc-theme');

  toggleBtn.addEventListener('click', () => {
    const open = panel.hidden;
    panel.hidden = !open;
    toggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    
    // Start continuous rotation when panel is open
    const gear = toggleBtn.querySelector('span');
    if (open) {
      gear.style.animation = 'spin 4s linear infinite';
    } else {
      gear.style.animation = '';
    }
  });

  speedInput.addEventListener('input', () => {
    speed = parseFloat(speedInput.value);
  });

  contrastInput.addEventListener('input', () => {
    contrast = parseFloat(contrastInput.value);
  });

  themeBtn.addEventListener('click', () => {
    if (theme === 'dark') {
      theme = 'light';
      themeBtn.textContent = 'Dark';
      document.body.classList.add('light-theme');
    } else {
      theme = 'dark';
      themeBtn.textContent = 'Light';
      document.body.classList.remove('light-theme');
    }
  });
}

function toggleMenu() {
  const navLinks = document.querySelector(".nav-links");
  const body = document.body;
  const hamburger = document.querySelector(".hamburger");
  navLinks.classList.toggle("active");
  body.style.overflow = navLinks.classList.contains("active") ? "hidden" : "auto";
  hamburger.setAttribute("aria-expanded", navLinks.classList.contains("active"));
}

document.querySelector(".hamburger").addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    toggleMenu();
  }
});