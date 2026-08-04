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
  const sliderPagination = document.querySelector("[data-slider-pagination]");
  let slideIndex = 0;
  let projectTimer;

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

  const updateProjectDots = () => {
    if (!sliderPagination) return;
    sliderPagination.querySelectorAll("button").forEach((dot, currentIndex) => {
      const isActive = currentIndex === slideIndex;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-current", isActive ? "true" : "false");
    });
  };

  const showSlide = (index) => {
    if (!slides.length) return;
    slideIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, currentIndex) => {
      slide.classList.toggle("is-active", currentIndex === slideIndex);
    });
    updateProjectDots();
  };

  const startProjectAutoplay = () => {
    if (projectTimer) clearInterval(projectTimer);
    if (slides.length <= 1) return;
    projectTimer = setInterval(() => showSlide(slideIndex + 1), 3500);
  };

  if (sliderPagination && slides.length > 1) {
    sliderPagination.innerHTML = "";
    slides.forEach((_, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "slider-dot";
      dot.setAttribute("aria-label", `Go to project ${index + 1}`);
      dot.addEventListener("click", () => {
        showSlide(index);
        startProjectAutoplay();
      });
      sliderPagination.appendChild(dot);
    });
  }

  showSlide(0);
  prev && prev.addEventListener("click", () => {
    showSlide(slideIndex - 1);
    startProjectAutoplay();
  });
  next && next.addEventListener("click", () => {
    showSlide(slideIndex + 1);
    startProjectAutoplay();
  });
  startProjectAutoplay();

  const reviewTrack = document.querySelector("[data-review-track]");
  const reviewPrev = document.querySelector("[data-review-prev]");
  const reviewNext = document.querySelector("[data-review-next]");
  const reviewPagination = document.querySelector("[data-review-pagination]");
  const reviewCards = reviewTrack ? Array.from(reviewTrack.children) : [];
  let reviewIndex = 0;
  let reviewTimer;

  const getVisibleReviews = () => {
    if (window.matchMedia("(max-width: 640px)").matches) return 1;
    if (window.matchMedia("(max-width: 900px)").matches) return 2;
    return 3;
  };

  const getMaxReviewIndex = () => Math.max(reviewCards.length - getVisibleReviews(), 0);

  const updateReviewDots = () => {
    if (!reviewPagination) return;
    reviewPagination.querySelectorAll("button").forEach((dot, currentIndex) => {
      const isActive = currentIndex === reviewIndex;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-current", isActive ? "true" : "false");
    });
  };

  const buildReviewDots = () => {
    if (!reviewPagination) return;
    const pages = getMaxReviewIndex() + 1;
    reviewPagination.innerHTML = "";
    if (pages <= 1) return;

    Array.from({ length: pages }).forEach((_, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "slider-dot";
      dot.setAttribute("aria-label", `Go to review group ${index + 1}`);
      dot.addEventListener("click", () => {
        updateReviews(index);
        startReviewAutoplay();
      });
      reviewPagination.appendChild(dot);
    });
    updateReviewDots();
  };

  const updateReviews = (index) => {
    if (!reviewTrack || !reviewCards.length) return;
    const maxIndex = getMaxReviewIndex();
    reviewIndex = (index + maxIndex + 1) % (maxIndex + 1);
    const card = reviewCards[0];
    const gap = parseFloat(getComputedStyle(reviewTrack).gap) || 0;
    const move = reviewIndex * (card.getBoundingClientRect().width + gap);
    reviewTrack.style.transform = `translateX(${-move}px)`;
    updateReviewDots();
  };

  const startReviewAutoplay = () => {
    if (reviewTimer) clearInterval(reviewTimer);
    if (reviewCards.length <= getVisibleReviews()) return;
    reviewTimer = setInterval(() => updateReviews(reviewIndex + 1), 4500);
  };

  reviewPrev && reviewPrev.addEventListener("click", () => {
    updateReviews(reviewIndex - 1);
    startReviewAutoplay();
  });
  reviewNext && reviewNext.addEventListener("click", () => {
    updateReviews(reviewIndex + 1);
    startReviewAutoplay();
  });

  window.addEventListener("resize", () => {
    buildReviewDots();
    updateReviews(Math.min(reviewIndex, getMaxReviewIndex()));
    startReviewAutoplay();
  });
  buildReviewDots();
  updateReviews(0);
  startReviewAutoplay();

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