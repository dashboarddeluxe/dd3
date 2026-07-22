const progress = document.getElementById("scroll-progress");
const backBtn = document.getElementById("back-to-top");
const SHOW_AT = 320;

function scrollProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return max > 0 ? Math.min(1, window.scrollY / max) : 0;
}

function updateScrollUI() {
  const p = scrollProgress();
  document.documentElement.style.setProperty("--scroll-progress", String(p));
  progress?.setAttribute("aria-valuenow", String(Math.round(p * 100)));
  backBtn?.classList.toggle("is-visible", window.scrollY >= SHOW_AT);
}

window.addEventListener("scroll", updateScrollUI, { passive: true });
window.addEventListener("resize", updateScrollUI);

backBtn?.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth",
  });
});

updateScrollUI();

console.assert(
  scrollProgress() >= 0 && scrollProgress() <= 1,
  "scroll progress is 0–1",
);
