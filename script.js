document.addEventListener("DOMContentLoaded", async function () {
  const timerDisplay = document.getElementById("timer");
  const speedDisplay = document.getElementById("speed");
  const accuracyDisplay = document.getElementById("accuracy");
  const textDisplay = document.getElementById("text-display");
  const retryButton = document.getElementById("retry-button");
  const changeDifficultyButton = document.getElementById("change-difficulty");
  const difficultyOptions = document.getElementById("difficulty-options");

  let sampleText = await getWords();
  let startTime, timerInterval;
  let currentIndex = 0;
  let mistakesCounter = 0;
  let isGameActive = false;

  // Initialize game
  textDisplay.innerHTML = sampleText
    .split("")
    .map((char) => `<span>${char}</span>`)
    .join("");
  initializeCursor();

  // Event listeners
  document.addEventListener("keydown", handleKeydown);
  retryButton.addEventListener("click", resetGame);
  changeDifficultyButton.addEventListener("click", toggleDifficultyOptions);
  document.querySelectorAll("#difficulty-options button").forEach((button) => {
    button.addEventListener("click", handleDifficultyChange);
  });

  // Functions
  function handleKeydown(event) {
    if (!isGameActive) return;

    if (!startTime) {
      startTime = new Date();
      startTimer();
    }

    if (event.key.length > 1 && event.key !== "Backspace") return;

    const spans = textDisplay.querySelectorAll("span");
    if (event.key === "Backspace") {
      handleBackspace(spans);
      return;
    }

    if (currentIndex >= sampleText.length) return;

    const typedKey = event.key;
    const expectedChar = sampleText[currentIndex];

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

    if (currentIndex === sampleText.length) {
      stopTimer();
      displayTypingSpeed();
      displayAccuracy();
    }
  }

  function handleBackspace(spans) {
    if (currentIndex > 0) {
      if (spans[currentIndex - 1].classList.contains("incorrect")) {
        mistakesCounter--; // Decrement mistakesCounter if correcting an incorrect character
      }
      spans[currentIndex].classList.remove("current");
      currentIndex--;
      spans[currentIndex].classList.remove("correct", "incorrect");
    }
    highlightCurrentCharacter(spans);
  }

  function initializeCursor() {
    const spans = textDisplay.querySelectorAll("span");
    if (spans.length > 0) spans[0].classList.add("current");
  }

  function highlightCurrentCharacter(spans) {
    spans.forEach((span) => span.classList.remove("current"));
    if (currentIndex < spans.length) spans[currentIndex].classList.add("current");
  }

  function startTimer() {
    timerInterval = setInterval(() => {
      const elapsedTime = new Date() - startTime;
      const seconds = Math.floor(elapsedTime / 1000);
      timerDisplay.textContent = seconds;
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timerInterval);
  }

  function displayTypingSpeed() {
    if (!startTime) return;
    const wordsTyped = sampleText.split(" ").length;
    const timeInMinutes = (new Date() - startTime) / 1000 / 60;
    const wpm = Math.floor(wordsTyped / timeInMinutes);
    speedDisplay.textContent = wpm;
  }

  function displayAccuracy() {
    const totalChars = sampleText.length;
    if (totalChars === 0) {
      accuracyDisplay.textContent = "100.00";
      return;
    }
    const accuracy = (((totalChars - mistakesCounter) / totalChars) * 100).toFixed(2);
    accuracyDisplay.textContent = accuracy;
  }

  async function getWords(difficulty = "easy") {
    try {
      let wordLength, wordCount;
      switch (difficulty) {
        case "easy":
          wordLength = 3;
          wordCount = 20;
          break;
        case "medium":
          wordLength = 5;
          wordCount = 30;
          break;
        case "hard":
          wordLength = 7;
          wordCount = 40;
          break;
        default:
          wordLength = 5;
          wordCount = 30;
      }

      const response = await fetch(
        `https://random-word-api.herokuapp.com/word?number=${wordCount}&length=${wordLength}`
      );
      const words = await response.json();
      return words.join(" ");
    } catch (error) {
      console.error("Error fetching words:", error);
      return "Peter piper bit a pan of pickled pepper and the quick brown fox jumps over the moon.";
    }
  }

  async function resetGame(difficulty = "easy") {
    isGameActive = false;
    stopTimer();
    timerDisplay.textContent = "0";
    speedDisplay.textContent = "0";
    accuracyDisplay.textContent = "0";
    startTime = null;
    currentIndex = 0;
    mistakesCounter = 0;

    sampleText = await getWords(difficulty);
    textDisplay.innerHTML = sampleText
      .split("")
      .map((char) => `<span>${char}</span>`)
      .join("");

    const spans = textDisplay.querySelectorAll("span");
    spans.forEach((span) => {
      span.classList.remove("correct", "incorrect", "current");
    });

    initializeCursor();
  }

  function toggleDifficultyOptions() {
    difficultyOptions.classList.toggle("active");
  }

  function handleDifficultyChange(e) {
    const selectedDifficulty = e.target.getAttribute("data-difficulty");
    resetGame(selectedDifficulty);
    difficultyOptions.classList.remove("active");
  }
});