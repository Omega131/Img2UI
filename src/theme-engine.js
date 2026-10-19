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
    this.listeners = [];
  }

  /**
   * Subscribe to theme updates
   */
  onChange(fn) {
    this.listeners.push(fn);
  }

  notify() {
    const tokens = this.getTokens();
    const audit = this.contrastChecker.auditTheme(tokens);
    for (const fn of this.listeners) {
      try {
        fn({ tokens, audit, state: this.getState() });
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
      rawPalette: [...this.rawPalette],
      wallpaperUrl: this.currentWallpaperUrl
    };
  }

  /**
   * Set wallpaper image
   */
  setWallpaper(url) {
    this.currentWallpaperUrl = url;
    this.applyToDOM();
    this.notify();
  }

  /**
   * Set active preset mood
   */
  setPreset(presetId) {
    if (!THEME_PRESETS[presetId]) return;
    this.activePresetId = presetId;
    const preset = THEME_PRESETS[presetId];

    // Apply preset baseline adjustments if appropriate
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

  /**
   * Update individual visual adjustment
   */
  setAdjustment(key, value) {
    if (this.adjustments[key] !== undefined) {
      this.adjustments[key] = Number(value);
      this.applyToDOM();
      this.notify();
    }
  }

  /**
   * Reset adjustments to preset defaults
   */
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

  /**
   * Map raw extracted colors into semantic roles
   */
  setPalette(extractedColors) {
    this.rawPalette = extractedColors;
    if (!extractedColors || extractedColors.length === 0) return;

    // Pick colors based on vibrancy, luminance, and contrast
    const sorted = [...extractedColors];

    // Primary: Choose highest vibrancy or most representative accent
    const primaryCandidate = sorted[0]?.hex || '#06B6D4';
    // Secondary: Choose 2nd distinct color
    const secondaryCandidate = sorted[1]?.hex || sorted[0]?.hex || '#8B5CF6';
    // Accent: Choose 3rd or distinct pop
    const accentCandidate = sorted[2]?.hex || sorted[1]?.hex || '#F43F5E';

    // Surface / Background: Find darkest or most muted color for base canvas
    const darkCandidates = [...sorted].sort((a, b) => {
      const lumA = this.extractor.getRelativeLuminance(a.rgb[0], a.rgb[1], a.rgb[2]);
      const lumB = this.extractor.getRelativeLuminance(b.rgb[0], b.rgb[1], b.rgb[2]);
      return lumA - lumB;
    });

    const bgCandidate = darkCandidates[0]?.hex || '#0B0F19';
    // Surface: slightly lighter than background or second darkest
    let surfaceCandidate = darkCandidates[1]?.hex || '#151D2F';

    // Ensure surface is sufficiently distinct from background
    if (this.extractor.getContrastRatio(surfaceCandidate, bgCandidate) < 1.15) {
      const [r, g, b] = this.extractor.hexToRgb(bgCandidate);
      const [h, s, l] = this.extractor.rgbToHsl(r, g, b);
      const newL = Math.min(0.22, l + 0.08);
      const [sr, sg, sb] = this.extractor.hslToRgb(h, s, newL);
      surfaceCandidate = this.extractor.rgbToHex(sr, sg, sb);
    }

    this.colorRoles.primary = primaryCandidate;
    this.colorRoles.secondary = secondaryCandidate;
    this.colorRoles.accent = accentCandidate;
    this.colorRoles.background = bgCandidate;
    this.colorRoles.surface = surfaceCandidate;

    this.applyToDOM();
    this.notify();
  }

  /**
   * Set specific role color manually (e.g. from picker or swatch click)
   */
  setRoleColor(role, hex) {
    if (this.colorRoles[role] !== undefined) {
      this.colorRoles[role] = hex;
      this.applyToDOM();
      this.notify();
    }
  }

  /**
   * Auto-optimize theme for guaranteed WCAG AA / AAA contrast
   */
  autoOptimizeContrast() {
    // 1. Optimize Primary Button text vs Primary color
    const optimalPrimaryText = this.extractor.getOptimalTextColor(this.colorRoles.primary).text;
    this.colorRoles.textPrimary = optimalPrimaryText;

    // 2. Ensure Surface has at least 4.5:1 contrast against headings
    const headingCandidate = '#FFFFFF';
    const surfaceHex = this.colorRoles.surface;
    const ratio = this.extractor.getContrastRatio(headingCandidate, surfaceHex);

    if (ratio < 4.5) {
      // Darken surface
      const [r, g, b] = this.extractor.hexToRgb(surfaceHex);
      let [h, s, l] = this.extractor.rgbToHsl(r, g, b);
      l = Math.max(0.08, l - 0.12);
      const [nr, ng, nb] = this.extractor.hslToRgb(h, s, l);
      this.colorRoles.surface = this.extractor.rgbToHex(nr, ng, nb);
    }

    this.applyToDOM();
    this.notify();
  }

  /**
   * Compute full set of CSS Custom Properties based on current state & adjustments
   */
  getTokens() {
    const preset = THEME_PRESETS[this.activePresetId] || THEME_PRESETS.vibrant;
    const adj = this.adjustments;

    // Apply adjustments to core colors
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
      brightness: Math.max(20, adjOptions.brightness * 0.7) // Keep bg deep & rich
    });
    const surfaceSolid = this.extractor.adjustColor(this.colorRoles.surface, {
      ...adjOptions,
      brightness: Math.max(30, adjOptions.brightness * 0.85)
    });

    // RGB splits for alpha compositing
    const [pr, pg, pb] = this.extractor.hexToRgb(primary);
    const [sr, sg, sb] = this.extractor.hexToRgb(secondary);
    const [ar, ag, ab] = this.extractor.hexToRgb(accent);
    const [bgr, bgg, bgb] = this.extractor.hexToRgb(background);
    const [sfr, sfg, sfb] = this.extractor.hexToRgb(surfaceSolid);

    // Optimal readable text colors for each button / surface
    const primaryTextInfo = this.extractor.getOptimalTextColor(primary);
    const secondaryTextInfo = this.extractor.getOptimalTextColor(secondary);
    const accentTextInfo = this.extractor.getOptimalTextColor(accent);

    // Surface text contrast
    const surfaceLum = this.extractor.getRelativeLuminance(sfr, sfg, sfb);
    const isDarkSurface = surfaceLum < 0.35;

    const textPrimary = isDarkSurface ? '#FFFFFF' : '#0B0F19';
    const textSecondary = isDarkSurface ? 'rgba(255, 255, 255, 0.75)' : 'rgba(15, 23, 42, 0.75)';
    const textMuted = isDarkSurface ? 'rgba(255, 255, 255, 0.48)' : 'rgba(15, 23, 42, 0.48)';

    // Surface alpha & border
    const surfaceAlpha = adj.surfaceOpacity / 100;
    const surfaceRgba = `rgba(${sfr}, ${sfg}, ${sfb}, ${surfaceAlpha.toFixed(2)})`;
    const surfaceHoverRgba = `rgba(${Math.min(255, sfr + 12)}, ${Math.min(255, sfg + 12)}, ${Math.min(255, sfb + 12)}, ${(surfaceAlpha + 0.05).toFixed(2)})`;

    // Border color depending on glass / minimal preset
    const borderAlpha = preset.id === 'glass' ? 0.28 : preset.id === 'minimal' ? 0.12 : 0.18;
    const surfaceBorder = isDarkSurface
      ? `rgba(255, 255, 255, ${borderAlpha})`
      : `rgba(0, 0, 0, ${borderAlpha})`;

    const primaryBorder = `rgba(${pr}, ${pg}, ${pb}, 0.45)`;

    // Glow and shadows
    const glowScale = adj.glowIntensity / 100;
    const cardGlow = glowScale > 0.05
      ? `0 0 ${(30 * glowScale).toFixed(0)}px rgba(${pr}, ${pg}, ${pb}, ${(0.25 * glowScale).toFixed(2)})`
      : 'none';
    const primaryGlow = glowScale > 0.05
      ? `0 8px 24px -4px rgba(${pr}, ${pg}, ${pb}, ${(0.45 * glowScale).toFixed(2)})`
      : 'none';

    // Primary hover calculation
    const [ph, ps, pl] = this.extractor.rgbToHsl(pr, pg, pb);
    const hoverL = pl > 0.5 ? Math.max(0, pl - 0.08) : Math.min(1, pl + 0.08);
    const [hr, hg, hb] = this.extractor.hslToRgb(ph, ps, hoverL);
    const primaryHover = this.extractor.rgbToHex(hr, hg, hb);

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

      '--theme-wallpaper': `url("${this.currentWallpaperUrl}")`
    };
  }

  /**
   * Apply calculated CSS variables to live document elements
   */
  applyToDOM() {
    const tokens = this.getTokens();
    const previewEl = document.getElementById('preview-container') || document.documentElement;

    for (const [key, val] of Object.entries(tokens)) {
      previewEl.style.setProperty(key, val);
      document.documentElement.style.setProperty(key, val);
    }
  }
}
