# Step Into Storytime Style Guide

## Design Tokens

### Colors

#### Base Colors

- Primary: HSL(270, 50%, 60%) - Purple
- Secondary: HSL(210, 40%, 96.1%) - Light Blue-Gray
- Accent: HSL(210, 40%, 96.1%) - Light Blue-Gray
- Destructive: HSL(0, 84.2%, 60.2%) - Red

#### Text Colors

- Foreground: HSL(222.2, 84%, 4.9%) - Near Black
- Muted: HSL(215.4, 16.3%, 46.9%) - Gray
- Primary Foreground: HSL(210, 40%, 98%) - Near White

#### Background Colors

- Background: HSL(0, 0%, 100%) - White
- Card: HSL(0, 0%, 100%) - White
- Popover: HSL(0, 0%, 100%) - White
- Muted: HSL(210, 40%, 96.1%) - Light Gray

#### Chart Colors

- Chart 1: HSL(12, 76%, 61%)
- Chart 2: HSL(173, 58%, 39%)
- Chart 3: HSL(197, 37%, 24%)
- Chart 4: HSL(43, 74%, 66%)
- Chart 5: HSL(27, 87%, 67%)

### Typography

#### Font Family

```css
font-family: Arial, Helvetica, sans-serif;
```

#### Font Sizes

- xs: 0.75rem
- sm: 0.875rem
- base: 1rem
- lg: 1.125rem
- xl: 1.25rem
- 2xl: 1.5rem
- 3xl: 1.875rem
- 4xl: 2.25rem
- 5xl: 3rem

### Spacing

#### Base Scale

- 0: 0px
- 1: 0.25rem (4px)
- 2: 0.5rem (8px)
- 3: 0.75rem (12px)
- 4: 1rem (16px)
- 5: 1.25rem (20px)
- 6: 1.5rem (24px)
- 8: 2rem (32px)
- 10: 2.5rem (40px)
- 12: 3rem (48px)
- 16: 4rem (64px)

### Border Radius

- Default: 0.5rem (8px)

## Utility Classes

### Container

```css
.responsive-container {
  @apply w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
}
```

### Responsive Text

```css
.responsive-text-xs {
  @apply text-xs sm:text-sm;
}

.responsive-text-base {
  @apply text-base sm:text-lg;
}

.responsive-text-lg {
  @apply text-lg sm:text-xl md:text-2xl;
}

.responsive-text-xl {
  @apply text-xl sm:text-2xl md:text-3xl;
}
```

### Spacing

```css
.responsive-py {
  @apply py-8 md:py-12 lg:py-16;
}

.responsive-mt {
  @apply mt-6 md:mt-8 lg:mt-10;
}

.responsive-gap {
  @apply gap-4 md:gap-6 lg:gap-8;
}
```

## Component Patterns

### Buttons

```css
/* Primary Button */
.btn-primary {
  @apply bg-primary text-primary-foreground hover:bg-primary/90;
}

/* Secondary Button */
.btn-secondary {
  @apply bg-secondary text-secondary-foreground hover:bg-secondary/80;
}
```

### Cards

```css
.card {
  @apply bg-card text-card-foreground p-6 rounded-lg shadow-sm;
}
```

### Forms

```css
.form-input {
  @apply bg-background border border-input rounded-md px-3 py-2;
}

.form-label {
  @apply text-sm font-medium text-foreground;
}
```

## Responsive Design

### Breakpoints

- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1536px

### Mobile-First Approach

Always design for mobile first, then enhance for larger screens using responsive utility classes.

## Accessibility

### Color Contrast

- Ensure text meets WCAG 2.1 contrast requirements
- Use theme colors appropriately for consistent contrast

### Touch Targets

```css
.touch-target {
  min-height: 44px;
  min-width: 44px;
}
```

## Dark Mode

Dark mode colors are automatically handled by the theme system. Use the appropriate CSS variables for colors to ensure proper dark mode support.
