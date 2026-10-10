// Floating header: marks the header as scrolled once the page moves, so CSS can float it,
// and measures the bar's content so the floating pill hugs it (--pill-width).
// The header works fully without this script (it just stays in its resting state).
(() => {
  const header = document.querySelector(".site-header");
  const bar = header?.querySelector(".site-header__bar");
  if (!header || !bar) return;

  const SCROLL_THRESHOLD = 24;
  const DESKTOP_MIN_WIDTH = 900;

  const contentWidth = () => {
    const style = getComputedStyle(bar);
    const children = [...bar.children].filter((child) => child.offsetWidth > 0);
    const childrenWidth = children.reduce((sum, child) => sum + child.getBoundingClientRect().width, 0);
    const gaps = (parseFloat(style.columnGap) || 0) * Math.max(0, children.length - 1);
    const box = ["paddingLeft", "paddingRight", "borderLeftWidth", "borderRightWidth"].reduce(
      (sum, prop) => sum + parseFloat(style[prop]),
      0,
    );
    return childrenWidth + gaps + box;
  };

  // Measure in the floating state (its padding and gap differ), without animating.
  const measurePill = () => {
    if (window.innerWidth < DESKTOP_MIN_WIDTH) {
      bar.style.removeProperty("--pill-width");
      return;
    }
    const wasScrolled = header.hasAttribute("data-scrolled");
    bar.style.transition = "none";
    header.setAttribute("data-scrolled", "");
    const width = contentWidth();
    header.toggleAttribute("data-scrolled", wasScrolled);
    void bar.offsetWidth;
    bar.style.transition = "";
    bar.style.setProperty("--pill-width", `${Math.ceil(width + 2)}px`);
  };

  const updateScrolled = () => header.toggleAttribute("data-scrolled", window.scrollY > SCROLL_THRESHOLD);

  const onNextFrame = (callback) => {
    let pending = false;
    return () => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        pending = false;
        callback();
      });
    };
  };

  window.addEventListener("scroll", onNextFrame(updateScrolled), { passive: true });
  window.addEventListener("resize", onNextFrame(measurePill), { passive: true });
  document.fonts?.ready.then(measurePill).catch(() => {});

  measurePill();
  updateScrolled();
})();
