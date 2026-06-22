const KEY = "dd4-theme";
const root = document.documentElement;
const btn = document.getElementById("theme-toggle");

function label(theme) {
  return theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
}

function apply(theme) {
  if (theme !== "light" && theme !== "dark") return;
  root.dataset.theme = theme;
  localStorage.setItem(KEY, theme);
  btn?.setAttribute("aria-label", label(theme));
}

btn?.addEventListener("click", () => {
  apply(root.dataset.theme === "dark" ? "light" : "dark");
});

if (root.dataset.theme) apply(root.dataset.theme);

console.assert(
  label("dark").includes("light") && label("light").includes("dark"),
  "theme labels",
);
