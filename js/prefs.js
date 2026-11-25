// Runs in <head> so the saved theme applies before paint.
const theme = localStorage.getItem("theme");
if (theme === "black" || theme === "white") {
  document.documentElement.dataset.theme = theme;
}
