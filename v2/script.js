gsap.registerPlugin(Draggable, Observer);

document.addEventListener("DOMContentLoaded", function() {
  const slides = document.querySelectorAll('.slide');
  const leftCountElem = document.getElementById('leftCount');
  const rightCountElem = document.getElementById('rightCount');
  let currentIndex = 0;
  let leftCount = 0;
  let rightCount = 0;

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
      if (i === index) {
        gsap.set(slide, { clearProps: 'all' });
      }
    });
  }

  function updateCounts(direction) {
    if (direction === 'left') {
      leftCount++;
      leftCountElem.textContent = leftCount;
    } else if (direction === 'right') {
      rightCount++;
      rightCountElem.textContent = rightCount;
    }
  }

  function nextSlide() {
    currentIndex = (currentIndex + 1) % slides.length;
    showSlide(currentIndex);
  }

  function prevSlide() {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    showSlide(currentIndex);
  }

  Draggable.create(slides, {
    type: "x",
    edgeResistance: 0.65,
    bounds: window,
    onDragEnd: function() {
      const direction = this.getDirection();
      const target = this.target;
      if (direction === "left" && this.endX < -100) {
        updateCounts('left');
        gsap.to(target, {
          x: '-100%',
          width: '10%',
          height: '10%',
          opacity: 0,
          duration: 0.5,
          onComplete: nextSlide
        });
      } else if (direction === "right" && this.endX > 100) {
        updateCounts('right');
        gsap.to(target, {
          x: '100%',
          width: '10%',
          height: '10%',
          opacity: 0,
          duration: 0.5,
          onComplete: prevSlide
        });
      } else {
        gsap.to(target, { x: 0, duration: 0.5 });
      }
    }
  });

  Observer.create({
    target: window,
    type: "wheel,touch",
    onDown: nextSlide,
    onUp: prevSlide,
    tolerance: 10
  });

  showSlide(currentIndex);
});
