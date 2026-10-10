// Shared helpers for the Skatteetaten feeds. The data is static JSON in data/, refreshed daily by
// .github/workflows/feeds.yml (Skatteetaten blocks cross-origin requests, so the browser never calls it).
// Every function fails quietly: callers get null or an empty list and render nothing.

const TIMEOUT_MS = 5000;

export const AUDIENCE_LABEL = { bedrift: "Bedrift", person: "Person" };

/** Skatteetaten's own (readable) calendar page per audience, for "see all" and source links. */
export const CALENDAR_URL = {
  bedrift: "https://www.skatteetaten.no/bedrift-og-organisasjon/starte-og-drive/frister-gebyrer-og-tilleggsskatt/frister-og-oppgaver/",
  person: "https://www.skatteetaten.no/person/skatt/skattekalender/",
};

/** Items from a data file, or null if it is missing, slow or malformed. */
export async function loadItems(path) {
  try {
    const res = await fetch(path, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!res.ok) return null;
    const { items } = await res.json();
    return Array.isArray(items) ? items : null;
  } catch {
    return null;
  }
}

/** Today's date in Norway as YYYY-MM-DD (deadlines are calendar days in Norway). */
export const todayInNorway = () => new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(new Date());

/** Deadlines on or after today, oldest first. Never shows a past date, however old the data is. */
export const upcoming = (deadlines, today = todayInNorway()) =>
  deadlines
    .filter((d) => typeof d.date === "string" && d.date >= today && d.title && isSkatteetatenUrl(d.url))
    .sort((a, b) => a.date.localeCompare(b.date));

export const isSkatteetatenUrl = (url) => typeof url === "string" && url.startsWith("https://www.skatteetaten.no/");

const asDate = (isoDay) => new Date(`${isoDay}T12:00:00Z`);
const format = (options) => new Intl.DateTimeFormat("nb-NO", { timeZone: "UTC", ...options });

export const dayOfMonth = (isoDay) => format({ day: "numeric" }).format(asDate(isoDay)).replace(".", "");
export const shortMonth = (isoDay) => format({ month: "short" }).format(asDate(isoDay)).replace(".", "");
export const longDate = (isoDay) => format({ weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(asDate(isoDay));
export const monthYear = (isoDay) => format({ month: "long", year: "numeric" }).format(asDate(isoDay));
export const newsDate = (iso) =>
  new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));

/** "I dag", "I morgen", "Om 5 dager". */
export function relativeDay(isoDay, today = todayInNorway()) {
  const days = Math.round((asDate(isoDay) - asDate(today)) / 86_400_000);
  if (days === 0) return "I dag";
  if (days === 1) return "I morgen";
  return `Om ${days} dager`;
}

/**
 * Tiny element builder. Strings become text nodes (never HTML), so feed content can't inject markup.
 * el("a", { class: "x", href }, "text", childNode)
 */
export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [name, value] of Object.entries(attrs)) {
    if (value !== false && value != null) node.setAttribute(name, value === true ? "" : value);
  }
  node.append(...children.filter((c) => c != null && c !== false));
  return node;
}

/**
 * A deadline as a link: date block, title, relative time and (optionally) the audience pill.
 * "card" for the front-page row; "row" for the full list on aktuelt.html, where the active
 * filter already says the audience, so the pill is left out.
 */
export function deadlineCard(deadline, today, { variant = "card" } = {}) {
  const showAudience = variant === "card";
  return el(
    "a",
    { class: `deadline deadline--${variant}`, href: deadline.url, rel: "noopener" },
    el(
      "time",
      { class: "deadline__date", datetime: deadline.date, "aria-label": longDate(deadline.date) },
      el("span", { class: "deadline__day", "aria-hidden": "true" }, dayOfMonth(deadline.date)),
      el("span", { class: "deadline__month", "aria-hidden": "true" }, shortMonth(deadline.date)),
    ),
    el(
      "span",
      { class: "deadline__body" },
      el("span", { class: "deadline__title" }, deadline.title),
      el(
        "span",
        { class: "deadline__meta" },
        showAudience && el("span", { class: `pill pill--${deadline.audience}` }, AUDIENCE_LABEL[deadline.audience] ?? deadline.audience),
        el("span", {}, relativeDay(deadline.date, today)),
      ),
    ),
  );
}
