"""Fetch Skatteetaten's RSS feeds and write them as static JSON that the pages read at runtime.

Skatteetaten does not allow cross-origin browser requests (CORS), so this runs in CI
(.github/workflows/feeds.yml, daily) and the result is committed to the repo.
Usage: python3 scripts/fetch_feeds.py   (or: npm run feeds). Standard library only.

Robustness: a feed that fails or parses to nothing leaves its JSON file untouched, so the site keeps
the last good data. A file is only rewritten when its items changed, so unchanged runs commit nothing.
"""

import html
import json
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor
from datetime import date, datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
BASE = "https://www.skatteetaten.no/rss/"
TIMEOUT_S = 20
USER_AGENT = "nkokonomi.no feed fetcher (+https://nkokonomi.no)"

CALENDARS = {
    "bedrift": f"{BASE}skattekalender-for-bedrift/",
    "person": f"{BASE}skattekalender-for-person/",
}
NEWS = {
    "arbeidsgiver": f"{BASE}bedrift/arbeidsgiver/a-meldingen/siste-fra-a-ordningen/",
    "systemleverandor": f"{BASE}sbs/a-meldingen/",
}
NEWS_LIMIT = 20
# Keep deadlines from a little before today; the pages filter out past dates themselves.
DEADLINE_LOOKBACK_DAYS = 7

# "Kalenderhendelse: Friday, 31 January 2025". pubDate is a UTC timestamp that lands on the
# wrong calendar day in summer, so deadlines use the date written in the description.
CALENDAR_DATE = re.compile(r"(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})")
MONTHS = ["january", "february", "march", "april", "may", "june",
          "july", "august", "september", "october", "november", "december"]
# "Skattekort - Skattekort - nytt skattekort sendes ut" → "Skattekort - nytt skattekort sendes ut"
REPEATED_PREFIX = re.compile(r"^(.+?) - \1 - ")
SAFE_URL = re.compile(r"^https://www\.skatteetaten\.no/")


def plain_text(value):
    """Text only: decode entities, drop any markup, collapse whitespace."""
    without_tags = re.sub(r"<[^>]*>", " ", html.unescape(value or ""))
    return " ".join(html.unescape(without_tags).split())


def fetch_items(url):
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=TIMEOUT_S) as response:
        root = ET.fromstring(response.read())
    items = [
        {field: plain_text(item.findtext(field)) for field in ("title", "link", "description", "pubDate")}
        for item in root.iter("item")
    ]
    if not items:
        raise ValueError(f"{url}: no items")
    return items


def calendar_date(description):
    match = CALENDAR_DATE.search(description)
    if not match or match.group(2).lower() not in MONTHS:
        return None
    day, month, year = int(match.group(1)), MONTHS.index(match.group(2).lower()) + 1, int(match.group(3))
    return date(year, month, day).isoformat()


def unique(items, key):
    seen = set()
    return [item for item in items if not (key(item) in seen or seen.add(key(item)))]


def build_deadlines():
    cutoff = (date.today() - timedelta(days=DEADLINE_LOOKBACK_DAYS)).isoformat()
    deadlines = [
        {
            "title": REPEATED_PREFIX.sub(r"\1 - ", item["title"]),
            "date": calendar_date(item["description"]),
            "url": item["link"],
            "audience": audience,
        }
        for audience, items in fetch_all(CALENDARS).items()
        for item in items
    ]
    valid = [d for d in deadlines if d["title"] and d["date"] and SAFE_URL.match(d["url"]) and d["date"] >= cutoff]
    valid = unique(valid, key=lambda d: (d["audience"], d["date"], d["title"]))
    return sorted(valid, key=lambda d: (d["date"], d["title"]))


def build_news():
    news = [
        {
            "title": item["title"],
            "summary": item["description"],
            "date": parsedate_to_datetime(item["pubDate"]).astimezone(timezone.utc).isoformat() if item["pubDate"] else None,
            "url": item["link"],
            "source": source,
        }
        for source, items in fetch_all(NEWS).items()
        for item in items
    ]
    valid = [n for n in news if n["title"] and n["date"] and SAFE_URL.match(n["url"])]
    valid = unique(valid, key=lambda n: n["url"])
    return sorted(valid, key=lambda n: n["date"], reverse=True)[:NEWS_LIMIT]


def fetch_all(feeds):
    """Fetch {name: url} in parallel; any failure raises, so a partial result is never written."""
    with ThreadPoolExecutor() as pool:
        results = dict(zip(feeds, pool.map(fetch_items, feeds.values())))
    return results


def write_if_changed(filename, items):
    path = DATA_DIR / filename
    try:
        previous = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        previous = None
    if previous and previous.get("items") == items:
        print(f"{filename}: unchanged ({len(items)} items)")
        return
    body = {
        "updated": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "source": "Skatteetaten",
        "items": items,
    }
    DATA_DIR.mkdir(exist_ok=True)
    path.write_text(json.dumps(body, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{filename}: wrote {len(items)} items")


def main():
    failed = False
    for filename, build in (("frister.json", build_deadlines), ("a-ordningen.json", build_news)):
        try:
            write_if_changed(filename, build())
        except Exception as error:  # noqa: BLE001 - keep the last good file for any failure
            failed = True
            print(f"{filename}: kept previous data. {error}", file=sys.stderr)
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
