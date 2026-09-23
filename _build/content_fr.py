# -*- coding: utf-8 -*-
"""Contenu FR des pages projet. Un seul endroit à éditer pour changer un texte."""

TODO = '<span class="todo">[TODO: métrique]</span>'

PAGES = {}

# ──────────────────────────────────────────────────────────────── SIOPS
PAGES["siops"] = {
    "title": "SIOPS — plateforme Kubernetes de production",
    "subtitle": "Cluster RKE2 sur OpenStack opéré à cinq, quatre clients hébergés, "
                "et les incidents qui vont avec.",
    "description": "SIOPS : cluster RKE2 v1.32 de production sur OpenStack — 6 nœuds, "
                   "~60 applications ArgoCD, 4 clients. Rôle de Product Owner, portail "
                   "GitOps Cassiopée et post-mortems.",
    "anchor": "sre",
    "section_label": "02 Production & SRE",
    "meta": [
        ("Rôle", "Product Owner"),
        ("Équipe", "5 personnes"),
        ("Plateforme", "RKE2 v1.32 / OpenStack"),
        ("Méthode", "Kanban, Linear"),
    ],
    "body": """
  <h2 data-n="01">La plateforme</h2>
  <p>SIOPS est l'équipe DevOps/SRE interne de la majeure SIGL. Elle opère un cluster
  Kubernetes réellement en production : d'autres équipes y hébergent leurs applications,
  s'y connectent tous les jours et remontent quand ça casse. Ce n'est pas un lab qu'on
  reconstruit le lundi matin.</p>

  <div class="callout">
    <span class="mono">Inventaire</span>
    <p class="kv">RKE2 v1.32 · 6 nœuds sur OpenStack · CNI Flannel · stockage Cinder CSI<br>
    ~60 applications réconciliées par ArgoCD · 4 clients en production + staging<br>
    Observabilité : Prometheus · Grafana · Loki · Alloy · Gatus<br>
    ~440 commits sur le semestre, équipe de 5, Kanban sur Linear</p>
  </div>

  <h2 data-n="02">Mon rôle — Product Owner</h2>
  <p>Je tiens le backlog de l'équipe et j'arbitre ce qui passe. Concrètement : traduire une
  demande client en incrément livrable, décider ce qu'on ne fait pas ce sprint, et défendre
  cet arbitrage devant les clients comme devant l'équipe.</p>
  <p>Ce n'est pas un rôle de façade : je suis dans les logs et sur les post-mortems. C'est
  précisément pour ça que les arbitrages tiennent — je sais ce que coûte réellement une
  demande qui paraît anodine.</p>

  <h2 data-n="03">Cassiopée — portail self-service GitOps</h2>
  <p>Avant Cassiopée, chaque demande d'environnement passait par un membre de l'équipe
  plateforme. Le portail transforme ce parcours en self-service piloté par Git.</p>
  <p>Un utilisateur demande une application, une base de données, un bucket S3 ou une
  ingress. Le portail écrit le <code>values.yaml</code> correspondant dans le dépôt GitOps ;
  ArgoCD réconcilie. Les credentials sont générés à la volée et stockés dans Vault — ils ne
  transitent jamais par le dépôt. Les quotas sont appliqués par groupe.</p>
  <p class="kv">FastAPI · ArgoCD · Helm · HashiCorp Vault · Swift / RGW</p>
  <p><strong>Résultat :</strong> un environnement complet déployé par commit, sans
  intervention de l'équipe plateforme. """ + TODO + """ nombre d'environnements
  provisionnés via le portail.</p>

  <h2 data-n="04">Incidents &amp; post-mortems</h2>

  <h3>INC-01 — Le cluster se bloque lui-même au redémarrage</h3>
  <p><strong>Symptôme.</strong> master-1 injoignable, API server instable, cluster en
  fonctionnement dégradé.</p>
  <p><strong>Diagnostic.</strong> Le nœud était sous-dimensionné. Sous pression mémoire,
  l'OOM killer tue etcd et le quorum tombe à 2/3. Pire, la remise en route se bloque
  elle-même : <code>rke2-server</code> attend kubelet, kubelet attend le static pod etcd,
  et etcd ne redémarre plus. Interblocage à trois.</p>
  <p><strong>Correctif.</strong> <code>rke2-killall</code> pour casser la boucle, puis
  redémarrage propre du nœud — et redimensionnement du master pour que la cause ne
  revienne pas.</p>
  <p><strong>Leçon.</strong> Un control plane ne se dimensionne pas comme un worker. Les
  ressources d'etcd sont une contrainte de disponibilité, pas une ligne de facture qu'on
  rogne.</p>

  <h3>INC-02 — Trois semaines sans sauvegarde, et les jobs étaient verts</h3>
  <p><strong>Symptôme.</strong> Plus aucun snapshot récent dans le dépôt. Les jobs de
  sauvegarde, eux, remontaient en succès.</p>
  <p><strong>Diagnostic.</strong> Le quota S3 de 500 GiB était saturé. Le dépôt restic
  pesait 486 GiB pour 349 snapshots jamais purgés : le nom de dump embarquait la date, donc
  chaque sauvegarde créait son propre groupe et la politique de rétention ne s'appliquait
  à rien. Le nettoyage n'avait jamais rien eu à nettoyer.</p>
  <p><strong>Correctif.</strong> Montée de version de restic, puis
  <code>forget --group-by host</code> suivi de <code>prune</code> : le dépôt passe de
  <strong>486 GiB à 48 GiB</strong>. Script de sauvegarde durci avec
  <code>set -euo pipefail</code> et un nom de dump stable.</p>
  <p><strong>Leçon.</strong> Un job vert ne prouve rien. Ce qu'il faut surveiller, c'est
  l'âge du dernier snapshot restaurable — pas le code de sortie du cron. Et un script sans
  <code>set -e</code> ment sur son propre statut.</p>

  <h3>INC-03 — La chaîne de descellement Vault se mord la queue</h3>
  <p><strong>Symptôme.</strong> Audit de la chaîne de démarrage de Vault, mené après un
  redémarrage de la plateforme.</p>
  <p><strong>Diagnostic.</strong> L'auto-unseal transit du Vault principal s'appuie sur un
  Vault secondaire, lui-même scellé en Shamir et déployé en réplique unique. Si le
  secondaire tombe, plus rien ne se descelle — y compris les secrets dont on a besoin pour
  le remonter. Un SPOF, avec une dépendance circulaire au démarrage.</p>
  <p><strong>Correctif.</strong> SPOF identifié, documenté et porté au backlog avec ses
  options de sortie. <span class="todo">[TODO: statut de la remédiation]</span></p>
  <p><strong>Leçon.</strong> Une dépendance circulaire au démarrage est invisible en régime
  nominal. Elle se voit le jour où tout redémarre en même temps — c'est-à-dire le pire
  jour possible.</p>

  <h2 data-n="05">Mutualisation des ressources — une décision produit</h2>
  <p>Chaque groupe disposait d'un quota fixe, calibré au plus juste. Le résultat était le
  pire des deux mondes : de la capacité réservée qui dormait d'un côté, des équipes
  bloquées à livrer des maquettes de l'autre.</p>
  <p>J'ai porté le passage à un pool commun. La capacité va là où il y a de la demande
  réelle, au lieu d'être gelée par un tableau de quotas. Le pari est assumé : on accepte un
  risque de contention pour que les équipes mènent de vrais projets plutôt que des
  démonstrations.</p>
  <p>""" + TODO + """ taux d'utilisation du pool avant et après la bascule.</p>

  <h2 data-n="06">Ce que j'en retire</h2>
  <p>La partie technique s'apprend. Ce qui s'apprend moins vite, c'est d'arbitrer sous
  contrainte : dire non à une demande légitime parce que la capacité n'est pas là, assumer
  un SPOF connu le temps de le traiter proprement, et expliquer les deux à un client sans
  se cacher derrière du jargon.</p>
""",
}

# ──────────────────────────────────────────────────────────────── ARCL
PAGES["arcl"] = {
    "title": "ARCL — architecture hybride résiliente",
    "subtitle": "Un socle self-service redondé entre Azure et un cloud privé, décrit "
                "intégralement en Infrastructure as Code.",
    "description": "ARCL : infrastructure hybride haute disponibilité entre Azure et "
                   "OpenStack — interconnexion WireGuard, PostgreSQL redondé par Patroni, "
                   "tout en OpenTofu.",
    "anchor": "platform",
    "section_label": "01 Platform & Cloud",
    "meta": [
        ("Rôle", "Conception &amp; implémentation infra"),
        ("Cible", "Azure × cloud privé"),
        ("Approche", "100 % Infrastructure as Code"),
        ("Enjeu", "Haute disponibilité"),
    ],
    "body": """
  <h2 data-n="01">Contexte</h2>
  <p>L'objectif : un socle self-service qui reste disponible quand l'un des deux clouds
  tombe. Pas une architecture hybride de principe — une architecture hybride qui survit à
  la perte d'un côté, et dont on peut le prouver.</p>

  <h2 data-n="02">Architecture</h2>
  <p>Azure porte les frontaux et la répartition de charge ; le cloud privé sous
  MicroStack/OpenStack porte l'état. Les deux côtés sont reliés par un tunnel chiffré
  WireGuard, qui sert de plan de communication unique entre les composants.</p>
  <p>La donnée vit dans un cluster PostgreSQL géré par Patroni : élection du primaire,
  bascule automatique, réplication continue. Les volumes sont provisionnés via Cinder côté
  privé.</p>
  <p class="kv">Azure · Azure Load Balancer · OpenTofu · MicroStack / OpenStack ·
  WireGuard · PostgreSQL · Patroni · Cinder</p>

  <h2 data-n="03">Ce que j'ai fait</h2>
  <ul>
    <li>Interconnexion WireGuard entre Azure et le cloud privé, avec le plan d'adressage
    et les routes associées.</li>
    <li>Cluster PostgreSQL redondé par Patroni : bascule automatique du primaire, sans
    intervention humaine.</li>
    <li>Répartition de charge Azure devant les frontaux, avec sondes de santé.</li>
    <li>Description complète de l'environnement en OpenTofu — l'infrastructure est
    reconstructible depuis zéro, pas documentée dans un wiki.</li>
  </ul>

  <h2 data-n="04">Résultat</h2>
  <p>""" + TODO + """ RTO mesuré de la bascule Patroni, ou temps de reconstruction
  complète de l'environnement depuis l'IaC. Ce sont les deux seuls chiffres qui prouvent
  qu'une architecture est réellement résiliente ; tant qu'ils ne sont pas mesurés, le reste
  est une intention.</p>

  <h2 data-n="05">Ce que j'en retire</h2>
  <p>La haute disponibilité ne se décrète pas au niveau du diagramme. Elle se joue sur les
  détails : le comportement du load balancer pendant l'élection Patroni, ce qui se passe
  quand le tunnel bat, et le fait de savoir — ou non — reconstruire l'ensemble d'une seule
  commande.</p>
""",
}

# ──────────────────────────────────────────────────────────────── CNP
PAGES["cnp"] = {
    "title": "CNP — Internal Developer Platform",
    "subtitle": "Plateforme repository-first qui embarque une application dans un workflow "
                "cloud-native standardisé, sans qu'elle écrive son pipeline.",
    "description": "CNP : Internal Developer Platform repository-first — GitHub App, "
                   "pipeline GitHub Actions généré, publication GHCR et déploiement AKS, "
                   "API FastAPI.",
    "anchor": "platform",
    "section_label": "01 Platform & Cloud",
    "meta": [
        ("Rôle", "Développement plateforme"),
        ("Modèle", "Repository-first"),
        ("Cible", "Azure AKS"),
        ("Cœur", "Python 3.12 / FastAPI"),
    ],
    "body": """
  <h2 data-n="01">Le problème</h2>
  <p>Onboarder une application dans un workflow cloud-native prend des jours, et le délai
  dépend surtout de qui, dans l'équipe plateforme, accepte d'aider. Chaque équipe réinvente
  son pipeline, avec ses propres approximations sur la sécurité et les conventions.</p>
  <p>CNP fait de ce parcours un produit : le chemin standard devient le chemin le plus
  facile.</p>

  <h2 data-n="02">Comment ça marche</h2>
  <p>L'approche est repository-first. Une GitHub App instrumente le dépôt de l'équipe
  applicative : elle y installe le pipeline GitHub Actions, qui construit l'image, la
  publie sur GHCR et déclenche le déploiement sur Azure AKS.</p>
  <p>Derrière, une API FastAPI tient l'état des applications et de leurs environnements,
  sur PostgreSQL via SQLAlchemy, avec les migrations gérées par Alembic. L'environnement de
  développement complet tourne en Docker Compose.</p>
  <p class="kv">Python 3.12 · FastAPI · PostgreSQL · SQLAlchemy · Alembic · GitHub App ·
  GitHub Actions · Docker Compose · Kubernetes · Azure AKS · GHCR</p>

  <h2 data-n="03">Ce que j'ai fait</h2>
  <ul>
    <li>Développement de l'API de la plateforme et de son modèle de données
    (applications, environnements, déploiements).</li>
    <li>Intégration GitHub App : installation, permissions, écriture du pipeline dans le
    dépôt cible.</li>
    <li>Chaîne build → GHCR → déploiement AKS.</li>
    <li>Migrations Alembic et environnement de développement reproductible.</li>
  </ul>

  <h2 data-n="04">Résultat</h2>
  <p>Une équipe applicative passe du dépôt vide au premier déploiement sans écrire une
  ligne de pipeline. """ + TODO + """ time-to-first-deploy mesuré avant et après.</p>

  <h2 data-n="05">Ce que j'en retire</h2>
  <p>Une plateforme interne n'est pas un outil, c'est un produit avec des utilisateurs qui
  ont le droit de la contourner. Si le chemin standard n'est pas le plus rapide, personne
  ne le prend — et on se retrouve avec la gouvernance sur le papier et le chaos dans les
  dépôts.</p>
""",
}

# ──────────────────────────────────────────────────────────────── UBSI
PAGES["ubsi"] = {
    "title": "UBSI — leadership DevOps sur un SI multi-équipes",
    "subtitle": "Workstream DevOps d'un SI de compagnie aérienne simulé par 50 "
                "participants : fournir le socle que les autres équipes utilisent.",
    "description": "UBSI : pilotage du workstream DevOps d'une simulation d'urbanisation "
                   "à 50 participants — standards partagés, CI/CD GitLab, observabilité "
                   "Prometheus/Grafana/Loki, bus RabbitMQ.",
    "anchor": "platform",
    "section_label": "01 Platform & Cloud",
    "meta": [
        ("Rôle", "Pilotage workstream DevOps"),
        ("Échelle", "50 participants"),
        ("Objet", "SI compagnie aérienne"),
        ("Livrable", "Socle commun"),
    ],
    "body": """
  <h2 data-n="01">Contexte</h2>
  <p>Une simulation d'urbanisation à 50 participants : le système d'information d'une
  compagnie aérienne miniature, découpé en plusieurs équipes applicatives qui doivent
  s'intégrer entre elles. Le risque évident est que chaque équipe construise dans son coin
  et que rien ne se parle à la fin.</p>

  <h2 data-n="02">Mon rôle</h2>
  <p>Je pilote le workstream DevOps. Je ne livre pas de fonctionnalité métier : je fournis
  le socle sur lequel les autres équipes construisent, et je m'assure qu'elles l'utilisent
  réellement. C'est un rôle transverse — l'adoption se gagne, elle ne se décrète pas.</p>

  <h2 data-n="03">Ce que j'ai fait</h2>
  <ul>
    <li><strong>Standards partagés :</strong> conventions d'API, format de logs, découpage
    des services — le vocabulaire commun qui permet à des équipes séparées de s'intégrer.</li>
    <li><strong>CI/CD :</strong> chaîne GitLab CI/CD unique, reprise par chaque équipe
    applicative.</li>
    <li><strong>Observabilité :</strong> socle Prometheus, Grafana et Loki, pour que le
    diagnostic ne dépende pas de qui a la console ouverte.</li>
    <li><strong>Intégration :</strong> bus RabbitMQ entre services, avec les contrats de
    messages associés.</li>
  </ul>
  <p class="kv">FastAPI · Python · PostgreSQL · RabbitMQ · Docker · Docker Compose ·
  GitLab CI/CD · Prometheus · Grafana · Loki · Alembic · HTTPX</p>

  <h2 data-n="04">Résultat</h2>
  <p>Un socle commun imposé et effectivement adopté sur une simulation à 50 participants.
  """ + TODO + """ nombre d'équipes et de services intégrés au socle.</p>

  <h2 data-n="05">Ce que j'en retire</h2>
  <p>À 50 personnes, le goulot n'est plus technique. Un standard n'est adopté que s'il est
  plus rapide à suivre qu'à contourner, et la moitié du travail consiste à aller voir les
  équipes une par une plutôt qu'à écrire une meilleure documentation.</p>
""",
}

# ──────────────────────────────────────────────────────────────── IPSOS
PAGES["ipsos"] = {
    "title": "Ipsos — refonte du moteur d'export Excel",
    "subtitle": "Un export financier qui crashait au-delà de 50 000 lignes, réécrit en "
                "streaming pur : de 3–4 Go de mémoire à 100–200 Mo.",
    "description": "Ipsos Global BI : réécriture du moteur d'export Excel d'un portail "
                   "financier C#/ASP.NET utilisé dans plus de 90 pays — Open XML SDK en "
                   "mode SAX, mémoire stable à 100–200 Mo, 1 M de lignes en 2 min.",
    "anchor": "software",
    "section_label": "03 Software Engineering",
    "meta": [
        ("Rôle", "Software Developer"),
        ("Équipe", "Global Business Intelligence"),
        ("Période", "sept. 2025 – janv. 2026"),
        ("Stack", "C# / ASP.NET / SQL Server"),
    ],
    "body": """
  <h2 data-n="01">Contexte</h2>
  <p>Portail financier interne en C# / ASP.NET, hébergé sur IIS avec SQL Server, utilisé
  par les contrôleurs de gestion de <strong>plus de 90 pays</strong>. Équipe répartie entre
  l'Europe, l'Amérique du Nord et l'Inde ; travail en anglais, Jira, cadence agile.</p>
  <p>Le moteur d'export Excel tombait en <code>OutOfMemoryException</code> dès que le
  rapport dépassait 50 000 lignes. Les utilisateurs contournaient en découpant leurs
  exports à la main — quand ils y pensaient.</p>

  <h2 data-n="02">Diagnostic</h2>
  <p>La V1 chargeait l'intégralité du résultat SQL dans une <code>DataTable</code>, puis
  laissait EPPlus construire le classeur en mémoire. La donnée existait donc deux fois, et
  les gros tableaux de chaînes partaient directement sur le Large Object Heap, qui se
  fragmente et ne se compacte pas.</p>
  <div class="callout">
    <span class="mono">Mesure avant refonte</span>
    <p><strong>3 à 4 Go</strong> de mémoire consommés pour <strong>50 Mo</strong> de données
    réelles. Crash à 45 s sur les plus gros rapports.</p>
  </div>

  <h2 data-n="03">La refonte</h2>
  <p>Réécriture en streaming pur : plus aucune matérialisation complète du jeu de données
  en mémoire.</p>
  <ul>
    <li><strong>Open XML SDK en mode SAX</strong> — les lignes sont écrites au fil de
    l'eau au lieu d'être assemblées dans un arbre.</li>
    <li><strong><code>IDataReader</code> en <code>SequentialAccess</code></strong> — la
    donnée est lue colonne par colonne depuis SQL Server, sans buffer intermédiaire.</li>
    <li><strong>Écriture directe sur <code>FileStream</code></strong> — le fichier se
    construit sur disque, pas en RAM.</li>
    <li><strong>Feuille de style unique indexée</strong> — les formats sont déclarés une
    fois et référencés, au lieu d'être recréés par cellule.</li>
    <li><strong>Parsers sans allocation</strong> sur les chemins chauds, pour éviter de
    produire des millions d'objets temporaires.</li>
    <li><strong>Auto-fit prédictif en deux passes</strong> — la largeur des colonnes est
    estimée pendant le streaming, sans relire le fichier.</li>
    <li><strong>Recompression du <code>.xlsx</code></strong> en sortie.</li>
  </ul>

  <h2 data-n="04">Résultat</h2>
  <div class="callout">
    <p><strong>Mémoire stable à 100–200 Mo</strong>, quelle que soit la taille du rapport.</p>
    <p><strong>1 million de lignes exportées en ~2 minutes</strong>, là où la V1 crashait
    au bout de 45 secondes.</p>
    <p><strong>Les incidents OOM ont disparu des logs de production.</strong></p>
    <p><strong>Fichiers 20 à 30 % plus légers</strong> après recompression.</p>
  </div>

  <h2 data-n="05">Second chantier</h2>
  <p>Refactorisation d'un pipeline Python de prévision : robustesse face aux données
  dégradées, logs structurés exploitables en production, et encapsulation derrière une API
  pour découpler le pipeline de ses appelants.</p>

  <h2 data-n="06">Ce que j'en retire</h2>
  <p>Le gain n'est pas venu d'une micro-optimisation mais d'un changement de modèle : cesser
  de matérialiser. Et travailler en anglais dans une équipe répartie sur trois fuseaux
  apprend à écrire des tickets et des commits qui se suffisent à eux-mêmes, parce que
  personne ne sera disponible pour expliquer.</p>
""",
}

# ──────────────────────────────────────────────────────────────── DANONE
PAGES["danone"] = {
    "title": "Danone — architecture SAP S/4HANA Finance",
    "subtitle": "Socle conceptuel, cartographie des flux financiers et défense de "
                "l'architecture cible devant un jury.",
    "description": "Mission d'architecture SAP S/4HANA Finance pour Danone (programme "
                   "SIGL) : socle conceptuel, cartographie des flux et des objets de "
                   "gestion, deck d'architecture et soutenance.",
    "anchor": "consulting",
    "section_label": "04 Consulting & SI",
    "meta": [
        ("Rôle", "Architecture &amp; cadrage"),
        ("Domaine", "Finance"),
        ("Cible", "SAP S/4HANA"),
        ("Livrable", "Deck + soutenance"),
    ],
    "body": """
  <h2 data-n="01">Contexte</h2>
  <p>Programme de transformation Finance sur SAP S/4HANA. L'enjeu du cadrage n'est pas de
  choisir des modules, mais de poser un socle conceptuel assez clair pour que les décisions
  d'architecture qui suivront soient discutables.</p>

  <h2 data-n="02">Ce que j'ai fait</h2>
  <ul>
    <li>Socle conceptuel du domaine Finance : objets de gestion, référentiels, périmètres
    de responsabilité.</li>
    <li>Cartographie des flux financiers et des interfaces avec le reste du SI.</li>
    <li>Deck d'architecture cible, construit pour être défendu devant des interlocuteurs
    métier autant que techniques.</li>
    <li>Soutenance devant jury.</li>
  </ul>

  <h2 data-n="03">Résultat</h2>
  <p>""" + TODO + """ périmètre fonctionnel couvert par la cartographie, ou note de
  soutenance.</p>

  <h2 data-n="04">Ce que j'en retire</h2>
  <p>Devant un décideur métier, une architecture ne se défend pas par sa justesse technique
  mais par la clarté des arbitrages qu'elle rend possibles. Un schéma qu'on ne peut pas
  expliquer en deux minutes n'a pas d'existence dans la salle.</p>
""",
}

# ──────────────────────────────────────────────────────────────── BEBLOOD
PAGES["beblood"] = {
    "title": "BeBlood — transformation SIRH (Oracle HCM)",
    "subtitle": "Chiffrage par simulation Monte-Carlo au P80 et registre des risques, "
                "pour remplacer un chiffre unique par une fourchette défendable.",
    "description": "BeBlood : workstream de transformation SIRH sur Oracle HCM — chiffrage "
                   "et estimation de charge par simulation Monte-Carlo au P80, registre "
                   "des risques.",
    "anchor": "consulting",
    "section_label": "04 Consulting & SI",
    "meta": [
        ("Rôle", "Chiffrage &amp; risques"),
        ("Domaine", "SIRH"),
        ("Solution", "Oracle HCM"),
        ("Méthode", "Monte-Carlo, P80"),
    ],
    "body": """
  <h2 data-n="01">Contexte</h2>
  <p>Transformation du SIRH sur Oracle HCM. La question posée au workstream n'était pas
  « combien ça coûte », mais « avec quelle confiance peut-on annoncer ce chiffre ».</p>

  <h2 data-n="02">Ce que j'ai fait</h2>
  <p>Estimation de charge par simulation Monte-Carlo plutôt que par somme de moyennes.
  Chaque lot est estimé par une fourchette — optimiste, probable, pessimiste — puis le
  modèle tire des milliers de scénarios pour produire une distribution de charge totale.
  On retient le <strong>P80</strong> : la charge qui couvre 80 % des scénarios simulés.</p>
  <p>En parallèle, construction du registre des risques du workstream : identification,
  cotation, porteur et mesure de traitement pour chaque risque retenu.</p>

  <h2 data-n="03">Résultat</h2>
  <p>Une fourchette de charge défendable, assortie de son niveau de confiance, au lieu d'un
  chiffre unique sorti d'un tableur. """ + TODO + """ charge estimée et écart entre le P50
  et le P80.</p>

  <h2 data-n="04">Ce que j'en retire</h2>
  <p>La somme des estimations moyennes est presque toujours optimiste : elle ignore que les
  dérives se cumulent et que les gains ne se compensent pas. Annoncer un P80 plutôt qu'une
  moyenne change la conversation avec le sponsor — on discute d'un niveau de risque
  accepté, pas d'un chiffre à négocier.</p>
""",
}

# ──────────────────────────────────────────────────────────────── EBIOS
PAGES["ebios"] = {
    "title": "Analyse de risques EBIOS Risk Manager",
    "subtitle": "Démarche complète sur un SI cible : du socle de sécurité aux scénarios "
                "opérationnels et à leur traitement.",
    "description": "Analyse de risques EBIOS Risk Manager menée de bout en bout sur un SI "
                   "cible : cadrage, sources de risque, scénarios stratégiques et "
                   "opérationnels, traitement du risque.",
    "anchor": "consulting",
    "section_label": "04 Consulting & SI",
    "meta": [
        ("Rôle", "Analyse de risques"),
        ("Méthode", "EBIOS Risk Manager"),
        ("Périmètre", "SI cible"),
        ("Ateliers", "1 à 5"),
    ],
    "body": """
  <h2 data-n="01">La démarche</h2>
  <p>EBIOS Risk Manager se déroule en cinq ateliers, du cadrage au plan de traitement. La
  valeur de la méthode ne tient pas au formalisme mais au fait qu'elle force à nommer un
  attaquant, son objectif et son chemin — au lieu de lister des vulnérabilités hors
  contexte.</p>

  <h2 data-n="02">Ce que j'ai fait</h2>
  <ul>
    <li><strong>Cadrage et socle de sécurité :</strong> périmètre, valeurs métier, biens
    supports, écarts au socle réglementaire.</li>
    <li><strong>Sources de risque :</strong> couples source / objectif visé, retenus et
    justifiés.</li>
    <li><strong>Scénarios stratégiques :</strong> chemins d'attaque passant par
    l'écosystème et ses parties prenantes.</li>
    <li><strong>Scénarios opérationnels :</strong> déclinaison technique des chemins
    retenus, jusqu'aux modes opératoires.</li>
    <li><strong>Traitement du risque :</strong> mesures, priorisation, risques
    résiduels assumés.</li>
  </ul>

  <h2 data-n="03">Résultat</h2>
  <p>""" + TODO + """ nombre de scénarios opérationnels retenus et de mesures de traitement
  arbitrées.</p>

  <h2 data-n="04">Ce que j'en retire</h2>
  <p>Le passage de l'atelier stratégique à l'atelier opérationnel est l'endroit où la
  plupart des analyses se vident : on y perd le lien entre la menace réelle et la mesure
  technique. Tenir ce lien est ce qui rend le plan de traitement finançable.</p>
""",
}

# ──────────────────────────────────────────────────────────────── LENDR
PAGES["lendr"] = {
    "title": "Lendr — casiers connectés à vérification par IA",
    "subtitle": "Startup B2B cofondée. Repositionnement du produit du scolaire vers le "
                "field service, et le modèle financier qui va avec.",
    "description": "Lendr : startup B2B de casiers connectés avec vérification d'état par "
                   "IA — repositionnement vers le field service industriel, BOM hardware, "
                   "modèle financier 5 ans et pitch deck investisseurs.",
    "anchor": "product",
    "section_label": "05 Product & Entrepreneuriat",
    "meta": [
        ("Rôle", "Cofondateur — produit"),
        ("Modèle", "B2B"),
        ("Marché", "Field service / maintenance"),
        ("Livrables", "BMC, BOM, P&amp;L, pitch"),
    ],
    "body": """
  <h2 data-n="01">Le produit</h2>
  <p>Un casier connecté qui contrôle par IA l'état du matériel au moment du retour :
  l'emprunt est tracé, la dégradation est constatée à la source et non trois semaines plus
  tard, quand plus personne ne sait qui avait la clé.</p>

  <h2 data-n="02">Le repositionnement</h2>
  <p>Le premier positionnement visait l'usage scolaire. Le marché s'est révélé trop étroit
  et surtout peu solvable : le coût du matériel perdu n'y est pas assez douloureux pour
  déclencher un achat.</p>
  <p>Nous avons repositionné le produit vers le <strong>field service et la maintenance
  industrielle</strong>, où l'outillage coûte cher, circule entre techniciens et se perd
  réellement. La concurrence y est établie — CribMaster, SupplyPoint — ce qui est un bon
  signe : le besoin est démontré et budgété.</p>

  <h2 data-n="03">Ce que j'ai produit</h2>
  <ul>
    <li><strong>Business model canvas</strong> après repositionnement.</li>
    <li><strong>BOM hardware</strong> — nomenclature et coût unitaire du casier.</li>
    <li><strong>Modèle financier Excel :</strong> P&amp;L, projections à 5 ans, analyse de
    levée de fonds et effet de levier.</li>
    <li><strong>Pitch deck investisseurs.</strong></li>
  </ul>

  <h2 data-n="04">Résultat</h2>
  <p>""" + TODO + """ coût unitaire du BOM, ou montant de levée modélisé et runway
  associé.</p>

  <h2 data-n="05">Ce que j'en retire</h2>
  <p>Un marché sans concurrent n'est presque jamais une opportunité : c'est le plus souvent
  un marché qui ne paie pas. Et construire le P&amp;L avant le prototype change ce qu'on
  décide de construire — le coût du BOM contraint la fonctionnalité, pas l'inverse.</p>
""",
}
