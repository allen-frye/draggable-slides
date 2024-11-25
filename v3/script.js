gsap.registerPlugin(Draggable, Observer);
let texts = [];
let targets = [];
let targetScore = 3;
const scores = {};

// Admin Section
const textInput = document.getElementById("text-input");
const textList = document.getElementById("text-list");
const targetList = document.getElementById("target-list");
const flashcardContainer = document.getElementById("flashcard-container");
const targetScoreInput = document.getElementById("target-score");
const successMessage = document.getElementById("success-message");
const scoreSummary = document.getElementById("score-summary");

document.getElementById("add-texts").addEventListener("click", () => {
  const input = textInput.value.split(",").map(item => item.trim());
  texts.push(...input);
  updateTextList();
  textInput.value = "";
});

function updateTextList() {
  textList.innerHTML = texts
    .map((item, index) => `<li>${item} <button onclick="addTarget(${index})">Add to Targets</button></li>`)
    .join("");
}

function addTarget(index) {
  const target = texts[index];
  if (!targets.includes(target)) {
    targets.push(target);
    scores[target] = { correct: 0, wrong: 0 };
  }
  updateTargetList();
}

function updateTargetList() {
  targetList.innerHTML = targets.map(target => `<li>${target}</li>`).join("");
}

document.getElementById("start-game").addEventListener("click", () => {
  targetScore = parseInt(targetScoreInput.value, 10);
  if (targets.length === 0) {
    alert("Please select at least one target!");
    return;
  }
  startGame();
});

// Game Section
function startGame() {
  document.getElementById("admin-section").style.display = "none";
  document.getElementById("game-section").style.display = "block";
  initializeFlashcards();
}

function initializeFlashcards() {
  flashcardContainer.innerHTML = "";
  const randomizedTargets = targets
    .flatMap(target => Array(targetScore).fill(target))
    .sort(() => Math.random() - 0.5);

  randomizedTargets.forEach(text => {
    const card = document.createElement("div");
    card.classList.add("flashcard");
    card.innerText = text;
    flashcardContainer.appendChild(card);
  });

  setActiveCard();
  enableCardDragging();
}

function setActiveCard() {
  const cards = document.querySelectorAll(".flashcard");
  cards.forEach(card => card.classList.remove("active"));
  if (cards.length > 0) cards[0].classList.add("active");
}

function enableCardDragging() {
  const cards = document.querySelectorAll(".flashcard");

  cards.forEach(card => {
    Draggable.create(card, {
      type: "x,y",
      throwProps: true, // Enable inertia
      onDragEnd: function () {
        const direction = this.x > window.innerWidth / 2 ? "right" : "left";
        const text = this.target.innerText;

        // Calculate off-screen end positions
        const endX = direction === "right" ? window.innerWidth + 300 : -300;
        const endY = this.y + (Math.random() * 200 - 100); // Add a slight random tilt for realism

        // Animate the card off-screen with inertia
        gsap.to(this.target, {
          x: endX,
          y: endY,
          scale: 0.1,
          opacity: 0,
          duration: 1.5, // Adjust duration for smoother exit
          ease: "power1.out",
          onComplete: () => this.target.remove()
        });

        // Update scores
        if (direction === "right") scores[text].correct++;
        else scores[text].wrong++;

        // Log updated scores
        console.log(`Updated scores for "${text}":`, scores[text]);

        // Check game completion and update active card
        checkGameCompletion();
        setActiveCard();
      }
    });
  });
}

function checkGameCompletion() {
  if (targets.every(target => scores[target].correct >= targetScore)) {
    endGame();
  }
}

function endGame() {
  document.getElementById("flashcard-container").style.display = "none";
  document.getElementById("game-over").style.display = "block";
  successMessage.innerText = `You now understand how to pronounce: ${targets.join(", ")}`;
  scoreSummary.innerHTML = targets
    .map(target => `<li>${target}: Correct - ${scores[target].correct}, Wrong - ${scores[target].wrong}</li>`)
    .join("");
}

document.getElementById("restart-game").addEventListener("click", () => {
  location.reload();
});