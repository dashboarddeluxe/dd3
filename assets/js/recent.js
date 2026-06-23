const RECENT_KEY = "dd4-recent";
const RECENT_MAX = 10;

function recentBlock() {
  return document.getElementById("recent-links");
}

function recentRowEl() {
  return recentBlock()?.querySelector("[data-recent-row]");
}

function readRecent() {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const items = raw ? JSON.parse(raw) : [];
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

function writeRecent(items) {
  localStorage.setItem(RECENT_KEY, JSON.stringify(items.slice(0, RECENT_MAX)));
}

function recordRecent(title, href) {
  if (!title || !href?.startsWith("http")) return;
  const items = readRecent().filter((item) => item.href !== href);
  items.unshift({ title, href, at: Date.now() });
  writeRecent(items);
}

function renderRecent() {
  const section = recentBlock();
  const row = recentRowEl();
  if (!section || !row) return;

  const items = readRecent();
  row.replaceChildren();

  if (!items.length) {
    section.classList.add("hidden");
    delete section.dataset.hasLinks;
    return;
  }

  items.forEach((item, index) => {
    if (index > 0) {
      const sep = document.createElement("span");
      sep.className = "link-sep";
      sep.setAttribute("aria-hidden", "true");
      sep.textContent = "|";
      row.appendChild(sep);
    }
    const link = document.createElement("a");
    link.href = item.href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = item.title;
    row.appendChild(link);
  });

  section.dataset.hasLinks = "true";
  section.classList.remove("hidden");
}

document.addEventListener(
  "click",
  (e) => {
    const link = e.target.closest("main a[href^='http']");
    if (!link) return;
    recordRecent(link.textContent.trim(), link.href);
    renderRecent();
  },
  true,
);

renderRecent();
