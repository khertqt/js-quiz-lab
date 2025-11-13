const quizData = [
  {
    question: "What does 'let' declare in JavaScript?",
    options: ["A constant value", "A changeable variable", "A function", "An array"],
    correct: 1
  },
  {
    question: "Which is the strict equality operator?",
    options: ["==", "=", "===", "!="],
    correct: 2
  },
  {
    question: "What is the purpose of a for loop?",
    options: [
      "To declare variables",
      "To repeat code a set number of times",
      "To handle events",
      "To style elements"
    ],
    correct: 1
  },
  {
    question: "How do you select an element by ID in the DOM?",
    options: ["querySelector", "getElementById", "createElement", "appendChild"],
    correct: 1
  }
];

let currentQuestion = 0;
let score = 0;
let selectedAnswer = -1;
let timerInterval;
let timeLeft = 30;
let totalTimeBonus = 0;
const totalQuestions = quizData.length;
let highScore = localStorage.getItem("jsQuizHighScore") || 0;

// Event Listeners
document.getElementById("start-btn").addEventListener("click", () => {
  document.getElementById("start-screen").style.display = "none";
  document.getElementById("question-container").style.display = "block";
  loadQuestion();
});

document.getElementById("next-btn").addEventListener("click", nextQuestion);
document.getElementById("restart-btn").addEventListener("click", restartQuiz);
document.getElementById("share-btn")?.addEventListener("click", shareResult);

// Helper Functions
function updateProgress() {
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;
  document.getElementById("progress-fill").style.width = progress + "%";
  document.getElementById("current-q").textContent = currentQuestion + 1;
  document.getElementById("total-q").textContent = totalQuestions;
}

function startTimer() {
  timeLeft = 30;
  const timerText = document.getElementById("timer-text");
  const timerFill = document.getElementById("timer-fill");
  document.getElementById("timer-container").style.display = "block";

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    timerText.textContent = timeLeft;
    timerFill.style.width = (timeLeft / 30) * 100 + "%";

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      nextQuestion();
    }
  }, 1000);
}

function loadQuestion() {
  const q = quizData[currentQuestion];
  document.getElementById("question").textContent = q.question;
  const optionsDiv = document.getElementById("options");
  optionsDiv.innerHTML = "";

  q.options.forEach((option, index) => {
    const btn = document.createElement("button");
    btn.textContent = option;
    btn.classList.add("option");
    btn.onclick = () => selectOption(index);
    optionsDiv.appendChild(btn);
  });

  document.getElementById("next-btn").style.display = "none";
  updateProgress();
  startTimer();
}

function selectOption(index) {
  if (selectedAnswer !== -1) return;
  selectedAnswer = index;
  clearInterval(timerInterval);

  const options = document.querySelectorAll(".option");
  options.forEach((opt, i) => {
    opt.disabled = true;
    if (i === quizData[currentQuestion].correct) opt.classList.add("correct");
    else if (i === index) opt.classList.add("incorrect");
  });

  // Add time bonus (remaining seconds)
  totalTimeBonus += timeLeft;

  document.getElementById("next-btn").style.display = "block";
}

function nextQuestion() {
  if (selectedAnswer === quizData[currentQuestion].correct) score++;
  currentQuestion++;
  selectedAnswer = -1;

  if (currentQuestion < totalQuestions) loadQuestion();
  else showScore();
}

// === NEW SHOWSCORE WITH ANIMATIONS ===
function showScore() {
  clearInterval(timerInterval);
  document.getElementById("question-container").style.display = "none";
  document.getElementById("score-container").style.display = "block";

  const percentage = Math.round((score / totalQuestions) * 100);
  const circle = document.querySelector(".progress-ring__circle");
  const circumference = 502;
  const offset = circumference - (percentage / 100) * circumference;
  circle.style.strokeDashoffset = offset;

  document.getElementById("score-circle-text").textContent = score;
  document.getElementById("total-score").textContent = totalQuestions;

  // Stats
  document.getElementById("correct-count").textContent = score;
  document.getElementById("wrong-count").textContent = totalQuestions - score;
  document.getElementById("time-bonus").textContent = `+${totalTimeBonus}s`;

  // Badge
  const badge = document.getElementById("badge");
  if (percentage >= 90) {
    badge.textContent = "Gold";
    badge.className = "badge gold";
  } else if (percentage >= 70) {
    badge.textContent = "Silver";
    badge.className = "badge silver";
  } else {
    badge.textContent = "Bronze";
    badge.className = "badge bronze";
  }

  // Feedback
  let feedback = "";
  if (percentage >= 90) feedback = "Masterful! You're a JavaScript legend!";
  else if (percentage >= 70) feedback = "Excellent work! Keep pushing!";
  else if (percentage >= 50) feedback = "Good effort! Practice makes perfect.";
  else feedback = "Never give up! Every expert was once a beginner.";
  document.getElementById("feedback").textContent = feedback;

  // High Score
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("jsQuizHighScore", highScore);
    document.getElementById("high-score").style.display = "block";
    document.getElementById("high-score-val").textContent = highScore;

    // Confetti only on new high score
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });
  }
}

function shareResult() {
  const text = `I scored ${score}/${totalQuestions} on the JavaScript Quiz! Can you beat me?`;
  navigator.clipboard.writeText(text).then(() => {
    alert("Result copied to clipboard!");
  });
}

function restartQuiz() {
  score = 0;
  currentQuestion = 0;
  selectedAnswer = -1;
  totalTimeBonus = 0;
  document.getElementById("score-container").style.display = "none";
  document.getElementById("question-container").style.display = "block";
  document.getElementById("high-score").style.display = "none";
  loadQuestion();
}
