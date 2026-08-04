(function () {
  const header = document.querySelector("[data-header]");
  const menu = document.querySelector("[data-menu]");
  const menuButton = document.querySelector("[data-menu-button]");
  const reveals = document.querySelectorAll(".reveal");
  const counters = document.querySelectorAll("[data-count]");
  const slider = document.querySelector("[data-slider]");
  const slides = slider ? Array.from(slider.querySelectorAll("img")) : [];
  const prev = document.querySelector("[data-prev]");
  const next = document.querySelector("[data-next]");
  let slideIndex = 0;

  const updateHeader = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 18);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  if (menu && menuButton) {
    menuButton.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
    });

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        menu.classList.remove("is-open");
        menuButton.setAttribute("aria-expanded", "false");
      });
    });
  }

  const animateCounter = (counter) => {
    if (counter.dataset.done) return;
    counter.dataset.done = "true";

    const target = Number(counter.dataset.count);
    const isDecimal = !Number.isInteger(target);
    const duration = 1200;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      counter.textContent = isDecimal ? value.toFixed(1) + "%" : Math.round(value) + "+";
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        if (entry.target.querySelectorAll) {
          entry.target.querySelectorAll("[data-count]").forEach(animateCounter);
        }
        if (entry.target.matches("[data-count]")) animateCounter(entry.target);
      });
    },
    { threshold: 0.16 }
  );

  reveals.forEach((item) => observer.observe(item));
  counters.forEach((counter) => observer.observe(counter));

  const showSlide = (index) => {
    if (!slides.length) return;
    slideIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, currentIndex) => {
      slide.classList.toggle("is-active", currentIndex === slideIndex);
    });
  };

  showSlide(0);
  prev && prev.addEventListener("click", () => showSlide(slideIndex - 1));
  next && next.addEventListener("click", () => showSlide(slideIndex + 1));

  if (slides.length > 1) {
    setInterval(() => showSlide(slideIndex + 1), 4200);
  }


  const reviewTrack = document.querySelector("[data-review-track]");
  const reviewPrev = document.querySelector("[data-review-prev]");
  const reviewNext = document.querySelector("[data-review-next]");
  const reviewCards = reviewTrack ? Array.from(reviewTrack.children) : [];
  let reviewIndex = 0;

  const getVisibleReviews = () => {
    if (window.matchMedia("(max-width: 640px)").matches) return 1;
    if (window.matchMedia("(max-width: 900px)").matches) return 2;
    return 3;
  };

  const updateReviews = (index) => {
    if (!reviewTrack || !reviewCards.length) return;
    const visible = getVisibleReviews();
    const maxIndex = Math.max(reviewCards.length - visible, 0);
    reviewIndex = Math.min(Math.max(index, 0), maxIndex);
    const card = reviewCards[0];
    const gap = parseFloat(getComputedStyle(reviewTrack).gap) || 0;
    const move = reviewIndex * (card.getBoundingClientRect().width + gap);
    reviewTrack.style.transform = `translateX(${-move}px)`;
  };

  reviewPrev && reviewPrev.addEventListener("click", () => updateReviews(reviewIndex - 1));
  reviewNext && reviewNext.addEventListener("click", () => {
    const visible = getVisibleReviews();
    const maxIndex = Math.max(reviewCards.length - visible, 0);
    updateReviews(reviewIndex >= maxIndex ? 0 : reviewIndex + 1);
  });

  window.addEventListener("resize", () => updateReviews(reviewIndex));
  updateReviews(0);
  document.querySelectorAll(".service-card, .review-card, .stat-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${y * -3}deg) rotateY(${x * 4}deg) translateY(-6px)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
})();
