const inputs = [...document.querySelectorAll(".search-input")];
const sections = [...document.querySelectorAll("[data-section]")];
const status = document.getElementById("search-status");
const recentSection = document.getElementById("recent-links");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let focusIndex = -1;

function escapeHtml(s) {
  return s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function rowItems(row) {
  return [...row.querySelectorAll("a, .link-label")];
}

function itemText(el) {
  return el.dataset.searchText ?? el.textContent;
}

function textWords(text) {
  return text.toLowerCase().split(/[\s|/]+/).filter(Boolean);
}

function isSubsequence(needle, haystack) {
  if (needle.length < 2) return false;
  let i = 0;
  for (const ch of haystack) {
    if (ch === needle[i]) i += 1;
    if (i === needle.length) return true;
  }
  return false;
}

function levenshtein(a, b) {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
    }
    prev = cur;
  }
  return prev[n];
}

function maxTypos(len) {
  if (len < 3) return 0;
  if (len <= 4) return 1;
  return 2;
}

// ponytail: O(tokens × words × len²) per keystroke; fine for ~500 links; upgrade: debounce or pre-index if slow
function tokenInText(token, text) {
  const lower = text.toLowerCase();
  if (lower.includes(token)) return token;
  if (token.length >= 2 && isSubsequence(token, lower)) return token;
  for (const word of textWords(text)) {
    if (word.includes(token)) return token;
    if (token.length >= 2 && isSubsequence(token, word)) return token;
    if (token.length >= 3 && levenshtein(token, word) <= maxTypos(token.length)) {
      return word;
    }
  }
  return null;
}

function matchNeedle(text, q) {
  const query = q.trim().toLowerCase();
  if (!query) return null;

  const tokens = query.split(/\s+/).filter(Boolean);
  if (tokens.length > 1) {
    return tokens.every((token) => tokenInText(token, text)) ? query : null;
  }

  return tokenInText(query, text);
}

function highlightSubsequence(text, query) {
  const lower = text.toLowerCase();
  let html = "";
  let qi = 0;
  let run = "";

  function flushRun() {
    if (!run) return;
    html += `<mark class="search-hit">${escapeHtml(run)}</mark>`;
    run = "";
  }

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (qi < query.length && lower[i] === query[qi]) {
      run += ch;
      qi += 1;
    } else {
      flushRun();
      html += escapeHtml(ch);
    }
  }
  flushRun();
  return html;
}

function setInnerHighlight(el, html) {
  el.innerHTML = `<span class="search-text">${html}</span>`;
}

function textMatches(el, q) {
  return el && q && matchNeedle(itemText(el), q) !== null;
}

function visibleLinks() {
  const links = [
    ...document.querySelectorAll("[data-section]:not(.hidden) [data-link-row]:not(.hidden) a"),
  ];
  if (recentSection && !recentSection.classList.contains("hidden")) {
    return [...recentSection.querySelectorAll("a"), ...links];
  }
  return links;
}

function clearSearchFocus() {
  document.querySelectorAll("a.search-kbd-focus").forEach((a) => {
    a.classList.remove("search-kbd-focus");
  });
  focusIndex = -1;
}

function setSearchFocus(index) {
  clearSearchFocus();
  const links = visibleLinks();
  if (index < 0 || index >= links.length) {
    focusIndex = -1;
    inputs[0]?.focus();
    return;
  }
  focusIndex = index;
  const link = links[index];
  link.classList.add("search-kbd-focus");
  link.scrollIntoView({ block: "nearest", behavior: reducedMotion ? "auto" : "smooth" });
  link.focus({ preventScroll: true });
}

function setHighlight(el, q) {
  if (!el.dataset.searchText) el.dataset.searchText = el.textContent;
  const text = el.dataset.searchText;
  if (!q) {
    el.textContent = text;
    return;
  }
  const lower = text.toLowerCase();
  const query = q.trim().toLowerCase();
  const needle = matchNeedle(text, q);
  if (!needle) {
    el.textContent = text;
    return;
  }
  if (lower.includes(needle)) {
    let html = "";
    let pos = 0;
    while (pos < text.length) {
      const idx = lower.indexOf(needle, pos);
      if (idx === -1) {
        html += escapeHtml(text.slice(pos));
        break;
      }
      html += escapeHtml(text.slice(pos, idx));
      html += `<mark class="search-hit">${escapeHtml(text.slice(idx, idx + needle.length))}</mark>`;
      pos = idx + needle.length;
    }
    setInnerHighlight(el, html);
    return;
  }
  if (isSubsequence(query, lower)) {
    setInnerHighlight(el, highlightSubsequence(text, query));
    return;
  }
  el.textContent = text;
}

function showRow(row, q) {
  row.classList.remove("hidden");
  rowItems(row).forEach((el) => {
    el.classList.remove("hidden");
    setHighlight(el, q);
  });
  row.querySelectorAll(".link-sep").forEach((sep) => sep.classList.remove("hidden"));
}

function hideRow(row) {
  row.classList.add("hidden");
  rowItems(row).forEach((el) => setHighlight(el, ""));
}

function groupBlocks(section) {
  const body = section.querySelector(".section-body");
  if (!body) return [];

  const groups = [];
  let current = { title: null, rows: [] };

  for (const child of body.children) {
    if (child.matches(".group-title")) {
      if (current.title || current.rows.length) groups.push(current);
      current = { title: child, rows: [] };
    } else if (child.matches("[data-link-row]")) {
      current.rows.push(child);
    }
  }
  if (current.title || current.rows.length) groups.push(current);
  return groups;
}

function updateSearchStatus(query) {
  if (!status) return;
  const q = query.trim();
  if (!q) {
    status.textContent = "";
    status.hidden = true;
    return;
  }

  const count = visibleLinks().length;
  if (count === 0) {
    status.textContent = `No links match “${q}”. Press Esc to clear.`;
  } else {
    const noun = count === 1 ? "link" : "links";
    status.textContent = `${count} ${noun} match “${q}”. Use ↓ to browse, Enter to open.`;
  }
  status.hidden = false;
}

function filterSection(section, q) {
  const sectionTitle = section.querySelector(".section-title");
  const sectionMatch = textMatches(sectionTitle, q);
  const groups = groupBlocks(section);
  let sectionHits = 0;

  if (!q) {
    if (sectionTitle) setHighlight(sectionTitle, "");
    groups.forEach(({ title, rows }) => {
      if (title) {
        title.classList.remove("hidden");
        setHighlight(title, "");
      }
      rows.forEach((row) => showRow(row, ""));
    });
    section.classList.remove("hidden");
    return;
  }

  if (sectionTitle) setHighlight(sectionTitle, sectionMatch ? q : "");

  if (sectionMatch) {
    groups.forEach(({ title, rows }) => {
      if (title) {
        title.classList.remove("hidden");
        setHighlight(title, q);
      }
      rows.forEach((row) => showRow(row, q));
    });
    section.classList.remove("hidden");
    return;
  }

  groups.forEach(({ title, rows }) => {
    const titleMatch = textMatches(title, q);

    if (titleMatch) {
      if (title) {
        title.classList.remove("hidden");
        setHighlight(title, q);
      }
      rows.forEach((row) => showRow(row, q));
      sectionHits += 1;
      return;
    }

    let groupVisible = false;
    rows.forEach((row) => {
      const matches = rowItems(row).some((el) => textMatches(el, q));
      if (matches) {
        showRow(row, q);
        groupVisible = true;
      } else {
        hideRow(row);
      }
    });

    if (title) {
      title.classList.toggle("hidden", !groupVisible);
      setHighlight(title, groupVisible ? q : "");
    }
    if (groupVisible) sectionHits += 1;
  });

  section.classList.toggle("hidden", sectionHits === 0);
}

function updateRecentVisibility(query) {
  if (!recentSection?.dataset.hasLinks) return;
  recentSection.classList.toggle("hidden", !!query.trim());
}

function filterLinks(query) {
  const q = query.trim().toLowerCase();
  sections.forEach((section) => filterSection(section, q));
  clearSearchFocus();
  updateRecentVisibility(query);
  updateSearchStatus(query);
}

function clearSearch() {
  inputs.forEach((el) => {
    el.value = "";
  });
  filterLinks("");
  document.activeElement?.blur();
}

inputs.forEach((input) => {
  input.addEventListener("input", (e) => {
    const value = e.target.value;
    inputs.forEach((el) => {
      if (el !== e.target) el.value = value;
    });
    filterLinks(value);
  });
});

document.addEventListener("keydown", (e) => {
  if (e.key === "/" && !inputs.includes(document.activeElement)) {
    e.preventDefault();
    inputs[0]?.focus();
    return;
  }

  const q = inputs[0]?.value.trim() ?? "";
  const links = visibleLinks();
  const inSearch = inputs.includes(document.activeElement);
  const linkIndex = links.indexOf(document.activeElement);

  if (e.key === "Escape" && (inSearch || linkIndex !== -1 || q)) {
    e.preventDefault();
    clearSearch();
    return;
  }

  if (!q) return;

  if (inSearch && e.key === "ArrowDown" && links.length) {
    e.preventDefault();
    setSearchFocus(0);
    return;
  }

  if (inSearch && e.key === "Enter" && links.length) {
    e.preventDefault();
    links[0].click();
    return;
  }

  if (linkIndex !== -1 && e.key === "ArrowDown") {
    e.preventDefault();
    setSearchFocus(linkIndex + 1);
    return;
  }

  if (linkIndex !== -1 && e.key === "ArrowUp") {
    e.preventDefault();
    if (linkIndex === 0) {
      clearSearchFocus();
      inputs[0]?.focus();
    } else {
      setSearchFocus(linkIndex - 1);
    }
  }
});

// ponytail: self-check at ?debugSearch=1
if (new URLSearchParams(location.search).has("debugSearch")) {
  const titledGroup = [...document.querySelectorAll(".group-title")].find(
    (title) => title.nextElementSibling?.matches("[data-link-row]"),
  );

  if (titledGroup) {
    const label = itemText(titledGroup);
    filterLinks(label);
    let sibling = titledGroup.nextElementSibling;
    while (sibling && !sibling.matches(".group-title")) {
      if (sibling.matches("[data-link-row]")) {
        console.assert(!sibling.classList.contains("hidden"), "heading match shows row below");
      }
      sibling = sibling.nextElementSibling;
    }
    filterLinks("");
  }

  const sampleRow = document.querySelector("[data-link-row]");
  const sampleItems = sampleRow ? rowItems(sampleRow) : [];
  const needle = sampleItems[0]
    ? itemText(sampleItems[0]).slice(0, 3).toLowerCase()
    : "zzz";

  filterLinks(needle);
  if (sampleRow) {
    console.assert(!sampleRow.classList.contains("hidden"), "matching row visible");
    console.assert(
      sampleItems.every((el) => !el.classList.contains("hidden")),
      "whole row shown",
    );
  }
  console.assert(status && !status.hidden && status.textContent.includes("match"), "match count visible");
  filterLinks("zzznomatch");
  console.assert(!sections.some((s) => !s.classList.contains("hidden")), "filter hides all sections");
  console.assert(status && !status.hidden, "empty state visible");
  filterLinks("");
  console.assert(status?.hidden, "empty state hidden when cleared");

  const gmail = [...document.querySelectorAll("[data-link-row] a")].find((a) =>
    itemText(a).toLowerCase().includes("gmail"),
  );
  if (gmail) {
    filterLinks("gmial");
    console.assert(!gmail.closest("[data-link-row]")?.classList.contains("hidden"), "typo-tolerant match");
    filterLinks("ytb");
    console.assert(
      [...document.querySelectorAll("[data-link-row] a")].some(
        (a) =>
          itemText(a).toLowerCase().includes("youtube") &&
          !a.closest("[data-link-row]")?.classList.contains("hidden"),
      ),
      "subsequence match",
    );
    filterLinks("");
  }
}
