/* APT Product / Sales UI kit — marketing landing page. */

function Icon({ name, size = 18, className, style }) {
  const lib = typeof window !== "undefined" ? window.lucide : null;
  const data = lib && ((lib.icons && lib.icons[name]) || lib[name]);
  let inner = "";
  if (Array.isArray(data)) {
    inner = data.map(([tag, attrs]) => {
      const a = Object.entries(attrs || {}).map(([k, v]) => `${k}="${v}"`).join(" ");
      return `<${tag} ${a}></${tag}>`;
    }).join("");
  }
  return <svg className={className} style={style} width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    dangerouslySetInnerHTML={{ __html: inner }} />;
}

const { useState } = React;

function Nav() {
  return (
    <nav className="nav">
      <div className="container">
        <div className="nav__brand"><span className="nav__em">A</span><span className="nav__name">APT Forge</span></div>
        <div className="nav__links">
          <a href="#features">Features</a><a href="#pricing">Pricing</a><a href="#">Docs</a><a href="#">Changelog</a>
        </div>
        <div className="nav__sp" />
        <button className="btn btn--ghost">Sign in</button>
        <button className="btn btn--primary">Start free</button>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <header className="hero">
      <div className="container">
        <span className="hero__tag"><span className="dot" />New · Decision graphs in v2</span>
        <h1>Ship systems, <em>not screenshots.</em></h1>
        <p>APT Forge turns product decisions into working reference implementations — so your
          team builds on durable systems instead of re-deriving them every sprint.</p>
        <div className="hero__cta">
          <button className="btn btn--primary btn--lg btn--pill">Start free <Icon name="ArrowRight" size={18} /></button>
          <button className="btn btn--outline btn--lg btn--pill"><Icon name="PlayCircle" size={18} /> Watch the tour</button>
        </div>
        <div className="hero__note">
          <span><Icon name="Check" /> No credit card</span>
          <span><Icon name="Check" /> 14-day Pro trial</span>
          <span><Icon name="Check" /> Cancel anytime</span>
        </div>
      </div>
    </header>
  );
}

function Logos() {
  const logos = [
    { n: "Northwind", i: "Wind" }, { n: "Vertex", i: "Triangle" }, { n: "Cobalt", i: "Hexagon" },
    { n: "Meridian", i: "Globe" }, { n: "Atlas", i: "Mountain" },
  ];
  return (
    <div className="logos">
      <div className="container logos__in">
        <span className="logos__lbl">Trusted by teams at</span>
        {logos.map((l) => <span className="logos__logo" key={l.n}><Icon name={l.i} size={17} />{l.n}</span>)}
      </div>
    </div>
  );
}

const FEATURES = [
  { ic: "GitBranch", t: "Decision graphs", d: "Capture the decision, the alternatives, and the tradeoff — linked to the code that implements them." },
  { ic: "Boxes", t: "Reusable systems", d: "Promote any prototype to a documented, versioned reference the whole team can build on." },
  { ic: "ShieldCheck", t: "Lint gates", d: "Automated checks enforce color, type, and state rules so every surface ships on-brand." },
  { ic: "LineChart", t: "Live insight", d: "Track adoption, reuse rate, and open exceptions across every surface in one console." },
  { ic: "Workflow", t: "Agent-ready", d: "Typed tool interfaces let AI agents read and apply your patterns without re-deriving them." },
  { ic: "FileCode2", t: "Token exports", d: "One source of truth exports to CSS, Tailwind, and design tools — values never drift." },
];

function Features() {
  return (
    <section className="section" id="features">
      <div className="container">
        <div className="section__head">
          <div className="eyebrow">Why APT Forge</div>
          <h2>Everything a system needs to outlive the demo</h2>
          <p>Practical tooling for teams who treat decisions as the durable unit of engineering knowledge.</p>
        </div>
        <div className="features">
          {FEATURES.map((f) => (
            <div className="feature" key={f.t}>
              <div className="feature__ic"><Icon name={f.ic} size={21} /></div>
              <h3>{f.t}</h3>
              <p>{f.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const STATS = [
  { v: "1,284", l: "Active systems" }, { v: "76%", l: "Avg. reuse rate" },
  { v: "12k+", l: "Decisions logged" }, { v: "99.9%", l: "Lint pass rate" },
];
function Stats() {
  return (
    <div className="stats">
      <div className="container stats__in">
        {STATS.map((s) => <div key={s.l}><div className="stat__v">{s.v}</div><div className="stat__l">{s.l}</div></div>)}
      </div>
    </div>
  );
}

const TIERS = [
  { name: "Starter", desc: "For solo builders and experiments.", m: 0, a: 0, cta: "Start free", hl: false,
    feats: [["Up to 3 systems", 1], ["Decision graphs", 1], ["Community support", 1], ["Lint gates", 0], ["Insight console", 0]] },
  { name: "Pro", desc: "For teams shipping real systems.", m: 24, a: 19, cta: "Start 14-day trial", hl: true,
    feats: [["Unlimited systems", 1], ["Decision graphs", 1], ["Lint gates", 1], ["Insight console", 1], ["Token exports", 1]] },
  { name: "Enterprise", desc: "For orgs with governance needs.", m: null, a: null, cta: "Talk to us", hl: false,
    feats: [["Everything in Pro", 1], ["SSO & SCIM", 1], ["Audit log & roles", 1], ["Dedicated support", 1], ["Custom lint policy", 1]] },
];

function Pricing() {
  const [annual, setAnnual] = useState(true);
  const price = (t) => {
    if (t.m === null) return "Custom";
    const v = annual ? t.a : t.m;
    return v === 0 ? "$0" : "$" + v;
  };
  return (
    <section className="section" id="pricing">
      <div className="container">
        <div className="section__head">
          <div className="eyebrow">Pricing</div>
          <h2>Simple plans that scale with your systems</h2>
        </div>
        <div className="bill">
          <span className={!annual ? "on" : ""}>Monthly</span>
          <div className={`bill__sw${annual ? " annual" : ""}`} onClick={() => setAnnual(!annual)} role="switch" aria-checked={annual} />
          <span className={annual ? "on" : ""}>Annual</span>
          <span className="bill__save">Save 20%</span>
        </div>
        <div className="tiers">
          {TIERS.map((t) => (
            <div className={`tier${t.hl ? " tier--hl" : ""}`} key={t.name}>
              {t.hl && <span className="tier__pop">Most popular</span>}
              <div>
                <div className="tier__name">{t.name}</div>
                <div className="tier__desc">{t.desc}</div>
              </div>
              <div className="tier__price">
                <span className="tier__amt">{price(t)}</span>
                {t.m !== null && <span className="tier__per">{price(t) === "$0" ? "forever" : "/ seat / mo"}</span>}
              </div>
              <button className={`btn ${t.hl ? "btn--primary" : "btn--outline"}`} style={{ width: "100%" }}>{t.cta}</button>
              <ul className="tier__feats">
                {t.feats.map(([f, on]) => (
                  <li key={f} className={on ? "" : "off"}>
                    <Icon name={on ? "Check" : "Minus"} size={16} />{f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Quote() {
  return (
    <section className="section">
      <div className="container quote">
        <div className="quote__mark">"</div>
        <p>We stopped losing the <em style={{ color: "hsl(220 70% 68%)", fontStyle: "normal" }}>why</em> behind our
          architecture. APT Forge made our decisions reusable — onboarding went from weeks to days.</p>
        <div className="quote__by">
          <img className="quote__av" src="../../assets/profile.jpg" alt="Reviewer" />
          <div className="quote__who">Adam Thompson<small>Principal Engineer, Applied Practical Thinking</small></div>
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="container">
        <div className="cta">
          <div className="cta__glow" />
          <div className="cta__in">
            <h2>Build a system today</h2>
            <p>Start free in minutes. Bring your first decision and watch it become a reusable reference.</p>
            <div className="cta__row">
              <button className="btn btn--primary btn--lg btn--pill">Start free <Icon name="ArrowRight" size={18} /></button>
              <button className="btn btn--outline btn--lg btn--pill">Book a demo</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="foot">
      <div className="container foot__in">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="nav__em" style={{ width: 26, height: 26, fontSize: 12 }}>A</span>
          <span>© 2026 APT Forge · Applied Practical Thinking</span>
        </div>
        <span>This is a demonstration, not a production system.</span>
      </div>
    </footer>
  );
}

function ProductApp() {
  return (
    <div>
      <div className="cosmic">
        <div className="cosmic__glows" />
        <div className="cosmic__stars" />
        <div className="cosmic__in">
          <Nav />
          <Hero />
        </div>
      </div>
      <Logos />
      <Features />
      <Stats />
      <Pricing />
      <Quote />
      <FinalCta />
      <Footer />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<ProductApp />);
