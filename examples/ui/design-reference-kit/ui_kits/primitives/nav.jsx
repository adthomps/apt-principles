/* APT Primitives — Navigation: tabs, breadcrumbs, pagination, stepper. */
const { useState: useStateNav } = React;

/* ---- Tabs (underline) ---- */
const TAB_ITEMS = [
  { id: "labs", label: "Labs", icon: "FlaskConical", count: 12 },
  { id: "proof", label: "Proof", icon: "ShieldCheck", count: 5 },
  { id: "drafts", label: "Drafts", icon: "PencilLine", count: 3 },
];
const TAB_COPY = {
  labs: "Experiments, concepts, and live demos in active development.",
  proof: "Stable systems promoted from Labs after passing every lint gate.",
  drafts: "Private working notes not yet ready for review.",
};
function TabsUnderline() {
  const [on, setOn] = useStateNav("labs");
  return (
    <div style={{ width: "100%" }}>
      <div className="tabs" role="tablist">
        {TAB_ITEMS.map((t) => (
          <button key={t.id} className={on === t.id ? "on" : ""} onClick={() => setOn(t.id)} role="tab" aria-selected={on === t.id}>
            <Icon name={t.icon} /><span>{t.label}</span><span className="count">{t.count}</span>
          </button>
        ))}
      </div>
      <div className="tabpanel">{TAB_COPY[on]}</div>
    </div>
  );
}

/* ---- Tabs (pill / segmented) ---- */
function TabsPill() {
  const [on, setOn] = useStateNav("month");
  const items = [{ id: "week", l: "Week" }, { id: "month", l: "Month" }, { id: "quarter", l: "Quarter" }];
  return (
    <div className="tabpills">
      {items.map((t) => (
        <button key={t.id} className={on === t.id ? "on" : ""} onClick={() => setOn(t.id)}>{t.l}</button>
      ))}
    </div>
  );
}

/* ---- Breadcrumbs ---- */
function Breadcrumbs() {
  const [expanded, setExpanded] = useStateNav(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
      <nav className="crumbs" aria-label="Breadcrumb">
        <a href="#"><Icon name="House" size={14} /> Home</a>
        <span className="sep"><Icon name="ChevronRight" /></span>
        <a href="#">Labs</a>
        <span className="sep"><Icon name="ChevronRight" /></span>
        <a href="#">Payments</a>
        <span className="sep"><Icon name="ChevronRight" /></span>
        <span className="cur">Decision graph</span>
      </nav>
      <nav className="crumbs" aria-label="Breadcrumb collapsed">
        <a href="#"><Icon name="House" size={14} /></a>
        <span className="sep"><Icon name="ChevronRight" /></span>
        {expanded ? (
          <>
            <a href="#">Labs</a>
            <span className="sep"><Icon name="ChevronRight" /></span>
            <a href="#">Payments</a>
          </>
        ) : (
          <span className="more" onClick={() => setExpanded(true)} title="Show all">…</span>
        )}
        <span className="sep"><Icon name="ChevronRight" /></span>
        <a href="#">Gateway</a>
        <span className="sep"><Icon name="ChevronRight" /></span>
        <span className="cur">Webhooks</span>
      </nav>
    </div>
  );
}

/* ---- Pagination ---- */
function pageList(cur, total) {
  const out = [];
  const push = (v) => out.push(v);
  push(1);
  if (cur > 3) push("…");
  for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) push(i);
  if (cur < total - 2) push("…");
  if (total > 1) push(total);
  return out;
}
function Pagination() {
  const total = 12;
  const [cur, setCur] = useStateNav(4);
  return (
    <div className="pager">
      <button disabled={cur === 1} onClick={() => setCur((c) => Math.max(1, c - 1))}><Icon name="ChevronLeft" /> Prev</button>
      {pageList(cur, total).map((p, i) =>
        p === "…"
          ? <span key={"g" + i} className="gap">…</span>
          : <button key={p} className={p === cur ? "on" : ""} onClick={() => setCur(p)}>{p}</button>
      )}
      <button disabled={cur === total} onClick={() => setCur((c) => Math.min(total, c + 1))}>Next <Icon name="ChevronRight" /></button>
    </div>
  );
}

/* ---- Stepper / wizard ---- */
const WIZ = [
  { t: "Account", s: "Identity" },
  { t: "Workspace", s: "Name & theme" },
  { t: "Connect", s: "Link a repo" },
  { t: "Review", s: "Confirm" },
];
function Stepper() {
  const [cur, setCur] = useStateNav(2); // 0-indexed active
  return (
    <div style={{ width: "100%" }}>
      <div className="stepper">
        {WIZ.map((w, i) => {
          const done = i < cur, active = i === cur;
          return (
            <React.Fragment key={w.t}>
              <div className={`node${done ? " done" : ""}${active ? " active" : ""}`} onClick={() => setCur(i)}>
                <div className="bead">{done ? <Icon name="Check" /> : i + 1}</div>
                <div className="lbl"><b>{w.t}</b><small>{w.s}</small></div>
              </div>
              {i < WIZ.length - 1 && <div className={`bar${i < cur ? " fill" : ""}`} />}
            </React.Fragment>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 22 }}>
        <button className="btn btn--outline btn--sm" disabled={cur === 0} onClick={() => setCur((c) => Math.max(0, c - 1))} style={{ opacity: cur === 0 ? .5 : 1 }}>Back</button>
        <button className="btn btn--primary btn--sm" disabled={cur === WIZ.length - 1} onClick={() => setCur((c) => Math.min(WIZ.length - 1, c + 1))} style={{ opacity: cur === WIZ.length - 1 ? .5 : 1 }}>Continue</button>
      </div>
    </div>
  );
}

function NavigationView() {
  return (
    <div>
      <StageHead title="Navigation">Moving between views and through long content — tabs, breadcrumbs, pagination, and multi-step flows. Every one is keyboard- and pointer-driven; try them.</StageHead>
      <div className="specs">
        <Spec title="Tabs" tag="underline" desc="Primary in-page view switch. Active tab carries a 2px primary underline; counts ride in muted pills." note={<>The underline tab is the default. Selected state uses <b>foreground text + primary underline</b> — never a filled background.</>}>
          <TabsUnderline />
        </Spec>
        <Spec title="Segmented tabs" tag="pill" desc="Compact switch for 2–4 short, equal options like a time range." center note={<>Use for short scopes inside a card header. The selected pill lifts onto a <code>card</code> surface.</>}>
          <TabsPill />
        </Spec>
        <Spec title="Breadcrumbs" desc="Show location in a hierarchy. Collapses the middle with an … that expands on click." note={<>Last item is the current page (non-link). Collapse the middle when depth &gt; 4.</>}>
          <Breadcrumbs />
        </Spec>
        <Spec title="Pagination" desc="Numbered pages with prev/next and ellipsis truncation around the current page." center note={<>Disable <b>Prev/Next</b> at the ends. Current page is the only filled (primary) control.</>}>
          <Pagination />
        </Spec>
        <Spec title="Stepper / wizard" span desc="Linear multi-step flows — checkout, onboarding, setup. Done steps fill primary; the active step gets a focus halo; the connector fills as you advance." note={<>Keep steps to 3–5. Show <b>done · active · upcoming</b> distinctly; the connecting bar mirrors progress.</>}>
          <Stepper />
        </Spec>
      </div>
    </div>
  );
}

window.NavigationView = NavigationView;
