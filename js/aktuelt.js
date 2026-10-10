// aktuelt.html: upcoming tax deadlines and a-ordningen news, with two filters on top:
//   Vis: Frister | A-ordningen   (what to show)
//   For: Bedrift | Person        (whose deadlines; only for Frister)
// Defaults: Frister, Bedrift. The choice is kept in the URL (?vis=a-ordningen, ?for=person), so the
// front page can link straight to a filter and a filtered view can be shared.
// Everything ships hidden; the fallback link to Skatteetaten stays until something renders.
import {
  AUDIENCE_LABEL,
  CALENDAR_URL,
  deadlineCard,
  el,
  isSkatteetatenUrl,
  loadItems,
  monthYear,
  newsDate,
  todayInNorway,
  upcoming,
} from "./feeds.js";

const NEWS_SOURCE_LABEL = { arbeidsgiver: "For arbeidsgivere", systemleverandor: "For systemleverandører" };

const [deadlines, news] = await Promise.all([loadItems("data/frister.json"), loadItems("data/a-ordningen.json")]);
const today = todayInNorway();

const deadlinesFor = Object.fromEntries(
  Object.keys(AUDIENCE_LABEL).map((audience) => [audience, upcoming((deadlines ?? []).filter((d) => d.audience === audience), today)]),
);
const newsItems = (news ?? []).filter((n) => n.title && n.date && isSkatteetatenUrl(n.url));

// Which options have anything to show.
const audiences = Object.keys(deadlinesFor).filter((a) => deadlinesFor[a].length);
const views = [audiences.length && "frister", newsItems.length && "a-ordningen"].filter(Boolean);

if (views.length) init();

function init() {
  const params = new URLSearchParams(location.search);
  const state = {
    vis: views.includes(params.get("vis")) ? params.get("vis") : views[0],
    for: audiences.includes(params.get("for")) ? params.get("for") : audiences[0],
  };

  const filters = document.querySelector("[data-filters]");
  const visFilter = filters.querySelector('[data-filter="vis"]');
  const forFilter = filters.querySelector('[data-filter="for"]');

  // Offer only options with content; a filter with a single option is left out.
  setupFilter(visFilter, views, (value) => update({ vis: value }));
  setupFilter(forFilter, audiences, (value) => update({ for: value }));

  renderNews();
  render(state, { announce: false });

  filters.hidden = false;
  document.querySelector("[data-aktuelt-fallback]").hidden = true;
  document.querySelector("[data-aktuelt-source]").hidden = false;

  function update(change) {
    Object.assign(state, change);
    render(state, { announce: true });
    const query = new URLSearchParams();
    if (state.vis !== views[0]) query.set("vis", state.vis);
    if (state.vis === "frister" && state.for !== audiences[0]) query.set("for", state.for);
    const search = query.toString();
    history.replaceState(null, "", `${location.pathname}${search ? `?${search}` : ""}`);
  }
}

function setupFilter(group, options, onSelect) {
  for (const button of group.querySelectorAll("button")) {
    button.hidden = !options.includes(button.dataset.value);
    button.addEventListener("click", () => onSelect(button.dataset.value));
  }
  group.hidden = options.length < 2;
}

function render(state, { announce }) {
  press('[data-filter="vis"]', state.vis);
  press('[data-filter="for"]', state.for);

  const showDeadlines = state.vis === "frister";
  document.querySelector('[data-filter="for"]').hidden = !showDeadlines || audiences.length < 2;
  document.querySelector('[data-panel="frister"]').hidden = !showDeadlines;
  document.querySelector('[data-panel="a-ordningen"]').hidden = showDeadlines;

  if (showDeadlines) renderDeadlines(state.for);

  if (announce) {
    document.querySelector("[data-status]").textContent = showDeadlines
      ? `Viser ${deadlinesFor[state.for].length} frister for ${AUDIENCE_LABEL[state.for].toLowerCase()}`
      : `Viser ${newsItems.length} nyheter fra a-ordningen`;
  }
}

function press(groupSelector, value) {
  for (const button of document.querySelectorAll(`${groupSelector} button`)) {
    button.setAttribute("aria-pressed", String(button.dataset.value === value));
  }
}

function renderDeadlines(audience) {
  const panel = document.querySelector('[data-panel="frister"]');
  panel.querySelector("[data-frister-heading]").textContent = `Frister for ${AUDIENCE_LABEL[audience].toLowerCase()}`;
  panel.querySelector("[data-calendar-link]").href = CALENDAR_URL[audience];

  // Group by "YYYY-MM" (items are already sorted, so months come out in order).
  const byMonth = deadlinesFor[audience].reduce((groups, d) => {
    const month = d.date.slice(0, 7);
    groups.set(month, [...(groups.get(month) ?? []), d]);
    return groups;
  }, new Map());

  panel.querySelector("[data-deadlines-list]").replaceChildren(
    ...[...byMonth].map(([month, items]) =>
      el(
        "div",
        { class: "aktuelt__month" },
        el("h3", { class: "aktuelt__month-title" }, capitalize(monthYear(`${month}-01`))),
        el("ol", { class: "deadline-list" }, ...items.map((d) => el("li", {}, deadlineCard(d, today, { variant: "row" })))),
      ),
    ),
  );
}

function renderNews() {
  document.querySelector("[data-news-list]").replaceChildren(
    ...newsItems.map((n) =>
      el(
        "li",
        {},
        el(
          "article",
          { class: "news-item" },
          el(
            "p",
            { class: "news-item__meta" },
            el("time", { datetime: n.date }, newsDate(n.date)),
            NEWS_SOURCE_LABEL[n.source] && el("span", { class: "pill" }, NEWS_SOURCE_LABEL[n.source]),
          ),
          el("h3", { class: "news-item__title" }, el("a", { href: n.url, rel: "noopener" }, n.title)),
          n.summary && el("p", { class: "news-item__summary" }, n.summary),
        ),
      ),
    ),
  );
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
