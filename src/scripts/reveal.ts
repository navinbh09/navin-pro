// Gentle scroll reveals: elements with .reveal drift up once as they enter the screen.
const items = document.querySelectorAll<HTMLElement>('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );
  items.forEach((el) => io.observe(el));
} else {
  items.forEach((el) => el.classList.add('is-in'));
}

// Theme toggle (light / dark), remembered on this device only.
const toggle = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');
if (toggle) {
  const root = document.documentElement;
  const isDark = () => root.getAttribute('data-theme') === 'dark';
  const sync = () => {
    const dark = isDark();
    toggle.setAttribute('aria-pressed', String(dark));
    toggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  };
  sync();
  toggle.addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch { /* storage blocked: fine */ }
    sync();
    window.dispatchEvent(new CustomEvent('themechange'));
  });
}
