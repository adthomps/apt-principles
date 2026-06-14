/* APT Docs / Principles UI kit — doctrine browser. */

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

const TREE = [
  { group: "Foundations", icon: "Compass", items: ["Overview", "Framework", "Thinking"] },
  { group: "Practice", icon: "Layers", items: ["Design Principles", "System Standards", "Architecture"] },
  { group: "Operate", icon: "ShieldCheck", items: ["Security", "Validation", "Lint Gates"] },
];

const DOC = {
  title: "Design Principles",
  status: "Draft · v1",
  updated: "Updated May 31, 2026",
  lead: "Design keeps product behavior coherent across every APT surface. These are the rules that govern color, type, layout, and state — applied the same way whether the output is production code or a throwaway prototype.",
  toc: [
    { id: "overview", label: "Overview" },
    { id: "color", label: "Color discipline" },
    { id: "states", label: "Complete states" },
    { id: "tokens", label: "Working with tokens" },
  ],
};

function Sidebar({ active, onSelect }) {
  return (
    <nav className="docnav">
      {TREE.map((sec) => (
        <div className="docnav__group" key={sec.group}>
          <div className="docnav__gh"><Icon name={sec.icon} />{sec.group}</div>
          {sec.items.map((it) => (
            <span key={it} className={`docnav__item${active === it ? " active" : ""}`} onClick={() => onSelect(it)}>{it}</span>
          ))}
        </div>
      ))}
    </nav>
  );
}

function Toc({ active, onSelect }) {
  return (
    <aside className="toc">
      <div className="toc__h">On this page</div>
      {DOC.toc.map((t) => (
        <span key={t.id} className={`toc__item${active === t.id ? " active" : ""}`} onClick={() => onSelect(t.id)}>{t.label}</span>
      ))}
    </aside>
  );
}

function Article() {
  return (
    <article className="doc">
      <div className="doc__bc"><Icon name="Compass" /> Principles <Icon name="ChevronRight" /> Practice <Icon name="ChevronRight" /> <span style={{ color: "hsl(var(--foreground))" }}>Design Principles</span></div>
      <div className="doc__meta">
        <span className="chip chip--status"><span className="dot" />{DOC.status}</span>
        <span className="chip"><Icon name="Clock" />{DOC.updated}</span>
        <span className="chip"><Icon name="User" />APT</span>
      </div>
      <h1>{DOC.title}</h1>
      <p className="doc__lead">{DOC.lead}</p>

      <h2 id="overview"><span className="hash">#</span> Overview</h2>
      <p>APT favors <strong>systems over screens</strong>. A design choice is only finished when it is expressed
        as a reusable token or pattern — not a one-off value pasted into a single view. Every surface reads from
        the same foundations so the brand stays coherent as it scales.</p>
      <div className="callout callout--rule">
        <Icon name="Info" />
        <p><strong>Principle.</strong> Clarity over cleverness. Structure over decoration. Consistency over novelty.</p>
      </div>

      <h2 id="color"><span className="hash">#</span> Color discipline</h2>
      <p>Blue is the single brand and action color. It carries the emblem, primary actions, links, focus rings,
        and active navigation. Teal is a <strong>restricted</strong> accent — permitted for success, section
        identity, and chart accents only.</p>
      <table className="tbl">
        <thead><tr><th>Role</th><th>Token</th><th>Use</th></tr></thead>
        <tbody>
          <tr><td>Brand / action</td><td><code>--primary</code></td><td>CTAs, links, focus, active nav</td></tr>
          <tr><td>Restricted accent</td><td><code>--accent</code></td><td>Success, section identity, charts</td></tr>
          <tr><td>Feedback</td><td><code>--destructive</code></td><td>Errors &amp; destructive actions only</td></tr>
        </tbody>
      </table>
      <div className="callout callout--warn">
        <Icon name="TriangleAlert" />
        <p><strong>Lint gate.</strong> Using teal as the default CTA, hover, focus, or active-nav color is a critical failure.</p>
      </div>

      <h2 id="states"><span className="hash">#</span> Complete states</h2>
      <p>Every data-driven view must define all of its states up front. Loading uses skeletons that hold layout;
        empty offers one clear next action; error is honest and recoverable; success confirms quietly.</p>
      <ul>
        <li><strong>Loading</strong> — shimmer skeletons, stable grid tracks.</li>
        <li><strong>Empty</strong> — calm icon, one primary action.</li>
        <li><strong>Error</strong> — message, request ID, retry.</li>
        <li><strong>Success</strong> — teal check, confirmation copy.</li>
      </ul>

      <h2 id="tokens"><span className="hash">#</span> Working with tokens</h2>
      <p>Import the foundations and compose with channel-based HSL so alpha works everywhere:</p>
      <pre>
        <div className="pre__bar"><Icon name="FileCode2" size={13} /> button.css <span className="lng">css</span></div>
        <code>{`.btn-primary {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  box-shadow: var(--elevation-1);
}
.btn-primary:focus-visible {
  outline: 2px solid hsl(var(--ring) / 0.6);
}`}</code>
      </pre>
      <p>The same tokens drive a CLI tool — values stay in <code>IBM Plex Mono</code> for technical context:</p>
      <pre>
        <div className="pre__bar"><Icon name="Terminal" size={13} /> shell <span className="lng">bash</span></div>
        <code>{`$ apt tokens lint --surface proof
✓ color contrast        AA
✓ accent usage          within budget
✗ focus-ring on .tab    expected --ring`}</code>
      </pre>

      <div className="docfoot">
        <a href="#"><small>← Previous</small><div className="t">Thinking</div></a>
        <a href="#" className="next"><small>Next →</small><div className="t">System Standards</div></a>
      </div>
    </article>
  );
}

function DocsApp() {
  const [doc, setDoc] = useState("Design Principles");
  const [sec, setSec] = useState("color");
  return (
    <div>
      <header className="topnav">
        <div className="topnav__in">
          <div className="topnav__brand">
            <span className="topnav__em">A</span>
            <span className="topnav__name">APT<small>Principles</small></span>
          </div>
          <div className="topnav__search"><Icon name="Search" /> Search the doctrine <kbd>⌘K</kbd></div>
          <div className="topnav__sp" />
          <span className="topnav__link active">Docs</span>
          <span className="topnav__link">Changelog</span>
          <span className="topnav__link"><Icon name="Github" size={17} /></span>
        </div>
      </header>
      <div className="layout">
        <Sidebar active={doc} onSelect={setDoc} />
        <Article />
        <Toc active={sec} onSelect={setSec} />
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<DocsApp />);
