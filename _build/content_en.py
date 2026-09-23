# -*- coding: utf-8 -*-
"""English project pages. Mirrors content_fr.py one-to-one."""

TODO = '<span class="todo">[TODO: metric]</span>'

PAGES = {}

# ──────────────────────────────────────────────────────────────── SIOPS
PAGES["siops"] = {
    "title": "SIOPS — production Kubernetes platform",
    "subtitle": "An RKE2 cluster on OpenStack run by a team of five, four tenants in "
                "production, and the incidents that come with it.",
    "description": "SIOPS: production RKE2 v1.32 cluster on OpenStack — 6 nodes, ~60 "
                   "ArgoCD applications, 4 tenants. Product Owner role, Cassiopée GitOps "
                   "portal and post-mortems.",
    "anchor": "sre",
    "section_label": "02 Production & SRE",
    "meta": [
        ("Role", "Product Owner"),
        ("Team", "5 people"),
        ("Platform", "RKE2 v1.32 / OpenStack"),
        ("Method", "Kanban, Linear"),
    ],
    "body": """
  <h2 data-n="01">The platform</h2>
  <p>SIOPS is the in-house DevOps/SRE team of the SIGL major. It runs a Kubernetes cluster
  that is genuinely in production: other teams host their applications on it, connect to it
  daily, and complain when it breaks. This is not a lab we rebuild every Monday.</p>

  <div class="callout">
    <span class="mono">Inventory</span>
    <p class="kv">RKE2 v1.32 · 6 nodes on OpenStack · Flannel CNI · Cinder CSI storage<br>
    ~60 applications reconciled by ArgoCD · 4 tenants in production + staging<br>
    Observability: Prometheus · Grafana · Loki · Alloy · Gatus<br>
    ~440 commits over the semester, team of 5, Kanban on Linear</p>
  </div>

  <h2 data-n="02">My role — Product Owner</h2>
  <p>I own the team backlog and decide what ships. In practice: turning a tenant request
  into a deliverable increment, deciding what we will <em>not</em> do this sprint, and
  defending that call to tenants and to the team alike.</p>
  <p>It is not a figurehead role. I am in the logs and on the post-mortems — which is
  exactly why the trade-offs hold up. I know what a request that looks trivial actually
  costs.</p>

  <h2 data-n="03">Cassiopée — GitOps self-service portal</h2>
  <p>Before Cassiopée, every environment request went through a member of the platform
  team. The portal turns that path into Git-driven self-service.</p>
  <p>A user requests an application, a database, an S3 bucket or an ingress. The portal
  commits the matching <code>values.yaml</code> to the GitOps repository; ArgoCD
  reconciles. Credentials are generated on the fly and stored in Vault — they never touch
  the repository. Quotas are enforced per group.</p>
  <p class="kv">FastAPI · ArgoCD · Helm · HashiCorp Vault · Swift / RGW</p>
  <p><strong>Outcome:</strong> a complete environment deployed by commit, with no platform
  team involvement. """ + TODO + """ number of environments provisioned through the
  portal.</p>

  <h2 data-n="04">Incidents &amp; post-mortems</h2>

  <h3>INC-01 — The cluster deadlocks itself on restart</h3>
  <p><strong>Symptom.</strong> master-1 unreachable, unstable API server, cluster running
  degraded.</p>
  <p><strong>Diagnosis.</strong> The node was undersized. Under memory pressure the OOM
  killer takes out etcd and quorum drops to 2/3. Worse, recovery blocks itself:
  <code>rke2-server</code> waits on kubelet, kubelet waits on the etcd static pod, and etcd
  no longer starts. A three-way deadlock.</p>
  <p><strong>Fix.</strong> <code>rke2-killall</code> to break the loop, then a clean node
  restart — and resizing the master so the cause does not come back.</p>
  <p><strong>Lesson.</strong> A control plane is not sized like a worker. etcd's resources
  are an availability constraint, not a line item to trim.</p>

  <h3>INC-02 — Three weeks without backups, and the jobs were green</h3>
  <p><strong>Symptom.</strong> No recent snapshot in the repository. The backup jobs kept
  reporting success.</p>
  <p><strong>Diagnosis.</strong> The 500 GiB S3 quota was full. The restic repository held
  486 GiB across 349 snapshots that had never been pruned: the dump name embedded the date,
  so every backup created its own group and the retention policy applied to nothing. The
  cleanup had never had anything to clean.</p>
  <p><strong>Fix.</strong> Upgraded restic, then <code>forget --group-by host</code>
  followed by <code>prune</code>: the repository went from <strong>486 GiB to 48 GiB</strong>.
  Backup script hardened with <code>set -euo pipefail</code> and a stable dump name.</p>
  <p><strong>Lesson.</strong> A green job proves nothing. What you monitor is the age of
  the last restorable snapshot — not the cron's exit code. And a script without
  <code>set -e</code> lies about its own status.</p>

  <h3>INC-03 — The Vault unseal chain eats its own tail</h3>
  <p><strong>Symptom.</strong> Audit of Vault's startup chain, carried out after a platform
  restart.</p>
  <p><strong>Diagnosis.</strong> The primary Vault's transit auto-unseal depends on a
  secondary Vault, itself Shamir-sealed and deployed as a single replica. If the secondary
  goes down, nothing unseals — including the secrets needed to bring it back. A SPOF, with
  a circular startup dependency.</p>
  <p><strong>Fix.</strong> SPOF identified, documented and added to the backlog with its
  exit options. <span class="todo">[TODO: remediation status]</span></p>
  <p><strong>Lesson.</strong> A circular startup dependency is invisible in steady state.
  You find it the day everything restarts at once — which is the worst possible day.</p>

  <h2 data-n="05">Resource pooling — a product decision</h2>
  <p>Each group had a fixed quota, sized tightly. The result was the worst of both worlds:
  reserved capacity sitting idle on one side, teams reduced to shipping mock-ups on the
  other.</p>
  <p>I pushed the move to a shared pool. Capacity goes where the real demand is, instead of
  being frozen in a quota table. The trade-off is explicit: we accept some contention risk
  so that teams can run real projects rather than demos.</p>
  <p>""" + TODO + """ pool utilisation rate before and after the switch.</p>

  <h2 data-n="06">What I took from it</h2>
  <p>The technical part is learnable. What takes longer is deciding under constraint:
  saying no to a legitimate request because the capacity is not there, carrying a known
  SPOF while it gets fixed properly, and explaining both to a tenant without hiding behind
  jargon.</p>
""",
}

# ──────────────────────────────────────────────────────────────── ARCL
PAGES["arcl"] = {
    "title": "ARCL — resilient hybrid cloud architecture",
    "subtitle": "A redundant self-service platform spanning Azure and a private cloud, "
                "described entirely as Infrastructure as Code.",
    "description": "ARCL: highly available hybrid infrastructure across Azure and "
                   "OpenStack — WireGuard interconnect, PostgreSQL made redundant with "
                   "Patroni, fully described in OpenTofu.",
    "anchor": "platform",
    "section_label": "01 Platform & Cloud",
    "meta": [
        ("Role", "Infrastructure design &amp; build"),
        ("Target", "Azure × private cloud"),
        ("Approach", "100% Infrastructure as Code"),
        ("Driver", "High availability"),
    ],
    "body": """
  <h2 data-n="01">Context</h2>
  <p>The goal: a self-service platform that stays available when either cloud goes down.
  Not a hybrid architecture on paper — a hybrid architecture that survives losing one side,
  and can prove it.</p>

  <h2 data-n="02">Architecture</h2>
  <p>Azure carries the front ends and load balancing; the private cloud, running
  MicroStack/OpenStack, carries the state. Both sides are joined by an encrypted WireGuard
  tunnel that acts as the single communication plane between components.</p>
  <p>Data lives in a PostgreSQL cluster managed by Patroni: leader election, automatic
  failover, continuous replication. Volumes are provisioned through Cinder on the private
  side.</p>
  <p class="kv">Azure · Azure Load Balancer · OpenTofu · MicroStack / OpenStack ·
  WireGuard · PostgreSQL · Patroni · Cinder</p>

  <h2 data-n="03">What I did</h2>
  <ul>
    <li>WireGuard interconnect between Azure and the private cloud, with the matching
    addressing plan and routes.</li>
    <li>PostgreSQL cluster made redundant with Patroni: automatic primary failover, no
    human in the loop.</li>
    <li>Azure load balancing in front of the front ends, with health probes.</li>
    <li>Full environment described in OpenTofu — the infrastructure is rebuildable from
    scratch, not documented in a wiki.</li>
  </ul>

  <h2 data-n="04">Outcome</h2>
  <p>""" + TODO + """ measured RTO of the Patroni failover, or full rebuild time of the
  environment from IaC. Those are the only two numbers that prove an architecture is
  actually resilient; until they are measured, the rest is intent.</p>

  <h2 data-n="05">What I took from it</h2>
  <p>High availability is not settled at diagram level. It plays out in the details: how
  the load balancer behaves during a Patroni election, what happens when the tunnel flaps,
  and whether you can — or cannot — rebuild the whole thing with one command.</p>
""",
}

# ──────────────────────────────────────────────────────────────── CNP
PAGES["cnp"] = {
    "title": "CNP — Internal Developer Platform",
    "subtitle": "A repository-first platform that onboards an application into a "
                "standardised cloud-native workflow without it writing a pipeline.",
    "description": "CNP: repository-first Internal Developer Platform — GitHub App, "
                   "generated GitHub Actions pipeline, GHCR publishing and AKS deployment, "
                   "FastAPI control plane.",
    "anchor": "platform",
    "section_label": "01 Platform & Cloud",
    "meta": [
        ("Role", "Platform engineering"),
        ("Model", "Repository-first"),
        ("Target", "Azure AKS"),
        ("Core", "Python 3.12 / FastAPI"),
    ],
    "body": """
  <h2 data-n="01">The problem</h2>
  <p>Onboarding an application into a cloud-native workflow takes days, and how long
  depends mostly on who on the platform team agrees to help. Every team reinvents its own
  pipeline, with its own approximations about security and conventions.</p>
  <p>CNP turns that path into a product: the standard route becomes the easiest route.</p>

  <h2 data-n="02">How it works</h2>
  <p>The approach is repository-first. A GitHub App instruments the application team's
  repository: it installs the GitHub Actions pipeline, which builds the image, publishes it
  to GHCR and triggers deployment to Azure AKS.</p>
  <p>Behind it, a FastAPI service holds the state of applications and their environments on
  PostgreSQL via SQLAlchemy, with migrations managed by Alembic. The full development
  environment runs on Docker Compose.</p>
  <p class="kv">Python 3.12 · FastAPI · PostgreSQL · SQLAlchemy · Alembic · GitHub App ·
  GitHub Actions · Docker Compose · Kubernetes · Azure AKS · GHCR</p>

  <h2 data-n="03">What I did</h2>
  <ul>
    <li>Built the platform API and its data model (applications, environments,
    deployments).</li>
    <li>GitHub App integration: installation, permissions, writing the pipeline into the
    target repository.</li>
    <li>The build → GHCR → AKS deployment chain.</li>
    <li>Alembic migrations and a reproducible development environment.</li>
  </ul>

  <h2 data-n="04">Outcome</h2>
  <p>An application team goes from empty repository to first deployment without writing a
  line of pipeline. """ + TODO + """ time-to-first-deploy measured before and after.</p>

  <h2 data-n="05">What I took from it</h2>
  <p>An internal platform is not a tool, it is a product whose users are free to bypass it.
  If the standard path is not the fastest one, nobody takes it — and you end up with
  governance on paper and chaos in the repositories.</p>
""",
}

# ──────────────────────────────────────────────────────────────── UBSI
PAGES["ubsi"] = {
    "title": "UBSI — DevOps leadership across a multi-team IS",
    "subtitle": "Leading the DevOps workstream of a miniature airline information system "
                "built by 50 participants: providing the base everyone else builds on.",
    "description": "UBSI: leading the DevOps workstream of a 50-participant enterprise "
                   "architecture simulation — shared standards, GitLab CI/CD, "
                   "Prometheus/Grafana/Loki observability, RabbitMQ integration bus.",
    "anchor": "platform",
    "section_label": "01 Platform & Cloud",
    "meta": [
        ("Role", "DevOps workstream lead"),
        ("Scale", "50 participants"),
        ("Subject", "Airline information system"),
        ("Deliverable", "Shared platform base"),
    ],
    "body": """
  <h2 data-n="01">Context</h2>
  <p>A 50-participant enterprise architecture simulation: the information system of a
  miniature airline, split across several application teams that have to integrate with
  each other. The obvious risk is that every team builds in its own corner and nothing
  talks to anything by the end.</p>

  <h2 data-n="02">My role</h2>
  <p>I led the DevOps workstream. I shipped no business feature: I provided the base the
  other teams build on, and made sure they actually used it. It is a cross-cutting role —
  adoption is earned, not decreed.</p>

  <h2 data-n="03">What I did</h2>
  <ul>
    <li><strong>Shared standards:</strong> API conventions, log format, service boundaries
    — the common vocabulary that lets separate teams integrate.</li>
    <li><strong>CI/CD:</strong> a single GitLab CI/CD chain, picked up by every application
    team.</li>
    <li><strong>Observability:</strong> Prometheus, Grafana and Loki, so that diagnosis
    does not depend on who has a console open.</li>
    <li><strong>Integration:</strong> a RabbitMQ bus between services, with the
    corresponding message contracts.</li>
  </ul>
  <p class="kv">FastAPI · Python · PostgreSQL · RabbitMQ · Docker · Docker Compose ·
  GitLab CI/CD · Prometheus · Grafana · Loki · Alembic · HTTPX</p>

  <h2 data-n="04">Outcome</h2>
  <p>A common base mandated and genuinely adopted across a 50-participant simulation.
  """ + TODO + """ number of teams and services integrated onto the base.</p>

  <h2 data-n="05">What I took from it</h2>
  <p>At 50 people the bottleneck stops being technical. A standard only gets adopted if
  following it is faster than working around it, and half the job is walking over to each
  team rather than writing better documentation.</p>
""",
}

# ──────────────────────────────────────────────────────────────── IPSOS
PAGES["ipsos"] = {
    "title": "Ipsos — rebuilding the Excel export engine",
    "subtitle": "A financial export that crashed past 50,000 rows, rewritten as pure "
                "streaming: from 3–4 GB of memory down to 100–200 MB.",
    "description": "Ipsos Global BI: rewrote the Excel export engine of a C#/ASP.NET "
                   "financial portal used in 90+ countries — Open XML SDK in SAX mode, "
                   "memory flat at 100–200 MB, 1M rows in 2 minutes.",
    "anchor": "software",
    "section_label": "03 Software Engineering",
    "meta": [
        ("Role", "Software Developer"),
        ("Team", "Global Business Intelligence"),
        ("Period", "Sept 2025 – Jan 2026"),
        ("Stack", "C# / ASP.NET / SQL Server"),
    ],
    "body": """
  <h2 data-n="01">Context</h2>
  <p>An internal financial portal in C# / ASP.NET, hosted on IIS with SQL Server, used by
  management controllers in <strong>more than 90 countries</strong>. Team spread across
  Europe, North America and India; work in English, Jira, agile cadence.</p>
  <p>The Excel export engine threw <code>OutOfMemoryException</code> as soon as a report
  went past 50,000 rows. Users worked around it by splitting exports by hand — when they
  remembered to.</p>

  <h2 data-n="02">Diagnosis</h2>
  <p>V1 loaded the entire SQL result set into a <code>DataTable</code>, then let EPPlus
  assemble the workbook in memory. The data therefore existed twice, and the large string
  arrays went straight onto the Large Object Heap, which fragments and is not
  compacted.</p>
  <div class="callout">
    <span class="mono">Measured before the rewrite</span>
    <p><strong>3 to 4 GB</strong> of memory consumed for <strong>50 MB</strong> of actual
    data. Crash at 45 s on the largest reports.</p>
  </div>

  <h2 data-n="03">The rewrite</h2>
  <p>Rewritten as pure streaming: the data set is never fully materialised in memory.</p>
  <ul>
    <li><strong>Open XML SDK in SAX mode</strong> — rows are written as they come instead
    of being assembled into a tree.</li>
    <li><strong><code>IDataReader</code> in <code>SequentialAccess</code></strong> — data
    is read column by column from SQL Server, with no intermediate buffer.</li>
    <li><strong>Direct <code>FileStream</code> writes</strong> — the file is built on disk,
    not in RAM.</li>
    <li><strong>A single indexed stylesheet</strong> — formats are declared once and
    referenced, rather than recreated per cell.</li>
    <li><strong>No-allocation parsers</strong> on the hot paths, to avoid producing
    millions of temporary objects.</li>
    <li><strong>Two-pass predictive auto-fit</strong> — column widths are estimated during
    streaming, without re-reading the file.</li>
    <li><strong>Recompression of the <code>.xlsx</code></strong> on output.</li>
  </ul>

  <h2 data-n="04">Outcome</h2>
  <div class="callout">
    <p><strong>Memory flat at 100–200 MB</strong>, whatever the report size.</p>
    <p><strong>1 million rows exported in ~2 minutes</strong>, where V1 crashed after 45
    seconds.</p>
    <p><strong>OOM incidents disappeared from the production logs.</strong></p>
    <p><strong>Files 20–30% smaller</strong> after recompression.</p>
  </div>

  <h2 data-n="05">Second workstream</h2>
  <p>Refactored a Python forecasting pipeline: robustness against degraded input data,
  structured logs usable in production, and encapsulation behind an API to decouple the
  pipeline from its callers.</p>

  <h2 data-n="06">What I took from it</h2>
  <p>The win did not come from micro-optimisation but from a change of model: stop
  materialising. And working in English across three time zones teaches you to write
  tickets and commits that stand on their own, because nobody will be around to explain
  them.</p>
""",
}

# ──────────────────────────────────────────────────────────────── DANONE
PAGES["danone"] = {
    "title": "Danone — SAP S/4HANA Finance architecture",
    "subtitle": "Conceptual foundation, mapping of financial flows, and defending the "
                "target architecture in front of a panel.",
    "description": "SAP S/4HANA Finance architecture engagement for Danone (SIGL "
                   "programme): conceptual foundation, mapping of flows and business "
                   "objects, architecture deck and defence.",
    "anchor": "consulting",
    "section_label": "04 Consulting & IS",
    "meta": [
        ("Role", "Architecture &amp; scoping"),
        ("Domain", "Finance"),
        ("Target", "SAP S/4HANA"),
        ("Deliverable", "Deck + defence"),
    ],
    "body": """
  <h2 data-n="01">Context</h2>
  <p>A Finance transformation programme on SAP S/4HANA. The point of the scoping phase is
  not to pick modules, but to lay a conceptual foundation clear enough that the
  architecture decisions that follow can actually be argued about.</p>

  <h2 data-n="02">What I did</h2>
  <ul>
    <li>Conceptual foundation for the Finance domain: business objects, master data,
    ownership boundaries.</li>
    <li>Mapping of financial flows and of the interfaces with the rest of the IS.</li>
    <li>Target architecture deck, built to be defended in front of business stakeholders
    as much as technical ones.</li>
    <li>Defence in front of a panel.</li>
  </ul>

  <h2 data-n="03">Outcome</h2>
  <p>""" + TODO + """ functional scope covered by the mapping, or defence grade.</p>

  <h2 data-n="04">What I took from it</h2>
  <p>In front of a business decision-maker, an architecture is not defended on technical
  correctness but on how clearly it frames the trade-offs. A diagram you cannot explain in
  two minutes does not exist in the room.</p>
""",
}

# ──────────────────────────────────────────────────────────────── BEBLOOD
PAGES["beblood"] = {
    "title": "BeBlood — HRIS transformation (Oracle HCM)",
    "subtitle": "Effort estimation by Monte-Carlo simulation at P80, plus a risk register "
                "— replacing a single number with a defensible range.",
    "description": "BeBlood: HRIS transformation workstream on Oracle HCM — effort "
                   "estimation by Monte-Carlo simulation at P80, and the associated risk "
                   "register.",
    "anchor": "consulting",
    "section_label": "04 Consulting & IS",
    "meta": [
        ("Role", "Estimation &amp; risk"),
        ("Domain", "HRIS"),
        ("Solution", "Oracle HCM"),
        ("Method", "Monte-Carlo, P80"),
    ],
    "body": """
  <h2 data-n="01">Context</h2>
  <p>HRIS transformation on Oracle HCM. The question put to the workstream was not "how
  much does this cost" but "with what confidence can we state that number".</p>

  <h2 data-n="02">What I did</h2>
  <p>Effort estimation by Monte-Carlo simulation rather than by summing averages. Each
  work package is estimated as a range — optimistic, likely, pessimistic — then the model
  draws thousands of scenarios to produce a distribution of total effort. We report the
  <strong>P80</strong>: the effort figure that covers 80% of simulated scenarios.</p>
  <p>Alongside it, the workstream risk register: identification, rating, owner and
  mitigation for each retained risk.</p>

  <h2 data-n="03">Outcome</h2>
  <p>A defensible effort range with its confidence level attached, instead of a single
  number pulled out of a spreadsheet. """ + TODO + """ estimated effort and the spread
  between P50 and P80.</p>

  <h2 data-n="04">What I took from it</h2>
  <p>The sum of average estimates is almost always optimistic: it ignores that overruns
  compound while savings do not. Reporting a P80 rather than a mean changes the
  conversation with the sponsor — you discuss an accepted level of risk, not a number to
  negotiate down.</p>
""",
}

# ──────────────────────────────────────────────────────────────── EBIOS
PAGES["ebios"] = {
    "title": "EBIOS Risk Manager assessment",
    "subtitle": "A full assessment on a target information system, from security baseline "
                "to operational scenarios and their treatment.",
    "description": "End-to-end EBIOS Risk Manager assessment on a target information "
                   "system: scoping, risk sources, strategic and operational scenarios, "
                   "risk treatment.",
    "anchor": "consulting",
    "section_label": "04 Consulting & IS",
    "meta": [
        ("Role", "Risk assessment"),
        ("Method", "EBIOS Risk Manager"),
        ("Scope", "Target IS"),
        ("Workshops", "1 to 5"),
    ],
    "body": """
  <h2 data-n="01">The method</h2>
  <p>EBIOS Risk Manager runs as five workshops, from scoping to the treatment plan. Its
  value is not the formalism but the fact that it forces you to name an attacker, their
  objective and their path — instead of listing vulnerabilities out of context.</p>

  <h2 data-n="02">What I did</h2>
  <ul>
    <li><strong>Scoping and security baseline:</strong> perimeter, business values,
    supporting assets, gaps against the regulatory baseline.</li>
    <li><strong>Risk sources:</strong> source / target-objective pairs, selected and
    justified.</li>
    <li><strong>Strategic scenarios:</strong> attack paths running through the ecosystem
    and its stakeholders.</li>
    <li><strong>Operational scenarios:</strong> technical breakdown of the retained paths,
    down to modes of operation.</li>
    <li><strong>Risk treatment:</strong> controls, prioritisation, accepted residual
    risk.</li>
  </ul>

  <h2 data-n="03">Outcome</h2>
  <p>""" + TODO + """ number of operational scenarios retained and controls arbitrated.</p>

  <h2 data-n="04">What I took from it</h2>
  <p>The step from the strategic workshop to the operational one is where most assessments
  hollow out: the link between the real threat and the technical control gets lost. Holding
  that link is what makes the treatment plan fundable.</p>
""",
}

# ──────────────────────────────────────────────────────────────── LENDR
PAGES["lendr"] = {
    "title": "Lendr — smart lockers with AI condition checks",
    "subtitle": "A co-founded B2B startup. Repositioning the product from education to "
                "field service, and building the financial model behind it.",
    "description": "Lendr: B2B startup building connected lockers with AI-based condition "
                   "verification — repositioned towards industrial field service, hardware "
                   "BOM, 5-year financial model and investor deck.",
    "anchor": "product",
    "section_label": "05 Product & Entrepreneurship",
    "meta": [
        ("Role", "Co-founder — product"),
        ("Model", "B2B"),
        ("Market", "Field service / maintenance"),
        ("Deliverables", "BMC, BOM, P&amp;L, deck"),
    ],
    "body": """
  <h2 data-n="01">The product</h2>
  <p>A connected locker that uses AI to check the condition of equipment as it is returned:
  the loan is tracked and damage is recorded at the source, not three weeks later when
  nobody remembers who had the key.</p>

  <h2 data-n="02">The repositioning</h2>
  <p>The first positioning targeted schools. That market proved too narrow and, more
  importantly, unable to pay: the cost of lost equipment there is not painful enough to
  trigger a purchase.</p>
  <p>We repositioned towards <strong>field service and industrial maintenance</strong>,
  where tooling is expensive, circulates between technicians and genuinely goes missing.
  Incumbents exist there — CribMaster, SupplyPoint — which is a good sign: the need is
  proven and budgeted.</p>

  <h2 data-n="03">What I produced</h2>
  <ul>
    <li><strong>Business model canvas</strong> after repositioning.</li>
    <li><strong>Hardware BOM</strong> — bill of materials and unit cost of the locker.</li>
    <li><strong>Financial model in Excel:</strong> P&amp;L, 5-year projections, fundraising
    and leverage analysis.</li>
    <li><strong>Investor pitch deck.</strong></li>
  </ul>

  <h2 data-n="04">Outcome</h2>
  <p>""" + TODO + """ BOM unit cost, or modelled raise amount and resulting runway.</p>

  <h2 data-n="05">What I took from it</h2>
  <p>A market with no competitor is almost never an opportunity: usually it is a market
  that does not pay. And building the P&amp;L before the prototype changes what you decide
  to build — the BOM cost constrains the feature set, not the other way round.</p>
""",
}
