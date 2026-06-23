(function () {
  var k = "dd4-theme";
  var t = localStorage.getItem(k);
  if (t !== "light" && t !== "dark") {
    t = matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }
  document.documentElement.dataset.theme = t;
})();
