document.addEventListener("DOMContentLoaded", async function () {
  let startTime, timerInterval;
  const timerDisplay = document.getElementById("timer");
  const speedDisplay = document.getElementById("speed");
  const accuracyDisplay = document.getElementById("accuracy");
  const textDisplay = document.getElementById("text-display");

  let sampleText = await getWords();

  textDisplay.innerHTML = sampleText
    .split("")
    .map((char) => `<span>${char}</span>`)
    .join("");

  // Track user input
  let currentIndex = 0;
  let mistakesCounter = 0;

  initializeCursor();
  highlightCurrentCharacter(textDisplay.querySelectorAll("span"));

  document.addEventListener("keydown", (event) => {
    if (!startTime) {
      startTime = new Date();
      startTimer();
    }

    // Ignore all other keys that are not Backspace
    if (event.key.length > 1 && event.key !== "Backspace") return;

    let typedKey = event.key;
    let expectedChar = sampleText[currentIndex];
    const spans = textDisplay.querySelectorAll("span");

    // Handle backspace
    if (event.key === "Backspace") {
      if (currentIndex > 0) {
        spans[currentIndex].classList.remove("current");
        currentIndex--;
        spans[currentIndex].classList.remove("correct", "incorrect");
      }
      highlightCurrentCharacter(spans);
      return;
    }

    // To prevent overflow
    if (currentIndex >= sampleText.length) return;

    // Typed key and expected character comparison
    if (typedKey === expectedChar) {
      if (!spans[currentIndex].classList.contains("incorrect")) {
        spans[currentIndex].classList.add("correct");
      }
    } else {
      spans[currentIndex].classList.add("incorrect");
      mistakesCounter++;
    }

    currentIndex++;
    highlightCurrentCharacter(spans);

    // Stop the timer
    if (currentIndex === sampleText.length) {
      stopTimer();
      displayTypingSpeed();
      displayAccuracy();
    }
  });

  /*
   * Initialize cursor
   */
  function initializeCursor() {
    const spans = textDisplay.querySelectorAll("span");
    if (spans.length > 0) spans[0].classList.add("current");
  }

  /*
   * To highlight the current character
   */
  function highlightCurrentCharacter(spans) {
    spans.forEach((span) => span.classList.remove("current"));

    if (currentIndex < spans.length)
      spans[currentIndex].classList.add("current");
  }

  /*
   * Start Timer
   */
  function startTimer() {
    timerInterval = setInterval(() => {
      const currentTime = new Date();
      const elapsedTime = currentTime - startTime;
      const elapsedTimeInSecs = Math.floor(elapsedTime / 1000);
      timerDisplay.textContent = elapsedTimeInSecs;
    }, 1000);
  }

  /*
   * Stop Timer
   */
  function stopTimer() {
    clearInterval(timerInterval);
  }

  /*
   * Display typing speed
   */
  function displayTypingSpeed() {
    if (!startTime) return;

    const wordsTyped = sampleText.split(" ").length;
    let timeInMinutes = (new Date() - startTime) / 1000 / 60;

    // Calculate words per minute
    const wpm = Math.floor(wordsTyped / timeInMinutes);
    speedDisplay.textContent = wpm;
  }

  /*
   * Display accuracy
   */
  function displayAccuracy() {
    const totalChars = sampleText.length;

    const accuracy = (
      ((totalChars - mistakesCounter) / totalChars) *
      100
    ).toFixed(2);
    accuracyDisplay.textContent = accuracy;
  }

  /*
   * Random words API
   */
  async function getWords() {
    try {
      const response = await fetch(
        "https://random-word-api.herokuapp.com/word?number=30&length=5"
      );
      const words = await response.json();
      return words.join(" ");
    } catch (error) {
      console.error("Error fetching words:", error);
      return "Peter piper bit a pan of pickled pepper and the quick brown fox jumps over the moon.";
    }
  }
});
