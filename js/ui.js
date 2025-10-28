// js/ui.js
// Aquest fitxer gestiona la UI inicial i carrega el sketch després del clic

const startBtn = document.getElementById("start-btn");
const startScreen = document.getElementById("start-screen");
const loadingScreen = document.getElementById("loading-screen");

startBtn.addEventListener("click", async () => {
  startScreen.classList.add("hidden");
  loadingScreen.classList.remove("hidden");

  // Simulem un petit retard de càrrega visual
  setTimeout(() => {
    loadingScreen.classList.add("hidden");
    import("./sketch.js"); // carrega el teu sketch p5.js
  }, 1500);
});
