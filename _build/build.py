#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Génère l'accueil (_build/home.py) et les pages projet (_build/content_*.py).

    python3 _build/build.py

La sortie (projects/<slug>/index.html et en/projects/<slug>/index.html) est du HTML
pur, commité dans le dépôt et servi tel quel par GitHub Pages. Aucun build n'est
nécessaire pour déployer — ce script n'est qu'un outil d'édition.
ATTENTION : il écrase l'accueil et les pages projet. Éditer le contenu dans _build/, pas dans
projects/.
"""
import os
import sys
import datetime

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)

import shell  # noqa: E402
import home  # noqa: E402

LANGS = {}
try:
    import content_fr
    LANGS["fr"] = content_fr.PAGES
except ImportError:
    pass
try:
    import content_en
    LANGS["en"] = content_en.PAGES
except ImportError:
    pass


def write(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as fh:
        fh.write(text)
    return path


def main():
    written = []
    for lang, pages in LANGS.items():
        base = ROOT if lang == "fr" else os.path.join(ROOT, "en")
        for slug, page in pages.items():
            out = os.path.join(base, "projects", slug, "index.html")
            written.append(write(out, shell.render(lang, slug, page)))

    # accueil
    written.append(write(os.path.join(ROOT, "index.html"), home.render("fr")))
    written.append(write(os.path.join(ROOT, "en", "index.html"), home.render("en")))

    # sitemap
    urls = ["/", "/en/"]
    for slug in LANGS.get("fr", {}):
        urls.append("/projects/%s/" % slug)
    for slug in LANGS.get("en", {}):
        urls.append("/en/projects/%s/" % slug)

    today = datetime.date.today().isoformat()
    lines = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for u in urls:
        lines.append("  <url><loc>%s%s</loc><lastmod>%s</lastmod></url>" % (shell.SITE, u, today))
    lines.append("</urlset>")
    written.append(write(os.path.join(ROOT, "sitemap.xml"), "\n".join(lines) + "\n"))

    for p in written:
        print(os.path.relpath(p, ROOT))
    print("\n%d fichiers générés." % len(written))


if __name__ == "__main__":
    main()
