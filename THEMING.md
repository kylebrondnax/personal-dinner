# Theme System Documentation

## Overview
Our app uses a centralized theming system that resolves theme classes at the root level. This allows components to use static CSS classes that automatically adapt to light/dark mode without conditional logic.

## Color Palette
The app uses a warm, cozy color palette designed to create an inviting atmosphere:

**Light Mode:**
- Background: `#DACAB0` (soft cream)
- Cards: `#F5F0E8` (light cream)
- Primary text: `#4E2F2E` (deep chocolate)
- Secondary text: `#6F3132` (burgundy)
- Primary actions: `#A15C22` (burnt orange)
- Borders/accents: `#8B6C5E` (taupe)

**Dark Mode:**
- Background: `#4E2F2E` (deep chocolate)
- Cards: `#6F3132` (burgundy)
- Primary text: `#DACAB0` (cream)
- Secondary text: `#B38A69` (warm tan)
- Primary actions: `#A15C22` (burnt orange - consistent across modes)
- Borders/accents: `#8B6C5E` (taupe)

## How It Works

### 1. Theme Context
- `ThemeContext` manages theme state (system/light/dark)
- Applies `dark` class to `<html>` element when dark mode is active
- `ThemeWrapper` component provides the main background gradient

### 2. Static Theme Classes
Instead of using conditional logic in components, we use predefined CSS classes:

```jsx
// ❌ Don't do this (conditional logic in every component)
const textClass = resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'

// ✅ Do this (static class that resolves automatically)
<h1 className="text-theme-primary">
```

### 3. Available Theme Classes

#### Text Colors
- `text-theme-primary` - Main headings (deep chocolate → cream)
- `text-theme-secondary` - Subheadings (burgundy → warm tan)  
- `text-theme-muted` - Body text (taupe → warm tan)
- `text-theme-subtle` - Supporting text (burnt orange → taupe)

#### Backgrounds
- `bg-theme-primary` - Main sections (light cream → deep chocolate)
- `bg-theme-secondary` - Alternate sections (soft cream → deep chocolate)
- `bg-theme-card` - Cards/elevated content (light cream → burgundy)
- `bg-theme-elevated` - Modals/overlays (light cream → burgundy)

#### Borders
- `border-theme-primary` - Main borders (taupe → taupe)
- `border-theme-subtle` - Subtle borders (warm tan → taupe)

#### Navigation
- `nav-bg` - Navigation background with backdrop blur
- `nav-border` - Navigation border

#### Buttons
- `btn-primary` - Primary action buttons (burnt orange)
- `btn-secondary` - Secondary button styling (outlined)
- `btn-theme-toggle` - Theme toggle button
- `btn-cancel` - Cancel/neutral actions
- `btn-danger` - Destructive actions

#### Badges
- `badge-success` - Success states (burnt orange tint)
- `badge-info` - Information states (warm tan tint)
- `badge-warning` - Warning states (taupe tint)
- `badge-error` - Error states (burgundy tint)
- `badge-purple` - Special states (taupe purple)
- `badge-default` - Default states (cream/chocolate)

#### Inputs
- `input-theme` - Form input styling

#### Scrollbars
- Custom scrollbar styling with warm colors
- Burnt orange thumb with cream/chocolate track
- Consistent across light/dark modes

## Usage Examples

### Basic Component
```jsx
export function MyComponent() {
  return (
    <div className="bg-theme-card border border-theme-primary p-6 rounded-lg">
      <h2 className="text-theme-primary text-2xl font-bold mb-4">
        Title
      </h2>
      <p className="text-theme-muted">
        Description text
      </p>
    </div>
  )
}
```

### Navigation Links
```jsx
<Link className="text-theme-subtle hover:text-theme-primary transition-colors">
  Browse Dinners
</Link>
```

### Cards
```jsx
<div className="bg-theme-card border border-theme-primary rounded-lg shadow-lg">
  <h3 className="text-theme-primary font-semibold">Card Title</h3>
  <p className="text-theme-muted">Card content</p>
</div>
```

### Buttons
```jsx
<button className="btn-primary px-4 py-2 rounded-lg">
  Primary Action
</button>
<button className="btn-secondary px-4 py-2 rounded-lg">
  Secondary Action
</button>
<button className="btn-danger px-4 py-2 rounded-lg">
  Delete
</button>
```

### Badges
```jsx
<span className="badge-success px-2 py-1 rounded-full text-xs">
  Active
</span>
<span className="badge-warning px-2 py-1 rounded-full text-xs">
  Pending
</span>
<span className="badge-error px-2 py-1 rounded-full text-xs">
  Cancelled
</span>
```

## Benefits

1. **No Conditional Logic** - Components stay clean and focused
2. **Consistent Theming** - All components automatically use the same color scheme
3. **Easy Maintenance** - Update colors in one place (`theme-classes.css`)
4. **Performance** - No JavaScript theme calculations in components
5. **SSR Friendly** - Works with server-side rendering

## Adding New Theme Classes

To add new theme-aware classes, edit `/src/styles/theme-classes.css`:

```css
.my-custom-class {
  @apply text-blue-600 bg-blue-50;
}
.dark .my-custom-class {
  @apply text-blue-400 bg-blue-900;
}
```

## Migration Pattern

When updating existing components:

1. Replace `dark:` Tailwind classes with theme classes
2. Remove conditional theme logic from components
3. Use static theme class names

Example migration:
```jsx
// Before
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">

// After  
<div className="bg-theme-primary text-theme-primary">
```