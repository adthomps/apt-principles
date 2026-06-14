/* APT Primitives — Disclosure & overlay: accordion/FAQ, tooltip, popover, menu. */
const { useState: useStateDis } = React;

/* ---- Accordion / FAQ ---- */
const FAQ = [
  { q: "What counts as a decision?", a: "Any tradeoff with at least two viable options and a reason for choosing one — captured as a durable, reviewable unit of engineering knowledge." },
  { q: "Is teal ever a call-to-action?", a: "No. Blue is the single action color. Teal is reserved for success, section identity, and one-series chart accents — using it as a CTA is a lint failure." },
  { q: "Can I run APT in light mode?", a: "A light scope ships for parity, but APT surfaces stay dark unless a project records an explicit brand exception." },
];
function Accordion() {
  const [open, setOpen] = useStateDis(0);
  return (
    <div className="acc">
      {FAQ.map((f, i) => (
        <div className={`acc__item${open === i ? " open" : ""}`} key={f.q}>
          <button className="acc__btn" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
            <Icon name="HelpCircle" size={16} style={{ color: "hsl(var(--muted-foreground))", flexShrink: 0 }} />
            {f.q}
            <span className="chev"><Icon name="ChevronDown" /></span>
          </button>
          <div className="acc__panel" style={{ maxHeight: open === i ? 200 : 0 }}>
            <div className="acc__panel-in">{f.a}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---- Tooltip ---- */
function Tooltips() {
  return (
    <div style={{ display: "flex", gap: 22, alignItems: "center", flexWrap: "wrap" }}>
      <span className="tip">
        <button className="btn btn--outline btn--sm btn--icon" aria-label="Info"><Icon name="Info" /></button>
        <span className="tip__bub">Runs all five lint gates</span>
      </span>
      <span className="tip">
        <button className="btn btn--outline btn--sm">Hover me</button>
        <span className="tip__bub">Promotes to Proof</span>
      </span>
      <span className="tip">
        <span className="statusdot"><i className="live" /> Live</span>
        <span className="tip__bub">Updated 2s ago</span>
      </span>
    </div>
  );
}

/* ---- Popover ---- */
function Popover() {
  const [open, setOpen] = useStateDis(false);
  return (
    <div className="pop-wrap">
      {open && <div className="scrim-none" onClick={() => setOpen(false)} />}
      <button className="btn btn--outline btn--sm" onClick={() => setOpen(!open)}>
        <Icon name="Filter" /> Filters <Icon name="ChevronDown" size={14} />
      </button>
      {open && (
        <div className="pop" style={{ zIndex: 31 }}>
          <div className="pop__pad">
            <h4>Filter systems</h4>
            <p>Narrow the list by surface and status.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <label className="ctl-row" style={{ fontSize: 13, cursor: "pointer" }}><span className="cbox on"><Icon name="Check" /></span> Labs only</label>
              <label className="ctl-row" style={{ fontSize: 13, cursor: "pointer" }}><span className="cbox" /> Passing gates</label>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button className="btn btn--ghost btn--sm" style={{ flex: 1 }} onClick={() => setOpen(false)}>Reset</button>
              <button className="btn btn--primary btn--sm" style={{ flex: 1 }} onClick={() => setOpen(false)}>Apply</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---- Dropdown menu ---- */
function Menu() {
  const [open, setOpen] = useStateDis(false);
  const close = () => setOpen(false);
  return (
    <div className="pop-wrap">
      {open && <div className="scrim-none" onClick={close} />}
      <button className="btn btn--outline btn--sm" onClick={() => setOpen(!open)}>
        <Avatar size="sm" color="teal">AT</Avatar>
        <Icon name="ChevronDown" size={14} />
      </button>
      {open && (
        <div className="pop pop--right menu" style={{ minWidth: 220, zIndex: 31 }}>
          <div className="menu__sec">Adam Thompson</div>
          <div className="menu__item" onClick={close}><Icon name="User" /> Profile <span className="sc">⌘P</span></div>
          <div className="menu__item" onClick={close}><Icon name="Settings" /> Settings <span className="sc">⌘,</span></div>
          <div className="menu__item" onClick={close}><GithubMark size={15} style={{ color: "hsl(var(--muted-foreground))" }} /> GitHub sync</div>
          <div className="menu__sep" />
          <div className="menu__item" onClick={close}><Icon name="LifeBuoy" /> Support</div>
          <div className="menu__item danger" onClick={close}><Icon name="LogOut" /> Sign out</div>
        </div>
      )}
    </div>
  );
}

function DisclosureView() {
  return (
    <div>
      <StageHead title="Disclosure &amp; overlays">Progressive disclosure — reveal detail on demand without leaving the page. Accordions, tooltips, popovers, and menus all dismiss on outside-click or blur.</StageHead>
      <div className="specs">
        <Spec title="Accordion / FAQ" desc="Stacked expandable sections; one open at a time here. Chevron rotates and the panel animates its height." note={<>Animate <code>max-height</code> for a calm reveal. Open the first item by default on FAQ pages.</>}><Accordion /></Spec>
        <Spec title="Tooltip" desc="Hover/focus hint for icon-only controls and terse status. Appears above with a small caret." center note={<>For <b>supplementary</b> hints only — never hide essential info in a tooltip. Triggers on hover and focus.</>}><Tooltips /></Spec>
        <Spec title="Popover" desc="Click-triggered panel for compact forms and filters; dismisses on outside click." center note={<>Use for <b>interactive</b> content (a filter form). Anchor it to its trigger; close on Apply or outside-click.</>}><Popover /></Spec>
        <Spec title="Dropdown menu" desc="Action list with sections, icons, shortcuts, separators, and a destructive item." center note={<>Right-align to the trigger. Put destructive actions last, below a separator, in <b>red</b>.</>}><Menu /></Spec>
      </div>
    </div>
  );
}

window.DisclosureView = DisclosureView;
