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
const penSizeSlider = document.getElementById('penSize');
const penSizeValue = document.getElementById('penSizeValue');

let drawing = false;
let currentPage = 1;
let penColor = '#000000';
let eraserMode = false;
let penSize = 5;

// Resize canvas and fix scaling issues
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - 60;

  canvas.style.width = `${canvas.width}px`;
  canvas.style.height = `${canvas.height}px`;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Eraser toggle
eraserButton.addEventListener('click', () => {
  eraserMode = !eraserMode;
  if (eraserMode) {
    eraserButton.style.backgroundColor = '#f44336';
    eraserButton.textContent = 'Pen';
  } else {
    eraserButton.style.backgroundColor = '';
    eraserButton.textContent = 'Eraser';
  }
});

// Pen color handling
penColorButton.addEventListener('click', () => {
  penColorPicker.click();
});
penColorPicker.addEventListener('input', (e) => {
  penColor = e.target.value;
});

// Pen size handling
penSizeSlider.addEventListener('input', (e) => {
  penSize = e.target.value;
  penSizeValue.textContent = penSize;
});

// Drawing or erasing
const drawOrErase = (x, y) => {
  if (eraserMode) {
    ctx.clearRect(x - penSize / 2, y - penSize / 2, penSize, penSize);
  } else {
    ctx.lineTo(x, y);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penSize;
    ctx.lineJoin = 'round';
    ctx.stroke();
  }
};

// Get position relative to canvas for mouse or touch
const getCanvasOffset = (e) => {
  const rect = canvas.getBoundingClientRect();
  let x, y;
  if (e.touches && e.touches.length > 0) {
    x = e.touches[0].clientX - rect.left;
    y = e.touches[0].clientY - rect.top;
  } else {
    x = e.clientX - rect.left;
    y = e.clientY - rect.top;
  }
  return { x, y };
};

// Drawing events - Mouse
canvas.addEventListener('mousedown', (e) => {
  drawing = true;
  const { x, y } = getCanvasOffset(e);
  ctx.beginPath();
  ctx.moveTo(x, y);
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

// Drawing events - Touch
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  drawing = true;
  const { x, y } = getCanvasOffset(e);
  ctx.beginPath();
  ctx.moveTo(x, y);
});

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  if (drawing) {
    const { x, y } = getCanvasOffset(e);
    drawOrErase(x, y);
  }
});

canvas.addEventListener('touchend', () => {
  drawing = false;
  ctx.closePath();
});

// Save canvas to image
saveButton.addEventListener('click', () => {
  const dataUrl = canvas.toDataURL();
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `note_page_${currentPage}.png`;
  link.click();
});

// Load image to canvas
loadButton.addEventListener('change', () => {
  const file = loadButton.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
    };
    reader.readAsDataURL(file);
  }
});

// Page navigation
pageNextButton.addEventListener('click', () => {
  currentPage++;
  pageIndicator.textContent = `Page ${currentPage}`;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

pagePrevButton.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    pageIndicator.textContent = `Page ${currentPage}`;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
});

// Theme toggle
themeToggleButton.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  if (currentTheme === 'dark') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
});
