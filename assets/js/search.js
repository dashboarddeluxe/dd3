const inputs = [...document.querySelectorAll(".search-input")];
const sections = [...document.querySelectorAll("[data-section]")];
const status = document.getElementById("search-status");

function escapeHtml(s) {
  return s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function rowItems(row) {
  return [...row.querySelectorAll("a, .link-label")];
}

function itemText(el) {
  return el.dataset.searchText ?? el.textContent;
}

function textMatches(el, q) {
  return el && q && itemText(el).toLowerCase().includes(q);
}

function setHighlight(el, q) {
  if (!el.dataset.searchText) el.dataset.searchText = el.textContent;
  const text = el.dataset.searchText;
  if (!q) {
    el.textContent = text;
    return;
  }
  const lower = text.toLowerCase();
  if (!lower.includes(q)) {
    el.textContent = text;
    return;
  }
  let html = "";
  let pos = 0;
  while (pos < text.length) {
    const idx = lower.indexOf(q, pos);
    if (idx === -1) {
      html += escapeHtml(text.slice(pos));
      break;
    }
    html += escapeHtml(text.slice(pos, idx));
    html += `<mark class="search-hit">${escapeHtml(text.slice(idx, idx + q.length))}</mark>`;
    pos = idx + q.length;
  }
  el.innerHTML = html;
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

function updateEmptyState(query) {
  if (!status) return;
  const q = query.trim();
  const anyVisible = sections.some((s) => !s.classList.contains("hidden"));
  if (q && !anyVisible) {
    status.textContent = `No links match “${q}”. Press Esc to clear.`;
    status.hidden = false;
    status.classList.remove("hidden");
  } else {
    status.textContent = "";
    status.hidden = true;
    status.classList.add("hidden");
  }
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

function filterLinks(query) {
  const q = query.trim().toLowerCase();
  sections.forEach((section) => filterSection(section, q));
  updateEmptyState(query);
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
  }
  if (e.key === "Escape" && inputs.includes(document.activeElement)) {
    inputs.forEach((el) => {
      el.value = "";
    });
    filterLinks("");
    document.activeElement?.blur();
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
  filterLinks("zzznomatch");
  console.assert(!sections.some((s) => !s.classList.contains("hidden")), "filter hides all sections");
  console.assert(status && !status.hidden, "empty state visible");
  filterLinks("");
  console.assert(status?.hidden, "empty state hidden when cleared");
}
