# tom.giles.fr

Portfolio personnel. Site statique, déployé par GitHub Pages depuis `main`.
Objectif : décrocher un stage de pré-embauche de 6 mois à partir de février 2027
(Platform / Cloud / SRE / DevOps).

## Structure

```
index.html                     accueil FR
en/index.html                  accueil EN
projects/<slug>/index.html     pages projet FR   → /projects/siops
en/projects/<slug>/index.html  pages projet EN   → /en/projects/siops
assets/style.css               feuille de style unique
assets/main.js                 cluster animé, mise en scène au scroll, filtres, terminal (touche /)
cv/                            CV PDF (FR et EN)
sitemap.xml  robots.txt  404.html  CNAME
```

Aucun build n'est nécessaire pour déployer : tout ce qui est servi est du HTML
statique commité dans le dépôt.

## Éditer les pages projet

Les pages sous `projects/` et `en/projects/` sont **générées**. Ne pas les éditer
directement : les modifications sont dans `_build/`.

```
_build/content_fr.py   contenu FR (un dict par projet)
_build/content_en.py   contenu EN
_build/shell.py        ossature commune (head, header, footer)
_build/home.py         accueil FR + EN (textes, projets, stack)
_build/build.py        génère l'accueil, les pages projet + sitemap.xml
```

Régénérer après modification :

```sh
python3 _build/build.py
```

L'accueil (`index.html`, `en/index.html`) est généré depuis `_build/home.py` ; `404.html` est écrit à la main.

## Accueil

- Tout le contenu (FR et EN) est dans `_build/home.py`. Ne pas éditer `index.html`
  ni `en/index.html` directement, puis relancer `python3 _build/build.py`.
- Descriptions des projets : remplir `"desc"` dans `PROJECTS` (clés `fr` et `en`).
  Tant qu'elle vaut `None`, la carte affiche un emplacement « à rédiger ».
- `stack` de chaque projet alimente le compteur « utilisé dans N projets » de la
  section Stack : les noms doivent correspondre exactement à ceux de `STACK`.
- `cat` (`platform`, `sre`, `software`, `consulting`, `product`) pilote les filtres ;
  `/#sre`, `/#platform`… ouvrent l'accueil avec le filtre appliqué.
- Le site est volontairement toujours en thème sombre (fond noir).

## Règles de contenu

- Chaque projet suit le squelette **Contexte → Rôle → Stack → Ce que j'ai fait → Résultat**.
- Un chiffre par projet minimum, jamais inventé. Une métrique non sourçable est marquée
  `[TODO: métrique]` et rendue visiblement dans la page — elle se remplace, elle ne
  s'invente pas.
- Pas de barres de compétences en pourcentage, pas de nuage de tags décoratif.
- Voix active, phrases courtes, ton factuel.

## Reste à faire

- [ ] Déposer `cv/tom-giles-cv.pdf` et `cv/tom-giles-cv-en.pdf`
- [ ] Générer `assets/og.png` (1200×630) pour les aperçus de partage
- [ ] Remplacer les `[TODO: métrique]` par de vrais chiffres
- [ ] Rédiger les descriptions des cartes projet de l'accueil (FR + EN)
