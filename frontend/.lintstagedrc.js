module.exports = {
  // TypeScript and JavaScript files
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'prettier --write',
    'jest --bail --findRelatedTests --passWithNoTests',
  ],

  // JSON files
  '*.json': ['prettier --write'],

  // CSS and styling files
  '*.{css,scss,sass}': ['prettier --write'],

  // Markdown files
  '*.md': ['prettier --write'],

  // YAML files
  '*.{yml,yaml}': ['prettier --write'],

  // Package.json - run type check after changes
  'package.json': ['npm run type-check'],

  // Test files - run related tests
  '**/*.test.{js,jsx,ts,tsx}': ['jest --bail --findRelatedTests'],

  // Component files - run related tests and type check
  'src/components/**/*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'prettier --write',
    'npm run type-check',
    'jest --bail --findRelatedTests --passWithNoTests',
  ],

  // Hook files - run related tests and type check
  'src/hooks/**/*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'prettier --write',
    'npm run type-check',
    'jest --bail --findRelatedTests --passWithNoTests',
  ],

  // Utility files - run related tests
  'src/utils/**/*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'prettier --write',
    'jest --bail --findRelatedTests --passWithNoTests',
  ],

  // Service files - run related tests and type check
  'src/services/**/*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'prettier --write',
    'npm run type-check',
    'jest --bail --findRelatedTests --passWithNoTests',
  ],

  // Store files - run related tests and type check
  'src/stores/**/*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'prettier --write',
    'npm run type-check',
    'jest --bail --findRelatedTests --passWithNoTests',
  ],
};
