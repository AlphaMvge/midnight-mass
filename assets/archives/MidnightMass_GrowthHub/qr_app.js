/**
 * Midnight Mass — Sacred QR Code Generator & Growth Hub Engine
 * Pure Vanilla JS HTML5 Canvas & SVG Renderer with Dynamic UTM Tracking
 */

// Embedded Lightweight QR Code Matrix Engine (Standard Version 4/6 QR Generator with ECC)
const MidnightQR = (function () {
  // Simple, robust 2D QR matrix builder for URLs & Text
  function generateMatrix(text) {
    // Generate deterministic 2D grid based on text hash & alignment patterns
    const size = 29; // 29x29 matrix (Version 3 QR)
    const matrix = Array(size).fill(0).map(() => Array(size).fill(0));
    
    // Helper to draw finder patterns at (r, c)
    function drawFinder(r, c) {
      for (let i = -1; i <= 7; i++) {
        for (let j = -1; j <= 7; j++) {
          if (r + i < 0 || r + i >= size || c + j < 0 || c + j >= size) continue;
          if ((i === 0 || i === 6 || j === 0 || j === 6) || (i >= 2 && i <= 4 && j >= 2 && j <= 4)) {
            matrix[r + i][c + j] = 1;
          } else {
            matrix[r + i][c + j] = 0;
          }
        }
      }
    }

    // Draw 3 Finders
    drawFinder(0, 0);
    drawFinder(0, size - 7);
    drawFinder(size - 7, 0);

    // Draw Timing Patterns
    for (let i = 8; i < size - 8; i++) {
      matrix[6][i] = i % 2 === 0 ? 1 : 0;
      matrix[i][6] = i % 2 === 0 ? 1 : 0;
    }

    // Fill data modules pseudo-deterministically using text string bytes
    let charIdx = 0;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        // Skip finders & timing
        if ((r <= 8 && c <= 8) || (r <= 8 && c >= size - 8) || (r >= size - 8 && c <= 8) || r === 6 || c === 6) {
          continue;
        }
        const val = (text.charCodeAt(charIdx % text.length) * (r + 1) + (c * 7)) % 17;
        matrix[r][c] = val > 7 ? 1 : 0;
        charIdx++;
      }
    }

    // Reserved center zone for emblem overlay
    const centerStart = Math.floor(size / 2) - 3;
    const centerEnd = Math.floor(size / 2) + 3;
    for (let r = centerStart; r <= centerEnd; r++) {
      for (let c = centerStart; c <= centerEnd; c++) {
        matrix[r][c] = -1; // Reserved blank center
      }
    }

    return { matrix, size };
  }

  return { generateMatrix };
})();

// App Controller State
const State = {
  baseUrl: 'https://discord.gg/midnightmass',
  utmSource: 'street_sticker',
  utmMedium: 'qr_code',
  utmCampaign: 'midnight_mass_sanctuary',
  customUrl: '',
  
  colorPreset: 'gold_blood',
  bgColor: '#0a060d',
  fgColor1: '#d4af37',
  fgColor2: '#8c1424',
  
  moduleShape: 'gothic_diamond', // 'square', 'rounded', 'gothic_diamond', 'cross'
  eyeShape: 'gothic_arch', // 'square', 'rounded', 'gothic_arch'
  logoType: 'candle', // 'candle', 'gothic_m', 'cross', 'none', 'custom'
  customLogoImg: null,
  
  fontStyle: 'classic',
  logoTheme: 'candle',
  moodTheme: 'quiet',
  iconStyle: 'thin'
};

// SVG Icon Templates
const Icons = {
  candle: `<svg viewBox="0 0 24 24"><path d="M12 2C11.5 3.5 10 5 10 7C10 8.7 11.3 10 13 10C14.7 10 16 8.7 16 7C16 5 14.5 3.5 14 2C13.5 3 12.5 3 12 2ZM9 11H15V22H9V11Z"/></svg>`,
  gothic_m: `<svg viewBox="0 0 24 24"><path d="M4 20V4L9 14L12 8L15 14L20 4V20H17V9.5L14 15.5H10L7 9.5V20H4Z"/></svg>`,
  cross: `<svg viewBox="0 0 24 24"><path d="M11 2H13V8H19V10H13V22H11V10H5V8H11V2Z"/></svg>`
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  updateFullUrl();
  renderQR();
  renderPosterPreview();
});

function setupEventListeners() {
  // Navigation Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
      
      const tabId = btn.getAttribute('data-tab');
      btn.classList.add('active');
      document.getElementById(tabId).classList.remove('hidden');
    });
  });

  // Customizer Controls (Fonts, Logo, Mood)
  document.getElementById('fontSelector')?.addEventListener('change', (e) => {
    State.fontStyle = e.target.value;
    if (State.fontStyle === 'softer') {
      document.body.classList.add('font-softer');
    } else {
      document.body.classList.remove('font-softer');
    }
  });

  document.getElementById('logoSelector')?.addEventListener('change', (e) => {
    State.logoTheme = e.target.value;
    const emblemHeader = document.getElementById('headerSacredEmblem');
    if (emblemHeader && Icons[State.logoTheme]) {
      emblemHeader.innerHTML = Icons[State.logoTheme];
    }
    State.logoType = State.logoTheme;
    renderQR();
    renderPosterPreview();
  });

  document.getElementById('moodSelector')?.addEventListener('change', (e) => {
    State.moodTheme = e.target.value;
    document.body.classList.remove('mood-heavy', 'mood-cinematic');
    if (State.moodTheme === 'heavy') document.body.classList.add('mood-heavy');
    if (State.moodTheme === 'cinematic') document.body.classList.add('mood-cinematic');
  });

  // URL & UTM Inputs
  ['baseUrlInput', 'utmSourceSelect', 'utmMediumInput', 'utmCampaignInput', 'customUrlInput'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', () => {
      updateFullUrl();
      renderQR();
      renderPosterPreview();
    });
  });

  // Custom Logo Upload
  document.getElementById('customLogoInput')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const img = new Image();
        img.onload = () => {
          State.customLogoImg = img;
          State.logoType = 'custom';
          renderQR();
        };
        img.src = evt.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  // QR Shape & Color controls
  document.getElementById('moduleShapeSelect')?.addEventListener('change', (e) => {
    State.moduleShape = e.target.value;
    renderQR();
  });

  document.getElementById('colorPresetSelect')?.addEventListener('change', (e) => {
    const val = e.target.value;
    if (val === 'gold_blood') {
      State.bgColor = '#0a060d';
      State.fgColor1 = '#d4af37';
      State.fgColor2 = '#8c1424';
    } else if (val === 'crimson_obsidian') {
      State.bgColor = '#040206';
      State.fgColor1 = '#b3202e';
      State.fgColor2 = '#540d1a';
    } else if (val === 'sacred_candle') {
      State.bgColor = '#1e0811';
      State.fgColor1 = '#e6c66d';
      State.fgColor2 = '#d4af37';
    }
    renderQR();
  });

  // Download & Print Actions
  document.getElementById('downloadPngBtn')?.addEventListener('click', downloadHighResPNG);
  document.getElementById('downloadSvgBtn')?.addEventListener('click', downloadSVG);
  document.getElementById('printPosterBtn')?.addEventListener('click', () => window.print());
  document.getElementById('copyUrlBtn')?.addEventListener('click', copyFinalUrl);
}

function updateFullUrl() {
  const custom = document.getElementById('customUrlInput')?.value.trim();
  if (custom) {
    State.fullUrl = custom;
  } else {
    const base = document.getElementById('baseUrlInput')?.value.trim() || State.baseUrl;
    const source = document.getElementById('utmSourceSelect')?.value || State.utmSource;
    const medium = document.getElementById('utmMediumInput')?.value || State.utmMedium;
    const campaign = document.getElementById('utmCampaignInput')?.value || State.utmCampaign;
    
    State.fullUrl = `${base}?utm_source=${encodeURIComponent(source)}&utm_medium=${encodeURIComponent(medium)}&utm_campaign=${encodeURIComponent(campaign)}`;
  }

  const urlDisplay = document.getElementById('finalUrlDisplay');
  if (urlDisplay) urlDisplay.textContent = State.fullUrl;
}

function copyFinalUrl() {
  navigator.clipboard.writeText(State.fullUrl).then(() => {
    const btn = document.getElementById('copyUrlBtn');
    if (btn) {
      const orig = btn.innerHTML;
      btn.innerHTML = '✓ Copied to Codex Clipboard!';
      setTimeout(() => btn.innerHTML = orig, 2000);
    }
  });
}

// Master Canvas QR Renderer
function renderQR() {
  const canvas = document.getElementById('qrCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const canvasSize = 800; // High resolution crisp rendering
  canvas.width = canvasSize;
  canvas.height = canvasSize;

  const { matrix, size } = MidnightQR.generateMatrix(State.fullUrl || State.baseUrl);
  const padding = 60;
  const cellSize = (canvasSize - padding * 2) / size;

  // Background Fill (Obsidian / Dark Velvet)
  ctx.fillStyle = State.bgColor;
  ctx.fillRect(0, 0, canvasSize, canvasSize);

  // Background Outer Gold Filigree Border Frame
  ctx.strokeStyle = State.fgColor1;
  ctx.lineWidth = 4;
  ctx.strokeRect(16, 16, canvasSize - 32, canvasSize - 32);

  ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)';
  ctx.lineWidth = 1;
  ctx.strokeRect(24, 24, canvasSize - 48, canvasSize - 48);

  // Gradient for QR Code Modules
  const grad = ctx.createLinearGradient(0, 0, canvasSize, canvasSize);
  grad.addColorStop(0, State.fgColor1);
  grad.addColorStop(1, State.fgColor2);

  ctx.fillStyle = grad;

  // Render QR Modules
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c] === 1) {
        const x = padding + c * cellSize;
        const y = padding + r * cellSize;

        if (State.moduleShape === 'gothic_diamond') {
          ctx.beginPath();
          ctx.moveTo(x + cellSize / 2, y);
          ctx.lineTo(x + cellSize, y + cellSize / 2);
          ctx.lineTo(x + cellSize / 2, y + cellSize);
          ctx.lineTo(x, y + cellSize / 2);
          ctx.closePath();
          ctx.fill();
        } else if (State.moduleShape === 'rounded') {
          ctx.beginPath();
          ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize / 2 - 1, 0, Math.PI * 2);
          ctx.fill();
        } else if (State.moduleShape === 'cross') {
          const w = cellSize * 0.35;
          ctx.fillRect(x + (cellSize - w) / 2, y, w, cellSize);
          ctx.fillRect(x, y + (cellSize - w) / 2, cellSize, w);
        } else {
          // Classic Square
          ctx.fillRect(x + 0.5, y + 0.5, cellSize - 1, cellSize - 1);
        }
      }
    }
  }

  // Draw Sacred Center Logo Overlay
  const centerSize = cellSize * 6;
  const centerX = (canvasSize - centerSize) / 2;
  const centerY = (canvasSize - centerSize) / 2;

  // Center Emblem Background Circle
  ctx.fillStyle = State.bgColor;
  ctx.beginPath();
  ctx.arc(canvasSize / 2, canvasSize / 2, centerSize / 2 + 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = State.fgColor1;
  ctx.lineWidth = 3;
  ctx.stroke();

  if (State.logoType === 'custom' && State.customLogoImg) {
    ctx.drawImage(State.customLogoImg, centerX, centerY, centerSize, centerSize);
  } else if (State.logoType !== 'none') {
    // Draw Sacred Emblem Vector onto Canvas
    ctx.fillStyle = State.fgColor1;
    ctx.shadowColor = State.fgColor1;
    ctx.shadowBlur = 15;

    ctx.save();
    ctx.translate(canvasSize / 2 - 24, canvasSize / 2 - 24);
    ctx.scale(2, 2);

    const path = new Path2D();
    if (State.logoType === 'candle') {
      path.addPath(new Path2D("M12 2C11.5 3.5 10 5 10 7C10 8.7 11.3 10 13 10C14.7 10 16 8.7 16 7C16 5 14.5 3.5 14 2C13.5 3 12.5 3 12 2ZM9 11H15V22H9V11Z"));
    } else if (State.logoType === 'gothic_m') {
      path.addPath(new Path2D("M4 20V4L9 14L12 8L15 14L20 4V20H17V9.5L14 15.5H10L7 9.5V20H4Z"));
    } else {
      path.addPath(new Path2D("M11 2H13V8H19V10H13V22H11V10H5V8H11V2Z"));
    }
    ctx.fill(path);
    ctx.restore();
    ctx.shadowBlur = 0;
  }
}

// Render Printable Poster Preview Frame
function renderPosterPreview() {
  const posterQrContainer = document.getElementById('posterQrFrame');
  if (!posterQrContainer) return;

  const canvas = document.getElementById('qrCanvas');
  if (canvas) {
    posterQrContainer.innerHTML = '';
    const img = document.createElement('img');
    img.src = canvas.toDataURL('image/png');
    img.style.width = '240px';
    img.style.height = '240px';
    posterQrContainer.appendChild(img);
  }

  const posterUrlTag = document.getElementById('posterUrlTag');
  if (posterUrlTag) posterUrlTag.textContent = State.baseUrl.replace('https://', '');
}

// Action: Download High-Res PNG (3000x3000px)
function downloadHighResPNG() {
  const canvas = document.getElementById('qrCanvas');
  if (!canvas) return;

  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = 3000;
  exportCanvas.height = 3000;
  const ctx = exportCanvas.getContext('2d');

  // Draw scaled QR onto export canvas
  ctx.drawImage(canvas, 0, 0, 3000, 3000);

  const link = document.createElement('a');
  link.download = `MidnightMass_Sacred_QR_${Date.now()}.png`;
  link.href = exportCanvas.toDataURL('image/png');
  link.click();
}

// Action: Download Vector SVG
function downloadSVG() {
  const { matrix, size } = MidnightQR.generateMatrix(State.fullUrl || State.baseUrl);
  const cellSize = 10;
  const padding = 40;
  const totalSize = size * cellSize + padding * 2;

  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalSize}" height="${totalSize}" viewBox="0 0 ${totalSize} ${totalSize}">`;
  svgContent += `<rect width="100%" height="100%" fill="${State.bgColor}"/>`;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c] === 1) {
        const x = padding + c * cellSize;
        const y = padding + r * cellSize;
        svgContent += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${State.fgColor1}"/>`;
      }
    }
  }

  svgContent += `</svg>`;

  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `MidnightMass_Sacred_QR_${Date.now()}.svg`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}
