// Mint copy function
function copyMint() {
  const text = document.getElementById("mint").innerText;
  navigator.clipboard.writeText(text);
  alert("Copied: " + text);
}

// Add current year
document.getElementById("year").innerText = new Date().getFullYear();

// Countries & landmarks
const COUNTRIES = [
  { code: "BE", name: "Belgium", landmark: "Atomium" },
  { code: "FR", name: "France", landmark: "Eiffel Tower" },
  { code: "ES", name: "Spain", landmark: "Sagrada Família" },
  { code: "PT", name: "Portugal", landmark: "Belém Tower" },
  { code: "IT", name: "Italy", landmark: "Colosseum" },
  { code: "DE", name: "Germany", landmark: "Brandenburg Gate" },
  { code: "NL", name: "Netherlands", landmark: "Windmills" },
  { code: "GR", name: "Greece", landmark: "Parthenon" },
  { code: "CY", name: "Cyprus", landmark: "Aphrodite's Rock" },
  { code: "BE_END", name: "Back to Belgium", landmark: "Finish!" }
];

// Place markers along road
function placeMarkers() {
  const road = document.getElementById("roadPath");
  const markers = document.getElementById("markers");
  markers.innerHTML = "";

  const length = road.getTotalLength();
  COUNTRIES.forEach((c, i) => {
    const t = i / (COUNTRIES.length - 1);
    const pos = road.getPointAtLength(length * t);

    const div = document.createElement("div");
    div.className = "marker";
    div.style.left = `calc(50% + ${pos.x - 600}px)`;
    div.style.top = `${pos.y}px`;
    div.innerHTML = `
      <div class="label">${c.name}</div>
      <div class="sub">${c.landmark}</div>
    `;
    markers.appendChild(div);
  });
}

window.addEventListener("load", placeMarkers);
window.addEventListener("resize", placeMarkers);
