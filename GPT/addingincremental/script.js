gsap.registerPlugin(Draggable, Observer);

document.addEventListener("DOMContentLoaded", () => {
  const textInput = document.getElementById("text-input");
  const textList = document.getElementById("text-list");
  const targetList = document.getElementById("target-list");
  const flashcardContainer = document.getElementById("flashcard-container");
  const gameOverElement = document.getElementById("game-over");
  const textHeader = document.getElementById("selectItem");
  const lessonItems = document.getElementById("chosenItems");
  const learningStyleSelect = document.getElementById("learning-style");

  let texts = [];
  let targets = [];
  const scores = {};
  let targetScore = 3;
  let learningStyle = "random"; // Default learning style
  let currentIncrement = 0;
  let incrementItems = [];
  let currentCycle = []; // Tracks the current increment cycle
  let cycleIndex = 0; // Tracks the index within the current cycle
  let lessonTargetCorrect = true; // Tracks whether all lesson targets are correct

  document.getElementById("add-texts").addEventListener("click", () => {
    const input = textInput.value.split(",").map(item => item.trim());
    texts.push(...input);
    updateTextList();
    textInput.value = "";
  });

  function updateTextList() {
    textList.innerHTML = texts
      .map(
        (item, index) =>
          `<li class="list-group-item"><span>${item}</span> <button class="btn btn-sm btn-secondary" onclick="addTarget(${index})">Add to Lesson</button></li>`
      )
      .join("");
    textHeader.style.display = "block";
  }

  window.addTarget = function (index) {
    const target = texts[index];
    if (!targets.includes(target)) {
      targets.push(target);
      scores[target] = { correct: 0, wrong: 0 };
    }
    updateTargetList();
  };

  function updateTargetList() {
    targetList.innerHTML = targets
      .map(target => `<li class="list-group-item">${target}</li>`)
      .join("");
    lessonItems.style.display = "block";
  }

  learningStyleSelect.addEventListener("change", (e) => {
    learningStyle = e.target.value;
    console.log(`Learning Style changed to: ${learningStyle}`);
  });

  document.getElementById("start-game").addEventListener("click", () => {
    targetScore = parseInt(document.getElementById("target-score").value, 10);
    if (targets.length === 0) {
      alert("Please select at least one target!");
      return;
    }
    startGame();
  });

  function startGame() {
    document.getElementById("admin-section").style.display = "none";
    document.getElementById("game-section").style.display = "block";

    if (learningStyle === "random") {
      initializeFlashcards();
    } else if (learningStyle === "incremental") {
      initializeIncrementalGame();
      renderNextIncrementalCard();
    }
  }

  function initializeFlashcards() {
    flashcardContainer.innerHTML = "";
    const randomizedTexts = texts.sort(() => Math.random() - 0.5);

    randomizedTexts.forEach(text => {
      const card = document.createElement("div");
      card.classList.add("flashcard");
      card.innerText = text;
      flashcardContainer.appendChild(card);
      enableCardDragging(card);
    });

    setActiveCard();
  }

  function initializeIncrementalGame() {
    currentIncrement = 0;
    incrementItems = texts.filter(text => !targets.includes(text));
    shuffleArray(incrementItems);
    console.log(`Incremental game initialized. Increment Items: ${incrementItems}`);
    updateCycle(); // Build the first cycle
  }

  function updateCycle() {
    currentCycle = [...targets]; // Always start with lesson targets
    const incrementPool = incrementItems.slice(0, currentIncrement + 1);
    currentCycle.push(...incrementPool); // Add all increment items
    shuffleArray(currentCycle.slice(targets.length)); // Shuffle only the non-target portion
    cycleIndex = 0; // Reset index
    lessonTargetCorrect = true; // Reset the correctness tracker for this increment
    console.log(`New Cycle Created: ${currentCycle}`);
  }

  function renderNextIncrementalCard() {
    // Check if lesson targets have met the required correct answers
    const lessonTargetsCompleted = targets.every(target => scores[target].correct >= targetScore);

    if (lessonTargetsCompleted && currentIncrement >= incrementItems.length) {
        // Only end game if lesson targets are complete and the final increment is done
        endGame();
        return;
    }

    if (cycleIndex >= currentCycle.length) {
        // If we've cycled through all cards, check correctness of lesson targets
        if (!lessonTargetCorrect) {
            console.log("Repeating the current increment due to incorrect lesson target.");
            updateCycle(); // Repeat the current increment
        } else {
            currentIncrement++;
            console.log(`Increment increased to: ${currentIncrement}`);
            updateCycle(); // Move to the next increment
        }
    }

    // Display the next card in the current cycle
    const nextCardText = currentCycle[cycleIndex];
    console.log(`Displaying Card: ${nextCardText}`);
    cycleIndex++;

    const card = document.createElement("div");
    card.classList.add("flashcard");
    card.innerText = nextCardText;
    card.style.opacity = "0";
    flashcardContainer.appendChild(card);

    enableCardDragging(card);
    setActiveCard();
}


  function setActiveCard() {
    const cards = document.querySelectorAll(".flashcard");
    cards.forEach(card => {
      card.classList.remove("active");
      card.style.opacity = "0";
    });

    if (cards.length > 0) {
      const firstCard = cards[0];
      firstCard.classList.add("active");
      firstCard.style.opacity = "1";
    }
  }

  function enableCardDragging(card) {
    Draggable.create(card, {
      type: "x,y",
      throwProps: true,
      onDragEnd: function () {
        const direction = this.x > window.innerWidth / 2 ? "right" : "left";
        const text = this.target.innerText;
        const endX = direction === "right" ? window.innerWidth + 300 : -300;

        gsap.to(this.target, {
          x: endX,
          y: this.y + (Math.random() * 200 - 100),
          scale: 0.1,
          opacity: 0,
          duration: 0.75,
          ease: "power1.out",
          onComplete: () => {
            this.target.remove();
            renderNextIncrementalCard();
          },
          clearProps: "opacity,transform"
        });

        if (targets.includes(text)) {
          if (direction === "right") {
            scores[text].correct++;
            console.log(`Correct: ${text} - ${scores[text].correct}`);
          } else {
            console.log(`Incorrect: ${text}`);
            lessonTargetCorrect = false; // Mark as incorrect for the increment
          }
        }
      }
    });
  }

  function checkGameCompletion() {
    const allTargetsMet = targets.every(target => scores[target].correct >= targetScore);

    if (allTargetsMet) {
      endGame();
      return true;
    }
    return false;
  }

  function endGame() {
    flashcardContainer.style.display = "none";
    gameOverElement.style.display = "block";
    document.getElementById("success-message").innerText = `Great job!`;
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  document.getElementById("restart-game").addEventListener("click", () => {
    location.reload();
  });
});