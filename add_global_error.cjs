const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf8');

const errorBoundaryCode = 
import React from 'react';
class GlobalErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error: error }; }
  componentDidCatch(error, errorInfo) { console.error("Global Crash:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', color: 'red', backgroundColor: '#1e1e1e', height: '100vh', fontFamily: 'monospace' }}>
          <h2>Erro Fatal no App.jsx</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error && this.state.error.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
;

app = app.replace(
  'export default function App() {',
  errorBoundaryCode + '\nexport default function App() {\n  return <GlobalErrorBoundary><AppInner /></GlobalErrorBoundary>;\n}\n\nfunction AppInner() {'
);

fs.writeFileSync('src/App.jsx', app, 'utf8');
