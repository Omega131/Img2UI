/**
 * Color Extractor Engine
 * Supports K-Means Clustering, Median Cut (Quantization), Vibrant Accent extraction,
 * and interactive pixel sampling with WCAG contrast math.
 */

export class ColorExtractor {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
  }

  /**
   * Load image and return HTMLImageElement
   */
  loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(new Error('Failed to load image: ' + err));
      img.src = src;
    });
  }

  /**
   * Extract image pixels downsampled for fast clustering
   */
  getPixels(img, maxDimension = 150) {
    let width = img.naturalWidth || img.width;
    let height = img.naturalHeight || img.height;

    if (width > maxDimension || height > maxDimension) {
      if (width > height) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }
    }

    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx.clearRect(0, 0, width, height);
    this.ctx.drawImage(img, 0, 0, width, height);

    const imageData = this.ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const pixels = [];

    // Step through pixels, skip transparent or near-black/near-white extremes if needed
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      if (a < 128) continue; // Skip transparent
      pixels.push([r, g, b]);
    }

    return { pixels, width, height };
  }

  /**
   * Color Extraction via K-Means Clustering
   */
  extractKMeans(pixels, k = 6, maxIterations = 12) {
    if (pixels.length === 0) return [];

    // K-Means++ Initialization
    const centroids = [];
    centroids.push(pixels[Math.floor(Math.random() * pixels.length)]);

    while (centroids.length < k) {
      const distances = pixels.map((p) => {
        let minDist = Infinity;
        for (const c of centroids) {
          const d = this.colorDistanceSq(p, c);
          if (d < minDist) minDist = d;
        }
        return minDist;
      });

      const sumDist = distances.reduce((a, b) => a + b, 0);
      let rand = Math.random() * sumDist;
      let nextCentroid = pixels[0];

      for (let i = 0; i < pixels.length; i++) {
        rand -= distances[i];
        if (rand <= 0) {
          nextCentroid = pixels[i];
          break;
        }
      }
      centroids.push(nextCentroid);
    }

    // Iterative refinement
    let clusters = Array.from({ length: k }, () => []);

    for (let iter = 0; iter < maxIterations; iter++) {
      clusters = Array.from({ length: k }, () => []);

      for (let i = 0; i < pixels.length; i++) {
        const p = pixels[i];
        let minDist = Infinity;
        let bestCluster = 0;

        for (let j = 0; j < k; j++) {
          const d = this.colorDistanceSq(p, centroids[j]);
          if (d < minDist) {
            minDist = d;
            bestCluster = j;
          }
        }
        clusters[bestCluster].push(p);
      }

      let changed = false;
      for (let j = 0; j < k; j++) {
        if (clusters[j].length === 0) continue;
        let sumR = 0, sumG = 0, sumB = 0;
        for (const p of clusters[j]) {
          sumR += p[0];
          sumG += p[1];
          sumB += p[2];
        }
        const newC = [
          Math.round(sumR / clusters[j].length),
          Math.round(sumG / clusters[j].length),
          Math.round(sumB / clusters[j].length)
        ];
        if (this.colorDistanceSq(newC, centroids[j]) > 4) {
          centroids[j] = newC;
          changed = true;
        }
      }

      if (!changed) break;
    }

    // Sort clusters by size (dominance)
    const sortedCentroids = centroids
      .map((c, idx) => ({
        rgb: c,
        hex: this.rgbToHex(c[0], c[1], c[2]),
        hsl: this.rgbToHsl(c[0], c[1], c[2]),
        count: clusters[idx].length,
        populationRatio: clusters[idx].length / pixels.length
      }))
      .sort((a, b) => b.count - a.count);

    return sortedCentroids;
  }

  /**
   * Color Extraction via Median Cut (Quantization)
   */
  extractMedianCut(pixels, targetCount = 6) {
    if (pixels.length === 0) return [];

    let boxes = [{ pixels }];

    while (boxes.length < targetCount) {
      let largestBoxIndex = -1;
      let largestRange = -1;
      let splitChannel = 0;

      for (let i = 0; i < boxes.length; i++) {
        const box = boxes[i];
        if (box.pixels.length <= 1) continue;

        let minR = 255, maxR = 0;
        let minG = 255, maxG = 0;
        let minB = 255, maxB = 0;

        for (const p of box.pixels) {
          if (p[0] < minR) minR = p[0];
          if (p[0] > maxR) maxR = p[0];
          if (p[1] < minG) minG = p[1];
          if (p[1] > maxG) maxG = p[1];
          if (p[2] < minB) minB = p[2];
          if (p[2] > maxB) maxB = p[2];
        }

        const rangeR = maxR - minR;
        const rangeG = maxG - minG;
        const rangeB = maxB - minB;
        const maxBoxRange = Math.max(rangeR, rangeG, rangeB);

        if (maxBoxRange > largestRange) {
          largestRange = maxBoxRange;
          largestBoxIndex = i;
          splitChannel = rangeR === maxBoxRange ? 0 : rangeG === maxBoxRange ? 1 : 2;
        }
      }

      if (largestBoxIndex === -1) break;

      const boxToSplit = boxes.splice(largestBoxIndex, 1)[0];
      boxToSplit.pixels.sort((a, b) => a[splitChannel] - b[splitChannel]);
      const median = Math.floor(boxToSplit.pixels.length / 2);

      boxes.push({ pixels: boxToSplit.pixels.slice(0, median) });
      boxes.push({ pixels: boxToSplit.pixels.slice(median) });
    }

    return boxes.map((box) => {
      let sumR = 0, sumG = 0, sumB = 0;
      for (const p of box.pixels) {
        sumR += p[0];
        sumG += p[1];
        sumB += p[2];
      }
      const count = box.pixels.length || 1;
      const rgb = [
        Math.round(sumR / count),
        Math.round(sumG / count),
        Math.round(sumB / count)
      ];
      return {
        rgb,
        hex: this.rgbToHex(rgb[0], rgb[1], rgb[2]),
        hsl: this.rgbToHsl(rgb[0], rgb[1], rgb[2]),
        count: box.pixels.length,
        populationRatio: box.pixels.length / pixels.length
      };
    }).sort((a, b) => b.count - a.count);
  }

  /**
   * Color Extraction via Vibrant / Chroma Accent selection
   */
  extractVibrant(pixels, targetCount = 6) {
    const kMeansPalette = this.extractKMeans(pixels, Math.max(targetCount * 2, 12));

    // Calculate saturation & colorfulness for each
    const scored = kMeansPalette.map((item) => {
      const [h, s, l] = item.hsl;
      const lum = this.getRelativeLuminance(item.rgb[0], item.rgb[1], item.rgb[2]);
      
      // Chroma score: prefer saturated colors with moderate lightness
      const chromaScore = s * (1 - Math.abs(l - 0.5) * 1.5);
      return {
        ...item,
        score: chromaScore + item.populationRatio * 0.3,
        lum
      };
    });

    // Sort by chroma score descending
    scored.sort((a, b) => b.score - a.score);

    // Pick diverse colors (avoid selecting colors that are too similar in hue)
    const selected = [];
    for (const color of scored) {
      const isTooClose = selected.some((s) => {
        const hueDiff = Math.abs(s.hsl[0] - color.hsl[0]);
        const dist = this.colorDistanceSq(s.rgb, color.rgb);
        return dist < 1200 || (Math.min(hueDiff, 360 - hueDiff) < 18 && Math.abs(s.hsl[1] - color.hsl[1]) < 0.2);
      });

      if (!isTooClose || selected.length < 2) {
        selected.push(color);
      }
      if (selected.length >= targetCount) break;
    }

    // Fill remaining if needed
    for (const color of scored) {
      if (selected.length >= targetCount) break;
      if (!selected.includes(color)) {
        selected.push(color);
      }
    }

    return selected;
  }

  /**
   * Color Extraction via Pastel / Soft selection
   */
  extractPastel(pixels, targetCount = 6) {
    const raw = this.extractKMeans(pixels, targetCount * 2);
    // Prefer colors with moderate to high lightness and subtle saturation
    const soft = raw.map((item) => {
      const [h, s, l] = item.hsl;
      // Softness score: penalize extreme darks or harsh neon
      const score = 1 - Math.abs(l - 0.7) - Math.max(0, s - 0.6) * 1.2;
      return { ...item, score };
    }).sort((a, b) => b.score - a.score);

    return soft.slice(0, targetCount);
  }

  /**
   * Extract palette according to chosen strategy
   */
  extract(img, strategy = 'vibrant', count = 6) {
    const { pixels } = this.getPixels(img);
    if (!pixels || pixels.length === 0) return [];

    switch (strategy) {
      case 'kmeans':
        return this.extractKMeans(pixels, count);
      case 'mediancut':
        return this.extractMedianCut(pixels, count);
      case 'pastel':
        return this.extractPastel(pixels, count);
      case 'vibrant':
      default:
        return this.extractVibrant(pixels, count);
    }
  }

  /**
   * Sample single pixel color from an Image or Canvas at exact coordinate
   */
  samplePixel(img, xRatio, yRatio) {
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;

    this.canvas.width = 1;
    this.canvas.height = 1;
    const sx = Math.max(0, Math.min(w - 1, Math.round(xRatio * w)));
    const sy = Math.max(0, Math.min(h - 1, Math.round(yRatio * h)));

    this.ctx.clearRect(0, 0, 1, 1);
    this.ctx.drawImage(img, sx, sy, 1, 1, 0, 0, 1, 1);
    const pixel = this.ctx.getImageData(0, 0, 1, 1).data;

    const rgb = [pixel[0], pixel[1], pixel[2]];
    return {
      rgb,
      hex: this.rgbToHex(rgb[0], rgb[1], rgb[2]),
      hsl: this.rgbToHsl(rgb[0], rgb[1], rgb[2])
    };
  }

  /* ================== MATH & CONVERSION UTILITIES ================== */

  colorDistanceSq(c1, c2) {
    const dr = c1[0] - c2[0];
    const dg = c1[1] - c2[1];
    const db = c1[2] - c2[2];
    // Weighted Euclidean for human perception (redmean approximation)
    const rMean = (c1[0] + c2[0]) / 2;
    return (2 + rMean / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rMean) / 256) * db * db;
  }

  rgbToHex(r, g, b) {
    const toHex = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  }

  hexToRgb(hex) {
    let clean = hex.replace('#', '').trim();
    if (clean.length === 3) {
      clean = clean.split('').map((c) => c + c).join('');
    }
    const num = parseInt(clean, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  }

  rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return [Math.round(h * 360), Math.round(s * 100) / 100, Math.round(l * 100) / 100];
  }

  hslToRgb(h, s, l) {
    h = (h % 360 + 360) % 360 / 360;
    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  /**
   * WCAG 2.1 Relative Luminance
   */
  getRelativeLuminance(r, g, b) {
    const a = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }

  /**
   * WCAG 2.1 Contrast Ratio between two RGB arrays or Hex strings
   */
  getContrastRatio(color1, color2) {
    const rgb1 = typeof color1 === 'string' ? this.hexToRgb(color1) : color1;
    const rgb2 = typeof color2 === 'string' ? this.hexToRgb(color2) : color2;

    const l1 = this.getRelativeLuminance(rgb1[0], rgb1[1], rgb1[2]);
    const l2 = this.getRelativeLuminance(rgb2[0], rgb2[1], rgb2[2]);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Determine whether white (#FFFFFF) or dark (#0F172A) text provides better contrast
   */
  getOptimalTextColor(bgHex) {
    const rgb = this.hexToRgb(bgHex);
    const lum = this.getRelativeLuminance(rgb[0], rgb[1], rgb[2]);
    
    // Contrast with white: (1.0 + 0.05) / (lum + 0.05)
    // Contrast with dark: (lum + 0.05) / (0.005 + 0.05)
    const contrastWhite = 1.05 / (lum + 0.05);
    const contrastDark = (lum + 0.05) / 0.055;

    if (contrastWhite >= contrastDark) {
      return { text: '#FFFFFF', contrast: contrastWhite, isDark: false };
    } else {
      return { text: '#090D16', contrast: contrastDark, isDark: true };
    }
  }

  /**
   * Adjust color values (saturation, brightness, contrast, hue)
   */
  adjustColor(hex, { saturation = 100, brightness = 100, contrast = 100, hueShift = 0 }) {
    const [r, g, b] = this.hexToRgb(hex);
    let [h, s, l] = this.rgbToHsl(r, g, b);

    // Hue shift
    h = (h + hueShift) % 360;
    if (h < 0) h += 360;

    // Saturation scale
    s = Math.max(0, Math.min(1, s * (saturation / 100)));

    // Brightness scale
    l = Math.max(0, Math.min(1, l * (brightness / 100)));

    // Contrast adjustment centered at 0.5
    if (contrast !== 100) {
      const factor = contrast / 100;
      l = Math.max(0, Math.min(1, 0.5 + (l - 0.5) * factor));
    }

    const [newR, newG, newB] = this.hslToRgb(h, s, l);
    return this.rgbToHex(newR, newG, newB);
  }
}
