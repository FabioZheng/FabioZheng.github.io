const enterBtn = document.getElementById("enter-btn");
const intro = document.getElementById("intro");
const birthdayPostcard = document.querySelector(".birthday-postcard");
const birthdayMain = document.getElementById("birthday-main");
const surpriseBtn = document.getElementById("surprise-btn");
const fireworksCanvas = document.getElementById("fireworks-canvas");
const revealMessageBtn = document.getElementById("reveal-message-btn");
const specialVideoWrapper = document.getElementById("special-video-wrapper");
const specialVideo = document.getElementById("special-video");

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
    fireworksCtx.fillStyle = "#f3ebdb";
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
  if (birthdayPostcard) {
    birthdayPostcard.classList.add("page-turning");
  }

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

setupRevealObserver();
resizeCanvas();
animateFireworks();
