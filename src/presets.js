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
  },

  aurora: {
    id: 'aurora',
    name: 'Aurora',
    description: 'Ethereal northern lights, spectral emerald-cyan glows, and deep oceanic indigo canvas.',
    badge: 'Boreal Aura',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12c3-4 6-4 9 0s6 4 9 0"/><path d="M2 7c3-3 6-3 9 0s6 3 9 0"/><path d="M2 17c3-3 6-3 9 0s6 3 9 0"/></svg>`,
    config: {
      saturationMultiplier: 1.4,
      contrastMultiplier: 1.2,
      surfaceOpacity: 0.72,
      backgroundBlur: 20,
      overlayOpacity: 0.50,
      borderRadius: '16px',
      borderWidth: '1.5px',
      borderStyle: 'solid',
      shadowStyle: '0 14px 35px -8px rgba(6, 182, 212, 0.35), 0 0 25px rgba(16, 185, 129, 0.2)',
      cardGlow: '0 0 35px rgba(6, 182, 212, 0.3)',
      buttonTransform: 'translateY(-1px)',
      primaryGradient: true,
      accentGlow: '0 0 24px rgba(16, 185, 129, 0.5)',
      glassmorphism: true,
      bgToneShift: -15,
      lightnessOffsetSurface: 0.05,
      lightnessOffsetBg: -0.12
    }
  },

  luxe: {
    id: 'luxe',
    name: 'Obsidian Luxe',
    description: 'Opulent obsidian canvas, champagne gold metallic accents, and refined executive elevation.',
    badge: 'Executive Gold',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    config: {
      saturationMultiplier: 0.95,
      contrastMultiplier: 1.25,
      surfaceOpacity: 0.92,
      backgroundBlur: 8,
      overlayOpacity: 0.78,
      borderRadius: '10px',
      borderWidth: '1px',
      borderStyle: 'solid',
      shadowStyle: '0 18px 45px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(212, 175, 55, 0.28)',
      cardGlow: '0 0 25px rgba(212, 175, 55, 0.18)',
      buttonTransform: 'translateY(-1px)',
      primaryGradient: true,
      accentGlow: '0 0 20px rgba(212, 175, 55, 0.4)',
      glassmorphism: false,
      bgToneShift: 18,
      lightnessOffsetSurface: 0.04,
      lightnessOffsetBg: -0.16
    }
  },

  retrowave: {
    id: 'retrowave',
    name: 'Retrowave',
    description: '80s outrun vaporwave: hot magenta, solar sunset orange, and electric neon arcade punch.',
    badge: '80s Outrun',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="3.5" y1="16" x2="20.5" y2="16"/><line x1="6" y1="19.5" x2="18" y2="19.5"/></svg>`,
    config: {
      saturationMultiplier: 1.6,
      contrastMultiplier: 1.35,
      surfaceOpacity: 0.85,
      backgroundBlur: 14,
      overlayOpacity: 0.58,
      borderRadius: '6px',
      borderWidth: '2px',
      borderStyle: 'solid',
      shadowStyle: '0 0 28px rgba(236, 72, 153, 0.45), 0 12px 32px rgba(0,0,0,0.6)',
      cardGlow: '0 0 35px rgba(244, 63, 94, 0.4)',
      buttonTransform: 'translateY(-2px) scale(1.02)',
      primaryGradient: true,
      accentGlow: '0 0 30px rgba(249, 115, 22, 0.65)',
      glassmorphism: false,
      bgToneShift: 30,
      lightnessOffsetSurface: 0.03,
      lightnessOffsetBg: -0.14
    }
  },

  brutalist: {
    id: 'brutalist',
    name: 'Neo-Brutalist',
    description: 'Raw geometric architecture: 0px sharp corners, bold solid 2.5px borders, hard isometric shadows.',
    badge: 'Raw & Punchy',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect width="18" height="18" x="3" y="3"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>`,
    config: {
      saturationMultiplier: 1.45,
      contrastMultiplier: 1.4,
      surfaceOpacity: 0.98,
      backgroundBlur: 0,
      overlayOpacity: 0.82,
      borderRadius: '0px',
      borderWidth: '2.5px',
      borderStyle: 'solid',
      shadowStyle: '5px 5px 0px rgba(0, 0, 0, 0.9), 5px 5px 0px var(--theme-primary)',
      cardGlow: 'none',
      buttonTransform: 'translate(-2px, -2px)',
      primaryGradient: false,
      accentGlow: 'none',
      glassmorphism: false,
      bgToneShift: 0,
      lightnessOffsetSurface: 0.07,
      lightnessOffsetBg: -0.05
    }
  },

  dusk: {
    id: 'dusk',
    name: 'Twilight Dusk',
    description: 'Velvety twilight horizon with dusk coral, deep violet skies, and gentle warm illumination.',
    badge: 'Dusk Horizon',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
    config: {
      saturationMultiplier: 1.2,
      contrastMultiplier: 1.1,
      surfaceOpacity: 0.76,
      backgroundBlur: 18,
      overlayOpacity: 0.42,
      borderRadius: '22px',
      borderWidth: '1px',
      borderStyle: 'solid',
      shadowStyle: '0 16px 38px rgba(99, 102, 241, 0.22), 0 4px 12px rgba(244, 63, 94, 0.15)',
      cardGlow: '0 0 30px rgba(168, 85, 247, 0.25)',
      buttonTransform: 'translateY(-1px)',
      primaryGradient: true,
      accentGlow: '0 0 24px rgba(251, 113, 133, 0.45)',
      glassmorphism: true,
      bgToneShift: -10,
      lightnessOffsetSurface: 0.06,
      lightnessOffsetBg: -0.08
    }
  }
};
