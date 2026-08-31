export type NewsCategory =
  | 'أخبار برشلونة'
  | 'الانتقالات'
  | 'المباريات'
  | 'اللاعبون'
  | 'الدوري الإسباني'
  | 'دوري أبطال أوروبا';

export type TransferStatus = 'مكتملة' | 'مفاوضات' | 'شائعات';
export type MatchStatus = 'upcoming' | 'previous';

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  category: NewsCategory;
  date: string;
  readTime: string;
  image: string;
  featured?: boolean;
  breaking?: boolean;
  tags: string[];
  body: string[];
}

export interface Transfer {
  id: string;
  player: string;
  initials: string;
  position: string;
  from: string;
  to: string;
  fee: string;
  status: TransferStatus;
  date: string;
  confidence: number;
}

export interface Match {
  id: string;
  competition: string;
  date: string;
  time: string;
  home: string;
  homeShort: string;
  away: string;
  awayShort: string;
  status: MatchStatus;
  score?: string;
  venue: string;
}

export interface Player {
  id: string;
  name: string;
  nameLatin: string;
  position: string;
  initials: string;
  note: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  kind: 'breaking' | 'match' | 'transfer' | 'news';
  unread: boolean;
}

const stadiumImage = 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1400&q=85';
const pitchImage = 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1000&q=85';
const footballImage = 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?auto=format&fit=crop&w=1000&q=85';
const crowdImage = 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=1000&q=85';
const playerImage = 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=1000&q=85';
const bootsImage = 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1000&q=85';

export const categories: NewsCategory[] = [
  'أخبار برشلونة',
  'الانتقالات',
  'المباريات',
  'اللاعبون',
  'الدوري الإسباني',
  'دوري أبطال أوروبا',
];

export const news: NewsArticle[] = [
  {
    id: 'flick-blueprint',
    title: 'فليك يرسم ملامح برشلونة الجديد قبل ليلة مونتجويك',
    summary: 'جلسة تكتيكية حاسمة تضع اللمسات الأخيرة على خطة الفريق في الجولة المقبلة.',
    category: 'أخبار برشلونة',
    date: 'منذ 38 دقيقة',
    readTime: '4 دقائق',
    image: stadiumImage,
    featured: true,
    breaking: true,
    tags: ['هانز فليك', 'برشلونة'],
    body: [
      'في المدينة الرياضية خوان غامبر، ارتفع إيقاع التحضيرات مع اقتراب صافرة البداية. هانز فليك يريد فريقاً يهاجم المساحات بسرعة ويحافظ على شجاعته عندما يفقد الكرة.',
      'التدريب الأخير حمل إشارات واضحة إلى اعتماد الضغط العالي، مع منح لاعبي الوسط حرية أكبر للتقدم خلف الخط الأول. الرسالة داخل غرفة الملابس واحدة: التفاصيل الصغيرة تحسم ليالي برشلونة الكبيرة.',
      'الجمهور يستعد لمدرجات ممتلئة في مونتجويك، والفريق يعرف أن هذه المواجهة فرصة جديدة لبناء الزخم قبل المواعيد الأوروبية.',
    ],
  },
  {
    id: 'yamal-contract',
    title: 'برشلونة يقترب من اتفاق جديد مع لامين يامال',
    summary: 'الإدارة تواصل العمل على عقد طويل الأمد يحافظ على جوهرة لا ماسيا في الكامب نو.',
    category: 'اللاعبون',
    date: 'منذ ساعة',
    readTime: '3 دقائق',
    image: playerImage,
    tags: ['لامين يامال', 'لا ماسيا'],
    body: [
      'تتقدم المحادثات بين برشلونة وممثلي لامين يامال بصورة إيجابية، وسط رغبة مشتركة في مواصلة القصة التي بدأت في أكاديمية لا ماسيا.',
      'النادي يرى أن الجناح الشاب أصبح جزءاً من هوية المشروع الرياضي، بينما يركز اللاعب على مواصلة التطور في بيئة تمنحه الثقة والمساحة.',
      'لا توجد عجلة لإعلان التفاصيل، لكن المؤشرات القادمة من الطرفين تمنح مشجعي برشلونة سبباً جديداً للتفاؤل.',
    ],
  },
  {
    id: 'bernabeu-watch',
    title: 'عين برشلونة على صدارة الدوري بعد تعثر المنافس',
    summary: 'ثلاث نقاط جديدة تعيد سباق الليغا إلى الواجهة قبل الأمتار الأخيرة.',
    category: 'الدوري الإسباني',
    date: 'منذ ساعتين',
    readTime: '5 دقائق',
    image: crowdImage,
    tags: ['الليغا', 'سباق الصدارة'],
    body: [
      'الجدول يشتعل من جديد. الانتصار الأخير منح برشلونة فرصة ثمينة للضغط على المتصدر، لكن الجهاز الفني يكرر أن التركيز يجب أن يبقى على المباراة القادمة فقط.',
      'الفارق في القمة ضئيل، والروزنامة لا تمنح أي فريق وقتاً لالتقاط الأنفاس. إدارة الأحمال ستكون عاملاً أساسياً في الأسابيع القادمة.',
    ],
  },
  {
    id: 'midfielder-market',
    title: 'لاعب وسط شاب على رادار الإدارة الرياضية',
    summary: 'الكشافون يراقبون اسماً صاعداً يناسب إيقاع برشلونة واستحواذه.',
    category: 'الانتقالات',
    date: 'منذ 3 ساعات',
    readTime: '4 دقائق',
    image: bootsImage,
    tags: ['سوق الانتقالات'],
    body: [
      'تستمر الإدارة الرياضية في مراقبة خيارات شابة يمكنها الانسجام مع أسلوب برشلونة. الأولوية ليست للأسماء الكبيرة، بل للاعب القادر على قراءة المساحات والتمرير تحت الضغط.',
      'مصادر قريبة من الملف تؤكد أن القائمة لا تزال مفتوحة، وأن القرار النهائي سيرتبط بالاحتياجات الفنية ومرونة الميزانية.',
    ],
  },
  {
    id: 'champions-draw',
    title: 'موعد القرعة الأوروبية يقترب وبرشلونة يترقب المسار',
    summary: 'الأنظار تتجه إلى القرعة مع طموح العودة إلى ليالي الأبطال التي تليق بالبلوغرانا.',
    category: 'دوري أبطال أوروبا',
    date: 'أمس',
    readTime: '3 دقائق',
    image: pitchImage,
    tags: ['دوري الأبطال', 'القرعة'],
    body: [
      'كل شيء جاهز لليلة أوروبية جديدة. برشلونة يدخل القرعة بطموح واضح: بناء مسار طويل، خطوة بعد أخرى، دون الالتفات إلى الضجيج المحيط بالبطولة.',
      'المجموعة الحالية تملك مزيجاً من الخبرة والشباب، وهو ما يمنح الفريق شخصية مختلفة في المواعيد الكبرى.',
    ],
  },
  {
    id: 'match-report-villarreal',
    title: 'برشلونة يحسم المواجهة بهدف متأخر ويكافئ صبره',
    summary: 'أداء متماسك حتى الدقائق الأخيرة يمنح الفريق انتصاراً ثميناً خارج الديار.',
    category: 'المباريات',
    date: 'أمس',
    readTime: '6 دقائق',
    image: footballImage,
    tags: ['تقرير المباراة', 'برشلونة'],
    body: [
      'لم تكن المباراة سهلة، لكن برشلونة حافظ على هدوئه حتى اللحظة الأخيرة. التمرير السريع نقل الفريق من الضغط إلى الثلث الأخير، وهناك ظهر الفارق.',
      'الانتصار يؤكد أن الفريق بات يعرف كيف يدير المباريات المعقدة، وهي خطوة مهمة في موسم طويل مليء بالمواعيد.',
    ],
  },
  {
    id: 'academy-wave',
    title: 'موجة لا ماسيا مستمرة: أسماء جديدة تطرق الباب',
    summary: 'جيل جديد من الأكاديمية يلفت الأنظار في التدريبات المفتوحة هذا الأسبوع.',
    category: 'اللاعبون',
    date: 'منذ يومين',
    readTime: '4 دقائق',
    image: stadiumImage,
    tags: ['لا ماسيا', 'المواهب'],
    body: [
      'تظل لا ماسيا أحد أهم مصادر الطاقة في برشلونة. خلال التدريبات الأخيرة، لفت أكثر من لاعب شاب الأنظار بجرأته في التعامل مع الكرة.',
      'الفكرة ليست في استعجال الخطوة، بل في تجهيز كل لاعب للحظة المناسبة عندما يفتح الفريق الأول بابه.',
    ],
  },
];

export const transfers: Transfer[] = [
  { id: 'transfer-1', player: 'إينيغو مارتينيز', initials: 'إم', position: 'قلب دفاع', from: 'أتلتيك بلباو', to: 'برشلونة', fee: 'انتقال حر', status: 'مكتملة', date: '01 يوليو 2024', confidence: 100 },
  { id: 'transfer-2', player: 'داني أولمو', initials: 'دأ', position: 'صانع ألعاب', from: 'لايبزيغ', to: 'برشلونة', fee: '55 مليون يورو', status: 'مكتملة', date: '09 أغسطس 2024', confidence: 100 },
  { id: 'transfer-3', player: 'نيكو ويليامز', initials: 'نو', position: 'جناح أيسر', from: 'أتلتيك بلباو', to: 'برشلونة', fee: 'قيد النقاش', status: 'مفاوضات', date: 'اليوم', confidence: 72 },
  { id: 'transfer-4', player: 'أليكس غارسيا', initials: 'أغ', position: 'وسط ميدان', from: 'جيرونا', to: 'برشلونة', fee: 'استفسار أولي', status: 'مفاوضات', date: 'منذ يوم', confidence: 58 },
  { id: 'transfer-5', player: 'جوشوا كيميش', initials: 'جك', position: 'وسط ميدان', from: 'بايرن ميونخ', to: 'برشلونة', fee: 'اهتمام متبادل', status: 'شائعات', date: 'منذ 3 أيام', confidence: 36 },
  { id: 'transfer-6', player: 'رافائيل لياو', initials: 'رل', position: 'جناح', from: 'ميلان', to: 'برشلونة', fee: 'لا مفاوضات رسمية', status: 'شائعات', date: 'منذ 5 أيام', confidence: 22 },
];

export const matches: Match[] = [
  { id: 'match-1', competition: 'الدوري الإسباني', date: 'السبت، 22 مارس', time: '22:00', home: 'برشلونة', homeShort: 'ب', away: 'أتلتيكو مدريد', awayShort: 'أ', status: 'upcoming', venue: 'ملعب مونتجويك' },
  { id: 'match-2', competition: 'دوري أبطال أوروبا', date: 'الثلاثاء، 25 مارس', time: '22:00', home: 'برشلونة', homeShort: 'ب', away: 'إنتر ميلان', awayShort: 'إ', status: 'upcoming', venue: 'ملعب مونتجويك' },
  { id: 'match-3', competition: 'الدوري الإسباني', date: 'الأحد، 16 مارس', time: '18:30', home: 'فياريال', homeShort: 'ف', away: 'برشلونة', awayShort: 'ب', status: 'previous', score: '1 — 2', venue: 'لا سيراميكا' },
  { id: 'match-4', competition: 'الدوري الإسباني', date: 'الأربعاء، 12 مارس', time: '22:00', home: 'برشلونة', homeShort: 'ب', away: 'أوساسونا', awayShort: 'أو', status: 'previous', score: '3 — 0', venue: 'ملعب مونتجويك' },
  { id: 'match-5', competition: 'دوري أبطال أوروبا', date: 'الأربعاء، 05 مارس', time: '22:00', home: 'بنفيكا', homeShort: 'ب', away: 'برشلونة', awayShort: 'ب', status: 'previous', score: '0 — 1', venue: 'النور' },
];

export const players: Player[] = [
  { id: 'player-1', name: 'لامين يامال', nameLatin: 'Lamine Yamal', position: 'جناح أيمن', initials: 'لي', note: 'جوهرة لا ماسيا' },
  { id: 'player-2', name: 'بيدري', nameLatin: 'Pedri', position: 'وسط ميدان', initials: 'ب', note: 'إيقاع الفريق' },
  { id: 'player-3', name: 'رافينيا', nameLatin: 'Raphinha', position: 'جناح أيسر', initials: 'ر', note: 'قائد الهجوم' },
  { id: 'player-4', name: 'باو كوبارسي', nameLatin: 'Pau Cubarsí', position: 'قلب دفاع', initials: 'بك', note: 'هدوء من لا ماسيا' },
  { id: 'player-5', name: 'روبرت ليفاندوفسكي', nameLatin: 'Robert Lewandowski', position: 'مهاجم', initials: 'رل', note: 'خبرة في الصندوق' },
];

export const initialNotifications: NotificationItem[] = [
  { id: 'notice-1', title: 'خبر عاجل من برشلونة', description: 'فليك يعلن جاهزية الفريق للمواجهة القادمة.', time: 'منذ 8 دقائق', kind: 'breaking', unread: true },
  { id: 'notice-2', title: 'موعد المباراة يقترب', description: 'برشلونة × أتلتيكو مدريد — السبت عند 22:00.', time: 'منذ ساعة', kind: 'match', unread: true },
  { id: 'notice-3', title: 'تحديث في سوق الانتقالات', description: 'مفاوضات جديدة حول جناح أتلتيك بلباو.', time: 'منذ 3 ساعات', kind: 'transfer', unread: false },
  { id: 'notice-4', title: 'قصة تستحق القراءة', description: 'موجة لا ماسيا الجديدة تطرق باب الفريق الأول.', time: 'أمس', kind: 'news', unread: false },
];

export const getNewsById = (id: string) => news.find((article) => article.id === id);