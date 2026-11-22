import { SupportedLanguage } from "./i18n";

export interface ToolSeoMeta {
  title: string;
  description: string;
}

export const HOME_SEO_META: Record<SupportedLanguage, ToolSeoMeta> = {
  en: {
    title: "⚡ Fast YouTube Video & Shorts Downloader (1080p Full HD & MP3) | YTSnap",
    description: "Download YouTube videos, Shorts and high-bitrate MP3 audio in 1080p, 720p HD with combined audio tracks. Fast, safe, no watermark and 100% free online.",
  },
  hi: {
    title: "⚡ यूट्यूब वीडियो और शॉर्ट्स डाउनलोडर (1080p Full HD & MP3) - 100% फ्री | YTSnap",
    description: "यूट्यूब वीडियो और शॉर्ट्स को 1080p, 720p HD MP4 और MP3 ऑडियो में तेज़ स्पीड से डाउनलोड करें। ऑडियो और वीडियो एक साथ बिना किसी वॉटरमार्क के।",
  },
  de: {
    title: "⚡ YouTube Video & Shorts Downloader (1080p Full HD & MP3) - Kostenlos | YTSnap",
    description: "YouTube Videos und Shorts kostenlos in 1080p Full HD, 720p MP4 und MP3 Audio herunterladen. Ohne Wasserzeichen, schnell & direkt auf Handy und PC.",
  },
  ar: {
    title: "⚡ تحميل فيديوهات وشورتس يوتيوب (1080p Full HD & MP3) مجاناً وبسرعة | YTSnap",
    description: "تحميل مقاطع يوتيوب وفيديوهات شورتس بجودة عالية 1080p و 720p بصيغة MP4 و MP3 مجاناً بدون علامة مائية على الموبايل والكمبيوتر.",
  },
  id: {
    title: "⚡ Download Video & Shorts YouTube Tanpa Watermark (1080p Full HD & MP3) | YTSnap",
    description: "Unduh video dan Shorts YouTube kualitas 1080p, 720p HD MP4 & audio MP3 gratis tanpa watermark. Cepat, mudah, dan aman di HP dan PC.",
  },
  es: {
    title: "⚡ Descargar Videos y Shorts de YouTube (1080p Full HD y MP3) - Gratis | YTSnap",
    description: "Descarga videos y Shorts de YouTube en 1080p, 720p HD y audio MP3 sin marca de agua. 100% rápido, gratis y online para celular y PC.",
  },
  fr: {
    title: "⚡ Télécharger Vidéos et Shorts YouTube (1080p Full HD & MP3) Gratuit | YTSnap",
    description: "Téléchargez des vidéos et Shorts YouTube en 1080p, 720p HD MP4 et audio MP3 sans filigrane. Téléchargement rapide et gratuit sur mobile et PC.",
  },
  pt: {
    title: "⚡ Baixar Vídeos e Shorts do YouTube (1080p Full HD e MP3) - Grátis | YTSnap",
    description: "Baixe vídeos e Shorts do YouTube em 1080p, 720p HD MP4 e áudio MP3 sem marca d'água. Rápido, seguro e 100% gratuito no celular e PC.",
  },
};

export const TOOLS_SEO_META: Record<string, Record<SupportedLanguage, ToolSeoMeta>> = {
  "youtube-shorts-downloader": {
    en: {
      title: "⚡ Fast YouTube Shorts Downloader (1080p Full HD) - Free, No Watermark 2026",
      description: "Download YouTube Shorts in 1080p, 720p HD and MP4/MP3 with sound. 1-Click fast downloader online, no watermark, 100% free and safe on mobile & PC.",
    },
    hi: {
      title: "⚡ यूट्यूब शॉर्ट्स डाउनलोडर बिना वॉटरमार्क (1080p Full HD & MP3) - 100% फ्री",
      description: "बिना वॉटरमार्क के 1080p, 720p HD MP4 और MP3 ऑडियो में यूट्यूब शॉर्ट्स तुरंत डाउनलोड करें। 1-क्लिक तेज़ और मुफ़्त ऑनलाइन टूल।",
    },
    de: {
      title: "⚡ YouTube Shorts Downloader (1080p Full HD & MP3) - Kostenlos & Schnell",
      description: "YouTube Shorts Videos kostenlos in 1080p Full HD, 720p MP4 und MP3 Audio herunterladen. Ohne Wasserzeichen, schnell & direkt auf Handy und PC.",
    },
    ar: {
      title: "⚡ تحميل شورتس يوتيوب بدون علامة مائية (1080p Full HD & MP3) مجاناً",
      description: "تحميل فيديوهات يوتيوب شورتس بجودة عالية 1080p و 720p بصيغة MP4 و MP3 مجاناً بدون علامة مائية وبسرعة فائقة على الموبايل والكمبيوتر.",
    },
    id: {
      title: "⚡ Download YouTube Shorts Tanpa Watermark (1080p Full HD & MP3) Gratis",
      description: "Unduh video YouTube Shorts gratis kualitas 1080p, 720p HD MP4 & audio MP3 tanpa watermark. Cepat, mudah, dan aman di HP dan PC.",
    },
    es: {
      title: "⚡ Descargar YouTube Shorts Sin Marca de Agua (1080p Full HD y MP3) Gratis",
      description: "Descarga videos de YouTube Shorts en 1080p, 720p HD y audio MP3 sin marca de agua. Rápido, gratis y online para celular y PC.",
    },
    fr: {
      title: "⚡ Télécharger YouTube Shorts Sans Filigrane (1080p Full HD & MP3) Gratuit",
      description: "Téléchargez des vidéos YouTube Shorts en 1080p, 720p HD MP4 et audio MP3 sans filigrane. Téléchargement rapide et 100% gratuit sur mobile et PC.",
    },
    pt: {
      title: "⚡ Baixar YouTube Shorts Sem Marca d'Água (1080p Full HD & MP3) Grátis",
      description: "Baixe vídeos do YouTube Shorts em 1080p, 720p HD MP4 e áudio MP3 sem marca d'água. Rápido, seguro e 100% gratuito no celular e PC.",
    },
  },

  "youtube-video-downloader": {
    en: {
      title: "⚡ YouTube Video Downloader (1080p Full HD, 4K & MP3) - Fast & Free",
      description: "Download YouTube videos in 1080p 60fps, 4K, 720p HD MP4 and convert to 320kbps MP3 audio. 1-Click fast download, no pop-up ads, unlimited & free.",
    },
    hi: {
      title: "⚡ यूट्यूब वीडियो डाउनलोडर (1080p Full HD, 4K & MP3) - 100% फ्री और फ़ास्ट",
      description: "यूट्यूब वीडियो और शॉर्ट्स को 1080p, 720p HD MP4 और 320kbps MP3 ऑडियो में तेज़ स्पीड से डाउनलोड करें। ऑडियो और वीडियो एक साथ बिना वॉटरमार्क।",
    },
    de: {
      title: "⚡ YouTube Video Downloader (1080p Full HD, 4K & MP3) - Kostenlos & Schnell",
      description: "YouTube Videos in 1080p Full HD, 4K, 720p MP4 und MP3 Audio mit Ton kostenlos herunterladen. Ohne Popups, schnell und unbegrenzt.",
    },
    ar: {
      title: "⚡ تحميل فيديوهات يوتيوب (1080p Full HD, 4K & MP3) مجاناً وبسرعة",
      description: "تحميل فيديو من يوتيوب بجودة عالية 1080p و 4K وتحويل إلى MP3 مجاناً بدون إعلانات مزعجة وبسرعة فائقة.",
    },
    id: {
      title: "⚡ Download Video YouTube (1080p Full HD, 4K & MP3) Gratis & Cepat",
      description: "Unduh video YouTube dalam resolusi 1080p 60fps, 4K, 720p MP4 dan konversi ke audio MP3 kualitas tinggi. Gratis tanpa aplikasi.",
    },
    es: {
      title: "⚡ Descargar Videos de YouTube (1080p Full HD, 4K y MP3) - Rápido y Gratis",
      description: "Descarga videos de YouTube en 1080p 60fps, 4K, 720p HD y convierte a MP3 con audio de alta calidad. 100% gratis y sin anuncios molestos.",
    },
    fr: {
      title: "⚡ Télécharger Vidéo YouTube (1080p Full HD, 4K & MP3) - Rapide & Gratuit",
      description: "Téléchargez des vidéos YouTube en 1080p Full HD, 4K, 720p MP4 et convertissez en audio MP3. Rapide, sans pub intrusive et 100% gratuit.",
    },
    pt: {
      title: "⚡ Baixar Vídeos do YouTube (1080p Full HD, 4K e MP3) - Rápido e Grátis",
      description: "Baixe vídeos do YouTube em 1080p 60fps, 4K, 720p HD MP4 e converta para áudio MP3 de alta qualidade. Gratuito, rápido e sem anúncios.",
    },
  },

  "youtube-thumbnail-downloader": {
    en: {
      title: "⚡ YouTube Thumbnail Downloader HD (4K, 1080p & 720p) - High-Res Grabber",
      description: "Download YouTube video thumbnails in Ultra HD 4K, 1080p and 720p (1280x720 maxresdefault). Check thumbnail sizes, formats, and save full-resolution images free.",
    },
    hi: {
      title: "⚡ यूट्यूब थंबनेल डाउनलोडर HD (4K, 1080p & 720p) - 100% फ्री",
      description: "यूट्यूब वीडियो थंबनेल को फुल HD (1280x720 maxresdefault) और 4K रेजोल्यूशन में बिना वॉटरमार्क के तुरंत डाउनलोड करें।",
    },
    de: {
      title: "⚡ YouTube Thumbnail Downloader & Bildgrößen (4K, 1080p HD) Kostenlos",
      description: "YouTube Vorschaubilder (Thumbnails) in 4K, Full HD (1280x720) und Originalgröße kostenlos herunterladen. Alle YouTube Bildgrößen & Formate auf einen Klick.",
    },
    ar: {
      title: "⚡ تحميل صور مصغرة يوتيوب بجودة عالية (4K, 1080p & 720p) مجاناً",
      description: "تحميل الصور المصغرة لفيديوهات اليوتيوب بجودة عالية 4K و 1080p و 720p بدون علامة مائية بضغطة واحدة.",
    },
    id: {
      title: "⚡ Download Thumbnail YouTube HD (4K, 1080p & 720p) Gratis",
      description: "Unduh thumbnail video YouTube resolusi tinggi 4K dan Full HD (1280x720 maxresdefault) tanpa watermark gratis.",
    },
    es: {
      title: "⚡ Descargar Miniaturas de YouTube HD (4K, 1080p y 720p) Gratis",
      description: "Descarga miniaturas de videos de YouTube en resolución Ultra HD 4K y 1080p (1280x720) sin marcas de agua gratis.",
    },
    fr: {
      title: "⚡ Télécharger Miniature YouTube HD (4K, 1080p & 720p) Gratuit",
      description: "Téléchargez les miniatures de vidéos YouTube en qualité Ultra HD 4K et 1080p (1280x720) sans filigrane gratuitement.",
    },
    pt: {
      title: "⚡ Baixar Thumbnail do YouTube HD (4K, 1080p e 720p) Grátis",
      description: "Baixe miniaturas de vídeos do YouTube em qualidade Ultra HD 4K e Full HD (1280x720) sem marca d'água grátis.",
    },
  },

  "youtube-description-generator": {
    en: {
      title: "⚡ AI YouTube Description Generator (Free, SEO-Friendly with Timestamps)",
      description: "Generate viral, SEO-optimized YouTube descriptions with timestamps, call-to-actions, and keywords in seconds. 100% free AI tool for creators.",
    },
    hi: {
      title: "⚡ AI यूट्यूब डिस्क्रिप्शन जनरेटर (SEO फ्रेंडली और फ्री)",
      description: "यूट्यूब वीडियो के लिए टाइमस्टैम्प, कीवर्ड और कॉल-टू-एक्शन के साथ हाई-रैंकिंग SEO डिस्क्रिप्शन तुरंत तैयार करें। 100% मुफ़्त टूल।",
    },
    de: {
      title: "⚡ YouTube Beschreibungs-Generator (SEO-optimiert mit Timestamps) Kostenlos",
      description: "Erstelle SEO-optimierte YouTube Video Beschreibungen mit Timestamps und Keywords in Sekunden. 100% kostenloser Generator.",
    },
    ar: {
      title: "⚡ مولد وصف فيديوهات يوتيوب بالذكاء الاصطناعي (مجاني واحترافي)",
      description: "توليد وصف احترافي ومحسن لمحركات البحث لفيديوهات اليوتيوب مع طوابع زمنية وكلمات مفتاحية مجاناً.",
    },
    id: {
      title: "⚡ Generator Deskripsi YouTube AI (SEO Friendly & Gratis)",
      description: "Buat deskripsi video YouTube otomatis yang ramah SEO lengkap dengan timestamp dan hashtag gratis dalam hitungan detik.",
    },
    es: {
      title: "⚡ Generador de Descripciones para YouTube con IA (SEO y Marcas de Tiempo)",
      description: "Genera descripciones optimizadas para SEO en YouTube con marcas de tiempo, hashtags y palabras clave en segundos. Gratis.",
    },
    fr: {
      title: "⚡ Générateur de Description YouTube IA (Optimisé SEO & Horodatage) Gratuit",
      description: "Générez des descriptions YouTube optimisées pour le référencement avec horodatages et mots-clés en quelques secondes.",
    },
    pt: {
      title: "⚡ Gerador de Descrição para YouTube com IA (SEO e Timestamps) Grátis",
      description: "Crie descrições profissionais e otimizadas para SEO no YouTube com timestamps e hashtags em segundos. 100% gratuito.",
    },
  },

  "youtube-tags-generator": {
    en: {
      title: "⚡ YouTube Tag Generator (Viral Tags for Views & SEO) - Free Tag Extractor",
      description: "Generate and extract the best trending YouTube tags to boost views, rank higher in search, and optimize YouTube SEO. Free 1-click copy-paste tags.",
    },
    hi: {
      title: "⚡ यूट्यूब टैग जनरेटर (व्यूज बढ़ाने वाले वायरल SEO टैग्स) - 100% फ्री",
      description: "यूट्यूब वीडियो के लिए बेस्ट ट्रेंडिंग और वायरल टैग्स जनरेट करें। व्यूज बढ़ाने और सर्च में टॉप पर आने के लिए 100% मुफ़्त टूल।",
    },
    de: {
      title: "⚡ YouTube Tags Generator (Virale SEO Tags für mehr Aufrufe)",
      description: "Finde und generiere die besten YouTube Tags für mehr Views und bessere SEO-Rankings. Kostenlos mit einem Klick kopieren.",
    },
    ar: {
      title: "⚡ مولد كلمات دلالية يوتيوب (تاجات لزيادة المشاهدات وتصدر البحث)",
      description: "استخراج وتوليد أفضل الكلمات الدلالية (التاجات) لليوتيوب لزيادة المشاهدات وتصدر نتائج البحث مجاناً.",
    },
    id: {
      title: "⚡ Generator Tag YouTube (Tag Viral untuk Menambah Views & SEO)",
      description: "Dapatkan tag YouTube terbaik dan viral untuk meningkatkan penonton dan ranking video di pencarian. Gratis 1-klik salin.",
    },
    es: {
      title: "⚡ Generador de Etiquetas para YouTube (Tags Virales para Visitas y SEO)",
      description: "Genera y extrae las mejores etiquetas (tags) para YouTube para conseguir más visitas y posicionar tus videos. Gratis.",
    },
    fr: {
      title: "⚡ Générateur de Tags YouTube (Tags Viraux pour Vues & Référencement)",
      description: "Générez les meilleurs tags et mots-clés YouTube pour booster vos vues et grimper dans l'algorithme. Gratuit.",
    },
    pt: {
      title: "⚡ Gerador de Tags para YouTube (Tags Virais para Views e SEO) Grátis",
      description: "Gere e extraia as melhores tags do YouTube para aumentar visualizações e melhorar o SEO do seu canal gratuitamente.",
    },
  },

  "youtube-hashtag-generator": {
    en: {
      title: "⚡ YouTube Hashtag Generator (Trending Hashtags for Shorts & Videos)",
      description: "Discover trending YouTube hashtags for Shorts and long videos to increase reach and get on the algorithm feed. Free instant hashtag generator.",
    },
    hi: {
      title: "⚡ यूट्यूब हैशटैग जनरेटर (शॉर्ट्स और वीडियो के वायरल हैशटैग)",
      description: "यूट्यूब शॉर्ट्स और वीडियो के लिए बेस्ट ट्रेंडिंग हैशटैग्स खोजें और अपनी रीच बढ़ाएं। 100% मुफ़्त हैशटैग टूल।",
    },
    de: {
      title: "⚡ YouTube Hashtag Generator (Trend Hashtags für Shorts & Videos)",
      description: "Finde virale Hashtags für YouTube Shorts und Videos, um mehr Reichweite zu erzielen. Kostenloser Hashtag Generator.",
    },
    ar: {
      title: "⚡ مولد هاشتاجات يوتيوب (هاشتاجات تريند للشورتس والفيديوهات)",
      description: "اكتشف أفضل الهاشتاجات الرائجة لفيديوهات اليوتيوب والشورتس لزيادة الوصول والمشاهدات مجاناً.",
    },
    id: {
      title: "⚡ Generator Hashtag YouTube (Hashtag Viral untuk Shorts & Video)",
      description: "Temukan hashtag YouTube yang sedang tren untuk video dan Shorts agar masuk rekomendasi algoritma. Gratis.",
    },
    es: {
      title: "⚡ Generador de Hashtags para YouTube (Hashtags Virales para Shorts)",
      description: "Descubre los hashtags más populares para YouTube Shorts y videos para aumentar tu alcance y vistas rápidamente.",
    },
    fr: {
      title: "⚡ Générateur de Hashtags YouTube (Hashtags Tendances Shorts & Vidéos)",
      description: "Découvrez les hashtags YouTube les plus populaires pour booster la visibilité de vos Shorts et vidéos. Gratuit.",
    },
    pt: {
      title: "⚡ Gerador de Hashtags para YouTube (Hashtags Virais para Shorts)",
      description: "Descubra hashtags em alta no YouTube para Shorts e vídeos para alcançar mais inscritos e visualizações.",
    },
  },

  "youtube-banner-downloader": {
    en: {
      title: "⚡ YouTube Banner Downloader (2560x1440 4K HD Channel Art) | YTSnap",
      description: "Download YouTube channel banners, headers, and avatars in original 2560x1440 HD resolution. Free high-res channel art extractor.",
    },
    hi: {
      title: "⚡ यूट्यूब चैनल बैनर डाउनलोडर (2560x1440 HD चैनल आर्ट) | YTSnap",
      description: "यूट्यूब चैनल बैनर, चैनल आर्ट और अवतार को फुल 2560x1440 HD रेजोल्यूशन में बिना वॉटरमार्क डाउनलोड करें।",
    },
    de: {
      title: "⚡ YouTube Banner Downloader (2560x1440 HD Kanalbanner & Avatar)",
      description: "YouTube Kanalbanner und Profilbilder in originaler 2560x1440 HD Auflösung kostenlos herunterladen.",
    },
    ar: {
      title: "⚡ تحميل غلاف قناة يوتيوب وبانر القناة (2560x1440 HD)",
      description: "تحميل بانر وغلاف قنوات اليوتيوب والصور الشخصية بالحجم الكامل 2560x1440 HD مجاناً وبأعلى دقة.",
    },
    id: {
      title: "⚡ Download Banner YouTube (2560x1440 HD Channel Art & Avatar)",
      description: "Unduh banner dan foto profil channel YouTube ukuran asli 2560x1440 HD gratis tanpa watermark.",
    },
    es: {
      title: "⚡ Descargar Banner de YouTube (2560x1440 HD Cabecera de Canal)",
      description: "Descarga banners de canales de YouTube y fotos de perfil en resolución original 2560x1440 HD gratis.",
    },
    fr: {
      title: "⚡ Télécharger Bannière YouTube (2560x1440 HD Bannière de Chaîne)",
      description: "Téléchargez les bannières et avatars de chaînes YouTube en résolution originale 2560x1440 HD gratuitement.",
    },
    pt: {
      title: "⚡ Baixar Banner do YouTube (2560x1440 HD Arte do Canal e Avatar)",
      description: "Baixe banners de canais do YouTube e avatares em resolução original 2560x1440 HD gratuitamente.",
    },
  },

  "video-aspect-ratio-calculator": {
    en: {
      title: "⚡ YouTube Video Aspect Ratio Calculator (16:9, 9:16 Shorts & Dimensions)",
      description: "Calculate exact YouTube video and Shorts dimensions, aspect ratios (16:9 widescreen, 9:16 vertical shorts, 1:1 square), and pixels accurately.",
    },
    hi: {
      title: "⚡ वीडियो आस्पेक्ट रेशियो कैलकुलेटर (16:9, 9:16 शॉर्ट्स & पिक्सल)",
      description: "यूट्यूब वीडियो और शॉर्ट्स के लिए सही आस्पेक्ट रेशियो (16:9, 9:16 वर्टिकल), डायमेंशन और पिक्सल साइज आसानी से कैलकुलेट करें।",
    },
    de: {
      title: "⚡ Video Seitenverhältnis Rechner (16:9, 9:16 Shorts & Bildgrößen)",
      description: "Berechne exakte YouTube Video- und Shorts-Maße, Seitenverhältnisse (16:9, 9:16) und Pixelgrößen präzise und kostenlos.",
    },
    ar: {
      title: "⚡ حاسبة أبعاد ونسب الفيديو (16:9 و 9:16 شورتس يوتيوب)",
      description: "حساب أبعاد ونسب العرض إلى الارتفاع للفيديوهات وشورتس اليوتيوب بدقة وسهولة مجاناً.",
    },
    id: {
      title: "⚡ Kalkulator Aspek Rasio Video (16:9, 9:16 Shorts & Dimensi)",
      description: "Hitung aspek rasio video YouTube dan Shorts (16:9 landscape, 9:16 vertikal) dan resolusi piksel dengan cepat dan akurat.",
    },
    es: {
      title: "⚡ Calculadora de Relación de Aspecto de Video (16:9, 9:16 Shorts)",
      description: "Calcula dimensiones exactas de videos y Shorts de YouTube, relaciones de aspecto (16:9, 9:16) y resolución en píxeles gratis.",
    },
    fr: {
      title: "⚡ Calculateur de Ratio d'Aspect Vidéo (16:9, 9:16 Shorts & Dimensions)",
      description: "Calculez les dimensions exactes des vidéos et Shorts YouTube, ratios d'aspect (16:9, 9:16) et résolutions en pixels.",
    },
    pt: {
      title: "⚡ Calculadora de Proporção de Vídeo (16:9, 9:16 Shorts e Resoluções)",
      description: "Calcule proporções e dimensões exatas de vídeos e Shorts do YouTube (16:9, 9:16 vertical) e resolução em pixels grátis.",
    },
  },
};

export function getToolSeoMeta(
  toolSlug: string,
  lang: SupportedLanguage,
  fallbackTitle: string,
  fallbackDesc: string
): ToolSeoMeta {
  const toolMeta = TOOLS_SEO_META[toolSlug];
  if (toolMeta && toolMeta[lang]) {
    return toolMeta[lang];
  }
  if (toolMeta && toolMeta.en) {
    return toolMeta.en;
  }
  return {
    title: fallbackTitle,
    description: fallbackDesc,
  };
}
