/* APT Primitives UI kit — the shared interaction atoms every APT surface reuses.
   View switcher over Navigation, Controls, Disclosure, Feedback, and Code. */
const { useState: useStateApp } = React;

const PRIM_VIEWS = [
  { id: "nav", icon: "Navigation", label: "Navigation" },
  { id: "controls", icon: "SlidersHorizontal", label: "Controls" },
  { id: "disclosure", icon: "PanelTopOpen", label: "Disclosure" },
  { id: "feedback", icon: "Activity", label: "Feedback" },
  { id: "code", icon: "Code", label: "Code" },
];

function PrimitivesApp() {
  const [view, setView] = useStateApp("nav");
  return (
    <div>
      <div className="topbar">
        <div className="topbar__in">
          <span className="topbar__em">A</span>
          <span className="topbar__name">APT Primitives<small>UI kit</small></span>
          <div className="topbar__sp" />
          <div className="segment">
            {PRIM_VIEWS.map((v) => (
              <button key={v.id} className={view === v.id ? "on" : ""} onClick={() => setView(v.id)}>
                <Icon name={v.icon} /><span>{v.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="stage">
        {view === "nav" && <NavigationView />}
        {view === "controls" && <ControlsView />}
        {view === "disclosure" && <DisclosureView />}
        {view === "feedback" && <FeedbackView />}
        {view === "code" && <DataCodeView />}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<PrimitivesApp />);
