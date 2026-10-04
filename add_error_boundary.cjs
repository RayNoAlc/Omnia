const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

// Wrap ConfigTab with a try-catch error boundary just in case!
const errorBoundary = 
class ConfigErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) { console.error("ConfigTab Error:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return <div className="p-10 text-red-500">Erro na aba Configurações: {this.state.error.message}</div>;
    }
    return this.props.children;
  }
}
export function ConfigTab(props) {
  return <ConfigErrorBoundary><ConfigTabInner {...props} /></ConfigErrorBoundary>;
}
;

tabs = tabs.replace('export function ConfigTab({ config = {}, updateConfig }) {', errorBoundary + '\nfunction ConfigTabInner({ config = {}, updateConfig }) {');

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
