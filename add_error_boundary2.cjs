const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

const errorBoundary = 
import React from 'react';
class ConfigErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) { console.error("ConfigTab Error:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return React.createElement('div', { className: 'p-10 text-red-500 font-bold' }, 'Erro fatal: ' + this.state.error.message);
    }
    return this.props.children;
  }
}
export function ConfigTab(props) {
  return React.createElement(ConfigErrorBoundary, null, React.createElement(ConfigTabInner, props));
}
;

tabs = tabs.replace('export function ConfigTab({ config = {}, updateConfig }) {', errorBoundary + '\nfunction ConfigTabInner({ config = {}, updateConfig }) {');

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
