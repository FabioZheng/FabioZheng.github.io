const introLines = [
  "Initializing system...",
  "Accessing secure database...",
  "Decrypting user data...",
  "Target identified: Hannah",
  "Injecting celebration protocol...",
  "Happy Birthday Hannah 🎂",
];

const typingOutput = document.getElementById("typing-output");
const accessGranted = document.getElementById("access-granted");
const enterBtn = document.getElementById("enter-btn");
const intro = document.getElementById("intro");
const birthdayMain = document.getElementById("birthday-main");
const surpriseBtn = document.getElementById("surprise-btn");
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxClose = document.getElementById("lightbox-close");
const fireworksCanvas = document.getElementById("fireworks-canvas");
const revealMessageBtn = document.getElementById("reveal-message-btn");
const specialVideoWrapper = document.getElementById("special-video-wrapper");
const specialVideo = document.getElementById("special-video");

async function typeLine(line, container) {
  const lineEl = document.createElement("p");
  lineEl.className = "typing-line";
  container.appendChild(lineEl);

  for (const char of line) {
    lineEl.textContent += char;
    await new Promise((resolve) => setTimeout(resolve, 28));
  }
}

async function runIntroSequence() {
  const cursor = document.createElement("span");
  cursor.className = "cursor";
  typingOutput.appendChild(cursor);

  for (const line of introLines) {
    cursor.remove();
    await typeLine(`> ${line}`, typingOutput);
    typingOutput.appendChild(cursor);
    await new Promise((resolve) => setTimeout(resolve, 280));
  }

  accessGranted.classList.remove("hidden");
  enterBtn.classList.remove("hidden");
}

function setupRevealObserver() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.2 }
  );

  document.querySelectorAll(".fade-up").forEach((el) => observer.observe(el));
}

function setupGallery() {
  document.querySelectorAll(".gallery-item").forEach((item) => {
    item.addEventListener("click", () => {
      lightboxImage.src = item.dataset.full;
      lightbox.classList.remove("hidden");
    });
  });

  lightboxClose.addEventListener("click", () => lightbox.classList.add("hidden"));
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      lightbox.classList.add("hidden");
    }
  });
}

const fireworksCtx = fireworksCanvas.getContext("2d");
let fireworks = [];
let snowflakes = [];

function resizeCanvas() {
  fireworksCanvas.width = window.innerWidth;
  fireworksCanvas.height = window.innerHeight;
  snowflakes = createSnowflakes();
}

function createSnowflakes() {
  const density = Math.max(70, Math.floor((window.innerWidth * window.innerHeight) / 20000));
  return Array.from({ length: density }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    radius: Math.random() * 1.8 + 0.8,
    speedY: Math.random() * 0.8 + 0.35,
    drift: (Math.random() - 0.5) * 0.6,
  }));
}

function animateSnowfall() {
  snowflakes.forEach((flake) => {
    flake.x += flake.drift;
    flake.y += flake.speedY;

    if (flake.y > window.innerHeight + 8) {
      flake.y = -8;
      flake.x = Math.random() * window.innerWidth;
    }

    if (flake.x > window.innerWidth + 10) flake.x = -10;
    if (flake.x < -10) flake.x = window.innerWidth + 10;

    fireworksCtx.globalAlpha = 0.75;
    fireworksCtx.fillStyle = "#ffffff";
    fireworksCtx.beginPath();
    fireworksCtx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
    fireworksCtx.fill();
  });
}

function burst(x, y, count = 60) {
  const colors = ["#ffd166", "#ff4ec7", "#7e5bff", "#56f7ff", "#fff"];

  for (let i = 0; i < count; i += 1) {
    const angle = (Math.PI * 2 * i) / count;
    const speed = Math.random() * 3 + 1;
    fireworks.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 100,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }
}

function animateFireworks() {
  fireworksCtx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);
  animateSnowfall();

  fireworks = fireworks.filter((spark) => spark.life > 0);

  fireworks.forEach((spark) => {
    spark.x += spark.vx;
    spark.y += spark.vy;
    spark.vy += 0.02;
    spark.life -= 1;

    fireworksCtx.globalAlpha = spark.life / 100;
    fireworksCtx.fillStyle = spark.color;
    fireworksCtx.beginPath();
    fireworksCtx.arc(spark.x, spark.y, 2.1, 0, Math.PI * 2);
    fireworksCtx.fill();
  });

  fireworksCtx.globalAlpha = 1;
  requestAnimationFrame(animateFireworks);
}

function launchCelebration() {
  burst(window.innerWidth * 0.25, window.innerHeight * 0.45, 60);
  burst(window.innerWidth * 0.5, window.innerHeight * 0.3, 80);
  burst(window.innerWidth * 0.75, window.innerHeight * 0.45, 60);
}

enterBtn.addEventListener("click", () => {
  intro.style.transition = "opacity 0.9s ease, transform 0.9s ease";
  intro.style.opacity = "0";
  intro.style.transform = "scale(1.02)";

  setTimeout(() => {
    intro.classList.add("hidden");
    birthdayMain.classList.remove("hidden");
    birthdayMain.removeAttribute("aria-hidden");
    launchCelebration();
  }, 850);
});

surpriseBtn.addEventListener("click", launchCelebration);

if (revealMessageBtn && specialVideoWrapper && specialVideo) {
  revealMessageBtn.addEventListener("click", async () => {
    specialVideoWrapper.classList.remove("hidden");
    revealMessageBtn.classList.add("hidden");
    try {
      await specialVideo.play();
    } catch {
      // Ignore autoplay/playback errors if browser blocks it.
    }
  });
}

window.addEventListener("resize", resizeCanvas);

runIntroSequence();
setupRevealObserver();
setupGallery();
resizeCanvas();
animateFireworks();
