const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let drawing = false;
let penColor = document.getElementById('colorPicker').value;
let mode = 'pen';
let undoStack = [];
let redoStack = [];
let pages = [];
let currentPage = 0;

const textInput = document.getElementById('textInput');
const pageIndicator = document.getElementById('pageIndicator');
const currentPageNumber = document.getElementById('currentPageNumber');
const totalPages = document.getElementById('totalPages');

// Touch gesture vars
let touchStartX = 0;
let touchEndX = 0;

// Theme toggle
const themeBtn = document.getElementById('themeToggle');
themeBtn.onclick = () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
  localStorage.setItem('note-theme', isDark ? 'light' : 'dark');
};
const savedTheme = localStorage.getItem('note-theme');
if (savedTheme) {
  document.documentElement.setAttribute('data-theme', savedTheme);
}

// Initialize first page
pages.push(createEmptyPage());
loadPage(currentPage);

// Drawing logic
canvas.addEventListener('pointerdown', (e) => {
  if (e.pointerType !== 'pen') return;
  drawing = true;
  saveState();
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
});
canvas.addEventListener('pointermove', (e) => {
  if (!drawing || e.pointerType !== 'pen') return;
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.strokeStyle = mode === 'pen' ? penColor : '#fffbe6';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.stroke();
});
canvas.addEventListener('pointerup', () => drawing = false);
canvas.addEventListener('pointercancel', () => drawing = false);

// Prevent scrolling
canvas.addEventListener('touchmove', e => e.preventDefault(), { passive: false });

// Toolbar actions
document.getElementById('colorPicker').addEventListener('input', e => penColor = e.target.value);
document.getElementById('penBtn').onclick = () => mode = 'pen';
document.getElementById('eraserBtn').onclick = () => mode = 'eraser';
document.getElementById('undoBtn').onclick = undo;
document.getElementById('redoBtn').onclick = redo;
document.getElementById('addPageBtn').onclick = addPage;
document.getElementById('prevPageBtn').onclick = prevPage;
document.getElementById('nextPageBtn').onclick = nextPage;
document.getElementById('saveBtn').onclick = saveNote;
document.getElementById('loadBtn').onclick = loadNote;
document.getElementById('textBtn').onclick = startTextInput;

// Touch swipe gestures
canvas.addEventListener('touchstart', (e) => touchStartX = e.changedTouches[0].screenX, { passive: true });
canvas.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipeGesture();
}, { passive: true });

function handleSwipeGesture() {
  const swipeDistance = touchEndX - touchStartX;
  const threshold = 80;

  if (Math.abs(swipeDistance) > threshold) {
    saveCurrentPage();
    if (swipeDistance < 0 && currentPage < pages.length - 1) {
      nextPage();
    } else if (swipeDistance > 0 && currentPage > 0) {
      prevPage();
    }
  }
}

function undo() {
  if (undoStack.length > 0) {
    redoStack.push(canvas.toDataURL());
    let img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0);
    img.src = undoStack.pop();
  }
}

function redo() {
  if (redoStack.length > 0) {
    undoStack.push(canvas.toDataURL());
    let img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0);
    img.src = redoStack.pop();
  }
}

function addPage() {
  pages.push(createEmptyPage());
  currentPage = pages.length - 1;
  loadPage(currentPage);
}

function prevPage() {
  if (currentPage > 0) {
    saveCurrentPage();
    currentPage--;
    loadPage(currentPage);
  }
}

function nextPage() {
  if (currentPage < pages.length - 1) {
    saveCurrentPage();
    currentPage++;
    loadPage(currentPage);
  }
}

function saveNote() {
  const link = document.createElement('a');
  link.download = `page-${currentPage + 1}.png`;
  link.href = canvas.toDataURL();
  link.click();
}

function loadNote() {
  document.getElementById('loadInput').click();
}

document.getElementById('loadInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const img = new Image();
  const reader = new FileReader();
  reader.onload = () => {
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
});

function startTextInput() {
  canvas.style.pointerEvents = 'none';
  textInput.style.display = 'block';
  textInput.value = '';
  canvas.addEventListener('click', placeTextOnce);
}

function placeTextOnce(e) {
  textInput.style.left = `${e.clientX}px`;
  textInput.style.top = `${e.clientY}px`;
  textInput.focus();

  textInput.onblur = () => {
    ctx.fillStyle = penColor;
    ctx.font = '16px sans-serif';
    ctx.fillText(textInput.value, e.offsetX, e.offsetY + 16);
    textInput.style.display = 'none';
    canvas.style.pointerEvents = 'auto';
    canvas.removeEventListener('click', placeTextOnce);
  };
}

function saveState() {
  undoStack.push(canvas.toDataURL());
  redoStack.length = 0;
}

function createEmptyPage() {
  const offscreen = document.createElement('canvas');
}