export const threed = {
  color: {
    primary: "#4a90e2", // Deep Blue
    secondary: "#7b68ee", // Purple
    danger: "#e74c3c", // Red
    success: "#2ecc71", // Green
    warning: "#f39c12", // Orange
    accent: "#9b59b6", // Violet
    light: "#ecf0f1", // Light Gray
    dark: "#2c3e50", // Dark Blue-Gray
    text: {
      primary: "#2c3e50",
      secondary: "#7f8c8d",
      inverse: "#ffffff",
      muted: "#95a5a6",
    },
    bg: {
      primary: "#ffffff",
      secondary: "#f8f9fa",
      tertiary: "#e9ecef",
      elevated: "#ffffff",
      sunken: "#dee2e6",
    },
    depth: {
      shadow: "rgba(0, 0, 0, 0.15)",
      shadowDark: "rgba(0, 0, 0, 0.25)",
      highlight: "rgba(255, 255, 255, 0.9)",
      highlightSoft: "rgba(255, 255, 255, 0.6)",
    },
  },
  radius: {
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "24px",
    full: "9999px",
  },
  space: {
    1: "4px",
    2: "8px",
    3: "12px",
    4: "16px",
    5: "24px",
    6: "32px",
    7: "48px",
    8: "64px",
  },
  shadow: {
    // Flat shadows
    flat: "0 2px 4px rgba(0, 0, 0, 0.1)",
    
    // Raised shadows (light source from top)
    raised: "0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)",
    raisedMd: "0 8px 12px rgba(0, 0, 0, 0.12), 0 4px 6px rgba(0, 0, 0, 0.08)",
    raisedLg: "0 12px 24px rgba(0, 0, 0, 0.15), 0 6px 12px rgba(0, 0, 0, 0.1)",
    raisedXl: "0 20px 40px rgba(0, 0, 0, 0.2), 0 10px 20px rgba(0, 0, 0, 0.15)",
    
    // Pressed/inset shadows
    inset: "inset 0 2px 4px rgba(0, 0, 0, 0.15)",
    insetDeep: "inset 0 4px 8px rgba(0, 0, 0, 0.2)",
    
    // Floating shadows (dramatic elevation)
    floating: "0 16px 32px rgba(0, 0, 0, 0.18), 0 8px 16px rgba(0, 0, 0, 0.12)",
    floatingHigh: "0 24px 48px rgba(0, 0, 0, 0.22), 0 12px 24px rgba(0, 0, 0, 0.16)",
    
    // Neon/glow effects
    glow: "0 0 20px rgba(74, 144, 226, 0.4), 0 0 40px rgba(74, 144, 226, 0.2)",
    glowPurple: "0 0 20px rgba(155, 89, 182, 0.4), 0 0 40px rgba(155, 89, 182, 0.2)",
    glowGreen: "0 0 20px rgba(46, 204, 113, 0.4), 0 0 40px rgba(46, 204, 113, 0.2)",
    
    // Layered 3D shadows
    layered3d: "0 1px 0 rgba(255, 255, 255, 0.8), 0 2px 4px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.05)",
    
    // Inner glow
    innerGlow: "inset 0 1px 3px rgba(255, 255, 255, 0.6), inset 0 -1px 2px rgba(0, 0, 0, 0.1)",
  },
  effect: {
    // Bevel & Emboss
    bevel: "box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7), inset 0 -1px 0 rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)",
    bevelDeep: "box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.8), inset 0 -2px 0 rgba(0, 0, 0, 0.2), 0 4px 8px rgba(0, 0, 0, 0.15)",
    embossed: "box-shadow: 0 1px 0 rgba(255, 255, 255, 0.8), 0 -1px 0 rgba(0, 0, 0, 0.15), inset 0 1px 2px rgba(0, 0, 0, 0.1)",
    debossed: "box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2), inset 0 1px 2px rgba(0, 0, 0, 0.15)",
    
    // Gradients for depth
    gradientTop: "linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, transparent 100%)",
    gradientBottom: "linear-gradient(0deg, rgba(0, 0, 0, 0.1) 0%, transparent 100%)",
    gradientShine: "linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, transparent 50%, rgba(0, 0, 0, 0.05) 100%)",
    gradientGlass: "linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.05) 100%)",
    
    // Glass morphism
    glass: "background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.3)",
    glassDark: "background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2)",
    
    // Isometric
    isometric: "transform: rotateX(45deg) rotateZ(45deg); transform-style: preserve-3d",
    isometricSoft: "transform: perspective(1000px) rotateX(10deg) rotateY(-10deg)",
    
    // Lighting
    topLight: "background: linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, transparent 50%)",
    bottomShadow: "background: linear-gradient(0deg, rgba(0, 0, 0, 0.1) 0%, transparent 50%)",
    sideHighlight: "box-shadow: -2px 0 4px rgba(255, 255, 255, 0.3), 2px 0 4px rgba(0, 0, 0, 0.1)",
    
    // Glossy finish
    glossy: "background: linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%); box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
    
    // Metallic
    metallic: "background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.9), inset 0 -1px 2px rgba(0, 0, 0, 0.2)",
    metallicGold: "background: linear-gradient(135deg, #ffd89b 0%, #d4a574 100%); box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.8), inset 0 -1px 2px rgba(0, 0, 0, 0.3)",
    
    // Paper/Card effects
    paper: "background: #ffffff; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.1)",
    cardRaised: "background: #ffffff; box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08); transform: translateY(-2px)",
    
    // Neumorphism
    neomorph: "background: #e0e5ec; box-shadow: 8px 8px 16px rgba(163, 177, 198, 0.6), -8px -8px 16px rgba(255, 255, 255, 0.5)",
    neomorphInset: "background: #e0e5ec; box-shadow: inset 8px 8px 16px rgba(163, 177, 198, 0.6), inset -8px -8px 16px rgba(255, 255, 255, 0.5)",
    
    // Depth layers
    layer1: "transform: translateZ(10px)",
    layer2: "transform: translateZ(20px)",
    layer3: "transform: translateZ(30px)",
    
    // Reflections
    reflection: "position: relative; &::after { content: ''; position: absolute; bottom: -100%; left: 0; right: 0; height: 100%; background: linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, transparent 100%); transform: scaleY(-1); opacity: 0.3; }",
  },
  typography: {
    fontSize: {
      xs: "12px",
      sm: "14px",
      md: "16px",
      lg: "18px",
      xl: "20px",
      "2xl": "24px",
      "3xl": "32px",
      "4xl": "40px",
      "5xl": "48px",
    },
    fontWeight: {
      light: "300",
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
      extrabold: "800",
    },
    lineHeight: {
      tight: "1.2",
      normal: "1.5",
      relaxed: "1.8",
    },
    letterSpacing: {
      tight: "-0.02em",
      normal: "0",
      wide: "0.02em",
    },
  },
  presets: {
    // Primary 3D button
    primary: {
      bg: "linear-gradient(180deg, color.primary 0%, color.secondary 100%)",
      color: "color.text.inverse",
      border: "none",
      borderRadius: "radius.md",
      shadow: "shadow.raisedMd",
      fontWeight: "typography.fontWeight.semibold",
      position: "relative",
      overflow: "hidden",
      "&::before": {
        content: "''",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "50%",
        background: "rgba(255, 255, 255, 0.2)",
        borderRadius: "radius.md radius.md 0 0",
      },
      hover: {
        shadow: "shadow.raisedLg",
        transform: "translateY(-2px)",
      },
      active: {
        shadow: "shadow.inset",
        transform: "translateY(0)",
      },
    },
    
    // Elevated card
    elevated: {
      bg: "color.bg.elevated",
      color: "color.text.primary",
      border: "1px solid rgba(0, 0, 0, 0.05)",
      borderRadius: "radius.lg",
      shadow: "shadow.raisedLg",
      position: "relative",
      "&::before": {
        content: "''",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "1px",
        background: "rgba(255, 255, 255, 0.8)",
      },
      hover: {
        shadow: "shadow.floatingHigh",
        transform: "translateY(-4px)",
      },
    },
    
    // Glass morphism
    glass: {
      bg: "rgba(255, 255, 255, 0.7)",
      color: "color.text.primary",
      border: "1px solid rgba(255, 255, 255, 0.3)",
      borderRadius: "radius.lg",
      backdropFilter: "blur(10px)",
      shadow: "shadow.raisedMd",
      hover: {
        bg: "rgba(255, 255, 255, 0.8)",
        shadow: "shadow.raisedLg",
      },
    },
    
    // Pressed/inset
    pressed: {
      bg: "color.bg.sunken",
      color: "color.text.primary",
      border: "1px solid rgba(0, 0, 0, 0.1)",
      borderRadius: "radius.md",
      shadow: "shadow.insetDeep",
      padding: "space.3",
    },
    
    // Floating
    floating: {
      bg: "color.bg.primary",
      color: "color.text.primary",
      border: "none",
      borderRadius: "radius.xl",
      shadow: "shadow.floating",
      fontWeight: "typography.fontWeight.medium",
      hover: {
        shadow: "shadow.floatingHigh",
        transform: "translateY(-4px) scale(1.02)",
      },
    },
    
    // Glossy
    glossy: {
      bg: "linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 240, 240, 0.9) 100%)",
      color: "color.text.primary",
      border: "1px solid rgba(255, 255, 255, 0.8)",
      borderRadius: "radius.lg",
      shadow: "shadow.raisedMd",
      position: "relative",
      "&::before": {
        content: "''",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "40%",
        background: "linear-gradient(180deg, rgba(255, 255, 255, 0.6) 0%, transparent 100%)",
        borderRadius: "radius.lg radius.lg 0 0",
      },
      hover: {
        shadow: "shadow.raisedLg",
      },
    },
    
    // Neon glow
    neon: {
      bg: "color.primary",
      color: "color.text.inverse",
      border: "2px solid currentColor",
      borderRadius: "radius.md",
      shadow: "shadow.glow",
      fontWeight: "typography.fontWeight.bold",
      textShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
      hover: {
        shadow: "0 0 30px rgba(74, 144, 226, 0.6), 0 0 60px rgba(74, 144, 226, 0.3)",
        transform: "scale(1.05)",
      },
    },
    
    // Metallic
    metallic: {
      bg: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      color: "color.text.primary",
      border: "1px solid rgba(255, 255, 255, 0.5)",
      borderRadius: "radius.md",
      shadow: "shadow.raisedMd",
      boxShadow: "inset 0 1px 2px rgba(255, 255, 255, 0.9), inset 0 -1px 2px rgba(0, 0, 0, 0.2), 0 8px 12px rgba(0, 0, 0, 0.12)",
      fontWeight: "typography.fontWeight.semibold",
      hover: {
        bg: "linear-gradient(135deg, #ffffff 0%, #d0d7de 100%)",
        shadow: "shadow.raisedLg",
      },
    },
    
    // Neumorphism
    neomorph: {
      bg: "#e0e5ec",
      color: "color.text.primary",
      border: "none",
      borderRadius: "radius.lg",
      boxShadow: "8px 8px 16px rgba(163, 177, 198, 0.6), -8px -8px 16px rgba(255, 255, 255, 0.5)",
      hover: {
        boxShadow: "12px 12px 24px rgba(163, 177, 198, 0.7), -12px -12px 24px rgba(255, 255, 255, 0.6)",
      },
      active: {
        boxShadow: "inset 8px 8px 16px rgba(163, 177, 198, 0.6), inset -8px -8px 16px rgba(255, 255, 255, 0.5)",
      },
    },
    
    // Paper
    paper: {
      bg: "#ffffff",
      color: "color.text.primary",
      border: "none",
      borderRadius: "radius.md",
      shadow: "shadow.paper",
      hover: {
        shadow: "shadow.cardRaised",
        transform: "translateY(-2px)",
      },
    },
    
    // Success with depth
    success: {
      bg: "linear-gradient(180deg, color.success 0%, #27ae60 100%)",
      color: "color.text.inverse",
      border: "none",
      borderRadius: "radius.md",
      shadow: "shadow.raisedMd",
      fontWeight: "typography.fontWeight.semibold",
      boxShadow: "0 8px 12px rgba(46, 204, 113, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
      hover: {
        shadow: "shadow.glowGreen",
        transform: "translateY(-2px)",
      },
    },
    
    // Danger with depth
    danger: {
      bg: "linear-gradient(180deg, color.danger 0%, #c0392b 100%)",
      color: "color.text.inverse",
      border: "none",
      borderRadius: "radius.md",
      shadow: "shadow.raisedMd",
      fontWeight: "typography.fontWeight.semibold",
      boxShadow: "0 8px 12px rgba(231, 76, 60, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
      hover: {
        shadow: "0 0 20px rgba(231, 76, 60, 0.4), 0 0 40px rgba(231, 76, 60, 0.2)",
        transform: "translateY(-2px)",
      },
    },
    
    // Soft raised
    soft: {
      bg: "color.bg.secondary",
      color: "color.text.primary",
      border: "1px solid rgba(0, 0, 0, 0.05)",
      borderRadius: "radius.md",
      shadow: "shadow.raised",
      hover: {
        bg: "color.bg.tertiary",
        shadow: "shadow.raisedMd",
      },
    },
  },
} as const;

export type ThreedTheme = typeof threed;
