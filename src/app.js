/**
 * App Main Controller v2.1
 * Coordinates UI events, 6-slot uniform palette, full-scale precision sampler,
 * interactive mockup tabs, audio player, search filter, and export.
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
    this.targetSamplingSlot = 0; // Default: Slot 1 (Primary)

    // Full-scale sampler canvas offscreen
    this.fullCanvas = document.createElement('canvas');
    this.fullCtx = this.fullCanvas.getContext('2d', { willReadFrequently: true });

    // Loupe canvas
    this.loupeCanvas = null;
    this.loupeCtx = null;

    // Audio player state
    this.isPlayingAudio = true;

    this.initDOMReferences();
    this.initEventListeners();
    this.renderWallpapers();
    this.renderPresets();
    this.initSamplerLoupe();

    // Subscribe to ThemeEngine state updates
    this.engine.onChange((data) => this.handleThemeUpdate(data));

    // Load initial sample wallpaper
    this.loadWallpaper(SAMPLE_WALLPAPERS[0].url, SAMPLE_WALLPAPERS[0].recommendedPreset);

    // Initial sidebar length sync with mockup
    this.syncSidebarLength();
  }

  initDOMReferences() {
    // Header & Global
    this.studioSidebar = document.getElementById('studio-sidebar');
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
    this.btnOpenFullSampler = document.getElementById('btn-open-full-sampler');
    this.moodBadge = document.getElementById('mood-detected-badge');
    this.moodText = document.getElementById('detected-mood-text');

    // Palette & Slots
    this.strategySelect = document.getElementById('extraction-strategy');
    this.uniformPaletteGrid = document.getElementById('uniform-palette-grid');
    this.rolesConfigPanel = document.getElementById('roles-config-panel');
    this.activeTargetSlotIndicator = document.getElementById('active-target-slot-indicator');

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
    this.previewHeadingHighlight = document.getElementById('preview-heading-highlight');
    this.previewPrimaryBtn = document.getElementById('preview-primary-btn');
    this.btnDeployText = document.getElementById('btn-deploy-text');

    // Interactive Preview Tabs
    this.previewNavTabs = document.querySelectorAll('.nav-tab-btn');
    this.tabPanels = document.querySelectorAll('.preview-tab-panel');

    // Interactive Audio Widget
    this.playerToggleBtn = document.getElementById('player-toggle-btn');
    this.playerPrevBtn = document.getElementById('player-prev-btn');
    this.playerNextBtn = document.getElementById('player-next-btn');
    this.playerTrackTitle = document.getElementById('player-track-title');
    this.playerStatusBadge = document.getElementById('player-status-badge');
    this.audioWaveform = document.getElementById('audio-waveform');

    // Interactive Search & Filters
    this.sampleSearch = document.getElementById('sample-search');
    this.filterChips = document.querySelectorAll('.chip-interactive');
    this.activityList = document.getElementById('activity-list');

    // Full-Scale Sampler Modal
    this.samplerModal = document.getElementById('sampler-modal');
    this.btnCloseSamplerModal = document.getElementById('btn-close-sampler-modal');
    this.btnDoneSampling = document.getElementById('btn-done-sampling');
    this.samplerFullImg = document.getElementById('sampler-full-img');
    this.samplerCanvasWrapper = document.getElementById('sampler-canvas-wrapper');
    this.magnifierLoupe = document.getElementById('magnifier-loupe');
    this.loupeHex = document.getElementById('loupe-hex');
    this.loupeCoords = document.getElementById('loupe-coords');
    this.samplerSlotButtons = document.querySelectorAll('.btn-sample-slot');

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

    // Strategy Change
    this.strategySelect.addEventListener('change', () => {
      if (this.currentImage) {
        this.extractColorsFromImage(this.currentImage);
        this.showToast(`Extracted with ${this.strategySelect.options[this.strategySelect.selectedIndex].text}`);
      }
    });

    // Sliders
    for (const [key, slider] of Object.entries(this.sliders)) {
      slider.addEventListener('input', (e) => {
        this.engine.setAdjustment(key, e.target.value);
        this.updateSliderDisplay(key, e.target.value);
      });
    }

    // Auto Fix & Reset with theme switch animation
    this.btnAutoFix.addEventListener('click', () => {
      this.triggerThemeSwitchAnimation();
      this.engine.autoOptimizeContrast();
      this.showToast('Theme optimized for WCAG AA compliance! ✨');
    });

    this.btnReset.addEventListener('click', () => {
      this.triggerThemeSwitchAnimation();
      this.engine.resetAdjustments();
      this.syncSlidersFromEngine();
      this.showToast('Adjustments reset to preset defaults.');
    });

    // Interactive Preview Tabs
    this.previewNavTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        this.previewNavTabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        const targetTab = tab.dataset.tab;
        this.tabPanels.forEach((panel) => {
          panel.classList.toggle('active', panel.id === `tab-panel-${targetTab}`);
        });
        requestAnimationFrame(() => this.syncSidebarLength());
      });
    });

    // Interactive Audio Player Toggle
    this.playerToggleBtn.addEventListener('click', () => {
      this.isPlayingAudio = !this.isPlayingAudio;
      const iconPause = this.playerToggleBtn.querySelector('.icon-pause');
      const iconPlay = this.playerToggleBtn.querySelector('.icon-play');

      if (this.isPlayingAudio) {
        iconPause.style.display = 'block';
        iconPlay.style.display = 'none';
        this.audioWaveform.classList.add('is-playing');
        this.playerStatusBadge.textContent = 'Playing';
      } else {
        iconPause.style.display = 'none';
        iconPlay.style.display = 'block';
        this.audioWaveform.classList.remove('is-playing');
        this.playerStatusBadge.textContent = 'Paused';
      }
    });

    this.playerNextBtn.addEventListener('click', () => {
      this.playerTrackTitle.textContent = 'Cybernetic Reflections • 96kHz';
      this.showToast('Playing next track');
    });

    this.playerPrevBtn.addEventListener('click', () => {
      this.playerTrackTitle.textContent = 'Atmospheric Synthwave • Lossless';
      this.showToast('Playing previous track');
    });

    // Interactive Search Filtering
    this.sampleSearch.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const items = this.activityList.querySelectorAll('.activity-item');
      items.forEach((item) => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(q) ? 'flex' : 'none';
      });
    });

    // Filter Chips
    this.filterChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        this.filterChips.forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        const cat = chip.dataset.filter;
        const items = this.activityList.querySelectorAll('.activity-item');
        items.forEach((item) => {
          if (cat === 'all' || item.dataset.category === cat) {
            item.style.display = 'flex';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });

    // Deploy Theme Interactive Feedback
    this.previewPrimaryBtn.addEventListener('click', () => {
      this.btnDeployText.textContent = 'Deploying...';
      this.previewPrimaryBtn.style.opacity = '0.75';
      setTimeout(() => {
        this.btnDeployText.textContent = 'Deployed ✓';
        this.previewPrimaryBtn.style.opacity = '1';
        this.showToast('Theme tokens deployed to virtual edge CDN! 🚀');
        setTimeout(() => {
          this.btnDeployText.textContent = 'Deploy Theme';
        }, 2500);
      }, 700);
    });

    // Full-Scale Precision Sampler Modal
    this.btnOpenFullSampler.addEventListener('click', () => this.openSamplerModal(this.targetSamplingSlot));
    this.btnCloseSamplerModal.addEventListener('click', () => this.closeSamplerModal());
    this.btnDoneSampling.addEventListener('click', () => this.closeSamplerModal());
    this.samplerModal.addEventListener('click', (e) => {
      if (e.target === this.samplerModal) this.closeSamplerModal();
    });

    this.samplerSlotButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const slotIdx = parseInt(btn.dataset.slot, 10);
        this.setTargetSamplingSlot(slotIdx);
      });
    });

    // Full Image Mouse Events for Loupe and Sampling
    this.samplerCanvasWrapper.addEventListener('mousemove', (e) => this.handleSamplerMouseMove(e));
    this.samplerCanvasWrapper.addEventListener('mouseleave', () => {
      this.magnifierLoupe.style.display = 'none';
    });
    this.samplerCanvasWrapper.addEventListener('click', (e) => this.handleSamplerClick(e));

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

    // Auto-sync sidebar length to align with mockup edge on resize
    window.addEventListener('resize', () => this.syncSidebarLength());
    if (window.ResizeObserver && this.previewContainer) {
      this.containerResizeObserver = new ResizeObserver(() => {
        this.syncSidebarLength();
      });
      this.containerResizeObserver.observe(this.previewContainer);
    }
  }

  setViewportMode(mode) {
    this.previewContainer.classList.remove('mode-desktop', 'mode-tablet', 'mode-mobile');
    this.previewContainer.classList.add(`mode-${mode}`);

    this.vpDesktop.classList.toggle('active', mode === 'desktop');
    this.vpTablet.classList.toggle('active', mode === 'tablet');
    this.vpMobile.classList.toggle('active', mode === 'mobile');

    // Dynamically adjust sidebar length to align with mockup's new dimensions
    setTimeout(() => this.syncSidebarLength(), 50);
  }

  syncSidebarLength() {
    if (!this.studioSidebar || !this.previewContainer) return;
    if (window.innerWidth > 1080) {
      // Calculate target height so that the bottom of the scrolling sidebar perfectly aligns with the mockup's bottom edge
      const targetHeight = this.previewContainer.offsetTop + this.previewContainer.offsetHeight;
      this.studioSidebar.style.height = `${targetHeight}px`;
      this.studioSidebar.style.maxHeight = `${targetHeight}px`;
    } else {
      this.studioSidebar.style.height = '';
      this.studioSidebar.style.maxHeight = '';
    }
  }

  triggerThemeSwitchAnimation(presetId = null) {
    if (!this.previewContainer) return;

    // 1. Trigger radial shockwave on preview container
    this.previewContainer.classList.remove('theme-switching');
    // Force DOM reflow so re-triggering restarts the micro-animation
    void this.previewContainer.offsetWidth;
    this.previewContainer.classList.add('theme-switching');

    if (this.switchAnimTimeout) clearTimeout(this.switchAnimTimeout);
    this.switchAnimTimeout = setTimeout(() => {
      this.previewContainer.classList.remove('theme-switching');
    }, 800);

    // 2. Cascade swatch-pop animation on uniform grid slots
    const swatches = this.uniformPaletteGrid?.querySelectorAll('.slot-box') || [];
    swatches.forEach((swatch, idx) => {
      swatch.classList.remove('swatch-pop');
      setTimeout(() => {
        swatch.classList.add('swatch-pop');
        setTimeout(() => swatch.classList.remove('swatch-pop'), 500);
      }, idx * 40);
    });

    // 3. Overall WCAG badge pulse
    if (this.overallWcagBadge) {
      this.overallWcagBadge.classList.remove('badge-updated');
      void this.overallWcagBadge.offsetWidth;
      this.overallWcagBadge.classList.add('badge-updated');
      setTimeout(() => {
        this.overallWcagBadge.classList.remove('badge-updated');
      }, 600);
    }

    // 4. Re-sync sidebar height to ensure perfect alignment with mockup edge
    setTimeout(() => this.syncSidebarLength(), 60);
    setTimeout(() => this.syncSidebarLength(), 350);
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
        document.querySelectorAll('.preset-card').forEach((c) => {
          c.classList.remove('active', 'just-activated');
        });
        card.classList.add('active', 'just-activated');
        setTimeout(() => card.classList.remove('just-activated'), 500);

        this.triggerThemeSwitchAnimation(id);
        this.engine.setPreset(id);
        this.syncSlidersFromEngine();
        this.showToast(`Applied ${preset.name} mood ✨`);
      });

      this.presetsGrid.appendChild(card);
    }
  }

  async loadWallpaper(url, recommendedPreset = null) {
    try {
      this.engine.setWallpaper(url);
      if (this.mediaCardImg) this.mediaCardImg.src = url;
      if (this.samplerFullImg) this.samplerFullImg.src = url;

      const img = await this.extractor.loadImage(url);
      this.currentImage = img;

      // Draw to full-scale uncompressed canvas
      this.fullCanvas.width = img.naturalWidth || img.width;
      this.fullCanvas.height = img.naturalHeight || img.height;
      this.fullCtx.clearRect(0, 0, this.fullCanvas.width, this.fullCanvas.height);
      this.fullCtx.drawImage(img, 0, 0);

      this.extractColorsFromImage(img);

      if (recommendedPreset && THEME_PRESETS[recommendedPreset]) {
        this.triggerThemeSwitchAnimation(recommendedPreset);
        this.engine.setPreset(recommendedPreset);
        document.querySelectorAll('.preset-card').forEach((c) => {
          c.classList.toggle('active', c.dataset.id === recommendedPreset);
        });
        this.syncSlidersFromEngine();
      } else {
        this.triggerThemeSwitchAnimation();
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

  extractColorsFromImage(img) {
    const strategy = this.strategySelect.value;
    const { pixels } = this.extractor.getPixels(img);
    
    // Chromatic Mood Analysis
    const moodAnalysis = this.extractor.analyzeImageMood(pixels);
    this.moodText.textContent = `${moodAnalysis.mood.toUpperCase()} (${moodAnalysis.rationale.split(' ')[0]})`;

    const colors = this.extractor.extract(img, strategy, 6);
    this.engine.setPalette(colors, moodAnalysis);
    this.renderUniformPaletteSlots();
  }

  /* ==========================================================================
     Item 2: UNIFORM 6-SLOT MATRIX WITH INDIVIDUAL PRECISION SAMPLING
     ========================================================================== */

  renderUniformPaletteSlots() {
    this.uniformPaletteGrid.innerHTML = '';
    this.rolesConfigPanel.innerHTML = '';

    const slots = this.engine.colorSlots;

    slots.forEach((slot, idx) => {
      // 1. Uniform Grid Card
      const card = document.createElement('div');
      card.className = 'slot-card';

      card.innerHTML = `
        <div class="slot-box ${idx === this.targetSamplingSlot ? 'is-sampling-target' : ''}" style="background-color: ${slot.hex};" data-slot="${idx}">
          <span class="slot-tag">S${idx + 1}: ${slot.label.split(' ')[0]}</span>
          <button class="btn-slot-sample" data-slot="${idx}" title="Precision sample pixel for ${slot.label}">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m2 22 1-1h3l9-9"/><path d="M14 6l4 4"/><circle cx="18" cy="6" r="3"/></svg>
          </button>
        </div>
        <div class="slot-meta-row">
          <span class="slot-hex-text font-mono">${slot.hex}</span>
        </div>
      `;

      // Swatch Click: select slot and open color picker
      const slotBox = card.querySelector('.slot-box');
      const sampleBtn = card.querySelector('.btn-slot-sample');

      slotBox.addEventListener('click', (e) => {
        if (e.target.closest('.btn-slot-sample')) return;
        this.setTargetSamplingSlot(idx);
        // Trigger color input
        const picker = document.getElementById(`role-picker-${idx}`);
        if (picker) picker.click();
      });

      sampleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.setTargetSamplingSlot(idx);
        this.openSamplerModal(idx);
      });

      this.uniformPaletteGrid.appendChild(card);

      // 2. Role Configuration Row
      const row = document.createElement('div');
      row.className = 'role-row';
      row.innerHTML = `
        <span class="role-label">
          <span class="role-pill" style="background: ${slot.hex};"></span>
          <span>Slot ${idx + 1}: ${slot.label}</span>
        </span>
        <div class="role-color-input-wrapper">
          <input type="color" class="color-input-preview" id="role-picker-${idx}" value="${slot.hex}" />
          <span class="font-mono" style="font-size:0.75rem; color:var(--studio-text-secondary);">${slot.hex}</span>
        </div>
      `;

      const pickerInput = row.querySelector('.color-input-preview');
      pickerInput.addEventListener('input', (e) => {
        this.engine.setSlotColor(idx, e.target.value);
      });

      this.rolesConfigPanel.appendChild(row);
    });

    this.activeTargetSlotIndicator.textContent = `Target: Slot ${this.targetSamplingSlot + 1} (${slots[this.targetSamplingSlot]?.label.split(' ')[0] || ''})`;
  }

  setTargetSamplingSlot(slotIdx) {
    this.targetSamplingSlot = slotIdx;
    const slots = this.engine.colorSlots;
    this.activeTargetSlotIndicator.textContent = `Target: Slot ${slotIdx + 1} (${slots[slotIdx]?.label.split(' ')[0] || ''})`;

    document.querySelectorAll('.slot-box').forEach((box, i) => {
      box.classList.toggle('is-sampling-target', i === slotIdx);
    });

    this.samplerSlotButtons.forEach((btn, i) => {
      btn.classList.toggle('active', i === slotIdx);
    });
  }

  /* ==========================================================================
     Item 3: FULL-SCALE PRECISION COLOR SAMPLER MODAL WITH LOUPE
     ========================================================================== */

  initSamplerLoupe() {
    this.loupeCanvas = document.getElementById('loupe-canvas');
    if (this.loupeCanvas) {
      this.loupeCtx = this.loupeCanvas.getContext('2d', { willReadFrequently: true });
    }
  }

  openSamplerModal(slotIdx = 0) {
    this.setTargetSamplingSlot(slotIdx);
    if (this.currentImage) {
      this.samplerFullImg.src = this.currentImage.src;
    }
    this.samplerModal.classList.add('open');
  }

  closeSamplerModal() {
    this.samplerModal.classList.remove('open');
    this.magnifierLoupe.style.display = 'none';
  }

  handleSamplerMouseMove(e) {
    if (!this.currentImage || !this.loupeCtx) return;

    const img = this.samplerFullImg;
    const rect = img.getBoundingClientRect();

    if (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    ) {
      this.magnifierLoupe.style.display = 'none';
      return;
    }

    const naturalW = img.naturalWidth || this.fullCanvas.width;
    const naturalH = img.naturalHeight || this.fullCanvas.height;

    const relX = (e.clientX - rect.left) / rect.width;
    const relY = (e.clientY - rect.top) / rect.height;

    const pixelX = Math.max(0, Math.min(naturalW - 1, Math.round(relX * naturalW)));
    const pixelY = Math.max(0, Math.min(naturalH - 1, Math.round(relY * naturalH)));

    // Sample pixel from full-scale uncompressed canvas
    const pixelData = this.fullCtx.getImageData(pixelX, pixelY, 1, 1).data;
    const hex = this.extractor.rgbToHex(pixelData[0], pixelData[1], pixelData[2]);

    // Render Loupe (5x magnification of 16x16 pixel area around cursor)
    const loupeRadius = 8;
    const sampleX = Math.max(0, Math.min(naturalW - loupeRadius * 2, pixelX - loupeRadius));
    const sampleY = Math.max(0, Math.min(naturalH - loupeRadius * 2, pixelY - loupeRadius));

    this.loupeCtx.imageSmoothingEnabled = false;
    this.loupeCtx.clearRect(0, 0, 80, 80);
    this.loupeCtx.drawImage(
      this.fullCanvas,
      sampleX,
      sampleY,
      loupeRadius * 2,
      loupeRadius * 2,
      0,
      0,
      80,
      80
    );

    // Position loupe near mouse
    const wrapperRect = this.samplerCanvasWrapper.getBoundingClientRect();
    const loupeX = e.clientX - wrapperRect.left + 15;
    const loupeY = e.clientY - wrapperRect.top - 120;

    this.magnifierLoupe.style.left = `${loupeX}px`;
    this.magnifierLoupe.style.top = `${loupeY}px`;
    this.magnifierLoupe.style.display = 'block';

    this.loupeHex.textContent = hex;
    this.loupeCoords.textContent = `X: ${pixelX} Y: ${pixelY}`;
  }

  handleSamplerClick(e) {
    if (!this.currentImage) return;

    const img = this.samplerFullImg;
    const rect = img.getBoundingClientRect();

    if (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    ) {
      return;
    }

    const naturalW = img.naturalWidth || this.fullCanvas.width;
    const naturalH = img.naturalHeight || this.fullCanvas.height;

    const relX = (e.clientX - rect.left) / rect.width;
    const relY = (e.clientY - rect.top) / rect.height;

    const pixelX = Math.max(0, Math.min(naturalW - 1, Math.round(relX * naturalW)));
    const pixelY = Math.max(0, Math.min(naturalH - 1, Math.round(relY * naturalH)));

    const sampled = this.extractor.samplePixelExact(this.fullCanvas, pixelX, pixelY);
    const targetIdx = this.targetSamplingSlot;

    this.engine.setSlotColor(targetIdx, sampled.hex);
    this.renderUniformPaletteSlots();

    const slotLabel = this.engine.colorSlots[targetIdx]?.label || `Slot ${targetIdx + 1}`;
    this.showToast(`Sampled ${sampled.hex} at [${pixelX}, ${pixelY}] into ${slotLabel}! ✨`);
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
    this.renderAuditResults(audit);

    // Update active preset cards
    document.querySelectorAll('.preset-card').forEach((c) => {
      c.classList.toggle('active', c.dataset.id === state.activePresetId);
    });

    // Update heading gradient
    if (this.previewHeadingHighlight && tokens['--theme-heading-gradient']) {
      this.previewHeadingHighlight.style.background = tokens['--theme-heading-gradient'];
    }

    // Refresh slots
    this.renderUniformPaletteSlots();
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

window.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
