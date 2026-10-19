/**
 * Export Manager
 * Generates ready-to-use exports: CSS variables, Tailwind config, Design Tokens JSON, and SCSS.
 */

export class ExportManager {
  constructor(themeEngine) {
    this.themeEngine = themeEngine;
  }

  generateCSS() {
    const tokens = this.themeEngine.getTokens();
    const lines = [
      `/* ========================================================`,
      ` * Img2UI Generated Theme Tokens`,
      ` * Preset: ${this.themeEngine.activePresetId.toUpperCase()}`,
      ` * Generated: ${new Date().toISOString()}`,
      ` * ======================================================== */`,
      `:root {`
    ];

    for (const [key, val] of Object.entries(tokens)) {
      if (key !== '--theme-wallpaper') {
        lines.push(`  ${key}: ${val};`);
      }
    }

    lines.push(`}\n`);
    lines.push(`/* Utility Classes */`);
    lines.push(`.btn-primary {`);
    lines.push(`  background-color: var(--theme-primary);`);
    lines.push(`  color: var(--theme-primary-text);`);
    lines.push(`  border-radius: var(--theme-radius);`);
    lines.push(`  box-shadow: var(--theme-primary-glow);`);
    lines.push(`  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);`);
    lines.push(`}`);
    lines.push(`.card-theme {`);
    lines.push(`  background: var(--theme-surface);`);
    lines.push(`  backdrop-filter: blur(var(--theme-blur));`);
    lines.push(`  border: 1px solid var(--theme-surface-border);`);
    lines.push(`  border-radius: var(--theme-radius);`);
    lines.push(`  box-shadow: var(--theme-shadow);`);
    lines.push(`}`);

    return lines.join('\n');
  }

  generateTailwind() {
    const tokens = this.themeEngine.getTokens();
    const config = {
      theme: {
        extend: {
          colors: {
            brand: {
              primary: tokens['--theme-primary'],
              'primary-hover': tokens['--theme-primary-hover'],
              secondary: tokens['--theme-secondary'],
              accent: tokens['--theme-accent'],
              background: tokens['--theme-bg'],
              surface: tokens['--theme-surface-solid']
            },
            text: {
              primary: tokens['--theme-text-primary'],
              secondary: tokens['--theme-text-secondary'],
              muted: tokens['--theme-text-muted']
            }
          },
          borderRadius: {
            theme: tokens['--theme-radius'],
            'theme-sm': tokens['--theme-radius-sm'],
            'theme-lg': tokens['--theme-radius-lg']
          },
          backdropBlur: {
            theme: tokens['--theme-blur']
          },
          boxShadow: {
            'theme-card': tokens['--theme-shadow'],
            'theme-glow': tokens['--theme-primary-glow']
          }
        }
      }
    };

    return `/** @type {import('tailwindcss').Config} */\nmodule.exports = ${JSON.stringify(config, null, 2)};\n`;
  }

  generateJSON() {
    const state = this.themeEngine.getState();
    const tokens = this.themeEngine.getTokens();

    const output = {
      $schema: 'https://design-tokens.github.io/community-group/format/',
      meta: {
        generator: 'Img2UI Theming Engine',
        preset: state.activePresetId,
        date: new Date().toISOString()
      },
      color: {
        primary: { $value: tokens['--theme-primary'], $type: 'color' },
        secondary: { $value: tokens['--theme-secondary'], $type: 'color' },
        accent: { $value: tokens['--theme-accent'], $type: 'color' },
        background: { $value: tokens['--theme-bg'], $type: 'color' },
        surface: { $value: tokens['--theme-surface-solid'], $type: 'color' },
        text: {
          primary: { $value: tokens['--theme-text-primary'], $type: 'color' },
          secondary: { $value: tokens['--theme-text-secondary'], $type: 'color' }
        }
      },
      dimension: {
        radius: { $value: tokens['--theme-radius'], $type: 'dimension' },
        blur: { $value: tokens['--theme-blur'], $type: 'dimension' }
      },
      rawPalette: state.rawPalette.map((c) => ({
        hex: c.hex,
        rgb: c.rgb,
        hsl: c.hsl
      }))
    };

    return JSON.stringify(output, null, 2);
  }

  generateSCSS() {
    const tokens = this.themeEngine.getTokens();
    const lines = [
      `// Img2UI SCSS Theme Tokens`,
      `$theme-primary: ${tokens['--theme-primary']};`,
      `$theme-secondary: ${tokens['--theme-secondary']};`,
      `$theme-accent: ${tokens['--theme-accent']};`,
      `$theme-bg: ${tokens['--theme-bg']};`,
      `$theme-surface: ${tokens['--theme-surface-solid']};`,
      `$theme-text-primary: ${tokens['--theme-text-primary']};`,
      `$theme-text-secondary: ${tokens['--theme-text-secondary']};`,
      `$theme-radius: ${tokens['--theme-radius']};`,
      `$theme-blur: ${tokens['--theme-blur']};`
    ];
    return lines.join('\n');
  }

  downloadFile(content, fileName, mimeType = 'text/plain') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }
}
