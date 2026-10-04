console.log("Omnia Blocker: Content script injetado.");

// Escuta o evento CustomEvent disparado pelo app React
window.addEventListener("OmniaFocusStatus", (e) => {
  const isRunning = e.detail.running;
  console.log("Omnia Blocker ouviu status de Foco:", isRunning);
  // Avisa o background script
  chrome.runtime.sendMessage({ type: "FOCUS_STATUS", isRunning });
});

// Checa o atributo do body que também foi injetado (fallback útil se recarregar a página)
const observer = new MutationObserver(() => {
  const isFocus = document.body.getAttribute('data-omnia-focus') === 'true';
  chrome.runtime.sendMessage({ type: "FOCUS_STATUS", isRunning: isFocus });
});
observer.observe(document.body, { attributes: true, attributeFilter: ['data-omnia-focus'] });

// Manda o status inicial assim que carregar
const isFocusInit = document.body.getAttribute('data-omnia-focus') === 'true';
chrome.runtime.sendMessage({ type: "FOCUS_STATUS", isRunning: isFocusInit });
