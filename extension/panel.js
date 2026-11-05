
const API_URL = "https://interview-copilot-ici6k8o96-mainnet-connect1.vercel.app/api/answer";

const questionInput = document.getElementById("question");
const answerBox = document.getElementById("answer");
const statusBox = document.getElementById("status");
const getAnswerButton = document.getElementById("getAnswer");

let scrollTimer = null;
let captionTimer = null;
let lastQuestion = "";
let lastCaption = "";
let generating = false;

async function generateAnswer(question) {
  if (!question || generating) return;

  generating = true;
  questionInput.value = question;
  getAnswerButton.disabled = true;
  statusBox.textContent = "Generating AI answer...";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ question })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Request failed.");
    }

    answerBox.textContent = data.answer || "No answer returned.";
    statusBox.textContent = "AI answer ready.";

  } catch (error) {
    statusBox.textContent = "Error: " + error.message;
  } finally {
    generating = false;
    getAnswerButton.disabled = false;
  }
}

// Manual question submission
getAnswerButton.addEventListener("click", () => {
  const question = questionInput.value.trim();

  if (!question) {
    statusBox.textContent = "Please enter an interview question.";
    return;
  }

  generateAnswer(question);
});

// Detect likely interview questions
function looksLikeQuestion(text) {
  const question = text.trim();

  if (question.length < 12 || question.length > 500) {
    return false;
  }

  if (question.includes("?")) {
    return true;
  }

  return /^(tell me|describe|explain|what|why|how|when|where|which|who|can you|could you|would you|do you|have you|are you|is there|walk me through)\b/i.test(question);
}

// Receive captions from Zoom
chrome.runtime.onMessage.addListener((message) => {
  if (!message || message.type !== "CAPTION_UPDATE") {
    return;
  }

  const caption = String(message.caption || "").trim();

  if (!caption || caption === lastCaption) return;

  lastCaption = caption;

  statusBox.textContent = "Zoom captions detected. Listening...";

  clearTimeout(captionTimer);

  captionTimer = setTimeout(() => {
    const lines = caption
      .split(/\n/)
      .map(line => line.trim())
      .filter(Boolean);

    const candidate = lines[lines.length - 1] || caption;

    if (!looksLikeQuestion(candidate)) return;

    if (candidate === lastQuestion) return;

    lastQuestion = candidate;

    generateAnswer(candidate);
  }, 1500);
});

// Scrolling controls
document.getElementById("startScroll").addEventListener("click", () => {
  if (scrollTimer) return;

  const speed = document.getElementById("speed");

  scrollTimer = setInterval(() => {
    window.scrollBy(0, Number(speed.value));
  }, 50);
});

document.getElementById("pauseScroll").addEventListener("click", () => {
  clearInterval(scrollTimer);
  scrollTimer = null;
});

document.getElementById("resetScroll").addEventListener("click", () => {
  clearInterval(scrollTimer);
  scrollTimer = null;
  window.scrollTo(0, 0);
});

// Text-size control
document.getElementById("textSize").addEventListener("input", (event) => {
  answerBox.style.fontSize = event.target.value + "px";
});
