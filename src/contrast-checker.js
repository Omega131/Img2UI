/**
 * Accessibility & WCAG 2.1 Contrast Checker
 * Validates text legibility, color contrast ratios, and provides auto-fix adjustments.
 */

export class ContrastChecker {
  constructor(colorExtractor) {
    this.extractor = colorExtractor;
  }

  /**
   * Evaluate contrast between two colors and return rating
   */
  evaluate(foregroundHex, backgroundHex) {
    const ratio = this.extractor.getContrastRatio(foregroundHex, backgroundHex);
    const rounded = Math.round(ratio * 100) / 100;

    const passesAANormal = ratio >= 4.5;
    const passesAALarge = ratio >= 3.0;
    const passesAAANormal = ratio >= 7.0;
    const passesAAALarge = ratio >= 4.5;

    let level = 'FAIL';
    let statusClass = 'contrast-fail';
    let label = 'Fails WCAG';

    if (passesAAANormal) {
      level = 'AAA';
      statusClass = 'contrast-aaa';
      label = 'AAA Pass';
    } else if (passesAANormal) {
      level = 'AA';
      statusClass = 'contrast-aa';
      label = 'AA Pass';
    } else if (passesAALarge) {
      level = 'AA Large';
      statusClass = 'contrast-aa-large';
      label = 'AA Large Only';
    }

    return {
      ratio: rounded,
      ratioText: `${rounded}:1`,
      level,
      statusClass,
      label,
      passesAANormal,
      passesAALarge,
      passesAAANormal,
      passesAAALarge
    };
  }

  /**
   * Run full audit on current theme tokens
   */
  auditTheme(themeTokens) {
    return {
      primaryBtn: {
        name: 'Primary Button',
        fg: themeTokens['--theme-primary-text'],
        bg: themeTokens['--theme-primary'],
        ...this.evaluate(themeTokens['--theme-primary-text'], themeTokens['--theme-primary'])
      },
      secondaryBtn: {
        name: 'Secondary Button',
        fg: themeTokens['--theme-secondary-text'],
        bg: themeTokens['--theme-secondary'],
        ...this.evaluate(themeTokens['--theme-secondary-text'], themeTokens['--theme-secondary'])
      },
      headingText: {
        name: 'Primary Heading on Surface',
        fg: themeTokens['--theme-text-primary'],
        bg: themeTokens['--theme-surface-solid'] || themeTokens['--theme-surface'],
        ...this.evaluate(themeTokens['--theme-text-primary'], themeTokens['--theme-surface-solid'] || themeTokens['--theme-surface'])
      },
      bodyText: {
        name: 'Body Text on Surface',
        fg: themeTokens['--theme-text-secondary'],
        bg: themeTokens['--theme-surface-solid'] || themeTokens['--theme-surface'],
        ...this.evaluate(themeTokens['--theme-text-secondary'], themeTokens['--theme-surface-solid'] || themeTokens['--theme-surface'])
      },
      accentBadge: {
        name: 'Accent Badge',
        fg: themeTokens['--theme-accent-text'],
        bg: themeTokens['--theme-accent'],
        ...this.evaluate(themeTokens['--theme-accent-text'], themeTokens['--theme-accent'])
      }
    };
  }

  /**
   * Automatically optimize color lightness to reach target contrast (default 4.5:1 for AA)
   */
  optimizeForContrast(fgHex, bgHex, targetRatio = 4.5) {
    let currentRatio = this.extractor.getContrastRatio(fgHex, bgHex);
    if (currentRatio >= targetRatio) return fgHex;

    const [r, g, b] = this.extractor.hexToRgb(fgHex);
    let [h, s, l] = this.extractor.rgbToHsl(r, g, b);

    const bgRgb = this.extractor.hexToRgb(bgHex);
    const bgLum = this.extractor.getRelativeLuminance(bgRgb[0], bgRgb[1], bgRgb[2]);

    // If background is dark, increase lightness; if background is bright, decrease lightness
    const shouldLighten = bgLum < 0.5;

    for (let step = 0; step < 40; step++) {
      if (shouldLighten) {
        l = Math.min(1.0, l + 0.02);
      } else {
        l = Math.max(0.0, l - 0.02);
      }

      const [newR, newG, newB] = this.extractor.hslToRgb(h, s, l);
      const testHex = this.extractor.rgbToHex(newR, newG, newB);
      const newRatio = this.extractor.getContrastRatio(testHex, bgHex);

      if (newRatio >= targetRatio) {
        return testHex;
      }
    }

    // Fallback to pure white or dark slate if color cannot reach ratio
    return shouldLighten ? '#FFFFFF' : '#0B0F19';
  }
}
