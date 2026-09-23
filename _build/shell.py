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
        "toggle": "Changer de thème",
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
        "toggle": "Toggle theme",
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
<meta name="theme-color" content="#F3F5F6" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#06080B" media="(prefers-color-scheme: dark)">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Geist:wght@400..700&family=Geist+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="/assets/style.css">
<script>try{{var t=localStorage.getItem("theme");if(t)document.documentElement.setAttribute("data-theme",t)}}catch(e){{}}</script>
</head>

<body>
<a class="skip-link" href="#main">{skip}</a>
<div class="progress" aria-hidden="true"></div>
<div class="glow" aria-hidden="true"></div>

<header class="topbar">
  <div class="wrap topbar__inner">
    <a class="logo" href="{home}">
      <span class="logo__mark" aria-hidden="true">&gt;_</span>
      <span class="logo__text">tom.giles<span class="dim">.fr</span></span>
    </a>
    <div class="tools">
      <a class="chip-btn chip-btn--lang" href="{fr_path}"{fr_current} hreflang="fr">FR</a>
      <a class="chip-btn chip-btn--lang" href="{en_path}"{en_current} hreflang="en">EN</a>
      <button class="chip-btn chip-btn--icon" type="button" data-theme-toggle aria-label="{toggle}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
      </button>
    </div>
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
  <div class="wrap site-footer__inner">
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
