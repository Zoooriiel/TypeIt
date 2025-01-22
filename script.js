const textToType = document.getElementById('text-to-type');
const userInput = document.getElementById('user-input');
const timerDisplay = document.getElementById('timer');
const speedDisplay = document.getElementById('speed');
const accuracyDisplay = document.getElementById('accuracy');

let startTime, timerInterval;

// Sample text for typing
const sampleText = "The quick brown fox jumps over the lazy dog.";
textToType.textContent = sampleText;

// Start the test when the user starts typing
userInput.addEventListener('input', () => {
  if (!startTime) {
    startTime = new Date();
    startTimer();
  }
  checkInput();
});

// Check the user's input against the sample text
function checkInput() {
  const typedText = userInput.value;
  const sampleTextArray = sampleText.split('');
  let correctChars = 0;

  sampleTextArray.forEach((char, index) => {
    if (typedText[index] === char) {
      correctChars++;
    }
  });

  const accuracy = ((correctChars / sampleText.length) * 100).toFixed(2);
  accuracyDisplay.textContent = accuracy;

  // End the test if the user finishes typing
  if (typedText.length === sampleText.length) {
    endTest();
  }
}

// Start the timer
function startTimer() {
  timerInterval = setInterval(() => {
    const currentTime = new Date();
    const timeElapsed = Math.floor((currentTime - startTime) / 1000);
    timerDisplay.textContent = timeElapsed;
  }, 1000);
}

// End the test and calculate results
function endTest() {
  clearInterval(timerInterval);
  endTime = new Date();
  const timeTaken = (endTime - startTime) / 1000; // in seconds
  const wordsTyped = userInput.value.split(' ').length;
  const speed = Math.floor((wordsTyped / timeTaken) * 60); // words per minute
  speedDisplay.textContent = speed;
}

// Reset the test when the textarea is cleared
userInput.addEventListener('input', () => {
  if (userInput.value === '') {
    resetTest();
  }
});

// Reset the test
function resetTest() {
  userInput.value = '';
  timerDisplay.textContent = '0';
  speedDisplay.textContent = '0';
  accuracyDisplay.textContent = '0';
  startTime = null;
  clearInterval(timerInterval);
}