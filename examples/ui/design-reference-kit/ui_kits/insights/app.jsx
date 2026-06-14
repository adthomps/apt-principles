/* APT Insights UI kit — interactive app: filter + browse + read. */

const INSIGHTS = [
  {
    id: "decision-driven", type: "article", cover: "../../assets/blog-decision-driven.webp",
    title: "Decision-Driven Development",
    description: "Treat decisions as the durable unit of engineering knowledge — not code, not tickets.",
    concepts: ["Architecture", "Documentation", "Team Clarity"], date: "Sep 12, 2025", duration: "6 min read",
  },
  {
    id: "feedback-multiplier", type: "article", cover: "../../assets/blog-feedback-multiplier.webp",
    title: "The Feedback Multiplier",
    description: "How tight, structured feedback loops compound the quality of AI-assisted systems over time.",
    concepts: ["AI", "Process", "Quality"], date: "Aug 24, 2025", duration: "5 min read",
  },
  {
    id: "ai-developers-journey", type: "article", cover: "../../assets/blog-ai-developers-journey.webp",
    title: "An AI Developer's Journey",
    description: "Field notes on moving from prompt experiments to dependable, reviewable agent workflows.",
    concepts: ["AI", "Agents", "Practice"], date: "Aug 10, 2025", duration: "7 min read",
  },
  {
    id: "creative-coding", type: "article", cover: "../../assets/blog-creative-coding.webp",
    title: "Creative Coding & Storytelling",
    description: "Where systems thinking meets craft — using code as a medium for narrative and exploration.",
    concepts: ["Creative", "Craft"], date: "Jul 28, 2025", duration: "4 min read",
  },
  {
    id: "systems-podcast", type: "podcast",
    title: "Systems Over Screens",
    description: "A conversation on why durable systems beat polished demos, and how to tell the difference.",
    concepts: ["Systems", "Product"], date: "Jul 02, 2025", duration: "38 min",
  },
  {
    id: "payments-case", type: "case-study",
    title: "AI in Payments: A Case Study",
    description: "Integrating predictive insight into a compliant, accessible enterprise payment interface.",
    concepts: ["Payments", "Design Systems", "Compliance"], date: "Jun 15, 2025", duration: "Case study",
  },
];

const FILTERS = [
  { key: "all", label: "All" },
  { key: "article", label: "Articles" },
  { key: "podcast", label: "Podcasts" },
  { key: "case-study", label: "Case Studies" },
];

const { useState } = React;

function Browse({ filter, setFilter, onOpen }) {
  const items = filter === "all" ? INSIGHTS : INSIGHTS.filter((i) => i.type === filter);
  return (
    <div className="container">
      <div className="head">
        <div className="eyebrow">Insights</div>
        <h1>Writing, talks &amp; case studies</h1>
        <p>Articles, podcasts, and case studies on building practical systems — the thinking behind the work.</p>
      </div>
      <div className="filters">
        {FILTERS.map((f) => (
          <button key={f.key} className={`chip${filter === f.key ? " active" : ""}`} onClick={() => setFilter(f.key)}>
            {f.label}
          </button>
        ))}
      </div>
      <div className="grid">
        {items.map((it) => <InsightCard key={it.id} item={it} onOpen={onOpen} />)}
      </div>
    </div>
  );
}

function Reading({ item, onBack }) {
  const meta = TYPE_META[item.type];
  return (
    <div className="container reading">
      <span className="back" onClick={onBack}><Icon name="ArrowLeft" size={15} /> All insights</span>
      <div className="article">
        <div style={{ marginTop: 18, display: "flex", gap: 8 }}>
          <span className="tag tag--accent tag--sm">{meta.label}</span>
        </div>
        <h1>{item.title}</h1>
        <div className="meta">
          <Icon name={meta.icon} size={15} />
          <span>{item.date}</span><span>·</span><span>{item.duration}</span>
        </div>
      </div>
      <div className="reading__cover">
        {item.cover ? <img src={item.cover} alt={item.title} />
          : <div className="gcover" style={{ position: "absolute" }}><span className="pill">{meta.label}</span><div className="st" style={{ fontSize: 34 }}>{item.title}</div></div>}
      </div>
      <div className="article">
        <p>{item.description} This piece is a representative reading view for the APT Insights surface — it
          shows how long-form content renders against the design system: measured line length, calm
          typography, and tokenized callouts and code.</p>

        <h2>Why this matters</h2>
        <p>APT favors <strong>systems over screens</strong>. A good decision, written down, outlives the
          code that implemented it. The goal of every insight here is to make the reasoning portable —
          so the next person (or agent) can apply it without re-deriving it.</p>

        <div className="callout">
          <Icon name="Lightbulb" size={18} className="ic" />
          <p>Capture the decision, the alternatives considered, and the tradeoff — not just the outcome.</p>
        </div>

        <h2>In practice</h2>
        <ul>
          <li>Anchor adaptive work in shared tokens so output stays on-brand.</li>
          <li>Keep copy concise, precise, and non-marketing.</li>
          <li>Define complete states — loading, empty, success, error — up front.</li>
        </ul>

        <pre><code>{`// A decision, recorded as the durable unit
decision("teal stays a restricted accent")
  .because("blue must carry brand + action")
  .tradeoff("less visual variety, more clarity");`}</code></pre>

        <p>That is the whole idea: decisions over demos. Read more across the Labs and Proof surfaces,
          where these ideas show up as working systems.</p>

        <span className="back" onClick={onBack}><Icon name="ArrowLeft" size={15} /> Back to all insights</span>
      </div>
    </div>
  );
}

function InsightsApp() {
  const [filter, setFilter] = useState("all");
  const [reading, setReading] = useState(null);
  const open = (item) => { setReading(item); window.scrollTo({ top: 0 }); };
  const back = () => { setReading(null); window.scrollTo({ top: 0 }); };
  return (
    <div>
      <AptNav active="Insights" onHome={back} />
      {reading ? <Reading item={reading} onBack={back} /> : <Browse filter={filter} setFilter={setFilter} onOpen={open} />}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<InsightsApp />);
