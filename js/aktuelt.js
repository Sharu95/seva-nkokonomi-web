// aktuelt.html: all upcoming deadlines (grouped by month, one section per audience) and the latest
// a-ordningen news. Each section ships hidden and is shown only when it has content. The fallback
// link to Skatteetaten stays visible until something renders, so the page is never empty.
import { AUDIENCE_LABEL, deadlineCard, el, isSkatteetatenUrl, loadItems, monthYear, newsDate, todayInNorway, upcoming } from "./feeds.js";

const NEWS_SOURCE_LABEL = { arbeidsgiver: "For arbeidsgivere", systemleverandor: "For systemleverandører" };

const [deadlines, news] = await Promise.all([loadItems("data/frister.json"), loadItems("data/a-ordningen.json")]);
const today = todayInNorway();

const rendered = [
  ...Object.keys(AUDIENCE_LABEL).map((audience) => renderDeadlines(audience)),
  renderNews(),
].some(Boolean);

if (rendered) {
  document.querySelector("[data-aktuelt-fallback]").hidden = true;
  document.querySelector("[data-aktuelt-source]").hidden = false;
}

function renderDeadlines(audience) {
  const section = document.querySelector(`[data-deadlines="${audience}"]`);
  const items = upcoming((deadlines ?? []).filter((d) => d.audience === audience), today);
  if (!section || !items.length) return false;

  // Group by "YYYY-MM" (items are already sorted, so months come out in order).
  const byMonth = items.reduce((groups, d) => {
    const month = d.date.slice(0, 7);
    groups.set(month, [...(groups.get(month) ?? []), d]);
    return groups;
  }, new Map());
  section.querySelector("[data-deadlines-list]").replaceChildren(
    ...[...byMonth].map(([month, monthItems]) =>
      el(
        "div",
        { class: "aktuelt__month" },
        el("h3", { class: "aktuelt__month-title" }, capitalize(monthYear(`${month}-01`))),
        el("ol", { class: "deadline-grid" }, ...monthItems.map((d) => el("li", {}, deadlineCard(d, today)))),
      ),
    ),
  );
  section.hidden = false;
  return true;
}

function renderNews() {
  const section = document.querySelector("[data-news]");
  const items = (news ?? []).filter((n) => n.title && n.date && isSkatteetatenUrl(n.url));
  if (!section || !items.length) return false;

  section.querySelector("[data-news-list]").replaceChildren(
    ...items.map((n) =>
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
  section.hidden = false;
  return true;
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
