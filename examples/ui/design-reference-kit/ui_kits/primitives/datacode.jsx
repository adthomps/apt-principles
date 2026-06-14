/* APT Primitives — Data & code: code block with language tabs + copy,
   inline code, and keyboard keys. */
const { useState: useStateDc } = React;

/* Pre-tokenized snippets. Each tab is { id, label, plain (for clipboard),
   lines (JSX with token spans) }. */
const SNIPPETS = [
  {
    id: "curl", label: "cURL",
    plain: `curl https://api.apt.dev/v1/decisions \\\n  -H "Authorization: Bearer $APT_KEY" \\\n  -d '{"system":"payments","choice":"idempotent-retries"}'`,
    lines: (
      <>
        <span className="tok-fn">curl</span> https://api.apt.dev/v1/decisions \{"\n"}
        {"  "}-H <span className="tok-str">"Authorization: Bearer $APT_KEY"</span> \{"\n"}
        {"  "}-d <span className="tok-str">{`'{"system":"payments","choice":"idempotent-retries"}'`}</span>
      </>
    ),
  },
  {
    id: "js", label: "JavaScript",
    plain: `import { apt } from "@apt/sdk";\n\nconst decision = await apt.decisions.create({\n  system: "payments",\n  choice: "idempotent-retries",\n});`,
    lines: (
      <>
        <span className="tok-key">import</span> {"{ apt }"} <span className="tok-key">from</span> <span className="tok-str">"@apt/sdk"</span>;{"\n\n"}
        <span className="tok-key">const</span> decision = <span className="tok-key">await</span> apt.decisions.<span className="tok-fn">create</span>({"({"}{"\n"}
        {"  "}system: <span className="tok-str">"payments"</span>,{"\n"}
        {"  "}choice: <span className="tok-str">"idempotent-retries"</span>,{"\n"}
        {"});"}
      </>
    ),
  },
  {
    id: "py", label: "Python",
    plain: `from apt import Client\n\nclient = Client(api_key=APT_KEY)\nclient.decisions.create(\n    system="payments",\n    choice="idempotent-retries",\n)`,
    lines: (
      <>
        <span className="tok-key">from</span> apt <span className="tok-key">import</span> Client{"\n\n"}
        client = <span className="tok-fn">Client</span>(api_key=APT_KEY){"\n"}
        client.decisions.<span className="tok-fn">create</span>({"\n"}
        {"    "}system=<span className="tok-str">"payments"</span>,{"\n"}
        {"    "}choice=<span className="tok-str">"idempotent-retries"</span>,{"\n"}
        )
      </>
    ),
  },
];

function CodeBlock() {
  const [tab, setTab] = useStateDc("js");
  const [copied, setCopied] = useStateDc(false);
  const active = SNIPPETS.find((s) => s.id === tab);
  const copy = () => {
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 1600); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(active.plain).then(done).catch(done);
    } else { done(); }
  };
  return (
    <div className="code">
      <div className="code__bar">
        {SNIPPETS.map((s) => (
          <button key={s.id} className={tab === s.id ? "on" : ""} onClick={() => setTab(s.id)}>{s.label}</button>
        ))}
        <button className={`code__copy${copied ? " done" : ""}`} onClick={copy}>
          <Icon name={copied ? "Check" : "Copy"} />{copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre><code>{active.lines}</code></pre>
    </div>
  );
}

function InlineBits() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, width: "100%" }}>
      <p style={{ fontSize: 13.5, lineHeight: 1.7, color: "hsl(220 12% 82%)", margin: 0 }}>
        Set the <span className="inline-code">APT_KEY</span> environment variable, then call <span className="inline-code">apt.decisions.create()</span> to log a tradeoff.
      </p>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
        <span className="kbd-row"><Kbd>⌘</Kbd><span className="plus">+</span><Kbd>K</Kbd><span style={{ fontSize: 12.5, color: "hsl(var(--muted-foreground))", marginLeft: 4 }}>Command palette</span></span>
        <span className="kbd-row"><Kbd>⌘</Kbd><span className="plus">+</span><Kbd>↵</Kbd><span style={{ fontSize: 12.5, color: "hsl(var(--muted-foreground))", marginLeft: 4 }}>Submit</span></span>
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
        <span className="kbd-row"><Kbd>Esc</Kbd><span style={{ fontSize: 12.5, color: "hsl(var(--muted-foreground))", marginLeft: 4 }}>Dismiss</span></span>
        <span className="kbd-row"><Kbd>G</Kbd><span className="plus">then</span><Kbd>P</Kbd><span style={{ fontSize: 12.5, color: "hsl(var(--muted-foreground))", marginLeft: 4 }}>Go to Proof</span></span>
      </div>
    </div>
  );
}

function DataCodeView() {
  return (
    <div>
      <StageHead title="Code &amp; technical">The technical surfaces every developer-facing APT product shares — multi-language code blocks with copy, inline code, and keyboard hints. All set in IBM Plex Mono.</StageHead>
      <div className="specs">
        <Spec title="Code block" span desc="Multi-language snippet with language tabs and a copy button that confirms. Active language carries a primary underline; copy flips to a teal check." note={<>Tabs switch language; <b>Copy</b> writes the raw source and confirms in teal. Token colors map to the chart ramp — strings teal, keywords purple, functions blue.</>}>
          <CodeBlock />
        </Spec>
        <Spec title="Inline code &amp; keys" span desc="In-prose code spans and keyboard keys for documentation and shortcut hints." note={<>Inline code is primary-tinted mono on a muted chip. <code>kbd</code> keys get a 2px bottom border to read as physical keys.</>}>
          <InlineBits />
        </Spec>
      </div>
    </div>
  );
}

window.DataCodeView = DataCodeView;
