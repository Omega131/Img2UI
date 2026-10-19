/**
 * Theme Engine
 * Generates and synchronizes all CSS Custom Properties and design tokens in real time.
 */

import { THEME_PRESETS } from './presets.js';
import { ContrastChecker } from './contrast-checker.js';

export class ThemeEngine {
  constructor(colorExtractor) {
    this.extractor = colorExtractor;
    this.contrastChecker = new ContrastChecker(colorExtractor);

    // Default adjustment values
    this.adjustments = {
      saturation: 100,
      brightness: 100,
      contrast: 100,
      blur: 14,
      overlayOpacity: 45,
      hueShift: 0,
      borderRadius: 14,
      surfaceOpacity: 85,
      glowIntensity: 60
    };

    this.activePresetId = 'vibrant';
    
    // 6 semantic color slots
    this.colorSlots = [
      { id: 0, role: 'primary', label: 'Primary Accent', hex: '#06B6D4' },
      { id: 1, role: 'secondary', label: 'Secondary Tone', hex: '#8B5CF6' },
      { id: 2, role: 'accent', label: 'Accent Pop', hex: '#F43F5E' },
      { id: 3, role: 'surface', label: 'Card Surface', hex: '#151D2F' },
      { id: 4, role: 'background', label: 'Canvas Background', hex: '#0B0F19' },
      { id: 5, role: 'text', label: 'Highlight / Text', hex: '#E2E8F0' }
    ];

    this.colorRoles = {
      primary: '#06B6D4',
      secondary: '#8B5CF6',
      accent: '#F43F5E',
      background: '#0B0F19',
      surface: '#151D2F',
      textPrimary: '#FFFFFF',
      textSecondary: '#94A3B8'
    };

    this.rawPalette = [];
    this.currentWallpaperUrl = '/wallpapers/cyberpunk.jpg';
    this.imageAnalysis = null;
    this.listeners = [];
  }

  onChange(fn) {
    this.listeners.push(fn);
  }

  notify() {
    const tokens = this.getTokens();
    const audit = this.contrastChecker.auditTheme(tokens);
    const state = this.getState();
    for (const fn of this.listeners) {
      try {
        fn({ tokens, audit, state });
      } catch (err) {
        console.error('Theme listener error:', err);
      }
    }
  }

  getState() {
    return {
      activePresetId: this.activePresetId,
      adjustments: { ...this.adjustments },
      colorRoles: { ...this.colorRoles },
      colorSlots: this.colorSlots.map((s) => ({ ...s })),
      rawPalette: [...this.rawPalette],
      wallpaperUrl: this.currentWallpaperUrl,
      imageAnalysis: this.imageAnalysis
    };
  }

  setWallpaper(url) {
    this.currentWallpaperUrl = url;
    this.applyToDOM();
    this.notify();
  }

  setPreset(presetId) {
    if (!THEME_PRESETS[presetId]) return;
    this.activePresetId = presetId;
    const preset = THEME_PRESETS[presetId];

    if (preset.config) {
      if (preset.config.backgroundBlur !== undefined) {
        this.adjustments.blur = preset.config.backgroundBlur;
      }
      if (preset.config.overlayOpacity !== undefined) {
        this.adjustments.overlayOpacity = Math.round(preset.config.overlayOpacity * 100);
      }
      if (preset.config.surfaceOpacity !== undefined) {
        this.adjustments.surfaceOpacity = Math.round(preset.config.surfaceOpacity * 100);
      }
      if (preset.config.borderRadius !== undefined) {
        this.adjustments.borderRadius = parseInt(preset.config.borderRadius, 10) || 12;
      }
    }

    this.applyToDOM();
    this.notify();
  }

  setAdjustment(key, value) {
    if (this.adjustments[key] !== undefined) {
      this.adjustments[key] = Number(value);
      this.applyToDOM();
      this.notify();
    }
  }

  resetAdjustments() {
    const preset = THEME_PRESETS[this.activePresetId] || THEME_PRESETS.vibrant;
    this.adjustments = {
      saturation: Math.round(preset.config.saturationMultiplier * 100) || 100,
      brightness: 100,
      contrast: Math.round(preset.config.contrastMultiplier * 100) || 100,
      blur: preset.config.backgroundBlur || 14,
      overlayOpacity: Math.round((preset.config.overlayOpacity || 0.45) * 100),
      hueShift: preset.config.bgToneShift || 0,
      borderRadius: parseInt(preset.config.borderRadius, 10) || 14,
      surfaceOpacity: Math.round((preset.config.surfaceOpacity || 0.85) * 100),
      glowIntensity: 60
    };
    this.applyToDOM();
    this.notify();
  }

  setPalette(extractedColors, imageAnalysis = null) {
    this.rawPalette = extractedColors;
    this.imageAnalysis = imageAnalysis;
    if (!extractedColors || extractedColors.length === 0) return;

    const sorted = [...extractedColors];

    const primaryCandidate = sorted[0]?.hex || '#06B6D4';
    const secondaryCandidate = sorted[1]?.hex || sorted[0]?.hex || '#8B5CF6';
    const accentCandidate = sorted[2]?.hex || sorted[1]?.hex || '#F43F5E';

    // Surface / Background: Find darkest or most muted color for base canvas
    const darkCandidates = [...sorted].sort((a, b) => {
      const lumA = this.extractor.getRelativeLuminance(a.rgb[0], a.rgb[1], a.rgb[2]);
      const lumB = this.extractor.getRelativeLuminance(b.rgb[0], b.rgb[1], b.rgb[2]);
      return lumA - lumB;
    });

    const bgCandidate = darkCandidates[0]?.hex || '#0B0F19';
    let surfaceCandidate = darkCandidates[1]?.hex || '#151D2F';

    if (this.extractor.getContrastRatio(surfaceCandidate, bgCandidate) < 1.15) {
      const [r, g, b] = this.extractor.hexToRgb(bgCandidate);
      const [h, s, l] = this.extractor.rgbToHsl(r, g, b);
      const newL = Math.min(0.22, l + 0.08);
      const [sr, sg, sb] = this.extractor.hslToRgb(h, s, newL);
      surfaceCandidate = this.extractor.rgbToHex(sr, sg, sb);
    }

    const textCandidate = sorted[5]?.hex || sorted[4]?.hex || '#E2E8F0';

    // Update slots
    this.colorSlots[0].hex = primaryCandidate;
    this.colorSlots[1].hex = secondaryCandidate;
    this.colorSlots[2].hex = accentCandidate;
    this.colorSlots[3].hex = surfaceCandidate;
    this.colorSlots[4].hex = bgCandidate;
    this.colorSlots[5].hex = textCandidate;

    // Update roles
    this.colorRoles.primary = primaryCandidate;
    this.colorRoles.secondary = secondaryCandidate;
    this.colorRoles.accent = accentCandidate;
    this.colorRoles.surface = surfaceCandidate;
    this.colorRoles.background = bgCandidate;

    this.applyToDOM();
    this.notify();
  }

  setSlotColor(slotIndex, hex) {
    if (this.colorSlots[slotIndex]) {
      this.colorSlots[slotIndex].hex = hex;

      if (slotIndex === 0) this.colorRoles.primary = hex;
      else if (slotIndex === 1) this.colorRoles.secondary = hex;
      else if (slotIndex === 2) this.colorRoles.accent = hex;
      else if (slotIndex === 3) this.colorRoles.surface = hex;
      else if (slotIndex === 4) this.colorRoles.background = hex;

      this.applyToDOM();
      this.notify();
    }
  }

  setRoleColor(role, hex) {
    if (this.colorRoles[role] !== undefined) {
      this.colorRoles[role] = hex;

      // Sync to slots
      const slotMap = { primary: 0, secondary: 1, accent: 2, surface: 3, background: 4 };
      if (slotMap[role] !== undefined) {
        this.colorSlots[slotMap[role]].hex = hex;
      }

      this.applyToDOM();
      this.notify();
    }
  }

  autoOptimizeContrast() {
    const optimalPrimaryText = this.extractor.getOptimalTextColor(this.colorRoles.primary).text;
    this.colorRoles.textPrimary = optimalPrimaryText;

    const headingCandidate = '#FFFFFF';
    const surfaceHex = this.colorRoles.surface;
    const ratio = this.extractor.getContrastRatio(headingCandidate, surfaceHex);

    if (ratio < 4.5) {
      const [r, g, b] = this.extractor.hexToRgb(surfaceHex);
      let [h, s, l] = this.extractor.rgbToHsl(r, g, b);
      l = Math.max(0.08, l - 0.12);
      const [nr, ng, nb] = this.extractor.hslToRgb(h, s, l);
      this.colorRoles.surface = this.extractor.rgbToHex(nr, ng, nb);
      this.colorSlots[3].hex = this.colorRoles.surface;
    }

    this.applyToDOM();
    this.notify();
  }

  getTokens() {
    const preset = THEME_PRESETS[this.activePresetId] || THEME_PRESETS.vibrant;
    const adj = this.adjustments;

    const adjOptions = {
      saturation: adj.saturation * (preset.config.saturationMultiplier || 1.0),
      brightness: adj.brightness,
      contrast: adj.contrast * (preset.config.contrastMultiplier || 1.0),
      hueShift: adj.hueShift + (preset.config.bgToneShift || 0)
    };

    const primary = this.extractor.adjustColor(this.colorRoles.primary, adjOptions);
    const secondary = this.extractor.adjustColor(this.colorRoles.secondary, adjOptions);
    const accent = this.extractor.adjustColor(this.colorRoles.accent, adjOptions);
    const background = this.extractor.adjustColor(this.colorRoles.background, {
      ...adjOptions,
      brightness: Math.max(16, adjOptions.brightness * 0.65)
    });
    const surfaceSolid = this.extractor.adjustColor(this.colorRoles.surface, {
      ...adjOptions,
      brightness: Math.max(26, adjOptions.brightness * 0.8)
    });

    const [pr, pg, pb] = this.extractor.hexToRgb(primary);
    const [sr, sg, sb] = this.extractor.hexToRgb(secondary);
    const [ar, ag, ab] = this.extractor.hexToRgb(accent);
    const [bgr, bgg, bgb] = this.extractor.hexToRgb(background);
    const [sfr, sfg, sfb] = this.extractor.hexToRgb(surfaceSolid);

    const primaryTextInfo = this.extractor.getOptimalTextColor(primary);
    const secondaryTextInfo = this.extractor.getOptimalTextColor(secondary);
    const accentTextInfo = this.extractor.getOptimalTextColor(accent);

    const surfaceLum = this.extractor.getRelativeLuminance(sfr, sfg, sfb);
    const isDarkSurface = surfaceLum < 0.35;

    const textPrimary = isDarkSurface ? '#FFFFFF' : '#090D16';
    const textSecondary = isDarkSurface ? 'rgba(255, 255, 255, 0.78)' : 'rgba(15, 23, 42, 0.78)';
    const textMuted = isDarkSurface ? 'rgba(255, 255, 255, 0.50)' : 'rgba(15, 23, 42, 0.50)';

    const surfaceAlpha = adj.surfaceOpacity / 100;
    const surfaceRgba = `rgba(${sfr}, ${sfg}, ${sfb}, ${surfaceAlpha.toFixed(2)})`;
    const surfaceHoverRgba = `rgba(${Math.min(255, sfr + 12)}, ${Math.min(255, sfg + 12)}, ${Math.min(255, sfb + 12)}, ${(surfaceAlpha + 0.05).toFixed(2)})`;

    const borderAlpha = preset.id === 'glass' ? 0.32 : preset.id === 'minimal' ? 0.12 : preset.id === 'cyberpunk' ? 0.55 : 0.2;
    const surfaceBorder = preset.id === 'cyberpunk'
      ? `rgba(${pr}, ${pg}, ${pb}, 0.55)`
      : isDarkSurface
      ? `rgba(255, 255, 255, ${borderAlpha})`
      : `rgba(0, 0, 0, ${borderAlpha})`;

    const primaryBorder = `rgba(${pr}, ${pg}, ${pb}, 0.6)`;

    const glowScale = adj.glowIntensity / 100;
    const cardGlow = glowScale > 0.05
      ? `0 0 ${(32 * glowScale).toFixed(0)}px rgba(${pr}, ${pg}, ${pb}, ${(0.28 * glowScale).toFixed(2)})`
      : 'none';
    const primaryGlow = glowScale > 0.05
      ? `0 8px 24px -4px rgba(${pr}, ${pg}, ${pb}, ${(0.5 * glowScale).toFixed(2)})`
      : 'none';

    // Hover calculation
    const [ph, ps, pl] = this.extractor.rgbToHsl(pr, pg, pb);
    const hoverL = pl > 0.5 ? Math.max(0, pl - 0.08) : Math.min(1, pl + 0.08);
    const [hr, hg, hb] = this.extractor.hslToRgb(ph, ps, hoverL);
    const primaryHover = this.extractor.rgbToHex(hr, hg, hb);

    // Dynamic Heading Gradient depending on preset and extracted colors
    let headingGradient = `linear-gradient(135deg, ${primary} 0%, ${accent} 100%)`;
    let headingFont = `'Plus Jakarta Sans', sans-serif`;
    let headingLetterSpacing = '-0.03em';
    let headingTransform = 'none';

    if (preset.id === 'minimal') {
      headingGradient = `linear-gradient(135deg, ${primary} 0%, ${primary} 100%)`; // Crisp solid monochrome accent
      headingFont = `'Inter', sans-serif`;
      headingLetterSpacing = '-0.01em';
    } else if (preset.id === 'vibrant') {
      headingGradient = `linear-gradient(135deg, ${primary} 0%, ${secondary} 50%, ${accent} 100%)`;
      headingFont = `'Plus Jakarta Sans', sans-serif`;
      headingLetterSpacing = '-0.03em';
    } else if (preset.id === 'warm') {
      headingGradient = `linear-gradient(135deg, ${primary} 0%, #F59E0B 45%, ${accent} 100%)`;
      headingFont = `'Plus Jakarta Sans', sans-serif`;
      headingLetterSpacing = '-0.02em';
    } else if (preset.id === 'cool') {
      headingGradient = `linear-gradient(135deg, ${primary} 0%, #38BDF8 55%, ${secondary} 100%)`;
      headingFont = `'Inter', sans-serif`;
      headingLetterSpacing = '-0.02em';
    } else if (preset.id === 'glass') {
      headingGradient = `linear-gradient(135deg, #FFFFFF 0%, ${primary} 50%, ${accent} 100%)`;
      headingFont = `'Plus Jakarta Sans', sans-serif`;
      headingLetterSpacing = '-0.02em';
    } else if (preset.id === 'cyberpunk') {
      headingGradient = `linear-gradient(90deg, ${primary} 0%, #EC4899 50%, ${accent} 100%)`;
      headingFont = `'JetBrains Mono', monospace`;
      headingLetterSpacing = '0.04em';
      headingTransform = 'uppercase';
    } else if (preset.id === 'neumorphic') {
      headingGradient = `linear-gradient(180deg, ${textPrimary} 20%, ${primary} 100%)`;
      headingFont = `'Plus Jakarta Sans', sans-serif`;
    }

    return {
      '--theme-primary': primary,
      '--theme-primary-hover': primaryHover,
      '--theme-primary-rgb': `${pr}, ${pg}, ${pb}`,
      '--theme-primary-alpha15': `rgba(${pr}, ${pg}, ${pb}, 0.15)`,
      '--theme-primary-alpha25': `rgba(${pr}, ${pg}, ${pb}, 0.25)`,
      '--theme-primary-alpha30': `rgba(${pr}, ${pg}, ${pb}, 0.30)`,
      '--theme-primary-alpha50': `rgba(${pr}, ${pg}, ${pb}, 0.50)`,
      '--theme-primary-text': primaryTextInfo.text,

      '--theme-secondary': secondary,
      '--theme-secondary-rgb': `${sr}, ${sg}, ${sb}`,
      '--theme-secondary-alpha20': `rgba(${sr}, ${sg}, ${sb}, 0.20)`,
      '--theme-secondary-alpha35': `rgba(${sr}, ${sg}, ${sb}, 0.35)`,
      '--theme-secondary-text': secondaryTextInfo.text,

      '--theme-accent': accent,
      '--theme-accent-rgb': `${ar}, ${ag}, ${ab}`,
      '--theme-accent-alpha20': `rgba(${ar}, ${ag}, ${ab}, 0.20)`,
      '--theme-accent-alpha50': `rgba(${ar}, ${ag}, ${ab}, 0.50)`,
      '--theme-accent-text': accentTextInfo.text,

      '--theme-bg': background,
      '--theme-bg-rgb': `${bgr}, ${bgg}, ${bgb}`,
      '--theme-surface-solid': surfaceSolid,
      '--theme-surface': surfaceRgba,
      '--theme-surface-hover': surfaceHoverRgba,
      '--theme-surface-border': surfaceBorder,
      '--theme-primary-border': primaryBorder,

      '--theme-text-primary': textPrimary,
      '--theme-text-secondary': textSecondary,
      '--theme-text-muted': textMuted,

      '--theme-radius': `${adj.borderRadius}px`,
      '--theme-radius-sm': `${Math.max(4, adj.borderRadius - 6)}px`,
      '--theme-radius-lg': `${adj.borderRadius + 8}px`,
      '--theme-radius-pill': '9999px',

      '--theme-blur': `${adj.blur}px`,
      '--theme-overlay-opacity': (adj.overlayOpacity / 100).toFixed(2),
      '--theme-card-glow': cardGlow,
      '--theme-primary-glow': primaryGlow,
      '--theme-shadow': preset.config.shadowStyle || '0 8px 30px rgba(0, 0, 0, 0.25)',

      '--theme-wallpaper': `url("${this.currentWallpaperUrl}")`,

      // Dynamic Heading & Typography
      '--theme-heading-gradient': headingGradient,
      '--theme-heading-font': headingFont,
      '--theme-heading-letter-spacing': headingLetterSpacing,
      '--theme-heading-transform': headingTransform
    };
  }

  applyToDOM() {
    const tokens = this.getTokens();
    const previewEl = document.getElementById('preview-container') || document.documentElement;

    for (const [key, val] of Object.entries(tokens)) {
      previewEl.style.setProperty(key, val);
      document.documentElement.style.setProperty(key, val);
    }

    if (previewEl && previewEl.dataset) {
      previewEl.dataset.themePreset = this.activePresetId;
    }
  }
}
