// Active-section indicator for the desktop nav: a pill that slides to the link of the section
// currently in view, and aria-current on that link. Without JS the nav simply has no indicator.
(() => {
  const nav = document.querySelector(".site-nav");
  if (!nav) return;

  const links = [...nav.querySelectorAll('a[href^="#"]')];
  const sections = links
    .map((link) => ({ link, section: document.querySelector(link.getAttribute("href")) }))
    .filter(({ section }) => section);
  // Every <main> section, so a section without a nav link (e.g. the process) clears the indicator.
  const allSections = [...document.querySelectorAll("main > section")];
  if (!sections.length) return;

  const indicator = document.createElement("span");
  indicator.className = "site-nav__indicator";
  indicator.setAttribute("aria-hidden", "true");
  nav.prepend(indicator); // a sibling of the list, not inside it (only <li> belongs in a <ul>)

  let current = null;

  const place = (link) => {
    if (!link) {
      indicator.removeAttribute("data-visible");
      return;
    }
    // Appearing from nothing: jump into place, then fade in (no slide from a stale spot).
    const appearing = !indicator.hasAttribute("data-visible");
    if (appearing) indicator.style.transition = "none";
    // Measure against the nav itself; offsetLeft would be relative to the link's own <li>.
    const left = link.getBoundingClientRect().left - nav.getBoundingClientRect().left;
    indicator.style.width = `${link.offsetWidth}px`;
    indicator.style.transform = `translateX(${left}px)`;
    if (appearing) {
      void indicator.offsetWidth;
      indicator.style.transition = "";
    }
    indicator.setAttribute("data-visible", "");
  };

  const setActive = (link) => {
    if (link === current) return;
    current?.removeAttribute("aria-current");
    link?.setAttribute("aria-current", "true");
    current = link;
    place(link);
  };

  // The active section is the last one whose top has passed 40% of the viewport height.
  const update = () => {
    const line = window.innerHeight * 0.4;
    const passed = allSections.filter((section) => section.getBoundingClientRect().top <= line);
    const section = passed.at(-1);
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    const target = atBottom ? sections.at(-1).section : section;
    setActive(sections.find((entry) => entry.section === target)?.link ?? null);
  };

  let pending = false;
  const schedule = () => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      update();
    });
  };

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", () => {
    place(current);
    schedule();
  }, { passive: true });
  document.fonts?.ready.then(() => place(current)).catch(() => {});
  update();
})();
