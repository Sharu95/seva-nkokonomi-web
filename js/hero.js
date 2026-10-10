// Hero tilt: the illustration's layers follow the pointer slightly (parallax by --depth).
// Only for fine pointers with hover and when the user has not asked for reduced motion.
// Sets --px/--py (-1..1) on .hero__visual; CSS does the rest. Purely decorative.
(() => {
  const hero = document.querySelector(".hero");
  const visual = hero?.querySelector(".hero__visual");
  if (!hero || !visual) return;

  const canTilt = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
  if (!canTilt.matches) return;

  let frame = 0;
  const set = (x, y) => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      visual.style.setProperty("--px", x.toFixed(3));
      visual.style.setProperty("--py", y.toFixed(3));
    });
  };

  const clamp = (value) => Math.max(-1, Math.min(1, value));

  hero.addEventListener("pointermove", (event) => {
    const rect = visual.getBoundingClientRect();
    const x = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const y = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    set(clamp(x), clamp(y));
  });

  hero.addEventListener("pointerleave", () => set(0, 0));
})();
