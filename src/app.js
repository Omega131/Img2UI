/**
 * App Main Controller
 * Coordinates UI events, color extraction, presets, real-time adjustments, and export.
 */

import { ColorExtractor } from './color-extractor.js';
import { ThemeEngine } from './theme-engine.js';
import { ExportManager } from './export-manager.js';
import { THEME_PRESETS } from './presets.js';
import { SAMPLE_WALLPAPERS } from './sample-wallpapers.js';

class App {
  constructor() {
    this.extractor = new ColorExtractor();
    this.engine = new ThemeEngine(this.extractor);
    this.exportManager = new ExportManager(this.engine);

    this.currentImage = null;
    this.activeExportTab = 'css';

    this.initDOMReferences();
    this.initEventListeners();
    this.renderWallpapers();
    this.renderPresets();

    // Subscribe to ThemeEngine state updates
    this.engine.onChange((data) => this.handleThemeUpdate(data));

    // Load initial sample wallpaper
    this.loadWallpaper(SAMPLE_WALLPAPERS[0].url, SAMPLE_WALLPAPERS[0].recommendedPreset);
  }

  initDOMReferences() {
    // Header & Global
    this.vpDesktop = document.getElementById('vp-btn-desktop');
    this.vpTablet = document.getElementById('vp-btn-tablet');
    this.vpMobile = document.getElementById('vp-btn-mobile');
    this.previewContainer = document.getElementById('preview-container');
    this.btnAutoFix = document.getElementById('btn-auto-fix');
    this.btnReset = document.getElementById('btn-reset-adjustments');
    this.btnOpenExport = document.getElementById('btn-open-export');

    // Upload & Gallery
    this.dropzone = document.getElementById('dropzone');
    this.fileInput = document.getElementById('file-input');
    this.wallpaperGallery = document.getElementById('wallpaper-gallery');
    this.btnEyedropper = document.getElementById('btn-eyedropper');

    // Palette & Strategy
    this.strategySelect = document.getElementById('extraction-strategy');
    this.paletteGrid = document.getElementById('palette-swatches-grid');
    this.swatchCountTag = document.getElementById('swatch-count-tag');

    // Role Pickers
    this.pickerPrimary = document.getElementById('picker-primary');
    this.pickerSecondary = document.getElementById('picker-secondary');
    this.pickerAccent = document.getElementById('picker-accent');
    this.pickerSurface = document.getElementById('picker-surface');
    this.pickerBackground = document.getElementById('picker-background');

    this.hexPrimary = document.getElementById('hex-label-primary');
    this.hexSecondary = document.getElementById('hex-label-secondary');
    this.hexAccent = document.getElementById('hex-label-accent');
    this.hexSurface = document.getElementById('hex-label-surface');
    this.hexBackground = document.getElementById('hex-label-background');

    // Presets Grid
    this.presetsGrid = document.getElementById('presets-grid');

    // Adjustment Sliders & Values
    this.sliders = {
      saturation: document.getElementById('slider-saturation'),
      brightness: document.getElementById('slider-brightness'),
      contrast: document.getElementById('slider-contrast'),
      blur: document.getElementById('slider-blur'),
      overlayOpacity: document.getElementById('slider-overlay'),
      hueShift: document.getElementById('slider-hueshift'),
      surfaceOpacity: document.getElementById('slider-surface-opacity'),
      borderRadius: document.getElementById('slider-radius'),
      glowIntensity: document.getElementById('slider-glow')
    };

    this.sliderValues = {
      saturation: document.getElementById('val-saturation'),
      brightness: document.getElementById('val-brightness'),
      contrast: document.getElementById('val-contrast'),
      blur: document.getElementById('val-blur'),
      overlayOpacity: document.getElementById('val-overlay'),
      hueShift: document.getElementById('val-hueshift'),
      surfaceOpacity: document.getElementById('val-surface-opacity'),
      borderRadius: document.getElementById('val-radius'),
      glowIntensity: document.getElementById('val-glow')
    };

    // Accessibility
    this.overallWcagBadge = document.getElementById('overall-wcag-badge');
    this.auditItemsList = document.getElementById('audit-items-list');

    // Preview
    this.wallpaperLayer = document.getElementById('wallpaper-layer');
    this.mediaCardImg = document.getElementById('media-card-img');

    // Export Modal
    this.exportModal = document.getElementById('export-modal');
    this.btnCloseModal = document.getElementById('btn-close-modal');
    this.exportCodeDisplay = document.getElementById('export-code-display');
    this.btnCopyCode = document.getElementById('btn-copy-code');
    this.btnDownloadFile = document.getElementById('btn-download-file');
    this.copyBtnText = document.getElementById('copy-btn-text');
    this.modalTabs = document.querySelectorAll('.modal-tab');

    // Toast Container
    this.toastContainer = document.getElementById('toast-container');
  }

  initEventListeners() {
    // Viewport Modes
    this.vpDesktop.addEventListener('click', () => this.setViewportMode('desktop'));
    this.vpTablet.addEventListener('click', () => this.setViewportMode('tablet'));
    this.vpMobile.addEventListener('click', () => this.setViewportMode('mobile'));

    // Upload & Drag-and-drop
    this.dropzone.addEventListener('click', () => this.fileInput.click());
    this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

    this.dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.dropzone.classList.add('drag-active');
    });

    this.dropzone.addEventListener('dragleave', () => {
      this.dropzone.classList.remove('drag-active');
    });

    this.dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      this.dropzone.classList.remove('drag-active');
      const files = e.dataTransfer.files;
      if (files && files[0] && files[0].type.startsWith('image/')) {
        this.processFile(files[0]);
      }
    });

    // Paste from clipboard support (Ctrl+V)
    window.addEventListener('paste', (e) => {
      const items = e.clipboardData?.items;
      if (items) {
        for (const item of items) {
          if (item.type.startsWith('image/')) {
            const blob = item.getAsFile();
            this.processFile(blob);
            this.showToast('Pasted image from clipboard!');
            break;
          }
        }
      }
    });

    // Eyedropper API
    this.btnEyedropper.addEventListener('click', () => this.activateEyedropper());

    // Extraction Strategy Change
    this.strategySelect.addEventListener('change', () => {
      if (this.currentImage) {
        this.extractColorsFromImage(this.currentImage);
        this.showToast(`Extracted with ${this.strategySelect.options[this.strategySelect.selectedIndex].text}`);
      }
    });

    // Role Color Pickers
    this.pickerPrimary.addEventListener('input', (e) => this.engine.setRoleColor('primary', e.target.value));
    this.pickerSecondary.addEventListener('input', (e) => this.engine.setRoleColor('secondary', e.target.value));
    this.pickerAccent.addEventListener('input', (e) => this.engine.setRoleColor('accent', e.target.value));
    this.pickerSurface.addEventListener('input', (e) => this.engine.setRoleColor('surface', e.target.value));
    this.pickerBackground.addEventListener('input', (e) => this.engine.setRoleColor('background', e.target.value));

    // Sliders
    for (const [key, slider] of Object.entries(this.sliders)) {
      slider.addEventListener('input', (e) => {
        this.engine.setAdjustment(key, e.target.value);
        this.updateSliderDisplay(key, e.target.value);
      });
    }

    // Auto Fix & Reset
    this.btnAutoFix.addEventListener('click', () => {
      this.engine.autoOptimizeContrast();
      this.showToast('Theme optimized for WCAG AA compliance! ✨');
    });

    this.btnReset.addEventListener('click', () => {
      this.engine.resetAdjustments();
      this.syncSlidersFromEngine();
      this.showToast('Adjustments reset to preset defaults.');
    });

    // Export Modal
    this.btnOpenExport.addEventListener('click', () => this.openExportModal());
    this.btnCloseModal.addEventListener('click', () => this.closeExportModal());
    this.exportModal.addEventListener('click', (e) => {
      if (e.target === this.exportModal) this.closeExportModal();
    });

    this.modalTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        this.modalTabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        this.activeExportTab = tab.dataset.tab;
        this.updateExportCode();
      });
    });

    this.btnCopyCode.addEventListener('click', () => this.copyExportCode());
    this.btnDownloadFile.addEventListener('click', () => this.downloadExportFile());
  }

  setViewportMode(mode) {
    this.previewContainer.classList.remove('mode-desktop', 'mode-tablet', 'mode-mobile');
    this.previewContainer.classList.add(`mode-${mode}`);

    this.vpDesktop.classList.toggle('active', mode === 'desktop');
    this.vpTablet.classList.toggle('active', mode === 'tablet');
    this.vpMobile.classList.toggle('active', mode === 'mobile');
  }

  renderWallpapers() {
    this.wallpaperGallery.innerHTML = '';
    SAMPLE_WALLPAPERS.forEach((wp) => {
      const chip = document.createElement('div');
      chip.className = `wallpaper-chip ${wp.id === SAMPLE_WALLPAPERS[0].id ? 'active' : ''}`;
      chip.dataset.id = wp.id;
      chip.title = `${wp.name} (${wp.category})`;

      chip.innerHTML = `<img src="${wp.thumbnail}" alt="${wp.name}" loading="lazy" />`;
      chip.addEventListener('click', () => {
        document.querySelectorAll('.wallpaper-chip').forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        this.loadWallpaper(wp.url, wp.recommendedPreset);
      });

      this.wallpaperGallery.appendChild(chip);
    });
  }

  renderPresets() {
    this.presetsGrid.innerHTML = '';
    for (const [id, preset] of Object.entries(THEME_PRESETS)) {
      const card = document.createElement('div');
      card.className = `preset-card ${id === this.engine.activePresetId ? 'active' : ''}`;
      card.dataset.id = id;

      card.innerHTML = `
        <div class="preset-header">
          <div class="preset-name-wrap">
            <span class="preset-icon">${preset.icon}</span>
            <span>${preset.name}</span>
          </div>
          <span class="preset-badge">${preset.badge}</span>
        </div>
        <p class="preset-desc">${preset.description}</p>
      `;

      card.addEventListener('click', () => {
        document.querySelectorAll('.preset-card').forEach((c) => c.classList.remove('active'));
        card.classList.add('active');
        this.engine.setPreset(id);
        this.syncSlidersFromEngine();
        this.showToast(`Applied ${preset.name} preset`);
      });

      this.presetsGrid.appendChild(card);
    }
  }

  async loadWallpaper(url, recommendedPreset = null) {
    try {
      this.engine.setWallpaper(url);
      if (this.mediaCardImg) this.mediaCardImg.src = url;

      const img = await this.extractor.loadImage(url);
      this.currentImage = img;
      this.extractColorsFromImage(img);

      if (recommendedPreset && THEME_PRESETS[recommendedPreset]) {
        this.engine.setPreset(recommendedPreset);
        document.querySelectorAll('.preset-card').forEach((c) => {
          c.classList.toggle('active', c.dataset.id === recommendedPreset);
        });
        this.syncSlidersFromEngine();
      }
    } catch (err) {
      console.error('Error loading wallpaper:', err);
      this.showToast('Could not load wallpaper image.');
    }
  }

  processFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      document.querySelectorAll('.wallpaper-chip').forEach((c) => c.classList.remove('active'));
      this.loadWallpaper(dataUrl);
      this.showToast(`Loaded ${file.name}`);
    };
    reader.readAsDataURL(file);
  }

  handleFileSelect(e) {
    const files = e.target.files;
    if (files && files[0]) {
      this.processFile(files[0]);
    }
  }

  async activateEyedropper() {
    if ('EyeDropper' in window) {
      try {
        const eyeDropper = new window.EyeDropper();
        const result = await eyeDropper.open();
        if (result && result.sRGBHex) {
          const pickedHex = result.sRGBHex.toUpperCase();
          this.engine.setRoleColor('primary', pickedHex);
          this.showToast(`Sampled ${pickedHex} as Primary Accent!`);
        }
      } catch (e) {
        // User cancelled eyedropper
      }
    } else {
      // Fallback: prompt or sample center pixel
      if (this.currentImage) {
        const sampled = this.extractor.samplePixel(this.currentImage, 0.5, 0.5);
        this.engine.setRoleColor('primary', sampled.hex);
        this.showToast(`Sampled ${sampled.hex} from image center!`);
      } else {
        this.showToast('EyeDropper API is not supported in this browser.');
      }
    }
  }

  extractColorsFromImage(img) {
    const strategy = this.strategySelect.value;
    const colors = this.extractor.extract(img, strategy, 6);
    this.renderPaletteSwatches(colors);
    this.engine.setPalette(colors);
  }

  renderPaletteSwatches(colors) {
    this.paletteGrid.innerHTML = '';
    this.swatchCountTag.textContent = `${colors.length} Colors`;

    const roles = ['primary', 'secondary', 'accent', 'surface', 'background'];

    colors.forEach((color, idx) => {
      const card = document.createElement('div');
      card.className = 'color-swatch-card';
      card.title = `Hex: ${color.hex}\nRGB: rgb(${color.rgb.join(', ')})\nClick to set as Primary or copy`;

      const roleTag = idx === 0 ? 'Primary' : idx === 1 ? 'Secondary' : idx === 2 ? 'Accent' : idx === 3 ? 'Surface' : idx === 4 ? 'Bg' : 'Tone';

      card.innerHTML = `
        <div class="swatch-box ${idx === 0 ? 'selected' : ''}" style="background-color: ${color.hex};"></div>
        <span class="swatch-hex font-mono">${color.hex}</span>
        <span class="swatch-role-tag ${idx === 0 ? 'primary' : ''}">${roleTag}</span>
      `;

      card.addEventListener('click', () => {
        document.querySelectorAll('.swatch-box').forEach((s) => s.classList.remove('selected'));
        card.querySelector('.swatch-box').classList.add('selected');
        this.engine.setRoleColor('primary', color.hex);
        navigator.clipboard?.writeText(color.hex);
        this.showToast(`Assigned ${color.hex} as Primary & copied to clipboard!`);
      });

      this.paletteGrid.appendChild(card);
    });
  }

  updateSliderDisplay(key, val) {
    if (!this.sliderValues[key]) return;
    switch (key) {
      case 'saturation':
      case 'brightness':
      case 'contrast':
      case 'overlayOpacity':
      case 'surfaceOpacity':
      case 'glowIntensity':
        this.sliderValues[key].textContent = `${val}%`;
        break;
      case 'blur':
      case 'borderRadius':
        this.sliderValues[key].textContent = `${val}px`;
        break;
      case 'hueShift':
        this.sliderValues[key].textContent = `${val}°`;
        break;
    }
  }

  syncSlidersFromEngine() {
    const adj = this.engine.adjustments;
    for (const [key, slider] of Object.entries(this.sliders)) {
      if (adj[key] !== undefined && slider) {
        slider.value = adj[key];
        this.updateSliderDisplay(key, adj[key]);
      }
    }
  }

  handleThemeUpdate({ tokens, audit, state }) {
    // 1. Update Role Pickers and Labels
    this.pickerPrimary.value = state.colorRoles.primary;
    this.hexPrimary.textContent = state.colorRoles.primary;

    this.pickerSecondary.value = state.colorRoles.secondary;
    this.hexSecondary.textContent = state.colorRoles.secondary;

    this.pickerAccent.value = state.colorRoles.accent;
    this.hexAccent.textContent = state.colorRoles.accent;

    this.pickerSurface.value = state.colorRoles.surface;
    this.hexSurface.textContent = state.colorRoles.surface;

    this.pickerBackground.value = state.colorRoles.background;
    this.hexBackground.textContent = state.colorRoles.background;

    // 2. Update Accessibility Auditor UI
    this.renderAuditResults(audit);

    // 3. Update active preset card styling
    document.querySelectorAll('.preset-card').forEach((c) => {
      c.classList.toggle('active', c.dataset.id === state.activePresetId);
    });
  }

  renderAuditResults(audit) {
    this.auditItemsList.innerHTML = '';
    let passCount = 0;
    const items = Object.values(audit);

    items.forEach((item) => {
      if (item.passesAANormal) passCount++;

      const row = document.createElement('div');
      row.className = 'audit-row';

      row.innerHTML = `
        <div class="audit-row-left">
          <span style="display:inline-block; width:12px; height:12px; border-radius:3px; background:${item.bg}; border:1px solid rgba(255,255,255,0.2);"></span>
          <span>${item.name}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span class="font-mono" style="font-size:0.75rem; color: #fff;">${item.ratioText}</span>
          <span class="audit-pill ${item.statusClass}">${item.level}</span>
        </div>
      `;

      this.auditItemsList.appendChild(row);
    });

    // Overall badge
    if (passCount === items.length) {
      this.overallWcagBadge.className = 'audit-badge contrast-aaa';
      this.overallWcagBadge.textContent = 'WCAG AAA / AA Valid';
    } else {
      this.overallWcagBadge.className = 'audit-badge contrast-aa-large';
      this.overallWcagBadge.textContent = `${passCount}/${items.length} Pairs Pass AA`;
    }
  }

  openExportModal() {
    this.updateExportCode();
    this.exportModal.classList.add('open');
  }

  closeExportModal() {
    this.exportModal.classList.remove('open');
  }

  updateExportCode() {
    let code = '';
    switch (this.activeExportTab) {
      case 'css':
        code = this.exportManager.generateCSS();
        break;
      case 'tailwind':
        code = this.exportManager.generateTailwind();
        break;
      case 'json':
        code = this.exportManager.generateJSON();
        break;
      case 'scss':
        code = this.exportManager.generateSCSS();
        break;
    }
    this.exportCodeDisplay.textContent = code;
  }

  copyExportCode() {
    const code = this.exportCodeDisplay.textContent;
    navigator.clipboard?.writeText(code).then(() => {
      this.copyBtnText.textContent = 'Copied! ✓';
      this.showToast('Copied theme tokens to clipboard!');
      setTimeout(() => {
        this.copyBtnText.textContent = 'Copy Code';
      }, 2000);
    });
  }

  downloadExportFile() {
    let ext = 'css';
    let mime = 'text/css';
    let content = '';

    switch (this.activeExportTab) {
      case 'css':
        ext = 'css';
        mime = 'text/css';
        content = this.exportManager.generateCSS();
        break;
      case 'tailwind':
        ext = 'js';
        mime = 'application/javascript';
        content = this.exportManager.generateTailwind();
        break;
      case 'json':
        ext = 'json';
        mime = 'application/json';
        content = this.exportManager.generateJSON();
        break;
      case 'scss':
        ext = 'scss';
        mime = 'text/x-scss';
        content = this.exportManager.generateSCSS();
        break;
    }

    const filename = `img2ui-theme-${this.engine.activePresetId}.${ext}`;
    this.exportManager.downloadFile(content, filename, mime);
    this.showToast(`Downloaded ${filename}`);
  }

  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      <span>${message}</span>
    `;
    this.toastContainer.appendChild(toast);
    setTimeout(() => {
      if (toast.parentElement) toast.parentElement.removeChild(toast);
    }, 3000);
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
