document.addEventListener("DOMContentLoaded", () => {
    const textInput = document.getElementById("text-input");
    const textList = document.getElementById("text-list");
    const targetList = document.getElementById("target-list");
    const flashcardContainer = document.getElementById("flashcard-container");
    const gameOverElement = document.getElementById("game-over");
    const textHeader = document.getElementById("selectItem");
    const lessonItems = document.getElementById("chosenItems");
   

    let texts = [];
    let targets = [];
    const scores = {};
    let targetScore = 3; // Retained global variable for target score
  
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
  
    // Game logic and global functions remain here
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
      initializeFlashcards();
    }
  
    function initializeFlashcards() {
        flashcardContainer.innerHTML = ""; // Clear any existing cards
      
        // Create flashcards for all entered texts (texts array)
        const randomizedTexts = texts.sort(() => Math.random() - 0.5);
      
        randomizedTexts.forEach(text => {
          const card = document.createElement("div");
          card.classList.add("flashcard");
          card.innerText = text;
          flashcardContainer.appendChild(card);
      
          // Enable dragging for each card
          enableCardDragging(card);
        });
      
        setActiveCard(); // Set the first card as active
      }
      
      
      
      function renderNextCard() {
        if (checkGameCompletion()) return;
      
        const remainingTargets = targets.filter(target => scores[target].correct < targetScore);
        if (remainingTargets.length === 0) return;
      
        const nextCardText = remainingTargets[Math.floor(Math.random() * remainingTargets.length)];
      
        const card = document.createElement("div");
        card.classList.add("flashcard");
        card.innerText = nextCardText;
      
        // Append the card, hidden initially
        card.style.opacity = "0";
        flashcardContainer.appendChild(card);
      
        enableCardDragging(card);
      
        // If no active card exists, set this card as active
        if (document.querySelectorAll(".flashcard.active").length === 0) {
          setActiveCard();
        }
      }
      
      
      
      
      
      
      
  
      function setActiveCard() {
        const cards = document.querySelectorAll(".flashcard");
      
        // Remove active class and hide all cards
        cards.forEach(card => {
          card.classList.remove("active");
          card.style.opacity = "0";
        });
      
        // Activate and show the first card in the list
        if (cards.length > 0) {
          cards[0].classList.add("active");
          cards[0].style.opacity = "1"; // Make the active card visible
        }
      }
      
      
      
      function enableCardDragging(card = null) {
        const cards = card ? [card] : document.querySelectorAll(".flashcard");
      
        cards.forEach(cardElement => {
          Draggable.create(cardElement, {
            type: "x,y",
            throwProps: true,
            onDragEnd: function () {
              const velocityThreshold = 1.5; // Minimum velocity to register a flick
              const isRightFlick =
                this.getDirection("velocity") === "right" || this.velocityX > velocityThreshold;
              const isLeftFlick =
                this.getDirection("velocity") === "left" || this.velocityX < -velocityThreshold;
      
              const direction = isRightFlick ? "right" : isLeftFlick ? "left" : null;
              if (!direction) {
                gsap.to(this.target, { x: 0, y: 0, duration: 0.5, ease: "power1.out" });
                return;
              }
      
              const text = this.target.innerText;
      
              const endX = direction === "right" ? window.innerWidth + 300 : -window.innerWidth - 300;
              const endY = this.y + (Math.random() * 200 - 100);
      
              gsap.to(this.target, {
                x: endX,
                y: endY,
                scale: 0.1,
                opacity: 0,
                duration: .75,
                ease: "power1.out",
                onComplete: () => {
                  this.target.remove(); // Remove the card from DOM
                  setActiveCard(); // Activate the next card
                  renderNextCard(); // Dynamically render the next card
                },
              });
              

              // Update scores only for targeted texts
              if (targets.includes(text)) {
                if (direction === "right") {
                  scores[text].correct++;
                  console.log(`Correct: ${text} - ${scores[text].correct} (Target: ${targetScore})`);
                } else {
                  scores[text].wrong++;
                  console.log(`Wrong: ${text} - ${scores[text].wrong}`);
                }
              } else {
                console.log(`Skipped score update for non-target text: ${text}`);
              }
      
              // Check game completion
              checkGameCompletion();
            },
          });
        });
      }
      
  
      
      
      
      
  
      function checkGameCompletion() {
        if (targets.every(target => scores[target].correct >= targetScore)) {
          console.log("Game over! All targets met their target score.");
          endGame();
          return true;
        }
        console.log(
          "Running totals:",
          targets.map(target => `${target} - Correct: ${scores[target].correct}, Wrong: ${scores[target].wrong}`)
        );
        return false;
      }
      
  
    function endGame() {
        const flashcardContainer = document.getElementById("flashcard-container");
        const gameOverElement = document.getElementById("game-over");
      
        // Hide the flashcard container
        flashcardContainer.style.display = "none";
      
        // Ensure the game-over element is visible
        gameOverElement.style.display = "block";
      
        // Update the success message and score summary
        const successMessage = document.getElementById("success-message");
        const scoreSummary = document.getElementById("score-summary");
      
        successMessage.innerText = `You now understand how to pronounce: ${targets.join(", ")}`;
        scoreSummary.innerHTML = targets
          .map(
            target =>
              `<li>${target}: Correct - ${scores[target].correct}, Wrong - ${scores[target].wrong}</li>`
          )
          .join("");
      
        console.log("Game over! All targets met their target score.");
      }
      
  
    document.getElementById("restart-game").addEventListener("click", () => {
      location.reload();
    });
  });
  