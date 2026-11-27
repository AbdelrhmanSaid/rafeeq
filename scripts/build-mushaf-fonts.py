"""Fetches the 604 page fonts the Quran reader draws the Mushaf with, into public/fonts/mushaf.

They are the King Fahd Complex V4 fonts that Quran.com serves, which pair with the layout scripts/build-mushaf-data.js
builds. V4 colours its letters by the rules of tajweed. The reader shows the plain Mushaf, so the colour tables (COLR
and CPAL) are taken out and each glyph falls back to its plain outline, drawn in the text colour.

    python3 -m pip install fonttools brotli
    python3 scripts/build-mushaf-fonts.py [raw-dir]

raw-dir keeps the downloaded fonts (default: node_modules/.cache/mushaf-fonts-v4), so a rebuild doesn't refetch them.
"""

import sys
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
RAW = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / 'node_modules/.cache/mushaf-fonts-v4'
OUT = ROOT / 'public/fonts/mushaf'
SOURCE = 'https://quran.com/fonts/quran/hafs/v4/colrv1/woff2/p{}.woff2'
PAGES = 604


def fetch(page):
    file = RAW / f'p{page}.woff2'
    if file.exists():
        return file
    for attempt in range(1, 5):
        try:
            # The site turns away Python's default client name.
            request = urllib.request.Request(SOURCE.format(page), headers={'User-Agent': 'mushaf-fonts-build/1.0'})
            with urllib.request.urlopen(request, timeout=30) as response:
                data = response.read()
            if data[:4] != b'wOF2':
                raise ValueError('not a WOFF2 file')
            file.write_bytes(data)
            return file
        except Exception as error:
            if attempt == 4:
                raise RuntimeError(f'Page {page}: {error}') from error
            time.sleep(attempt)


def build(page):
    font = TTFont(fetch(page))
    for table in ('COLR', 'CPAL'):
        if table in font:
            del font[table]
    font.flavor = 'woff2'
    font.save(OUT / f'p{page}.woff2')


RAW.mkdir(parents=True, exist_ok=True)
OUT.mkdir(parents=True, exist_ok=True)
with ThreadPoolExecutor(4) as pool:
    list(pool.map(build, range(1, PAGES + 1)))

size = sum(f.stat().st_size for f in OUT.glob('p*.woff2'))
print(f'Wrote {PAGES} fonts ({size / 1024 / 1024:.1f} MB).')
