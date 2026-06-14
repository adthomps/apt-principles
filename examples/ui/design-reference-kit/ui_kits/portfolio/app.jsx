/* APT Portfolio UI kit — interactive app.
   Routes between Home (cosmic hero + featured), Labs grid, Proof grid,
   and a lab/proof detail view. Click-through, no real backend. */

const LABS = [
  {
    id: "dream-to-deliver",
    icon: "Sparkles", kind: "Concept", kindVariant: "primary", status: "Live",
    title: "AI PM: Dream to Deliver",
    description: "An agent workflow that turns a product dream into a structured delivery plan — specs, decisions, and acceptance criteria.",
    tags: ["Web", "Cloudflare", "OpenAI"], date: "Aug 31, 2025", action: "Open proof",
    problem: "Product ideas die in the gap between intent and execution.",
  },
  {
    id: "vas-agent-toolkit",
    icon: "Lightbulb", kind: "Prototype", kindVariant: "primary", status: "Stable",
    title: "Visa Acceptance Agent Toolkit",
    description: "A POC payment agent built directly on an AI SDK, exploring value-added services through a structured tool interface.",
    tags: ["Payments", "Vercel AI", "TypeScript"], date: "Jul 12, 2025", action: "Open repo",
    problem: "Agents need safe, typed access to payment value-added services.",
  },
  {
    id: "transaction-analysis",
    icon: "FlaskConical", kind: "Mock", kindVariant: "primary", status: "Concept",
    title: "AI Transaction Analysis",
    description: "System instructions and adaptive UI zones for surfacing fraud insight inside an enterprise design system.",
    tags: ["Web", "Design System", "AI"], date: "Jun 03, 2025", action: "Open Figma", statusVariant: "muted",
    problem: "Risk insight must stay compliant, accessible, and explainable.",
  },
];

const PROOF = [
  {
    id: "apt-principles",
    icon: "BookMarked", kind: "System", kindVariant: "primary", status: "Stable",
    title: "APT Principles",
    description: "Canonical doctrine and build kit — tokens, lint gates, checklists, and reusable AI prompts that govern every APT surface.",
    tags: ["Doctrine", "Tokens", "Validation"], date: "May 31, 2026", action: "Open repo",
  },
  {
    id: "applied-site",
    icon: "Globe", kind: "System", kindVariant: "primary", status: "Live",
    title: "Applied Practical Thinking",
    description: "The public presentation layer — a React/Vite/Tailwind portfolio that implements the full APT design system end to end.",
    tags: ["React", "Cloudflare", "Vite"], date: "May 28, 2026", action: "Open repo",
  },
  {
    id: "apt-coach",
    icon: "Compass", kind: "System", kindVariant: "primary", status: "Stable",
    title: "APT Coach",
    description: "A practical app shell and hybrid top-navigation pattern that became the baseline header contract for APT product surfaces.",
    tags: ["App Shell", "Navigation"], date: "Apr 18, 2026", action: "Open repo",
  },
];

const { useState, useEffect } = React;

function HomePage({ onNavigate, onOpen }) {
  return (
    <div>
      <CosmicBackground style={{ minHeight: "62vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "64px 0" }}>
        <div className="container" style={{ maxWidth: 780, textAlign: "center" }}>
          <div className="apt-fade-in" style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
            <AptEmblem size="xl" glow="strong" animated />
          </div>
          <div className="apt-slide-up">
            <h1 style={{ fontSize: "clamp(2.75rem,6vw,4.25rem)", fontWeight: 700, letterSpacing: "-.02em", margin: 0, lineHeight: 1.02 }}>APT</h1>
            <p style={{ fontSize: "clamp(1rem,2vw,1.25rem)", color: "hsl(var(--muted-foreground))", fontWeight: 500, marginTop: 6 }}>
              Systems over screens. Decisions over demos.
            </p>
          </div>
          <p className="apt-slide-up" style={{ color: "hsl(var(--muted-foreground))", fontSize: "1.05rem", lineHeight: 1.6, maxWidth: 600, margin: "26px auto 0" }}>
            Turning real-world product, platform, and engineering problems into working
            systems, reference implementations, and reusable patterns.
          </p>
          <div className="apt-slide-up" style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 34, flexWrap: "wrap" }}>
            <Button variant="primary" size="lg" pill onClick={() => onNavigate("Labs")}>
              Explore the Labs <Icon name="ArrowRight" size={18} />
            </Button>
            <Button variant="outline" size="lg" pill onClick={() => onNavigate("Proof")}>View the Proof</Button>
          </div>
        </div>
      </CosmicBackground>

      <section className="section">
        <div className="container">
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24 }}>
            <div>
              <div className="eyebrow">From the Labs</div>
              <h2 className="apt-h2" style={{ margin: "8px 0 0" }}>Experiments &amp; concepts</h2>
            </div>
            <span className="browse__action" onClick={() => onNavigate("Labs")}>
              All labs <Icon name="ArrowRight" size={15} />
            </span>
          </div>
          <div className="grid-3">
            {LABS.map((l) => <BrowseCard key={l.id} item={l} onOpen={onOpen} />)}
          </div>
        </div>
      </section>
    </div>
  );
}

function GridPage({ eyebrow, title, intro, items, onOpen }) {
  return (
    <section className="section">
      <div className="container">
        <div className="eyebrow">{eyebrow}</div>
        <h1 className="apt-h1" style={{ margin: "10px 0 8px" }}>{title}</h1>
        <p style={{ color: "hsl(var(--muted-foreground))", fontSize: "1rem", maxWidth: 560, margin: "0 0 30px" }}>{intro}</p>
        <div className="grid-3">
          {items.map((it) => <BrowseCard key={it.id} item={it} onOpen={onOpen} />)}
        </div>
      </div>
    </section>
  );
}

function DetailPage({ item, onBack }) {
  return (
    <CosmicBackground style={{ minHeight: "70vh" }}>
      <section className="section">
        <div className="container" style={{ maxWidth: 820 }}>
          <span className="browse__action" onClick={onBack} style={{ marginBottom: 22 }}>
            <Icon name="ArrowLeft" size={15} /> Back
          </span>
          <div style={{ display: "flex", gap: 16, alignItems: "center", marginTop: 18 }}>
            <div className="browse__icon" style={{ width: 56, height: 56 }}><Icon name={item.icon} size={26} /></div>
            <div>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <Tag variant="primary" size="sm">{item.kind}</Tag>
                {item.status && (
                  <span className={`status status--${(item.status || "").toLowerCase()}`}>
                    <span className="dot" />{item.status}
                  </span>
                )}
              </div>
              <h1 className="apt-h1" style={{ margin: 0 }}>{item.title}</h1>
            </div>
          </div>
          {item.problem && (
            <div className="card card--glass" style={{ padding: 20, marginTop: 28 }}>
              <div className="eyebrow" style={{ marginBottom: 6 }}>Problem</div>
              <p style={{ margin: 0, color: "hsl(var(--primary))", fontWeight: 500, fontSize: "1.05rem" }}>{item.problem}</p>
            </div>
          )}
          <p style={{ fontSize: "1.1rem", lineHeight: 1.7, color: "hsl(var(--foreground) / .92)", marginTop: 28 }}>
            {item.description}
          </p>
          <div className="browse__meta" style={{ marginTop: 22 }}>
            {(item.tags || []).map((t) => <Tag key={t} variant="muted">{t}</Tag>)}
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 30 }}>
            <Button variant="primary"><Icon name="ExternalLink" size={16} /> {item.action || "Open"}</Button>
            <Button variant="outline" onClick={onBack}>Back to browse</Button>
          </div>
          <p style={{ fontSize: "12.5px", color: "hsl(var(--muted-foreground))", marginTop: 26 }}>
            Published {item.date} · This is a demonstration, not a production system.
          </p>
        </div>
      </section>
    </CosmicBackground>
  );
}

function PortfolioApp() {
  const [page, setPage] = useState("Home");
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    if (window.lucide && window.lucide.createIcons) {
      // ensure any leftover <i data-lucide> are upgraded (none here, but safe)
    }
  });

  const navigate = (p) => { setDetail(null); setPage(p); window.scrollTo({ top: 0 }); };
  const open = (item) => { setDetail(item); window.scrollTo({ top: 0 }); };
  const back = () => { setDetail(null); window.scrollTo({ top: 0 }); };

  let body;
  if (detail) body = <DetailPage item={detail} onBack={back} />;
  else if (page === "Labs") body = <GridPage eyebrow="Labs" title="Experiments, concepts &amp; prototypes" intro="Work in motion — explorations that turn a hunch into something you can open and try." items={LABS} onOpen={open} />;
  else if (page === "Proof") body = <GridPage eyebrow="Proof" title="Stable, complete systems" intro="Implementation proof: systems that are built, documented, and running." items={PROOF} onOpen={open} />;
  else body = <HomePage onNavigate={navigate} onOpen={open} />;

  return (
    <div>
      <AptNav active={detail ? null : page} onNavigate={navigate} />
      {body}
      <AptFooter />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<PortfolioApp />);
