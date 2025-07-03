# i18n Quick Reference

## Before Adding Any User-Facing Text:

### 1. Add Translation Keys
```json
// en.json
{
  "section": {
    "newKey": "English text"
  }
}

// pl.json  
{
  "section": {
    "newKey": "Polish text"
  }
}
```

### 2. Import and Use
```tsx
import { useTranslation } from '@/hooks/useTranslation';

export function Component() {
  const { t } = useTranslation();
  return <div>{t('section.newKey')}</div>;
}
```

### 3. Key Categories
- `app.*` - App metadata
- `home.*` - Homepage 
- `planner.*` - Planner functionality
- `ui.*` - UI elements
- `form.*` - Forms
- `error.*` - Errors
- `language.*` - Language switching

### 4. Special Cases
```tsx
// Alt text
<img alt={t('app.icon')} />

// ARIA labels  
<button aria-label={t('ui.close')}>×</button>

// Navigation
<SmartPlannerLink href="/path">{t('nav.link')}</SmartPlannerLink>
```

## ❌ Never Do
- Hard-coded strings: `<p>Save file</p>`
- English-only translations
- Direct links: `<a href="/planner">`

## ✅ Always Do  
- Use translations: `<p>{t('file.save')}</p>`
- Add to both language files
- Use SmartPlannerLink for navigation
- Test both languages

See [AI_I18N_GUIDELINES.md](./AI_I18N_GUIDELINES.md) for complete documentation.
