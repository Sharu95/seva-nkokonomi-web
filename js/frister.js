// "Kommende frister" on the front page: the next few deadlines from Skatteetaten's tax calendar,
// filterable Bedrift/Person (Bedrift first). The strip ships hidden and only appears when there is
// something worth showing, so missing data, a failed request or no JS simply means no strip.
import { AUDIENCE_LABEL, CALENDAR_URL, deadlineCard, el, loadItems, todayInNorway, upcoming } from "./feeds.js";

const SHOWN = 5;
const MIN_PER_AUDIENCE = 2; // a filter with fewer upcoming deadlines than this is left out

const root = document.querySelector("[data-frister]");

if (root) {
  const items = await loadItems("data/frister.json");
  if (items) render(items);
}

function render(items) {
  const today = todayInNorway();
  const byAudience = Object.fromEntries(
    Object.keys(AUDIENCE_LABEL).map((audience) => [audience, upcoming(items.filter((d) => d.audience === audience), today)]),
  );
  const audiences = Object.keys(byAudience).filter((a) => byAudience[a].length >= MIN_PER_AUDIENCE);
  if (!audiences.length) return;

  const list = root.querySelector("[data-frister-list]");
  const filter = root.querySelector("[data-frister-filter]");
  const source = root.querySelector("[data-frister-source]");

  const show = (audience) => {
    list.replaceChildren(...byAudience[audience].slice(0, SHOWN).map((d) => el("li", {}, deadlineCard(d, today))));
    list.scrollLeft = 0;
    source.href = CALENDAR_URL[audience];
    for (const button of filter.querySelectorAll("button")) {
      button.setAttribute("aria-pressed", String(button.dataset.audience === audience));
    }
  };

  // Only offer the filters that have enough deadlines; a single one needs no filter at all.
  for (const button of filter.querySelectorAll("button")) {
    button.hidden = !audiences.includes(button.dataset.audience);
    button.addEventListener("click", () => show(button.dataset.audience));
  }
  filter.hidden = audiences.length < 2;

  show(audiences[0]); // AUDIENCE_LABEL order puts Bedrift first
  root.hidden = false;
}
