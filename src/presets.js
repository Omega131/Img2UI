/**
 * Theme Presets / Moods Configuration
 * Modifies how extracted colors and visual tokens are mapped across UI components.
 */

export const THEME_PRESETS = {
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean, understated, high whitespace, subtle 1px borders, high legibility.',
    badge: 'Clean & Muted',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 3v18"/></svg>`,
    config: {
      saturationMultiplier: 0.75,
      contrastMultiplier: 1.05,
      surfaceOpacity: 0.94,
      backgroundBlur: 4,
      overlayOpacity: 0.75,
      borderRadius: '8px',
      borderWidth: '1px',
      borderStyle: 'solid',
      shadowStyle: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
      cardGlow: 'none',
      buttonTransform: 'none',
      primaryGradient: false,
      accentGlow: 'none',
      glassmorphism: false,
      bgToneShift: 0,
      lightnessOffsetSurface: 0.04,
      lightnessOffsetBg: -0.05
    }
  },

  vibrant: {
    id: 'vibrant',
    name: 'Vibrant',
    description: 'High saturation, bold contrast, energetic glowing accents, striking gradients.',
    badge: 'Bold & Punchy',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>`,
    config: {
      saturationMultiplier: 1.35,
      contrastMultiplier: 1.15,
      surfaceOpacity: 0.82,
      backgroundBlur: 14,
      overlayOpacity: 0.45,
      borderRadius: '16px',
      borderWidth: '1px',
      borderStyle: 'solid',
      shadowStyle: '0 10px 30px -10px var(--theme-primary-alpha30), 0 4px 6px -2px rgba(0,0,0,0.2)',
      cardGlow: '0 0 35px var(--theme-primary-alpha15)',
      buttonTransform: 'translateY(-1px)',
      primaryGradient: true,
      accentGlow: '0 0 20px var(--theme-accent-alpha50)',
      glassmorphism: false,
      bgToneShift: 0,
      lightnessOffsetSurface: 0.06,
      lightnessOffsetBg: -0.08
    }
  },

  warm: {
    id: 'warm',
    name: 'Warm',
    description: 'Amber, peach, terracotta, soft warm highlights and rich coffee/cream undertones.',
    badge: 'Golden & Cozy',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`,
    config: {
      saturationMultiplier: 1.1,
      contrastMultiplier: 1.0,
      surfaceOpacity: 0.88,
      backgroundBlur: 10,
      overlayOpacity: 0.5,
      borderRadius: '14px',
      borderWidth: '1px',
      borderStyle: 'solid',
      shadowStyle: '0 12px 28px rgba(180, 83, 9, 0.12), 0 2px 4px rgba(0,0,0,0.06)',
      cardGlow: '0 0 25px rgba(245, 158, 11, 0.12)',
      buttonTransform: 'none',
      primaryGradient: true,
      accentGlow: '0 0 15px rgba(251, 146, 60, 0.35)',
      glassmorphism: false,
      bgToneShift: 24, // Hue shift towards warm amber
      lightnessOffsetSurface: 0.05,
      lightnessOffsetBg: -0.06
    }
  },

  cool: {
    id: 'cool',
    name: 'Cool',
    description: 'Icy blues, deep teals, slate tones, crisp cold accents and fresh air clarity.',
    badge: 'Arctic & Crisp',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07 19.07 4.93"/></svg>`,
    config: {
      saturationMultiplier: 1.05,
      contrastMultiplier: 1.08,
      surfaceOpacity: 0.86,
      backgroundBlur: 12,
      overlayOpacity: 0.52,
      borderRadius: '10px',
      borderWidth: '1px',
      borderStyle: 'solid',
      shadowStyle: '0 10px 25px rgba(14, 165, 233, 0.14), 0 2px 6px rgba(0,0,0,0.1)',
      cardGlow: '0 0 25px rgba(56, 189, 248, 0.15)',
      buttonTransform: 'none',
      primaryGradient: true,
      accentGlow: '0 0 18px rgba(56, 189, 248, 0.4)',
      glassmorphism: false,
      bgToneShift: -25, // Hue shift towards cool cyan/blue
      lightnessOffsetSurface: 0.04,
      lightnessOffsetBg: -0.07
    }
  },

  glass: {
    id: 'glass',
    name: 'Glass',
    description: 'Ultra-frosted glassmorphism, heavy backdrop blur, luminous specular borders.',
    badge: 'Frosted Glass',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="4"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>`,
    config: {
      saturationMultiplier: 1.15,
      contrastMultiplier: 1.1,
      surfaceOpacity: 0.38,
      backgroundBlur: 22,
      overlayOpacity: 0.35,
      borderRadius: '18px',
      borderWidth: '1px',
      borderStyle: 'solid',
      shadowStyle: '0 16px 40px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
      cardGlow: '0 0 35px var(--theme-primary-alpha20)',
      buttonTransform: 'none',
      primaryGradient: true,
      accentGlow: '0 0 20px var(--theme-primary-alpha40)',
      glassmorphism: true,
      bgToneShift: 0,
      lightnessOffsetSurface: 0.1,
      lightnessOffsetBg: -0.05
    }
  },

  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'Obsidian midnight canvas, neon rim lighting, electric glowing accents.',
    badge: 'Neon Synth',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>`,
    config: {
      saturationMultiplier: 1.5,
      contrastMultiplier: 1.3,
      surfaceOpacity: 0.78,
      backgroundBlur: 16,
      overlayOpacity: 0.65,
      borderRadius: '8px',
      borderWidth: '1.5px',
      borderStyle: 'solid',
      shadowStyle: '0 0 20px var(--theme-primary-alpha40), inset 0 0 12px var(--theme-accent-alpha15)',
      cardGlow: '0 0 30px var(--theme-primary-alpha30)',
      buttonTransform: 'translateY(-2px)',
      primaryGradient: true,
      accentGlow: '0 0 25px var(--theme-accent)',
      glassmorphism: false,
      bgToneShift: 0,
      lightnessOffsetSurface: 0.03,
      lightnessOffsetBg: -0.15
    }
  },

  neumorphic: {
    id: 'neumorphic',
    name: 'Neumorphic',
    description: 'Tactile dual-shadow embossed surfaces, smooth extruded cards, organic feel.',
    badge: 'Soft UI',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="20" x="2" y="2" rx="5"/><circle cx="12" cy="12" r="3"/></svg>`,
    config: {
      saturationMultiplier: 0.85,
      contrastMultiplier: 0.95,
      surfaceOpacity: 0.96,
      backgroundBlur: 6,
      overlayOpacity: 0.85,
      borderRadius: '20px',
      borderWidth: '1px',
      borderStyle: 'solid',
      shadowStyle: '8px 8px 18px rgba(0, 0, 0, 0.25), -6px -6px 14px rgba(255, 255, 255, 0.05)',
      cardGlow: 'none',
      buttonTransform: 'translateY(1px)',
      primaryGradient: false,
      accentGlow: 'none',
      glassmorphism: false,
      bgToneShift: 0,
      lightnessOffsetSurface: 0.05,
      lightnessOffsetBg: -0.04
    }
  }
};
