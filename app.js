// Global sections and variables
const colorDivs = document.querySelectorAll(".color");
const generateBtn = document.querySelector(".generate");
const sliders = document.querySelectorAll("input[type='range");
const currentHexes = document.querySelectorAll(".color h2");
const popup = document.querySelector(".copy-container");
const adjustButton = document.querySelectorAll(".adjust");
const lockButton = document.querySelectorAll(".lock");
const closeAdjustments = document.querySelectorAll(".close-adjustment");
const sliderContainers = document.querySelectorAll(".sliders");
let initialColors;

//Local Storage
let savedPalettes = [];

// Event listeners
generateBtn.addEventListener("click", randomColors);
sliders.forEach((slider) => {
  slider.addEventListener("input", hslControls);
});

colorDivs.forEach((div, index) => {
  div.addEventListener("change", () => {
    updateTestUI(index);
  });
});
currentHexes.forEach((hex) => {
  hex.addEventListener("click", () => {
    copyToClipboard(hex);
  });
});
popup.addEventListener("transitionend", () => {
  const popupBox = popup.children[0];
  popup.classList.remove("active");
  popupBox.classList.remove("active");
});
adjustButton.forEach((button, index) => {
  button.addEventListener("click", () => {
    openAdjustmentPanel(index);
  });
});
closeAdjustments.forEach((button, index) => {
  button.addEventListener("click", () => {
    closeAdjustmentPanel(index);
  });
});
lockButton.forEach((button, index) => {
  button.addEventListener("click", (e) => {
    lockLayer(e, index);
  });
});
//Functions
function generateHex() {
  const hexColor = chroma.random();
  return hexColor;
  /* Another Way
  const letters = "#0123456789ABCDEF";
  let hash = "#";
  for (let i = 0; i < 6; i++) {
    hash += letters[Math.floor(Math.random() * 16)];
  }
  return hash;
*/
} // Function generateHex() Ends

//let randomHex = generateHex(); TEST
//console.log(randomHex); TEST

function randomColors() {
  initialColors = [];
  colorDivs.forEach((div, index) => {
    const hexText = div.children[0];
    const randomColor = generateHex();

    //Add it to the array
    if (div.classList.contains("locked")) {
      initialColors.push(hexText.innerText);
      return;
    } else {
      initialColors.push(chroma(randomColor).hex());
    }
    //console.log(chroma(randomColor).hex()); TEST

    //initialColors.push(chroma(randomColor).hex()); TEST
    //console.log(randomColor.hex()); TEST
    //Add the color to the background
    div.style.background = randomColor;
    hexText.innerText = randomColor;

    // checkTextContrast(color, text) function Call
    checkTextContrast(randomColor, hexText);

    //Initial colorize color
    const color = chroma(randomColor);
    const sliders = div.querySelectorAll(".sliders input");
    //console.log(sliders); TEST
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    colorizeSliders(color, hue, brightness, saturation);
  }); // Ends loop

  //Resets Inputs
  resetInputs();

  //Check for Button Contrast
  adjustButton.forEach((button, index) => {
    //console.log(button); TEST
    //console.log(lockButton[index]); TEST
    checkTextContrast(initialColors[index], button);
    checkTextContrast(initialColors[index], lockButton[index]);
  });
} // Ends randomColors()

function checkTextContrast(color, text) {
  const luminance = chroma(color).luminance();
  if (luminance > 0.5) {
    text.style.color = "black";
  } else {
    text.style.color = "white";
  }
} // Function checkTextContrast(color, text) end

function colorizeSliders(color, hue, brightness, saturation) {
  //Scale Saturation
  const noSat = color.set("hsl.s", 0);
  const fullSat = color.set("hsl.s", 1);
  const scaleSat = chroma.scale([noSat, color, fullSat]);
  //Scale Brightness
  const midBright = color.set("hsl.l", 0.5);
  const scaleBright = chroma.scale(["black", midBright, "white"]);

  //Update Input Colors
  saturation.style.backgroundImage = `linear-gradient(to right,${scaleSat(
    0
  )}, ${scaleSat(1)})`;
  brightness.style.backgroundImage = `linear-gradient(to right,${scaleBright(
    0
  )},${scaleBright(0.5)} ,${scaleBright(1)})`;
  hue.style.backgroundImage = `linear-gradient(to right, rgb(204,75,75),rgb(204,204,75),rgb(75,204,75),rgb(75,204,204),rgb(75,75,204),rgb(204,75,204),rgb(204,75,75))`;
} // Function colorSliders() End

function hslControls(e) {
  const index =
    e.target.getAttribute("data-bright") ||
    e.target.getAttribute("data-sat") ||
    e.target.getAttribute("data-hue");
  //console.log(index); TEST

  let sliders = e.target.parentElement.querySelectorAll("input[type='range");
  //console.log(sliders); TEST
  const hue = sliders[0];
  const brightness = sliders[1];
  const saturation = sliders[2];

  // const bgColor = colorDivs[index].querySelector("h2").innerText; OLD WAY, bug when relying on the text
  //console.log(bgColor); TEST
  const bgColor = initialColors[index];
  //console.log(`initialArr: ${bgColor}`); TEST

  let color = chroma(bgColor)
    .set("hsl.s", saturation.value)
    .set("hsl.l", brightness.value)
    .set("hsl.h", hue.value);

  colorDivs[index].style.background = color;

  // Colorize sliders
  colorizeSliders(color, hue, brightness, saturation);
} // Function hslControls() End

function updateTestUI(index) {
  const activeDiv = colorDivs[index];
  const color = chroma(activeDiv.style.backgroundColor);
  //console.log(color); TEST
  const textHex = activeDiv.querySelector("h2");
  const icons = activeDiv.querySelectorAll(".controls button");
  textHex.innerText = color.hex();

  // Check contrast
  checkTextContrast(color, textHex);
  for (icon of icons) {
    checkTextContrast(color, icon);
  }
} // Ends updateTestUI()

function resetInputs() {
  const sliders = document.querySelectorAll(".sliders input");
  sliders.forEach((slider) => {
    if (slider.name === "hue") {
      const hueColor = initialColors[slider.getAttribute("data-hue")];
      const hueValue = chroma(hueColor).hsl()[0];
      //console.log(Math.floor(hueValue)); TEST
      slider.value = Math.floor(hueValue);
    }
    if (slider.name === "brightness") {
      const brightColor = initialColors[slider.getAttribute("data-bright")];
      const brightValue = chroma(brightColor).hsl()[2];
      //console.log(Math.floor(brightValue * 100) / 100); TEST
      slider.value = Math.floor(brightValue * 100) / 100;
    }
    if (slider.name === "saturation") {
      const satColor = initialColors[slider.getAttribute("data-sat")];
      const satValue = chroma(satColor).hsl()[2];
      //console.log(Math.floor(satValue * 100) / 100); TEST
      slider.value = Math.floor(satValue * 100) / 100;
    }
  });
} //Ends resetInputs() function

function copyToClipboard(hex) {
  const el = document.createElement("textarea");
  el.value = hex.innerText;
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);

  // Pop up animation
  const popupBox = popup.children[0];
  popup.classList.add("active");
  popupBox.classList.add("active");
} // Ends copyToClipboard()

function openAdjustmentPanel(index) {
  sliderContainers[index].classList.toggle("active");
} // Ends openAdjustmentPanel()

function closeAdjustmentPanel(index) {
  sliderContainers[index].classList.remove("active");
} // Ends closeAdjustmentPanel()

function lockLayer(e, index) {
  const lockSVG = e.target.children[0];
  const activeBg = colorDivs[index];
  activeBg.classList.toggle("locked");

  if (lockSVG.classList.contains("fa-lock-open")) {
    e.target.innerHTML = '<i class="fas fa-lock"></i>';
  } else {
    e.target.innerHTML = '<i class="fas fa-lock-open"></i>';
  }
} // Ends lockLayer(e,index)

//Implement Save to palatte and Local Storage
const saveBtn = document.querySelector(".save");
const submitSave = document.querySelector(".submit-save");
const closeSave = document.querySelector(".close-save");
const saveContainer = document.querySelector(".save-container");
const saveInput = document.querySelector(".save-container input");
const libraryContainer = document.querySelector(".library-container");
const libraryBtn = document.querySelector(".library");
const closeLibraryBtn = document.querySelector(".close-library");

// Event Listeners
saveBtn.addEventListener("click", openPalette);
closeSave.addEventListener("click", closePalette);
submitSave.addEventListener("click", savePalette);
libraryBtn.addEventListener("click", openLibrary);
closeLibraryBtn.addEventListener("click", closeLibrary);

function openPalette(e) {
  const popup = saveContainer.children[0];
  saveContainer.classList.add("active");
  popup.classList.add("active");
} // Ends openPalette(e)

function closePalette(e) {
  const popup = saveContainer.children[0];
  saveContainer.classList.remove("active");
  popup.classList.remove("active");
} // Ends closePalette(e)

function savePalette(e) {
  saveContainer.classList.remove("active");
  popup.classList.remove("active");
  const name = saveInput.value;
  const colors = [];
  currentHexes.forEach((hex) => {
    colors.push(hex.innerText);
  });
  // Generate Object
  let paletteNr = savedPalettes.length;
  const paletteObj = { name, colors, nr: paletteNr };
  savedPalettes.push(paletteObj);
  //console.log(savedPalettes); TEST

  //Save to Local Storage
  savetoLocal(paletteObj);
  saveInput.value = "";

  //Generate the Palette for the library
  const palette = document.createElement("div");
  palette.classList.add("custom-palette");
  const title = document.createElement("h4");
  title.innerText = paletteObj.name;
  const preview = document.createElement("div");
  preview.classList.add("small-preview");
  paletteObj.colors.forEach((smallColor) => {
    const smallDiv = document.createElement("div");
    smallDiv.style.backgroundColor = smallColor;
    preview.appendChild(smallDiv);
  });
  const paletteBtn = document.createElement("button");
  paletteBtn.classList.add("pick-palette-btn");
  paletteBtn.classList.add(paletteObj.nr);
  paletteBtn.innerText = "Select";

  //Append to library
  palette.appendChild(title);
  palette.appendChild(preview);
  palette.appendChild(paletteBtn);
  libraryContainer.children[0].appendChild(palette);
} // Ends savePalette(e)

function savetoLocal(paletteObj) {
  let localPalettes;
  if (localStorage.getItem("palettes") === null) {
    localPalettes = [];
  } else {
    localPalettes = JSON.parse(localStorage.getItem("palettes"));
  }
  localPalettes.push(paletteObj);
  localStorage.setItem("palettes", JSON.stringify(localPalettes));
} // Ends savetoLocal(paletteObj)

function openLibrary() {
  const popup = libraryContainer.children[0];
  libraryContainer.classList.add("active");
  popup.classList.add("active");
} // Ends openLibrary()

function closeLibrary() {
  const popup = libraryContainer.children[0];
  libraryContainer.classList.remove("active");
  popup.classList.remove("active");
} // Ends closeLibrary()

//Function Call
randomColors();
