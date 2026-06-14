/* APT Primitives — Controls: switch, checkbox, radio, slider, segmented,
   quantity stepper, search field, chips. */
const { useState: useStateCtl } = React;

/* ---- Switch ---- */
function Switches() {
  const [a, setA] = useStateCtl(true);
  const [b, setB] = useStateCtl(false);
  return (
    <>
      <button className="ctl-row" style={{ border: 0, background: "transparent", cursor: "pointer", padding: 0, color: "inherit" }} onClick={() => setA(!a)}>
        <span className={`switch${a ? " on" : ""}`} />
        <span>Sync systems to GitHub</span>
      </button>
      <button className="ctl-row" style={{ border: 0, background: "transparent", cursor: "pointer", padding: 0, color: "inherit" }} onClick={() => setB(!b)}>
        <span className={`switch${b ? " on" : ""}`} />
        <span>Email me on lint failures</span>
      </button>
      <div className="ctl-row dis"><span className="switch on" /><span>Telemetry (locked by org)</span></div>
    </>
  );
}

/* ---- Checkbox (incl. indeterminate) ---- */
function Checkboxes() {
  const opts = ["Color contrast", "Accent budget", "Focus rings"];
  const [on, setOn] = useStateCtl([true, false, true]);
  const toggle = (i) => setOn((s) => s.map((v, j) => j === i ? !v : v));
  const count = on.filter(Boolean).length;
  const all = count === on.length, none = count === 0;
  return (
    <>
      <button className="ctl-row" style={{ border: 0, background: "transparent", cursor: "pointer", padding: 0, color: "inherit", fontWeight: 600 }}
        onClick={() => setOn(on.map(() => none || !all))}>
        <span className={`cbox ${all ? "on" : none ? "" : "ind"}`}>
          {all ? <Icon name="Check" /> : none ? null : <Icon name="Minus" />}
        </span>
        <span>Select all gates</span>
      </button>
      {opts.map((o, i) => (
        <button key={o} className="ctl-row" style={{ border: 0, background: "transparent", cursor: "pointer", padding: "0 0 0 24px", color: "inherit" }} onClick={() => toggle(i)}>
          <span className={`cbox${on[i] ? " on" : ""}`}>{on[i] && <Icon name="Check" />}</span>
          <span>{o}</span>
        </button>
      ))}
      <div className="ctl-row dis" style={{ paddingLeft: 24 }}><span className="cbox" /><span>Security scan (Pro)</span></div>
    </>
  );
}

/* ---- Radio ---- */
function Radios() {
  const opts = [
    { id: "lab", t: "Lab", d: "Private, experimental." },
    { id: "proof", t: "Proof", d: "Public, stable." },
    { id: "docs", t: "Docs", d: "Reference only." },
  ];
  const [on, setOn] = useStateCtl("proof");
  return (
    <>
      {opts.map((o) => (
        <button key={o.id} className="ctl-row" style={{ border: 0, background: "transparent", cursor: "pointer", padding: 0, color: "inherit", alignItems: "flex-start" }} onClick={() => setOn(o.id)}>
          <span className={`radio${on === o.id ? " on" : ""}`} style={{ marginTop: 1 }} />
          <span style={{ textAlign: "left" }}>{o.t}<span style={{ display: "block", fontSize: 11.5, color: "hsl(var(--muted-foreground))", marginTop: 1 }}>{o.d}</span></span>
        </button>
      ))}
    </>
  );
}

/* ---- Slider ---- */
function Sliders() {
  const [v, setV] = useStateCtl(64);
  return (
    <div className="slider">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: 12.5, color: "hsl(var(--muted-foreground))" }}>Accent budget</span>
        <span className="val">{v}%</span>
      </div>
      <input type="range" min="0" max="100" value={v} onChange={(e) => setV(+e.target.value)} style={{ background: `linear-gradient(90deg, hsl(var(--primary)) ${v}%, hsl(var(--secondary)) ${v}%)` }} />
      <div className="ends"><span>0%</span><span>100%</span></div>
    </div>
  );
}

/* ---- Segmented control ---- */
function Segmented() {
  const [on, setOn] = useStateCtl("grid");
  const items = [{ id: "grid", ic: "LayoutGrid" }, { id: "list", ic: "List" }, { id: "board", ic: "Columns3" }];
  return (
    <div className="segment" style={{ background: "hsl(var(--muted))" }}>
      {items.map((t) => (
        <button key={t.id} className={on === t.id ? "on" : ""} onClick={() => setOn(t.id)} style={{ padding: "7px 14px" }}>
          <Icon name={t.ic} /><span style={{ textTransform: "capitalize" }}>{t.id}</span>
        </button>
      ))}
    </div>
  );
}

/* ---- Quantity stepper ---- */
function Quantity() {
  const [n, setN] = useStateCtl(2);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div className="qty">
        <button onClick={() => setN((x) => Math.max(0, x - 1))} disabled={n === 0} aria-label="Decrease"><Icon name="Minus" /></button>
        <span className="n">{n}</span>
        <button onClick={() => setN((x) => Math.min(10, x + 1))} disabled={n === 10} aria-label="Increase"><Icon name="Plus" /></button>
      </div>
      <span style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>{n === 10 ? "Max 10 per order" : "In cart"}</span>
    </div>
  );
}

/* ---- Search ---- */
function SearchField() {
  const [q, setQ] = useStateCtl("decision graph");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 13, width: "100%" }}>
      <div className="search">
        <Icon name="Search" className="ic" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search systems, decisions, docs…" />
        {q && <button className="clear" onClick={() => setQ("")} aria-label="Clear"><Icon name="X" /></button>}
      </div>
      <div className="search">
        <Icon name="Command" className="ic" />
        <input placeholder="Type a command or search…" readOnly />
        <span className="kbd" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)" }}>⌘K</span>
      </div>
    </div>
  );
}

/* ---- Chips ---- */
function Chips() {
  const [items, setItems] = useStateCtl(["Payments", "React", "Webhooks", "Dark-first"]);
  const remove = (t) => setItems((s) => s.filter((x) => x !== t));
  return (
    <div className="chips">
      {items.map((t) => (
        <span key={t} className="chip">{t}<button className="x" onClick={() => remove(t)} aria-label={`Remove ${t}`}><Icon name="X" /></button></span>
      ))}
      <button className="chip-add" onClick={() => !items.includes("Filter") && setItems((s) => [...s, "Filter"])}><Icon name="Plus" /> Add filter</button>
    </div>
  );
}

function ControlsView() {
  return (
    <div>
      <StageHead title="Controls &amp; inputs">Boolean and value controls — switches, checkboxes, radios, sliders, steppers, search, and chips. Focus ring is always primary; teal never appears as a default selected color.</StageHead>
      <div className="specs">
        <Spec title="Switch" desc="Instant on/off for a setting that takes effect immediately." note={<>Use for <b>immediate</b> settings. Disabled = locked, never hidden.</>}><Switches /></Spec>
        <Spec title="Checkbox" desc="Multi-select with a tri-state parent (all / some / none)." note={<>The parent shows an <b>indeterminate dash</b> when only some children are checked.</>}><Checkboxes /></Spec>
        <Spec title="Radio" desc="Exactly one choice from a small set, with helper text." note={<>Selected ring is primary. Prefer radios over a dropdown for ≤ 4 visible options.</>}><Radios /></Spec>
        <Spec title="Slider" desc="Pick a value across a continuous range; the filled track is primary." center note={<>Pair with a live <code>mono</code> readout. Track fills primary up to the thumb.</>}><Sliders /></Spec>
        <Spec title="Segmented control" desc="Mutually-exclusive view modes — denser than tabs, for chrome." center row note={<>For 2–4 icon/short-label options. Selected segment fills primary.</>}><Segmented /></Spec>
        <Spec title="Quantity stepper" desc="Increment/decrement a small integer — cart lines, seats, limits." center note={<>Clamp at min/max and <b>disable</b> the end button. Tabular-numerals keep width stable.</>}><Quantity /></Spec>
        <Spec title="Search field" desc="Leading icon, clear affordance, and a command variant with a ⌘K hint." note={<>Show the <b>clear</b> button only when there's a value. Reserve ⌘K for a global command palette.</>}><SearchField /></Spec>
        <Spec title="Chips / tokens" desc="Removable filter or tag tokens with an add affordance." center note={<>Each chip removes independently. The dashed <b>Add</b> token invites new filters.</>}><Chips /></Spec>
      </div>
    </div>
  );
}

window.ControlsView = ControlsView;
