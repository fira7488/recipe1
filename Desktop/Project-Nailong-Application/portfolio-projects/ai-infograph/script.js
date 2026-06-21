const cards = document.querySelectorAll(
  ".timeline-card, .stat-card, .tool-card, .future-card",
);

cards.forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    card.style.background = `
            radial-gradient(
                circle at ${x}px ${y}px,
                rgba(56,189,248,0.15),
                rgba(30,41,59,0.9)
            )
        `;
  });

  card.addEventListener("mouseleave", () => {
    card.style.background = "rgba(30,41,59,0.8)";
  });
});
const scrollIndicator = document.querySelector(".scroll-indicator");

window.addEventListener("scroll", () => {
  const totalHeight =
    document.documentElement.scrollHeight -
    document.documentElement.clientHeight;

  const scrollProgress = (window.scrollY / totalHeight) * 100;

  scrollIndicator.style.width = `${scrollProgress}%`;
});
const hiddenElements = document.querySelectorAll(".hidden");

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
    }
  });
});

hiddenElements.forEach((el) => observer.observe(el));
const counters = document.querySelectorAll(".counter");

counters.forEach((counter) => {
  const updateCounter = () => {
    const target = +counter.getAttribute("data-target");

    const current = +counter.innerText;

    const increment = target / 100;

    if (current < target) {
      counter.innerText = `${Math.ceil(current + increment)}`;

      setTimeout(updateCounter, 20);
    } else {
      if (counter.classList.contains("money")) {
        counter.innerText = "$1.8T";
      } else if (counter.classList.contains("users")) {
        counter.innerText = "100M+";
      } else {
        counter.innerText = `${target}%`;
      }
    }
  };

  updateCounter();
});
const particles = document.querySelector(".particles");

for (let i = 0; i < 50; i++) {
  const particle = document.createElement("span");

  const size = Math.random() * 6 + 2;

  particle.style.width = `${size}px`;
  particle.style.height = `${size}px`;

  particle.style.left = `${Math.random() * 100}%`;

  particle.style.animationDuration = `${Math.random() * 10 + 5}s`;

  particle.style.animationDelay = `${Math.random() * 5}s`;

  particles.appendChild(particle);
}
const cursorGlow = document.querySelector(".cursor-glow");

document.addEventListener("mousemove", (e) => {
  cursorGlow.style.left = `${e.clientX}px`;

  cursorGlow.style.top = `${e.clientY}px`;
});
const exploreBtn = document.querySelector(".primary-btn");

exploreBtn.addEventListener("click", () => {
  document.querySelector("#timeline").scrollIntoView({
    behavior: "smooth",
  });
});
