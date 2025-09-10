export async function generateStructuredData(lang: string) {
  const baseUrl = 'https://handylay.com';
  
  const names = {
    en: "HandyLay - Surface Planner",
    pl: "HandyLay - Planowanie Powierzchni", 
    es: "HandyLay - Planificador de Superficies",
    zh: "HandyLay - 表面规划师"
  };

  const descriptions = {
    en: "Create and design your perfect apartment floor or wall with interactive walls and tile layouts.",
    pl: "Twórz i projektuj idealną podłogę lub ścianę swojego mieszkania z interaktywnymi ścianami i układami płytek.",
    es: "Crea y diseña el suelo o pared perfecta de tu apartamento con paredes interactivas y diseños de azulejos.",
    zh: "为您的公寓地板或墙面创造和设计完美的布局，配备交互式墙面和瓷砖布局。"
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": names[lang as keyof typeof names] || names.en,
    "description": descriptions[lang as keyof typeof descriptions] || descriptions.en,
    "url": `${baseUrl}/${lang}`,
    "applicationCategory": "DesignApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Interactive floor planning",
      "Wall design tools", 
      "Tile pattern layouts",
      "Real-time measurements",
      "Multi-language support"
    ],
    "screenshot": `${baseUrl}/app-icon.png`,
    "provider": {
      "@type": "Organization",
      "name": "HandyLay",
      "url": baseUrl
    },
    "inLanguage": lang,
    "potentialAction": {
      "@type": "UseAction",
      "target": `${baseUrl}/${lang}/planner`,
      "name": "Start Planning"
    }
  };

  return structuredData;
}
