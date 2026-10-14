const toggle = document.getElementById("blockerToggle");
const clipBtn = document.getElementById("clipBtn");
const openOmniaBtn = document.getElementById("openOmniaBtn");
const statusMsg = document.getElementById("statusMsg");

// Carregar estado do bloqueador
chrome.storage.local.get(["blockerEnabled"], (data) => {
  toggle.checked = data.blockerEnabled !== false;
});

toggle.addEventListener("change", () => {
  chrome.storage.local.set({ blockerEnabled: toggle.checked });
});

// Capturar página atual
clipBtn.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const sel = window.getSelection().toString();
      const text = sel ? sel : document.body.innerText.substring(0, 3000);
      return { title: document.title, url: window.location.href, text };
    }
  }, (results) => {
    if (results && results[0] && results[0].result) {
      const { title, url, text } = results[0].result;
      const omniaUrl = `https://omnia-unio.vercel.app/?clipperTitle=${encodeURIComponent(title)}&clipperUrl=${encodeURIComponent(url)}&clipperText=${encodeURIComponent(text)}`;
      chrome.tabs.create({ url: omniaUrl });
      statusMsg.style.display = "block";
      setTimeout(() => { statusMsg.style.display = "none"; }, 3000);
    }
  });
});

openOmniaBtn.addEventListener("click", () => {
  chrome.tabs.create({ url: "https://omnia-unio.vercel.app" });
});
