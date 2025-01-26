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
  let currentIndex = 0;                 // tracks the position of the current character the user is typing
  let mistakesCounter = 0;
  let currentDifficulty = "easy";


  // Initialize game
  textDisplay.innerHTML = sampleText
    .split("")
    .map((char) => `<span>${char}</span>`)
    .join("");
  initializeCursor();
  highlightCurrentDifficulty();


  // Event listeners
  document.addEventListener("keydown", handleKeydown);
  retryButton.addEventListener("click", resetGame);
  changeDifficultyButton.addEventListener("click", toggleDifficultyOptions);
  document.querySelectorAll("#difficulty-options button").forEach((button) => {
    button.addEventListener("click", handleDifficultyChange);
  });


  // Functions

  /*
  * Upon key press
  */
  function handleKeydown(event) {
    if (event.key === " ") event.preventDefault();
    // Start the timer on the first keypress
    if (!startTime) {
      startTime = new Date();
      startTimer();
    }

    // Ignore all keys except Backspace
    if (event.key.length > 1 && event.key !== "Backspace") return;

    const spans = textDisplay.querySelectorAll("span");
    if (event.key === "Backspace") {
      handleBackspace(spans);
      return;
    }

    // Prevent overflow
    if (currentIndex >= sampleText.length) return;

    const typedKey = event.key;
    const expectedChar = sampleText[currentIndex];

    if (typedKey === expectedChar) {
      spans[currentIndex].classList.add("correct");
    } else {
      spans[currentIndex].classList.add("incorrect");
      mistakesCounter++;
    }

    currentIndex++;
    highlightCurrentCharacter(spans);

    // Stop the timer when all characters are typed
    if (currentIndex === sampleText.length) {
      stopTimer();
      displayTypingSpeed();
      displayAccuracy();
    }
  }


  /*
  * Backspace Handler (Removes correct and incorrect text styling)
  */
  function handleBackspace(spans) {
    if (currentIndex > 0) {
      spans[currentIndex].classList.remove("current");
      currentIndex--;
      spans[currentIndex].classList.remove("correct", "incorrect");
    }
    highlightCurrentCharacter(spans);
  }


  /*
  * Initialize cursor (Place it at the start)
  */
  function initializeCursor() {
    const spans = textDisplay.querySelectorAll("span");
    if (spans.length > 0) spans[0].classList.add("current");
  }


  /*
  * Place cursor on the current letter
  */
  function highlightCurrentCharacter(spans) {
    spans.forEach((span) => span.classList.remove("current"));
    if (currentIndex < spans.length) spans[currentIndex].classList.add("current");
  }

  
  /*
  * Start Timer
  */
  function startTimer() {
    timerInterval = setInterval(() => {
      const elapsedTime = new Date() - startTime;
      const seconds = Math.floor(elapsedTime / 1000);
      timerDisplay.textContent = seconds;
    }, 1000);
  }


  /*
  * Stop Timer
  */
  function stopTimer() {
    clearInterval(timerInterval);
  }


  /*
  * Display typing speed (WPM)
  */
  function displayTypingSpeed() {
    if (!startTime) return;
    const wordsTyped = sampleText.split(" ").length;
    const timeInMinutes = (new Date() - startTime) / 1000 / 60;
    const wpm = Math.floor(wordsTyped / timeInMinutes);
    speedDisplay.textContent = wpm;
  }


  /*
  * Display accuracy
  */
  function displayAccuracy() {
    const totalChars = sampleText.length;
    if (totalChars === 0) {
      accuracyDisplay.textContent = "100.00";
      return;
    }
    const accuracy = (((totalChars - mistakesCounter) / totalChars) * 100).toFixed(2);
    accuracyDisplay.textContent = accuracy;
  }


  /*
  * API random word fetcher
  */
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


  /*
  * Reset Game
  */
  async function resetGame() {
    stopTimer();
    timerDisplay.textContent = "0";
    speedDisplay.textContent = "0";
    accuracyDisplay.textContent = "0";
    startTime = null;
    currentIndex = 0;
    mistakesCounter = 0;

    sampleText = await getWords(currentDifficulty);
    textDisplay.innerHTML = sampleText
      .split("")
      .map((char) => `<span>${char}</span>`)
      .join("");

    const spans = textDisplay.querySelectorAll("span");
    spans.forEach((span) => {
      span.classList.remove("correct", "incorrect", "current");
    });

    initializeCursor(); // Reset the cursor to the first character
  }


  /*
  *
  */
  function toggleDifficultyOptions() {
    difficultyOptions.classList.toggle("active");
  }


  /*
  *
  */
  function handleDifficultyChange(e) {
    e.target.blur();
    const selectedDifficulty = e.target.getAttribute("data-difficulty");
    currentDifficulty = selectedDifficulty; 
    resetGame(); 
    difficultyOptions.classList.remove("active"); 
    highlightCurrentDifficulty(); 
  }


  /*
  *
  */
  function highlightCurrentDifficulty() {
    document.querySelectorAll("#difficulty-options button").forEach((button) => {
      button.classList.remove("active-difficulty");
    });

    const currentDifficultyButton = document.querySelector(
      `#difficulty-options button[data-difficulty="${currentDifficulty}"]`
    );
    if (currentDifficultyButton) {
      currentDifficultyButton.classList.add("active-difficulty");
    }
  }
});