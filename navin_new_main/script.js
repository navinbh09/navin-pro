const canvas = document.getElementById("hyperspeed-bg");
if (!canvas || !canvas.getContext) {
  console.warn("Canvas not supported or element not found.");
} else {
  const ctx = canvas.getContext("2d");

  let stars = [];
  let numStars = window.innerWidth < 768 ? 100 : 180;
  let speed = window.innerWidth < 768 ? 0.0015 : 0.002;
  let animationFrameId;

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
    ctx.fillStyle = "#0b132b";
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
        ctx.fillStyle = `rgba(255,215,0,${alpha})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = `rgba(255,215,0,0.8)`;
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

  const speedSlider = document.createElement("input");
  speedSlider.type = "range";
  speedSlider.min = "0.001";
  speedSlider.max = "0.005";
  speedSlider.step = "0.0005";
  speedSlider.value = speed;
  speedSlider.style.position = "fixed";
  speedSlider.style.bottom = "20px";
  speedSlider.style.right = "20px";
  speedSlider.style.width = "150px";
  speedSlider.style.opacity = "0.7";
  speedSlider.style.zIndex = "1000";
  speedSlider.setAttribute("aria-label", "Adjust animation speed");
  speedSlider.addEventListener("input", () => {
    speed = parseFloat(speedSlider.value);
  });
  document.body.appendChild(speedSlider);
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