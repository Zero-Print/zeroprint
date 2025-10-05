# ZeroPrint Design System Documentation

## 🎨 Overview

The ZeroPrint Design System is a comprehensive component library and design
token system built for sustainability-focused applications. It provides a
consistent, accessible, and environmentally-conscious design language across all
ZeroPrint products.

## 🌱 Design Philosophy

### Core Principles

1. **Sustainability First**: Every design decision reflects our commitment to
   environmental responsibility
2. **Accessibility**: WCAG 2.1 AA compliance ensures inclusive experiences for
   all users
3. **Consistency**: Unified visual language across all touchpoints
4. **Performance**: Optimized components for minimal environmental impact
5. **Scalability**: Flexible system that grows with our ecosystem

### Visual Identity

- **Primary Green (#2E7D32)**: Represents growth, nature, and sustainability
- **Solar Yellow (#FBC02D)**: Symbolizes renewable energy and optimism
- **Info Blue (#0288D1)**: Conveys trust, technology, and clarity
- **Clean Typography**: Poppins for headings, Inter for body text

---

## 🎯 Design Tokens

### Color System

Our color system is built around environmental themes and accessibility
standards.

#### Brand Colors

```typescript
primaryGreen: '#2E7D32'; // Primary actions, success states
solarYellow: '#FBC02D'; // Secondary actions, energy themes
infoBlue: '#0288D1'; // Information, technology features
```

#### Semantic Colors

```typescript
success: '#2E7D32'; // Success messages, positive actions
danger: '#E53935'; // Errors, destructive actions
warning: '#FF9800'; // Warnings, caution states
info: '#0288D1'; // Information, neutral messages
```

#### Extended Palettes

Each brand color includes a full 50-900 scale for various use cases:

- **Green variants**: For nature, growth, and sustainability themes
- **Yellow variants**: For energy, solar, and optimism themes
- **Blue variants**: For technology, trust, and information themes
- **Gray variants**: For neutral elements and text hierarchy

### Typography Scale

```typescript
fontSize: {
  xs: '12px',     // Small labels, captions
  sm: '14px',     // Body text, form inputs
  base: '16px',   // Default body text
  lg: '18px',     // Large body text
  xl: '20px',     // Small headings
  '2xl': '24px',  // Medium headings
  '3xl': '30px',  // Large headings
  '4xl': '36px',  // Extra large headings
  '5xl': '48px'   // Display headings
}
```

### Spacing System

Consistent spacing based on 4px grid system:

```typescript
spacing: {
  xs: '4px',      // Tight spacing
  sm: '8px',      // Small spacing
  md: '12px',     // Medium spacing
  lg: '16px',     // Large spacing
  xl: '24px',     // Extra large spacing
  '2xl': '32px',  // 2x extra large
  '3xl': '48px',  // 3x extra large
  '4xl': '64px',  // 4x extra large
  '5xl': '96px'   // 5x extra large
}
```

---

## 🧩 Component Library

### ZPButton

The primary interactive element for user actions.

#### Variants

- **Primary**: Main call-to-action buttons (green)
- **Secondary**: Secondary actions (yellow)
- **Ghost**: Subtle actions with minimal visual weight
- **Outline**: Bordered buttons for secondary emphasis
- **Success/Warning/Danger**: Semantic action buttons

#### Usage Guidelines

```tsx
// Primary actions
<ZPButton variant="primary">Save Changes</ZPButton>

// Secondary actions
<ZPButton variant="secondary">Cancel</ZPButton>

// Destructive actions
<ZPButton variant="danger">Delete Account</ZPButton>

// With icons
<ZPButton icon={<Play />} iconPosition="left">
  Start Game
</ZPButton>
```

#### Accessibility

- Minimum 44px touch target
- High contrast ratios (4.5:1 minimum)
- Focus indicators with 2px outline
- Screen reader friendly labels

### ZPCard

Flexible container component for grouping related content.

#### Structure

```tsx
<ZPCard>
  <ZPCard.Header>
    <ZPCard.Title>Card Title</ZPCard.Title>
    <ZPCard.Description>Optional description</ZPCard.Description>
  </ZPCard.Header>
  <ZPCard.Body>{/* Main content */}</ZPCard.Body>
  <ZPCard.Footer>{/* Actions or additional info */}</ZPCard.Footer>
</ZPCard>
```

#### Best Practices

- Use for grouping related information
- Maintain consistent padding (16px default)
- Include clear hierarchy with titles
- Limit to 2-3 actions in footer

### ZPBadge

Small status indicators and labels.

#### Variants

- **Default**: General purpose labels
- **HealCoin**: Currency/reward indicators (gold)
- **Carbon**: Environmental impact indicators (green)
- **Energy**: Energy-related metrics (blue)

#### Usage

```tsx
// Status indicators
<ZPBadge variant="success">Active</ZPBadge>
<ZPBadge variant="warning">Pending</ZPBadge>

// Specialized badges
<ZPHealCoinBadge amount={150} />
<ZPCarbonBadge reduction="25kg CO₂" />
<ZPEnergyBadge saved="120 kWh" />
```

### ZPInput

Form input components with built-in validation and accessibility.

#### Types

- **Text**: General text input
- **Email**: Email validation
- **Password**: Secure password input
- **Number**: Numeric input with validation

#### Features

- Built-in validation states
- Error message display
- Accessibility labels
- Consistent styling

```tsx
<ZPInput
  label="Full Name"
  placeholder="Enter your name"
  required
  error={errors.name}
/>

<ZPEmailInput
  label="Email Address"
  value={email}
  onChange={setEmail}
/>
```

### TrackerCard

Specialized component for displaying environmental tracking data.

#### Props

```tsx
interface TrackerCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  onClick?: () => void;
}
```

#### Usage

```tsx
<TrackerCard
  title='Carbon Footprint'
  description='Monthly CO₂ reduction'
  icon={<Leaf className='h-6 w-6' />}
  value={25}
  unit='kg CO₂'
  trend='down'
  trendValue='15% reduction'
  onClick={() => openCarbonTracker()}
/>
```

---

## 🎨 Layout Components

### Dashboard Layouts

Pre-built dashboard layouts for different user types:

- **CitizenDashboard**: Personal sustainability tracking
- **SchoolDashboard**: Educational institution features
- **GovernmentDashboard**: Municipal and policy tools
- **AdminDashboard**: System administration interface

#### Common Features

- Responsive grid system
- Consistent navigation patterns
- Accessibility-first design
- Performance optimized

---

## 🌐 Theming & Dark Mode

### Theme Structure

The design system supports both light and dark themes with CSS custom
properties:

```css
:root {
  /* Light theme */
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  /* ... */
}

.dark {
  /* Dark theme overrides */
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  /* ... */
}
```

### Theme Toggle

```tsx
import { ZPThemeToggle } from '@/components/ui/ZPThemeToggle';

<ZPThemeToggle />;
```

---

## 📱 Responsive Design

### Breakpoint System

```typescript
breakpoints: {
  sm: '640px',    // Mobile landscape
  md: '768px',    // Tablet portrait
  lg: '1024px',   // Tablet landscape / Small desktop
  xl: '1280px',   // Desktop
  '2xl': '1536px' // Large desktop
}
```

### Mobile-First Approach

All components are designed mobile-first with progressive enhancement:

```tsx
// Responsive grid example
<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
  {/* Cards */}
</div>
```

---

## ♿ Accessibility Guidelines

### WCAG 2.1 AA Compliance

#### Color Contrast

- Normal text: 4.5:1 minimum ratio
- Large text: 3:1 minimum ratio
- Interactive elements: 3:1 minimum ratio

#### Keyboard Navigation

- All interactive elements are keyboard accessible
- Logical tab order throughout interfaces
- Visible focus indicators (2px outline)
- Skip links for main content

#### Screen Readers

- Semantic HTML structure
- ARIA labels and descriptions
- Alternative text for images
- Form labels and error messages

#### Implementation

```tsx
// Accessible button example
<ZPButton
  aria-label="Save your carbon tracking data"
  aria-describedby="save-help-text"
>
  Save Data
</ZPButton>
<div id="save-help-text" className="sr-only">
  This will save your current carbon footprint data to your profile
</div>
```

---

## 🚀 Performance Guidelines

### Component Optimization

#### Lazy Loading

```tsx
import { lazy, Suspense } from 'react';

const CarbonTracker = lazy(() => import('./CarbonTracker'));

<Suspense fallback={<LoadingSpinner />}>
  <CarbonTracker />
</Suspense>;
```

#### Bundle Size

- Tree-shakeable exports
- Minimal dependencies
- Optimized SVG icons
- CSS-in-JS with zero runtime

#### Image Optimization

```tsx
// Use Next.js Image component
import Image from 'next/image';

<Image
  src='/sustainability-hero.jpg'
  alt='Solar panels on green building'
  width={800}
  height={400}
  priority={true}
/>;
```

---

## 🧪 Testing Strategy

### Component Testing

Each component includes comprehensive tests:

```tsx
// Example test structure
describe('ZPButton', () => {
  it('renders with correct variant styles', () => {
    render(<ZPButton variant='primary'>Test</ZPButton>);
    expect(screen.getByRole('button')).toHaveClass(
      'bg-[var(--zp-primary-green)]'
    );
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<ZPButton onClick={handleClick}>Test</ZPButton>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### Visual Regression Testing

Storybook integration for visual testing:

```tsx
// Component.stories.tsx
export default {
  title: 'Components/ZPButton',
  component: ZPButton,
  parameters: {
    docs: {
      description: {
        component: 'Primary button component for user actions',
      },
    },
  },
};

export const AllVariants = () => (
  <div className='space-x-4'>
    <ZPButton variant='primary'>Primary</ZPButton>
    <ZPButton variant='secondary'>Secondary</ZPButton>
    <ZPButton variant='ghost'>Ghost</ZPButton>
  </div>
);
```

---

## 📚 Implementation Guide

### Getting Started

1. **Install Dependencies**

   ```bash
   npm install @zeroprint/design-system
   ```

2. **Import Styles**

   ```tsx
   import '@zeroprint/design-system/styles.css';
   ```

3. **Use Components**
   ```tsx
   import { ZPButton, ZPCard } from '@zeroprint/design-system';
   ```

### Custom Theming

Override design tokens for custom themes:

```tsx
// theme.config.ts
export const customTheme = {
  colors: {
    primaryGreen: '#1B5E20', // Darker green
    solarYellow: '#F57F17', // Darker yellow
  },
};
```

### Contributing

#### Component Development

1. Follow naming convention: `ZP` prefix for core components
2. Include TypeScript interfaces
3. Add comprehensive tests
4. Create Storybook stories
5. Document accessibility features

#### Design Token Updates

1. Update `tokens.ts` file
2. Regenerate CSS custom properties
3. Update documentation
4. Test across all components

---

## 🔧 Development Tools

### Storybook Integration

View all components in isolation:

```bash
npm run storybook
```

### Design Token Sync

Automatically sync tokens with design tools:

```bash
npm run sync-tokens
```

### Accessibility Testing

Automated accessibility testing:

```bash
npm run test:a11y
```

---

## 📖 Resources

### Design Files

- [Figma Design System](https://figma.com/zeroprint-design-system)
- [Component Specifications](./docs/component-specs.md)
- [Icon Library](./docs/icons.md)

### Code Examples

- [Implementation Examples](./examples/)
- [Custom Theme Examples](./examples/theming/)
- [Accessibility Examples](./examples/accessibility/)

### Support

- [GitHub Issues](https://github.com/zeroprint/design-system/issues)
- [Design System Slack](https://zeroprint.slack.com/channels/design-system)
- [Documentation Site](https://design.zeroprint.com)

---

## 🔄 Changelog

### v1.0.0 (Current)

- Initial design system release
- Core component library
- Design token system
- Accessibility compliance
- Dark mode support
- Storybook integration

### Roadmap

- [ ] Advanced animation system
- [ ] Mobile component variants
- [ ] Data visualization components
- [ ] Advanced form components
- [ ] Internationalization support

---

_Built with 💚 for a sustainable future_
