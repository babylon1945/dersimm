function animateCounts(root) {
  root.querySelectorAll("[data-count-target]").forEach((el) => {
    if (el.dataset.countStarted) return;
    const target = Number(el.dataset.countTarget);
    if (!Number.isFinite(target)) return;
    const suffix = el.dataset.countSuffix || "";
    el.dataset.countStarted = "true";
    const duration = 1200;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const value = Math.floor(progress * target);
      el.textContent = value.toLocaleString("tr-TR") + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }

    el.textContent = "0" + suffix;
    requestAnimationFrame(tick);
  });
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        animateCounts(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

function initReveals() {
  const reveals = document.querySelectorAll(".reveal");
  reveals.forEach((el, index) => {
    if (!el.dataset.observed) {
      const delay = (index % 6) * 0.08;
      el.style.transitionDelay = `${delay}s`;
      observer.observe(el);
      el.dataset.observed = "true";
    }
  });
}

window.initReveals = initReveals;
initReveals();

const menuButton = document.querySelector(".menu");
const mobilePanel = document.querySelector("#mobilePanel");
const header = document.querySelector(".site-header");
let lastScrollY = window.scrollY;
let scrollTicking = false;

if (menuButton && mobilePanel) {
  menuButton.addEventListener("click", () => {
    const isOpen = document.body.classList.toggle("menu-open");
    mobilePanel.setAttribute("aria-hidden", String(!isOpen));
  });

  mobilePanel.addEventListener("click", (event) => {
    if (event.target.matches("a")) {
      document.body.classList.remove("menu-open");
      mobilePanel.setAttribute("aria-hidden", "true");
    }
  });
}

function handleScroll() {
  if (!header) return;
  if (document.body.classList.contains("menu-open")) {
    header.classList.remove("nav-hidden");
    return;
  }

  const currentY = window.scrollY;
  const threshold = 8;

  if (currentY > lastScrollY + threshold && currentY > 120) {
    header.classList.add("nav-hidden");
  } else if (currentY < lastScrollY - threshold) {
    header.classList.remove("nav-hidden");
  }

  lastScrollY = currentY;
}

window.addEventListener("scroll", () => {
  if (!scrollTicking) {
    scrollTicking = true;
    window.requestAnimationFrame(() => {
      handleScroll();
      scrollTicking = false;
    });
  }
});

const photoGrid = document.querySelector(".photo-grid");
const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightboxImage");

if (photoGrid && lightbox && lightboxImage) {
  const closeLightbox = () => {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");
    lightboxImage.src = "";
    lightboxImage.alt = "";
  };

  photoGrid.addEventListener("click", (event) => {
    const image = event.target.closest("img");
    if (!image) return;
    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt || "Görsel";
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
  });

  lightbox.addEventListener("click", (event) => {
    if (event.target.matches("[data-lightbox-close]")) {
      closeLightbox();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && lightbox.classList.contains("is-open")) {
      closeLightbox();
    }
  });
}
