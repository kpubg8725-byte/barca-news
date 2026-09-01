import { and, asc, desc, eq, ilike, lt, or, sql } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  GetNewsParams,
  GetNewsResponse,
  ListCategoriesResponse,
  ListMatchesQueryParams,
  ListMatchesResponse,
  ListNewsQueryParams,
  ListNewsResponse,
  ListPlayersQueryParams,
  ListPlayersResponse,
  ListTransfersQueryParams,
  ListTransfersResponse,
} from "@workspace/api-zod";
import { db } from "@workspace/db";
import {
  categoriesTable,
  matchesTable,
  newsTable,
  playersTable,
  transfersTable,
} from "@workspace/db/schema";

const router: IRouter = Router();

export function serializeDate(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

export function serializeNews(row: {
  news: typeof newsTable.$inferSelect;
  categoryNameAr: string;
}) {
  return {
    id: row.news.id,
    slug: row.news.slug,
    titleAr: row.news.titleAr,
    summaryAr: row.news.summaryAr,
    bodyAr: row.news.bodyAr,
    coverImagePath: row.news.coverImagePath,
    imageAltAr: row.news.imageAltAr,
    categoryId: row.news.categoryId,
    categoryNameAr: row.categoryNameAr,
    authorId: row.news.authorId,
    relatedMatchId: row.news.relatedMatchId,
    status: row.news.status,
    isFeatured: row.news.isFeatured,
    isBreaking: row.news.isBreaking,
    readingMinutes: row.news.readingMinutes,
    tags: row.news.tags,
    publishedAt: serializeDate(row.news.publishedAt),
    createdAt: row.news.createdAt.toISOString(),
    updatedAt: row.news.updatedAt.toISOString(),
  };
}

router.get("/news", async (req, res) => {
  const parsed = ListNewsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: "معاملات الأخبار غير صالحة" });
  }

  const { search, category, featured, breaking, page, pageSize } = parsed.data;
  const conditions = [eq(newsTable.status, "published")];

  if (search) {
    conditions.push(
      or(
        ilike(newsTable.titleAr, `%${search}%`),
        ilike(newsTable.summaryAr, `%${search}%`),
        ilike(newsTable.bodyAr, `%${search}%`),
      )!,
    );
  }
  if (category) conditions.push(eq(categoriesTable.slug, category));
  if (featured !== undefined) conditions.push(eq(newsTable.isFeatured, featured));
  if (breaking !== undefined) conditions.push(eq(newsTable.isBreaking, breaking));

  const where = and(...conditions);
  const [rows, totalRows] = await Promise.all([
    db
      .select({
        news: newsTable,
        categoryNameAr: categoriesTable.nameAr,
      })
      .from(newsTable)
      .innerJoin(categoriesTable, eq(newsTable.categoryId, categoriesTable.id))
      .where(where)
      .orderBy(desc(newsTable.publishedAt), desc(newsTable.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db
      .select({ total: sql<number>`count(*)` })
      .from(newsTable)
      .innerJoin(categoriesTable, eq(newsTable.categoryId, categoriesTable.id))
      .where(where),
  ]);

  const response = ListNewsResponse.parse({
    items: rows.map(serializeNews),
    page,
    pageSize,
    total: Number(totalRows[0]?.total ?? 0),
  });
  return res.json(response);
});

router.get("/news/:slug", async (req, res) => {
  const parsed = GetNewsParams.safeParse(req.params);
  if (!parsed.success) {
    return res.status(400).json({ error: "معرّف الخبر غير صالح" });
  }

  const [row] = await db
    .select({
      news: newsTable,
      categoryNameAr: categoriesTable.nameAr,
    })
    .from(newsTable)
    .innerJoin(categoriesTable, eq(newsTable.categoryId, categoriesTable.id))
    .where(
      and(eq(newsTable.slug, parsed.data.slug), eq(newsTable.status, "published")),
    )
    .limit(1);

  if (!row) return res.status(404).json({ error: "الخبر غير موجود" });
  return res.json(GetNewsResponse.parse(serializeNews(row)));
});

router.get("/categories", async (_req, res) => {
  const rows = await db
    .select({
      id: categoriesTable.id,
      slug: categoriesTable.slug,
      nameAr: categoriesTable.nameAr,
      nameEn: categoriesTable.nameEn,
      sortOrder: categoriesTable.sortOrder,
      isActive: categoriesTable.isActive,
    })
    .from(categoriesTable)
    .where(eq(categoriesTable.isActive, true))
    .orderBy(asc(categoriesTable.sortOrder), asc(categoriesTable.nameAr));

  return res.json(ListCategoriesResponse.parse(rows));
});

router.get("/players", async (req, res) => {
  const parsed = ListPlayersQueryParams.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: "معاملات اللاعبين غير صالحة" });
  }

  const { search, pageSize } = parsed.data;
  const conditions = [eq(playersTable.isActive, true)];
  if (search) {
    conditions.push(
      or(
        ilike(playersTable.nameAr, `%${search}%`),
        ilike(playersTable.nameLatin, `%${search}%`),
      )!,
    );
  }

  const rows = await db
    .select({
      id: playersTable.id,
      slug: playersTable.slug,
      nameAr: playersTable.nameAr,
      nameLatin: playersTable.nameLatin,
      position: playersTable.position,
      avatarUrl: playersTable.avatarUrl,
      noteAr: playersTable.noteAr,
      isActive: playersTable.isActive,
    })
    .from(playersTable)
    .where(and(...conditions))
    .orderBy(asc(playersTable.nameAr))
    .limit(pageSize);

  return res.json(ListPlayersResponse.parse(rows));
});

router.get("/matches", async (req, res) => {
  const parsed = ListMatchesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: "نطاق المباريات غير صالح" });
  }

  const now = new Date();
  const isPrevious = parsed.data.scope === "previous";
  const rows = await db
    .select({
      id: matchesTable.id,
      competition: matchesTable.competition,
      homeTeam: matchesTable.homeTeam,
      awayTeam: matchesTable.awayTeam,
      homeShort: matchesTable.homeShort,
      awayShort: matchesTable.awayShort,
      kickoffAt: matchesTable.kickoffAt,
      venue: matchesTable.venue,
      status: matchesTable.status,
      homeScore: matchesTable.homeScore,
      awayScore: matchesTable.awayScore,
    })
    .from(matchesTable)
    .where(
      isPrevious
        ? lt(matchesTable.kickoffAt, now)
        : sql`${matchesTable.kickoffAt} >= ${now}`,
    )
    .orderBy(
      isPrevious ? desc(matchesTable.kickoffAt) : asc(matchesTable.kickoffAt),
    );

  return res.json(
    ListMatchesResponse.parse(
      rows.map((row) => ({
        ...row,
        kickoffAt: row.kickoffAt.toISOString(),
      })),
    ),
  );
});

router.get("/transfers", async (req, res) => {
  const parsed = ListTransfersQueryParams.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: "حالة الانتقال غير صالحة" });
  }

  const where = parsed.data.status
    ? eq(transfersTable.status, parsed.data.status)
    : undefined;
  const rows = await db
    .select({
      id: transfersTable.id,
      playerId: transfersTable.playerId,
      playerNameAr: transfersTable.playerNameAr,
      position: transfersTable.position,
      fromClub: transfersTable.fromClub,
      toClub: transfersTable.toClub,
      feeAmount: transfersTable.feeAmount,
      feeCurrency: transfersTable.feeCurrency,
      feeLabelAr: transfersTable.feeLabelAr,
      status: transfersTable.status,
      confidence: transfersTable.confidence,
      notesAr: transfersTable.notesAr,
      announcedAt: transfersTable.announcedAt,
    })
    .from(transfersTable)
    .where(where)
    .orderBy(desc(transfersTable.announcedAt), desc(transfersTable.createdAt));

  return res.json(
    ListTransfersResponse.parse(
      rows.map((row) => ({
        ...row,
        feeAmount: row.feeAmount === null ? null : Number(row.feeAmount),
        announcedAt: serializeDate(row.announcedAt),
      })),
    ),
  );
});

export default router;