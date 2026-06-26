// ============================================================================
// إعدادات الموقع العامة — الهوية، التواصل، روابط التنقّل
// ============================================================================

export const siteConfig = {
  name: "دائرة توزيع كهرباء دهوك",
  shortName: "كهرباء دهوك",
  ministry: "وزارة الكهرباء — إقليم كوردستان",
  description:
    "الموقع الرسمي لدائرة توزيع كهرباء دهوك: الأخبار والإعلانات الرسمية، أعمال الأقسام والفروع، واستقبال الشكاوى والاقتراحات.",
  contact: {
    address: "دهوك — إقليم كوردستان، العراق",
    phone: "0750 000 0000",
    emergency: "104",
    email: "info@dohukelectricity.gov.krd",
    workingHours: "الأحد – الخميس، 8:00 صباحاً – 2:00 ظهراً",
  },
  social: {
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
    youtube: "https://youtube.com",
    telegram: "https://telegram.org",
  },
} as const;

/** روابط التنقّل الرئيسية في الهيدر */
export const mainNav: { label: string; href: string }[] = [
  { label: "الرئيسية", href: "/" },
  { label: "الأخبار", href: "/news" },
  { label: "الإعلانات", href: "/announcements" },
  { label: "الفروع", href: "/branches" },
  { label: "الأقسام", href: "/departments" },
  { label: "الشكاوى والاقتراحات", href: "/complaints" },
  { label: "الأسئلة الشائعة", href: "/faq" },
  { label: "اتصل بنا", href: "/contact" },
];

/** روابط تذييل الموقع */
export const footerLinks: {
  title: string;
  links: { label: string; href: string }[];
}[] = [
  {
    title: "روابط سريعة",
    links: [
      { label: "آخر الأخبار", href: "/news" },
      { label: "الإعلانات الرسمية", href: "/announcements" },
      { label: "الفروع", href: "/branches" },
      { label: "الأقسام", href: "/departments" },
    ],
  },
  {
    title: "خدمات المواطن",
    links: [
      { label: "تقديم شكوى أو اقتراح", href: "/complaints" },
      { label: "الأسئلة الشائعة", href: "/faq" },
      { label: "الإرشادات والتعليمات", href: "/departments/services" },
      { label: "اتصل بنا", href: "/contact" },
    ],
  },
  {
    title: "الأقسام",
    links: [
      { label: "أعمال التشييد", href: "/departments/construction" },
      { label: "المشاريع والبناء", href: "/departments/projects" },
      { label: "التخطيط", href: "/departments/planning" },
    ],
  },
];
