import { Component } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default class AppErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("PrepTrack page error", error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <section className="state-page error-state" role="alert">
        <AlertTriangle size={48} />
        <h1>This page could not be displayed</h1>
        <p>Your information is safe. Refresh the page to try loading this workspace again.</p>
        <button onClick={() => window.location.reload()}><RefreshCw size={17} />Refresh page</button>
      </section>
    );
  }
}
