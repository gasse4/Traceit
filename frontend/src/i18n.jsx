import { createContext, useContext, useEffect, useState } from "react";

/* --------------------------------------------------------------------------
 * TraceIt — bilingual strings.
 * Arabic is the primary (RTL) language, English is the secondary (LTR) one.
 * -------------------------------------------------------------------------- */

export const LANGUAGES = {
  ar: "العربية",
  en: "English",
};

const DEFAULT_LANG = "ar";
const STORAGE_KEY = "traceit-lang";

const translations = {
  ar: {
    /* --- App / nav --- */
    "nav.reportLost": "إبلاغ عن مفقود",
    "nav.reportFound": "إبلاغ عن موجود",
    "nav.search": "البحث",
    "nav.language": "تغيير اللغة",
    "nav.theme": "تبديل الوضع الليلي",

    /* --- Footer --- */
    "footer.note": "ملاحظة: ",
    "footer.disclaimer":
      'النتائج "محتملة" فقط، ويجب التحقق من الملكية يدويًا قبل التسليم.',

    /* --- Home --- */
    "home.stats.totalReports": "إجمالي البلاغات",
    "home.stats.lostReports": "بلاغات مفقودات",
    "home.stats.foundReports": "بلاغات موجودات",
    "home.stats.withImage": "بلاغات بصورة",

    "home.action.textSearch.title": "البحث النصي",
    "home.action.textSearch.desc": "ابحث بالاسم، الوصف، المكان أو اللون",
    "home.action.imageSearch.title": "البحث بالصورة",
    "home.action.imageSearch.desc": "ارفع صورة وقارن بصمتها الرقمية",
    "home.action.newReport.title": "إبلاغ جديد",
    "home.action.newReport.desc": "سجل عنصرًا مفقودًا أو موجودًا بسهولة",

    "home.loading": "جاري تحميل البيانات…",
    "home.latestReports": "آخر البلاغات",
    "home.searchAll": "ابحث في الكل ←",

    "home.empty.title": "لا توجد بلاغات بعد",
    "home.empty.desc": "كن أول من يسجل بلاغًا.",

    "home.banner.title": "TRACEIT / نظام التتبع الذكي",
    "home.hero.title": "كل غرض له أثر.",
    "home.hero.subtitle": "ابدأ بتتبّعه.",
    "home.hero.desc":
      "ابحث في بلاغات الحرم الجامعي بالنص أو الصورة، واترك المطابقة الذكية تقرّبك من صاحب الغرض الحقيقي.",
    "home.hero.btnSearch": "ابدأ البحث ←",
    "home.hero.btnReportFound": "أبلغ عن غرض موجود",

    "home.sample.objectFound": "عنصر / موجود",
    "home.sample.blackKey": "مفتاح أسود",
    "home.sample.location": "مبنى الهندسة · البهو الرئيسي",
    "home.sample.hamming": "مسافة هامينج",

    /* --- Report form --- */
    "form.error.required":
      "الرجاء تعبئة جميع الحقول المطلوبة (لا تكفي المسافات الفارغة).",
    "form.success": "تم تسجيل البلاغ رقم #{id} بنجاح.",
    "form.badge.found": "موجود",
    "form.badge.lost": "مفقود",
    "form.title.found": "إبلاغ عن موجود",
    "form.title.lost": "إبلاغ عن مفقود",
    "form.desc.found":
      "وجدت غرضًا؟ سجّل بياناته لمساعدة صاحبه في العثور عليه.",
    "form.desc.lost":
      "فقدت غرضًا؟ سجّل بياناته بوضوح لتسهيل مطابقته مع البلاغات الأخرى.",
    "form.field.name": "اسم العنصر",
    "form.field.color": "اللون",
    "form.field.description": "الوصف",
    "form.field.location": "المكان",
    "form.placeholder.name": "مثال: سماعة لاسلكية",
    "form.placeholder.color": "أبيض، أسود، أحمر…",
    "form.placeholder.description": "تفاصيل مميزة تساعد في التعرف على العنصر",
    "form.placeholder.location.found": "أين وجدت العنصر؟",
    "form.placeholder.location.lost": "أين فقدت العنصر؟",
    "form.photo.label": "صورة العنصر (اختيارية)",
    "form.photo.pickerLabel": "ارفع صورة أو اسحبها هنا",
    "form.submitting": "جارٍ الإرسال…",
    "form.submit": "إرسال البلاغ",

    /* --- Search page --- */
    "search.tab.text": "بحث نصي",
    "search.tab.image": "بحث بالصور",
    "search.image.pickerLabel": "ارفع صورة العنصر",
    "search.placeholder": "ابحث بالاسم، الوصف، المكان أو اللون…",
    "search.ariaLabel": "نص البحث",
    "search.searching": "جارٍ البحث…",
    "search.search": "بحث",
    "search.resultsCount": "{count} نتيجة لـ \"{query}\"",
    "search.empty.start.title": "ابدأ بالبحث",
    "search.empty.start.desc": "أدخل كلمة مفتاحية للبحث عن المفقودات.",
    "search.empty.none.title": "لا توجد نتائج",
    "search.empty.none.desc": "جرب كلمة مفتاحية مختلفة أو ابحث بالصورة.",
    "search.image.computing": "جارٍ حساب البصمة والمقارنة…",
    "search.image.compare": "مقارنة الصور",
    "search.image.fingerprint": "بصمة الصورة (pHash):",
    "search.image.empty.title": "لا توجد صور للمقارنة",
    "search.image.empty.desc":
      "لا توجد بلاغات تحتوي على صور بعد. جرب البحث النصي.",

    /* --- Report card --- */
    "card.found": "موجود",
    "card.lost": "مفقود",
    "card.match": "تطابق {score}%",
    "card.meta.location": "المكان",
    "card.meta.color": "اللون",
    "card.meta.date": "التاريخ",
    "card.hamming": "مسافة هامينج",

    /* --- Feedback / disclaimer --- */
    "disclaimer.title": 'النتائج معروضة كـ "محتملة"',
    "disclaimer.text":
      "يجب التحقق من الملكية يدويًا والتواصل مع صاحب البلاغ قبل تسليم أي عنصر.",

    /* --- Image picker --- */
    "picker.error.format": "الرجاء اختيار صورة بصيغة JPG أو PNG.",
    "picker.error.size": "حجم الصورة يجب ألا يتجاوز 10 ميجابايت.",
    "picker.hint": "JPG / PNG · حتى 10MB",
    "picker.remove": "إزالة",

    /* --- API --- */
    "api.error.connection":
      "تعذر الاتصال بالخادم. تأكد من تشغيل الـ backend.",
  },
  en: {
    /* --- App / nav --- */
    "nav.reportLost": "Report Lost",
    "nav.reportFound": "Report Found",
    "nav.search": "Search",
    "nav.language": "Change language",
    "nav.theme": "Toggle dark mode",

    /* --- Footer --- */
    "footer.note": "Note: ",
    "footer.disclaimer":
      'Results are "probable" only, and ownership must be verified manually before delivery.',

    /* --- Home --- */
    "home.stats.totalReports": "Total Reports",
    "home.stats.lostReports": "Lost Reports",
    "home.stats.foundReports": "Found Reports",
    "home.stats.withImage": "Reports with Image",

    "home.action.textSearch.title": "Text Search",
    "home.action.textSearch.desc": "Search by name, description, location or color",
    "home.action.imageSearch.title": "Image Search",
    "home.action.imageSearch.desc": "Upload an image and compare its digital fingerprint",
    "home.action.newReport.title": "New Report",
    "home.action.newReport.desc": "Easily register a lost or found item",

    "home.loading": "Loading data…",
    "home.latestReports": "Latest Reports",
    "home.searchAll": "Search all →",

    "home.empty.title": "No reports yet",
    "home.empty.desc": "Be the first to register a report.",

    "home.banner.title": "TRACEIT / Smart Tracking System",
    "home.hero.title": "Every item has a trace.",
    "home.hero.subtitle": "Start tracking it.",
    "home.hero.desc":
      "Search campus reports by text or image, and let smart matching bring you closer to the item's true owner.",
    "home.hero.btnSearch": "Start searching →",
    "home.hero.btnReportFound": "Report a Found Item",

    "home.sample.objectFound": "OBJECT / FOUND",
    "home.sample.blackKey": "Black Key",
    "home.sample.location": "Engineering Building · Main Lobby",
    "home.sample.hamming": "Hamming distance",

    /* --- Report form --- */
    "form.error.required":
      "Please fill in all required fields (empty spaces are not enough).",
    "form.success": "Report #{id} registered successfully.",
    "form.badge.found": "Found",
    "form.badge.lost": "Lost",
    "form.title.found": "Report a Found Item",
    "form.title.lost": "Report a Lost Item",
    "form.desc.found":
      "Found an item? Record its details to help its owner find it.",
    "form.desc.lost":
      "Lost an item? Record its details clearly to make matching it with other reports easier.",
    "form.field.name": "Item Name",
    "form.field.color": "Color",
    "form.field.description": "Description",
    "form.field.location": "Location",
    "form.placeholder.name": "e.g. Wireless earbuds",
    "form.placeholder.color": "White, black, red…",
    "form.placeholder.description": "Distinctive details to help identify the item",
    "form.placeholder.location.found": "Where did you find the item?",
    "form.placeholder.location.lost": "Where did you lose the item?",
    "form.photo.label": "Item photo (optional)",
    "form.photo.pickerLabel": "Upload a photo or drop it here",
    "form.submitting": "Sending…",
    "form.submit": "Submit Report",

    /* --- Search page --- */
    "search.tab.text": "Text Search",
    "search.tab.image": "Image Search",
    "search.image.pickerLabel": "Upload the item image",
    "search.placeholder": "Search by name, description, location or color…",
    "search.ariaLabel": "Search text",
    "search.searching": "Searching…",
    "search.search": "Search",
    "search.resultsCount": "{count} results for \"{query}\"",
    "search.empty.start.title": "Start searching",
    "search.empty.start.desc": "Enter a keyword to search for lost and found items.",
    "search.empty.none.title": "No results",
    "search.empty.none.desc": "Try a different keyword or search by image.",
    "search.image.computing": "Computing fingerprint and comparing…",
    "search.image.compare": "Compare Images",
    "search.image.fingerprint": "Image fingerprint (pHash):",
    "search.image.empty.title": "No images to compare",
    "search.image.empty.desc":
      "No reports contain images yet. Try text search.",

    /* --- Report card --- */
    "card.found": "Found",
    "card.lost": "Lost",
    "card.match": "Match {score}%",
    "card.meta.location": "Location",
    "card.meta.color": "Color",
    "card.meta.date": "Date",
    "card.hamming": "Hamming distance",

    /* --- Feedback / disclaimer --- */
    "disclaimer.title": 'Results displayed as "probable"',
    "disclaimer.text":
      "Ownership must be verified manually and contact the reporter before handing over any item.",

    /* --- Image picker --- */
    "picker.error.format": "Please choose a JPG or PNG image.",
    "picker.error.size": "Image size must not exceed 10 MB.",
    "picker.hint": "JPG / PNG · Up to 10MB",
    "picker.remove": "Remove",

    /* --- API --- */
    "api.error.connection":
      "Unable to connect to the server. Make sure the backend is running.",
  },
};


/* Current language, seeded from localStorage so the choice survives reloads. */
let currentLang = localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;

/** Persist the language choice and flip <html lang> / dir. */
export function setLang(lang) {
  if (!LANGUAGES[lang]) return;
  currentLang = lang;
  localStorage.setItem(STORAGE_KEY, lang);
  const html = document.documentElement;
  html.lang = lang;
  html.dir = lang === "ar" ? "rtl" : "ltr";
}

/** Read the currently active language. */
export function getLang() {
  return currentLang;
}

/**
 * Translate a key for the active language. Falls back to Arabic, then to the
 * key itself. Supports `{param}` placeholders via an optional params object.
 */
export function t(key, params) {
  let text =
    translations[currentLang][key] ??
    translations.ar[key] ??
    key;
  if (params) {
    Object.entries(params).forEach(([name, value]) => {
      text = text.replace(new RegExp(`{${name}}`, "g"), String(value));
    });
  }
  return text;
}

/* --------------------------------------------------------------------------
 * React context: components that call useLanguage() re-render on switch.
 * -------------------------------------------------------------------------- */

const LanguageContext = createContext(null);

/** Hook used by components to read the language and translate strings. */
export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used inside a LanguageProvider");
  }
  return ctx;
}

/**
 * Provider that keeps <html lang>/dir in sync and stores the choice in
 * localStorage. Wrap the app with it (typically in main.jsx).
 */
export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(currentLang);

  useEffect(() => {
    setLang(lang);
  }, [lang]);

  const value = {
    lang,
    setLang: (next) => {
      setLang(next);
      setLangState(next);
    },
    t,
    languages: LANGUAGES,
  };

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

