const BLOCKED_DOMAINS = ["facebook.com", "instagram.com", "twitter.com", "x.com", "tiktok.com"];

const RULES = BLOCKED_DOMAINS.map((domain, index) => ({
  id: index + 1,
  priority: 1,
  action: { type: "block" },
  condition: {
    urlFilter: `||${domain}`,
    resourceTypes: ["main_frame", "sub_frame"]
  }
}));

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "FOCUS_STATUS") {
    console.log("Modo Foco recebido:", message.isRunning);
    if (message.isRunning) {
      // Ativa as regras de bloqueio
      chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: RULES.map(r => r.id),
        addRules: RULES
      });
      console.log("Distrações BLOQUEADAS!");
    } else {
      // Desativa as regras
      chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: RULES.map(r => r.id)
      });
      console.log("Distrações LIBERADAS!");
    }
  }
});
