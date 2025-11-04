/**
 * User Color Generation Utility
 * 
 * Generates deterministic, visually distinct colors for users in collaboration mode.
 * Uses HSL color space for better color distribution and readability.
 */

/**
 * Simple hash function to convert string to number
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Generates a deterministic color from a user ID
 * 
 * @param userId - The user's unique identifier
 * @returns Hex color code (e.g., "#FF5733")
 */
export function generateUserColor(userId: string): string {
  const hash = hashString(userId);
  
  // Use golden ratio to distribute hues evenly
  const goldenRatio = 0.618033988749895;
  const hue = (hash * goldenRatio * 360) % 360;
  
  // Use high saturation and medium lightness for vibrant, readable colors
  const saturation = 70 + (hash % 20); // 70-90%
  const lightness = 45 + (hash % 15); // 45-60%
  
  return hslToHex(hue, saturation, lightness);
}

/**
 * Convert HSL to Hex color
 */
function hslToHex(h: number, s: number, l: number): string {
  const hDecimal = h / 360;
  const sDecimal = s / 100;
  const lDecimal = l / 100;
  
  let r, g, b;
  
  if (sDecimal === 0) {
    r = g = b = lDecimal; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    
    const q = lDecimal < 0.5
      ? lDecimal * (1 + sDecimal)
      : lDecimal + sDecimal - lDecimal * sDecimal;
    const p = 2 * lDecimal - q;
    
    r = hue2rgb(p, q, hDecimal + 1 / 3);
    g = hue2rgb(p, q, hDecimal);
    b = hue2rgb(p, q, hDecimal - 1 / 3);
  }
  
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Get a readable text color (black or white) for a given background color
 * Useful for displaying user names on colored backgrounds
 */
export function getContrastTextColor(hexColor: string): string {
  // Remove # if present
  const hex = hexColor.replace("#", "");
  
  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black for light backgrounds, white for dark backgrounds
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}

/**
 * Predefined colors for the first few users (optional fallback)
 * These are carefully chosen for good contrast and aesthetics
 */
export const PRESET_COLORS = [
  "#FF6B6B", // Red
  "#4ECDC4", // Teal
  "#45B7D1", // Blue
  "#FFA07A", // Light Salmon
  "#98D8C8", // Mint
  "#F7DC6F", // Yellow
  "#BB8FCE", // Purple
  "#85C1E2", // Sky Blue
  "#F8B500", // Orange
  "#52B788", // Green
];

/**
 * Get a preset color by index, or generate one if index exceeds preset count
 */
export function getUserColorByIndex(index: number, userId: string): string {
  if (index < PRESET_COLORS.length) {
    return PRESET_COLORS[index];
  }
  return generateUserColor(userId);
}

