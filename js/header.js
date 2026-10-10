// Floating header: marks the header as scrolled once the page moves, so CSS can float it.
// The header works fully without this script (it just stays in its resting state).
(() => {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const THRESHOLD = 24;
  let ticking = false;

  const update = () => {
    header.toggleAttribute("data-scrolled", window.scrollY > THRESHOLD);
    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );

  update();
})();
