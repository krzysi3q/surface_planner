This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## HandyLay - Surface Planner

A multilingual floor and wall planner application with support for English and Polish.

### Features
- 🌐 **Multilingual Support**: English and Polish with URL-based language routing
- 🎨 **Interactive Planning**: Visual tile and panel layout planning
- �️ **Custom Textures**: Upload your own images as tile textures in the Pattern Editor
- �📱 **Responsive Design**: Optimized for desktop and laptop use
- 🚀 **Modern Stack**: Next.js 15, TypeScript, Tailwind CSS, i18next

### Internationalization

This project is fully internationalized using i18next. All user-facing strings are translated into English and Polish.

**For AI Assistants and Developers**: Please refer to [AI_I18N_GUIDELINES.md](./AI_I18N_GUIDELINES.md) for detailed instructions on maintaining translations when adding new features.

#### Language Support
- **English** (default): Accessible at `/en/` and as fallback
- **Polish**: Accessible at `/pl/`
- **Language Detection**: Automatic browser language detection with localStorage persistence
- **Language Switching**: Available via dropdown and dedicated `/[lang]/language` page

### Custom Texture Upload

The Pattern Editor now supports uploading custom texture images for tiles:

- **Supported Formats**: JPEG, PNG, WebP
- **File Size Limit**: Up to 10MB
- **Automatic Processing**: Images are automatically resized to 512x512 pixels and converted to base64 for JSON storage
- **Usage**: Select a tile in the Pattern Editor and use the "Upload Texture" button in the tile editing panel
- **Storage**: Textures are stored as base64 strings within the pattern JSON, making them portable and self-contained

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
