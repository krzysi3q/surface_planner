# AI Internationalization Guidelines

## Overview
This project uses i18next for internationalization with English (en) and Polish (pl) support. All user-facing strings must be translated and use proper translation keys.

## Translation System Structure

### Files
- **Translation files**: `/src/i18n/locales/en.json` and `/src/i18n/locales/pl.json`
- **i18n configuration**: `/src/i18n/index.ts`
- **Custom hook**: `/src/hooks/useTranslation.ts`
- **Provider**: `/src/components/I18nProvider.tsx`

### URL Structure
- English (default): `/en/` prefix
- Polish: `/pl/` prefix
- All pages are under `/app/[lang]/` dynamic route

## AI Instructions for Adding New Features

### 1. **NEVER use hard-coded strings in user-facing components**
❌ **Wrong:**
```tsx
<button>Save Project</button>
<p>Please enter your name</p>
<div title="Click to edit">Content</div>
```

✅ **Correct:**
```tsx
<button>{t('project.save')}</button>
<p>{t('form.enterName')}</p>
<div title={t('ui.clickToEdit')}>Content</div>
```

### 2. **Always add translation keys for new strings**

When adding new user-facing text:

1. **First**, add the key to both translation files:

**English** (`/src/i18n/locales/en.json`):
```json
{
  "project": {
    "save": "Save Project",
    "load": "Load Project"
  },
  "form": {
    "enterName": "Please enter your name"
  }
}
```

**Polish** (`/src/i18n/locales/pl.json`):
```json
{
  "project": {
    "save": "Zapisz Projekt",
    "load": "Wczytaj Projekt"
  },
  "form": {
    "enterName": "Proszę wprowadź swoje imię"
  }
}
```

2. **Then**, use the translation in components:
```tsx
import { useTranslation } from '@/hooks/useTranslation';

export function ProjectControls() {
  const { t } = useTranslation();
  
  return (
    <div>
      <button>{t('project.save')}</button>
      <button>{t('project.load')}</button>
    </div>
  );
}
```

### 3. **Translation Key Naming Convention**

Use hierarchical dot notation:
- `app.*` - App-level strings (title, icon alt text)
- `home.*` - Homepage content
- `planner.*` - Planner functionality
- `ui.*` - General UI elements (buttons, labels)
- `form.*` - Form-related strings
- `error.*` - Error messages
- `language.*` - Language switching

Examples:
```json
{
  "ui": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit"
  },
  "error": {
    "fileNotFound": "File not found",
    "invalidInput": "Invalid input"
  },
  "form": {
    "required": "This field is required",
    "email": "Email address"
  }
}
```

### 4. **Existing Translation Categories**

Current translation structure includes:
- `app.*` - Application metadata
- `home.*` - Homepage sections (hero, features, benefits, etc.)
- `touchDevice.*` - Touch device warnings
- `planner.*` - Planner UI and functionality
- `language.*` - Language switching interface

### 5. **Special Cases to Handle**

**Alt text and ARIA labels:**
```tsx
<Image src="/icon.png" alt={t('app.icon')} />
<button aria-label={t('ui.closeDialog')}×</button>
```

**Dynamic content with interpolation:**
```tsx
// In translation files:
{
  "welcome": "Welcome, {{name}}!"
}

// In component:
<p>{t('welcome', { name: userName })}</p>
```

**Pluralization:**
```tsx
// In translation files:
{
  "items": "{{count}} item",
  "items_plural": "{{count}} items"
}

// In component:
<p>{t('items', { count: itemCount })}</p>
```

### 6. **When Adding New Pages/Components**

1. Import the translation hook:
```tsx
import { useTranslation } from '@/hooks/useTranslation';
```

2. Use the hook in the component:
```tsx
export function MyComponent() {
  const { t } = useTranslation();
  // ... rest of component
}
```

3. Add all necessary translation keys to both language files
4. Test with both languages to ensure proper display

### 7. **Language Switching**

All navigation must respect the current language:
```tsx
// Use SmartPlannerLink for internal navigation
import { SmartPlannerLink } from '@/components/SmartPlannerLink';

<SmartPlannerLink href="/planner">
  {t('home.hero.cta')}
</SmartPlannerLink>
```

### 8. **Error Prevention Checklist**

Before submitting any changes:
- ✅ All user-visible strings use `t()` function
- ✅ Translation keys exist in both en.json and pl.json
- ✅ Alt text and aria-labels are translated
- ✅ Navigation links use SmartPlannerLink or proper language prefixes
- ✅ No hard-coded English text remains
- ✅ Build passes without type errors

### 9. **Common Mistakes to Avoid**

❌ **Don't:**
- Use hard-coded strings in JSX
- Forget to add keys to both language files
- Use direct `/path` links instead of language-aware navigation
- Add English-only translations
- Mix translated and non-translated content

✅ **Do:**
- Always add translations before using them
- Use semantic, hierarchical key names
- Test with both languages
- Keep translation files in sync
- Use the custom useTranslation hook

## Quick Reference

**Import translation hook:**
```tsx
import { useTranslation } from '@/hooks/useTranslation';
const { t } = useTranslation();
```

**Use translations:**
```tsx
{t('category.key')}
```

**Language-aware navigation:**
```tsx
import { SmartPlannerLink } from '@/components/SmartPlannerLink';
<SmartPlannerLink href="/path">{t('link.text')}</SmartPlannerLink>
```

**Add to both files:**
- `/src/i18n/locales/en.json`
- `/src/i18n/locales/pl.json`

Following these guidelines ensures the application remains fully internationalized and provides a consistent experience for users in both English and Polish.
