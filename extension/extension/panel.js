const API_URL = "https://interview-copilot-ici6k8o96-mainnet-connect1.vercel.app/api/answer";

const questionInput = document.getElementById("question");
const answerBox = document.getElementById("answer");
const statusBox = document.getElementById("status");

const getAnswerButton = document.getElementById("getAnswer");

getAnswerButton.addEventListener("click", async () => {
  const question = questionInput.value.trim();

  if (!question) {
    statusBox.textContent = "Please enter an interview question first.";
    return;
  }

  getAnswerButton.disabled = true;
  statusBox.textContent = "Connecting to your backend...";

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

    answerBox.textContent = data.answer || "No answer was returned.";
    statusBox.textContent = "Backend connected successfully.";
  } catch (error) {
    statusBox.textContent = "Connection failed: " + error.message;
  } finally {
    getAnswerButton.disabled = false;
  }
});

// Reading-panel scrolling controls
let scrollTimer = null;

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
