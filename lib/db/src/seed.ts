import { and, eq } from "drizzle-orm";
import { db, pool } from "./index.ts";
import {
  categoriesTable,
  matchesTable,
  newsPlayersTable,
  newsTable,
  playersTable,
  transfersTable,
} from "./schema/index.ts";

const images = {
  stadium:
    "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1400&q=85",
  pitch:
    "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1000&q=85",
  football:
    "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?auto=format&fit=crop&w=1000&q=85",
  crowd:
    "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=1000&q=85",
  player:
    "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=1000&q=85",
  boots:
    "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1000&q=85",
};

const categorySeeds = [
  ["barcelona", "أخبار برشلونة", "Barcelona News", 1],
  ["transfers", "الانتقالات", "Transfers", 2],
  ["matches", "المباريات", "Matches", 3],
  ["players", "اللاعبون", "Players", 4],
  ["la-liga", "الدوري الإسباني", "La Liga", 5],
  ["champions-league", "دوري أبطال أوروبا", "Champions League", 6],
] as const;

const playerSeeds = [
  ["lamine-yamal", "لامين يامال", "Lamine Yamal", "جناح أيمن", "جوهرة لا ماسيا"],
  ["pedri", "بيدري", "Pedri", "وسط ميدان", "إيقاع الفريق"],
  ["raphinha", "رافينيا", "Raphinha", "جناح أيسر", "قائد الهجوم"],
  ["pau-cubarsi", "باو كوبارسي", "Pau Cubarsí", "قلب دفاع", "هدوء من لا ماسيا"],
  [
    "robert-lewandowski",
    "روبرت ليفاندوفسكي",
    "Robert Lewandowski",
    "مهاجم",
    "خبرة في الصندوق",
  ],
] as const;

const newsSeeds = [
  {
    slug: "flick-blueprint",
    category: "barcelona",
    titleAr: "فليك يرسم ملامح برشلونة الجديد قبل ليلة مونتجويك",
    summaryAr: "جلسة تكتيكية حاسمة تضع اللمسات الأخيرة على خطة الفريق في الجولة المقبلة.",
    bodyAr:
      "في المدينة الرياضية خوان غامبر، ارتفع إيقاع التحضيرات مع اقتراب صافرة البداية. هانز فليك يريد فريقاً يهاجم المساحات بسرعة ويحافظ على شجاعته عندما يفقد الكرة.\n\nالتدريب الأخير حمل إشارات واضحة إلى اعتماد الضغط العالي، مع منح لاعبي الوسط حرية أكبر للتقدم خلف الخط الأول. الرسالة داخل غرفة الملابس واحدة: التفاصيل الصغيرة تحسم ليالي برشلونة الكبيرة.\n\nالجمهور يستعد لمدرجات ممتلئة في مونتجويك، والفريق يعرف أن هذه المواجهة فرصة جديدة لبناء الزخم قبل المواعيد الأوروبية.",
    image: images.stadium,
    publishedAt: "2026-08-31T09:22:00.000Z",
    readingMinutes: 4,
    tags: ["هانز فليك", "برشلونة"],
    isFeatured: true,
    isBreaking: true,
    players: [],
  },
  {
    slug: "yamal-contract",
    category: "players",
    titleAr: "برشلونة يقترب من اتفاق جديد مع لامين يامال",
    summaryAr: "الإدارة تواصل العمل على عقد طويل الأمد يحافظ على جوهرة لا ماسيا في الكامب نو.",
    bodyAr:
      "تتقدم المحادثات بين برشلونة وممثلي لامين يامال بصورة إيجابية، وسط رغبة مشتركة في مواصلة القصة التي بدأت في أكاديمية لا ماسيا.\n\nالنادي يرى أن الجناح الشاب أصبح جزءاً من هوية المشروع الرياضي، بينما يركز اللاعب على مواصلة التطور في بيئة تمنحه الثقة والمساحة.\n\nلا توجد عجلة لإعلان التفاصيل، لكن المؤشرات القادمة من الطرفين تمنح مشجعي برشلونة سبباً جديداً للتفاؤل.",
    image: images.player,
    publishedAt: "2026-08-31T08:45:00.000Z",
    readingMinutes: 3,
    tags: ["لامين يامال", "لا ماسيا"],
    players: ["lamine-yamal"],
  },
  {
    slug: "bernabeu-watch",
    category: "la-liga",
    titleAr: "عين برشلونة على صدارة الدوري بعد تعثر المنافس",
    summaryAr: "ثلاث نقاط جديدة تعيد سباق الليغا إلى الواجهة قبل الأمتار الأخيرة.",
    bodyAr:
      "الجدول يشتعل من جديد. الانتصار الأخير منح برشلونة فرصة ثمينة للضغط على المتصدر، لكن الجهاز الفني يكرر أن التركيز يجب أن يبقى على المباراة القادمة فقط.\n\nالفارق في القمة ضئيل، والروزنامة لا تمنح أي فريق وقتاً لالتقاط الأنفاس. إدارة الأحمال ستكون عاملاً أساسياً في الأسابيع القادمة.",
    image: images.crowd,
    publishedAt: "2026-08-31T07:30:00.000Z",
    readingMinutes: 5,
    tags: ["الليغا", "سباق الصدارة"],
    players: [],
  },
  {
    slug: "midfielder-market",
    category: "transfers",
    titleAr: "لاعب وسط شاب على رادار الإدارة الرياضية",
    summaryAr: "الكشافون يراقبون اسماً صاعداً يناسب إيقاع برشلونة واستحواذه.",
    bodyAr:
      "تستمر الإدارة الرياضية في مراقبة خيارات شابة يمكنها الانسجام مع أسلوب برشلونة. الأولوية ليست للأسماء الكبيرة، بل للاعب القادر على قراءة المساحات والتمرير تحت الضغط.\n\nمصادر قريبة من الملف تؤكد أن القائمة لا تزال مفتوحة، وأن القرار النهائي سيرتبط بالاحتياجات الفنية ومرونة الميزانية.",
    image: images.boots,
    publishedAt: "2026-08-31T06:25:00.000Z",
    readingMinutes: 4,
    tags: ["سوق الانتقالات"],
    players: ["pedri"],
  },
  {
    slug: "champions-draw",
    category: "champions-league",
    titleAr: "موعد القرعة الأوروبية يقترب وبرشلونة يترقب المسار",
    summaryAr: "الأنظار تتجه إلى القرعة مع طموح العودة إلى ليالي الأبطال التي تليق بالبلوغرانا.",
    bodyAr:
      "كل شيء جاهز لليلة أوروبية جديدة. برشلونة يدخل القرعة بطموح واضح: بناء مسار طويل، خطوة بعد أخرى، دون الالتفات إلى الضجيج المحيط بالبطولة.\n\nالمجموعة الحالية تملك مزيجاً من الخبرة والشباب، وهو ما يمنح الفريق شخصية مختلفة في المواعيد الكبرى.",
    image: images.pitch,
    publishedAt: "2026-08-30T18:10:00.000Z",
    readingMinutes: 3,
    tags: ["دوري الأبطال", "القرعة"],
    players: [],
  },
  {
    slug: "match-report-villarreal",
    category: "matches",
    titleAr: "برشلونة يحسم المواجهة بهدف متأخر ويكافئ صبره",
    summaryAr: "أداء متماسك حتى الدقائق الأخيرة يمنح الفريق انتصاراً ثميناً خارج الديار.",
    bodyAr:
      "لم تكن المباراة سهلة، لكن برشلونة حافظ على هدوئه حتى اللحظة الأخيرة. التمرير السريع نقل الفريق من الضغط إلى الثلث الأخير، وهناك ظهر الفارق.\n\nالانتصار يؤكد أن الفريق بات يعرف كيف يدير المباريات المعقدة، وهي خطوة مهمة في موسم طويل مليء بالمواعيد.",
    image: images.football,
    publishedAt: "2026-08-30T16:40:00.000Z",
    readingMinutes: 6,
    tags: ["تقرير المباراة", "برشلونة"],
    players: ["raphinha", "robert-lewandowski"],
  },
  {
    slug: "academy-wave",
    category: "players",
    titleAr: "موجة لا ماسيا مستمرة: أسماء جديدة تطرق الباب",
    summaryAr: "جيل جديد من الأكاديمية يلفت الأنظار في التدريبات المفتوحة هذا الأسبوع.",
    bodyAr:
      "تظل لا ماسيا أحد أهم مصادر الطاقة في برشلونة. خلال التدريبات الأخيرة، لفت أكثر من لاعب شاب الأنظار بجرأته في التعامل مع الكرة.\n\nالفكرة ليست في استعجال الخطوة، بل في تجهيز كل لاعب للحظة المناسبة عندما يفتح الفريق الأول بابه.",
    image: images.stadium,
    publishedAt: "2026-08-29T12:00:00.000Z",
    readingMinutes: 4,
    tags: ["لا ماسيا", "المواهب"],
    players: ["pau-cubarsi"],
  },
] as const;

const matchSeeds = [
  {
    competition: "الدوري الإسباني",
    homeTeam: "برشلونة",
    awayTeam: "أتلتيكو مدريد",
    homeShort: "ب",
    awayShort: "أ",
    kickoffAt: "2026-09-05T20:00:00.000Z",
    venue: "ملعب مونتجويك",
    status: "scheduled" as const,
  },
  {
    competition: "دوري أبطال أوروبا",
    homeTeam: "برشلونة",
    awayTeam: "إنتر ميلان",
    homeShort: "ب",
    awayShort: "إ",
    kickoffAt: "2026-09-08T20:00:00.000Z",
    venue: "ملعب مونتجويك",
    status: "scheduled" as const,
  },
  {
    competition: "الدوري الإسباني",
    homeTeam: "فياريال",
    awayTeam: "برشلونة",
    homeShort: "ف",
    awayShort: "ب",
    kickoffAt: "2026-08-29T17:30:00.000Z",
    venue: "لا سيراميكا",
    status: "finished" as const,
    homeScore: 1,
    awayScore: 2,
  },
  {
    competition: "الدوري الإسباني",
    homeTeam: "برشلونة",
    awayTeam: "أوساسونا",
    homeShort: "ب",
    awayShort: "أو",
    kickoffAt: "2026-08-25T20:00:00.000Z",
    venue: "ملعب مونتجويك",
    status: "finished" as const,
    homeScore: 3,
    awayScore: 0,
  },
  {
    competition: "دوري أبطال أوروبا",
    homeTeam: "بنفيكا",
    awayTeam: "برشلونة",
    homeShort: "ب",
    awayShort: "ب",
    kickoffAt: "2026-08-19T20:00:00.000Z",
    venue: "النور",
    status: "finished" as const,
    homeScore: 0,
    awayScore: 1,
  },
] as const;

const transferSeeds = [
  {
    player: "إينيغو مارتينيز",
    playerSlug: null,
    position: "قلب دفاع",
    fromClub: "أتلتيك بلباو",
    feeLabelAr: "انتقال حر",
    status: "completed" as const,
    confidence: 100,
    announcedAt: "2026-07-01T10:00:00.000Z",
  },
  {
    player: "داني أولمو",
    playerSlug: null,
    position: "صانع ألعاب",
    fromClub: "لايبزيغ",
    feeLabelAr: "55 مليون يورو",
    feeAmount: "55000000",
    feeCurrency: "EUR",
    status: "completed" as const,
    confidence: 100,
    announcedAt: "2026-08-09T10:00:00.000Z",
  },
  {
    player: "نيكو ويليامز",
    playerSlug: null,
    position: "جناح أيسر",
    fromClub: "أتلتيك بلباو",
    feeLabelAr: "قيد النقاش",
    status: "negotiation" as const,
    confidence: 72,
    announcedAt: "2026-08-31T08:00:00.000Z",
  },
  {
    player: "أليكس غارسيا",
    playerSlug: null,
    position: "وسط ميدان",
    fromClub: "جيرونا",
    feeLabelAr: "استفسار أولي",
    status: "negotiation" as const,
    confidence: 58,
    announcedAt: "2026-08-30T09:00:00.000Z",
  },
  {
    player: "جوشوا كيميش",
    playerSlug: null,
    position: "وسط ميدان",
    fromClub: "بايرن ميونخ",
    feeLabelAr: "اهتمام متبادل",
    status: "rumor" as const,
    confidence: 36,
    announcedAt: "2026-08-28T09:00:00.000Z",
  },
  {
    player: "رافائيل لياو",
    playerSlug: null,
    position: "جناح",
    fromClub: "ميلان",
    feeLabelAr: "لا مفاوضات رسمية",
    status: "rumor" as const,
    confidence: 22,
    announcedAt: "2026-08-26T09:00:00.000Z",
  },
] as const;

async function seed() {
  const categoryIds = new Map<string, number>();
  for (const [slug, nameAr, nameEn, sortOrder] of categorySeeds) {
    const [category] = await db
      .insert(categoriesTable)
      .values({ slug, nameAr, nameEn, sortOrder })
      .onConflictDoUpdate({
        target: categoriesTable.slug,
        set: { nameAr, nameEn, sortOrder, isActive: true },
      })
      .returning({ id: categoriesTable.id });
    categoryIds.set(slug, category.id);
  }

  const playerIds = new Map<string, number>();
  for (const [slug, nameAr, nameLatin, position, noteAr] of playerSeeds) {
    const [player] = await db
      .insert(playersTable)
      .values({ slug, nameAr, nameLatin, position, noteAr, isActive: true })
      .onConflictDoUpdate({
        target: playersTable.slug,
        set: { nameAr, nameLatin, position, noteAr, isActive: true },
      })
      .returning({ id: playersTable.id });
    playerIds.set(slug, player.id);
  }

  const matchIds = new Map<string, number>();
  for (const match of matchSeeds) {
    const existing = await db
      .select({ id: matchesTable.id })
      .from(matchesTable)
      .where(
        and(
          eq(matchesTable.homeTeam, match.homeTeam),
          eq(matchesTable.awayTeam, match.awayTeam),
          eq(matchesTable.kickoffAt, new Date(match.kickoffAt)),
        ),
      )
      .limit(1);
    let saved = existing[0];
    if (!saved) {
      [saved] = await db
        .insert(matchesTable)
        .values({
          ...match,
          kickoffAt: new Date(match.kickoffAt),
        })
        .returning({ id: matchesTable.id });
    }
    if (!saved) throw new Error(`Failed to save match: ${match.homeTeam}`);
    matchIds.set(`${match.homeTeam}-${match.awayTeam}-${match.kickoffAt}`, saved.id);
  }

  const newsIds = new Map<string, number>();
  for (const article of newsSeeds) {
    const [saved] = await db
      .insert(newsTable)
      .values({
        slug: article.slug,
        titleAr: article.titleAr,
        summaryAr: article.summaryAr,
        bodyAr: article.bodyAr,
        coverImagePath: article.image,
        imageAltAr: article.titleAr,
        categoryId: categoryIds.get(article.category)!,
        status: "published",
        isFeatured: "isFeatured" in article ? article.isFeatured : false,
        isBreaking: "isBreaking" in article ? article.isBreaking : false,
        readingMinutes: article.readingMinutes,
        tags: [...article.tags],
        publishedAt: new Date(article.publishedAt),
      })
      .onConflictDoUpdate({
        target: newsTable.slug,
        set: {
          titleAr: article.titleAr,
          summaryAr: article.summaryAr,
          bodyAr: article.bodyAr,
          coverImagePath: article.image,
          imageAltAr: article.titleAr,
          categoryId: categoryIds.get(article.category)!,
          status: "published",
          isFeatured: "isFeatured" in article ? article.isFeatured : false,
          isBreaking: "isBreaking" in article ? article.isBreaking : false,
          readingMinutes: article.readingMinutes,
          tags: [...article.tags],
          publishedAt: new Date(article.publishedAt),
        },
      })
      .returning({ id: newsTable.id });
    newsIds.set(article.slug, saved.id);
  }

  for (const article of newsSeeds) {
    const newsId = newsIds.get(article.slug)!;
    for (const playerSlug of article.players) {
      const playerId = playerIds.get(playerSlug);
      if (!playerId) continue;
      await db
        .insert(newsPlayersTable)
        .values({ newsId, playerId })
        .onConflictDoNothing();
    }
  }

  for (const transfer of transferSeeds) {
    const playerId = transfer.playerSlug
      ? playerIds.get(transfer.playerSlug) ?? null
      : null;
    const existing = await db
      .select({ id: transfersTable.id })
      .from(transfersTable)
      .where(
        and(
          eq(transfersTable.playerNameAr, transfer.player),
          eq(transfersTable.toClub, "برشلونة"),
          eq(transfersTable.status, transfer.status),
        ),
      )
      .limit(1);
    if (existing[0]) continue;
    await db.insert(transfersTable).values({
      playerId,
      playerNameAr: transfer.player,
      position: transfer.position,
      fromClub: transfer.fromClub,
      toClub: "برشلونة",
      feeAmount: "feeAmount" in transfer ? transfer.feeAmount : null,
      feeCurrency: "feeCurrency" in transfer ? transfer.feeCurrency : null,
      feeLabelAr: transfer.feeLabelAr,
      status: transfer.status,
      confidence: transfer.confidence,
      announcedAt: new Date(transfer.announcedAt),
    });
  }

  console.log(
    JSON.stringify({
      seeded: true,
      categories: categoryIds.size,
      players: playerIds.size,
      news: newsIds.size,
      matches: matchIds.size,
      transfers: transferSeeds.length,
    }),
  );
}

try {
  await seed();
} finally {
  await pool.end();
}