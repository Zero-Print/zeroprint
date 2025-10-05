/**
 * No Firebase SDK Test
 * Ensures no Firebase SDK imports in UI components
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

// Directories to check
const UI_DIRECTORIES = [
  'src/components',
  'src/hooks',
  'src/modules',
  'src/app',
];

// Files to exclude from check
const EXCLUDE_FILES = [
  'firebase.ts', // Firebase config file is allowed
  'api.ts', // API client is allowed
  'apiClient.ts', // API client is allowed
];

// Firebase SDK patterns to detect
const FIREBASE_PATTERNS = [
  /import.*from\s+['"]firebase\//,
  /import.*from\s+['"]@firebase\//,
  /import.*from\s+['"]firebase-admin/,
  /import.*from\s+['"]@firebase\/rules-unit-testing/,
  /import.*from\s+['"]firebase\/firestore/,
  /import.*from\s+['"]firebase\/auth/,
  /import.*from\s+['"]firebase\/functions/,
  /import.*from\s+['"]firebase\/storage/,
  /import.*from\s+['"]firebase\/analytics/,
  /import.*from\s+['"]firebase\/performance/,
  /import.*from\s+['"]firebase\/messaging/,
  /import.*from\s+['"]firebase\/remote-config/,
  /import.*from\s+['"]firebase\/app-check/,
  /import.*from\s+['"]firebase\/database/,
  /import.*from\s+['"]firebase\/firestore-lite/,
  /import.*from\s+['"]firebase\/ui/,
  /import.*from\s+['"]firebase\/compat/,
  /import.*from\s+['"]firebase\/compat\/auth/,
  /import.*from\s+['"]firebase\/compat\/firestore/,
  /import.*from\s+['"]firebase\/compat\/functions/,
  /import.*from\s+['"]firebase\/compat\/storage/,
  /import.*from\s+['"]firebase\/compat\/analytics/,
  /import.*from\s+['"]firebase\/compat\/performance/,
  /import.*from\s+['"]firebase\/compat\/messaging/,
  /import.*from\s+['"]firebase\/compat\/remote-config/,
  /import.*from\s+['"]firebase\/compat\/app-check/,
  /import.*from\s+['"]firebase\/compat\/database/,
  /import.*from\s+['"]firebase\/compat\/firestore-lite/,
  /import.*from\s+['"]firebase\/compat\/ui/,
];

// Helper function to get all files recursively
function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  const files = readdirSync(dirPath);
  
  files.forEach(file => {
    const fullPath = join(dirPath, file);
    if (statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      arrayOfFiles.push(fullPath);
    }
  });
  
  return arrayOfFiles;
}

// Helper function to check file for Firebase imports
function checkFileForFirebase(filePath: string): { hasFirebase: boolean; lines: number[] } {
  try {
    const content = readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const firebaseLines: number[] = [];
    
    lines.forEach((line, index) => {
      FIREBASE_PATTERNS.forEach(pattern => {
        if (pattern.test(line)) {
          firebaseLines.push(index + 1);
        }
      });
    });
    
    return {
      hasFirebase: firebaseLines.length > 0,
      lines: firebaseLines,
    };
  } catch (error) {
    console.warn(`Could not read file ${filePath}:`, error);
    return { hasFirebase: false, lines: [] };
  }
}

describe('No Firebase SDK in UI Components', () => {
  it('should not have Firebase SDK imports in UI components', () => {
    const violations: Array<{ file: string; lines: number[] }> = [];
    
    UI_DIRECTORIES.forEach(dir => {
      const files = getAllFiles(dir);
      
      files.forEach(file => {
        const fileName = file.split('/').pop() || '';
        
        // Skip excluded files
        if (EXCLUDE_FILES.includes(fileName)) {
          return;
        }
        
        const { hasFirebase, lines } = checkFileForFirebase(file);
        
        if (hasFirebase) {
          violations.push({
            file: file.replace(process.cwd(), ''),
            lines,
          });
        }
      });
    });
    
    if (violations.length > 0) {
      const errorMessage = violations
        .map(v => `  ${v.file}:${v.lines.join(', ')}`)
        .join('\n');
      
      throw new Error(
        `Found Firebase SDK imports in UI components:\n${errorMessage}\n\n` +
        'All UI components must use the API client (api.ts) instead of direct Firebase SDK calls.'
      );
    }
    
    expect(violations).toHaveLength(0);
  });
  
  it('should have proper API client usage in components', () => {
    // This test ensures that components are using the API client
    // We can check for common patterns that indicate proper API usage
    
    const apiClientPatterns = [
      /import.*from\s+['"]@\/lib\/api/,
      /import.*from\s+['"]@\/lib\/apiClient/,
      /import.*from\s+['"]@\/hooks\/use/,
      /api\./,
      /useAuth/,
      /useWallet/,
      /useTrackers/,
      /useGames/,
      /useDashboards/,
      /useMonitoring/,
    ];
    
    const files = getAllFiles('src/components');
    let hasApiUsage = false;
    
    files.forEach(file => {
      try {
        const content = readFileSync(file, 'utf8');
        apiClientPatterns.forEach(pattern => {
          if (pattern.test(content)) {
            hasApiUsage = true;
          }
        });
      } catch (error) {
        // Ignore read errors
      }
    });
    
    expect(hasApiUsage).toBe(true);
  });
});
