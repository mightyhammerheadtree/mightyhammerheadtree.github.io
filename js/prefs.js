// Applies the theme before first paint. Inline color-scheme outranks any
// color-scheme the M3 bundle injects later.
(function () {
  const key = "theme";
  const system = () => matchMedia("(prefers-color-scheme: dark)").matches ? "black" : "white";
  const apply = (value) => {
    document.documentElement.dataset.theme = value;
    document.documentElement.style.colorScheme = value === "black" ? "dark" : "light";
  };

  const saved = localStorage.getItem(key);
  apply(saved === "black" || saved === "white" ? saved : system());

  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (!localStorage.getItem(key)) apply(system());
  });

  window.m3Theme = {
    get: () => document.documentElement.dataset.theme,
    set: (value) => {
      localStorage.setItem(key, value);
      apply(value);
    },
  };
})();
