// Scroll-enter reveals. See styles/components/reveal.css for the states.
// Respects prefers-reduced-motion: then nothing is hidden or animated.
(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion || !("IntersectionObserver" in window)) {
    root.classList.remove("js-reveal");
    return;
  }

  const segmenter = "Segmenter" in Intl ? new Intl.Segmenter(undefined, { granularity: "grapheme" }) : null;
  const graphemes = (word) => (segmenter ? [...segmenter.segment(word)].map((s) => s.segment) : [...word]);

  const span = (className, text) => {
    const element = document.createElement("span");
    element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };

  // Words stay unbreakable; each letter gets an index for the stagger.
  // Screen readers get the original text once, the animated letters are hidden from them.
  const splitIntoChars = (heading) => {
    const text = heading.textContent.trim().replace(/\s+/g, " ");
    const visual = span("reveal-text");
    visual.setAttribute("aria-hidden", "true");

    let index = 0;
    text.split(" ").forEach((word, wordIndex, words) => {
      const wordSpan = span("reveal-word");
      graphemes(word).forEach((char) => {
        const charSpan = span("reveal-char", char);
        charSpan.style.setProperty("--reveal-c", index++);
        wordSpan.append(charSpan);
      });
      visual.append(wordSpan);
      if (wordIndex < words.length - 1) visual.append(" ");
    });

    heading.replaceChildren(span("visually-hidden", text), visual);
    heading.setAttribute("data-split", "");
  };

  document.querySelectorAll('[data-reveal="chars"]').forEach(splitIntoChars);

  // Groups reveal together when the group enters view; children stagger by index.
  const groups = [...document.querySelectorAll("[data-reveal-group]")];
  groups.forEach((group) => {
    [...group.children].forEach((item, index) => {
      if (!item.hasAttribute("data-reveal")) item.setAttribute("data-reveal", "up");
      item.style.setProperty("--reveal-i", index);
    });
  });

  // After a fade/rise finishes, drop the reveal state so the element's own transitions
  // (e.g. card hover) apply again.
  const settle = (element) => {
    if (element.getAttribute("data-reveal") === "chars") return;
    element.addEventListener("transitionend", function onEnd(event) {
      if (event.target !== element || event.propertyName !== "transform") return;
      element.removeEventListener("transitionend", onEnd);
      element.removeAttribute("data-reveal");
      element.classList.remove("is-revealed");
      element.style.removeProperty("--reveal-i");
    });
  };

  const reveal = (element) => {
    settle(element);
    element.classList.add("is-revealed");
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries
        .filter((entry) => entry.isIntersecting)
        .forEach(({ target }) => {
          if (target.hasAttribute("data-reveal-group")) [...target.children].forEach(reveal);
          else reveal(target);
          observer.unobserve(target);
        });
    },
    { threshold: 0.15, rootMargin: "0px 0px -5% 0px" },
  );

  const standalone = [...document.querySelectorAll("[data-reveal]")].filter(
    (element) => !element.parentElement?.hasAttribute("data-reveal-group"),
  );
  [...groups, ...standalone].forEach((element) => observer.observe(element));
})();
