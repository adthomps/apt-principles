/* APT Patterns UI kit — modals/dialogs, onboarding/empty, error pages. */

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

/* GitHub mark — lucide removed brand icons, so render the logo inline (fill-based). */
function GithubMark({ size = 16, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={style} aria-hidden="true">
      <path d="M12 .5C5.7.5.5 5.8.5 12.3c0 5.2 3.4 9.6 8 11.2.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.9 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.6 5 18.6 5.3 18.6 5.3c.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.6 8-6 8-11.2C23.5 5.8 18.3.5 12 .5z" />
    </svg>
  );
}

const { useState } = React;

/* ---------- Modal shell ---------- */
function Modal({ icon, iconKind = "primary", title, subtitle, children, footer, onClose, wide }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className={`modal${wide ? " modal--wide" : ""}`} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal__head">
          {icon && <div className={`modal__ic modal__ic--${iconKind}`}><Icon name={icon} size={21} /></div>}
          <div className="modal__titles">
            <div className="modal__t">{title}</div>
            {subtitle && <div className="modal__s">{subtitle}</div>}
          </div>
          <span className="modal__x" onClick={onClose}><Icon name="X" size={18} /></span>
        </div>
        {children && <div className="modal__body">{children}</div>}
        <div className={`modal__foot${footer && footer.split ? " modal__foot--split" : ""}`}>{footer.node}</div>
      </div>
    </div>
  );
}

/* ---------- Modals view ---------- */
const MODAL_TRIGGERS = [
  { id: "info", icon: "Info", h: "Information dialog", p: "A simple acknowledgement with a single primary action." },
  { id: "confirm", icon: "CircleHelp", h: "Confirmation", p: "Ask before a reversible action — cancel or proceed." },
  { id: "destructive", icon: "Trash2", h: "Destructive confirm", p: "Type-to-confirm gate for irreversible actions." },
  { id: "form", icon: "FolderPlus", h: "Form dialog", p: "Collect input inline without leaving the page." },
  { id: "success", icon: "CircleCheck", h: "Success dialog", p: "Confirm a completed action with next steps." },
];

function ModalsView({ onToast }) {
  const [open, setOpen] = useState(null);
  const [confirmText, setConfirmText] = useState("");
  const close = () => { setOpen(null); setConfirmText(""); };

  return (
    <div>
      <div className="stagehead">
        <div className="eyebrow">Patterns</div>
        <h1>Modals &amp; dialogs</h1>
        <p>Overlay surfaces for focused tasks and confirmations. Click a card to open each variant; click the scrim or ✕ to dismiss.</p>
      </div>
      <div className="triggers">
        {MODAL_TRIGGERS.map((t) => (
          <button className="trigger" key={t.id} onClick={() => setOpen(t.id)}>
            <div className="trigger__ic"><Icon name={t.icon} size={19} /></div>
            <h3>{t.h}</h3>
            <p>{t.p}</p>
          </button>
        ))}
      </div>

      {open === "info" && (
        <Modal icon="Sparkles" title="What's new in v2" subtitle="Decision graphs are here" onClose={close}
          footer={{ node: <button className="btn btn--primary" onClick={close}>Got it</button> }}>
          <p>You can now link every decision to the code that implements it, and trace the alternatives you considered. Existing systems were migrated automatically.</p>
        </Modal>
      )}

      {open === "confirm" && (
        <Modal icon="CircleHelp" title="Publish to Proof?" subtitle="This makes the system publicly visible" onClose={close}
          footer={{ split: false, node: <><button className="btn btn--outline" onClick={close}>Cancel</button><button className="btn btn--primary" onClick={() => { close(); onToast({ kind: "success", title: "Published", desc: "Your system is now live in Proof." }); }}>Publish</button></> }}>
          <p>Publishing runs the lint gates and promotes this system from your workspace to the public Proof surface. You can unpublish at any time.</p>
        </Modal>
      )}

      {open === "destructive" && (
        <Modal icon="Trash2" iconKind="danger" title="Delete “Dream to Deliver”?" subtitle="This action cannot be undone" onClose={close}
          footer={{ node: <><button className="btn btn--outline" onClick={close}>Cancel</button><button className="btn btn--danger" disabled={confirmText !== "Dream to Deliver"} style={{ opacity: confirmText !== "Dream to Deliver" ? .5 : 1 }} onClick={() => { close(); onToast({ kind: "error", title: "System deleted", desc: "“Dream to Deliver” was removed." }); }}>Delete forever</button></> }}>
          <p>This permanently removes the system, its decisions, and its history. To confirm, type its name below.</p>
          <div className="modal__field"><input placeholder="Dream to Deliver" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} /></div>
          <div className="modal__hint">Type <code>Dream to Deliver</code> to enable deletion.</div>
        </Modal>
      )}

      {open === "form" && (
        <Modal icon="FolderPlus" title="New system" subtitle="Start from a blank system" onClose={close} wide
          footer={{ node: <><button className="btn btn--outline" onClick={close}>Cancel</button><button className="btn btn--primary" onClick={() => { close(); onToast({ kind: "success", title: "System created", desc: "Your new system is ready." }); }}>Create system</button></> }}>
          <div className="modal__field" style={{ marginBottom: 14 }}><label>Name</label><input placeholder="e.g. Payments Insight" /></div>
          <div className="modal__field"><label>Surface</label><input placeholder="Lab · Proof · Docs" defaultValue="Lab" /></div>
        </Modal>
      )}

      {open === "success" && (
        <Modal icon="CircleCheck" iconKind="success" title="All checks passed" subtitle="Ready to ship" onClose={close}
          footer={{ node: <><button className="btn btn--ghost" onClick={close}>Close</button><button className="btn btn--primary" onClick={close}>View report</button></> }}>
          <p>Color contrast, accent budget, and focus rings all pass the APT lint gates. This system is cleared to promote to Proof.</p>
        </Modal>
      )}
    </div>
  );
}

/* ---------- Onboarding / empty view ---------- */
const STEPS = [
  { t: "Create your workspace", d: "Name it and pick a theme.", done: true },
  { t: "Connect GitHub", d: "Link a repo to sync systems.", done: true },
  { t: "Log your first decision", d: "Capture a real tradeoff.", done: false, active: true },
  { t: "Invite your team", d: "Add reviewers and owners.", done: false },
];

function OnboardView() {
  const [steps, setSteps] = useState(STEPS);
  const toggle = (i) => setSteps((s) => s.map((x, j) => j === i ? { ...x, done: !x.done } : x));
  const done = steps.filter((s) => s.done).length;
  const pct = Math.round((done / steps.length) * 100);
  const R = 52, C = 2 * Math.PI * R;

  return (
    <div>
      <div className="stagehead">
        <div className="eyebrow">Patterns</div>
        <h1>Onboarding &amp; empty states</h1>
        <p>First-run guidance and zero-data states — calm, with exactly one clear next action.</p>
      </div>

      <div className="onboard" style={{ marginBottom: 22 }}>
        <div className="steps">
          {steps.map((s, i) => (
            <div className={`step${s.done ? " done" : ""}${s.active && !s.done ? " active" : ""}`} key={s.t} onClick={() => toggle(i)}>
              <div className="step__box">{s.done ? <Icon name="Check" size={13} /> : <Icon name="Circle" size={8} style={{ opacity: s.active ? 1 : 0 }} />}</div>
              <div><div className="step__t">{s.t}</div><div className="step__d">{s.d}</div></div>
              <span className="step__go"><Icon name="ArrowRight" size={16} /></span>
            </div>
          ))}
        </div>
        <div className="progresscard">
          <div className="ring">
            <svg width="120" height="120">
              <circle cx="60" cy="60" r={R} fill="none" stroke="hsl(220 15% 18%)" strokeWidth="9" />
              <circle cx="60" cy="60" r={R} fill="none" stroke="hsl(220 70% 58%)" strokeWidth="9" strokeLinecap="round"
                strokeDasharray={C} strokeDashoffset={C * (1 - pct / 100)} style={{ transition: "stroke-dashoffset .4s var(--ease-apt)" }} />
            </svg>
            <div className="ring__num"><b>{pct}%</b><small>{done}/{steps.length} done</small></div>
          </div>
          <h3>Getting started</h3>
          <p>Finish setup to unlock the insight console.</p>
          <button className="btn btn--primary" style={{ width: "100%" }}>Continue setup</button>
        </div>
      </div>

      <div className="empty">
        <div className="empty__ic"><Icon name="Boxes" size={28} /></div>
        <h2>No systems yet</h2>
        <p>Systems are reusable references built from your decisions. Create your first one, or import a repo to get started.</p>
        <div className="empty__cta">
          <button className="btn btn--primary"><Icon name="Plus" /> New system</button>
          <button className="btn btn--outline"><GithubMark /> Import from GitHub</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Error pages view ---------- */
function Emblem() {
  return <span className="errpage__em"><span className="em-wrap"><span className="em-ring" /><span className="em">A</span></span></span>;
}

const ERRORS = {
  "404": { code: "404", t: "We couldn't find that page", p: "The page you're looking for may have moved, or never existed. Check the link, or head back to safe ground." },
  "500": { code: "500", t: "Something went wrong on our end", p: "An unexpected error occurred. It's been logged and we're looking into it — try again in a moment." },
  "403": { code: "403", t: "You don't have access", p: "This system is private. Ask the owner for access, or switch to an account that has it." },
};

function ErrorView() {
  const [code, setCode] = useState("404");
  const e = ERRORS[code];
  return (
    <div>
      <div className="stagehead" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div className="eyebrow">Patterns</div>
          <h1>Error &amp; empty pages</h1>
          <p>Full-page states on the cosmic backdrop — honest, calm, and always with a way out.</p>
        </div>
        <div className="segment">
          {Object.keys(ERRORS).map((c) => (
            <button key={c} className={code === c ? "on" : ""} onClick={() => setCode(c)}>{c}</button>
          ))}
        </div>
      </div>
      <div className="errpage">
        <div className="errpage__glows" />
        <div className="errpage__stars" />
        <div className="errpage__in">
          <Emblem />
          <div className="errpage__code">{e.code}</div>
          <h2>{e.t}</h2>
          <p>{e.p}</p>
          <div className="errpage__cta">
            <button className="btn btn--primary btn--lg btn--pill"><Icon name="House" size={18} /> Back home</button>
            <button className="btn btn--outline btn--lg btn--pill">{code === "500" ? "Try again" : "Go to Labs"}</button>
          </div>
          <div className="errpage__links">
            Need a hand? <a href="#">Contact support</a> or browse the <a href="#">docs</a>.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Toast host (shared) ---------- */
function Toasts({ items, onDismiss }) {
  const ic = { success: "CircleCheck", info: "Info", error: "CircleAlert" };
  return (
    <div style={{ position: "fixed", top: 18, right: 18, zIndex: 80, display: "flex", flexDirection: "column", gap: 10, width: 320 }}>
      {items.map((t) => (
        <div key={t.id} style={{ display: "flex", gap: 11, alignItems: "flex-start", border: "1px solid hsl(var(--border))", background: "hsl(220 18% 13%)", borderRadius: 11, padding: "12px 13px", boxShadow: "var(--elevation-3)" }}>
          <Icon name={ic[t.kind]} size={17} style={{ marginTop: 1, flexShrink: 0, color: t.kind === "success" ? "hsl(165 50% 58%)" : t.kind === "error" ? "hsl(0 65% 66%)" : "hsl(220 70% 66%)" }} />
          <div><div style={{ fontSize: 13, fontWeight: 600 }}>{t.title}</div>{t.desc && <div style={{ fontSize: 12, color: "hsl(var(--muted-foreground))", marginTop: 1, lineHeight: 1.45 }}>{t.desc}</div>}</div>
          <span style={{ marginLeft: "auto", color: "hsl(var(--muted-foreground))", cursor: "pointer" }} onClick={() => onDismiss(t.id)}><Icon name="X" size={14} /></span>
        </div>
      ))}
    </div>
  );
}

const VIEWS = [
  { id: "modals", icon: "SquareStack", label: "Modals" },
  { id: "onboard", icon: "ListChecks", label: "Onboarding" },
  { id: "error", icon: "TriangleAlert", label: "Error pages" },
];

function PatternsApp() {
  const [view, setView] = useState("modals");
  const [toasts, setToasts] = useState([]);
  const pushToast = (t) => {
    const id = Date.now() + Math.random();
    setToasts((c) => [...c, { ...t, id }]);
    setTimeout(() => setToasts((c) => c.filter((x) => x.id !== id)), 4000);
  };
  const dismiss = (id) => setToasts((c) => c.filter((x) => x.id !== id));

  return (
    <div>
      <Toasts items={toasts} onDismiss={dismiss} />
      <div className="topbar">
        <div className="topbar__in">
          <span className="topbar__em">A</span>
          <span className="topbar__name">APT Patterns<small>UI kit</small></span>
          <div className="topbar__sp" />
          <div className="segment">
            {VIEWS.map((v) => (
              <button key={v.id} className={view === v.id ? "on" : ""} onClick={() => setView(v.id)}>
                <Icon name={v.icon} /><span>{v.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="stage">
        {view === "modals" && <ModalsView onToast={pushToast} />}
        {view === "onboard" && <OnboardView />}
        {view === "error" && <ErrorView />}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<PatternsApp />);
