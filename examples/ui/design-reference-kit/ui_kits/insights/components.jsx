/* APT Insights UI kit — components. */

function Icon({ name, size = 18, className, style }) {
  const lib = typeof window !== "undefined" ? window.lucide : null;
  const data = lib && ((lib.icons && lib.icons[name]) || lib[name]);
  let inner = "";
  if (Array.isArray(data)) {
    inner = data
      .map(([tag, attrs]) => {
        const a = Object.entries(attrs || {}).map(([k, v]) => `${k}="${v}"`).join(" ");
        return `<${tag} ${a}></${tag}>`;
      })
      .join("");
  }
  return (
    <svg className={className} style={style} width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      dangerouslySetInnerHTML={{ __html: inner }} />
  );
}

const NAV = ["Home", "Labs", "Proof", "Principles", "Insights", "About"];
function AptNav({ active, onHome }) {
  return (
    <header className="nav">
      <div className="nav__inner">
        <div className="nav__brand" onClick={onHome}>
          <span className="em-wrap"><span className="em">A</span></span>
          <div>
            <div className="eyebrow" style={{ fontSize: "9.5px", letterSpacing: ".18em" }}>Applied Practical Thinking</div>
            <div className="name">APT</div>
          </div>
        </div>
        <nav className="nav__links">
          {NAV.map((i) => <span key={i} className={`nav__link${active === i ? " active" : ""}`}>{i}</span>)}
        </nav>
        <div className="nav__spacer" />
      </div>
    </header>
  );
}

const TYPE_META = {
  article: { label: "Article", icon: "FileText" },
  podcast: { label: "Podcast", icon: "Podcast" },
  "case-study": { label: "Case Study", icon: "BookOpen" },
};

/* cover: raster image when present, else a generated APT-style serif cover */
function Cover({ item }) {
  if (item.cover) {
    return <img src={item.cover} alt={item.title} />;
  }
  return (
    <div className="gcover">
      <span className="pill">{TYPE_META[item.type].label}</span>
      <div className="st">{item.title}</div>
    </div>
  );
}

function InsightCard({ item, onOpen }) {
  const meta = TYPE_META[item.type];
  return (
    <article className="icard" onClick={() => onOpen(item)}>
      <div className="icard__media"><Cover item={item} /></div>
      <div className="icard__body">
        <div className="icard__row">
          <span className="tag tag--accent tag--sm">{meta.label}</span>
          <Icon name={meta.icon} size={16} className="ic" />
        </div>
        <div className="icard__title">{item.title}</div>
        <p className="icard__desc">{item.description}</p>
        <div className="icard__concepts">
          {item.concepts.slice(0, 3).map((c) => <span key={c} className="tag tag--muted tag--sm">{c}</span>)}
        </div>
        <div className="icard__foot">
          <span>{item.date}</span>
          {item.duration && <span>· {item.duration}</span>}
        </div>
      </div>
    </article>
  );
}

Object.assign(window, { Icon, AptNav, InsightCard, Cover, NAV, TYPE_META });
