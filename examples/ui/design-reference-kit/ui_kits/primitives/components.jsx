/* APT Primitives — shared atoms: Icon, layout (Section/Spec), and tiny
   presentational helpers reused across every view. Exported to window so the
   per-view Babel scripts can read them. */

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

/* GitHub mark — lucide dropped brand glyphs, so render the logo inline. */
function GithubMark({ size = 15, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={style} aria-hidden="true">
      <path d="M12 .5C5.7.5.5 5.8.5 12.3c0 5.2 3.4 9.6 8 11.2.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.9 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.6 5 18.6 5.3 18.6 5.3c.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.6 8-6 8-11.2C23.5 5.8 18.3.5 12 .5z" />
    </svg>
  );
}

/* The stage header for each view. */
function StageHead({ title, children }) {
  return (
    <div className="stagehead">
      <div className="eyebrow">Primitives</div>
      <h1>{title}</h1>
      <p>{children}</p>
    </div>
  );
}

/* A single framed specimen: title, optional tag + description, demo area,
   optional usage note. `span` makes it full-width; `row`/`center` lay the
   demo out horizontally / centered. */
function Spec({ title, tag, desc, span, row, center, note, children }) {
  return (
    <div className={`spec${span ? " spec--span" : ""}`}>
      <div className="spec__h">
        <span className="spec__t">{title}</span>
        {tag && <span className="spec__tag">{tag}</span>}
      </div>
      {desc && <p className="spec__d">{desc}</p>}
      <div className={`spec__demo${row ? " spec__demo--row" : ""}${center ? " spec__demo--center" : ""}`}>{children}</div>
      {note && <div className="spec__note">{note}</div>}
    </div>
  );
}

function Badge({ kind = "neutral", pill, icon, children }) {
  return (
    <span className={`badge badge--${kind}${pill ? " pill" : ""}`}>
      {icon && <Icon name={icon} />}{children}
    </span>
  );
}

function Avatar({ size = "md", color, img, children }) {
  return (
    <span className={`av av-${size}${color ? " " + color : ""}`}>
      {img ? <img src={img} alt="" /> : children}
    </span>
  );
}

function Kbd({ children }) { return <span className="kbd">{children}</span>; }

Object.assign(window, { Icon, GithubMark, StageHead, Spec, Badge, Avatar, Kbd });
