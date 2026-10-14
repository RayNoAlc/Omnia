// Omnia Focus Shield & Distraction Blocker
const BLOCKED_DOMAINS = [
  "youtube.com",
  "instagram.com",
  "tiktok.com",
  "twitter.com",
  "x.com",
  "facebook.com",
  "reddit.com",
  "netflix.com"
];

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    chrome.storage.local.get(["blockerEnabled"], (data) => {
      const isEnabled = data.blockerEnabled !== false;
      if (!isEnabled) return;

      const url = changeInfo.url.toLowerCase();
      const isBlocked = BLOCKED_DOMAINS.some(domain => url.includes(domain));
      if (isBlocked) {
        chrome.tabs.update(tabId, {
          url: "https://omnia-unio.vercel.app/?tab=foco&distractionBlocked=true"
        });
      }
    });
  }
});
