"""Local dev server for the static site (npm run dev → http://localhost:4321).

Same as `python3 -m http.server`, but sends `Cache-Control: no-store`, so the browser never
shows stale HTML, CSS, JS or data/*.json while you work.
"""

import functools
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 4321


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


if __name__ == "__main__":
    handler = functools.partial(NoCacheHandler, directory=str(ROOT))
    with ThreadingHTTPServer(("", PORT), handler) as server:
        print(f"Serving {ROOT} at http://localhost:{PORT} (no caching)")
        server.serve_forever()
