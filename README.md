# Img2UI — Image-Based Theming Engine & Design System Generator

> **An interactive, real-time theming engine that extracts color palettes from wallpapers and transforms them into cohesive, accessible, production-ready design systems.**

---

## 🌟 Overview

**Img2UI** enables designers and developers to upload any wallpaper, artwork, or screenshot, extract its core chromatic identity, and instantly preview a fully themed, modern web application.

The application bridges the gap between aesthetic inspiration and production code by calculating accessible color contrast, dynamically adapting UI components via CSS custom properties, and exporting ready-to-use tokens for **CSS**, **Tailwind CSS**, **Design Tokens (JSON)**, and **SCSS**.

---

## 🚀 Key Features

### 1. Image Upload & Color Extraction
- **Drag-and-Drop & Clipboard Paste (`Ctrl+V`)**: Upload images directly from your computer or paste them from your clipboard.
- **Curated Wallpaper Library**: Includes 4 high-definition wallpaper presets:
  - *Cyberpunk Neon Metropolis* (Vibrant / Dark)
  - *Sahara Golden Dunes* (Warm / Golden Hour)
  - *Emerald Mist Ancient Woods* (Nature / Organic)
  - *Arctic Twilight Glaciers* (Cool / Minimal)
- **Multiple Palette Extraction Algorithms**:
  - **Vibrant & Accent**: Identifies high-chroma, aesthetically dominant accent colors while maintaining luminance balance.
  - **K-Means Clustering**: Unsupervised vector quantization in RGB color space with k-means++ seeding to find true cluster centroids.
  - **Median Cut (Color Thief)**: Quantization algorithm splitting color bounding boxes along largest channel ranges.
  - **Pastel & Muted**: Filters for soft, harmonious, low-saturation tones.
- **Precision Color Sampling (EyeDropper)**: Native `window.EyeDropper` API integration and canvas-based pixel sampling to inspect and extract colors directly from wallpapers.

### 2. Predefined Theme Presets & Moods
Each preset modifies token distribution, border styles, elevation, and opacity across all components:
- **Minimal**: Understated, high whitespace, clean 1px borders, maximum legibility.
- **Vibrant**: High saturation, bold gradients, glowing borders and interactive buttons.
- **Warm**: Amber, terracotta, peach horizon tones, and coffee/cream undertones.
- **Cool**: Icy blues, deep teals, slate tones, and crisp cold accents.
- **Glass**: Glassmorphism with heavy backdrop blur (`backdrop-filter: blur(...)`), translucent frosted surfaces, and specular highlights.
- **Cyberpunk Dark**: Obsidian midnight backdrop with electric cyan/magenta neon rim glow.
- **Neumorphic Soft**: Tactile dual-shadow embossed surfaces and soft extruded cards.

### 3. Real-Time Visual Adjustments
Interactive sliders to fine-tune visual parameters with instantaneous live updates:
- **Saturation** (0% – 200%)
- **Brightness** (50% – 150%)
- **Contrast** (50% – 150%)
- **Background Blur** (0px – 40px)
- **Overlay Tint Opacity** (0% – 95%)
- **Hue / Temperature Shift** (-180° – +180°)
- **Card Surface Opacity** (10% – 100%)
- **Border Radius** (0px – 28px)
- **Glow & Shadow Intensity** (0% – 100%)

### 4. Accessibility-Aware Color Selection & WCAG 2.1 Auditor
- Real-time **WCAG 2.1 Contrast Ratio** calculations:
  - Primary button text vs background
  - Secondary button text vs background
  - Heading text vs surface
  - Body text vs surface
- Visual audit badges: **AAA Pass (≥ 7:1)**, **AA Pass (≥ 4.5:1)**, **AA Large Only (≥ 3:1)**, and **Fail**.
- **Auto-Fix Contrast**: One-click intelligent lightness optimizer that adjusts color luminance to guarantee WCAG AA / AAA compliance while preserving base hue.

### 5. Themed UI Component Showcase
The preview canvas simulates a real-world SaaS Dashboard & Media Player application:
- **Navigation Bar**: Themed brand mark, navigation links, and user profile pill.
- **Hero Header**: Primary heading with dynamic gradient accent, secondary body text, primary CTA with micro-glow, and secondary outline button.
- **KPI Stats Cards**: Metric counters ($84,230 revenue, 19,420 users, 99.94% SLA), growth trend pills, and animated gradient progress tracks.
- **Form Elements**: Search inputs, custom toggles, styled checkboxes, category chips, and button hierarchy states (Normal, Hover, Active).
- **Interactive Audio Player**: Album artwork, track metadata, and dynamic animated audio waveform bars.
- **Multi-Device Viewport**: Toggle between **Desktop**, **Tablet (768px)**, and **Mobile Phone Mockup (with Dynamic Island)**.

### 6. Design Token Export
- **CSS Custom Properties**: `:root` variables and utility classes.
- **Tailwind CSS**: Complete `tailwind.config.js` color and styling theme extension.
- **Design Tokens JSON**: W3C Design Tokens Community Group compliant JSON.
- **SCSS**: SASS variable definitions.
- One-click copy with toast notifications and direct file downloads.

---

## 🛠️ Architecture & Implementation

### Directory Structure

```
Img2UI/
├── public/
│   └── wallpapers/
│       ├── cyberpunk.jpg
│       ├── sunset.jpg
│       ├── forest.jpg
│       └── glacier.jpg
├── src/
│   ├── color-extractor.js    # Canvas-based K-Means, Median Cut, and Vibrant extraction
│   ├── presets.js            # Theme mood definitions and style configurations
│   ├── sample-wallpapers.js  # Curated wallpaper metadata
│   ├── contrast-checker.js   # WCAG 2.1 relative luminance and contrast auditor
│   ├── theme-engine.js       # Central token manager and DOM variable synchronizer
│   ├── export-manager.js     # Exporter for CSS, Tailwind, JSON, and SCSS
│   ├── style.css             # Vanilla CSS design system and theme tokens
│   └── app.js                # Main application controller and event bindings
├── index.html                # Application shell and UI component layout
├── package.json
└── README.md
```

### Color Extraction Approach

1. **Downsampling & Filtering**: The uploaded image is drawn to an offscreen HTML5 `<canvas>` scaled down to a maximum dimension of 150px. Transparent pixels (alpha < 128) are filtered out.
2. **K-Means Clustering**: Using the k-means++ initialization algorithm, seed centroids are chosen probabilistically based on squared Euclidean distance. Clusters undergo iterative barycentric centroid recalculation until convergence.
3. **Median Cut (Color Thief)**: Recursively splits color bounding boxes along the channel with the widest variation until the target box count is reached, returning the arithmetic mean color of each box.
4. **Vibrant & Accent Selection**: Calculates colorfulness $C$ and relative luminance $Y = 0.2126R + 0.7152G + 0.0722B$ to select colors with high saturation and moderate lightness, ensuring distinct hues.

### Theme Generation & Token Consistency

The engine manages a single source of truth for design tokens. When any wallpaper, preset, or visual slider changes:
1. Base colors are transformed through saturation, brightness, contrast, and hue rotation matrices.
2. Derived tokens (hover states, alpha transparencies, focus rings, and elevation glows) are recalculated.
3. CSS variables (`--theme-primary`, `--theme-surface`, `--theme-radius`, etc.) are injected into the document root.
4. All UI components update simultaneously through pure CSS custom property cascading, guaranteeing 100% theme consistency.

---

## 💻 Getting Started Locally

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Omega131/Img2UI.git
   cd Img2UI
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```
   Open `http://127.0.0.1:5173/` in your browser.

4. Build for production:
   ```bash
   npm run build
   ```

---

## 🎨 Technologies Used

- **HTML5 & Vanilla JavaScript (ES Modules)**: Modern, lightweight, framework-free architecture.
- **Vanilla CSS3**: Modern design system utilizing CSS Custom Properties, flexbox, CSS grid, and backdrop filters.
- **Vite**: Ultra-fast development server and production bundler.
- **HTML5 Canvas API**: High-performance pixel manipulation and color quantization.
- **Web APIs**: `EyeDropper API`, `FileReader API`, `Clipboard API`.

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.