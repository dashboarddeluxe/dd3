document.getElementById("menu-btn")?.addEventListener("click", () => {
  const menu = document.getElementById("mobile-nav");
  const open = menu?.classList.toggle("hidden") === false;
  document.getElementById("menu-btn")?.setAttribute("aria-expanded", String(open));
});

const navLinks = [...document.querySelectorAll(".js-scroll")];

navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    const id = link.getAttribute("href")?.slice(1);
    const target = id && document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
    document.getElementById("mobile-nav")?.classList.add("hidden");
  });
});

const navSections = navLinks
  .map((link) => {
    const id = link.getAttribute("href")?.slice(1);
    return id ? document.getElementById(id) : null;
  })
  .filter(Boolean);

if (navSections.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const id = visible.target.id;
      navLinks.forEach((link) => {
        const active = link.getAttribute("href") === `#${id}`;
        link.classList.toggle("is-active", active);
        if (active) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    },
    { rootMargin: "-20% 0px -70% 0px" },
  );
  navSections.forEach((section) => observer.observe(section));
}
