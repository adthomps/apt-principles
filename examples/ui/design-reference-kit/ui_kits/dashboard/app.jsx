/* APT Dashboard UI kit — components + interactive app. */

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

const NAV = [
  { group: "Overview", items: [
    { id: "Dashboard", icon: "LayoutDashboard" },
    { id: "Systems", icon: "Boxes", badge: "12" },
    { id: "Insights", icon: "LineChart" },
  ]},
  { group: "Operate", items: [
    { id: "Decisions", icon: "GitBranch" },
    { id: "Reviews", icon: "CheckSquare" },
    { id: "Files", icon: "FolderOpen" },
  ]},
  { group: "Account", items: [
    { id: "Settings", icon: "Settings" },
  ]},
];

function Sidebar({ active, onNavigate }) {
  return (
    <aside className="side">
      <div className="side__brand">
        <span className="side__em">A</span>
        <span className="side__name">APT<small>Console</small></span>
      </div>
      {NAV.map((sec) => (
        <React.Fragment key={sec.group}>
          <div className="side__group">{sec.group}</div>
          {sec.items.map((it) => (
            <div key={it.id} className={`side__item${active === it.id ? " active" : ""}`} onClick={() => onNavigate(it.id)}>
              <Icon name={it.icon} />
              <span>{it.id}</span>
              {it.badge && <span className="side__badge">{it.badge}</span>}
            </div>
          ))}
        </React.Fragment>
      ))}
      <div className="side__foot">
        <img className="side__avatar" src="../../assets/profile.jpg" alt="Adam Thompson" />
        <span className="side__user">Adam Thompson<small>Owner</small></span>
      </div>
    </aside>
  );
}

function Topbar({ page }) {
  return (
    <div className="topbar">
      <div>
        <div className="crumb">APT Console / {page}</div>
        <h1>{page}</h1>
      </div>
      <div className="spacer" />
      <div className="search"><Icon name="Search" /> Search systems, decisions…</div>
      <button className="iconbtn"><Icon name="Bell" /><span className="ping" /></button>
      <button className="iconbtn"><Icon name="Plus" /></button>
    </div>
  );
}

const KPIS = [
  { k: "Active systems", icon: "Boxes", v: "1,284", d: "+12.4%", up: true },
  { k: "Decisions logged", icon: "GitBranch", v: "342", d: "+18%", up: true },
  { k: "Reuse rate", icon: "Recycle", v: "76%", d: "+6%", up: true },
  { k: "Open exceptions", icon: "TriangleAlert", v: "9", d: "-3", up: false },
];

function KpiRow() {
  return (
    <div className="kpis">
      {KPIS.map((m) => (
        <div className="kpi" key={m.k}>
          <div className="kpi__k"><Icon name={m.icon} />{m.k}</div>
          <div className="kpi__v">{m.v}</div>
          <div className={`kpi__d ${m.up ? "up" : "down"}`}>
            <Icon name={m.up ? "TrendingUp" : "TrendingDown"} />{m.d} vs last period
          </div>
        </div>
      ))}
    </div>
  );
}

function TrendPanel() {
  return (
    <div className="panel">
      <div className="panel__head">
        <div>
          <div className="panel__title">Active systems</div>
          <div className="panel__sub">Last 8 weeks · this vs prior period</div>
        </div>
        <div className="legend">
          <span><i style={{ background: "hsl(220 70% 60%)" }} />This</span>
          <span><i style={{ background: "hsl(220 12% 50%)" }} />Prior</span>
        </div>
      </div>
      <svg width="100%" height="170" viewBox="0 0 620 170" preserveAspectRatio="none">
        <defs>
          <linearGradient id="dfill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(220 70% 55%)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(220 70% 55%)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[34, 76, 118].map((y) => <line key={y} x1="0" y1={y} x2="620" y2={y} stroke="hsl(220 15% 20%)" strokeWidth="1" />)}
        <path d="M0,130 L88,116 L176,122 L264,86 L352,92 L440,58 L528,64 L620,30 L620,150 L0,150 Z" fill="url(#dfill)" />
        <polyline points="0,142 88,138 176,128 264,130 352,108 440,112 528,96 620,84" fill="none" stroke="hsl(220 12% 52%)" strokeWidth="2" strokeDasharray="5 5" strokeLinecap="round" />
        <polyline points="0,130 88,116 176,122 264,86 352,92 440,58 528,64 620,30" fill="none" stroke="hsl(220 70% 60%)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="620" cy="30" r="4" fill="hsl(220 70% 65%)" />
      </svg>
      <div className="axis">{["W1","W2","W3","W4","W5","W6","W7","W8"].map((w) => <span key={w}>{w}</span>)}</div>
    </div>
  );
}

const MIX = [
  { n: "Proof systems", v: "55%", c: "hsl(220 70% 55%)" },
  { n: "Lab concepts", v: "23%", c: "hsl(165 45% 42%)" },
  { n: "Docs", v: "14%", c: "hsl(280 55% 58%)" },
  { n: "Other", v: "8%", c: "hsl(30 75% 52%)" },
];
function MixPanel() {
  return (
    <div className="panel">
      <div className="panel__head"><div><div className="panel__title">Portfolio mix</div><div className="panel__sub">By surface type</div></div></div>
      <div className="donut-row">
        <div className="donut" style={{ background: "conic-gradient(hsl(220 70% 55%) 0 55%, hsl(165 45% 42%) 55% 78%, hsl(280 55% 58%) 78% 92%, hsl(30 75% 52%) 92% 100%)" }} />
        <div className="dlist">
          {MIX.map((m) => (
            <div className="r" key={m.n}><i style={{ background: m.c }} /><span className="n">{m.n}</span><span className="v">{m.v}</span></div>
          ))}
        </div>
      </div>
    </div>
  );
}

const ROWS = [
  { name: "Dream to Deliver", kind: "Concept", icon: "Sparkles", owner: "AT", updated: "2h ago", status: "live", label: "Live", prog: 92 },
  { name: "VAS Agent Toolkit", kind: "Prototype", icon: "Lightbulb", owner: "AT", updated: "1d ago", status: "review", label: "In review", prog: 64 },
  { name: "Transaction Analysis", kind: "Mock", icon: "FlaskConical", owner: "AT", updated: "3d ago", status: "review", label: "In review", prog: 41 },
  { name: "APT Principles", kind: "System", icon: "BookMarked", owner: "AT", updated: "5d ago", status: "live", label: "Live", prog: 100 },
  { name: "Legacy importer", kind: "Job", icon: "Database", owner: "AT", updated: "6d ago", status: "failed", label: "Failed", prog: 18 },
];
function TablePanel() {
  return (
    <div className="tablewrap">
      <div className="thead">
        <div className="panel__title">Recent systems</div>
        <button className="btn btn--outline"><Icon name="Download" /> Export CSV</button>
      </div>
      <table>
        <thead><tr><th>System</th><th>Type</th><th>Status</th><th>Progress</th><th>Updated</th><th></th></tr></thead>
        <tbody>
          {ROWS.map((r) => (
            <tr key={r.name}>
              <td><div className="cellname"><span className="cellic"><Icon name={r.icon} size={15} /></span><span><b>{r.name}</b><small>owner · {r.owner}</small></span></div></td>
              <td>{r.kind}</td>
              <td><span className={`pill pill--${r.status}`}><span className="dot" />{r.label}</span></td>
              <td><div style={{ display: "flex", alignItems: "center", gap: 9 }}><div className="bar-mini"><i style={{ width: r.prog + "%" }} /></div><span style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>{r.prog}%</span></div></td>
              <td style={{ color: "hsl(var(--muted-foreground))" }}>{r.updated}</td>
              <td><span className="rowact"><Icon name="MoreHorizontal" size={16} /></span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DashboardApp() {
  const [page, setPage] = useState("Dashboard");
  return (
    <div className="app">
      <Sidebar active={page} onNavigate={setPage} />
      <div className="main">
        <Topbar page={page} />
        <div className="content">
          <div className="pagehead">
            <div>
              <div className="eyebrow">Overview</div>
              <h2>{page === "Dashboard" ? "Systems at a glance" : page}</h2>
            </div>
            <div className="headtools">
              <button className="btn btn--outline"><Icon name="Calendar" /> Last 8 weeks</button>
              <button className="btn btn--primary"><Icon name="Plus" /> New system</button>
            </div>
          </div>
          <KpiRow />
          <div className="panels"><TrendPanel /><MixPanel /></div>
          <TablePanel />
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<DashboardApp />);
