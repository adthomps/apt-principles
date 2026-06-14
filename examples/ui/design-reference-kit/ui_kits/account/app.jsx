/* APT Account UI kit — auth (login/signup) + settings, with alerts & toasts. */

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
const TOAST_ICON = { success: "CircleCheck", info: "Info", error: "CircleAlert" };

function Emblem() {
  return <span className="em-wrap"><span className="em-ring" /><span className="em">A</span></span>;
}

/* ---------- Alert (inline) ---------- */
function Alert({ kind = "info", title, children, onClose }) {
  const ic = { info: "Info", success: "CircleCheck", warn: "TriangleAlert", error: "CircleAlert" }[kind];
  return (
    <div className={`alert alert--${kind}`}>
      <Icon name={ic} />
      <div className="alert__body">
        <div className="alert__t">{title}</div>
        {children && <div className="alert__d">{children}</div>}
      </div>
      {onClose && <span className="alert__x" onClick={onClose}><Icon name="X" /></span>}
    </div>
  );
}

/* ---------- Toast host ---------- */
function Toasts({ items, onDismiss }) {
  return (
    <div className="toasts">
      {items.map((t) => (
        <div key={t.id} className={`toast toast--${t.kind}`}>
          <Icon name={TOAST_ICON[t.kind]} />
          <div>
            <div className="toast__t">{t.title}</div>
            {t.desc && <div className="toast__d">{t.desc}</div>}
          </div>
          <span className="toast__x" onClick={() => onDismiss(t.id)}><Icon name="X" /></span>
        </div>
      ))}
    </div>
  );
}

function Check({ on }) {
  return <span className={`check__box${on ? " on" : ""}`}>{on && <Icon name="Check" />}</span>;
}

/* ---------- Login ---------- */
function Login({ onSignup, onSignedIn }) {
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [err, setErr] = useState(false);
  return (
    <div className="auth">
      <div className="auth__brand">
        <Emblem />
        <div>
          <div className="auth__title">Welcome back</div>
          <div className="auth__sub">Sign in to your APT workspace</div>
        </div>
      </div>
      <div className="card">
        {err && <Alert kind="error" title="Couldn't sign in" onClose={() => setErr(false)}>Check your email and password, then try again.</Alert>}
        <div className="oauth">
          <button className="btn btn--outline"><Icon name="Github" /> Continue with GitHub</button>
          <button className="btn btn--outline"><Icon name="Mail" /> Continue with Google</button>
        </div>
        <div className="divider">or</div>
        <div className="field">
          <label>Email</label>
          <div className="inp"><Icon name="Mail" /><input type="email" placeholder="you@example.com" defaultValue="adam@apt.dev" /></div>
        </div>
        <div className="field">
          <label>Password</label>
          <div className={`inp${err ? " invalid" : ""}`}>
            <Icon name="Lock" />
            <input type={show ? "text" : "password"} placeholder="••••••••" value={pw} onChange={(e) => setPw(e.target.value)} />
            <span className="eye" onClick={() => setShow(!show)}><Icon name={show ? "EyeOff" : "Eye"} /></span>
          </div>
        </div>
        <div className="field__row">
          <span className="check" onClick={() => setRemember(!remember)}><Check on={remember} /> Remember me</span>
          <span className="btn--ghost btn" style={{ fontSize: 12.5 }}>Forgot password?</span>
        </div>
        <button className="btn btn--primary" onClick={() => (pw.length < 4 ? setErr(true) : onSignedIn())}>Sign in <Icon name="ArrowRight" /></button>
      </div>
      <div className="auth__alt">New to APT? <span className="btn--ghost btn" onClick={onSignup}>Create an account</span></div>
    </div>
  );
}

/* ---------- Signup ---------- */
function Signup({ onLogin, onSignedIn }) {
  const [pw, setPw] = useState("");
  const [agree, setAgree] = useState(false);
  const strength = pw.length === 0 ? 0 : pw.length < 6 ? 1 : pw.length < 10 ? 2 : 3;
  return (
    <div className="auth">
      <div className="auth__brand">
        <Emblem />
        <div>
          <div className="auth__title">Create your account</div>
          <div className="auth__sub">Start building systems in minutes</div>
        </div>
      </div>
      <div className="card">
        <div className="oauth">
          <button className="btn btn--outline"><Icon name="Github" /> Sign up with GitHub</button>
        </div>
        <div className="divider">or</div>
        <div className="field">
          <label>Full name</label>
          <div className="inp"><Icon name="User" /><input placeholder="Adam Thompson" /></div>
        </div>
        <div className="field">
          <label>Work email</label>
          <div className="inp"><Icon name="Mail" /><input type="email" placeholder="you@company.com" /></div>
        </div>
        <div className="field">
          <label>Password</label>
          <div className="inp"><Icon name="Lock" /><input type="password" placeholder="At least 10 characters" value={pw} onChange={(e) => setPw(e.target.value)} /></div>
          <div className="strength">
            <i className={strength >= 1 ? (strength === 1 ? "s1" : strength === 2 ? "s2" : "s3") : ""} />
            <i className={strength >= 2 ? (strength === 2 ? "s2" : "s3") : ""} />
            <i className={strength >= 3 ? "s3" : ""} />
          </div>
        </div>
        <div className="field__row" style={{ margin: "10px 0 16px" }}>
          <span className="check" onClick={() => setAgree(!agree)}><Check on={agree} /> I agree to the Terms &amp; Privacy Policy</span>
        </div>
        <button className="btn btn--primary" onClick={onSignedIn}>Create account <Icon name="ArrowRight" /></button>
      </div>
      <div className="auth__alt">Already have an account? <span className="btn--ghost btn" onClick={onLogin}>Sign in</span></div>
    </div>
  );
}

/* ---------- Settings ---------- */
const SETTABS = [
  { id: "Profile", icon: "User" },
  { id: "Notifications", icon: "Bell" },
  { id: "Security", icon: "ShieldCheck" },
  { id: "Danger zone", icon: "TriangleAlert" },
];

function Settings({ onToast, onSignOut }) {
  const [tab, setTab] = useState("Profile");
  const [saved, setSaved] = useState(true);
  const [toggles, setToggles] = useState({ product: true, weekly: true, mentions: true, marketing: false, twofa: true });
  const flip = (k) => { setToggles((t) => ({ ...t, [k]: !t[k] })); setSaved(false); };
  const save = () => { setSaved(true); onToast({ kind: "success", title: "Changes saved", desc: "Your settings were updated." }); };

  return (
    <div className="shell">
      <div className="topbar">
        <div className="topbar__in">
          <span className="topbar__em">A</span>
          <span className="topbar__name">APT Console</span>
          <div className="topbar__sp" />
          <div className="topbar__user"><img src="../../assets/profile.jpg" alt="" /> Adam Thompson</div>
        </div>
      </div>
      <div className="wrap">
        <h1>Settings</h1>
        <p className="lead">Manage your profile, notifications, and security.</p>
        {!saved && <Alert kind="warn" title="You have unsaved changes">Save before leaving this page.</Alert>}
        <div className="settings">
          <div className="settabs">
            {SETTABS.map((t) => (
              <div key={t.id} className={`settab${tab === t.id ? " active" : ""}`} onClick={() => setTab(t.id)}>
                <Icon name={t.icon} />{t.id}
              </div>
            ))}
          </div>

          {tab === "Profile" && (
            <div className="panel">
              <div className="panel__sec">
                <div className="panel__h">Profile photo</div>
                <div className="profilerow" style={{ marginTop: 14 }}>
                  <img src="../../assets/profile.jpg" alt="" />
                  <button className="btn btn--outline" style={{ width: "auto", padding: "0 14px", height: 36 }}><Icon name="Upload" size={15} /> Change</button>
                </div>
              </div>
              <div className="panel__sec">
                <div className="panel__h">Basics</div>
                <div className="row">
                  <div className="field"><label>Full name</label><div className="inp"><Icon name="User" /><input defaultValue="Adam Thompson" onChange={() => setSaved(false)} /></div></div>
                  <div className="field"><label>Username</label><div className="inp"><Icon name="AtSign" /><input defaultValue="adthomps" onChange={() => setSaved(false)} /></div></div>
                </div>
                <div className="field" style={{ marginTop: 14 }}><label>Email</label><div className="inp"><Icon name="Mail" /><input defaultValue="adam@apt.dev" onChange={() => setSaved(false)} /></div></div>
              </div>
              <div className="panel__foot">
                <button className="btn btn--outline">Cancel</button>
                <button className="btn btn--primary" onClick={save}>Save changes</button>
              </div>
            </div>
          )}

          {tab === "Notifications" && (
            <div className="panel">
              <div className="panel__sec">
                <div className="panel__h">Email notifications</div>
                <div style={{ marginTop: 8 }}>
                  {[["product", "Product updates", "New features, releases, and changelog highlights."],
                    ["weekly", "Weekly digest", "A Monday summary of activity across your systems."],
                    ["mentions", "Mentions & reviews", "When someone @mentions you or requests a review."],
                    ["marketing", "Marketing", "Occasional tips and offers. (Off by default.)"]].map(([k, t, d]) => (
                    <div className="togglerow" key={k}>
                      <div><div className="togglerow__t">{t}</div><div className="togglerow__d">{d}</div></div>
                      <div className={`sw${toggles[k] ? " on" : ""}`} onClick={() => flip(k)} role="switch" aria-checked={toggles[k]} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="panel__foot">
                <button className="btn btn--primary" onClick={save}>Save preferences</button>
              </div>
            </div>
          )}

          {tab === "Security" && (
            <div className="panel">
              <div className="panel__sec">
                <div className="panel__h">Password</div>
                <div className="panel__s">Last changed 3 months ago.</div>
                <button className="btn btn--outline" style={{ width: "auto", padding: "0 14px", height: 36, marginTop: 14 }}>Change password</button>
              </div>
              <div className="panel__sec">
                <div className="togglerow" style={{ borderBottom: 0, padding: 0 }}>
                  <div><div className="togglerow__t">Two-factor authentication</div><div className="togglerow__d">Require a verification code at sign-in. Strongly recommended.</div></div>
                  <div className={`sw${toggles.twofa ? " on" : ""}`} onClick={() => flip("twofa")} role="switch" aria-checked={toggles.twofa} />
                </div>
              </div>
              <div className="panel__foot">
                <button className="btn btn--primary" onClick={save}>Save</button>
              </div>
            </div>
          )}

          {tab === "Danger zone" && (
            <div className="panel danger">
              <div className="panel__sec">
                <div className="panel__h">Sign out everywhere</div>
                <div className="panel__s">End all active sessions on every device.</div>
                <button className="btn btn--outline" style={{ width: "auto", padding: "0 14px", height: 36, marginTop: 14 }} onClick={onSignOut}>Sign out everywhere</button>
              </div>
              <div className="panel__sec">
                <div className="panel__h">Delete account</div>
                <div className="panel__s">Permanently remove your account and all systems. This cannot be undone.</div>
                <button className="btn--danger btn" style={{ marginTop: 14 }} onClick={() => onToast({ kind: "error", title: "Confirmation required", desc: "Type your workspace name to delete." })}>Delete account</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- App / router ---------- */
function AccountApp() {
  const [view, setView] = useState("login"); // login | signup | settings
  const [toasts, setToasts] = useState([]);
  const pushToast = (t) => {
    const id = Date.now() + Math.random();
    setToasts((cur) => [...cur, { ...t, id }]);
    setTimeout(() => setToasts((cur) => cur.filter((x) => x.id !== id)), 4200);
  };
  const dismiss = (id) => setToasts((cur) => cur.filter((x) => x.id !== id));
  const signedIn = () => { setView("settings"); pushToast({ kind: "success", title: "Signed in", desc: "Welcome back to APT." }); };

  return (
    <div>
      <Toasts items={toasts} onDismiss={dismiss} />
      {view === "settings" ? (
        <Settings onToast={pushToast} onSignOut={() => { setView("login"); pushToast({ kind: "info", title: "Signed out", desc: "You've been signed out everywhere." }); }} />
      ) : (
        <div className="cosmic">
          <div className="cosmic__glows" />
          <div className="cosmic__stars" />
          {view === "login"
            ? <Login onSignup={() => setView("signup")} onSignedIn={signedIn} />
            : <Signup onLogin={() => setView("login")} onSignedIn={signedIn} />}
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<AccountApp />);
