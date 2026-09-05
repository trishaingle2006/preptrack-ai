export default function PageLoader({ label = "Loading workspace" }) {
  return (
    <div className="route-loader" role="status" aria-live="polite">
      <div className="loader-mark">PT</div>
      <div className="loader-copy"><strong>{label}</strong><span>Please wait a moment…</span></div>
      <span className="loader-line" />
    </div>
  );
}
