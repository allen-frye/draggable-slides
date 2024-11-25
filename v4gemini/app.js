// GreenSock initialization
gsap.registerPlugin(Draggable, Observer);

// Admin Panel
const textInput = document.getElementById('text-input');
const addItemsButton = document.getElementById('add-items-button');
const targetItemsList = document.getElementById('target-items-list');
const targetScoreInput = document.getElementById('target-score');
const startGameButton = document.getElementById('start-game-button');

let textItems = [];
let targetItems = [];
let targetScore = 3;

addItemsButton.addEventListener('click', () => {
  const inputText = textInput.value.trim();
  if (inputText) {
    const newItems = inputText.split(',').map(item => item.trim());
    textItems = [...textItems, ...newItems];
    textInput.value = '';

    // Clear the target items list
    targetItemsList.innerHTML = '';

    // Add new items to the target items list
    textItems.forEach(item => {
      const li = document.createElement('li');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = item;
      const label = document.createElement('label');
      label.htmlFor = item;
      label.textContent = item;
      li.appendChild(checkbox);
      li.appendChild(label);
      targetItemsList.appendChild(li);
    });
  }
});

startGameButton.addEventListener('click', () => {
  targetScore = parseInt(targetScoreInput.value);
  targetItems = textItems.filter(item => document.getElementById(item).checked);

  // Hide the admin panel and show the game container
  document.getElementById('admin-panel').style.display = 'none';
  document.getElementById('game-container').style.display = 'block';

  // Initialize the game state
  let cards = [];
  targetItems.forEach(item => {
    cards.push({
      text: item,
      correct: 0,
      incorrect: 0,
      isTarget: true
    });
  });

  // Shuffle the cards
  function shuffleCards() {
    cards.sort(() => 0.5 - Math.random());
  }
  shuffleCards();

  // Card Display
  const cardElement = document.querySelector('.card');
  let currentCard;
  function displayCard() {
    currentCard = cards[0];
    cardElement.textContent = currentCard.text;
  }

  displayCard();

  // Card Dragging and Animation
  Draggable.create(cardElement, {
    type: 'x, y',
    edgeResistance: 1,
    onDragEnd: () => {
      const direction = cardElement.x < window.innerWidth / 2 ? 'left' : 'right';
      const isCorrect = direction === 'right' && currentCard.isTarget;

      if (isCorrect) {
        currentCard.correct++;
      } else {
        currentCard.incorrect++;
      }

      // Remove the card from the deck
      cards.shift();

      // Check if the game is over
      if (cards.length === 0 || cards.every(card => card.correct >= targetScore)) {
        // Show the result panel
        const resultPanel = document.getElementById('result-panel');
        resultPanel.innerHTML = `
          <h2>Game Over!</h2>
          <p>Great job! You now understand how to pronounce:</p>
          <ul>
            ${targetItems.map(item => `<li>${item}</li>`).join('')}
          </ul>
          <h3>Results:</h3>
          <ul>
            ${cards.map(card => `<li>${card.text}: Correct ${card.correct}, Incorrect ${card.incorrect}</li>`).join('')}
          </ul>
        `;
        resultPanel.style.display = 'block';
      } else {
        // Display the next card
        displayCard();
      }

      // Animate the card off-screen
      gsap.to(cardElement, {
        duration: 1,
        scale: 0.1,
        opacity: 0,
        x: direction === 'left' ? -100 : window.innerWidth + 100
      });
    }
  });
});