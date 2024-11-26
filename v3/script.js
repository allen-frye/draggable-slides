document.addEventListener("DOMContentLoaded", () => {
    const textInput = document.getElementById("text-input");
    const textList = document.getElementById("text-list");
    const targetList = document.getElementById("target-list");
    const flashcardContainer = document.getElementById("flashcard-container");
    const gameOverElement = document.getElementById("game-over");
   
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
            `<li class="list-group-item">${item} <button class="btn btn-sm btn-secondary" onclick="addTarget(${index})">Add to Targets</button></li>`
        )
        .join("");
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
        renderNextCard(); // Start with the first card
      }
      
      function renderNextCard() {
        // Check if the game is complete before rendering the next card
        if (checkGameCompletion()) return;
      
        // Find remaining targets that haven't met the target score
        const remainingTargets = targets.filter(target => scores[target].correct < targetScore);
        if (remainingTargets.length === 0) return; // Stop rendering if all targets are complete
      
        // Pick a random target from the remaining ones
        const nextCardText = remainingTargets[Math.floor(Math.random() * remainingTargets.length)];
      
        // Create the new card
        const card = document.createElement("div");
        card.classList.add("flashcard");
        card.innerText = nextCardText;
      
        // Append the card to the container
        flashcardContainer.appendChild(card);
      
        // Enable dragging for the new card
        enableCardDragging(card);
      
        // If this is the only card, make it active
        if (flashcardContainer.childElementCount === 1) {
          setActiveCard();
        }
      }
      
      
      
      
  
      function setActiveCard() {
        const cards = document.querySelectorAll(".flashcard");
      
        // Remove active class from all cards and hide them
        cards.forEach(card => {
          card.classList.remove("active");
          card.style.opacity = "0";
        });
      
        // Activate the first card in the container
        if (cards.length > 0) {
          cards[0].classList.add("active");
          cards[0].style.opacity = "1";
        }
      }
      
      
      
  
      function enableCardDragging(card) {
        Draggable.create(card, {
          type: "x,y",
          throwProps: true,
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
            const endX = direction === "right" ? window.innerWidth + 300 : -300;
            const endY = this.y + (Math.random() * 200 - 100);
      
            // Animate the card off-screen with inertia
            gsap.to(this.target, {
              x: endX,
              y: endY,
              scale: 0.1,
              opacity: 0,
              duration: 1,
              ease: "power1.out",
              onComplete: () => {
                this.target.remove(); // Remove the card from DOM
                setActiveCard(); // Activate the next card
                renderNextCard(); // Dynamically render the next card
              },
            });
      
            // Update scores based on the direction
            if (direction === "right") {
              scores[text].correct++;
              console.log(`Correct: ${text} - ${scores[text].correct} (Target: ${targetScore})`);
            } else {
              scores[text].wrong++;
              console.log(`Wrong: ${text} - ${scores[text].wrong}`);
            }
      
            // Check game completion
            checkGameCompletion();
          },
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
  