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
  const input = textInput.value.split(",").map(item => item.trim()).filter(item => item !== "");
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
  flashcardContainer.innerHTML = ""; // Clear any existing cards
  renderNextCard(); // Start with the first card
}

function renderNextCard() {
  // Check if the game is complete before rendering the next card
  if (checkGameCompletion()) return;

  // Find remaining targets that haven't met the target score
  const remainingTargets = targets.filter(target => scores[target].correct < targetScore);
  if (remainingTargets.length === 0) return; // No remaining targets, stop rendering

  // Pick a random target from the remaining ones
  const nextCardText = remainingTargets[Math.floor(Math.random() * remainingTargets.length)];

  // Create the new card
  const card = document.createElement("div");
  card.classList.add("flashcard");
  card.innerText = nextCardText;
  flashcardContainer.appendChild(card);

  // Enable dragging for the new card
  enableCardDragging(card);
}

function setActiveCard() {
  const cards = document.querySelectorAll(".flashcard");
  cards.forEach(card => card.classList.remove("active"));
  if (cards.length > 0) cards[0].classList.add("active");
}

function enableCardDragging(card) {
  Draggable.create(card, {
    type: "x,y",
    throwProps: true, // Enable inertia
    onDragEnd: function () {
      const velocityThreshold = 1.5; // Minimum velocity to register a flick
      const isRightFlick =
        this.getDirection("velocity") === "right" || this.velocityX > velocityThreshold;
      const isLeftFlick =
        this.getDirection("velocity") === "left" || this.velocityX < -velocityThreshold;

      // Determine the direction based on the flick
      const direction = isRightFlick ? "right" : isLeftFlick ? "left" : null;

      if (!direction) {
        // If no strong flick, reset card position
        gsap.to(this.target, { x: 0, y: 0, duration: 0.5, ease: "power1.out" });
        return;
      }

      const text = this.target.innerText;

      // Calculate off-screen end positions
      const endX = direction === "right" ? window.innerWidth + 300 : -window.innerWidth -300; // Ensures identical behavior
      const endY = this.y + (Math.random() * 200 - 100); // Add slight random tilt for realism
      console.log(endX);
      // Animate the card off-screen with inertia
      gsap.to(this.target, {
        x: endX,
        y: endY,
        scale: 0.1,
        opacity: 0,
        duration: 1, // Shorter for a flick-like motion
        ease: "power1.out",
        onComplete: () => this.target.remove(),
      });

      // Update scores based on the direction
      if (direction === "right") scores[text].correct++;
      else if (direction === "left") scores[text].wrong++;

      // Log updated scores
      console.log(`Updated scores for "${text}":`, scores[text]);

      // Render the next card
      renderNextCard();
    },
    onDrag: function () {
      // Optional visual feedback for dragging direction
      const threshold = 50; // Change background slightly for subtle feedback
      if (this.x > threshold) {
        card.style.backgroundColor = "#d4f4dd"; // Green for "correct"
      } else if (this.x < -threshold) {
        card.style.backgroundColor = "#f8d7da"; // Red for "wrong"
      } else {
        card.style.backgroundColor = ""; // Reset to default
      }
    },
    onRelease: function () {
      // Reset card background after release
      card.style.backgroundColor = "";
    },
  });
}





function checkGameCompletion() {
  const isComplete = targets.every(target => scores[target].correct >= targetScore);

  if (isComplete) {
    endGame();
    return true;
  }

  return false;
}

function endGame() {
  document.getElementById("flashcard-container").style.display = "none";
  const gameOverElement = document.getElementById("game-over");

  // Show the game-over summary
  gameOverElement.style.display = "block"; // Ensure it's visible
  successMessage.innerText = `You now understand how to pronounce: ${targets.join(", ")}`;
  scoreSummary.innerHTML = targets
    .map(target => `<li>${target}: Correct - ${scores[target].correct}, Wrong - ${scores[target].wrong}</li>`)
    .join("");
}

document.getElementById("restart-game").addEventListener("click", () => {
  location.reload();
});
