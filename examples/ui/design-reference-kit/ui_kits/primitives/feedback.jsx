/* APT Primitives — Feedback & status: badges, status dots, progress, spinner,
   skeleton, avatar, rating. */
const { useState: useStateFb, useEffect: useEffectFb } = React;

/* ---- Badges ---- */
function Badges() {
  return (
    <>
      <div className="spec__demo--row" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Badge kind="neutral">Draft</Badge>
        <Badge kind="primary">Beta</Badge>
        <Badge kind="success" icon="Check">Passing</Badge>
        <Badge kind="warning" icon="TriangleAlert">Review</Badge>
        <Badge kind="danger" icon="X">Failing</Badge>
        <Badge kind="accent">Section</Badge>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Badge kind="primary" pill>v2.4</Badge>
        <Badge kind="neutral" pill>12 systems</Badge>
        <Badge kind="success" pill icon="Zap">Live</Badge>
      </div>
    </>
  );
}

/* ---- Status dots ---- */
function StatusDots() {
  return (
    <>
      <span className="statusdot"><i className="ok" /> Operational</span>
      <span className="statusdot"><i className="warn" /> Degraded</span>
      <span className="statusdot"><i className="err" /> Outage</span>
      <span className="statusdot"><i className="live" /> Deploying</span>
      <span className="statusdot"><i className="idle" /> Paused</span>
    </>
  );
}

/* ---- Progress ---- */
function Progress() {
  const [v, setV] = useStateFb(0);
  useEffectFb(() => {
    let raf;
    const tick = () => { setV((x) => (x >= 72 ? 72 : x + 1)); };
    const id = setInterval(tick, 28);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <div className="proglabel"><span style={{ color: "hsl(var(--muted-foreground))" }}>Migrating decisions</span><span>{v}%</span></div>
        <div className="bar-track"><div className="bar-fill" style={{ width: v + "%" }} /></div>
      </div>
      <div>
        <div className="proglabel"><span style={{ color: "hsl(var(--muted-foreground))" }}>Storage used</span><span style={{ color: "hsl(165 50% 60%)" }}>3.2 / 5 GB</span></div>
        <div className="bar-track"><div className="bar-fill teal" style={{ width: "64%" }} /></div>
      </div>
      <div>
        <div className="proglabel"><span style={{ color: "hsl(var(--muted-foreground))" }}>Indexing</span><span style={{ color: "hsl(var(--muted-foreground))" }}>working…</span></div>
        <div className="bar-indet" />
      </div>
    </div>
  );
}

/* ---- Spinner ---- */
function Spinners() {
  return (
    <div style={{ display: "flex", gap: 26, alignItems: "center" }}>
      <span className="spin sm" />
      <span className="spin" />
      <span className="spin lg" />
      <button className="btn btn--primary btn--sm" style={{ pointerEvents: "none" }}><span className="spin sm" style={{ borderTopColor: "#fff", borderColor: "hsl(220 20% 99% / .4)" }} /> Saving…</button>
    </div>
  );
}

/* ---- Skeleton ---- */
function Skeletons() {
  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="skel-card">
        <div className="skel" style={{ width: 44, height: 44, borderRadius: 11, flexShrink: 0 }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="skel skel-line" style={{ width: "55%" }} />
          <div className="skel skel-line" style={{ width: "80%" }} />
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        <div className="skel skel-line" style={{ width: "100%" }} />
        <div className="skel skel-line" style={{ width: "92%" }} />
        <div className="skel skel-line" style={{ width: "68%" }} />
      </div>
    </div>
  );
}

/* ---- Avatar ---- */
function Avatars() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, alignItems: "flex-start" }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Avatar size="sm" color="teal">AT</Avatar>
        <Avatar size="md">JL</Avatar>
        <Avatar size="lg" color="purple">MR</Avatar>
        <Avatar size="md" color="muted"><Icon name="User" size={16} /></Avatar>
      </div>
      <div className="av-stack">
        <Avatar size="md" color="teal">AT</Avatar>
        <Avatar size="md">JL</Avatar>
        <Avatar size="md" color="purple">MR</Avatar>
        <Avatar size="md" color="muted">KS</Avatar>
        <span className="av av-md more">+6</span>
      </div>
    </div>
  );
}

/* ---- Rating ---- */
function Rating() {
  const [v, setV] = useStateFb(4);
  const [hov, setHov] = useStateFb(0);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "flex-start" }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <div className="rating" onMouseLeave={() => setHov(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} className={(hov || v) >= n ? "on" : ""} onMouseEnter={() => setHov(n)} onClick={() => setV(n)} aria-label={`${n} stars`}>
              <Icon name="Star" style={{ fill: (hov || v) >= n ? "currentColor" : "none" }} />
            </button>
          ))}
        </div>
        <span className="rating-meta">{v}.0 — interactive</span>
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <div className="rating read">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} className={n <= 4 ? "on" : ""}><Icon name="Star" style={{ fill: n <= 4 ? "currentColor" : "none" }} /></button>
          ))}
        </div>
        <span className="rating-meta">4.0 · 128 reviews</span>
      </div>
    </div>
  );
}

function FeedbackView() {
  return (
    <div>
      <StageHead title="Feedback &amp; status">Communicating system state — badges, status, progress, loading, identity, and ratings. Feedback colors carry meaning only: teal = success, amber = warning, red = error.</StageHead>
      <div className="specs">
        <Spec title="Badges" desc="Compact status and metadata labels in square and pill shapes." note={<>Semantic colors only carry <b>meaning</b> (passing / review / failing) — never decoration.</>}><Badges /></Spec>
        <Spec title="Status indicators" desc="A colored dot + label for service health and live activity." note={<>The <b>live</b> dot pulses to signal real-time activity; it stills under reduced-motion.</>}><StatusDots /></Spec>
        <Spec title="Progress" desc="Determinate bars (blue, or teal for capacity) and an indeterminate track." center note={<>Use <b>determinate</b> when you know the percent; indeterminate only for unknown waits.</>}><Progress /></Spec>
        <Spec title="Spinner" desc="Inline busy indicator in three sizes, including inside a button." center row note={<>For short, in-place waits. For full sections prefer <b>skeletons</b> that hold layout.</>}><Spinners /></Spec>
        <Spec title="Skeleton" desc="Shimmer placeholders that reserve the final layout while loading." center note={<>Mirror the real content's shape so nothing shifts when data arrives.</>}><Skeletons /></Spec>
        <Spec title="Avatar" desc="Initials or image, four color tones, plus an overlapping group with overflow." center note={<>Stack with a <code>+N</code> overflow chip past five. Ring matches the card surface.</>}><Avatars /></Spec>
        <Spec title="Rating" desc="Interactive star input and a read-only display with a review count." center note={<>Amber fill — the one sanctioned warning-hue use outside warnings, for stars.</>}><Rating /></Spec>
      </div>
    </div>
  );
}

window.FeedbackView = FeedbackView;
