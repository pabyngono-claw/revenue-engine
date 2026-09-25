import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// Error Boundary for catching render errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
    this.setState({ error, errorInfo });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, background: "#FDECEC", border: "1px solid #C0392B", borderRadius: 8, color: "#C0392B", fontFamily: "monospace", fontSize: 12 }}>
          <h3 style={{ margin: "0 0 10px" }}>💥 Render Error Caught</h3>
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{this.state.error?.message}</pre>
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", marginTop: 10, fontSize: 10 }}>{this.state.errorInfo?.componentStack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
)