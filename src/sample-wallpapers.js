/**
 * Curated Preloaded Wallpaper Presets
 */

const base = import.meta.env.BASE_URL || './';

export const SAMPLE_WALLPAPERS = [
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon Metropolis',
    category: 'Vibrant / Dark',
    recommendedPreset: 'cyberpunk',
    url: `${base}wallpapers/cyberpunk.jpg`,
    thumbnail: `${base}wallpapers/cyberpunk.jpg`,
    description: 'Electric cyan, hot magenta, violet and deep obsidian street reflections.'
  },
  {
    id: 'sunset',
    name: 'Sahara Golden Dunes',
    category: 'Warm / Golden Hour',
    recommendedPreset: 'warm',
    url: `${base}wallpapers/sunset.jpg`,
    thumbnail: `${base}wallpapers/sunset.jpg`,
    description: 'Warm glowing amber, terracotta, peach horizon and deep desert shadows.'
  },
  {
    id: 'forest',
    name: 'Emerald Mist Ancient Woods',
    category: 'Nature / Organic',
    recommendedPreset: 'minimal',
    url: `${base}wallpapers/forest.jpg`,
    thumbnail: `${base}wallpapers/forest.jpg`,
    description: 'Lush moss, deep jade green, morning sunbeams and organic serenity.'
  },
  {
    id: 'glacier',
    name: 'Arctic Twilight Glaciers',
    category: 'Cool / Minimal',
    recommendedPreset: 'cool',
    url: `${base}wallpapers/glacier.jpg`,
    thumbnail: `${base}wallpapers/glacier.jpg`,
    description: 'Icy azure reflections, cobalt mountain ridges and starry cosmic sky.'
  }
];
