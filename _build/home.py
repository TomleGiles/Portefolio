# -*- coding: utf-8 -*-
"""Page d'accueil (FR + EN) générée depuis un seul gabarit.

Pour écrire la description d'un projet : remplir "desc" dans PROJECTS ci-dessous
(clé "fr" et "en"), puis relancer  python3 _build/build.py
Tant que "desc" vaut None, la carte affiche un emplacement « à rédiger ».
"""

SITE = "https://tom.giles.fr"
LINKEDIN = "https://www.linkedin.com/in/giles-tom/"
LI_ICON = ('<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/></svg>')
ARROW = ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
         'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>')
PLUS = ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
        'stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>')

# ──────────────────────────────────────────────────────────────── projets
# stack : noms reliés à la section Stack (doivent correspondre aux libellés de STACK)
# visual : "nodes" (grille du cluster), "meter" (jauge mémoire) ou None
PROJECTS = [
    {
        "slug": "siops", "cat": "sre", "visual": "nodes",
        "stack": ["Kubernetes", "RKE2", "OpenStack", "ArgoCD", "Helm", "HashiCorp Vault",
                  "Prometheus", "Grafana", "Loki", "FastAPI"],
        "chips": ["RKE2", "OpenStack", "ArgoCD", "Helm", "Vault", "Prometheus", "Loki"],
        "fr": {"title": "SIOPS — plateforme Kubernetes de production",
               "tag": "Product Owner · équipe de 5 · portail GitOps Cassiopée", "desc": "L'équipe SRE qui opère le cluster Kubernetes de production de la majeure. Je tiens le backlog, j'arbitre ce qui passe — et je suis dans les logs quand ça casse. Avec Cassiopée, un environnement complet se déploie par commit, sans passer par l'équipe plateforme."},
        "en": {"title": "SIOPS — production Kubernetes platform",
               "tag": "Product Owner · team of 5 · Cassiopée GitOps portal", "desc": "The SRE team running the major's production Kubernetes cluster. I own the backlog, decide what ships — and I'm in the logs when it breaks. With Cassiopée, a complete environment deploys from a single commit, with no platform team in the loop."},
    },
    {
        "slug": "arcl", "cat": "platform", "visual": None,
        "stack": ["Azure", "OpenTofu", "OpenStack", "WireGuard", "PostgreSQL", "Patroni"],
        "chips": ["Azure", "OpenTofu", "WireGuard", "Patroni"],
        "fr": {"title": "ARCL — architecture hybride résiliente", "tag": "Azure × cloud privé", "desc": "Un socle self-service qui reste debout quand l'un des deux clouds tombe. Azure porte les frontaux, OpenStack porte l'état, un tunnel WireGuard relie les deux et Patroni bascule PostgreSQL sans intervention humaine. Tout est décrit en OpenTofu : reconstructible depuis zéro."},
        "en": {"title": "ARCL — resilient hybrid architecture", "tag": "Azure × private cloud", "desc": 'A self-service platform that stays up when either cloud goes down. Azure carries the front ends, OpenStack carries the state, a WireGuard tunnel joins them and Patroni fails PostgreSQL over with no human involved. Everything is described in OpenTofu: rebuildable from scratch.'},
    },
    {
        "slug": "cnp", "cat": "platform", "visual": None,
        "stack": ["Python", "FastAPI", "PostgreSQL", "GitHub Actions", "Kubernetes", "Azure", "Docker"],
        "chips": ["FastAPI", "GitHub App", "AKS", "GHCR"],
        "fr": {"title": "CNP — Internal Developer Platform", "tag": "Repository-first", "desc": "Une plateforme interne où le chemin standard devient le plus rapide. Une GitHub App installe le pipeline dans le dépôt, publie l'image sur GHCR et déploie sur AKS. Une équipe passe du dépôt vide au premier déploiement sans écrire une ligne de pipeline."},
        "en": {"title": "CNP — Internal Developer Platform", "tag": "Repository-first", "desc": 'An internal platform where the standard path is also the fastest one. A GitHub App installs the pipeline in the repository, publishes the image to GHCR and deploys to AKS. A team goes from empty repo to first deployment without writing a line of pipeline.'},
    },
    {
        "slug": "ipsos", "cat": "software", "visual": "meter",
        "stack": ["C# / .NET", "SQL Server", "Python"],
        "chips": ["C#", "ASP.NET", "Open XML SDK", "SQL Server"],
        "fr": {"title": "Ipsos — refonte du moteur d'export Excel",
               "tag": "Global BI · sept. 2025 – janv. 2026", "desc": "Le moteur d'export Excel d'un portail financier utilisé dans plus de 90 pays crashait au-delà de 50 000 lignes. Réécrit en streaming pur — Open XML SDK en mode SAX, lecture séquentielle, écriture directe sur disque : 1 million de lignes en ~2 minutes."},
        "en": {"title": "Ipsos — rebuilding the Excel export engine",
               "tag": "Global BI · Sept 2025 – Jan 2026", "desc": 'The Excel export engine of a finance portal used in 90+ countries crashed past 50,000 rows. Rewritten as pure streaming — Open XML SDK in SAX mode, sequential reads, direct writes to disk: 1 million rows in ~2 minutes.'},
    },
    {
        "slug": "ubsi", "cat": "platform", "visual": None,
        "stack": ["FastAPI", "Python", "PostgreSQL", "RabbitMQ", "Docker", "GitLab CI",
                  "Prometheus", "Grafana", "Loki"],
        "chips": ["GitLab CI", "RabbitMQ", "Prometheus", "Grafana", "Loki"],
        "fr": {"title": "UBSI — leadership DevOps multi-équipes",
               "tag": "Pilotage du workstream DevOps · 50 participants", "desc": "Le SI d'une compagnie aérienne miniature, construit par 50 participants. J'ai piloté le socle commun : conventions d'API, CI/CD GitLab, observabilité Prometheus / Grafana / Loki et bus RabbitMQ. Un standard n'est adopté que s'il est plus rapide à suivre qu'à contourner."},
        "en": {"title": "UBSI — multi-team DevOps leadership",
               "tag": "DevOps workstream lead · 50 participants", "desc": 'The information system of a miniature airline, built by 50 participants. I led the shared foundation: API conventions, GitLab CI/CD, Prometheus / Grafana / Loki observability and a RabbitMQ bus. A standard only gets adopted if following it is faster than working around it.'},
    },
    {
        "slug": "danone", "cat": "consulting", "visual": None,
        "stack": ["SAP S/4HANA"],
        "chips": ["SAP S/4HANA", "Finance"],
        "fr": {"title": "Danone — architecture SAP S/4HANA Finance", "tag": "Architecture cible", "desc": "Cadrage d'une transformation Finance sur SAP S/4HANA : socle conceptuel du domaine, cartographie des flux financiers et des interfaces, puis un deck d'architecture cible défendu devant jury, face à des interlocuteurs métier autant que techniques."},
        "en": {"title": "Danone — SAP S/4HANA Finance architecture", "tag": "Target architecture", "desc": 'Scoping a Finance transformation on SAP S/4HANA: conceptual foundation of the domain, mapping of financial flows and interfaces, then a target architecture deck defended before a panel — to business stakeholders as much as technical ones.'},
    },
    {
        "slug": "beblood", "cat": "consulting", "visual": None,
        "stack": ["Oracle HCM", "Monte-Carlo"],
        "chips": ["Oracle HCM", "Monte-Carlo P80"],
        "fr": {"title": "BeBlood — transformation SIRH", "tag": "Oracle HCM · chiffrage Monte-Carlo", "desc": "Transformation SIRH sur Oracle HCM. Plutôt qu'un chiffre unique sorti d'un tableur, une estimation de charge par simulation Monte-Carlo au P80 — une fourchette défendable avec son niveau de confiance — et le registre des risques du workstream."},
        "en": {"title": "BeBlood — HRIS transformation", "tag": "Oracle HCM · Monte-Carlo estimation", "desc": "HRIS transformation on Oracle HCM. Instead of a single number pulled from a spreadsheet, an effort estimate by Monte-Carlo simulation at P80 — a defensible range with its confidence level — plus the workstream's risk register."},
    },
    {
        "slug": "ebios", "cat": "consulting", "visual": None,
        "stack": ["EBIOS Risk Manager"],
        "chips": {"fr": ["EBIOS RM", "Analyse de risques"], "en": ["EBIOS RM", "Risk analysis"]},
        "fr": {"title": "Analyse de risques EBIOS RM", "tag": "Sécurité", "desc": 'Démarche EBIOS Risk Manager complète sur un SI cible, du cadrage au plan de traitement. La méthode force à nommer un attaquant, son objectif et son chemin — et à tenir le lien entre la menace réelle et la mesure technique.'},
        "en": {"title": "EBIOS RM risk assessment", "tag": "Security", "desc": 'A full EBIOS Risk Manager assessment on a target information system, from scoping to the treatment plan. The method forces you to name an attacker, their objective and their path — and to keep the link between the real threat and the technical control.'},
    },
    {
        "slug": "lendr", "cat": "product", "visual": None,
        "stack": [],
        "chips": {"fr": ["Business model", "BOM hardware", "Modèle financier"],
                  "en": ["Business model", "Hardware BOM", "Financial model"]},
        "fr": {"title": "Lendr — casiers connectés vérifiés par IA", "tag": "Startup B2B cofondée", "desc": "Un casier connecté qui vérifie par IA l'état du matériel à son retour. Premier marché scolaire trop peu solvable : repositionnement vers le field service industriel. J'ai construit le BOM hardware, le modèle financier à 5 ans et le pitch investisseurs."},
        "en": {"title": "Lendr — smart lockers with AI checks", "tag": "Co-founded B2B startup", "desc": "A connected locker that uses AI to check equipment condition on return. The first market, schools, couldn't pay: we repositioned towards industrial field service. I built the hardware BOM, the 5-year financial model and the investor pitch."},
    },
]

CATS = {
    "fr": {"platform": "Platform & Cloud", "sre": "Production & SRE", "software": "Software",
           "consulting": "Consulting & SI", "product": "Product"},
    "en": {"platform": "Platform & Cloud", "sre": "Production & SRE", "software": "Software",
           "consulting": "Consulting & IS", "product": "Product"},
}

STACK = [
    ({"fr": "Infra & Cloud", "en": "Infra & Cloud"},
     ["Kubernetes", "RKE2", "OpenStack", "Azure", "OpenTofu", "Ansible", "WireGuard"]),
    ({"fr": "GitOps & CI/CD", "en": "GitOps & CI/CD"},
     ["ArgoCD", "Helm", "GitLab CI", "GitHub Actions", "Kaniko", "Docker"]),
    ({"fr": "Sécurité & secrets", "en": "Security & secrets"},
     ["HashiCorp Vault", "Boundary", "OIDC", "EBIOS Risk Manager"]),
    ({"fr": "Observabilité", "en": "Observability"},
     ["Prometheus", "Grafana", "Loki", "Alloy", "Gatus"]),
    ({"fr": "Développement", "en": "Development"},
     ["Python", "FastAPI", "C# / .NET", "Java / Quarkus", "React", "PostgreSQL", "RabbitMQ"]),
    ({"fr": "SI & conseil", "en": "IS & consulting"},
     ["SAP S/4HANA", "Oracle HCM", "ITIL / COBIT", "Monte-Carlo"]),
]

# ──────────────────────────────────────────────────────────────── textes
T = {}
T["fr"] = {
    "lang": "fr", "locale": "fr_FR", "alt_locale": "en_GB", "path": "/", "other": "/en/", "other_label": "EN",
    "other_aria": "English version", "proj": "/projects/", "cv": "/cv/tom-giles-cv.pdf",
    "title": "Tom Giles — Platform &amp; Cloud / SRE — Stage 6 mois dès février 2027",
    "meta": "Tom Giles, EPITA SIGL 2027. Product Owner d'une équipe SRE opérant un cluster RKE2 de production sur OpenStack. Recherche un stage de pré-embauche de 6 mois à partir de février 2027.",
    "og": "J'opère un cluster Kubernetes de production avec de vrais clients — et je sais le chiffrer, le piloter et le défendre devant eux. Stage 6 mois dès février 2027.",
    "job": "Étudiant-ingénieur — Platform & Cloud / SRE",
    "ld": "Product Owner de l'équipe SRE SIOPS, opérant un cluster RKE2 de production sur OpenStack. Recherche un stage de pré-embauche de 6 mois à partir de février 2027.",
    "school": "EPITA — majeure SIGL",
    "skip": "Aller au contenu", "home_aria": "Tom Giles — accueil",
    "nav": [("projets", "Projets"), ("incidents", "Incidents"), ("parcours", "Parcours"), ("stack", "Stack"), ("contact", "Contact")],
    "boot": ["[ ok ] etcd quorum 3/3", "[ ok ] kube-apiserver ready", "[ ok ] argocd sync 60/60", "[ ok ] tom.giles.fr — online"],
    "status": "Disponible · stage 6 mois dès fév. 2027",
    "roles": "Platform Engineer|Site Reliability Engineer|Product Owner SRE|Cloud &amp; DevOps",
    "hero_sub": "Platform · Cloud · SRE",
    "cta1": "Voir les projets", "cta2": "Télécharger le CV",
    "scroll": "Défiler",
    "statement": "J'opère un cluster Kubernetes de production. Avec de vrais clients. Je le chiffre, je le pilote, je le défends devant eux. Et quand il casse à trois heures du matin, je suis dans les logs.",
    "statement_label": "Manifeste",
    "numbers": [
        ("6", "", "nœuds", "RKE2 v1.32 sur OpenStack, opérés à cinq."),
        ("60", "~", "applications", "réconciliées en continu par ArgoCD."),
        ("4", "", "clients", "hébergés en production et en staging."),
        ("90", "%", "de stockage en moins", "486 → 48 GiB de sauvegardes après un post-mortem."),
    ],
    "band": "PLATFORM — SRE — CLOUD — DEVOPS — GITOPS — ",
    "proj_eyebrow": "Projets sélectionnés", "proj_title": "Ce que j'ai <em>construit</em>.",
    "proj_lede": "De l'infrastructure à la production, du code au conseil. Faites défiler — chaque projet a sa page.",
    "filter_aria": "Filtrer les projets", "all": "Tous",
    "todo_label": "Description à rédiger", "todo_text": "Description du projet à venir.",
    "stats": [("6", "nœuds"), ("~60", "apps ArgoCD"), ("4", "clients")],
    "meter_aria": "Mémoire : 3 à 4 Go avant, 100 à 200 Mo après",
    "meter": [("avant", "3–4 Go"), ("après", "100–200 Mo")],
    "see": "Voir le projet",
    "inc_eyebrow": "Post-mortems", "inc_title": "Quand ça <em>casse</em> pour de vrai.",
    "inc_lede": "Trois incidents vécus sur le cluster SIOPS. Symptôme, diagnostic, correctif, leçon — sans filtre.",
    "inc_keys": ["Symptôme", "Diagnostic", "Correctif", "Leçon"],
    "incidents": [
        ("INC-01 · SEV1", "1", "Le cluster se bloque lui-même au redémarrage", "control plane · etcd", [
            "master-1 injoignable, API server instable, cluster en fonctionnement dégradé.",
            "Nœud sous-dimensionné : l'<strong>OOM killer tue etcd</strong>, le quorum tombe à 2/3. <code>rke2-server</code> attend kubelet, qui attend etcd. Interblocage.",
            "<code>rke2-killall</code> pour casser la boucle, redémarrage propre, puis redimensionnement du master.",
            "Un control plane ne se dimensionne pas comme un worker."]),
        ("INC-02 · SEV1", "1", "Trois semaines sans sauvegarde, et les jobs étaient verts", "backups · restic · S3", [
            "Aucun snapshot récent. Les jobs remontaient pourtant en succès.",
            "Quota S3 saturé. <strong>486 GiB, 349 snapshots jamais purgés</strong> : la date dans le nom de dump cassait la rétention.",
            "<code>forget --group-by host</code> + <code>prune</code> : <strong>486 → 48 GiB</strong>. Script durci avec <code>set -euo pipefail</code>.",
            "Un job vert ne prouve rien. On surveille l'âge du dernier snapshot restaurable."]),
        ("INC-03 · SEV2", "2", "La chaîne de descellement Vault se mord la queue", "secrets · Vault · SPOF", [
            "Audit de la chaîne de démarrage de Vault après un redémarrage de la plateforme.",
            "L'auto-unseal dépend d'un <strong>Vault secondaire en réplique unique</strong>. S'il tombe, plus rien ne se descelle.",
            "SPOF documenté et porté au backlog avec ses options de sortie. <span class=\"todo\">[TODO: statut]</span>",
            "Une dépendance circulaire au démarrage ne se voit que le jour où tout redémarre."]),
    ],
    "car_eyebrow": "Parcours", "car_title": "Le chemin <em>jusqu'ici</em>.",
    "career": [
        ("En cours", "Product Owner — SIOPS", "Équipe DevOps/SRE de cinq personnes, cluster RKE2 de production sur OpenStack."),
        ("2025 – 2026", "Ipsos — Software Developer, Global BI", "Refonte du moteur d'export Excel d'un portail financier utilisé dans plus de 90 pays."),
        ("Un semestre", "FPT University, Vietnam", "Semestre d'échange. TOEIC 900."),
        ("2022 – 2027", "EPITA — majeure SIGL", "Systèmes d'Information &amp; Génie Logiciel. Délégué de promotion."),
        ("Avant", "Clayens NP — opérateur", "Premier contact avec la production industrielle et ses contraintes."),
        ("9 ans", "Scoutisme — dont 4 ans chef d'unité", "Encadrement, logistique et responsabilité de groupe sur le terrain."),
    ],
    "st_eyebrow": "Stack", "st_title": "Les <em>outils</em> du quotidien.",
    "st_lede": "Pas de pourcentages. Le chiffre à côté d'un outil, c'est le nombre de projets où je l'ai utilisé — survolez pour les voir.",
    "st_note": "Environnement quotidien : Arch Linux.",
    "ct_eyebrow": "Contact · réponse sous 24 h", "ct_title": "Construisons quelque chose de <em>solide</em>.",
    "ct_lede": "Stage de pré-embauche de 6 mois à partir de février 2027 — Platform, Cloud, SRE ou DevOps, avec une ouverture Product technique. Le mail arrive dans ma boîte, pas dans un formulaire.",
    "subject": "Stage%206%20mois%20%E2%80%94%20f%C3%A9vrier%202027",
    "copy": "Copier", "write": "Écrire à Tom",
    "ct_meta": [("Téléphone", '<a href="tel:+33695104056">06 95 10 40 56</a>'), ("LinkedIn", '<a href="' + LINKEDIN + '" target="_blank" rel="noopener me">in/giles-tom</a>'), ("Localisation", "Paris / Vosges — mobile"), ("Langues", "Français · Anglais (TOEIC 900)")],
    "footer_other": "English version",
    "term_aria": "Terminal interactif", "term_close": "Fermer le terminal", "menu": "Menu",
}
T["en"] = {
    "lang": "en", "locale": "en_GB", "alt_locale": "fr_FR", "path": "/en/", "other": "/", "other_label": "FR",
    "other_aria": "Version française", "proj": "/en/projects/", "cv": "/cv/tom-giles-cv-en.pdf",
    "title": "Tom Giles — Platform &amp; Cloud / SRE — 6-month internship from February 2027",
    "meta": "Tom Giles, EPITA SIGL 2027. Product Owner of an SRE team running a production RKE2 cluster on OpenStack. Looking for a 6-month pre-hire internship from February 2027.",
    "og": "I run a production Kubernetes cluster with real customers — and I can cost it, steer it and defend it in front of them. 6-month internship from February 2027.",
    "job": "Engineering student — Platform & Cloud / SRE",
    "ld": "Product Owner of the SIOPS SRE team, running a production RKE2 cluster on OpenStack. Looking for a 6-month pre-hire internship from February 2027.",
    "school": "EPITA — SIGL major",
    "skip": "Skip to content", "home_aria": "Tom Giles — home",
    "nav": [("projets", "Projects"), ("incidents", "Incidents"), ("parcours", "Career"), ("stack", "Stack"), ("contact", "Contact")],
    "boot": ["[ ok ] etcd quorum 3/3", "[ ok ] kube-apiserver ready", "[ ok ] argocd sync 60/60", "[ ok ] tom.giles.fr — online"],
    "status": "Available · 6-month internship, Feb 2027",
    "roles": "Platform Engineer|Site Reliability Engineer|Product Owner SRE|Cloud &amp; DevOps",
    "hero_sub": "Platform · Cloud · SRE",
    "cta1": "See the projects", "cta2": "Download CV",
    "scroll": "Scroll",
    "statement": "I run a production Kubernetes cluster. With real customers. I cost it, I steer it, I defend it in front of them. And when it breaks at three in the morning, I'm in the logs.",
    "statement_label": "Manifesto",
    "numbers": [
        ("6", "", "nodes", "RKE2 v1.32 on OpenStack, run by a team of five."),
        ("60", "~", "applications", "continuously reconciled by ArgoCD."),
        ("4", "", "customers", "hosted in production and staging."),
        ("90", "%", "less storage", "486 → 48 GiB of backups after one post-mortem."),
    ],
    "band": "PLATFORM — SRE — CLOUD — DEVOPS — GITOPS — ",
    "proj_eyebrow": "Selected work", "proj_title": "What I've <em>built</em>.",
    "proj_lede": "From infrastructure to production, from code to consulting. Keep scrolling — each project has its own page.",
    "filter_aria": "Filter projects", "all": "All",
    "todo_label": "Description to write", "todo_text": "Project description coming soon.",
    "stats": [("6", "nodes"), ("~60", "ArgoCD apps"), ("4", "customers")],
    "meter_aria": "Memory: 3 to 4 GB before, 100 to 200 MB after",
    "meter": [("before", "3–4 GB"), ("after", "100–200 MB")],
    "see": "View project",
    "inc_eyebrow": "Post-mortems", "inc_title": "When it <em>breaks</em> for real.",
    "inc_lede": "Three incidents on the SIOPS cluster. Symptom, diagnosis, fix, lesson — unfiltered.",
    "inc_keys": ["Symptom", "Diagnosis", "Fix", "Lesson"],
    "incidents": [
        ("INC-01 · SEV1", "1", "The cluster deadlocks itself on restart", "control plane · etcd", [
            "master-1 unreachable, API server flapping, cluster degraded.",
            "Undersized node: the <strong>OOM killer takes out etcd</strong>, quorum drops to 2/3. <code>rke2-server</code> waits on kubelet, which waits on etcd. Deadlock.",
            "<code>rke2-killall</code> to break the loop, clean restart, then resize the master.",
            "You don't size a control plane like a worker."]),
        ("INC-02 · SEV1", "1", "Three weeks without backups, and the jobs were green", "backups · restic · S3", [
            "No recent snapshot. Yet every job reported success.",
            "S3 quota full. <strong>486 GiB, 349 snapshots never pruned</strong>: the date in the dump name broke retention.",
            "<code>forget --group-by host</code> + <code>prune</code>: <strong>486 → 48 GiB</strong>. Script hardened with <code>set -euo pipefail</code>.",
            "A green job proves nothing. Monitor the age of the last restorable snapshot."]),
        ("INC-03 · SEV2", "2", "The Vault unseal chain bites its own tail", "secrets · Vault · SPOF", [
            "Audit of Vault's boot chain after a platform restart.",
            "Auto-unseal depends on a <strong>single-replica secondary Vault</strong>. If it goes down, nothing unseals.",
            "SPOF documented and added to the backlog with exit options. <span class=\"todo\">[TODO: status]</span>",
            "A circular boot dependency only shows the day everything restarts at once."]),
    ],
    "car_eyebrow": "Career", "car_title": "The road <em>so far</em>.",
    "career": [
        ("Now", "Product Owner — SIOPS", "Five-person DevOps/SRE team, production RKE2 cluster on OpenStack."),
        ("2025 – 2026", "Ipsos — Software Developer, Global BI", "Rebuilt the Excel export engine of a finance portal used in 90+ countries."),
        ("One semester", "FPT University, Vietnam", "Exchange semester. TOEIC 900."),
        ("2022 – 2027", "EPITA — SIGL major", "Information Systems &amp; Software Engineering. Class representative."),
        ("Before", "Clayens NP — operator", "First contact with industrial production and its constraints."),
        ("9 years", "Scouting — 4 years as unit leader", "Leadership, logistics and responsibility for a group in the field."),
    ],
    "st_eyebrow": "Stack", "st_title": "Everyday <em>tools</em>.",
    "st_lede": "No percentages. The number next to a tool is how many projects I used it in — hover to see which.",
    "st_note": "Daily driver: Arch Linux.",
    "ct_eyebrow": "Contact · reply within 24 h", "ct_title": "Let's build something <em>solid</em>.",
    "ct_lede": "6-month pre-hire internship from February 2027 — Platform, Cloud, SRE or DevOps, open to technical Product roles. Email lands in my inbox, not in a form.",
    "subject": "6-month%20internship%20%E2%80%94%20from%20February%202027",
    "copy": "Copy", "write": "Email Tom",
    "ct_meta": [("Phone", '<a href="tel:+33695104056">+33 6 95 10 40 56</a>'), ("LinkedIn", '<a href="' + LINKEDIN + '" target="_blank" rel="noopener me">in/giles-tom</a>'), ("Location", "Paris / Vosges, France — mobile"), ("Languages", "French · English (TOEIC 900)")],
    "footer_other": "Version française",
    "term_aria": "Interactive terminal", "term_close": "Close terminal", "menu": "Menu",
}


def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def attr(s):
    return esc(s).replace('"', "&quot;")


# ──────────────────────────────────────────────────────────────── sections

def head(t):
    return f"""<!doctype html>
<html lang="{t['lang']}" prefix="og: https://ogp.me/ns#" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{t['title']}</title>
<meta name="description" content="{attr(t['meta'])}">
<link rel="canonical" href="{SITE}{t['path']}">
<link rel="alternate" hreflang="fr" href="{SITE}/">
<link rel="alternate" hreflang="en" href="{SITE}/en/">
<link rel="alternate" hreflang="x-default" href="{SITE}/">
<meta property="og:type" content="profile">
<meta property="og:locale" content="{t['locale']}">
<meta property="og:locale:alternate" content="{t['alt_locale']}">
<meta property="og:url" content="{SITE}{t['path']}">
<meta property="og:site_name" content="Tom Giles">
<meta property="og:title" content="Tom Giles — Platform &amp; Cloud / SRE">
<meta property="og:description" content="{attr(t['og'])}">
<meta property="og:image" content="{SITE}/assets/og.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#000000">
<meta name="color-scheme" content="dark">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Geist:wght@400..700&family=Geist+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="/assets/style.css">
<script>document.documentElement.classList.remove("no-js");</script>
<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Tom Giles",
  "url": "{SITE}{t['path']}",
  "email": "mailto:tom.giles@epita.fr",
  "telephone": "+33695104056",
  "jobTitle": "{t['job']}",
  "description": "{t['ld']}",
  "sameAs": ["{LINKEDIN}"],
  "knowsLanguage": ["fr", "en"],
  "address": {{ "@type": "PostalAddress", "addressCountry": "FR", "addressLocality": "Paris" }},
  "alumniOf": [
    {{ "@type": "CollegeOrUniversity", "name": "{t['school']}" }},
    {{ "@type": "CollegeOrUniversity", "name": "FPT University, Vietnam" }}
  ],
  "knowsAbout": ["Kubernetes", "RKE2", "OpenStack", "ArgoCD", "GitOps", "HashiCorp Vault",
                 "Terraform", "OpenTofu", "Prometheus", "Site Reliability Engineering",
                 "FastAPI", "C#/.NET", "SAP S/4HANA", "EBIOS Risk Manager"]
}}
</script>
</head>
"""


def topbar(t):
    links = "\n".join(f'      <a href="#{a}">{l}</a>' for a, l in t["nav"])
    return f"""
<body>
<a class="skip-link" href="#main">{t['skip']}</a>
<script>
/* écran de démarrage : une fois par session, jamais en mouvement réduit */
(function(){{try{{if(sessionStorage.getItem("booted")||matchMedia("(prefers-reduced-motion: reduce)").matches)return;sessionStorage.setItem("booted","1")}}catch(e){{return}}
var b=document.createElement("div");b.className="boot";b.setAttribute("aria-hidden","true");
b.innerHTML='<div class="boot__lines">{"".join(f"<p style=--i:{i}>{esc(l)}</p>" for i, l in enumerate(t["boot"]))}</div><div class="boot__bar"><i></i></div>';
document.body.appendChild(b);document.documentElement.classList.add("booting")}})();
</script>
<div class="progress" aria-hidden="true"></div>
<div class="cursor" aria-hidden="true"><i></i></div>

<header class="topbar">
  <div class="wrap topbar__inner">
    <a class="logo" href="{t['path']}" aria-label="{t['home_aria']}">
      <span class="logo__mark" aria-hidden="true">&gt;_</span>
      <span class="logo__text">tom.giles<span class="dim">.fr</span></span>
    </a>
    <nav class="nav" id="nav" aria-label="Sections">
{links}
    </nav>
    <div class="tools">
      <a class="chip-btn chip-btn--lang" href="{t['other']}" hreflang="{'en' if t['lang'] == 'fr' else 'fr'}" aria-label="{t['other_aria']}">{t['other_label']}</a>
      <a class="chip-btn chip-btn--icon" href="{LINKEDIN}" target="_blank" rel="noopener me" aria-label="LinkedIn">{LI_ICON}</a>
      <button class="chip-btn chip-btn--icon" type="button" data-term-open aria-label="Terminal"><span class="mono" aria-hidden="true">&gt;_</span></button>
      <button class="chip-btn chip-btn--icon menu-btn" type="button" aria-controls="nav" aria-expanded="false" aria-label="{t['menu']}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 8h16M4 16h16"/></svg>
      </button>
    </div>
  </div>
</header>
"""


def hero(t):
    return f"""
<main id="main">

  <!-- ═══════════ HERO ═══════════ -->
  <section class="hero" aria-labelledby="hero-name">
    <canvas class="hero__canvas" aria-hidden="true"></canvas>
    <div class="hero__inner" data-hero>
      <p class="status fade-up"><span class="status__dot" aria-hidden="true"></span>{t['status']}</p>
      <h1 class="hero__name" id="hero-name" aria-label="Tom Giles">
        <span class="line" aria-hidden="true">{''.join(f'<span class="ch" style="--i:{i}">{c}</span>' for i, c in enumerate('Tom'))}</span>
        <span class="line" aria-hidden="true">{''.join(f'<span class="ch" style="--i:{i + 3}">{c}</span>' for i, c in enumerate('Giles'))}</span>
      </h1>
      <p class="hero__role fade-up d1"><span class="prompt">~ $</span> <span class="typer" data-words="{t['roles']}">Platform Engineer</span></p>
      <div class="actions fade-up d2">
        <a class="btn btn--primary magnetic" href="#projets">{t['cta1']} {ARROW}</a>
        <a class="btn btn--ghost magnetic" href="{t['cv']}" download>{t['cta2']}</a>
      </div>
    </div>

    <aside class="feed fade-up d4" aria-hidden="true">
      <div class="feed__head"><span>kubectl get events -w</span><b>● live</b></div>
      <ol></ol>
    </aside>

    <a class="scroll-cue fade-up d4" href="#manifeste"><span>{t['scroll']}</span><i aria-hidden="true"></i></a>
  </section>
"""


def statement(t):
    words = " ".join(f'<span class="w">{w}</span>' for w in t["statement"].split(" "))
    return f"""
  <!-- ═══════════ MANIFESTE : mots révélés au scroll ═══════════ -->
  <section class="statement" id="manifeste" data-progress aria-label="{t['statement_label']}">
    <div class="statement__sticky">
      <div class="wrap">
        <p class="eyebrow">{t['statement_label']}</p>
        <p class="statement__text">{words}</p>
      </div>
    </div>
  </section>
"""


def numbers(t):
    slides = []
    for i, (n, affix, label, sub) in enumerate(t["numbers"]):
        pre = affix if affix == "~" else ""
        post = affix if affix == "%" else ""
        slides.append(f"""      <div class="num" style="--k:{i}">
        <p class="num__value"><span class="num__pre">{pre}</span><span data-count="{n}">{n}</span><span class="num__post">{post}</span></p>
        <p class="num__label">{label}</p>
        <p class="num__sub">{sub}</p>
      </div>""")
    dots = "".join(f"<i style=\"--k:{i}\"></i>" for i in range(len(t["numbers"])))
    return f"""
  <!-- ═══════════ CHIFFRES : un par écran ═══════════ -->
  <section class="numbers" data-progress style="--n:{len(t['numbers'])}">
    <div class="numbers__sticky">
{chr(10).join(slides)}
      <div class="numbers__dots" aria-hidden="true">{dots}</div>
    </div>
  </section>

  <!-- ═══════════ BANDEAU ═══════════ -->
  <div class="band" aria-hidden="true">
    <p class="band__row" data-band="-1">{t['band'] * 4}</p>
    <p class="band__row band__row--outline" data-band="1">{t['band'] * 4}</p>
  </div>
"""


def card(p, i, t, lang):
    d = p[lang]
    cat = CATS[lang][p["cat"]]
    chips = p["chips"][lang] if isinstance(p["chips"], dict) else p["chips"]
    chips_html = "".join(f"<li>{esc(c)}</li>" for c in chips)
    if d["desc"]:
        desc = f'<p class="card__desc">{d["desc"]}</p>'
    else:
        desc = (f'<p class="todo-desc" data-label="{t["todo_label"]}">{t["todo_text"]}'
                '<span class="skel"></span><span class="skel"></span><span class="skel"></span></p>')
    visual = ""
    if p["visual"] == "nodes":
        stats = "".join(f"<div><b>{a}</b><span>{b}</span></div>" for a, b in t["stats"])
        visual = f'<div class="nodes" aria-hidden="true" data-nodes></div><div class="card__stats">{stats}</div>'
    elif p["visual"] == "meter":
        (l1, v1), (l2, v2) = t["meter"]
        visual = (f'<div class="meter" role="img" aria-label="{t["meter_aria"]}">'
                  f'<div class="meter__row"><span>{l1}</span><span class="meter__bar"><i class="v1" style="--w:100%"></i></span><span>{v1}</span></div>'
                  f'<div class="meter__row"><span>{l2}</span><span class="meter__bar"><i class="v2" style="--w:5%"></i></span><span>{v2}</span></div></div>')
    href = t["proj"] + p["slug"] + "/"
    xl = " card--xl" if p["visual"] == "nodes" else ""
    return f"""        <article class="card{xl}" data-cat="{p['cat']}" data-slug="{p['slug']}" data-stack="{attr('|'.join(p['stack']))}">
          <div class="card__top"><span class="card__cat">{esc(cat)}</span><span class="card__num">{i + 1:02d}</span></div>
          <h3 class="card__title"><a href="{href}">{esc(d['title'])}</a></h3>
          <p class="card__tag">{esc(d['tag'])}</p>
          {desc}
          {visual}
          <ul class="card__stack">{chips_html}</ul>
          <span class="card__go">{t['see']} {ARROW}</span>
        </article>"""


def projects(t, lang):
    cards = "\n".join(card(p, i, t, lang) for i, p in enumerate(PROJECTS))
    filters = [f'<button class="filter" type="button" data-filter="all" aria-pressed="true">{t["all"]} <span class="filter__count"></span></button>']
    for key, label in CATS[lang].items():
        filters.append(f'<button class="filter" type="button" data-filter="{key}" aria-pressed="false">{esc(label)} <span class="filter__count"></span></button>')
    return f"""
  <!-- ═══════════ PROJETS : défilement horizontal épinglé ═══════════ -->
  <section class="projects" id="projets" aria-labelledby="projets-title">
    <span id="platform"></span><span id="sre"></span><span id="software"></span><span id="consulting"></span><span id="product"></span>
    <div class="wrap">
      <div class="section__head">
        <div class="reveal">
          <p class="eyebrow">{t['proj_eyebrow']}</p>
          <h2 class="section__title" id="projets-title">{t['proj_title']}</h2>
        </div>
        <p class="section__lede reveal" style="--d:1">{t['proj_lede']}</p>
      </div>
      <div class="filters reveal" role="group" aria-label="{t['filter_aria']}">
        {chr(10).join('        ' + f for f in filters).strip()}
      </div>
    </div>
    <div class="hscroll" data-hscroll>
      <div class="hscroll__sticky">
        <div class="hscroll__track">
{cards}
        </div>
        <div class="hscroll__bar" aria-hidden="true"><i></i></div>
      </div>
    </div>
  </section>
"""


def incidents(t):
    items = []
    for i, (iid, sev, title, area, body) in enumerate(t["incidents"]):
        dl = "".join(f"<div><dt>{k}</dt><dd>{v}</dd></div>" for k, v in zip(t["inc_keys"], body))
        items.append(f"""        <details class="incident reveal" data-sev="{sev}" style="--d:{i}"{' open' if i == 0 else ''}>
          <summary>
            <span class="incident__id">{iid}</span>
            <h3 class="incident__title">{title}<span class="incident__area">{area}</span></h3>
            <span class="incident__toggle" aria-hidden="true">{PLUS}</span>
          </summary>
          <dl class="incident__body">{dl}</dl>
        </details>""")
    return f"""
  <!-- ═══════════ INCIDENTS ═══════════ -->
  <section class="section" id="incidents" aria-labelledby="incidents-title">
    <div class="wrap">
      <div class="section__head">
        <div class="reveal">
          <p class="eyebrow eyebrow--danger">{t['inc_eyebrow']}</p>
          <h2 class="section__title" id="incidents-title">{t['inc_title']}</h2>
        </div>
        <p class="section__lede reveal" style="--d:1">{t['inc_lede']}</p>
      </div>
      <div class="incidents">
{chr(10).join(items)}
      </div>
    </div>
  </section>
"""


def career(t):
    lis = "\n".join(
        f'        <li class="reveal"><span class="timeline__when">{w}</span><p class="timeline__what">{a}</p><p class="timeline__desc">{b}</p></li>'
        for w, a, b in t["career"])
    return f"""
  <!-- ═══════════ PARCOURS ═══════════ -->
  <section class="section" id="parcours" aria-labelledby="parcours-title">
    <div class="wrap">
      <div class="section__head">
        <div class="reveal">
          <p class="eyebrow">{t['car_eyebrow']}</p>
          <h2 class="section__title" id="parcours-title">{t['car_title']}</h2>
        </div>
      </div>
      <div class="timeline-wrap">
        <span class="timeline__fill" aria-hidden="true"></span>
        <ol class="timeline">
{lis}
        </ol>
      </div>
    </div>
  </section>
"""


def stack(t, lang):
    groups = []
    for i, (name, items) in enumerate(STACK):
        lis = "".join(f'<li class="tech">{esc(x)}</li>' for x in items)
        groups.append(f'        <div class="stack__group reveal" style="--d:{i % 3}"><p class="stack__name">{esc(name[lang])}</p><ul class="stack__items">{lis}</ul></div>')
    return f"""
  <!-- ═══════════ STACK ═══════════ -->
  <section class="section" id="stack" aria-labelledby="stack-title">
    <div class="wrap">
      <div class="section__head">
        <div class="reveal">
          <p class="eyebrow">{t['st_eyebrow']}</p>
          <h2 class="section__title" id="stack-title">{t['st_title']}</h2>
        </div>
        <p class="section__lede reveal" style="--d:1">{t['st_lede']}</p>
      </div>
      <div class="stack">
{chr(10).join(groups)}
      </div>
      <p class="stack__note">{t['st_note']}</p>
    </div>
  </section>
"""


def contact(t):
    meta = "".join(f"<li>{k} <b>{v}</b></li>" for k, v in t["ct_meta"])
    mail = f"mailto:tom.giles@epita.fr?subject={t['subject']}"
    return f"""
  <!-- ═══════════ CONTACT ═══════════ -->
  <section class="section contact" id="contact" aria-labelledby="contact-title">
    <div class="wrap">
      <p class="eyebrow reveal">{t['ct_eyebrow']}</p>
      <h2 class="contact__title reveal" id="contact-title">{t['ct_title']}</h2>
      <p class="contact__lede reveal">{t['ct_lede']}</p>
      <div class="mail reveal">
        <a href="{mail}">tom.giles@epita.fr</a>
        <button type="button" data-copy="tom.giles@epita.fr">{t['copy']}</button>
      </div>
      <div class="actions reveal">
        <a class="btn btn--primary magnetic" href="{mail}">{t['write']} {ARROW}</a>
        <a class="btn btn--ghost magnetic" href="{LINKEDIN}" target="_blank" rel="noopener me">{LI_ICON} LinkedIn</a>
        <a class="btn btn--ghost magnetic" href="{t['cv']}" download>{t['cta2']}</a>
      </div>
      <ul class="contact__meta reveal">{meta}</ul>
    </div>
  </section>

</main>
"""


def footer(t):
    return f"""
<footer class="site-footer">
  <div class="wrap site-footer__inner">
    <span>© Tom Giles — EPITA SIGL 2027</span>
    <span><a href="mailto:tom.giles@epita.fr">tom.giles@epita.fr</a> · <a href="{LINKEDIN}" target="_blank" rel="noopener me">LinkedIn</a> · <a href="{t['other']}" hreflang="{'en' if t['lang'] == 'fr' else 'fr'}">{t['footer_other']}</a></span>
  </div>
</footer>

<button class="term-fab" type="button" data-term-open aria-haspopup="dialog">
  <b>&gt;_</b><span class="term-open-label">terminal</span> <kbd>/</kbd>
</button>

<div class="term" role="dialog" aria-modal="true" aria-label="{t['term_aria']}">
  <div class="term__win">
    <div class="term__bar"><i></i><i></i><i></i><span>tom@giles: ~</span><button class="term__close" type="button" aria-label="{t['term_close']}">✕</button></div>
    <div class="term__out" aria-live="polite"></div>
    <form class="term__line" autocomplete="off">
      <label class="term__ps" for="term-in">tom@giles:~$</label>
      <input class="term__in" id="term-in" type="text" spellcheck="false" autocapitalize="off">
    </form>
  </div>
</div>

<div class="toast" role="status" aria-live="polite"></div>

<script src="/assets/main.js" defer></script>
</body>
</html>
"""


def render(lang):
    t = T[lang]
    return (head(t) + topbar(t) + hero(t) + statement(t) + numbers(t) + projects(t, lang)
            + incidents(t) + career(t) + stack(t, lang) + contact(t) + footer(t))
