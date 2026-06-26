import type { Branch } from "@/lib/types";

/** بيانات تجريبية للفروع — تُستبدل لاحقاً بقاعدة MongoDB */
export const branches: Branch[] = [
  {
    id: "dohuk",
    name: "فرع دهوك (المركز)",
    shortName: "دهوك",
    description:
      "الفرع الرئيسي للدائرة في مركز محافظة دهوك، ويغطي مدينة دهوك والأحياء التابعة لها، ويشرف على عدد من الأقسام الفنية والإدارية.",
    location: "دهوك — شارع نوروز",
    phone: "0750 111 1001",
    email: "dohuk@dohukelectricity.gov.krd",
    manager: "إدارة فرع دهوك",
    status: "active",
  },
  {
    id: "zakho",
    name: "فرع زاخو",
    shortName: "زاخو",
    description:
      "يغطي قضاء زاخو والمناطق المحيطة به، ويعنى بصيانة الشبكات وتوسعتها وخدمة المشتركين في المنطقة الحدودية.",
    location: "زاخو — المركز",
    phone: "0750 111 1002",
    email: "zakho@dohukelectricity.gov.krd",
    manager: "إدارة فرع زاخو",
    status: "active",
  },
  {
    id: "amedi",
    name: "فرع العمادية",
    shortName: "العمادية",
    description:
      "يخدم قضاء العمادية والنواحي الجبلية التابعة له، ويركّز على إيصال الكهرباء للمناطق النائية وصيانة الخطوط في التضاريس الصعبة.",
    location: "العمادية — المركز",
    phone: "0750 111 1003",
    email: "amedi@dohukelectricity.gov.krd",
    manager: "إدارة فرع العمادية",
    status: "active",
  },
  {
    id: "semel",
    name: "فرع سيميل",
    shortName: "سيميل",
    description:
      "يغطي قضاء سيميل والمناطق الزراعية والسكنية المحيطة، ويتابع تطوير الشبكة لمواكبة النمو العمراني.",
    location: "سيميل — المركز",
    phone: "0750 111 1004",
    email: "semel@dohukelectricity.gov.krd",
    manager: "إدارة فرع سيميل",
    status: "active",
  },
  {
    id: "sheikhan",
    name: "فرع شيخان",
    shortName: "شيخان",
    description:
      "يخدم قضاء شيخان والقرى التابعة له، ويعمل على تحسين استقرار التيار وصيانة المحوّلات والخطوط.",
    location: "شيخان — المركز",
    phone: "0750 111 1005",
    email: "sheikhan@dohukelectricity.gov.krd",
    manager: "إدارة فرع شيخان",
    status: "active",
  },
  {
    id: "akre",
    name: "فرع عقرة",
    shortName: "عقرة",
    description:
      "يغطي قضاء عقرة ومناطقه الجبلية، ويعنى بتوسعة الشبكة وإيصال الخدمة إلى المجمّعات السكنية الجديدة.",
    location: "عقرة — المركز",
    phone: "0750 111 1006",
    email: "akre@dohukelectricity.gov.krd",
    manager: "إدارة فرع عقرة",
    status: "active",
  },
];
