import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { ConfigTab } from './src/components/Tabs.jsx';

try {
  const html = ReactDOMServer.renderToString(React.createElement(ConfigTab, { config: {}, updateConfig: () => {} }));
  console.log('SUCCESS rendering ConfigTab');
} catch (e) {
  console.error('ERROR rendering ConfigTab:', e);
}
