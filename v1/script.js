gsap.registerPlugin(Draggable, Observer);

document.addEventListener("DOMContentLoaded", function() {
  const slides = document.querySelectorAll('.slide');
  let currentIndex = 0;

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });
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
      if (this.getDirection() === "left" && this.endX < -100) {
        gsap.to(this.target, { x: '-100%', duration: 0.5, onComplete: nextSlide });
      } else if (this.getDirection() === "right" && this.endX > 100) {
        gsap.to(this.target, { x: '100%', duration: 0.5, onComplete: prevSlide });
      } else {
        gsap.to(this.target, { x: 0, duration: 0.5 });
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
