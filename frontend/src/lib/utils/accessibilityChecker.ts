/**
 * ZeroPrint Accessibility Checker
 * 
 * Utility functions to help verify WCAG AA compliance across dashboard components
 */

// Color contrast checker (WCAG AA requires 4.5:1 for normal text, 3:1 for large text)
export function checkColorContrast(foreground: string, background: string): { 
  ratio: number; 
  passes: { normalText: boolean; largeText: boolean } 
} {
  // Convert hex colors to RGB
  const fgRGB = hexToRgb(foreground);
  const bgRGB = hexToRgb(background);
  
  if (!fgRGB || !bgRGB) {
    throw new Error('Invalid color format. Please use hex colors (e.g., #FFFFFF)');
  }
  
  // Calculate relative luminance
  const fgLuminance = calculateLuminance(fgRGB);
  const bgLuminance = calculateLuminance(bgRGB);
  
  // Calculate contrast ratio
  const ratio = calculateContrastRatio(fgLuminance, bgLuminance);
  
  return {
    ratio,
    passes: {
      normalText: ratio >= 4.5,
      largeText: ratio >= 3
    }
  };
}

// Convert hex color to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Calculate relative luminance
function calculateLuminance(rgb: { r: number; g: number; b: number }): number {
  const { r, g, b } = rgb;
  
  // Convert RGB to sRGB
  const sR = r / 255;
  const sG = g / 255;
  const sB = b / 255;
  
  // Calculate luminance
  const R = sR <= 0.03928 ? sR / 12.92 : Math.pow((sR + 0.055) / 1.055, 2.4);
  const G = sG <= 0.03928 ? sG / 12.92 : Math.pow((sG + 0.055) / 1.055, 2.4);
  const B = sB <= 0.03928 ? sB / 12.92 : Math.pow((sB + 0.055) / 1.055, 2.4);
  
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

// Calculate contrast ratio
function calculateContrastRatio(luminance1: number, luminance2: number): number {
  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Check for proper heading structure
export function checkHeadingStructure(headings: HTMLHeadingElement[]): { 
  valid: boolean; 
  issues: string[] 
} {
  const issues: string[] = [];
  let valid = true;
  
  // Check if there's an h1
  if (!headings.some(h => h.tagName === 'H1')) {
    issues.push('Page is missing an H1 heading');
    valid = false;
  }
  
  // Check for skipped heading levels
  let previousLevel = 0;
  
  for (const heading of headings) {
    const currentLevel = parseInt(heading.tagName.charAt(1));
    
    if (currentLevel > previousLevel + 1 && previousLevel !== 0) {
      issues.push(`Heading level skipped from H${previousLevel} to H${currentLevel}`);
      valid = false;
    }
    
    previousLevel = currentLevel;
  }
  
  return { valid, issues };
}

// Check for proper alt text on images
export function checkImageAltText(images: HTMLImageElement[]): {
  valid: boolean;
  issues: string[]
} {
  const issues: string[] = [];
  let valid = true;
  
  for (const image of images) {
    if (!image.hasAttribute('alt')) {
      issues.push(`Image missing alt attribute: ${image.src}`);
      valid = false;
    } else if (image.alt === '' && !image.hasAttribute('role') && image.getAttribute('role') !== 'presentation') {
      // Empty alt is only valid for decorative images with role="presentation"
      issues.push(`Image has empty alt text but is not marked as decorative: ${image.src}`);
      valid = false;
    }
  }
  
  return { valid, issues };
}

// Check for proper ARIA attributes
export function checkAriaAttributes(elements: Element[]): {
  valid: boolean;
  issues: string[]
} {
  const issues: string[] = [];
  let valid = true;
  
  for (const element of elements) {
    // Check for aria-label or aria-labelledby on interactive elements without visible text
    if (
      (element.tagName === 'BUTTON' || 
       element.tagName === 'A' || 
       element.getAttribute('role') === 'button') && 
      element.textContent?.trim() === '' &&
      !element.hasAttribute('aria-label') && 
      !element.hasAttribute('aria-labelledby')
    ) {
      issues.push(`Interactive element missing accessible name: ${element.outerHTML}`);
      valid = false;
    }
    
    // Check for proper use of aria-hidden
    if (
      element.getAttribute('aria-hidden') === 'true' && 
      element.querySelectorAll('button, a, [role="button"]').length > 0
    ) {
      issues.push(`Element with aria-hidden="true" contains interactive elements: ${element.outerHTML}`);
      valid = false;
    }
  }
  
  return { valid, issues };
}

// Check for keyboard accessibility
export function checkKeyboardAccessibility(interactiveElements: Element[]): {
  valid: boolean;
  issues: string[]
} {
  const issues: string[] = [];
  let valid = true;
  
  for (const element of interactiveElements) {
    // Check if interactive elements are keyboard accessible
    if (
      (element.tagName === 'DIV' || element.tagName === 'SPAN') && 
      (element.hasAttribute('onclick') || element.hasAttribute('onClick')) &&
      !element.hasAttribute('tabindex') && 
      !element.hasAttribute('role')
    ) {
      issues.push(`Interactive element not keyboard accessible: ${element.outerHTML}`);
      valid = false;
    }
    
    // Check for positive tabindex values (should be avoided)
    const tabindex = element.getAttribute('tabindex');
    if (tabindex && parseInt(tabindex) > 0) {
      issues.push(`Element has positive tabindex value (${tabindex}): ${element.outerHTML}`);
      valid = false;
    }
  }
  
  return { valid, issues };
}

// Run all accessibility checks
export function runAccessibilityChecks(): {
  valid: boolean;
  issues: { [category: string]: string[] }
} {
  // This function would be called client-side to run all checks
  const issues: { [category: string]: string[] } = {
    contrast: [],
    headings: [],
    images: [],
    aria: [],
    keyboard: []
  };
  
  let valid = true;
  
  // These checks would need to be implemented with actual DOM elements
  // This is a placeholder for the actual implementation
  
  return { valid, issues };
}

export default {
  checkColorContrast,
  checkHeadingStructure,
  checkImageAltText,
  checkAriaAttributes,
  checkKeyboardAccessibility,
  runAccessibilityChecks
};