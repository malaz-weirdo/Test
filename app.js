const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const penColorPicker = document.getElementById('penColorPicker');
const saveButton = document.getElementById('saveButton');
const loadButton = document.getElementById('loadButton');
const textInput = document.getElementById('textInput');
const themeToggleButton = document.getElementById('themeToggle');
const pageNextButton = document.getElementById('nextPage');
const pagePrevButton = document.getElementById('prevPage');
const pageIndicator = document.getElementById('pageIndicator');
const penColorButton = document.getElementById('penColorButton');
const eraserButton = document.getElementById('eraserButton');

let drawing = false;
let currentPage = 1;
let penColor = '#000000'; // Default pen color
let eraserMode = false; // Eraser mode flag
let savedNotes = [];

// Resize canvas to fit the screen
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - 60; // Toolbar height offset
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Eraser Button Event Listener
eraserButton.addEventListener('click', () => {
  eraserMode = !eraserMode;
  if (eraserMode) {
    eraserButton.style.backgroundColor = '#f44336'; // Change button color when eraser is active
    eraserButton.textContent = 'Pen'; // Change text to 'Pen' to toggle back
  } else {
    eraserButton.style.backgroundColor = ''; // Reset color when pen is active
    eraserButton.textContent = 'Eraser'; // Change text to 'Eraser' to toggle to eraser
  }
});

// Pen Color Picker
penColorButton.addEventListener('click', () => {
  penColorPicker.click();
});

penColorPicker.addEventListener('input', (e) => {
  penColor = e.target.value;
});

// Drawing and Eraser Logic
let startX, startY;

// Combine drawing/eraser logic for both mouse and touch events
const drawOrErase = (x, y) => {
  if (eraserMode) {
    ctx.clearRect(x - 10, y - 10, 20, 20); // Erase a 20x20 area
  } else {
    ctx.lineTo(x, y);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = 5;
    ctx.lineJoin = 'round';
    ctx.stroke();
  }
};

// Function to get canvas offset correctly (for both mouse and touch events)
const getCanvasOffset = (e) => {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
};

// Drawing on canvas (mouse and touch events)
canvas.addEventListener('mousedown', (e) => {
  drawing = true;
  const { x, y } = getCanvasOffset(e);
  startX = x;
  startY = y;
  ctx.beginPath();
  ctx.moveTo(startX, startY);
});

canvas.addEventListener('mousemove', (e) => {
  if (drawing) {
    const { x, y } = getCanvasOffset(e);
    drawOrErase(x, y);
  }
});

canvas.addEventListener('mouseup', () => {
  drawing = false;
  ctx.closePath();
});

canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  drawing = true;
  const { x, y } = getCanvasOffset(e.touches[0]);
  startX = x;
  startY = y;
  ctx.beginPath();
  ctx.moveTo(startX, startY);
});

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  if (drawing) {
    const { x, y } = getCanvasOffset(e.touches[0]);
    drawOrErase(x, y);
  }
});

canvas.addEventListener('touchend', () => {
  drawing = false;
  ctx.closePath();
});

// Save Canvas as Image
saveButton.addEventListener('click', () => {
  const dataUrl = canvas.toDataURL(); // Convert canvas to image
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `note_page_${currentPage}.png`;
  link.click();
});

// Load Canvas from Image
loadButton.addEventListener('change', () => {
  const file = loadButton.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(event) {
      const img = new Image();
      img.src = event.target.result;
      img.onload = function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear current canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height); // Draw loaded image
      };
    };
    reader.readAsDataURL(file); // Convert the file to a data URL
  }
});

// Page Navigation
pageNextButton.addEventListener('click', () => {
  currentPage++;
  pageIndicator.textContent = `Page ${currentPage}`;
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas on page change
});

pagePrevButton.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    pageIndicator.textContent = `Page ${currentPage}`;
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas on page change
  }
});

// Toggle Theme
themeToggleButton.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  if (currentTheme === 'dark') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
});
