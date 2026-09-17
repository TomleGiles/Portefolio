"""Ossature commune des pages projet. Sortie : HTML statique pur, sans dépendance runtime."""

SITE = "https://tom.giles.fr"

STRINGS = {
    "fr": {
        "lang": "fr",
        "locale": "fr_FR",
        "alt_locale": "en_GB",
        "home": "/",
        "other_home": "/en/",
        "proj_prefix": "/projects/",
        "other_proj_prefix": "/en/projects/",
        "skip": "Aller au contenu",
        "tagline": "platform &amp; cloud",
        "toggle": "Sombre",
        "back": "Retour",
        "contact_btn": "Me contacter",
        "cv_btn": "Télécharger le CV (PDF)",
        "footer_id": "Tom Giles — EPITA SIGL 2027",
        "footer_other": "English version",
        "mail_subject": "Stage%206%20mois%20%E2%80%94%20f%C3%A9vrier%202027",
        "role": "Rôle",
        "period": "Période",
        "scope": "Périmètre",
        "core": "Stack principale",
    },
    "en": {
        "lang": "en",
        "locale": "en_GB",
        "alt_locale": "fr_FR",
        "home": "/en/",
        "other_home": "/",
        "proj_prefix": "/en/projects/",
        "other_proj_prefix": "/projects/",
        "skip": "Skip to content",
        "tagline": "platform &amp; cloud",
        "toggle": "Dark",
        "back": "Back",
        "contact_btn": "Get in touch",
        "cv_btn": "Download CV (PDF)",
        "footer_id": "Tom Giles — EPITA SIGL, class of 2027",
        "footer_other": "Version française",
        "mail_subject": "6-month%20internship%20%E2%80%94%20from%20February%202027",
        "role": "Role",
        "period": "Period",
        "scope": "Scope",
        "core": "Core stack",
    },
}

PROJECT_TEMPLATE = """<!doctype html>
<html lang="{lang}" prefix="og: https://ogp.me/ns#">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} — Tom Giles</title>
<meta name="description" content="{description}">
<link rel="canonical" href="{site}{path}">
<link rel="alternate" hreflang="fr" href="{site}{fr_path}">
<link rel="alternate" hreflang="en" href="{site}{en_path}">
<link rel="alternate" hreflang="x-default" href="{site}{fr_path}">
<meta property="og:type" content="article">
<meta property="og:locale" content="{locale}">
<meta property="og:locale:alternate" content="{alt_locale}">
<meta property="og:url" content="{site}{path}">
<meta property="og:site_name" content="Tom Giles">
<meta property="og:title" content="{title} — Tom Giles">
<meta property="og:description" content="{description}">
<meta property="og:image" content="{site}/assets/og.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#F5F7F8" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0B1015" media="(prefers-color-scheme: dark)">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/assets/style.css">
<script>try{{var t=localStorage.getItem("theme");if(t)document.documentElement.setAttribute("data-theme",t)}}catch(e){{}}</script>
</head>

<body>
<a class="skip-link" href="#main">{skip}</a>

<header class="topbar">
  <a class="topbar__id" href="{home}">tom giles <span class="dim">/ {tagline}</span></a>
  <div class="topbar__tools">
    <a class="btn-ghost" href="{fr_path}"{fr_current} hreflang="fr">FR</a>
    <a class="btn-ghost" href="{en_path}"{en_current} hreflang="en">EN</a>
    <button class="btn-ghost" type="button" data-theme-toggle>{toggle}</button>
  </div>
</header>

<main class="project" id="main">
  <p class="crumb"><a href="{home}#{anchor}">{back} — {section_label}</a></p>

  <h1 class="project__title">{title}</h1>
  <p class="project__sub">{subtitle}</p>

  <dl class="meta">
{meta_rows}  </dl>

{body}

  <div class="project-nav">
    <a class="btn btn--primary" href="mailto:tom.giles@epita.fr?subject={mail_subject}">{contact_btn}</a>
    <a class="btn btn--ghost" href="{home}#{anchor}">{back}</a>
  </div>
</main>

<footer class="site-footer">
  <div class="site-footer__inner">
    <span>{footer_id}</span>
    <span><a href="mailto:tom.giles@epita.fr">tom.giles@epita.fr</a> · <a href="{other_home}">{footer_other}</a></span>
  </div>
</footer>

<script src="/assets/main.js" defer></script>
</body>
</html>
"""


def meta_rows(pairs):
    out = []
    for k, v in pairs:
        out.append("    <div><dt>%s</dt><dd>%s</dd></div>\n" % (k, v))
    return "".join(out)


def render(lang, slug, page):
    s = STRINGS[lang]
    fr_path = "/projects/%s/" % slug
    en_path = "/en/projects/%s/" % slug
    path = fr_path if lang == "fr" else en_path
    return PROJECT_TEMPLATE.format(
        site=SITE,
        path=path,
        fr_path=fr_path,
        en_path=en_path,
        fr_current=' aria-current="true"' if lang == "fr" else "",
        en_current=' aria-current="true"' if lang == "en" else "",
        lang=s["lang"],
        locale=s["locale"],
        alt_locale=s["alt_locale"],
        skip=s["skip"],
        home=s["home"],
        other_home=s["other_home"],
        tagline=s["tagline"],
        toggle=s["toggle"],
        back=s["back"],
        contact_btn=s["contact_btn"],
        mail_subject=s["mail_subject"],
        footer_id=s["footer_id"],
        footer_other=s["footer_other"],
        title=page["title"],
        subtitle=page["subtitle"],
        description=page["description"],
        anchor=page["anchor"],
        section_label=page["section_label"],
        meta_rows=meta_rows(page["meta"]),
        body=page["body"],
    )
