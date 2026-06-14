/* APT Portfolio UI kit — shared components.
   Icons use the real Lucide set (matches the source app's lucide-react),
   loaded from CDN. */

/* ---------- Icon (Lucide from CDN, PascalCase names) ---------- */
function Icon({ name, size = 18, className, style }) {
  const lib = typeof window !== "undefined" ? window.lucide : null;
  const data = lib && ((lib.icons && lib.icons[name]) || lib[name]);
  let inner = "";
  if (Array.isArray(data)) {
    inner = data
      .map(([tag, attrs]) => {
        const a = Object.entries(attrs || {})
          .map(([k, v]) => `${k}="${v}"`)
          .join(" ");
        return `<${tag} ${a}></${tag}>`;
      })
      .join("");
  }
  return (
    <svg
      className={className}
      style={style}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      dangerouslySetInnerHTML={{ __html: inner }}
    />
  );
}

/* ---------- Brand mark ---------- */
function AptEmblem({ size = "lg", glow = "strong", animated = true }) {
  return (
    <span className="em-wrap">
      {animated && glow !== "none" && <span className="em-ring" />}
      <span className={`em em--${size}${glow !== "none" ? " em--glow-" + glow : ""}`}>A</span>
    </span>
  );
}

/* ---------- Cosmic background wrapper ---------- */
function CosmicBackground({ children, className = "", style }) {
  return (
    <div className={`cosmic ${className}`} style={style}>
      <div className="cosmic__glows" />
      <div className="cosmic__stars" />
      <div className="cosmic__content">{children}</div>
    </div>
  );
}

/* ---------- Button + Tag ---------- */
function Button({ variant = "primary", size = "default", pill, children, onClick }) {
  return (
    <button
      className={`btn btn--${variant}${size === "lg" ? " btn--lg" : ""}${pill ? " btn--pill" : ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
function Tag({ variant = "default", size, children }) {
  return <span className={`tag tag--${variant}${size === "sm" ? " tag--sm" : ""}`}>{children}</span>;
}

/* ---------- Header / nav ---------- */
const NAV = ["Home", "Labs", "Proof", "Principles", "Insights", "About"];
function AptNav({ active, onNavigate }) {
  return (
    <header className="nav">
      <div className="nav__inner">
        <div className="nav__brand" onClick={() => onNavigate("Home")} style={{ cursor: "pointer" }}>
          <AptEmblem size="sm" glow="none" animated={false} />
          <div>
            <div className="eyebrow" style={{ fontSize: "9.5px", letterSpacing: ".18em" }}>
              Applied Practical Thinking
            </div>
            <div className="name">APT</div>
          </div>
        </div>
        <nav className="nav__links">
          {NAV.map((item) => (
            <span
              key={item}
              className={`nav__link${active === item ? " active" : ""}`}
              onClick={() => onNavigate(item)}
            >
              {item}
            </span>
          ))}
        </nav>
        <div className="nav__spacer" />
        <div className="nav__util">
          <a href="https://github.com/adthomps" target="_blank" rel="noreferrer" title="GitHub">
            <Icon name="Github" size={18} />
          </a>
          <a href="#" title="Search" onClick={(e) => e.preventDefault()}>
            <Icon name="Search" size={18} />
          </a>
        </div>
      </div>
    </header>
  );
}

/* ---------- Footer ---------- */
function AptFooter() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div>
            <div className="nav__brand">
              <AptEmblem size="sm" glow="none" animated={false} />
              <div>
                <div className="eyebrow" style={{ fontSize: "9.5px", letterSpacing: ".18em" }}>
                  Applied Practical Thinking
                </div>
                <div className="name">APT</div>
              </div>
            </div>
            <p className="footer__desc">
              Operational portfolio and reference space for practical systems, product
              decisions, and implementation patterns.
            </p>
          </div>
          <div>
            <h3>Navigation</h3>
            <ul>
              <li><a href="#">Home</a></li>
              <li><a href="#">Labs</a></li>
              <li><a href="#">Proof</a></li>
              <li><a href="#">Principles</a></li>
              <li><a href="#">Insights</a></li>
            </ul>
          </div>
          <div>
            <h3>Resources</h3>
            <ul>
              <li><a href="#">Applied Visual Gallery</a></li>
              <li><a href="https://github.com/adthomps" target="_blank" rel="noreferrer">GitHub</a></li>
              <li><a href="#">LinkedIn</a></li>
            </ul>
          </div>
        </div>
        <div className="footer__legal">
          <span>© 2026 Adam Thompson. Applied Practical Thinking. All rights reserved.</span>
          <span style={{ fontSize: "11.5px" }}>This is a demonstration, not a production system.</span>
        </div>
      </div>
    </footer>
  );
}

/* ---------- Browse card (Labs / Proof) ---------- */
function BrowseCard({ item, onOpen }) {
  return (
    <div className="card card--interactive" onClick={() => onOpen(item)}>
      <div className="browse">
        <div className="browse__top">
          <div className="browse__lead">
            <div className="browse__icon"><Icon name={item.icon} size={20} /></div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                <Tag variant={item.kindVariant || "primary"} size="sm">{item.kind}</Tag>
              </div>
              <div className="browse__title">{item.title}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            {item.status && (
              <span className={`status status--${(item.status || "").toLowerCase()}`}>
                <span className="dot" />{item.status}
              </span>
            )}
            <Icon name="ArrowRight" size={16} className="browse__arrow" />
          </div>
        </div>
        <p className="browse__desc">{item.description}</p>
        <div className="browse__meta">
          {(item.tags || []).map((t) => (
            <Tag key={t} variant="muted" size="sm">{t}</Tag>
          ))}
        </div>
        <div className="browse__foot">
          <span className="browse__date">{item.date}</span>
          <span className="browse__action">
            {item.action || "View details"} <Icon name="ArrowRight" size={15} />
          </span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  Icon, AptEmblem, CosmicBackground, Button, Tag, AptNav, AptFooter, BrowseCard, NAV,
});
