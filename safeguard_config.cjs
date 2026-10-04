const fs = require('fs');
let tabs = fs.readFileSync('src/components/Tabs.jsx', 'utf8');

tabs = tabs.replace(
  'export function ConfigTab({ config, updateConfig }) {',
  'export function ConfigTab({ config = {}, updateConfig }) {\n  const safeConfig = { enablePdf: true, enableCalendar: true, enableGamification: true, enableLofi: true, ...(config || {}) };'
);

tabs = tabs.replace(/checked=\{config\.enable/g, 'checked={safeConfig.enable');

tabs = tabs.replace(
  'updateConfig({ ...config, [key]: !config[key] });',
  'updateConfig({ ...safeConfig, [key]: !safeConfig[key] });'
);

fs.writeFileSync('src/components/Tabs.jsx', tabs, 'utf8');
