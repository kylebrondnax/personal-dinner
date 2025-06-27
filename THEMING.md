# Theme System Documentation

## Overview
Our app uses a centralized theming system that resolves theme classes at the root level. This allows components to use static CSS classes that automatically adapt to light/dark mode without conditional logic.

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
- `text-theme-primary` - Main headings (gray-900 → white)
- `text-theme-secondary` - Subheadings (gray-800 → gray-200)  
- `text-theme-muted` - Body text (gray-700 → gray-300)
- `text-theme-subtle` - Supporting text (gray-600 → gray-400)

#### Backgrounds
- `bg-theme-primary` - Main sections (white → gray-800)
- `bg-theme-secondary` - Alternate sections (gray-50 → gray-900)
- `bg-theme-card` - Cards/elevated content (white → gray-700)
- `bg-theme-elevated` - Modals/overlays (white → gray-800)

#### Borders
- `border-theme-primary` - Main borders (gray-200 → gray-600)
- `border-theme-subtle` - Subtle borders (gray-300 → gray-600)

#### Navigation
- `nav-bg` - Navigation background with backdrop blur
- `nav-border` - Navigation border

#### Buttons
- `btn-secondary` - Secondary button styling

#### Inputs
- `input-theme` - Form input styling

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