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
    console.log(`Incremental game initialized. Items: ${incrementItems}`);
  }

  function renderNextIncrementalCard() {
    // Check if the game is complete
    if (checkGameCompletion()) return;

    const remainingTargets = targets.filter(target => scores[target].correct < targetScore);
    console.log(`Remaining Targets: ${remainingTargets}`);
    console.log(`Current Increment: ${currentIncrement}`);
    console.log(`Increment Items: ${incrementItems}`);

    let nextCardText;

    // Alternate between lesson item and increment item
    if (remainingTargets.length > 0 && currentIncrement % 2 === 0) {
      // Show a lesson item
      nextCardText = remainingTargets[Math.floor(Math.random() * remainingTargets.length)];
      console.log(`Showing lesson item: ${nextCardText}`);
    } else {
      // Show a random increment item
      const incrementPool = incrementItems.slice(0, Math.min(currentIncrement + 1, incrementItems.length));
      nextCardText = incrementPool[Math.floor(Math.random() * incrementPool.length)];
      console.log(`Showing random increment item: ${nextCardText}`);
    }

    if (!nextCardText) {
      console.log("No valid next card. Ending game.");
      endGame();
      return;
    }

    // Create and render the card
    const card = document.createElement("div");
    card.classList.add("flashcard");
    card.innerText = nextCardText;
    card.style.opacity = "0"; // Start hidden
    flashcardContainer.appendChild(card);

    enableCardDragging(card); // Enable dragging for the new card
    setActiveCard(); // Set the card as active

    // Increment logic
    if (remainingTargets.length === 0 || nextCardText !== remainingTargets[0]) {
      currentIncrement++;
      console.log(`Increment increased to: ${currentIncrement}`);
    }
  }

  function setActiveCard() {
    const cards = document.querySelectorAll(".flashcard");
    cards.forEach(card => {
      card.classList.remove("active");
      card.style.opacity = "0"; // Explicitly hide inactive cards
    });

    if (cards.length > 0) {
      const firstCard = cards[0];
      firstCard.classList.add("active");
      firstCard.style.opacity = "1"; // Explicitly show the active card
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
            if (learningStyle === "random") {
              setActiveCard();
            } else if (learningStyle === "incremental") {
              renderNextIncrementalCard();
            }
          },
          clearProps: "opacity,transform"
        });

        // Update scores for lesson items only
        if (targets.includes(text)) {
          if (direction === "right") {
            scores[text].correct++;
            console.log(`Correct: ${text} - ${scores[text].correct}`);
          }
        }
      }
    });
  }

  function checkGameCompletion() {
    const allTargetsMet = targets.every(target => scores[target].correct >= targetScore);
    const allIncrementsComplete = currentIncrement >= incrementItems.length;

    if (allTargetsMet && allIncrementsComplete) {
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
