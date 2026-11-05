
(() => {
  console.log("Interview Copilot caption reader started.");

  let lastCaption = "";
  let captionTimer = null;

  const captionSelectors = [
    '[class*="caption"]',
    '[class*="subtitle"]',
    '[class*="transcript"]',
    '[aria-live="polite"]',
    '[aria-live="assertive"]'
  ];

  function findCaptions() {
    const elements = document.querySelectorAll(
      captionSelectors.join(",")
    );

    const captions = [];

    elements.forEach((element) => {
      const text = element.innerText?.trim();

      if (
        text &&
        text.length > 2 &&
        text.length < 1000 &&
        element.getBoundingClientRect().width > 0
      ) {
        captions.push(text);
      }
    });

    return [...new Set(captions)];
  }

  function sendCaptions() {
    const captions = findCaptions();

    if (!captions.length) return;

    const currentCaption = captions.join("\n");

    if (currentCaption === lastCaption) return;

    lastCaption = currentCaption;

    chrome.runtime.sendMessage({
      type: "CAPTION_UPDATE",
      caption: currentCaption
    }).catch(() => {});
  }

  const observer = new MutationObserver(() => {
    clearTimeout(captionTimer);

    captionTimer = setTimeout(sendCaptions, 500);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });

  sendCaptions();
})();
